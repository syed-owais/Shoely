<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

// TEST: Guest Promo Code Validation
echo "=== TEST: Guest Promo Code Validation ===\n";
$request = Illuminate\Http\Request::create('/api/promo-codes/validate', 'POST', [
    'code' => 'WELCOME10',
    'subtotal' => 145
]);
$request->headers->set('Accept', 'application/json');
$response = app()->handle($request);
echo "Status: " . $response->getStatusCode() . "\n";
echo "Response: " . $response->getContent() . "\n";
echo ($response->getStatusCode() === 200 ? "PASS" : "FAIL") . "\n\n";

// Get a product for checkout
$product = App\Models\Product::first();
$size = $product->sizes()->first();

// TEST: Guest Checkout
echo "=== TEST: Guest Checkout ===\n";
$app2 = require __DIR__ . '/bootstrap/app.php';
$app2->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$checkoutData = [
    'first_name' => 'Test',
    'last_name' => 'Guest',
    'email' => 'testguest@example.com',
    'phone' => '1234567890',
    'street' => '123 Test Ave',
    'city' => 'New York',
    'state' => 'NY',
    'zip_code' => '10001',
    'country' => 'US',
    'items' => [
        [
            'product_id' => $product->id,
            'name' => $product->name,
            'brand' => $product->brand,
            'price' => $product->price,
            'size' => $size ? $size->size : '10',
            'quantity' => 1,
            'image' => $product->image,
        ]
    ]
];

$request2 = Illuminate\Http\Request::create('/api/orders/checkout', 'POST', $checkoutData);
$request2->headers->set('Accept', 'application/json');
$request2->headers->set('Content-Type', 'application/json');
$response2 = app()->handle($request2);
echo "Status: " . $response2->getStatusCode() . "\n";
echo "Response: " . substr($response2->getContent(), 0, 500) . "\n";
echo ($response2->getStatusCode() === 200 || $response2->getStatusCode() === 201 ? "PASS" : "FAIL") . "\n\n";

// TEST: Order Tracking
echo "=== TEST: Order Tracking ===\n";
$order = App\Models\Order::latest()->first();
if ($order) {
    $trackRequest = Illuminate\Http\Request::create('/api/orders/track/' . $order->order_number, 'POST', [
        'email' => $order->email
    ]);
    $trackRequest->headers->set('Accept', 'application/json');
    $trackResponse = app()->handle($trackRequest);
    echo "Order Number: " . $order->order_number . "\n";
    echo "Status: " . $trackResponse->getStatusCode() . "\n";
    echo "Response: " . substr($trackResponse->getContent(), 0, 500) . "\n";
    echo ($trackResponse->getStatusCode() === 200 ? "PASS" : "FAIL") . "\n";
} else {
    echo "No orders found\n";
    echo "FAIL\n";
}
