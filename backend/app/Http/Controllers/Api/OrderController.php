<?php

namespace App\Http\Controllers\Api;

use App\Classes\RestAPI;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreOrderRequest;
use App\Http\Requests\UpdateOrderStatusRequest;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Services\OrderCheckoutService;
use App\Services\OrderQueryService;
use App\Services\OrderStatusService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function __construct(
        private readonly OrderQueryService $orderQueryService
    ) {
    }

    /**
     * Convert user's cart to an order.
     */
    public function checkout(StoreOrderRequest $request): JsonResponse
    {
        $order = OrderCheckoutService::init($request, $request->user())
            ->fetchCart()
            ->fetchProducts()
            ->calculateTotals()
            ->beginTransaction()
            ->validation()
            ->createOrder()
            ->deductStock()
            ->clearCart()
            ->commitTransaction()
            ->dispatchEvents()
            ->build();

        return RestAPI::response(new OrderResource($order), true, 'Order placed successfully');
    }

    /**
     * List user's past orders.
     */
    public function index(Request $request): JsonResponse
    {
        $orders = $this->orderQueryService->getUserOrders($request->user(), $request->integer('per_page', 10));

        return RestAPI::setPagination($orders)
            ->response(OrderResource::collection($orders)->resolve());
    }

    /**
     * Show details for a specific order.
     */
    public function show(Order $order): JsonResponse
    {
        $this->authorize('view', $order);

        $order->load('items');

        return RestAPI::response(new OrderResource($order));
    }

    /**
     * Track an order publicly without authentication.
     */
    public function track(Request $request, string $orderNumber): JsonResponse
    {
        $request->validate(['email' => ['required', 'email']]);

        $order = $this->orderQueryService->trackOrder($orderNumber, $request->input('email'));

        return RestAPI::response(new OrderResource($order));
    }

    /**
     * Admin: List all orders.
     */
    public function adminIndex(Request $request): JsonResponse
    {
        $orders = $this->orderQueryService->getAllOrders(
            $request->all(),
            $request->integer('per_page', 20)
        );

        return RestAPI::setPagination($orders)
            ->response(OrderResource::collection($orders)->resolve());
    }

    /**
     * Admin: Show any order details.
     */
    public function adminShow(Order $order): JsonResponse
    {
        $order->load('items');

        return RestAPI::response(new OrderResource($order));
    }

    /**
     * Admin: Update order status.
     */
    public function updateStatus(UpdateOrderStatusRequest $request, Order $order): JsonResponse
    {
        $updatedOrder = OrderStatusService::init($order)
            ->setStatus($request->input('status'), $request->input('tracking_number'))
            ->validation()
            ->update()
            ->dispatchEvents()
            ->build();

        return RestAPI::response(new OrderResource($updatedOrder), true, 'Order status updated successfully');
    }
}
