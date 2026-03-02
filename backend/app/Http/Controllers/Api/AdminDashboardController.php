<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class AdminDashboardController extends Controller
{
    /**
     * Get key statistics for the admin dashboard.
     */
    public function stats(): JsonResponse
    {
        $totalSales = Order::where('status', '!=', 'cancelled')->sum('total');
        $totalOrders = Order::where('status', '!=', 'cancelled')->count();
        $totalCustomers = User::where('role', 'customer')->count();
        $totalProducts = Product::where('is_active', true)->count();
        $totalPendingOrders = Order::where('status', 'pending')->count();

        // Recent 5 orders
        $recentOrders = Order::with('user')
            ->latest()
            ->take(5)
            ->get()
            ->map(function ($order) {
                return [
                    'id' => $order->id,
                    'orderNumber' => $order->order_number,
                    'customerName' => $order->first_name . ' ' . $order->last_name,
                    'totalAmount' => (float) $order->total,
                    'status' => $order->status,
                    'createdAt' => $order->created_at->toIso8601String(),
                ];
            });

        // Top 5 selling products
        $topProducts = DB::table('order_items')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->select('order_items.product_id', 'order_items.name', DB::raw('SUM(order_items.quantity) as total_sold'))
            ->where('orders.status', '!=', 'cancelled')
            ->groupBy('order_items.product_id', 'order_items.name')
            ->orderByDesc('total_sold')
            ->take(5)
            ->get();

        return response()->json([
            'data' => [
                'summary' => [
                    'totalSales' => (float) $totalSales,
                    'totalOrders' => $totalOrders,
                    'totalCustomers' => $totalCustomers,
                    'totalProducts' => $totalProducts,
                    'totalPendingOrders' => $totalPendingOrders,
                ],
                'recentOrders' => $recentOrders,
                'topProducts' => $topProducts,
            ]
        ]);
    }
}
