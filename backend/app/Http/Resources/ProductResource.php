<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'brand' => $this->brand,
            'model' => $this->model,
            'price' => (float) $this->price,
            'originalPrice' => $this->original_price ? (float) $this->original_price : null,
            'images' => $this->images ?? [],
            'condition' => $this->condition,
            'description' => $this->description,
            'features' => $this->features ?? [],
            'sizes' => ProductSizeResource::collection($this->whenLoaded('sizes')),
            'sku' => $this->sku,
            'category' => $this->category,
            'tags' => $this->tags ?? [],
            'isActive' => (bool) $this->is_active,
            'createdAt' => $this->created_at?->toIso8601String(),
            'updatedAt' => $this->updated_at?->toIso8601String(),
        ];
    }
}
