<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ProductAttributeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $conditions = ['Like New', 'Excellent', 'Very Good', 'Good'];
        $brands = ['Nike', 'Jordan', 'Adidas', 'New Balance', 'Puma', 'Converse', 'Vans'];
        $categories = ['Lifestyle', 'Basketball', 'Running', 'Skateboarding', 'Casual'];
        $sizes = [6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11, 11.5, 12, 12.5, 13, 14];

        foreach ($conditions as $value) {
            \App\Models\ProductAttribute::updateOrCreate(['type' => 'condition', 'value' => $value]);
        }
        foreach ($brands as $value) {
            \App\Models\ProductAttribute::updateOrCreate(['type' => 'brand', 'value' => $value]);
        }
        foreach ($categories as $value) {
            \App\Models\ProductAttribute::updateOrCreate(['type' => 'category', 'value' => $value]);
        }
        foreach ($sizes as $value) {
            \App\Models\ProductAttribute::updateOrCreate(['type' => 'size', 'value' => (string)$value]);
        }
    }
}
