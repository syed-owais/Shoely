<?php

namespace App\Http\Controllers\Api;

use App\Classes\RestAPI;
use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;

class SettingController extends Controller
{
    /**
     * Get all settings grouped by category.
     */
    public function index(): JsonResponse
    {
        return RestAPI::response(Setting::getGrouped());
    }

    /**
     * Get settings for a specific group.
     */
    public function group(string $group): JsonResponse
    {
        $settings = Setting::where('group', $group)->get()->map(function ($setting) {
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

        return RestAPI::response($settings);
    }

    /**
     * Update one or more settings.
     */
    public function update(Request $request): JsonResponse
    {
        $request->validate([
            'settings' => ['required', 'array'],
            'settings.*.key' => ['required', 'string', 'exists:settings,key'],
            'settings.*.value' => ['present'],
        ]);

        foreach ($request->input('settings') as $item) {
            Setting::setValue($item['key'], $item['value']);
        }

        return RestAPI::messageResponse('Settings updated successfully');
    }

    /**
     * Get public settings (e.g. store currency, store name).
     */
    public function publicSettings(): JsonResponse
    {
        $keys = ['store_currency', 'store_name', 'shipping_flat_rate', 'free_shipping_threshold'];

        $settings = [];
        foreach ($keys as $key) {
            $settings[$key] = Setting::getValue($key);
        }

        return RestAPI::response($settings);
    }
}
