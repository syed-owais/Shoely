<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'orderNumber' => $this->order_number,
            'customer' => [
                'firstName' => $this->first_name,
                'lastName' => $this->last_name,
                'email' => $this->email,
                'phone' => $this->phone,
            ],
            'shippingAddress' => [
                'address' => $this->street,
                'city' => $this->city,
                'state' => $this->state,
                'country' => $this->country,
                'zipCode' => $this->zip_code,
            ],
            'financials' => [
                'subtotal' => (float) $this->subtotal,
                'shippingFee' => (float) $this->shipping,
                'tax' => (float) $this->tax,
                'discount' => (float) $this->discount,
                'totalAmount' => (float) $this->total,
            ],
            'status' => $this->status,
            'tracking' => [
                'number' => $this->tracking_number,
                'url' => $this->tracking_url,
            ],
            'items' => OrderItemResource::collection($this->whenLoaded('items')),
            'appliedPromoCode' => $this->promo_code,
            'createdAt' => $this->created_at?->toIso8601String(),
            'updatedAt' => $this->updated_at?->toIso8601String(),
        ];
    }
}
