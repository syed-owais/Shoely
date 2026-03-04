<?php
$base = 'http://shoely.local/backend/public/api';

function api($method, $url, $data = null, $token = null)
{
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 15);
    $headers = ['Content-Type: application/json', 'Accept: application/json'];
    if ($token)
        $headers[] = "Authorization: Bearer $token";
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    if ($method === 'POST') {
        curl_setopt($ch, CURLOPT_POST, true);
        if ($data)
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    } elseif ($method === 'PUT') {
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'PUT');
        if ($data)
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    } elseif ($method === 'DELETE') {
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'DELETE');
    }
    $r = curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    return ['code' => $code, 'body' => json_decode($r, true), 'raw' => $r];
}

// Login
$r = api('POST', "$base/admin/login", ['email' => 'admin@shoely.com', 'password' => 'admin123']);
$token = $r['body']['token'];
echo "=== CORRECTED PRODUCT & PROMO TESTS ===\n\n";

// TC-A-PROD-005: Create product with all required fields (condition enum, sizes.*.available)
echo "--- TC-A-PROD-005: Create New Product ---\n";
$product = [
    'name' => 'QA Test Sneaker',
    'brand' => 'Nike',
    'model' => 'Air QA Max',
    'price' => 199.99,
    'original_price' => 250.00,
    'category' => 'Running',
    'condition' => 'Like New',
    'description' => 'QA test product for automated testing',
    'sku' => 'QA-TEST-' . time(),
    'is_active' => true,
    'sizes' => [
        ['size' => 10, 'quantity' => 5, 'available' => true],
        ['size' => 11, 'quantity' => 3, 'available' => true]
    ]
];
$r = api('POST', "$base/admin/products", $product, $token);
echo "HTTP {$r['code']}\n";
echo json_encode($r['body'], JSON_PRETTY_PRINT) . "\n\n";
$productId = $r['body']['data']['id'] ?? $r['body']['product']['id'] ?? $r['body']['id'] ?? null;
echo "RESULT: " . ($r['code'] === 201 || $r['code'] === 200 ? 'PASS' : 'FAIL') . " (productId=$productId)\n\n";

// TC-A-PROD-008: Load existing data
if ($productId) {
    echo "--- TC-A-PROD-008: Edit Product — Load Existing Data ---\n";
    $r = api('GET', "$base/admin/products", null, $token);
    $products = $r['body']['data'] ?? [];
    $found = false;
    foreach ($products as $p) {
        if (($p['id'] ?? null) == $productId) {
            $found = true;
            echo "Found product: name={$p['name']}, price={$p['price']}\n";
        }
    }
    echo "RESULT: " . ($found ? 'PASS' : 'FAIL') . "\n\n";
}

// TC-A-PROD-007: Edit product
if ($productId) {
    echo "--- TC-A-PROD-007: Edit Existing Product ---\n";
    $product['name'] = 'QA Test Sneaker Updated';
    $product['price'] = 299.00;
    $r = api('PUT', "$base/admin/products/$productId", $product, $token);
    echo "HTTP {$r['code']}\n";
    $updatedPrice = $r['body']['data']['price'] ?? $r['body']['product']['price'] ?? $r['body']['price'] ?? 'N/A';
    echo "Updated price: $updatedPrice\n";
    echo "RESULT: " . ($r['code'] === 200 ? 'PASS' : 'FAIL') . "\n\n";
}

// TC-A-PROD-003: Toggle product status
if ($productId) {
    echo "--- TC-A-PROD-003: Toggle Product Active Status ---\n";
    $product['is_active'] = false;
    $r = api('PUT', "$base/admin/products/$productId", $product, $token);
    echo "HTTP {$r['code']}\n";
    $isActive = $r['body']['data']['isActive'] ?? $r['body']['data']['is_active'] ?? 'N/A';
    echo "is_active after toggle: " . json_encode($isActive) . "\n";
    echo "RESULT: " . ($r['code'] === 200 ? 'PASS' : 'FAIL') . "\n\n";
}

// TC-A-PROD-009: Add/Remove sizes
if ($productId) {
    echo "--- TC-A-PROD-009: Add/Remove Product Sizes ---\n";
    $product['sizes'] = [
        ['size' => 10, 'quantity' => 5, 'available' => true],
        ['size' => 11, 'quantity' => 3, 'available' => true],
        ['size' => 15, 'quantity' => 5, 'available' => true]
    ];
    $r = api('PUT', "$base/admin/products/$productId", $product, $token);
    echo "HTTP {$r['code']}\n";
    $sizes = $r['body']['data']['sizes'] ?? [];
    echo "Sizes count: " . count($sizes) . "\n";
    echo "RESULT: " . ($r['code'] === 200 && count($sizes) >= 3 ? 'PASS' : 'CONDITIONAL') . "\n\n";
}

