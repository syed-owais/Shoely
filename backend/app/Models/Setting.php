<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Crypt;

class Setting extends Model
{
    use HasFactory;

    protected $fillable = [
        'group',
        'key',
        'value',
        'type',
        'label',
        'description',
        'is_sensitive',
    ];

    protected $casts = [
        'is_sensitive' => 'boolean',
    ];

    /**
     * Get a setting value by key.
     */
    public static function getValue(string $key, mixed $default = null): mixed
    {
        $setting = static::where('key', $key)->first();

        if (!$setting) {
            return $default;
        }

        $value = $setting->is_sensitive && $setting->value
            ? Crypt::decryptString($setting->value)
            : $setting->value;

        return match ($setting->type) {
            'boolean' => filter_var($value, FILTER_VALIDATE_BOOLEAN),
            'json' => json_decode($value, true),
            'integer' => (int) $value,
            default => $value,
        };
    }

    /**
     * Set a setting value by key.
     */
    public static function setValue(string $key, mixed $value): static
    {
        $setting = static::where('key', $key)->first();

        if (!$setting) {
            throw new \RuntimeException("Setting key '{$key}' does not exist.");
        }

        $storeValue = match ($setting->type) {
            'json' => is_string($value) ? $value : json_encode($value),
            'boolean' => $value ? '1' : '0',
            default => (string) $value,
        };

        if ($setting->is_sensitive && $storeValue) {
            $storeValue = Crypt::encryptString($storeValue);
        }

        $setting->update(['value' => $storeValue]);

        return $setting;
    }

    /**
     * Get all settings grouped by their group name.
     */
    public static function getGrouped(): array
    {
        return static::all()
            ->groupBy('group')
            ->map(function ($items) {
                return $items->map(function ($setting) {
                    return [
                        'id' => $setting->id,
                        'key' => $setting->key,
                        'value' => $setting->is_sensitive ? '••••••••' : $setting->value,
                        'type' => $setting->type,
                        'label' => $setting->label,
                        'description' => $setting->description,
                        'is_sensitive' => $setting->is_sensitive,
                    ];
                });
            })
            ->toArray();
    }
}
