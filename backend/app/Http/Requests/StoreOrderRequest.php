<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Assume logged-in user, handled by middleware
    }

    public function rules(): array
    {
        return [
            'email' => ['required', 'email', 'max:255'],
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:20'],
            'address' => ['required', 'string', 'max:255'],
            'city' => ['required', 'string', 'max:255'],
            'state' => ['nullable', 'string', 'max:255'],
            'zip_code' => ['required', 'string', 'max:20'],
            'country' => ['nullable', 'string', 'max:255'],
            'payment_method' => ['required', 'string', 'in:credit_card,paypal,apple_pay,google_pay,cod'],
            'shipping_method' => ['nullable', 'string', 'in:standard,express,overnight'],
            'promo_code' => ['nullable', 'string', 'exists:promo_codes,code'],
            'items' => ['nullable', 'array', 'min:1'],
            'items.*.product_id' => ['required_with:items', 'exists:products,id'],
            'items.*.size' => ['required_with:items', 'numeric'],
            'items.*.quantity' => ['required_with:items', 'integer', 'min:1'],
        ];
    }
}
