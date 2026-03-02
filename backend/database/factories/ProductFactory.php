<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class ProductFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name' => fake()->words(3, true),
            'brand' => fake()->randomElement(['Nike', 'Jordan', 'Adidas', 'New Balance']),
            'model' => fake()->word(),
            'price' => fake()->randomFloat(2, 50, 400),
            'images' => ['/hero_jordan1_heritage.jpg'],
            'condition' => fake()->randomElement(['Like New', 'Excellent', 'Very Good', 'Good']),
            'description' => fake()->paragraph(),
            'sku' => strtoupper(Str::random(10)),
            'category' => fake()->randomElement(['Basketball', 'Lifestyle', 'Running']),
            'is_active' => true,
        ];
    }
}
