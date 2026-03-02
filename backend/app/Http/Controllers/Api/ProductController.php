<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use App\Services\ProductService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ProductController extends Controller
{
    public function __construct(
        private readonly ProductService $productService
    ) {
    }

    /**
     * Display a listing of active products (Public API).
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $products = $this->productService->getProducts(
            $request->all(),
            $request->integer('per_page', 12)
        );

        return ProductResource::collection($products);
    }

    /**
     * Display featured products (Public API).
     */
    public function featured(Request $request): AnonymousResourceCollection
    {
        $products = $this->productService->getFeaturedProducts($request->integer('limit', 4));

        return ProductResource::collection($products);
    }

    /**
     * Display the specified product (Public API).
     */
    public function show(Product $product): ProductResource
    {
        abort_if(!$product->is_active, 404, 'Product not found');

        $product->load('sizes');

        return new ProductResource($product);
    }

    /**
     * Display all products including inactive (Admin API).
     */
    public function adminIndex(Request $request): AnonymousResourceCollection
    {
        $products = Product::with('sizes')
            ->latest()
            ->paginate($request->integer('per_page', 20));

        return ProductResource::collection($products);
    }

    /**
     * Store a newly created product (Admin API).
     */
    public function store(StoreProductRequest $request): ProductResource
    {
        $product = $this->productService->createProduct($request->validated());

        return new ProductResource($product);
    }

    /**
     * Update the specified product (Admin API).
     */
    public function update(UpdateProductRequest $request, Product $product): ProductResource
    {
        $updatedProduct = $this->productService->updateProduct($product, $request->validated());

        return new ProductResource($updatedProduct);
    }

    /**
     * Soft delete the specified product (Admin API).
     */
    public function destroy(Product $product)
    {
        $this->productService->deleteProduct($product);

        return response()->noContent();
    }
}
