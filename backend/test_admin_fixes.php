<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

// Test DEF-002: Consumer login to Admin
echo "--- Testing DEF-002 (Consumer Login to Admin) ---\n";
$request = Illuminate\Http\Request::create('/api/admin/login', 'POST', [
    'email' => 'consumer@example.com',
    'password' => 'password'
]);
$request->headers->set('Accept', 'application/json');
$response = app()->handle($request);
echo "Expected: 403 Forbidden\n";
echo "Actual Status: " . $response->getStatusCode() . "\n";
echo "Response: " . $response->getContent() . "\n\n";

// Test DEF-001: Rate Limiting
echo "--- Testing DEF-001 (Rate Limiting on /api/admin/login) ---\n";
echo "Expected: 422 for first 5 attempts, 429 for the 6th attempt.\n";
for ($i = 1; $i <= 6; $i++) {
    $req = Illuminate\Http\Request::create('/api/admin/login', 'POST', [
        'email' => 'wrong@example.com',
        'password' => 'wrong'
    ]);
    $req->headers->set('Accept', 'application/json');
    $res = app()->handle($req);
    echo "Attempt $i Status: " . $res->getStatusCode() . "\n";
    if ($res->getStatusCode() === 429) {
        echo "Rate Limit Reached!\n";
    }
}
