<?php

namespace App\Http\Controllers\Api;

use App\Classes\RestAPI;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use App\Services\ProductService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    /**
     * Display a listing of active products (Public API).
     */
    public function index(Request $request): JsonResponse
    {
        $products = ProductService::getProducts(
            $request->all(),
            $request->integer('per_page', 12)
        );

        return RestAPI::setPagination($products)
            ->response(ProductResource::collection($products)->resolve());
    }

    /**
     * Display featured products (Public API).
     */
    public function featured(Request $request): JsonResponse
    {
        $products = ProductService::getFeaturedProducts($request->integer('limit', 4));

        return RestAPI::response(ProductResource::collection($products)->resolve());
    }

    /**
     * Display the specified product (Public API).
     */
    public function show(Product $product): JsonResponse
    {
        abort_if(!$product->is_active, 404, 'Product not found');

        $product->load('sizes');

        return RestAPI::response(new ProductResource($product));
    }

    /**
     * Display all products including inactive (Admin API).
     */
    public function adminIndex(Request $request): JsonResponse
    {
        $products = Product::with('sizes')
            ->latest()
            ->paginate($request->integer('per_page', 20));

        return RestAPI::setPagination($products)
            ->response(ProductResource::collection($products)->resolve());
    }

    /**
     * Store a newly created product (Admin API).
     */
    public function store(StoreProductRequest $request): JsonResponse
    {
        $product = ProductService::init($request->validated())
            ->validation()
            ->createProduct()
            ->build();

        return RestAPI::response(new ProductResource($product), true, 'Product created successfully');
    }

    /**
     * Update the specified product (Admin API).
     */
    public function update(UpdateProductRequest $request, Product $product): JsonResponse
    {
        $updatedProduct = ProductService::init($request->validated())
            ->setProduct($product)
            ->validation()
            ->updateProduct()
            ->build();

        return RestAPI::response(new ProductResource($updatedProduct), true, 'Product updated successfully');
    }

    /**
     * Soft delete the specified product (Admin API).
     */
    public function destroy(Product $product): JsonResponse
    {
        ProductService::deleteProduct($product);

        return RestAPI::messageResponse('Product deleted successfully');
    }
}
