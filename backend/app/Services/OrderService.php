<?php

namespace App\Services;

use App\Models\Cart;
use App\Models\Order;
use App\Models\PromoCode;
use App\Models\ProductSize;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Pagination\LengthAwarePaginator;

class OrderService
{
    /**
     * Complete checkout and generate an order from the user's cart.
     */
    public function checkout(User $user, array $data): Order
    {
        $cart = $user->cart()->with('items.product')->first();

        if (!$cart || $cart->items->isEmpty()) {
            abort(400, 'Cart is empty. Cannot proceed to checkout.');
        }

        return DB::transaction(function () use ($user, $data, $cart) {
            $subtotal = 0;

            // Pre-calculate subtotal and check stock (Double-check before commit)
            foreach ($cart->items as $item) {
                $subtotal += $item->product->price * $item->quantity;

                $productSize = ProductSize::where('product_id', $item->product_id)
                    ->where('size', $item->size)
                    ->lockForUpdate() // Prevent concurrent stock modifications
                    ->firstOrFail();

                if ($productSize->quantity < $item->quantity) {
                    abort(422, "Insufficient stock for product '{$item->product->name}' (Size: {$item->size})");
                }
            }

            $discount = 0;
            $appliedPromoCode = null;

            if (!empty($data['promo_code'])) {
                $promoCode = PromoCode::where('code', $data['promo_code'])->active()->first();

                if (!$promoCode) {
                    abort(422, 'Invalid or expired promo code.');
                }

                $promoValidation = $promoCode->calculateDiscount($subtotal);
                if (!$promoValidation['valid']) {
                    abort(422, $promoValidation['message'] ?? 'Invalid promo code.');
                }

                $discount = $promoValidation['discount'];
                $appliedPromoCode = $promoCode->code;

                $promoCode->increment('usage_count');
            }

            // Simple fixed shipping and tax logic as per design
            $shippingFee = $subtotal > 150 ? 0 : 15;
            $tax = ($subtotal - $discount) * 0.05; // 5% tax roughly

            $totalAmount = $subtotal - $discount + $shippingFee + $tax;

            // Create Order
            $order = Order::create([
                'user_id' => $user->id,
                'order_number' => Order::generateOrderNumber(),
                'email' => $data['email'],
                'first_name' => $data['first_name'],
                'last_name' => $data['last_name'],
                'phone' => $data['phone'] ?? null,
                'street' => $data['address'],
                'city' => $data['city'],
                'state' => $data['state'] ?? 'N/A',
                'zip_code' => $data['zip_code'],
                'country' => $data['country'] ?? 'USA',
                'subtotal' => $subtotal,
                'shipping' => $shippingFee,
                'tax' => $tax,
                'discount' => $discount,
                'total' => $totalAmount,
                'status' => 'pending',
                'promo_code' => $appliedPromoCode,
            ]);

            // Move Cart Items to Order Items & Deduct Stock
            foreach ($cart->items as $item) {
                // Deduct stock
                ProductSize::where('product_id', $item->product_id)
                    ->where('size', $item->size)
                    ->decrement('quantity', $item->quantity);

                // Create Order Item (Snapshot pricing & details)
                $order->items()->create([
                    'product_id' => $item->product_id,
                    'name' => $item->product->name,
                    'brand' => $item->product->brand,
                    'price' => $item->product->price,
                    'quantity' => $item->quantity,
                    'size' => $item->size,
                    'image' => $item->product->images[0] ?? null,
                ]);
            }

            // Clear Cart
            $cart->items()->delete();

            return $order->load('items');
        });
    }

    /**
     * Get consumer's orders.
     */
    public function getUserOrders(User $user, int $perPage = 10): LengthAwarePaginator
    {
        return $user->orders()->with('items')->latest()->paginate($perPage);
    }

    /**
     * Track order by number.
     */
    public function trackOrder(string $orderNumber, string $email): Order
    {
        $order = Order::where('order_number', $orderNumber)
            ->where('email', $email)
            ->with('items')
            ->first();

        if (!$order) {
            abort(404, 'Order not found or email does not match.');
        }

        return $order;
    }

    /**
     * Admin: Get all orders.
     */
    public function getAllOrders(array $filters = [], int $perPage = 20): LengthAwarePaginator
    {
        $query = Order::with(['user', 'items'])->latest();

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('order_number', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%");
            });
        }

        return $query->paginate($perPage);
    }

    /**
     * Admin: Update order status.
     */
    public function updateOrderStatus(Order $order, string $status, ?string $trackingNumber = null): Order
    {
        $data = ['status' => $status];

        if ($trackingNumber) {
            $data['tracking_number'] = $trackingNumber;
        }

        $order->update($data);

        return $order->load('items');
    }
}
