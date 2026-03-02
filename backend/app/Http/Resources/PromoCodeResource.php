<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PromoCodeResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'code' => $this->code,
            'type' => $this->type,
            'value' => (float) $this->value,
            'minOrderAmount' => $this->min_order_amount ? (float) $this->min_order_amount : null,
            'maxDiscount' => $this->max_discount ? (float) $this->max_discount : null,
            'usageLimit' => $this->usage_limit,
            'usageCount' => $this->usage_count,
            'startDate' => $this->start_date?->toIso8601String(),
            'endDate' => $this->end_date?->toIso8601String(),
            'isActive' => (bool) $this->is_active,
            'description' => $this->description,
        ];
    }
}
