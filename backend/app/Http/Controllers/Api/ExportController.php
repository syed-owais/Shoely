<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\User;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ExportController extends Controller
{
    /**
     * Export orders to CSV.
     */
    public function orders(Request $request): StreamedResponse
    {
        $query = Order::with('items')->latest();

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('from')) {
            $query->whereDate('created_at', '>=', $request->input('from'));
        }

        if ($request->filled('to')) {
            $query->whereDate('created_at', '<=', $request->input('to'));
        }

        $orders = $query->get();

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="orders_' . now()->format('Y-m-d') . '.csv"',
        ];

        return response()->stream(function () use ($orders) {
            $handle = fopen('php://output', 'w');

            // Header Row
            fputcsv($handle, [
                'Order Number',
                'Status',
                'Customer Name',
                'Email',
                'Phone',
                'Address',
                'City',
                'State',
                'Zip',
                'Country',
                'Subtotal',
                'Shipping',
                'Tax',
                'Discount',
                'Total',
                'Promo Code',
                'Items Count',
                'Tracking Number',
                'Created At',
            ]);

            foreach ($orders as $order) {
                fputcsv($handle, [
                    $order->order_number,
                    $order->status,
                    $order->first_name . ' ' . $order->last_name,
                    $order->email,
                    $order->phone,
                    $order->street,
                    $order->city,
                    $order->state,
                    $order->zip_code,
                    $order->country,
                    $order->subtotal,
                    $order->shipping,
                    $order->tax,
                    $order->discount,
                    $order->total,
                    $order->promo_code,
                    $order->items->count(),
                    $order->tracking_number,
                    $order->created_at->toDateTimeString(),
                ]);
            }

            fclose($handle);
        }, 200, $headers);
    }

    /**
     * Export customers to CSV.
     */
    public function customers(): StreamedResponse
    {
        $users = User::where('role', 'customer')
            ->withCount('orders')
            ->latest()
            ->get();

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="customers_' . now()->format('Y-m-d') . '.csv"',
        ];

        return response()->stream(function () use ($users) {
            $handle = fopen('php://output', 'w');

            fputcsv($handle, [
                'ID',
                'First Name',
                'Last Name',
                'Email',
                'Phone',
                'Role',
                'Total Orders',
                'Registered At',
            ]);

            foreach ($users as $user) {
                fputcsv($handle, [
                    $user->id,
                    $user->first_name,
                    $user->last_name,
                    $user->email,
                    $user->phone,
                    $user->role,
                    $user->orders_count,
                    $user->created_at->toDateTimeString(),
                ]);
            }

            fclose($handle);
        }, 200, $headers);
    }
}
