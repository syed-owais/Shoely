<?php

namespace Tests\Feature\Api;

use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProductApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_list_active_products()
    {
        Product::factory()->count(3)->create(['is_active' => true]);
        Product::factory()->count(2)->create(['is_active' => false]);

        $response = $this->getJson('/api/products');
        $response->assertStatus(200)
            ->assertJsonCount(3, 'data');
    }

    public function test_can_get_single_active_product()
    {
        $product = Product::factory()->create(['is_active' => true]);

        $response = $this->getJson('/api/products/' . $product->id);

        $response->assertStatus(200)
            ->assertJsonPath('data.id', $product->id);
    }

    public function test_cannot_get_inactive_product()
    {
        $product = Product::factory()->create(['is_active' => false]);

        $response = $this->getJson('/api/products/' . $product->id);

        $response->assertStatus(404);
    }

    public function test_admin_can_create_product()
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $payload = [
            'name' => 'Test Product',
            'brand' => 'Nike',
            'model' => 'Air Max',
            'price' => 120.50,
            'condition' => 'Like New',
            'sku' => 'TEST-001',
            'category' => 'Running',
            'is_active' => true,
            'sizes' => [
                ['size' => 9, 'available' => true, 'quantity' => 5],
                ['size' => 10, 'available' => true, 'quantity' => 2],
            ]
        ];

        $response = $this->actingAs($admin, 'sanctum')->postJson('/api/admin/products', $payload);

        $response->assertStatus(201)
            ->assertJsonPath('data.name', 'Test Product')
            ->assertJsonPath('data.sku', 'TEST-001');

        $this->assertDatabaseHas('products', ['sku' => 'TEST-001']);
        $this->assertDatabaseHas('product_sizes', ['size' => 9, 'quantity' => 5]);
    }

    public function test_customer_cannot_create_product()
    {
        $customer = User::factory()->create(['role' => 'customer']);

        $response = $this->actingAs($customer, 'sanctum')->postJson('/api/admin/products', [
            'name' => 'Test',
            'price' => 100,
        ]);

        $response->assertStatus(403);
    }
}
