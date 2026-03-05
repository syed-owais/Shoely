<?php

namespace App\Services;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use App\Models\ProductSize;
use App\Models\User;
use Illuminate\Support\Facades\Log;

class CartService
{
    // ── Internal state ─────────────────────────────────────────
    private User $user;
    private Cart $cart;
    private ?Product $product = null;
    private ?ProductSize $productSize = null;
    private ?CartItem $cartItem = null;

    private int $productId = 0;
    private float $size = 0;
    private int $quantity = 1;

    // ── Static initializer ─────────────────────────────────────

    /**
     * Bootstrap the service with a user context.
     */
    public static function init(User $user): static
    {
        $service = new static();
        $service->user = $user;

        return $service;
    }

    // ── Fetch methods ──────────────────────────────────────────

    /**
     * Load or create the user's cart.
     */
    public function fetchCart(): static
    {
        $this->cart = Cart::firstOrCreate(
            ['user_id' => $this->user->id]
        );

        return $this;
    }

    /**
     * Fetch the product and its size variant.
     */
    public function fetchProduct(int $productId, float $size): static
    {
        $this->productId = $productId;
        $this->size = $size;

        $this->product = Product::findOrFail($productId);
        $this->productSize = ProductSize::where('product_id', $productId)
            ->where('size', $size)
            ->firstOrFail();

        return $this;
    }

    /**
     * Fetch an existing cart item for the product+size combo.
     */
    public function fetchCartItem(): static
    {
        $this->cartItem = $this->cart->items()
            ->where('product_id', $this->productId)
            ->where('size', $this->size)
            ->first();

        return $this;
    }

    // ── Set methods ────────────────────────────────────────────

    /**
     * Set the desired quantity to add.
     */
    public function setQuantity(int $quantity): static
    {
        $this->quantity = $quantity;

        return $this;
    }

    // ── Validation ─────────────────────────────────────────────

    /**
     * Validate stock availability for the requested quantity.
     */
    public function validation(): static
    {
        $totalQuantity = $this->quantity;

        if ($this->cartItem) {
            $totalQuantity += $this->cartItem->quantity;
        }

        if ($this->productSize->quantity < $totalQuantity) {
            abort(422, 'Not enough stock available for this size.');
        }

        return $this;
    }

    // ── Create / Update ────────────────────────────────────────

    /**
     * Add item to cart or increment quantity if it already exists.
     */
    public function addOrUpdateItem(): static
    {
        if ($this->cartItem) {
            $this->cartItem->increment('quantity', $this->quantity);
        } else {
            $this->cartItem = $this->cart->items()->create([
                'product_id' => $this->productId,
                'size' => $this->size,
                'quantity' => $this->quantity,
            ]);
        }

        return $this;
    }

    // ── Build ──────────────────────────────────────────────────

    /**
     * Return the cart item with its product loaded.
     */
    public function build(): CartItem
    {
        return $this->cartItem->load('product');
    }

    /**
     * Return the full cart with items loaded.
     */
    public function buildCart(): Cart
    {
        return $this->cart->load('items.product');
    }

    // ══════════════════════════════════════════════════════════════
    //  Simple operations (no builder needed)
    // ══════════════════════════════════════════════════════════════

    /**
     * Get the cart for the given user (read-only).
     */
    public static function getCartForUser(User $user): Cart
    {
        return Cart::firstOrCreate(
            ['user_id' => $user->id]
        )->load('items.product');
    }

    /**
     * Update a cart item's quantity.
     */
    public static function updateItemQuantity(CartItem $cartItem, int $quantity): CartItem
    {
        if ($quantity <= 0) {
            $cartItem->delete();
            return $cartItem;
        }

        $productSize = ProductSize::where('product_id', $cartItem->product_id)
            ->where('size', $cartItem->size)
            ->firstOrFail();

        if ($productSize->quantity < $quantity) {
            abort(422, 'Not enough stock available for this size.');
        }

        $cartItem->update(['quantity' => $quantity]);

        return $cartItem;
    }

    /**
     * Remove an item from the cart.
     */
    public static function removeItem(CartItem $cartItem): void
    {
        $cartItem->delete();
    }

    /**
     * Sync local cart items to the database cart upon login.
     */
    public static function syncLocalCart(User $user, array $localItems): Cart
    {
        foreach ($localItems as $item) {
            try {
                static::init($user)
                    ->fetchCart()
                    ->fetchProduct($item['product_id'], (float) $item['size'])
                    ->fetchCartItem()
                    ->setQuantity((int) $item['quantity'])
                    ->validation()
                    ->addOrUpdateItem();
            } catch (\Exception $e) {
                Log::warning('Cart sync skip: ' . $e->getMessage());
            }
        }

        return static::getCartForUser($user);
    }
}
