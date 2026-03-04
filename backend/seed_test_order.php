<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$user = App\Models\User::firstOrCreate(
    ['email' => 'consumer@example.com'],
    ['name' => 'Test Consumer', 'password' => bcrypt('password'), 'role' => 'customer']
);

$order = App\Models\Order::firstOrCreate(
    ['order_number' => 'ORD-123456'],
    [
        'user_id' => $user->id,
        'status' => 'shipped',
        'first_name' => 'Test',
        'last_name' => 'User',
        'email' => 'consumer@example.com',
        'phone' => '1234567890',
        'street' => '123 Test Ave',
        'city' => 'New York',
        'state' => 'NY',
        'zip_code' => '10001',
        'country' => 'US',
        'subtotal' => 285.00,
        'shipping' => 0.00,
        'tax' => 25.00,
        'discount' => 0.00,
        'total' => 310.00,
        'tracking_number' => 'TRK987654321',
    ]
);

$order->items()->firstOrCreate(
    ['product_id' => 1, 'size' => '10'],
    [
        'quantity' => 1,
        'price' => 285.00,
        'name' => 'Air Jordan 1',
        'brand' => 'Jordan',
        'image' => 'https://example.com/image.jpg'
    ]
);

echo "Order Created: " . $order->order_number . "\n";
