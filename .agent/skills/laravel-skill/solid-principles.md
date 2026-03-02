## SOLID PRINCIPLES IN LARAVEL

### 1. Single Responsibility Principle (SRP)

**BAD Example:**
```php
class OrderController extends Controller
{
    public function store(Request $request)
    {
        // Validation
        $validated = $request->validate([...]);
        
        // Business logic
        $order = Order::create($validated);
        
        // Payment processing
        $payment = PaymentGateway::charge($order->total);
        
        // Email notification
        Mail::to($order->user)->send(new OrderConfirmation($order));
        
        // Inventory update
        foreach ($order->items as $item) {
            $item->product->decrement('stock', $item->quantity);
        }
        
        return response()->json($order);
    }
}
```

**GOOD Example:**
```php
// Controller - Only handles HTTP
class OrderController extends Controller
{
    public function __construct(
        private CreateOrderAction $createOrderAction
    ) {}
    
    public function store(CreateOrderRequest $request)
    {
        $order = $this->createOrderAction->execute(
            OrderData::fromRequest($request)
        );
        
        return new OrderResource($order);
    }
}

// Action - Single purpose
class CreateOrderAction
{
    public function __construct(
        private OrderService $orderService,
        private PaymentService $paymentService,
        private InventoryService $inventoryService
    ) {}
    
    public function execute(OrderData $data): Order
    {
        DB::beginTransaction();
        
        try {
            $order = $this->orderService->create($data);
            $this->paymentService->process($order);
            $this->inventoryService->reserve($order->items);
            
            OrderPlaced::dispatch($order);
            
            DB::commit();
            return $order;
            
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }
}
```

### 2. Open/Closed Principle (OCP)

**BAD Example:**
```php
class PaymentProcessor
{
    public function process(Order $order, string $method)
    {
        if ($method === 'jazzcash') {
            // JazzCash logic
        } elseif ($method === 'easypaisa') {
            // Easypaisa logic
        } elseif ($method === 'cod') {
            // COD logic
        }
    }
}
```

**GOOD Example:**
```php
// Interface
interface PaymentGatewayInterface
{
    public function charge(Money $amount, array $metadata): PaymentResult;
    public function refund(string $transactionId, Money $amount): PaymentResult;
}

// Implementations
class JazzCashGateway implements PaymentGatewayInterface
{
    public function charge(Money $amount, array $metadata): PaymentResult
    {
        // JazzCash-specific implementation
    }
    
    public function refund(string $transactionId, Money $amount): PaymentResult
    {
        // JazzCash refund logic
    }
}

class EasypaisaGateway implements PaymentGatewayInterface
{
    public function charge(Money $amount, array $metadata): PaymentResult
    {
        // Easypaisa-specific implementation
    }
    
    public function refund(string $transactionId, Money $amount): PaymentResult
    {
        // Easypaisa refund logic
    }
}

// Service
class PaymentService
{
    public function __construct(
        private PaymentGatewayInterface $gateway
    ) {}
    
    public function process(Order $order): PaymentResult
    {
        return $this->gateway->charge(
            new Money($order->total),
            ['order_id' => $order->id]
        );
    }
}

// Binding in Service Provider
class AppServiceProvider extends ServiceProvider
{
    public function register()
    {
        $this->app->bind(
            PaymentGatewayInterface::class,
            fn() => match (config('payment.default')) {
                'jazzcash' => new JazzCashGateway(),
                'easypaisa' => new EasypaisaGateway(),
                default => throw new \Exception('Invalid gateway')
            }
        );
    }
}
```

### 3. Liskov Substitution Principle (LSP)

```php
// Base class
abstract class Courier
{
    abstract public function calculateShipping(Order $order): Money;
    abstract public function createShipment(Order $order): string; // Returns tracking number
}

// Implementations must maintain contract
class TCSCourier extends Courier
{
    public function calculateShipping(Order $order): Money
    {
        // TCS pricing logic
        return new Money($amount);
    }
    
    public function createShipment(Order $order): string
    {
        // TCS API call
        return $trackingNumber;
    }
}

class LeopardCourier extends Courier
{
    public function calculateShipping(Order $order): Money
    {
        // Leopard pricing logic
        return new Money($amount);
    }
    
    public function createShipment(Order $order): string
    {
        // Leopard API call
        return $trackingNumber;
    }
}

// Client code works with any courier
class ShippingService
{
    public function __construct(private Courier $courier) {}
    
    public function ship(Order $order): void
    {
        $cost = $this->courier->calculateShipping($order);
        $tracking = $this->courier->createShipment($order);
        
        $order->update([
            'shipping_cost' => $cost->amount(),
            'tracking_number' => $tracking
        ]);
    }
}
```

### 4. Interface Segregation Principle (ISP)

**BAD Example:**
```php
interface ProductInterface
{
    public function getPrice();
    public function getStock();
    public function hasVariants();
    public function getVariants();
    public function isDigital();
    public function getDownloadLink();
}

// Physical products don't need download methods
class PhysicalProduct implements ProductInterface
{
    public function getDownloadLink()
    {
        throw new \Exception('Not applicable');
    }
}
```

**GOOD Example:**
```php
interface HasPrice
{
    public function getPrice(): Money;
}

interface HasInventory
{
    public function getStock(): int;
    public function decrementStock(int $quantity): void;
}

interface HasVariants
{
    public function getVariants(): Collection;
}

interface Downloadable
{
    public function getDownloadLink(): string;
}

// Physical product
class PhysicalProduct implements HasPrice, HasInventory, HasVariants
{
    // Only implements relevant interfaces
}

// Digital product
class DigitalProduct implements HasPrice, Downloadable
{
    // Only implements relevant interfaces
}
```

### 5. Dependency Inversion Principle (DIP)

**BAD Example:**
```php
class OrderService
{
    public function createOrder(array $data): Order
    {
        $order = Order::create($data); // Direct dependency on Eloquent
        
        $emailService = new EmailService(); // Direct instantiation
        $emailService->send($order->user->email, 'Order created');
        
        return $order;
    }
}
```

**GOOD Example:**
```php
// Abstractions
interface OrderRepositoryInterface
{
    public function create(OrderData $data): Order;
    public function find(int $id): ?Order;
}

interface NotificationServiceInterface
{
    public function notify(User $user, string $message): void;
}

// Service depends on abstractions
class OrderService
{
    public function __construct(
        private OrderRepositoryInterface $orderRepository,
        private NotificationServiceInterface $notificationService
    ) {}
    
    public function createOrder(OrderData $data): Order
    {
        $order = $this->orderRepository->create($data);
        
        $this->notificationService->notify(
            $order->user,
            'Your order has been created'
        );
        
        return $order;
    }
}

// Concrete implementations
class EloquentOrderRepository implements OrderRepositoryInterface
{
    public function create(OrderData $data): Order
    {
        return Order::create($data->toArray());
    }
    
    public function find(int $id): ?Order
    {
        return Order::find($id);
    }
}
```

---


