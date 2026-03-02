## PROJECT ARCHITECTURE

### Layered Architecture (Recommended for Ecommerce)

```text
┌─────────────────────────────────────┐
│     Presentation Layer              │
│  (Controllers, Resources, Views)    │
├─────────────────────────────────────┤
│     Application Layer               │
│  (Services, Actions, DTOs)          │
├─────────────────────────────────────┤
│     Domain Layer                    │
│  (Models, Repositories, Events)     │
├─────────────────────────────────────┤
│     Infrastructure Layer            │
│  (Payment Gateways, Email, Cache)   │
└─────────────────────────────────────┘
```

### Core Principles

1. **Separation of Concerns** - Each layer has a single responsibility
2. **Dependency Injection** - Use Laravel's container for all dependencies
3. **Repository Pattern** - Abstract database operations
4. **Service Layer** - Business logic lives here, NOT in controllers
5. **Event-Driven** - Use events for decoupled workflows

---


## DIRECTORY STRUCTURE

### Recommended Laravel Ecommerce Structure

```
app/
├── Actions/                          # Single-purpose action classes
│   ├── Cart/
│   │   ├── AddToCartAction.php
│   │   ├── RemoveFromCartAction.php
│   │   └── ClearCartAction.php
│   ├── Order/
│   │   ├── CreateOrderAction.php
│   │   ├── ProcessPaymentAction.php
│   │   └── UpdateOrderStatusAction.php
│   └── Product/
│       ├── CreateProductAction.php
│       └── UpdateInventoryAction.php
│
├── DataTransferObjects/              # DTOs for type-safe data transfer
│   ├── CartItemData.php
│   ├── OrderData.php
│   └── ProductData.php
│
├── Domain/                           # Core business logic
│   ├── Cart/
│   │   ├── Models/
│   │   │   ├── Cart.php
│   │   │   └── CartItem.php
│   │   ├── Repositories/
│   │   │   └── CartRepository.php
│   │   └── Services/
│   │       └── CartService.php
│   ├── Order/
│   │   ├── Models/
│   │   │   ├── Order.php
│   │   │   └── OrderItem.php
│   │   ├── Repositories/
│   │   │   └── OrderRepository.php
│   │   ├── Services/
│   │   │   └── OrderService.php
│   │   └── States/
│   │       ├── OrderState.php
│   │       ├── PendingState.php
│   │       ├── ProcessingState.php
│   │       └── CompletedState.php
│   └── Product/
│       ├── Models/
│       │   ├── Product.php
│       │   ├── Category.php
│       │   └── Variant.php
│       ├── Repositories/
│       │   └── ProductRepository.php
│       └── Services/
│           └── ProductService.php
│
├── Enums/                            # Type-safe enumerations
│   ├── OrderStatus.php
│   ├── PaymentMethod.php
│   └── ProductCondition.php
│
├── Events/                           # Domain events
│   ├── OrderPlaced.php
│   ├── PaymentProcessed.php
│   └── InventoryUpdated.php
│
├── Exceptions/                       # Custom exceptions
│   ├── InsufficientStockException.php
│   ├── PaymentFailedException.php
│   └── InvalidCartException.php
│
├── Http/
│   ├── Controllers/
│   │   ├── Api/
│   │   │   ├── V1/
│   │   │   │   ├── CartController.php
│   │   │   │   ├── OrderController.php
│   │   │   │   └── ProductController.php
│   │   ├── Admin/
│   │   │   ├── DashboardController.php
│   │   │   ├── OrderController.php
│   │   │   └── ProductController.php
│   │   └── Web/
│   │       ├── HomeController.php
│   │       └── CheckoutController.php
│   ├── Middleware/
│   │   ├── CheckInventory.php
│   │   └── ValidateCart.php
│   ├── Requests/
│   │   ├── StoreProductRequest.php
│   │   ├── CreateOrderRequest.php
│   │   └── UpdateCartRequest.php
│   └── Resources/
│       ├── ProductResource.php
│       ├── OrderResource.php
│       └── CartResource.php
│
├── Integrations/                     # Third-party integrations
│   ├── Payment/
│   │   ├── JazzCashGateway.php
│   │   ├── EasypaisaGateway.php
│   │   └── PaymentGatewayInterface.php
│   └── Shipping/
│       ├── TCSCourier.php
│       ├── LeopardCourier.php
│       └── CourierInterface.php
│
├── Jobs/                             # Asynchronous jobs
│   ├── ProcessOrderJob.php
│   ├── SendOrderConfirmationJob.php
│   └── UpdateInventoryJob.php
│
├── Listeners/                        # Event listeners
│   ├── SendOrderNotification.php
│   ├── UpdateProductStock.php
│   └── LogOrderActivity.php
│
├── Mail/                             # Email templates
│   ├── OrderConfirmation.php
│   └── OrderShipped.php
│
├── Notifications/                    # Notification classes
│   ├── OrderPlacedNotification.php
│   └── LowStockAlert.php
│
├── Observers/                        # Model observers
│   ├── OrderObserver.php
│   └── ProductObserver.php
│
├── Policies/                         # Authorization policies
│   ├── OrderPolicy.php
│   └── ProductPolicy.php
│
├── Providers/
│   ├── AppServiceProvider.php
│   ├── EventServiceProvider.php
│   └── RepositoryServiceProvider.php
│
├── Traits/                           # Reusable traits
│   ├── HasInventory.php
│   ├── HasPricing.php
│   └── Searchable.php
│
└── ValueObjects/                     # Immutable value objects
    ├── Money.php
    ├── Address.php
    └── Dimensions.php

config/
├── cart.php
├── payment.php
└── shipping.php

database/
├── factories/
├── migrations/
│   ├── 2024_01_01_create_products_table.php
│   ├── 2024_01_02_create_categories_table.php
│   ├── 2024_01_03_create_orders_table.php
│   └── 2024_01_04_create_order_items_table.php
└── seeders/
    ├── CategorySeeder.php
    ├── ProductSeeder.php
    └── UserSeeder.php

routes/
├── api.php           # API routes (stateless)
├── web.php           # Web routes (stateful)
└── admin.php         # Admin panel routes

tests/
├── Feature/
│   ├── Cart/
│   │   └── AddToCartTest.php
│   ├── Order/
│   │   └── CreateOrderTest.php
│   └── Product/
│       └── ProductListingTest.php
└── Unit/
    ├── Actions/
    │   └── AddToCartActionTest.php
    └── Services/
        └── CartServiceTest.php
```