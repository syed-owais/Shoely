<?php

namespace App\Services;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use App\Models\ProductSize;
use App\Models\User;

class CartService
{
    /**
     * Get the cart for the given user, creating one if it doesn't exist.
     */
    public function getCartForUser(User $user): Cart
    {
        return Cart::firstOrCreate(
            ['user_id' => $user->id]
        )->load('items.product');
    }

    /**
     * Add an item to the user's cart.
     */
    public function addItem(User $user, int $productId, float $size, int $quantity = 1): CartItem
    {
        $cart = $this->getCartForUser($user);

        // Verify product and size exist
        $product = Product::findOrFail($productId);
        $productSize = ProductSize::where('product_id', $productId)
            ->where('size', $size)
            ->firstOrFail();

        // Check stock
        if ($productSize->quantity < $quantity) {
            abort(422, 'Not enough stock available for this size.');
        }

        $cartItem = $cart->items()->where('product_id', $productId)
            ->where('size', $size)
            ->first();

        if ($cartItem) {
            // Check if updated quantity exceeds stock
            if ($productSize->quantity < ($cartItem->quantity + $quantity)) {
                abort(422, 'Not enough stock available for this size.');
            }
            $cartItem->increment('quantity', $quantity);
        } else {
            $cartItem = $cart->items()->create([
                'product_id' => $productId,
                'size' => $size,
                'quantity' => $quantity,
            ]);
        }

        return $cartItem->load('product');
    }

    /**
     * Update the quantity of a specific cart item.
     */
    public function updateItemQuantity(CartItem $cartItem, int $quantity): CartItem
    {
        if ($quantity <= 0) {
            $cartItem->delete();
            return $cartItem;
        }

        // Verify stock
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
    public function removeItem(CartItem $cartItem): void
    {
        $cartItem->delete();
    }

    /**
     * Sync local cart items to the database cart upon login.
     * Takes an array of associative arrays: ['product_id' => x, 'size' => y, 'quantity' => z]
     */
    public function syncLocalCart(User $user, array $localItems): Cart
    {
        foreach ($localItems as $item) {
            try {
                $this->addItem($user, $item['product_id'], (float) $item['size'], (int) $item['quantity']);
            } catch (\Exception $e) {
                // If an item fails to add (e.g. out of stock), just skip it during sync instead of throwing
                \Illuminate\Support\Facades\Log::warning('Cart sync skip: ' . $e->getMessage());
            }
        }

        return $this->getCartForUser($user);
    }
}
