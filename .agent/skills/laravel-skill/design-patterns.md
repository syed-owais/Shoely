## DESIGN PATTERNS

### 1. Repository Pattern

```php
// Interface
interface ProductRepositoryInterface
{
    public function all(): Collection;
    public function find(int $id): ?Product;
    public function findBySlug(string $slug): ?Product;
    public function create(array $data): Product;
    public function update(int $id, array $data): bool;
    public function delete(int $id): bool;
    public function searchByName(string $query): Collection;
}

// Implementation
class EloquentProductRepository implements ProductRepositoryInterface
{
    public function all(): Collection
    {
        return Product::with(['category', 'images'])->get();
    }
    
    public function find(int $id): ?Product
    {
        return Product::with(['category', 'variants'])->find($id);
    }
    
    public function findBySlug(string $slug): ?Product
    {
        return Product::where('slug', $slug)->firstOrFail();
    }
    
    public function create(array $data): Product
    {
        return Product::create($data);
    }
    
    public function update(int $id, array $data): bool
    {
        return Product::where('id', $id)->update($data);
    }
    
    public function delete(int $id): bool
    {
        return Product::destroy($id);
    }
    
    public function searchByName(string $query): Collection
    {
        return Product::where('name', 'LIKE', "%{$query}%")
            ->orWhere('description', 'LIKE', "%{$query}%")
            ->get();
    }
}

// Register in Service Provider
class RepositoryServiceProvider extends ServiceProvider
{
    public function register()
    {
        $this->app->bind(
            ProductRepositoryInterface::class,
            EloquentProductRepository::class
        );
    }
}
```

### 2. Service Layer Pattern

```php
class CartService
{
    public function __construct(
        private CartRepository $cartRepository,
        private ProductRepository $productRepository
    ) {}
    
    public function addItem(int $userId, int $productId, int $quantity): Cart
    {
        $product = $this->productRepository->find($productId);
        
        if (!$product || $product->stock < $quantity) {
            throw new InsufficientStockException();
        }
        
        $cart = $this->cartRepository->findOrCreateForUser($userId);
        $cart->addItem($product, $quantity);
        
        return $cart;
    }
    
    public function removeItem(int $userId, int $cartItemId): Cart
    {
        $cart = $this->cartRepository->findForUser($userId);
        $cart->removeItem($cartItemId);
        
        return $cart;
    }
    
    public function clear(int $userId): void
    {
        $cart = $this->cartRepository->findForUser($userId);
        $cart->clear();
    }
    
    public function getTotal(int $userId): Money
    {
        $cart = $this->cartRepository->findForUser($userId);
        return $cart->calculateTotal();
    }
}
```

### 3. Factory Pattern

```php
class PaymentGatewayFactory
{
    public static function make(string $gateway): PaymentGatewayInterface
    {
        return match ($gateway) {
            'jazzcash' => new JazzCashGateway(
                config('payment.jazzcash.merchant_id'),
                config('payment.jazzcash.password')
            ),
            'easypaisa' => new EasypaisaGateway(
                config('payment.easypaisa.store_id')
            ),
            'nayapay' => new NayaPayGateway(
                config('payment.nayapay.api_key')
            ),
            'cod' => new CashOnDeliveryGateway(),
            default => throw new InvalidArgumentException("Gateway {$gateway} not supported")
        };
    }
}

// Usage
$gateway = PaymentGatewayFactory::make($order->payment_method);
$result = $gateway->charge(new Money($order->total), [
    'order_id' => $order->id
]);
```

### 4. Strategy Pattern

```php
// Strategy interface
interface PricingStrategyInterface
{
    public function calculate(Product $product, int $quantity): Money;
}

// Concrete strategies
class RegularPricingStrategy implements PricingStrategyInterface
{
    public function calculate(Product $product, int $quantity): Money
    {
        return $product->price->multiply($quantity);
    }
}

class BulkDiscountStrategy implements PricingStrategyInterface
{
    public function calculate(Product $product, int $quantity): Money
    {
        $total = $product->price->multiply($quantity);
        
        if ($quantity >= 10) {
            $total = $total->multiply(0.9); // 10% discount
        }
        
        return $total;
    }
}

class MemberPricingStrategy implements PricingStrategyInterface
{
    public function __construct(private float $discountRate) {}
    
    public function calculate(Product $product, int $quantity): Money
    {
        $total = $product->price->multiply($quantity);
        return $total->multiply(1 - $this->discountRate);
    }
}

// Context
class PricingService
{
    public function __construct(
        private PricingStrategyInterface $strategy
    ) {}
    
    public function setStrategy(PricingStrategyInterface $strategy): void
    {
        $this->strategy = $strategy;
    }
    
    public function calculatePrice(Product $product, int $quantity): Money
    {
        return $this->strategy->calculate($product, $quantity);
    }
}

// Usage
$pricingService = new PricingService(new RegularPricingStrategy());

if ($user->isMember()) {
    $pricingService->setStrategy(new MemberPricingStrategy(0.15));
}

$price = $pricingService->calculatePrice($product, $quantity);
```

