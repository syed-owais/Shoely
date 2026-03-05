<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <style>
        body {
            font-family: Arial, sans-serif;
            background: #f5f5f5;
            margin: 0;
            padding: 20px;
        }

        .container {
            max-width: 600px;
            margin: 0 auto;
            background: #fff;
            border-radius: 12px;
            overflow: hidden;
        }

        .header {
            background: #0B0B0D;
            padding: 30px;
            text-align: center;
        }

        .header h1 {
            color: #FF4D6D;
            font-size: 28px;
            margin: 0;
            letter-spacing: 2px;
        }

        .content {
            padding: 30px;
        }

        .content h2 {
            color: #333;
            margin-top: 0;
        }

        .status-badge {
            display: inline-block;
            padding: 6px 16px;
            border-radius: 20px;
            font-weight: bold;
            font-size: 14px;
            text-transform: uppercase;
        }

        .status-shipped {
            background: #dbeafe;
            color: #2563eb;
        }

        .status-delivered {
            background: #dcfce7;
            color: #16a34a;
        }

        .status-cancelled {
            background: #fee2e2;
            color: #dc2626;
        }

        .status-default {
            background: #fef9c3;
            color: #ca8a04;
        }

        .order-info {
            background: #f9f9f9;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }

        .order-info p {
            margin: 5px 0;
            color: #555;
        }

        .order-info strong {
            color: #333;
        }

        .footer {
            background: #f9f9f9;
            padding: 20px;
            text-align: center;
            color: #888;
            font-size: 12px;
        }
    </style>
</head>

<body>
    <div class="container">
        <div class="header">
            <h1>SHOELY</h1>
        </div>
        <div class="content">
            @if($order->status === 'shipped')
                <h2>Your Order Has Shipped! 🚚</h2>
                <p>Hi {{ $order->first_name }},</p>
                <p>Great news! Your order is on its way.</p>
            @elseif($order->status === 'delivered')
                <h2>Order Delivered! 📦</h2>
                <p>Hi {{ $order->first_name }},</p>
                <p>Your order has been delivered. We hope you love your new kicks!</p>
            @elseif($order->status === 'cancelled')
                <h2>Order Cancelled</h2>
                <p>Hi {{ $order->first_name }},</p>
                <p>Your order has been cancelled. If you have questions, please contact us.</p>
            @else
                <h2>Order Update</h2>
                <p>Hi {{ $order->first_name }},</p>
                <p>Your order status has been updated.</p>
            @endif

            <div class="order-info">
                <p><strong>Order Number:</strong> {{ $order->order_number }}</p>
                <p><strong>New Status:</strong>
                    <span class="status-badge
                        @if($order->status === 'shipped') status-shipped
                        @elseif($order->status === 'delivered') status-delivered
                        @elseif($order->status === 'cancelled') status-cancelled
                        @else status-default
                        @endif
                    ">{{ ucfirst($order->status) }}</span>
                </p>
                @if($order->tracking_number)
                    <p><strong>Tracking Number:</strong> {{ $order->tracking_number }}</p>
                @endif
            </div>

            <p>Thank you for shopping with Shoely!</p>
        </div>
        <div class="footer">
            <p>&copy; {{ date('Y') }} Shoely. All rights reserved.</p>
        </div>
    </div>
</body>

</html>