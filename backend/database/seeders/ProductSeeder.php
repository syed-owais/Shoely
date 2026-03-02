<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\ProductSize;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $products = [
            [
                'name' => 'Air Jordan 1 High Heritage',
                'brand' => 'Jordan',
                'model' => 'Air Jordan 1',
                'price' => 285.00,
                'original_price' => 350.00,
                'images' => ['/hero_jordan1_heritage.jpg'],
                'condition' => 'Like New',
                'description' => 'The Air Jordan 1 High Heritage features a classic Chicago-inspired colorway with premium leather construction.',
                'features' => ['Premium leather upper', 'Air-Sole unit', 'Rubber outsole', 'Classic high-top design'],
                'sku' => 'AJ1-HH-2023',
                'category' => 'Basketball',
                'tags' => ['jordan', 'high-top', 'heritage', 'chicago'],
                'sizes' => [
                    ['size' => 7, 'available' => true, 'quantity' => 2],
                    ['size' => 8, 'available' => true, 'quantity' => 5],
                    ['size' => 8.5, 'available' => true, 'quantity' => 3],
                    ['size' => 9, 'available' => true, 'quantity' => 4],
                    ['size' => 9.5, 'available' => true, 'quantity' => 2],
                    ['size' => 10, 'available' => true, 'quantity' => 6],
                    ['size' => 11, 'available' => true, 'quantity' => 3],
                ],
            ],
            [
                'name' => 'Dunk Low Pink',
                'brand' => 'Nike',
                'model' => 'Dunk Low',
                'price' => 145.00,
                'original_price' => 180.00,
                'images' => ['/dunk_low_pink.jpg'],
                'condition' => 'Like New',
                'description' => 'The Nike Dunk Low in Pink features a smooth leather upper with a clean two-tone colorway.',
                'features' => ['Leather upper', 'Foam midsole', 'Rubber outsole', 'Low-top silhouette'],
                'sku' => 'NK-DL-PINK',
                'category' => 'Lifestyle',
                'tags' => ['nike', 'dunk', 'pink', 'low-top'],
                'sizes' => [
                    ['size' => 6, 'available' => true, 'quantity' => 3],
                    ['size' => 6.5, 'available' => true, 'quantity' => 2],
                    ['size' => 7, 'available' => true, 'quantity' => 5],
                    ['size' => 7.5, 'available' => true, 'quantity' => 4],
                    ['size' => 8, 'available' => true, 'quantity' => 6],
                    ['size' => 8.5, 'available' => true, 'quantity' => 3],
                    ['size' => 9, 'available' => true, 'quantity' => 4],
                ],
            ],
            [
                'name' => 'Yeezy Boost 350 Zebra',
                'brand' => 'Adidas',
                'model' => 'Yeezy Boost 350',
                'price' => 320.00,
                'original_price' => 400.00,
                'images' => ['/yeezy_zebra.jpg'],
                'condition' => 'Excellent',
                'description' => 'The Adidas Yeezy Boost 350 Zebra features the iconic black and white Primeknit pattern.',
                'features' => ['Primeknit upper', 'Boost cushioning', 'Rubber outsole', 'Sock-like fit'],
                'sku' => 'AD-YZ-ZEBRA',
                'category' => 'Lifestyle',
                'tags' => ['adidas', 'yeezy', 'zebra', 'boost'],
                'sizes' => [
                    ['size' => 7, 'available' => true, 'quantity' => 2],
                    ['size' => 8, 'available' => true, 'quantity' => 3],
                    ['size' => 9, 'available' => true, 'quantity' => 4],
                    ['size' => 10, 'available' => true, 'quantity' => 5],
                    ['size' => 11, 'available' => true, 'quantity' => 3],
                    ['size' => 12, 'available' => true, 'quantity' => 2],
                    ['size' => 13, 'available' => true, 'quantity' => 1],
                ],
            ],
            [
                'name' => 'Air Force 1 Low White',
                'brand' => 'Nike',
                'model' => 'Air Force 1',
                'price' => 95.00,
                'original_price' => 120.00,
                'images' => ['/af1_white.jpg'],
                'condition' => 'Like New',
                'description' => 'The iconic Nike Air Force 1 Low in all white. A timeless classic for any collection.',
                'features' => ['Leather upper', 'Air-Sole unit', 'Rubber outsole', 'Perforated toe box'],
                'sku' => 'NK-AF1-WHITE',
                'category' => 'Lifestyle',
                'tags' => ['nike', 'air force 1', 'white', 'classic'],
                'sizes' => [
                    ['size' => 6, 'available' => true, 'quantity' => 8],
                    ['size' => 7, 'available' => true, 'quantity' => 10],
                    ['size' => 8, 'available' => true, 'quantity' => 12],
                    ['size' => 9, 'available' => true, 'quantity' => 15],
                    ['size' => 10, 'available' => true, 'quantity' => 10],
                    ['size' => 11, 'available' => true, 'quantity' => 8],
                    ['size' => 12, 'available' => true, 'quantity' => 6],
                    ['size' => 13, 'available' => true, 'quantity' => 4],
                ],
            ],
            [
                'name' => 'Jordan 1 Mid Grey',
                'brand' => 'Jordan',
                'model' => 'Air Jordan 1',
                'price' => 165.00,
                'original_price' => 200.00,
                'images' => ['/jordan1_mid_grey.jpg'],
                'condition' => 'Excellent',
                'description' => 'The Air Jordan 1 Mid in Grey features a premium canvas and suede construction.',
                'features' => ['Canvas and suede upper', 'Air-Sole unit', 'Rubber outsole', 'Mid-top design'],
                'sku' => 'AJ1-MID-GREY',
                'category' => 'Basketball',
                'tags' => ['jordan', 'mid', 'grey', 'canvas'],
                'sizes' => [
                    ['size' => 7, 'available' => true, 'quantity' => 3],
                    ['size' => 8, 'available' => true, 'quantity' => 4],
                    ['size' => 9, 'available' => true, 'quantity' => 5],
                    ['size' => 10, 'available' => true, 'quantity' => 4],
                    ['size' => 11, 'available' => true, 'quantity' => 3],
                    ['size' => 12, 'available' => true, 'quantity' => 2],
                    ['size' => 13, 'available' => true, 'quantity' => 2],
                    ['size' => 14, 'available' => true, 'quantity' => 1],
                ],
            ],
            [
                'name' => 'New Balance 550 White Green',
                'brand' => 'New Balance',
                'model' => '550',
                'price' => 125.00,
                'original_price' => 150.00,
                'images' => ['/nb_550_white_green.jpg'],
                'condition' => 'Like New',
                'description' => 'The New Balance 550 in White and Green brings vintage basketball style to the modern era.',
                'features' => ['Leather upper', 'EVA midsole', 'Rubber outsole', 'Vintage design'],
                'sku' => 'NB-550-WG',
                'category' => 'Basketball',
                'tags' => ['new balance', '550', 'green', 'vintage'],
                'sizes' => [
                    ['size' => 7, 'available' => true, 'quantity' => 4],
                    ['size' => 8, 'available' => true, 'quantity' => 5],
                    ['size' => 9, 'available' => true, 'quantity' => 6],
                    ['size' => 10, 'available' => true, 'quantity' => 5],
                    ['size' => 11, 'available' => true, 'quantity' => 4],
                    ['size' => 12, 'available' => true, 'quantity' => 3],
                ],
            ],
            [
                'name' => 'Dunk Low Panda',
                'brand' => 'Nike',
                'model' => 'Dunk Low',
                'price' => 145.00,
                'original_price' => 180.00,
                'images' => ['/grid_dunk_panda.jpg'],
                'condition' => 'Like New',
                'description' => 'The Nike Dunk Low Panda features the iconic black and white colorway.',
                'features' => ['Leather upper', 'Foam midsole', 'Rubber outsole', 'Classic colorway'],
                'sku' => 'NK-DL-PANDA',
                'category' => 'Lifestyle',
                'tags' => ['nike', 'dunk', 'panda', 'black white'],
                'sizes' => [
                    ['size' => 7, 'available' => true, 'quantity' => 5],
                    ['size' => 8, 'available' => true, 'quantity' => 6],
                    ['size' => 9, 'available' => true, 'quantity' => 7],
                    ['size' => 10, 'available' => true, 'quantity' => 6],
                    ['size' => 11, 'available' => true, 'quantity' => 5],
                    ['size' => 12, 'available' => true, 'quantity' => 4],
                ],
            ],
            [
                'name' => 'Jordan 4 Retro',
                'brand' => 'Jordan',
                'model' => 'Air Jordan 4',
                'price' => 320.00,
                'original_price' => 400.00,
                'images' => ['/grid_jordan4.jpg'],
                'condition' => 'Excellent',
                'description' => 'The Air Jordan 4 Retro features premium materials and iconic design elements.',
                'features' => ['Leather and mesh upper', 'Air-Sole unit', 'Rubber outsole', 'Iconic wings detail'],
                'sku' => 'AJ4-RETRO',
                'category' => 'Basketball',
                'tags' => ['jordan', 'retro', '4', 'premium'],
                'sizes' => [
                    ['size' => 8, 'available' => true, 'quantity' => 2],
                    ['size' => 8.5, 'available' => true, 'quantity' => 3],
                    ['size' => 9, 'available' => true, 'quantity' => 3],
                    ['size' => 9.5, 'available' => true, 'quantity' => 2],
                    ['size' => 10, 'available' => true, 'quantity' => 4],
                    ['size' => 11, 'available' => true, 'quantity' => 2],
                ],
            ],
        ];

        foreach ($products as $productData) {
            $sizes = $productData['sizes'];
            unset($productData['sizes']);

            $product = Product::create($productData);

            foreach ($sizes as $size) {
                $product->sizes()->create($size);
            }
        }
    }
}
