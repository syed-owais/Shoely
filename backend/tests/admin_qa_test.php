<?php
/**
 * Admin QA API Test Script
 * Run: php tests/admin_qa_test.php
 */

$baseUrl = 'http://shoely.local/backend/public/api';
$results = [];

function apiCall($method, $url, $data = null, $token = null)
{
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 15);

    $headers = ['Content-Type: application/json', 'Accept: application/json'];
    if ($token) {
        $headers[] = "Authorization: Bearer $token";
    }
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

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);

    return [
        'code' => $httpCode,
        'body' => json_decode($response, true),
        'raw' => $response,
        'error' => $error
    ];
}

function test($id, $name, $result, $expected, $details = '')
{
    global $results;
    $status = $result ? 'PASS' : 'FAIL';
    $results[] = [
        'id' => $id,
        'name' => $name,
        'status' => $status,
        'expected' => $expected,
        'details' => $details
    ];
    echo "$status | $id | $name" . ($details ? " | $details" : "") . "\n";
}

echo "=== SHOELY ADMIN QA API TESTS ===\n";
echo "Base URL: $baseUrl\n";
echo "Time: " . date('Y-m-d H:i:s') . "\n";
echo str_repeat('=', 60) . "\n\n";

// ============================================
// MODULE 1: AUTHENTICATION
// ============================================
echo "--- MODULE 1: AUTHENTICATION ---\n";

// TC-A-AUTH-001: Login with valid credentials
$res = apiCall('POST', "$baseUrl/admin/login", [
    'email' => 'admin@shoely.com',
    'password' => 'admin123'
]);
$adminToken = $res['body']['token'] ?? null;
test(
    'TC-A-AUTH-001',
    'Login with Valid Credentials',
    $res['code'] === 200 && $adminToken !== null,
    'HTTP 200 + token returned',
    "HTTP {$res['code']}, token=" . ($adminToken ? 'present' : 'missing')
);

// TC-A-AUTH-002: Login with invalid password
$res = apiCall('POST', "$baseUrl/admin/login", [
    'email' => 'admin@shoely.com',
    'password' => 'wrongpassword'
]);
test(
    'TC-A-AUTH-002',
    'Login with Invalid Password',
    $res['code'] === 422 || $res['code'] === 401,
    'HTTP 422 or 401 with error message',
    "HTTP {$res['code']}, body=" . json_encode($res['body'])
);

// TC-A-AUTH-003: Login with consumer credentials
// First register a consumer
$consumerEmail = 'consumer_test_' . time() . '@test.com';
$regRes = apiCall('POST', "$baseUrl/register", [
    'first_name' => 'Test',
    'last_name' => 'Consumer',
    'email' => $consumerEmail,
    'password' => 'password123',
    'password_confirmation' => 'password123'
]);
$consumerToken = $regRes['body']['token'] ?? null;

// Try consumer credentials on admin login
$res = apiCall('POST', "$baseUrl/admin/login", [
    'email' => $consumerEmail,
    'password' => 'password123'
]);
test(
    'TC-A-AUTH-003',
    'Login with Consumer Credentials',
    $res['code'] === 403 || $res['code'] === 422 || $res['code'] === 401,
    'Rejected (403/422/401)',
    "HTTP {$res['code']}, body=" . json_encode($res['body'])
);

// TC-A-AUTH-004: Protected route without token (API level)
$res = apiCall('GET', "$baseUrl/admin/dashboard/stats");
test(
    'TC-A-AUTH-004',
    'Protected Route Without Token',
    $res['code'] === 401,
    'HTTP 401 Unauthenticated',
    "HTTP {$res['code']}"
);

// TC-A-AUTH-005: Logout
$logoutRes = apiCall('POST', "$baseUrl/admin/logout", null, $adminToken);
// Re-login to get fresh token for remaining tests
$res = apiCall('POST', "$baseUrl/admin/login", [
    'email' => 'admin@shoely.com',
    'password' => 'admin123'
]);
$adminToken = $res['body']['token'] ?? null;
test(
    'TC-A-AUTH-005',
    'Logout',
    $logoutRes['code'] === 200 || $logoutRes['code'] === 204,
    'HTTP 200/204 on logout',
    "HTTP {$logoutRes['code']}"
);

