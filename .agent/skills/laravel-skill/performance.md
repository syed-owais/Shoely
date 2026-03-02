## PERFORMANCE OPTIMIZATION

### 1. Database Query Optimization

```php
// ❌ N+1 Problem
$orders = Order::all();
foreach ($orders as $order) {
    echo $order->user->name; // Extra query for each order
}

// ✅ Eager Loading
$orders = Order::with('user')->get();
foreach ($orders as $order) {
    echo $order->user->name; // No extra queries
}

// ✅ Lazy Eager Loading
$orders = Order::all();
$orders->load('user', 'items.product');

// ✅ Relationship Counts
$categories = Category::withCount('products')->get();
```

### 2. Caching Strategies

```php
// Cache product list
$products = Cache::remember('products.featured', 3600, function () {
    return Product::where('is_featured', true)
        ->with('category', 'images')
        ->get();
});

// Cache user cart
$cart = Cache::tags(['cart', "user:{$userId}"])
    ->remember("cart:{$userId}", 600, function () use ($userId) {
        return Cart::where('user_id', $userId)
            ->with('items.product')
            ->first();
    });

// Invalidate cache on update
Cache::tags(['cart', "user:{$userId}"])->flush();

// Cache configuration
// config/cache.php
'default' => env('CACHE_DRIVER', 'redis'),
```

### 3. Queue Long-Running Tasks

```php
// Dispatch jobs to queue
ProcessOrderJob::dispatch($order);
SendOrderConfirmationJob::dispatch($order)->delay(now()->addMinutes(5));

// Job class
class ProcessOrderJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;
    
    public function __construct(public Order $order) {}
    
    public function handle(): void
    {
        // Process payment
        // Update inventory
        // Send notifications
    }
    
    public function failed(Throwable $exception): void
    {
        // Handle job failure
        Log::error('Order processing failed', [
            'order_id' => $this->order->id,
            'error' => $exception->getMessage()
        ]);
    }
}
```

### 4. Database Indexing

```php
// Add indexes in migrations
$table->index('email');
$table->index(['status', 'created_at']);
$table->unique(['user_id', 'product_id']);
$table->fullText(['name', 'description']);

// Composite indexes for common queries
// If you often query: WHERE category_id = X AND is_active = 1
$table->index(['category_id', 'is_active']);
```

### 5. Chunk Large Datasets

```php
// ❌ BAD - Loads everything into memory
$products = Product::all();

// ✅ GOOD - Process in chunks
Product::chunk(100, function ($products) {
    foreach ($products as $product) {
        // Process each product
    }
});

// ✅ BETTER - Use cursor for memory efficiency
foreach (Product::cursor() as $product) {
    // Process one at a time
}
```

---