### 5. Observer Pattern (Laravel Events)

```php
// Event
class OrderPlaced
{
    public function __construct(public Order $order) {}
}

// Listeners
class SendOrderConfirmationEmail
{
    public function handle(OrderPlaced $event): void
    {
        Mail::to($event->order->user)->send(
            new OrderConfirmation($event->order)
        );
    }
}

class UpdateProductInventory
{
    public function __construct(
        private InventoryService $inventoryService
    ) {}
    
    public function handle(OrderPlaced $event): void
    {
        foreach ($event->order->items as $item) {
            $this->inventoryService->decrement(
                $item->product_id,
                $item->quantity
            );
        }
    }
}

class NotifyAdminOfNewOrder
{
    public function handle(OrderPlaced $event): void
    {
        Notification::route('mail', config('mail.admin_email'))
            ->notify(new NewOrderNotification($event->order));
    }
}

// Register in EventServiceProvider
protected $listen = [
    OrderPlaced::class => [
        SendOrderConfirmationEmail::class,
        UpdateProductInventory::class,
        NotifyAdminOfNewOrder::class,
    ],
];

// Dispatch event
OrderPlaced::dispatch($order);
```

### 6. State Pattern

```php
// State interface
abstract class OrderState
{
    abstract public function process(Order $order): void;
    abstract public function cancel(Order $order): void;
    abstract public function canShip(): bool;
}

// Concrete states
class PendingState extends OrderState
{
    public function process(Order $order): void
    {
        $order->status = 'processing';
        $order->state = new ProcessingState();
        $order->save();
    }
    
    public function cancel(Order $order): void
    {
        $order->status = 'cancelled';
        $order->save();
    }
    
    public function canShip(): bool
    {
        return false;
    }
}

class ProcessingState extends OrderState
{
    public function process(Order $order): void
    {
        $order->status = 'shipped';
        $order->state = new ShippedState();
        $order->save();
    }
    
    public function cancel(Order $order): void
    {
        throw new \Exception('Cannot cancel processing order');
    }
    
    public function canShip(): bool
    {
        return true;
    }
}

class ShippedState extends OrderState
{
    public function process(Order $order): void
    {
        $order->status = 'delivered';
        $order->state = new DeliveredState();
        $order->save();
    }
    
    public function cancel(Order $order): void
    {
        throw new \Exception('Cannot cancel shipped order');
    }
    
    public function canShip(): bool
    {
        return false;
    }
}

// Order model
class Order extends Model
{
    protected $casts = [
        'state' => OrderState::class,
    ];
    
    public function processNext(): void
    {
        $this->state->process($this);
    }
    
    public function cancel(): void
    {
        $this->state->cancel($this);
    }
}

// Usage
$order->processNext(); // Moves to next state
```

### 7. Decorator Pattern

```php
// Base interface
interface ProductPrice
{
    public function getPrice(): Money;
}

// Base implementation
class BaseProductPrice implements ProductPrice
{
    public function __construct(private Product $product) {}
    
    public function getPrice(): Money
    {
        return $product->base_price;
    }
}

// Decorators
class TaxDecorator implements ProductPrice
{
    public function __construct(
        private ProductPrice $productPrice,
        private float $taxRate
    ) {}
    
    public function getPrice(): Money
    {
        $basePrice = $this->productPrice->getPrice();
        $tax = $basePrice->multiply($this->taxRate);
        return $basePrice->add($tax);
    }
}

class DiscountDecorator implements ProductPrice
{
    public function __construct(
        private ProductPrice $productPrice,
        private float $discountPercent
    ) {}
    
    public function getPrice(): Money
    {
        $basePrice = $this->productPrice->getPrice();
        $discount = $basePrice->multiply($this->discountPercent);
        return $basePrice->subtract($discount);
    }
}

// Usage
$price = new BaseProductPrice($product);
$price = new TaxDecorator($price, 0.15); // Add 15% tax
$price = new DiscountDecorator($price, 0.10); // Apply 10% discount

$finalPrice = $price->getPrice();
```

---