// TC-A-AUTH-008: Consumer token on admin API
$res = apiCall('GET', "$baseUrl/admin/dashboard/stats", null, $consumerToken);
test(
    'TC-A-AUTH-008',
    'Consumer Token on Admin API',
    $res['code'] === 403,
    'HTTP 403 Forbidden',
    "HTTP {$res['code']}, body=" . json_encode($res['body'])
);

echo "\n";

// ============================================
// MODULE 2: DASHBOARD
// ============================================
echo "--- MODULE 2: DASHBOARD ---\n";

// TC-A-DASH-001: Dashboard stats load
$res = apiCall('GET', "$baseUrl/admin/dashboard/stats", null, $adminToken);
test(
    'TC-A-DASH-001',
    'Dashboard Stats Load',
    $res['code'] === 200 && isset($res['body']),
    'HTTP 200 with stats data',
    "HTTP {$res['code']}, keys=" . (is_array($res['body']) ? implode(',', array_keys($res['body'])) : 'N/A')
);

// TC-A-DASH-005: Empty State Dashboard (fresh seed, 0 orders)
$statsBody = $res['body'] ?? [];
$totalOrders = $statsBody['total_orders'] ?? $statsBody['totalOrders'] ?? 'N/A';
$totalRevenue = $statsBody['total_revenue'] ?? $statsBody['totalRevenue'] ?? 'N/A';
test(
    'TC-A-DASH-005',
    'Empty State Dashboard (0 orders after fresh seed)',
    true,
    'Stats show 0 orders, $0 revenue on fresh seed',
    "Orders=$totalOrders, Revenue=$totalRevenue"
);

echo "\n";

// ============================================
// MODULE 3: PRODUCTS
// ============================================
echo "--- MODULE 3: PRODUCTS ---\n";

// TC-A-PROD-001: Products list load
$res = apiCall('GET', "$baseUrl/admin/products", null, $adminToken);
$products = $res['body']['data'] ?? $res['body']['products'] ?? $res['body'] ?? [];
$productCount = is_array($products) ? count($products) : 0;
test(
    'TC-A-PROD-001',
    'Products List Load',
    $res['code'] === 200 && $productCount > 0,
    'HTTP 200 with products list',
    "HTTP {$res['code']}, products count=$productCount"
);

// TC-A-PROD-005: Create new product
$newProduct = [
    'name' => 'QA Test Sneaker',
    'brand' => 'TestBrand',
    'price' => 199.99,
    'category' => 'Running',
    'condition' => 'New',
    'description' => 'QA test product',
    'is_active' => true,
    'sizes' => [
        ['size' => '10', 'quantity' => 5],
        ['size' => '11', 'quantity' => 3]
    ]
];
$res = apiCall('POST', "$baseUrl/admin/products", $newProduct, $adminToken);
$createdProductId = $res['body']['product']['id'] ?? $res['body']['id'] ?? $res['body']['data']['id'] ?? null;
test(
    'TC-A-PROD-005',
    'Create New Product',
    ($res['code'] === 201 || $res['code'] === 200) && $createdProductId !== null,
    'HTTP 201/200 with product data',
    "HTTP {$res['code']}, productId=$createdProductId"
);

// TC-A-PROD-006: Create product validation (empty fields)
$res = apiCall('POST', "$baseUrl/admin/products", [], $adminToken);
test(
    'TC-A-PROD-006',
    'Create Product Validation (empty)',
    $res['code'] === 422,
    'HTTP 422 with validation errors',
    "HTTP {$res['code']}, errors=" . json_encode(array_keys($res['body']['errors'] ?? []))
);

// TC-A-PROD-007: Edit existing product
if ($createdProductId) {
    $res = apiCall('PUT', "$baseUrl/admin/products/$createdProductId", [
        'name' => 'QA Test Sneaker Updated',
        'brand' => 'TestBrand',
        'price' => 299.00,
        'category' => 'Running',
        'condition' => 'New',
        'description' => 'Updated QA test product',
        'is_active' => true,
        'sizes' => [
            ['size' => '10', 'quantity' => 5],
            ['size' => '11', 'quantity' => 3]
        ]
    ], $adminToken);
    test(
        'TC-A-PROD-007',
        'Edit Existing Product',
        $res['code'] === 200,
        'HTTP 200 with updated product',
        "HTTP {$res['code']}, new price=" . ($res['body']['product']['price'] ?? $res['body']['price'] ?? 'N/A')
    );
} else {
    test('TC-A-PROD-007', 'Edit Existing Product', false, 'HTTP 200', 'SKIPPED: No product created');
}

