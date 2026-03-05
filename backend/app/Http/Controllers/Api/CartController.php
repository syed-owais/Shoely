<?php

namespace App\Http\Controllers\Api;

use App\Classes\RestAPI;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCartItemRequest;
use App\Http\Requests\UpdateCartItemRequest;
use App\Http\Requests\SyncCartRequest;
use App\Http\Resources\CartResource;
use App\Http\Resources\CartItemResource;
use App\Models\CartItem;
use App\Services\CartService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CartController extends Controller
{
    /**
     * Get the authenticated user's cart.
     */
    public function index(Request $request): JsonResponse
    {
        $cart = CartService::getCartForUser($request->user());

        return RestAPI::response(new CartResource($cart));
    }

    /**
     * Add an item to the cart.
     */
    public function storeItem(StoreCartItemRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $cartItem = CartService::init($request->user())
            ->fetchCart()
            ->fetchProduct($validated['product_id'], $validated['size'])
            ->fetchCartItem()
            ->setQuantity($validated['quantity'])
            ->validation()
            ->addOrUpdateItem()
            ->build();

        return RestAPI::response(new CartItemResource($cartItem), true, 'Item added to cart');
    }

    /**
     * Update a cart item's quantity.
     */
    public function updateItem(UpdateCartItemRequest $request, CartItem $cartItem): JsonResponse
    {
        CartService::updateItemQuantity($cartItem, $request->input('quantity'));

        return RestAPI::messageResponse('Cart item updated successfully');
    }

    /**
     * Remove an item from the cart.
     */
    public function destroyItem(Request $request, CartItem $cartItem): JsonResponse
    {
        abort_if($cartItem->cart->user_id !== $request->user()->id, 403, 'Unauthorized access to cart item');

        CartService::removeItem($cartItem);

        return RestAPI::messageResponse('Item removed from cart');
    }

    /**
     * Sync local (unauthenticated) cart items to the database cart.
     */
    public function sync(SyncCartRequest $request): JsonResponse
    {
        $cart = CartService::syncLocalCart($request->user(), $request->input('items'));

        return RestAPI::response(new CartResource($cart), true, 'Cart synced successfully');
    }
}
