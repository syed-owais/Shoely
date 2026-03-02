<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() && $this->user()->isAdmin();
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'brand' => ['required', 'string', 'max:255'],
            'model' => ['required', 'string', 'max:255'],
            'price' => ['required', 'numeric', 'min:0'],
            'original_price' => ['nullable', 'numeric', 'min:0'],
            'images' => ['nullable', 'array'],
            'images.*' => ['string'],
            'condition' => ['required', 'in:Like New,Excellent,Very Good,Good'],
            'description' => ['nullable', 'string'],
            'features' => ['nullable', 'array'],
            'sku' => ['required', 'string', 'unique:products,sku'],
            'category' => ['required', 'string', 'max:255'],
            'tags' => ['nullable', 'array'],
            'is_active' => ['boolean'],
            'sizes' => ['required', 'array', 'min:1'],
            'sizes.*.size' => ['required', 'numeric'],
            'sizes.*.available' => ['required', 'boolean'],
            'sizes.*.quantity' => ['required', 'integer', 'min:0'],
        ];
    }
}
