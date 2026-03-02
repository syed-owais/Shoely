<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() && $this->user()->isAdmin();
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'brand' => ['sometimes', 'required', 'string', 'max:255'],
            'model' => ['sometimes', 'required', 'string', 'max:255'],
            'price' => ['sometimes', 'required', 'numeric', 'min:0'],
            'original_price' => ['nullable', 'numeric', 'min:0'],
            'images' => ['nullable', 'array'],
            'images.*' => ['string'],
            'condition' => ['sometimes', 'required', 'in:Like New,Excellent,Very Good,Good'],
            'description' => ['nullable', 'string'],
            'features' => ['nullable', 'array'],
            'sku' => ['sometimes', 'required', 'string', 'unique:products,sku,' . $this->route('product')->id],
            'category' => ['sometimes', 'required', 'string', 'max:255'],
            'tags' => ['nullable', 'array'],
            'is_active' => ['boolean'],
            'sizes' => ['nullable', 'array'],
            'sizes.*.size' => ['required', 'numeric'],
            'sizes.*.available' => ['required', 'boolean'],
            'sizes.*.quantity' => ['required', 'integer', 'min:0'],
        ];
    }
}
