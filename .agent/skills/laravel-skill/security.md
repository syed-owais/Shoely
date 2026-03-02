## SECURITY BEST PRACTICES

### 1. Input Validation

```php
// Use Form Requests
class CreateOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check();
    }
    
    public function rules(): array
    {
        return [
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'exists:products,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1', 'max:10'],
            'shipping_address.name' => ['required', 'string', 'max:255'],
            'shipping_address.phone' => ['required', 'regex:/^03[0-9]{9}$/'], // Pakistani phone
            'shipping_address.address' => ['required', 'string', 'max:500'],
            'shipping_address.city' => ['required', 'string', 'max:100'],
            'payment_method' => ['required', Rule::in(['cod', 'jazzcash', 'easypaisa', 'nayapay'])],
            'coupon_code' => ['nullable', 'exists:coupons,code'],
        ];
    }
    
    public function messages(): array
    {
        return [
            'shipping_address.phone.regex' => 'Please enter a valid Pakistani phone number (03XXXXXXXXX)',
        ];
    }
}
```

### 2. SQL Injection Prevention

```php
// ALWAYS use parameter binding
// ❌ BAD
$products = DB::select("SELECT * FROM products WHERE category = " . $request->category);

// ✅ GOOD
$products = DB::select("SELECT * FROM products WHERE category = ?", [$request->category]);

// ✅ BETTER - Use Eloquent
$products = Product::where('category_id', $request->category)->get();
```

### 3. XSS Prevention

```php
// Laravel automatically escapes in Blade templates
// ✅ GOOD
<p>{{ $product->name }}</p>  // Escaped

// ❌ BAD (only use if you trust the source)
<p>{!! $product->description !!}</p>  // NOT escaped

// Sanitize HTML input
use HTMLPurifier;

$clean = (new HTMLPurifier())->purify($request->description);
```

### 4. CSRF Protection

```php
// Enabled by default in Laravel
// For API, use Sanctum tokens

// Blade forms automatically include CSRF
<form method="POST" action="/orders">
    @csrf
    <!-- form fields -->
</form>

// For AJAX requests
$.ajaxSetup({
    headers: {
        'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
    }
});
```

### 5. Rate Limiting

```php
// routes/api.php
Route::middleware('throttle:60,1')->group(function () {
    Route::get('products', [ProductController::class, 'index']);
});

// Custom rate limit for specific routes
Route::middleware('throttle:orders')->group(function () {
    Route::post('orders', [OrderController::class, 'store']);
});

// In RouteServiceProvider
protected function configureRateLimiting()
{
    RateLimiter::for('orders', function (Request $request) {
        return $request->user()
            ? Limit::perHour(10)->by($request->user()->id)
            : Limit::perHour(3)->by($request->ip());
    });
}
```

### 6. Authentication & Authorization

```php
// Use Laravel Sanctum for API
// config/sanctum.php
'expiration' => 60 * 24, // 24 hours

// Login
$token = $user->createToken('auth-token')->plainTextToken;

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Authenticated routes
});

// Authorization with Policies
class OrderPolicy
{
    public function view(User $user, Order $order): bool
    {
        return $user->id === $order->user_id || $user->isAdmin();
    }
    
    public function cancel(User $user, Order $order): bool
    {
        return $user->id === $order->user_id 
            && $order->status === 'pending';
    }
}

// In controller
$this->authorize('view', $order);
$this->authorize('cancel', $order);
```

### 7. Sensitive Data Protection

```php
// Never log sensitive data
Log::info('Order created', [
    'order_id' => $order->id,
    'user_id' => $order->user_id,
    // DON'T log: payment details, passwords, tokens
]);

// Use encryption for sensitive fields
use Illuminate\Database\Eloquent\Casts\Encrypted;

class User extends Model
{
    protected $casts = [
        'card_number' => Encrypted::class,
    ];
}

// Environment variables
// .env
PAYMENT_JAZZCASH_SECRET=xxxxx
PAYMENT_EASYPAISA_KEY=xxxxx

// Never commit .env to Git
// Add to .gitignore
.env
.env.local
```

---


