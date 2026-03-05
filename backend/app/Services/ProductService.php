<?php

namespace App\Services;

use App\Models\Product;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class ProductService
{
    // ── Internal state ─────────────────────────────────────────
    private array $data = [];
    private array $sizes = [];
    private ?Product $product = null;

    // ── Static initializer ─────────────────────────────────────

    /**
     * Bootstrap the service with product data.
     */
    public static function init(array $data): static
    {
        $service = new static();
        $service->sizes = $data['sizes'] ?? [];
        unset($data['sizes']);
        $service->data = $data;

        return $service;
    }

    // ── Set methods ────────────────────────────────────────────

    /**
     * Set an existing product for update operations.
     */
    public function setProduct(Product $product): static
    {
        $this->product = $product;

        return $this;
    }

    // ── Validation ─────────────────────────────────────────────

    /**
     * Validate product data before persistence.
     */
    public function validation(): static
    {
        // Extend with business rules as needed (e.g. price > 0, images required)
        return $this;
    }

    // ── Create / Update ────────────────────────────────────────

    /**
     * Persist a new product with its size variants.
     */
    public function createProduct(): static
    {
        $this->product = Product::create($this->data);

        foreach ($this->sizes as $size) {
            $this->product->sizes()->create($size);
        }

        return $this;
    }

    /**
     * Update an existing product and sync its size variants.
     */
    public function updateProduct(): static
    {
        $this->product->update($this->data);

        if (!empty($this->sizes)) {
            $sizeList = collect($this->sizes)->pluck('size')->toArray();
            $this->product->sizes()->whereNotIn('size', $sizeList)->delete();

            foreach ($this->sizes as $sizeData) {
                $this->product->sizes()->updateOrCreate(
                    ['size' => $sizeData['size']],
                    [
                        'available' => $sizeData['available'],
                        'quantity' => $sizeData['quantity'],
                    ]
                );
            }
        }

        return $this;
    }

    // ── Build ──────────────────────────────────────────────────

    /**
     * Finalize and return the product with sizes loaded.
     */
    public function build(): Product
    {
        return $this->product->load('sizes');
    }

    // ══════════════════════════════════════════════════════════════
    //  Query methods (no builder needed)
    // ══════════════════════════════════════════════════════════════

    /**
     * Get paginated products with optional filters.
     */
    public static function getProducts(array $filters = [], int $perPage = 12): LengthAwarePaginator
    {
        $query = Product::active()->with('sizes');

        if (!empty($filters['brand'])) {
            $query->byBrand($filters['brand']);
        }

        if (!empty($filters['condition'])) {
            $query->byCondition($filters['condition']);
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

        $sort = $filters['sort_by'] ?? $filters['sort'] ?? 'newest';
        match ($sort) {
            'price-asc', 'price_asc' => $query->orderBy('price', 'asc'),
            'price-desc', 'price_desc' => $query->orderBy('price', 'desc'),
            'rating' => $query->orderBy('id', 'desc'),
            default => $query->latest(),
        };

        return $query->paginate($perPage);
    }

    /**
     * Get featured products for homepage.
     */
    public static function getFeaturedProducts(int $limit = 4): Collection
    {
        return Product::active()
            ->with('sizes')
            ->latest()
            ->limit($limit)
            ->get();
    }

    /**
     * Soft delete a product (set is_active to false).
     */
    public static function deleteProduct(Product $product): void
    {
        $product->update(['is_active' => false]);
    }
}
