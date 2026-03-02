<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCartItemRequest;
use App\Http\Requests\UpdateCartItemRequest;
use App\Http\Requests\SyncCartRequest;
use App\Http\Resources\CartResource;
use App\Http\Resources\CartItemResource;
use App\Models\CartItem;
use App\Services\CartService;
use Illuminate\Http\Request;

class CartController extends Controller
{
    public function __construct(private readonly CartService $cartService)
    {
    }

    /**
     * Get the authenticated user's cart.
     */
    public function index(Request $request): CartResource
    {
        $cart = $this->cartService->getCartForUser($request->user());

        return new CartResource($cart);
    }

    /**
     * Add an item to the cart.
     */
    public function storeItem(StoreCartItemRequest $request): CartItemResource
    {
        $validated = $request->validated();

        $cartItem = $this->cartService->addItem(
            $request->user(),
            $validated['product_id'],
            $validated['size'],
            $validated['quantity']
        );

        return new CartItemResource($cartItem);
    }

    /**
     * Update a cart item's quantity.
     */
    public function updateItem(UpdateCartItemRequest $request, CartItem $cartItem)
    {
        $this->cartService->updateItemQuantity($cartItem, $request->input('quantity'));

        return response()->noContent();
    }

    /**
     * Remove an item from the cart.
     */
    public function destroyItem(Request $request, CartItem $cartItem)
    {
        abort_if($cartItem->cart->user_id !== $request->user()->id, 403, 'Unauthorized access to cart item');

        $this->cartService->removeItem($cartItem);

        return response()->noContent();
    }

    /**
     * Sync local (unauthenticated) cart items to the database cart.
     */
    public function sync(SyncCartRequest $request): CartResource
    {
        $cart = $this->cartService->syncLocalCart($request->user(), $request->input('items'));

        return new CartResource($cart);
    }
}
