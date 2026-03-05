<?php

namespace App\Http\Controllers\Api;

use App\Classes\RestAPI;
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

        return RestAPI::response([
            'summary' => [
                'totalSales' => (float) $totalSales,
                'totalOrders' => $totalOrders,
                'totalCustomers' => $totalCustomers,
                'totalProducts' => $totalProducts,
                'totalPendingOrders' => $totalPendingOrders,
            ],
            'recentOrders' => $recentOrders,
            'topProducts' => $topProducts,
        ]);
    }

    /**
     * Get revenue chart data (last 30 days).
     */
    public function chartData(): JsonResponse
    {
        $days = 30;
        $startDate = now()->subDays($days);

        $dailyRevenue = Order::where('status', '!=', 'cancelled')
            ->where('created_at', '>=', $startDate)
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('SUM(total) as revenue'),
                DB::raw('COUNT(*) as orders')
            )
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        // Fill in missing dates with zero values
        $chartData = [];
        for ($i = $days; $i >= 0; $i--) {
            $date = now()->subDays($i)->format('Y-m-d');
            $dayData = $dailyRevenue->firstWhere('date', $date);
            $chartData[] = [
                'date' => $date,
                'label' => now()->subDays($i)->format('M d'),
                'revenue' => $dayData ? (float) $dayData->revenue : 0,
                'orders' => $dayData ? (int) $dayData->orders : 0,
            ];
        }

        return RestAPI::response($chartData);
    }
}
