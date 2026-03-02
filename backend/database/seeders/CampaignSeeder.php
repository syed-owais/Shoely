<?php

namespace Database\Seeders;

use App\Models\Campaign;
use Illuminate\Database\Seeder;

class CampaignSeeder extends Seeder
{
    public function run(): void
    {
        Campaign::create([
            'name' => 'Jordan Week',
            'description' => 'Special discounts on all Jordan sneakers',
            'discount_type' => 'percentage',
            'discount_value' => 15,
            'start_date' => now(),
            'end_date' => now()->addDays(7),
            'is_active' => true,
            'brand' => 'Jordan',
        ]);

        Campaign::create([
            'name' => 'New Arrivals',
            'description' => 'Check out our latest drops',
            'discount_type' => 'fixed',
            'discount_value' => 20,
            'start_date' => now(),
            'end_date' => now()->addDays(30),
            'is_active' => true,
            'tags' => ['new'],
        ]);
    }
}