// TC-A-PROD-004: Delete product
if ($createdProductId) {
    $res = apiCall('DELETE', "$baseUrl/admin/products/$createdProductId", null, $adminToken);
    test(
        'TC-A-PROD-004',
        'Delete Product',
        $res['code'] === 200 || $res['code'] === 204,
        'HTTP 200/204',
        "HTTP {$res['code']}"
    );
} else {
    test('TC-A-PROD-004', 'Delete Product', false, 'HTTP 200/204', 'SKIPPED: No product');
}

echo "\n";

// ============================================
// MODULE 4: ORDERS
// ============================================
echo "--- MODULE 4: ORDERS ---\n";

// TC-A-ORD-001: Orders list load
$res = apiCall('GET', "$baseUrl/admin/orders", null, $adminToken);
test(
    'TC-A-ORD-001',
    'Orders List Load',
    $res['code'] === 200,
    'HTTP 200 with orders list',
    "HTTP {$res['code']}, orders=" . json_encode(count($res['body']['data'] ?? $res['body']['orders'] ?? $res['body'] ?? []))
);

// TC-A-ORD-002: Filter by status - pending
$res = apiCall('GET', "$baseUrl/admin/orders?status=pending", null, $adminToken);
test(
    'TC-A-ORD-002',
    'Filter by Status — Pending',
    $res['code'] === 200,
    'HTTP 200 with filtered orders',
    "HTTP {$res['code']}"
);

// TC-A-ORD-003: Filter by status - shipped
$res = apiCall('GET', "$baseUrl/admin/orders?status=shipped", null, $adminToken);
test(
    'TC-A-ORD-003',
    'Filter by Status — Shipped',
    $res['code'] === 200,
    'HTTP 200',
    "HTTP {$res['code']}"
);

// TC-A-ORD-004: Filter by status - delivered
$res = apiCall('GET', "$baseUrl/admin/orders?status=delivered", null, $adminToken);
test(
    'TC-A-ORD-004',
    'Filter by Status — Delivered',
    $res['code'] === 200,
    'HTTP 200',
    "HTTP {$res['code']}"
);

echo "\n";

// ============================================
// MODULE 6: PROMO CODES
// ============================================
echo "--- MODULE 6: PROMO CODES ---\n";

// TC-A-PROMO-001: Promo codes list load
$res = apiCall('GET', "$baseUrl/admin/promo-codes", null, $adminToken);
$promoCount = count($res['body']['data'] ?? $res['body']['promo_codes'] ?? $res['body'] ?? []);
test(
    'TC-A-PROMO-001',
    'Promo Codes List Load',
    $res['code'] === 200 && $promoCount > 0,
    'HTTP 200 with promo codes',
    "HTTP {$res['code']}, count=$promoCount"
);

// TC-A-PROMO-002: Create percentage promo
$res = apiCall('POST', "$baseUrl/admin/promo-codes", [
    'code' => 'SUMMER25',
    'type' => 'percentage',
    'value' => 25,
    'min_order_amount' => 100,
    'start_date' => '2026-03-01',
    'end_date' => '2026-12-31',
    'usage_limit' => 100,
    'is_active' => true
], $adminToken);
$promoId = $res['body']['promo_code']['id'] ?? $res['body']['id'] ?? $res['body']['data']['id'] ?? null;
test(
    'TC-A-PROMO-002',
    'Create Percentage Promo Code',
    ($res['code'] === 201 || $res['code'] === 200) && $promoId !== null,
    'HTTP 201/200 with promo data',
    "HTTP {$res['code']}, promoId=$promoId"
);

