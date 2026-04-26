<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductAttribute extends Model
{
    protected $fillable = ['type', 'value', 'is_active'];

    protected $casts = [
        'is_active' => 'boolean',
    ];
}
