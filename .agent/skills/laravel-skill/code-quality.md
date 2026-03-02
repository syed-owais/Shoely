## CODE QUALITY STANDARDS

### 1. PSR-12 Compliance

```php
<?php

declare(strict_types=1);

namespace App\Domain\Order\Services;

use App\Domain\Order\Models\Order;
use App\Domain\Order\Repositories\OrderRepositoryInterface;
use App\DataTransferObjects\OrderData;

class OrderService
{
    public function __construct(
        private OrderRepositoryInterface $orderRepository,
        private PaymentService $paymentService
    ) {
    }

    public function createOrder(OrderData $data): Order
    {
        // Method implementation
    }
}
```

### 2. Type Declarations

```php
// Always use strict types
declare(strict_types=1);

// Type hint everything
public function calculateTotal(Order $order): Money
{
    $total = new Money(0);
    
    foreach ($order->items as $item) {
        $total = $total->add($item->subtotal);
    }
    
    return $total;
}

// Use return types
public function findProduct(int $id): ?Product
{
    return Product::find($id);
}
```

### 3. Documentation

```php
/**
 * Create a new order from cart items
 *
 * @param OrderData $data The order data transfer object
 * @return Order The created order model
 * @throws InsufficientStockException If any product is out of stock
 * @throws PaymentFailedException If payment processing fails
 */
public function createOrder(OrderData $data): Order
{
    // Implementation
}
```

### 4. Code Analysis Tools

```bash
# Install tools
composer require --dev phpstan/phpstan
composer require --dev squizlabs/php_codesniffer
composer require --dev friendsofphp/php-cs-fixer

# Run analysis
./vendor/bin/phpstan analyse app
./vendor/bin/phpcs app
./vendor/bin/php-cs-fixer fix app

# Add to composer.json
"scripts": {
    "analyse": "phpstan analyse",
    "format": "php-cs-fixer fix",
    "test": "php artisan test"
}
```

---