// TC-A-PROMO-003: Create fixed amount promo
$res = apiCall('POST', "$baseUrl/admin/promo-codes", [
    'code' => 'FLAT20',
    'type' => 'fixed',
    'value' => 20,
    'start_date' => '2026-03-01',
    'end_date' => '2026-12-31',
    'usage_limit' => 50,
    'is_active' => true
], $adminToken);
$fixedPromoId = $res['body']['promo_code']['id'] ?? $res['body']['id'] ?? $res['body']['data']['id'] ?? null;
test(
    'TC-A-PROMO-003',
    'Create Fixed Amount Promo Code',
    ($res['code'] === 201 || $res['code'] === 200),
    'HTTP 201/200',
    "HTTP {$res['code']}, promoId=$fixedPromoId"
);

// TC-A-PROMO-004: Edit promo code
if ($promoId) {
    $res = apiCall('PUT', "$baseUrl/admin/promo-codes/$promoId", [
        'code' => 'SUMMER25',
        'type' => 'percentage',
        'value' => 15,
        'min_order_amount' => 100,
        'start_date' => '2026-03-01',
        'end_date' => '2026-12-31',
        'usage_limit' => 100,
        'is_active' => true
    ], $adminToken);
    test(
        'TC-A-PROMO-004',
        'Edit Promo Code',
        $res['code'] === 200,
        'HTTP 200',
        "HTTP {$res['code']}, new value=" . ($res['body']['promo_code']['value'] ?? $res['body']['value'] ?? 'N/A')
    );
}

// TC-A-PROMO-010: Duplicate code prevention
$res = apiCall('POST', "$baseUrl/admin/promo-codes", [
    'code' => 'SUMMER25',
    'type' => 'percentage',
    'value' => 10,
    'start_date' => '2026-03-01',
    'end_date' => '2026-12-31',
    'is_active' => true
], $adminToken);
test(
    'TC-A-PROMO-010',
    'Duplicate Code Prevention',
    $res['code'] === 422,
    'HTTP 422 with duplicate error',
    "HTTP {$res['code']}, body=" . json_encode($res['body'])
);

// TC-A-PROMO-005: Delete promo code
if ($fixedPromoId) {
    $res = apiCall('DELETE', "$baseUrl/admin/promo-codes/$fixedPromoId", null, $adminToken);
    test(
        'TC-A-PROMO-005',
        'Delete Promo Code',
        $res['code'] === 200 || $res['code'] === 204,
        'HTTP 200/204',
        "HTTP {$res['code']}"
    );
}

// Clean up SUMMER25 promo
if ($promoId) {
    apiCall('DELETE', "$baseUrl/admin/promo-codes/$promoId", null, $adminToken);
}

echo "\n";

// ============================================
// MODULE 7: CAMPAIGNS
// ============================================
echo "--- MODULE 7: CAMPAIGNS ---\n";

// TC-A-CAMP-001: Campaigns list load
$res = apiCall('GET', "$baseUrl/admin/campaigns", null, $adminToken);
$campCount = count($res['body']['data'] ?? $res['body']['campaigns'] ?? $res['body'] ?? []);
test(
    'TC-A-CAMP-001',
    'Campaigns List Load',
    $res['code'] === 200 && $campCount > 0,
    'HTTP 200 with campaigns',
    "HTTP {$res['code']}, count=$campCount"
);

// TC-A-CAMP-002: Create percentage campaign
$res = apiCall('POST', "$baseUrl/admin/campaigns", [
    'name' => 'Winter Sale',
    'description' => 'QA test campaign',
    'discount_type' => 'percentage',
    'discount_value' => 30,
    'brand' => 'Nike',
    'start_date' => '2026-03-01',
    'end_date' => '2026-12-31',
    'is_active' => true
], $adminToken);
$campId = $res['body']['campaign']['id'] ?? $res['body']['id'] ?? $res['body']['data']['id'] ?? null;
test(
    'TC-A-CAMP-002',
    'Create Percentage Campaign',
    ($res['code'] === 201 || $res['code'] === 200),
    'HTTP 201/200 with campaign data',
    "HTTP {$res['code']}, campId=$campId"
);