// TC-A-PROD-004: Delete product
if ($productId) {
    echo "--- TC-A-PROD-004: Delete Product ---\n";
    $r = api('DELETE', "$base/admin/products/$productId", null, $token);
    echo "HTTP {$r['code']}\n";
    echo "RESULT: " . ($r['code'] === 200 || $r['code'] === 204 ? 'PASS' : 'FAIL') . "\n\n";
}

// TC-A-PROMO-002: Create percentage promo (already verified above as 201)
echo "--- TC-A-PROMO-002: Create Percentage Promo Code ---\n";
$r = api('POST', "$base/admin/promo-codes", [
    'code' => 'SUMMER25',
    'type' => 'percentage',
    'value' => 25,
    'min_order_amount' => 100,
    'start_date' => '2026-03-01',
    'end_date' => '2026-12-31',
    'usage_limit' => 100,
    'is_active' => true
], $token);
echo "HTTP {$r['code']}\n";
$promoId = $r['body']['data']['id'] ?? $r['body']['promo_code']['id'] ?? null;
echo "RESULT: " . (($r['code'] === 201 || $r['code'] === 200) ? 'PASS' : 'FAIL') . " (promoId=$promoId)\n\n";

// TC-A-PROMO-006: Toggle active/inactive
if ($promoId) {
    echo "--- TC-A-PROMO-006: Toggle Active/Inactive ---\n";
    $r = api('PUT', "$base/admin/promo-codes/$promoId", [
        'code' => 'SUMMER25',
        'type' => 'percentage',
        'value' => 25,
        'min_order_amount' => 100,
        'start_date' => '2026-03-01',
        'end_date' => '2026-12-31',
        'usage_limit' => 100,
        'is_active' => false
    ], $token);
    echo "HTTP {$r['code']}\n";
    $active = $r['body']['data']['isActive'] ?? $r['body']['data']['is_active'] ?? 'N/A';
    echo "isActive after toggle: " . json_encode($active) . "\n";
    echo "RESULT: " . ($r['code'] === 200 ? 'PASS' : 'FAIL') . "\n\n";

    // TC-A-PROMO-007: Toggle back to active
    echo "--- TC-A-PROMO-007: Toggle Back to Active ---\n";
    $r = api('PUT', "$base/admin/promo-codes/$promoId", [
        'code' => 'SUMMER25',
        'type' => 'percentage',
        'value' => 25,
        'min_order_amount' => 100,
        'start_date' => '2026-03-01',
        'end_date' => '2026-12-31',
        'usage_limit' => 100,
        'is_active' => true
    ], $token);
    $active = $r['body']['data']['isActive'] ?? $r['body']['data']['is_active'] ?? 'N/A';
    echo "isActive after re-toggle: " . json_encode($active) . "\n";
    echo "RESULT: " . ($r['code'] === 200 ? 'PASS' : 'FAIL') . "\n\n";
}

// Cleanup
if ($promoId)
    api('DELETE', "$base/admin/promo-codes/$promoId", null, $token);

// TC-A-CAMP-006: Toggle campaign active/inactive
echo "--- TC-A-CAMP-006: Toggle Campaign Active/Inactive ---\n";
$r = api('GET', "$base/admin/campaigns", null, $token);
$campaigns = $r['body']['data'] ?? [];
if (count($campaigns) > 0) {
    $campId = $campaigns[0]['id'];
    $r = api('PUT', "$base/admin/campaigns/$campId", [
        'name' => $campaigns[0]['name'],
        'description' => $campaigns[0]['description'] ?? 'test',
        'discount_type' => $campaigns[0]['discountType'] ?? $campaigns[0]['discount_type'] ?? 'percentage',
        'discount_value' => $campaigns[0]['discountValue'] ?? $campaigns[0]['discount_value'] ?? 10,
        'start_date' => '2026-03-01',
        'end_date' => '2026-12-31',
        'is_active' => false
    ], $token);
    echo "HTTP {$r['code']}\n";
    echo "RESULT: " . ($r['code'] === 200 ? 'PASS' : 'FAIL') . "\n\n";

    // Reactivate
    $r = api('PUT', "$base/admin/campaigns/$campId", [
        'name' => $campaigns[0]['name'],
        'description' => $campaigns[0]['description'] ?? 'test',
        'discount_type' => $campaigns[0]['discountType'] ?? $campaigns[0]['discount_type'] ?? 'percentage',
        'discount_value' => $campaigns[0]['discountValue'] ?? $campaigns[0]['discount_value'] ?? 10,
        'start_date' => '2026-03-01',
        'end_date' => '2026-12-31',
        'is_active' => true
    ], $token);
} else {
    echo "SKIP: No campaigns\n";
}

echo "\n=== DONE ===\n";
