<?php

namespace Tests\Feature\Api;

use App\Models\Product;
use App\Models\ProductSize;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CartApiTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private Product $product;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create();

        $this->product = Product::factory()->create(['is_active' => true]);
        ProductSize::create([
            'product_id' => $this->product->id,
            'size' => 9,
            'available' => true,
            'quantity' => 10,
        ]);
        ProductSize::create([
            'product_id' => $this->product->id,
            'size' => 10,
            'available' => true,
            'quantity' => 5,
        ]);
    }

    public function test_can_get_empty_cart()
    {
        $response = $this->actingAs($this->user, 'sanctum')->getJson('/api/cart');

        $response->assertSuccessful()
            ->assertJsonPath('data.items', []);
    }

    public function test_can_add_item_to_cart()
    {
        $payload = [
            'product_id' => $this->product->id,
            'size' => 9,
            'quantity' => 2,
        ];

        $response = $this->actingAs($this->user, 'sanctum')->postJson('/api/cart/items', $payload);

        $response->assertStatus(201)
            ->assertJsonPath('data.productId', $this->product->id)
            ->assertJsonPath('data.quantity', 2);

        $this->assertDatabaseHas('cart_items', [
            'product_id' => $this->product->id,
            'size' => 9,
            'quantity' => 2,
        ]);
    }

    public function test_cannot_add_item_with_insufficient_stock()
    {
        $payload = [
            'product_id' => $this->product->id,
            'size' => 10,
            'quantity' => 10, // Only 5 in stock
        ];

        $response = $this->actingAs($this->user, 'sanctum')->postJson('/api/cart/items', $payload);

        $response->assertStatus(422);
    }

    public function test_can_update_item_quantity()
    {
        // Add item first
        $itemResponse = $this->actingAs($this->user, 'sanctum')->postJson('/api/cart/items', [
            'product_id' => $this->product->id,
            'size' => 9,
            'quantity' => 1,
        ]);

        $cartItemId = $itemResponse->json('data.id');

        // Update quantity
        $response = $this->actingAs($this->user, 'sanctum')->putJson('/api/cart/items/' . $cartItemId, [
            'quantity' => 3
        ]);

        $response->assertStatus(204);

        $this->assertDatabaseHas('cart_items', [
            'id' => $cartItemId,
            'quantity' => 3,
        ]);
    }

    public function test_can_remove_item()
    {
        // Add item first
        $itemResponse = $this->actingAs($this->user, 'sanctum')->postJson('/api/cart/items', [
            'product_id' => $this->product->id,
            'size' => 9,
            'quantity' => 1,
        ]);

        $cartItemId = $itemResponse->json('data.id');

        // Remove item
        $response = $this->actingAs($this->user, 'sanctum')->deleteJson('/api/cart/items/' . $cartItemId);

        $response->assertStatus(204);

        $this->assertDatabaseMissing('cart_items', [
            'id' => $cartItemId,
        ]);
    }

    public function test_can_sync_local_cart()
    {
        $payload = [
            'items' => [
                [
                    'product_id' => $this->product->id,
                    'size' => 9,
                    'quantity' => 2,
                ],
                [
                    'product_id' => $this->product->id,
                    'size' => 10,
                    'quantity' => 1,
                ]
            ]
        ];

        $response = $this->actingAs($this->user, 'sanctum')->postJson('/api/cart/sync', $payload);

        $response->assertStatus(200)
            ->assertJsonCount(2, 'data.items');

        $this->assertDatabaseHas('cart_items', [
            'product_id' => $this->product->id,
            'size' => 9,
            'quantity' => 2,
        ]);
        $this->assertDatabaseHas('cart_items', [
            'product_id' => $this->product->id,
            'size' => 10,
            'quantity' => 1,
        ]);
    }
}
