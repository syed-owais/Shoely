<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'productId' => $this->product_id,
            'productName' => $this->name,
            'productBrand' => $this->brand,
            'price' => (float) $this->price,
            'size' => (float) $this->size,
            'quantity' => (int) $this->quantity,
            'imageUrl' => $this->image,
            'subtotal' => (float) ($this->price * $this->quantity),
        ];
    }
}
