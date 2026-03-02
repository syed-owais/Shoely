<?php

namespace Database\Seeders;

use App\Models\PromoCode;
use Illuminate\Database\Seeder;

class PromoCodeSeeder extends Seeder
{
    public function run(): void
    {
        PromoCode::create([
            'code' => 'WELCOME10',
            'type' => 'percentage',
            'value' => 10,
            'min_order_amount' => 100,
            'max_discount' => null,
            'usage_limit' => 100,
            'usage_count' => 23,
            'start_date' => now(),
            'end_date' => now()->addDays(30),
            'is_active' => true,
            'description' => '10% off your first order over $100',
        ]);

        PromoCode::create([
            'code' => 'SUMMER25',
            'type' => 'percentage',
            'value' => 25,
            'min_order_amount' => null,
            'max_discount' => 100,
            'usage_limit' => 50,
            'usage_count' => 12,
            'start_date' => now(),
            'end_date' => now()->addDays(14),
            'is_active' => true,
            'description' => 'Summer sale - 25% off (max $100 discount)',
        ]);
    }
}
