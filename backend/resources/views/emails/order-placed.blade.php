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

        table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
        }

        th {
            text-align: left;
            padding: 10px;
            border-bottom: 2px solid #eee;
            color: #888;
            font-size: 12px;
            text-transform: uppercase;
        }

        td {
            padding: 10px;
            border-bottom: 1px solid #eee;
            color: #333;
        }

        .total-row td {
            border-top: 2px solid #333;
            font-weight: bold;
            font-size: 16px;
        }

        .footer {
            background: #f9f9f9;
            padding: 20px;
            text-align: center;
            color: #888;
            font-size: 12px;
        }

        .btn {
            display: inline-block;
            background: #FF4D6D;
            color: #fff;
            padding: 12px 30px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: bold;
            margin: 15px 0;
        }
    </style>
</head>

<body>
    <div class="container">
        <div class="header">
            <h1>SHOELY</h1>
        </div>
        <div class="content">
            <h2>Order Confirmed! 🎉</h2>
            <p>Hi {{ $order->first_name }},</p>
            <p>Thank you for your order! We've received it and will begin processing it shortly.</p>

            <div class="order-info">
                <p><strong>Order Number:</strong> {{ $order->order_number }}</p>
                <p><strong>Date:</strong> {{ $order->created_at->format('M d, Y h:i A') }}</p>
                <p><strong>Status:</strong> {{ ucfirst($order->status) }}</p>
            </div>

            <h3>Order Items</h3>
            <table>
                <thead>
                    <tr>
                        <th>Item</th>
                        <th>Size</th>
                        <th>Qty</th>
                        <th>Price</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($order->items as $item)
                        <tr>
                            <td>{{ $item->name }}</td>
                            <td>{{ $item->size }}</td>
                            <td>{{ $item->quantity }}</td>
                            <td>PKR {{ number_format($item->price * $item->quantity, 2) }}</td>
                        </tr>
                    @endforeach
                    <tr class="total-row">
                        <td colspan="3">Total</td>
                        <td>PKR {{ number_format($order->total, 2) }}</td>
                    </tr>
                </tbody>
            </table>

            <div class="order-info">
                <p><strong>Shipping Address:</strong></p>
                <p>{{ $order->street }}, {{ $order->city }}, {{ $order->state }} {{ $order->zip }}</p>
            </div>

            <p>We'll send you another email when your order ships.</p>
        </div>
        <div class="footer">
            <p>&copy; {{ date('Y') }} Shoely. All rights reserved.</p>
        </div>
    </div>
</body>

</html>