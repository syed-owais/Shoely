<?php

namespace App\Http\Controllers\Api;

use App\Classes\RestAPI;
use App\Http\Controllers\Controller;
use App\Models\ProductAttribute;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductAttributeController extends Controller
{
    /**
     * Display a listing of all product attributes grouped by type (Public API).
     */
    public function index(): JsonResponse
    {
        $attributes = ProductAttribute::where('is_active', true)
            ->get()
            ->groupBy('type')
            ->map(function ($items) {
                return $items->pluck('value');
            });

        return RestAPI::response([
            'product_conditions' => $attributes->get('condition', []),
            'product_brands' => $attributes->get('brand', []),
            'product_categories' => $attributes->get('category', []),
            'product_sizes' => $attributes->get('size', []),
        ]);
    }

    /**
     * Store a newly created attribute (Admin API).
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'type' => ['required', 'string', 'in:brand,category,condition,size'],
            'value' => ['required', 'string', 'max:255'],
        ]);

        $attribute = ProductAttribute::firstOrCreate([
            'type' => $request->type,
            'value' => $request->value,
        ], ['is_active' => true]);

        return RestAPI::response($attribute, true, 'Attribute added successfully');
    }

    /**
     * Delete an attribute (Admin API).
     */
    public function destroy(ProductAttribute $attribute): JsonResponse
    {
        $attribute->delete();
        return RestAPI::messageResponse('Attribute deleted successfully');
    }
}
