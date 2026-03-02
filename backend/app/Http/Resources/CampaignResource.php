<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CampaignResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'description' => $this->description,
            'bannerImage' => $this->banner_image,
            'discountType' => $this->discount_type,
            'discountValue' => (float) $this->discount_value,
            'startDate' => $this->start_date?->toIso8601String(),
            'endDate' => $this->end_date?->toIso8601String(),
            'isActive' => (bool) $this->is_active,
            'productIds' => $this->product_ids,
            'brand' => $this->brand,
            'category' => $this->category,
            'tags' => $this->tags,
            'createdAt' => $this->created_at?->toIso8601String(),
        ];
    }
}
