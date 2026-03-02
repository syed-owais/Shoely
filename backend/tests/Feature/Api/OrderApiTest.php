<?php

namespace Tests\Feature\Api;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductSize;
use App\Models\PromoCode;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrderApiTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private User $admin;
    private Product $product;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create(['role' => 'customer']);
        $this->admin = User::factory()->create(['role' => 'admin']);

        $this->product = Product::factory()->create(['price' => 100, 'is_active' => true]);
        ProductSize::create([
            'product_id' => $this->product->id,
            'size' => 9,
            'available' => true,
            'quantity' => 10,
        ]);

        PromoCode::create([
            'code' => 'TEST10',
            'type' => 'fixed',
            'value' => 10,
            'is_active' => true,
            'start_date' => now(),
            'end_date' => now()->addYear(),
        ]);
    }

    private function fillCart()
    {
        $cart = Cart::create(['user_id' => $this->user->id]);
        CartItem::create([
            'cart_id' => $cart->id,
            'product_id' => $this->product->id,
            'size' => 9,
            'quantity' => 2,
        ]);
    }

    public function test_can_checkout_cart()
    {
        $this->fillCart();

        $payload = [
            'email' => $this->user->email,
            'first_name' => 'John',
            'last_name' => 'Doe',
            'address' => '123 Main St',
            'city' => 'Anytown',
            'zip_code' => '12345',
            'payment_method' => 'credit_card',
            'shipping_method' => 'standard',
            'promo_code' => 'TEST10',
        ];

        // 2 items @ $100 = $200. Discount = $10. Shipping = $0 (over $150). Tax = ($190) * 0.05 = 9.5. Total = 199.5.
        $response = $this->actingAs($this->user, 'sanctum')->postJson('/api/orders/checkout', $payload);

        $response->assertStatus(201)
            ->assertJsonPath('data.financials.subtotal', 200)
            ->assertJsonPath('data.financials.discount', 10)
            ->assertJsonPath('data.financials.totalAmount', 199.5);

        $this->assertDatabaseHas('orders', [
            'user_id' => $this->user->id,
            'total' => 199.5,
        ]);

        $this->assertDatabaseHas('order_items', [
            'product_id' => $this->product->id,
            'quantity' => 2,
        ]);

        // Cart should be empty
        $this->assertDatabaseMissing('cart_items', [
            'product_id' => $this->product->id,
        ]);

        // Stock should be deducted
        $this->assertDatabaseHas('product_sizes', [
            'product_id' => $this->product->id,
            'size' => 9,
            'quantity' => 8, // 10 - 2
        ]);

        // Promo code usage updated
        $this->assertDatabaseHas('promo_codes', [
            'code' => 'TEST10',
            'usage_count' => 1,
        ]);
    }

    public function test_can_list_consumer_orders()
    {
        Order::factory()->create(['user_id' => $this->user->id]);
        Order::factory()->create(['user_id' => $this->user->id]);

        $response = $this->actingAs($this->user, 'sanctum')->getJson('/api/orders');

        $response->assertStatus(200)
            ->assertJsonCount(2, 'data');
    }

    public function test_can_track_order_without_auth()
    {
        $order = Order::factory()->create([
            'email' => 'test@example.com',
        ]);

        $response = $this->postJson('/api/orders/track/' . $order->order_number, [
            'email' => 'test@example.com'
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.id', $order->id);
    }

    public function test_admin_can_update_order_status()
    {
        $order = Order::factory()->create(['status' => 'pending']);

        $response = $this->actingAs($this->admin, 'sanctum')->putJson('/api/admin/orders/' . $order->id . '/status', [
            'status' => 'shipped',
            'tracking_number' => 'TRK123456',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.status', 'shipped')
            ->assertJsonPath('data.tracking.number', 'TRK123456');

        $this->assertDatabaseHas('orders', [
            'id' => $order->id,
            'status' => 'shipped',
            'tracking_number' => 'TRK123456',
        ]);
    }
}