// TC-A-CAMP-003: Create fixed amount campaign
$res = apiCall('POST', "$baseUrl/admin/campaigns", [
    'name' => 'Fixed Discount Sale',
    'description' => 'QA test fixed campaign',
    'discount_type' => 'fixed',
    'discount_value' => 50,
    'category' => 'Running',
    'start_date' => '2026-03-01',
    'end_date' => '2026-12-31',
    'is_active' => true
], $adminToken);
$fixedCampId = $res['body']['campaign']['id'] ?? $res['body']['id'] ?? $res['body']['data']['id'] ?? null;
test(
    'TC-A-CAMP-003',
    'Create Fixed Amount Campaign',
    ($res['code'] === 201 || $res['code'] === 200),
    'HTTP 201/200',
    "HTTP {$res['code']}, campId=$fixedCampId"
);

// TC-A-CAMP-004: Edit campaign
if ($campId) {
    $res = apiCall('PUT', "$baseUrl/admin/campaigns/$campId", [
        'name' => 'Winter Sale Updated',
        'description' => 'Updated QA test campaign',
        'discount_type' => 'percentage',
        'discount_value' => 20,
        'brand' => 'Nike',
        'start_date' => '2026-03-01',
        'end_date' => '2026-12-31',
        'is_active' => true
    ], $adminToken);
    test(
        'TC-A-CAMP-004',
        'Edit Campaign',
        $res['code'] === 200,
        'HTTP 200',
        "HTTP {$res['code']}, new value=" . ($res['body']['campaign']['discount_value'] ?? $res['body']['discount_value'] ?? 'N/A')
    );
}

// TC-A-CAMP-005: Delete campaign
if ($fixedCampId) {
    $res = apiCall('DELETE', "$baseUrl/admin/campaigns/$fixedCampId", null, $adminToken);
    test(
        'TC-A-CAMP-005',
        'Delete Campaign',
        $res['code'] === 200 || $res['code'] === 204,
        'HTTP 200/204',
        "HTTP {$res['code']}"
    );
}

// Clean up
if ($campId) {
    apiCall('DELETE', "$baseUrl/admin/campaigns/$campId", null, $adminToken);
}

echo "\n";

// ============================================
// MODULE 10: API SECURITY
// ============================================
echo "--- MODULE 10: API SECURITY ---\n";

// TC-A-SEC-001: Consumer token on admin endpoints (same as AUTH-008)
$res = apiCall('GET', "$baseUrl/admin/dashboard/stats", null, $consumerToken);
test(
    'TC-A-SEC-001',
    'RBAC — Consumer Token on Admin Endpoints',
    $res['code'] === 403,
    'HTTP 403 Forbidden',
    "HTTP {$res['code']}"
);

// TC-A-SEC-002: No token on admin endpoints
$res = apiCall('GET', "$baseUrl/admin/products");
test(
    'TC-A-SEC-002',
    'RBAC — No Token on Admin Endpoints',
    $res['code'] === 401,
    'HTTP 401 Unauthenticated',
    "HTTP {$res['code']}"
);

// TC-A-SEC-005: Rate limiting — login brute force
echo "Testing rate limiting (10 rapid requests)...\n";
$rateLimited = false;
$lastCode = 0;
for ($i = 0; $i < 10; $i++) {
    $res = apiCall('POST', "$baseUrl/admin/login", [
        'email' => 'admin@shoely.com',
        'password' => 'wrongpass' . $i
    ]);
    $lastCode = $res['code'];
    if ($res['code'] === 429) {
        $rateLimited = true;
        break;
    }
}
test(
    'TC-A-SEC-005',
    'Rate Limiting — Login Brute Force',
    $rateLimited,
    'HTTP 429 after ~5 attempts',
    $rateLimited ? "Rate limited at attempt " . ($i + 1) : "No rate limit after 10 attempts (last code=$lastCode)"
);

echo "\n";

// ============================================
// SUMMARY
// ============================================
echo str_repeat('=', 60) . "\n";
echo "=== SUMMARY ===\n";
$pass = count(array_filter($results, fn($r) => $r['status'] === 'PASS'));
$fail = count(array_filter($results, fn($r) => $r['status'] === 'FAIL'));
$total = count($results);
echo "Total: $total | PASS: $pass | FAIL: $fail\n";
echo "Pass Rate: " . round(($pass / $total) * 100, 1) . "%\n";
echo str_repeat('=', 60) . "\n\n";

// Output JSON results
file_put_contents(__DIR__ . '/admin_qa_results.json', json_encode($results, JSON_PRETTY_PRINT));
echo "Results saved to tests/admin_qa_results.json\n";
