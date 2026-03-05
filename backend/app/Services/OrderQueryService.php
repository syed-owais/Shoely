<?php

namespace App\Services;

use App\Models\Order;
use App\Models\User;
use Illuminate\Pagination\LengthAwarePaginator;

class OrderQueryService
{
    /**
     * Get consumer's orders (paginated, newest first).
     */
    public function getUserOrders(User $user, int $perPage = 10): LengthAwarePaginator
    {
        return $user->orders()->with('items')->latest()->paginate($perPage);
    }

    /**
     * Track order publicly by order number + email.
     */
    public function trackOrder(string $orderNumber, string $email): Order
    {
        $order = Order::where('order_number', $orderNumber)
            ->where('email', $email)
            ->with('items')
            ->first();

        abort_if(!$order, 404, 'Order not found or email does not match.');

        return $order;
    }

    /**
     * Admin: Get all orders with optional status/search filters.
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
}
