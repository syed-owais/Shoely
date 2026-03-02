<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class OrderFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'order_number' => 'ORD-' . strtoupper(fake()->lexify('????')) . '-' . fake()->numerify('######'),
            'email' => fake()->safeEmail(),
            'first_name' => fake()->firstName(),
            'last_name' => fake()->lastName(),
            'street' => fake()->streetAddress(),
            'city' => fake()->city(),
            'state' => 'NY',
            'zip_code' => fake()->postcode(),
            'country' => 'USA',
            'subtotal' => 100,
            'shipping' => 15,
            'tax' => 5,
            'discount' => 0,
            'total' => 120,
            'status' => 'pending',
        ];
    }
}
