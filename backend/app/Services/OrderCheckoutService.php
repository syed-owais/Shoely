<?php

namespace App\Services;

use App\Events\OrderPlacedEvent;
use App\Models\Cart;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductSize;
use App\Models\PromoCode;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class OrderCheckoutService
{
    // ── Internal state ─────────────────────────────────────────
    private ?User $user = null;
    private array $data = [];
    private ?Cart $cart = null;
    private Collection $items;
    private Collection $products;

    private float $subtotal = 0;
    private float $discount = 0;
    private float $shipping = 0;
    private float $tax = 0;
    private float $total = 0;
    private ?string $appliedPromoCode = null;

    private ?Order $order = null;

    // ── Static initializer ─────────────────────────────────────
    public static function init(Request $request, ?User $user = null): static
    {
        $service = new static();
        $service->user = $user;
        $service->data = $request->validated();
        $service->items = collect();
        $service->products = collect();

        return $service;
    }

    // ── Fetch methods ──────────────────────────────────────────

    /**
     * Load the user's cart or build guest cart items from request data.
     */
    public function fetchCart(): static
    {
        if ($this->user) {
            $this->cart = $this->user->cart()->with('items.product')->first();

            if (!$this->cart || $this->cart->items->isEmpty()) {
                abort(400, 'Cart is empty. Cannot proceed to checkout.');
            }

            $this->items = $this->cart->items;
        } else {
            if (empty($this->data['items'])) {
                abort(400, 'Cart items are required for guest checkout.');
            }

            $this->items = collect($this->data['items'])->map(fn($item) => (object) [
                'product_id' => $item['product_id'],
                'size' => $item['size'],
                'quantity' => $item['quantity'],
                'product' => null, // hydrated in fetchProducts()
            ]);
        }

        return $this;
    }

    /**
     * Eager-load product models for all cart items.
     */
    public function fetchProducts(): static
    {
        $productIds = $this->items->pluck('product_id')->unique();
        $this->products = Product::whereIn('id', $productIds)->get()->keyBy('id');

        // Hydrate guest items with their product model
        $this->items = $this->items->map(function ($item) {
            if (!$item->product) {
                $product = $this->products->get($item->product_id);
                abort_if(!$product, 404, 'Product not found.');
                $item->product = $product;
            }

            return $item;
        });

        return $this;
    }

    // ── Validation ─────────────────────────────────────────────

    /**
     * Check stock availability and validate promo code.
     */
    public function validation(): static
    {
        // Stock checks with row-level locking
        foreach ($this->items as $item) {
            $productSize = ProductSize::where('product_id', $item->product_id)
                ->where('size', $item->size)
                ->lockForUpdate()
                ->firstOrFail();

            if ($productSize->quantity < $item->quantity) {
                abort(422, "Insufficient stock for product '{$item->product->name}' (Size: {$item->size})");
            }
        }

        // Promo code validation
        if (!empty($this->data['promo_code'])) {
            $promoCode = PromoCode::where('code', $this->data['promo_code'])->active()->first();

            if (!$promoCode) {
                abort(422, 'Invalid or expired promo code.');
            }

            $result = $promoCode->calculateDiscount($this->subtotal ?: $this->rawSubtotal());

            if (!$result['valid']) {
                abort(422, $result['message'] ?? 'Invalid promo code.');
            }

            $this->discount = $result['discount'];
            $this->appliedPromoCode = $promoCode->code;

            $promoCode->increment('usage_count');
        }

        return $this;
    }

    // ── Calculate ──────────────────────────────────────────────

    /**
     * Compute subtotal, shipping, tax, discount, and grand total.
     */
    public function calculateTotals(): static
    {
        $this->subtotal = $this->items->sum(fn($item) => $item->product->price * $item->quantity);

        $this->shipping = $this->subtotal > 5000 ? 0 : 250;
        $this->tax = ($this->subtotal - $this->discount) * 0.05;
        $this->total = $this->subtotal - $this->discount + $this->shipping + $this->tax;

        return $this;
    }

    // ── Transaction helpers ────────────────────────────────────

    public function beginTransaction(): static
    {
        DB::beginTransaction();

        return $this;
    }

    public function commitTransaction(): static
    {
        DB::commit();

        return $this;
    }

    // ── Create / Persist ───────────────────────────────────────

    /**
     * Persist the Order and its OrderItems.
     */
    public function createOrder(): static
    {
        $this->order = Order::create([
            'user_id' => $this->user?->id,
            'order_number' => Order::generateOrderNumber(),
            'email' => $this->data['email'],
            'first_name' => $this->data['first_name'],
            'last_name' => $this->data['last_name'],
            'phone' => $this->data['phone'] ?? null,
            'street' => $this->data['address'],
            'city' => $this->data['city'],
            'state' => $this->data['state'] ?? 'N/A',
            'zip_code' => $this->data['zip_code'],
            'country' => $this->data['country'] ?? 'PK',
            'subtotal' => $this->subtotal,
            'shipping' => $this->shipping,
            'tax' => $this->tax,
            'discount' => $this->discount,
            'total' => $this->total,
            'status' => 'confirmed',
            'promo_code' => $this->appliedPromoCode,
        ]);

        foreach ($this->items as $item) {
            $this->order->items()->create([
                'product_id' => $item->product_id,
                'name' => $item->product->name,
                'brand' => $item->product->brand,
                'price' => $item->product->price,
                'quantity' => $item->quantity,
                'size' => $item->size,
                'image' => (is_array($item->product->images) && count($item->product->images) > 0)
                    ? $item->product->images[0]
                    : null,
            ]);
        }

        return $this;
    }

    /**
     * Decrement stock for each ordered size.
     */
    public function deductStock(): static
    {
        foreach ($this->items as $item) {
            ProductSize::where('product_id', $item->product_id)
                ->where('size', $item->size)
                ->decrement('quantity', $item->quantity);
        }

        return $this;
    }

    /**
     * Clear user's cart after successful order creation.
     */
    public function clearCart(): static
    {
        if ($this->cart) {
            $this->cart->items()->delete();
        }

        return $this;
    }

    // ── Events ─────────────────────────────────────────────────

    /**
     * Fire domain events (listeners will handle email via queue).
     */
    public function dispatchEvents(): static
    {
        event(new OrderPlacedEvent($this->order));

        return $this;
    }

    // ── Build ──────────────────────────────────────────────────

    /**
     * Finalize and return the created Order.
     */
    public function build(): Order
    {
        return $this->order;
    }

    // ── Private helpers ────────────────────────────────────────

    /**
     * Quick subtotal calculation for promo validation before calculateTotals() is called.
     */
    private function rawSubtotal(): float
    {
        return $this->items->sum(fn($item) => $item->product->price * $item->quantity);
    }
}
