## CODE QUALITY STANDARDS

### 1. PSR-12 Compliance

```php
<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Order;

class OrderCheckoutService
{
    // Internal state, private properties  
    // Static initializer, fetch, set, validate, calculate, create, build methods
}
```

### 2. Service Builder/Chaining Pattern (MANDATORY)

All services MUST follow the builder/chaining pattern for any workflow with multiple steps.
Each service should use this consistent structure:

```php
class OrderCheckoutService
{
    // ── Internal state ─────────────────────
    private ?User $user = null;
    private Collection $items;
    private ?Order $order = null;

    // ── Static initializer ────────────────
    public static function init(Request $request, ?User $user = null): static
    {
        $service = new static();
        $service->user = $user;
        $service->data = $request->validated();
        return $service;
    }

    // ── fetch*() — retrieve required data ──
    public function fetchCart(): static { /* ... */ return $this; }
    public function fetchProducts(): static { /* ... */ return $this; }

    // ── set*() — prepare internal state ────
    public function setQuantity(int $qty): static { /* ... */ return $this; }

    // ── validation() — business rules ──────
    public function validation(): static { /* stock checks, promo codes */ return $this; }

    // ── calculate*() — totals, fees ────────
    public function calculateTotals(): static { /* ... */ return $this; }

    // ── Transaction wrappers ───────────────
    public function beginTransaction(): static { DB::beginTransaction(); return $this; }
    public function commitTransaction(): static { DB::commit(); return $this; }

    // ── create*()/update*() — persistence ──
    public function createOrder(): static { /* ... */ return $this; }

    // ── dispatchEvents() — fire events ─────
    public function dispatchEvents(): static { event(new OrderPlacedEvent($this->order)); return $this; }

    // ── build() — finalize and return ──────
    public function build(): Order { return $this->order; }
}
```

**Controller usage (thin, one-liner chain):**

```php
public function checkout(StoreOrderRequest $request): JsonResponse
{
    $order = OrderCheckoutService::init($request, $request->user())
        ->fetchCart()
        ->fetchProducts()
        ->calculateTotals()
        ->beginTransaction()
        ->validation()
        ->createOrder()
        ->deductStock()
        ->clearCart()
        ->commitTransaction()
        ->dispatchEvents()
        ->build();

    return RestAPI::response(new OrderResource($order), true, 'Order placed successfully');
}
```

**Rules:**
- Every chained method returns `static` (for `$this` chaining)
- `init()` is always a `static` factory method
- `build()` returns the final result (model, DTO, etc.)
- Simple reads (queries) stay as `static` methods — no builder needed
- Each method should be 5–15 lines, single-responsibility
- Services are domain-specific (e.g., `OrderCheckoutService`, `OrderStatusService`)

### 3. Naming Conventions (MANDATORY)

| Type | Suffix | Example |
|------|--------|---------|
| Event | `Event` | `OrderPlacedEvent` |
| Listener | `Listener` | `SendOrderConfirmationListener` |
| Service | `Service` | `OrderCheckoutService` |
| Controller | `Controller` | `OrderController` |
| Request | `Request` | `StoreOrderRequest` |
| Resource | `Resource` | `OrderResource` |
| Mailable | (descriptive) | `OrderPlaced`, `WelcomeUser` |

### 4. Type Declarations

```php
// Always use strict types
declare(strict_types=1);

// Type hint everything
public function calculateTotal(Order $order): float
{
    return $order->items->sum(fn($item) => $item->price * $item->quantity);
}

// Use return types
public function findProduct(int $id): ?Product
{
    return Product::find($id);
}
```

### 5. Event-Driven Architecture

- Never call `Mail::to()->send()` directly from services or controllers
- Always dispatch domain events: `event(new OrderPlacedEvent($order))`
- Listeners implement `ShouldQueue` for async processing
- Register events in `EventServiceProvider`

### 6. Controller Rules

- Controllers must be THIN — delegate all logic to services
- Maximum 3–5 lines per controller method
- Use Form Requests for validation (never inline `$request->validate()` for complex rules)
- Return responses via `RestAPI::response()`

### 7. Code Analysis Tools

```bash
# Install tools
composer require --dev phpstan/phpstan
composer require --dev squizlabs/php_codesniffer

# Run analysis
./vendor/bin/phpstan analyse app
./vendor/bin/phpcs app
```

---
