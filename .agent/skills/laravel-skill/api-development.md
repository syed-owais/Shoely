## API DEVELOPMENT

### RESTful API Structure

```php
// routes/api.php
Route::prefix('v1')->group(function () {
    // Public routes
    Route::get('products', [ProductController::class, 'index']);
    Route::get('products/{slug}', [ProductController::class, 'show']);
    Route::get('categories', [CategoryController::class, 'index']);
    
    // Authenticated routes
    Route::middleware('auth:sanctum')->group(function () {
        // Cart
        Route::post('cart/items', [CartController::class, 'addItem']);
        Route::delete('cart/items/{item}', [CartController::class, 'removeItem']);
        Route::get('cart', [CartController::class, 'show']);
        
        // Orders
        Route::post('orders', [OrderController::class, 'store']);
        Route::get('orders', [OrderController::class, 'index']);
        Route::get('orders/{order}', [OrderController::class, 'show']);
        
        // Wishlist
        Route::post('wishlist', [WishlistController::class, 'add']);
        Route::delete('wishlist/{product}', [WishlistController::class, 'remove']);
    });
    
    // Admin routes
    Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
        Route::apiResource('products', Admin\ProductController::class);
        Route::apiResource('orders', Admin\OrderController::class)->only(['index', 'show', 'update']);
        Route::post('orders/{order}/ship', [Admin\OrderController::class, 'ship']);
    });
});
```

### API Controller Best Practices

```php
class ProductController extends Controller
{
    public function __construct(
        private ProductRepository $productRepository
    ) {}
    
    public function index(Request $request): JsonResponse
    {
        $products = $this->productRepository->paginate(
            perPage: $request->input('per_page', 15),
            filters: $request->only(['category', 'condition', 'min_price', 'max_price']),
            sort: $request->input('sort', 'created_at'),
            order: $request->input('order', 'desc')
        );
        
        return ProductResource::collection($products)
            ->response()
            ->setStatusCode(200);
    }
    
    public function show(string $slug): JsonResponse
    {
        $product = $this->productRepository->findBySlug($slug);
        
        return (new ProductResource($product))
            ->response()
            ->setStatusCode(200);
    }
}
```

### API Resources (Data Transfer)

```php
class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'price' => [
                'base' => $this->base_price,
                'sale' => $this->sale_price,
                'formatted' => $this->formatted_price,
                'currency' => 'PKR',
            ],
            'sku' => $this->sku,
            'stock' => [
                'quantity' => $this->stock_quantity,
                'in_stock' => $this->stock_quantity > 0,
            ],
            'condition' => $this->condition,
            'category' => new CategoryResource($this->whenLoaded('category')),
            'variants' => VariantResource::collection($this->whenLoaded('variants')),
            'images' => ImageResource::collection($this->whenLoaded('images')),
            'is_active' => $this->is_active,
            'published_at' => $this->published_at?->toIso8601String(),
            'created_at' => $this->created_at->toIso8601String(),
            'updated_at' => $this->updated_at->toIso8601String(),
        ];
    }
}
```

### API Versioning

```php
// routes/api.php
Route::prefix('v1')->namespace('App\Http\Controllers\Api\V1')->group(function () {
    // V1 routes
});

Route::prefix('v2')->namespace('App\Http\Controllers\Api\V2')->group(function () {
    // V2 routes with breaking changes
});

// In controller
class ProductController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        return match ($request->version()) {
            'v1' => $this->indexV1($request),
            'v2' => $this->indexV2($request),
            default => response()->json(['error' => 'Invalid API version'], 400),
        };
    }
}
```

---


