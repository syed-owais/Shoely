## TESTING STRATEGY

### 1. Feature Tests

```php
// tests/Feature/Order/CreateOrderTest.php
class CreateOrderTest extends TestCase
{
    use RefreshDatabase;
    
    public function test_user_can_create_order_with_valid_cart()
    {
        $user = User::factory()->create();
        $product = Product::factory()->create(['stock_quantity' => 10]);
        
        $this->actingAs($user)
            ->postJson('/api/v1/orders', [
                'items' => [
                    ['product_id' => $product->id, 'quantity' => 2]
                ],
                'payment_method' => 'cod',
                'shipping_address' => [
                    'name' => 'John Doe',
                    'phone' => '03001234567',
                    'address' => '123 Main St',
                    'city' => 'Karachi'
                ]
            ])
            ->assertStatus(201)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'order_number',
                    'status',
                    'total'
                ]
            ]);
        
        $this->assertDatabaseHas('orders', [
            'user_id' => $user->id,
            'status' => 'pending'
        ]);
    }
    
    public function test_cannot_create_order_with_insufficient_stock()
    {
        $user = User::factory()->create();
        $product = Product::factory()->create(['stock_quantity' => 1]);
        
        $this->actingAs($user)
            ->postJson('/api/v1/orders', [
                'items' => [
                    ['product_id' => $product->id, 'quantity' => 5]
                ],
                'payment_method' => 'cod'
            ])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['items.0.quantity']);
    }
}
```

### 2. Unit Tests

```php
// tests/Unit/Actions/AddToCartActionTest.php
class AddToCartActionTest extends TestCase
{
    use RefreshDatabase;
    
    public function test_adds_product_to_cart()
    {
        $user = User::factory()->create();
        $product = Product::factory()->create(['stock_quantity' => 10]);
        
        $action = app(AddToCartAction::class);
        $cart = $action->execute($user->id, $product->id, 2);
        
        $this->assertInstanceOf(Cart::class, $cart);
        $this->assertEquals(2, $cart->items->first()->quantity);
        $this->assertEquals($product->id, $cart->items->first()->product_id);
    }
    
    public function test_throws_exception_for_insufficient_stock()
    {
        $this->expectException(InsufficientStockException::class);
        
        $user = User::factory()->create();
        $product = Product::factory()->create(['stock_quantity' => 1]);
        
        $action = app(AddToCartAction::class);
        $action->execute($user->id, $product->id, 5);
    }
}
```

### 3. Integration Tests

```php
// tests/Integration/Payment/JazzCashPaymentTest.php
class JazzCashPaymentTest extends TestCase
{
    use RefreshDatabase;
    
    public function test_processes_payment_successfully()
    {
        Http::fake([
            'jazzcash.com/*' => Http::response([
                'status' => 'success',
                'transaction_id' => 'TXN123456'
            ], 200)
        ]);
        
        $order = Order::factory()->create([
            'total' => 5000,
            'payment_method' => 'jazzcash'
        ]);
        
        $gateway = new JazzCashGateway();
        $result = $gateway->charge(new Money(5000), ['order_id' => $order->id]);
        
        $this->assertTrue($result->isSuccessful());
        $this->assertEquals('TXN123456', $result->transactionId());
    }
}
```

---


