<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreOrderRequest;
use App\Http\Requests\UpdateOrderStatusRequest;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Services\OrderService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class OrderController extends Controller
{
    public function __construct(private readonly OrderService $orderService)
    {
    }

    /**
     * Convert user's cart to an order.
     */
    public function checkout(StoreOrderRequest $request): OrderResource
    {
        $order = $this->orderService->checkout($request->user(), $request->validated());

        return new OrderResource($order);
    }

    /**
     * List user's past orders.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $orders = $this->orderService->getUserOrders($request->user(), $request->integer('per_page', 10));

        return OrderResource::collection($orders);
    }

    /**
     * Show details for a specific order.
     */
    public function show(Order $order): OrderResource
    {
        $this->authorize('view', $order);

        $order->load('items');

        return new OrderResource($order);
    }

    /**
     * Track an order publicly without authentication.
     */
    public function track(Request $request, string $orderNumber): OrderResource
    {
        $request->validate(['email' => ['required', 'email']]);

        $order = $this->orderService->trackOrder($orderNumber, $request->input('email'));

        return new OrderResource($order);
    }

    /**
     * Admin: List all orders.
     */
    public function adminIndex(Request $request): AnonymousResourceCollection
    {
        $orders = $this->orderService->getAllOrders(
            $request->all(),
            $request->integer('per_page', 20)
        );

        return OrderResource::collection($orders);
    }

    /**
     * Admin: Show any order details.
     */
    public function adminShow(Order $order): OrderResource
    {
        $order->load('items');
        return new OrderResource($order);
    }

    /**
     * Admin: Update order status.
     */
    public function updateStatus(UpdateOrderStatusRequest $request, Order $order): OrderResource
    {
        $updatedOrder = $this->orderService->updateOrderStatus(
            $order,
            $request->input('status'),
            $request->input('tracking_number')
        );

        return new OrderResource($updatedOrder);
    }
}
