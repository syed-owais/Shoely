<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$product = App\Models\Product::first();
$size = $product->sizes()->first();

$checkoutData = [
    'first_name' => 'Test',
    'last_name' => 'Guest',
    'email' => 'testguest2@example.com',
    'phone' => '1234567890',
    'address' => '123 Test Ave',
    'city' => 'New York',
    'state' => 'NY',
    'zip_code' => '10001',
    'country' => 'US',
    'payment_method' => 'cod',
    'items' => [
        [
            'product_id' => $product->id,
            'size' => $size ? $size->size : '10',
            'quantity' => 1,
        ]
    ]
];

$request = Illuminate\Http\Request::create('/api/orders/checkout', 'POST', $checkoutData);
$request->headers->set('Accept', 'application/json');
$response = app()->handle($request);
echo "Status: " . $response->getStatusCode() . "\n";
echo "Response: " . substr($response->getContent(), 0, 500) . "\n";
echo ($response->getStatusCode() === 200 || $response->getStatusCode() === 201 ? "PASS" : "FAIL") . "\n";
