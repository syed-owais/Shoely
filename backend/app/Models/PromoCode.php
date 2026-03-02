<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PromoCode extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'type',
        'value',
        'min_order_amount',
        'max_discount',
        'usage_limit',
        'usage_count',
        'start_date',
        'end_date',
        'is_active',
        'description',
    ];

    protected function casts(): array
    {
        return [
            'value' => 'decimal:2',
            'min_order_amount' => 'decimal:2',
            'max_discount' => 'decimal:2',
            'usage_limit' => 'integer',
            'usage_count' => 'integer',
            'start_date' => 'datetime',
            'end_date' => 'datetime',
            'is_active' => 'boolean',
        ];
    }

    /**
     * Validate promo code against an order total.
     */
    public function calculateDiscount(float $orderTotal): array
    {
        $now = now();

        if (!$this->is_active) {
            return ['valid' => false, 'discount' => 0, 'message' => 'Promo code is inactive'];
        }

        if ($this->start_date > $now || $this->end_date < $now) {
            return ['valid' => false, 'discount' => 0, 'message' => 'Promo code expired'];
        }

        if ($this->usage_limit !== null && $this->usage_count >= $this->usage_limit) {
            return ['valid' => false, 'discount' => 0, 'message' => 'Promo code usage limit reached'];
        }

        if ($this->min_order_amount !== null && $orderTotal < (float) $this->min_order_amount) {
            return ['valid' => false, 'discount' => 0, 'message' => "Minimum order amount is \${$this->min_order_amount}"];
        }

        $discount = 0;
        if ($this->type === 'percentage') {
            $discount = $orderTotal * ($this->value / 100);
            if ($this->max_discount !== null) {
                $discount = min($discount, (float) $this->max_discount);
            }
        } else {
            $discount = (float) $this->value;
        }

        return ['valid' => true, 'discount' => round($discount, 2)];
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
