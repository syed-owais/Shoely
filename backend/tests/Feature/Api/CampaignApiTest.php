<?php

namespace Tests\Feature\Api;

use App\Models\Campaign;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CampaignApiTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create(['role' => 'customer']);
        $this->admin = User::factory()->create(['role' => 'admin']);
    }

    public function test_can_list_active_campaigns_publicly()
    {
        Campaign::create([
            'name' => 'Active Campaign',
            'banner_image' => 'https://example.com/img.jpg',
            'discount_type' => 'percentage',
            'discount_value' => 10,
            'start_date' => now()->subDay(),
            'end_date' => now()->addDay(),
            'is_active' => true,
        ]);

        Campaign::create([
            'name' => 'Inactive Campaign',
            'banner_image' => 'https://example.com/img2.jpg',
            'discount_type' => 'fixed',
            'discount_value' => 50,
            'start_date' => now()->subDay(),
            'end_date' => now()->addDay(),
            'is_active' => false,
        ]);

        $response = $this->getJson('/api/campaigns');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.name', 'Active Campaign');
    }

    public function test_admin_can_crud_campaigns()
    {
        $payload = [
            'name' => 'Summer Sale',
            'description' => 'Up to 50% Off',
            'banner_image' => 'https://example.com/banner.jpg',
            'discount_type' => 'percentage',
            'discount_value' => 50,
            'brand' => 'Nike',
            'start_date' => now()->toISOString(),
            'end_date' => now()->addMonth()->toISOString(),
            'is_active' => true,
        ];

        // Create
        $response = $this->actingAs($this->admin, 'sanctum')->postJson('/api/admin/campaigns', $payload);

        $response->assertStatus(201)
            ->assertJsonPath('data.name', 'Summer Sale');

        $campaignId = $response->json('data.id');

        // Read
        $this->actingAs($this->admin, 'sanctum')->getJson('/api/admin/campaigns/' . $campaignId)
            ->assertStatus(200)
            ->assertJsonPath('data.description', 'Up to 50% Off');

        // Update
        $this->actingAs($this->admin, 'sanctum')->putJson('/api/admin/campaigns/' . $campaignId, [
            'brand' => 'Adidas'
        ])->assertStatus(200)
            ->assertJsonPath('data.brand', 'Adidas');

        // List
        $this->actingAs($this->admin, 'sanctum')->getJson('/api/admin/campaigns')
            ->assertStatus(200)
            ->assertJsonCount(1, 'data');

        // Delete
        $this->actingAs($this->admin, 'sanctum')->deleteJson('/api/admin/campaigns/' . $campaignId)
            ->assertStatus(204);

        $this->assertDatabaseMissing('campaigns', ['id' => $campaignId]);
    }

    public function test_customer_cannot_crud_campaigns()
    {
        $response = $this->actingAs($this->user, 'sanctum')->postJson('/api/admin/campaigns', [
            'name' => 'Winter Sale',
            'banner_image' => 'https://example.com/winter.jpg',
            'discount_type' => 'fixed',
            'discount_value' => 20,
            'start_date' => now()->toISOString(),
            'end_date' => now()->addMonth()->toISOString(),
        ]);

        $response->assertStatus(403);
    }
}
