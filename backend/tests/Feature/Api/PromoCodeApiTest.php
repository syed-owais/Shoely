<?php

namespace Tests\Feature\Api;

use App\Models\PromoCode;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PromoCodeApiTest extends TestCase
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

    public function test_can_validate_active_promo_code()
    {
        PromoCode::create([
            'code' => 'TEST10',
            'type' => 'fixed',
            'value' => 10,
            'is_active' => true,
            'start_date' => now()->subDay(),
            'end_date' => now()->addDay(),
        ]);

        $response = $this->actingAs($this->user, 'sanctum')->postJson('/api/promo-codes/validate', [
            'code' => 'TEST10',
            'subtotal' => 100,
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('valid', true)
            ->assertJsonPath('discount', 10);
    }

    public function test_cannot_validate_expired_promo_code()
    {
        PromoCode::create([
            'code' => 'OLDTEST',
            'type' => 'percentage',
            'value' => 10,
            'is_active' => true,
            'start_date' => now()->subDays(10),
            'end_date' => now()->subDays(1),
        ]);

        $response = $this->actingAs($this->user, 'sanctum')->postJson('/api/promo-codes/validate', [
            'code' => 'OLDTEST',
            'subtotal' => 100,
        ]);

        $response->assertStatus(422)
            ->assertJsonPath('valid', false);
    }

    public function test_admin_can_crud_promo_codes()
    {
        $payload = [
            'code' => 'SUMMER2026',
            'type' => 'percentage',
            'value' => 20,
            'start_date' => now()->toISOString(),
            'end_date' => now()->addMonth()->toISOString(),
        ];

        // Create
        $response = $this->actingAs($this->admin, 'sanctum')->postJson('/api/admin/promo-codes', $payload);

        $response->assertStatus(201)
            ->assertJsonPath('data.code', 'SUMMER2026')
            ->assertJsonPath('data.value', 20);

        $promoCodeId = $response->json('data.id');

        // Read
        $this->actingAs($this->admin, 'sanctum')->getJson('/api/admin/promo-codes/' . $promoCodeId)
            ->assertStatus(200);

        // Update
        $this->actingAs($this->admin, 'sanctum')->putJson('/api/admin/promo-codes/' . $promoCodeId, [
            'is_active' => false
        ])->assertStatus(200)
            ->assertJsonPath('data.isActive', false);

        // List
        $this->actingAs($this->admin, 'sanctum')->getJson('/api/admin/promo-codes')
            ->assertStatus(200)
            ->assertJsonCount(1, 'data');

        // Delete
        $this->actingAs($this->admin, 'sanctum')->deleteJson('/api/admin/promo-codes/' . $promoCodeId)
            ->assertStatus(204);

        $this->assertDatabaseMissing('promo_codes', ['id' => $promoCodeId]);
    }

    public function test_customer_cannot_crud_promo_codes()
    {
        $response = $this->actingAs($this->user, 'sanctum')->postJson('/api/admin/promo-codes', [
            'code' => 'WINTER',
            'type' => 'fixed',
            'value' => 50,
            'start_date' => now()->toISOString(),
            'end_date' => now()->addMonth()->toISOString(),
        ]);

        $response->assertStatus(403);
    }
}
