<?php

namespace App\Services;

use App\Models\Product;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class ProductService
{
    /**
     * Get paginated products with optional filters.
     */
    public function getProducts(array $filters = [], int $perPage = 12): LengthAwarePaginator
    {
        $query = Product::active()->with('sizes');

        if (!empty($filters['brand'])) {
            $query->byBrand($filters['brand']);
        }

        if (!empty($filters['category'])) {
            $query->byCategory($filters['category']);
        }

        if (isset($filters['min_price']) || isset($filters['max_price'])) {
            $min = isset($filters['min_price']) ? (float) $filters['min_price'] : null;
            $max = isset($filters['max_price']) ? (float) $filters['max_price'] : null;
            $query->priceBetween($min, $max);
        }

        if (!empty($filters['size'])) {
            $query->hasSize((float) $filters['size']);
        }

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $sort = $filters['sort'] ?? 'newest';
        switch ($sort) {
            case 'price_asc':
                $query->orderBy('price', 'asc');
                break;
            case 'price_desc':
                $query->orderBy('price', 'desc');
                break;
            case 'rating': // Fallback to rating logic when implemented, for now use ID
                $query->orderBy('id', 'desc');
                break;
            case 'newest':
            default:
                $query->latest();
                break;
        }

        return $query->paginate($perPage);
    }

    /**
     * Get featured products for homepage.
     */
    public function getFeaturedProducts(int $limit = 4): Collection
    {
        return Product::active()
            ->with('sizes')
            ->latest()
            ->limit($limit)
            ->get();
    }

    /**
     * Create a new product.
     */
    public function createProduct(array $data): Product
    {
        $sizes = $data['sizes'] ?? [];
        unset($data['sizes']);

        $product = Product::create($data);

        foreach ($sizes as $size) {
            $product->sizes()->create($size);
        }

        return $product->load('sizes');
    }

    /**
     * Update an existing product.
     */
    public function updateProduct(Product $product, array $data): Product
    {
        $sizes = $data['sizes'] ?? null;
        unset($data['sizes']);

        $product->update($data);

        if (is_array($sizes)) {
            // Delete existing that are not in the new list
            $sizeList = collect($sizes)->pluck('size')->toArray();
            $product->sizes()->whereNotIn('size', $sizeList)->delete();

            // Create or update
            foreach ($sizes as $sizeData) {
                $product->sizes()->updateOrCreate(
                    ['size' => $sizeData['size']],
                    [
                        'available' => $sizeData['available'],
                        'quantity' => $sizeData['quantity']
                    ]
                );
            }
        }

        return $product->load('sizes');
    }

    /**
     * Soft delete a product (set is_active to false).
     */
    public function deleteProduct(Product $product): void
    {
        $product->update(['is_active' => false]);
    }
}
