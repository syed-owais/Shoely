<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductSizeResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'size' => (float) $this->size,
            'available' => (bool) $this->available,
            'quantity' => (int) $this->quantity,
        ];
    }
}
