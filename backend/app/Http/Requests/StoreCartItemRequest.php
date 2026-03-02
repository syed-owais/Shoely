<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCartItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Authentication handled by middleware
    }

    public function rules(): array
    {
        return [
            'product_id' => ['required', 'exists:products,id'],
            'size' => ['required', 'numeric'],
            'quantity' => ['required', 'integer', 'min:1'],
        ];
    }
}
