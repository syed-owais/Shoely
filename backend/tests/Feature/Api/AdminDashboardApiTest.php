<?php

namespace Tests\Feature\Api;

use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminDashboardApiTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private User $customer;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create(['role' => 'admin']);
        $this->customer = User::factory()->create(['role' => 'customer']);
    }

    public function test_admin_can_view_dashboard_stats()
    {
        // Setup stats data
        Product::factory()->count(10)->create(['is_active' => true]);

        $order1 = Order::factory()->create([
            'user_id' => $this->customer->id,
            'total' => 150,
            'status' => 'delivered'
        ]);

        $order2 = Order::factory()->create([
            'user_id' => $this->customer->id,
            'total' => 100,
            'status' => 'pending'
        ]);

        // Cancelled order should not be counted
        Order::factory()->create([
            'user_id' => $this->customer->id,
            'total' => 500,
            'status' => 'cancelled'
        ]);

        $response = $this->actingAs($this->admin, 'sanctum')->getJson('/api/admin/dashboard/stats');

        $response->assertStatus(200)
            ->assertJsonPath('data.summary.totalSales', 250) // 150 + 100
            ->assertJsonPath('data.summary.totalOrders', 2)
            ->assertJsonPath('data.summary.totalCustomers', 1)
            ->assertJsonPath('data.summary.totalProducts', 10)
            ->assertJsonPath('data.summary.totalPendingOrders', 1);

        // Check recent orders
        $response->assertJsonCount(3, 'data.recentOrders');
    }

    public function test_customer_cannot_view_dashboard_stats()
    {
        $response = $this->actingAs($this->customer, 'sanctum')->getJson('/api/admin/dashboard/stats');
        $response->assertStatus(403);
    }
}
