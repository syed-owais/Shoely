<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class SettingsSeeder extends Seeder
{
    public function run(): void
    {
        $settings = [
            // ─── Payment Gateways ─────────────────────────────
            ['group' => 'payment', 'key' => 'jazzcash_enabled', 'value' => '0', 'type' => 'boolean', 'label' => 'JazzCash Enabled', 'description' => 'Enable JazzCash payment gateway', 'is_sensitive' => false],
            ['group' => 'payment', 'key' => 'jazzcash_merchant_id', 'value' => null, 'type' => 'string', 'label' => 'JazzCash Merchant ID', 'description' => 'Your JazzCash merchant ID', 'is_sensitive' => true],
            ['group' => 'payment', 'key' => 'jazzcash_password', 'value' => null, 'type' => 'string', 'label' => 'JazzCash Password', 'description' => 'Your JazzCash integration password', 'is_sensitive' => true],
            ['group' => 'payment', 'key' => 'jazzcash_integrity_salt', 'value' => null, 'type' => 'string', 'label' => 'JazzCash Integrity Salt', 'description' => 'Your JazzCash integrity salt for hash verification', 'is_sensitive' => true],
            ['group' => 'payment', 'key' => 'jazzcash_sandbox', 'value' => '1', 'type' => 'boolean', 'label' => 'JazzCash Sandbox Mode', 'description' => 'Use sandbox/test environment', 'is_sensitive' => false],

            ['group' => 'payment', 'key' => 'easypaisa_enabled', 'value' => '0', 'type' => 'boolean', 'label' => 'EasyPaisa Enabled', 'description' => 'Enable EasyPaisa payment gateway', 'is_sensitive' => false],
            ['group' => 'payment', 'key' => 'easypaisa_store_id', 'value' => null, 'type' => 'string', 'label' => 'EasyPaisa Store ID', 'description' => 'Your EasyPaisa store ID', 'is_sensitive' => true],
            ['group' => 'payment', 'key' => 'easypaisa_hash_key', 'value' => null, 'type' => 'string', 'label' => 'EasyPaisa Hash Key', 'description' => 'Your EasyPaisa hash key', 'is_sensitive' => true],
            ['group' => 'payment', 'key' => 'easypaisa_sandbox', 'value' => '1', 'type' => 'boolean', 'label' => 'EasyPaisa Sandbox Mode', 'description' => 'Use sandbox/test environment', 'is_sensitive' => false],

            ['group' => 'payment', 'key' => 'nayapay_enabled', 'value' => '0', 'type' => 'boolean', 'label' => 'NayaPay Enabled', 'description' => 'Enable NayaPay payment gateway', 'is_sensitive' => false],
            ['group' => 'payment', 'key' => 'nayapay_api_key', 'value' => null, 'type' => 'string', 'label' => 'NayaPay API Key', 'description' => 'Your NayaPay API key', 'is_sensitive' => true],
            ['group' => 'payment', 'key' => 'nayapay_sandbox', 'value' => '1', 'type' => 'boolean', 'label' => 'NayaPay Sandbox Mode', 'description' => 'Use sandbox/test environment', 'is_sensitive' => false],

            ['group' => 'payment', 'key' => 'bank_transfer_enabled', 'value' => '0', 'type' => 'boolean', 'label' => 'Bank Transfer Enabled', 'description' => 'Enable direct bank transfer payments', 'is_sensitive' => false],
            ['group' => 'payment', 'key' => 'bank_transfer_details', 'value' => null, 'type' => 'json', 'label' => 'Bank Account Details', 'description' => 'JSON array of bank accounts (Meezan, Bank Al Habib, etc.) with account numbers', 'is_sensitive' => false],

            ['group' => 'payment', 'key' => 'cod_enabled', 'value' => '1', 'type' => 'boolean', 'label' => 'Cash on Delivery', 'description' => 'Enable cash on delivery payments', 'is_sensitive' => false],

            // ─── Courier / Shipping ───────────────────────────
            ['group' => 'courier', 'key' => 'postex_enabled', 'value' => '0', 'type' => 'boolean', 'label' => 'PostEx Enabled', 'description' => 'Enable PostEx courier integration', 'is_sensitive' => false],
            ['group' => 'courier', 'key' => 'postex_api_token', 'value' => null, 'type' => 'string', 'label' => 'PostEx API Token', 'description' => 'Your PostEx API token', 'is_sensitive' => true],
            ['group' => 'courier', 'key' => 'postex_sandbox', 'value' => '1', 'type' => 'boolean', 'label' => 'PostEx Sandbox Mode', 'description' => 'Use sandbox/test environment', 'is_sensitive' => false],

            ['group' => 'courier', 'key' => 'leopards_enabled', 'value' => '0', 'type' => 'boolean', 'label' => 'Leopards Courier Enabled', 'description' => 'Enable Leopards Courier integration', 'is_sensitive' => false],
            ['group' => 'courier', 'key' => 'leopards_api_key', 'value' => null, 'type' => 'string', 'label' => 'Leopards API Key', 'description' => 'Your Leopards Courier API key', 'is_sensitive' => true],
            ['group' => 'courier', 'key' => 'leopards_api_password', 'value' => null, 'type' => 'string', 'label' => 'Leopards API Password', 'description' => 'Your Leopards Courier API password', 'is_sensitive' => true],

            ['group' => 'courier', 'key' => 'tcs_enabled', 'value' => '0', 'type' => 'boolean', 'label' => 'TCS Enabled', 'description' => 'Enable TCS courier integration', 'is_sensitive' => false],
            ['group' => 'courier', 'key' => 'tcs_api_key', 'value' => null, 'type' => 'string', 'label' => 'TCS API Key', 'description' => 'Your TCS API key', 'is_sensitive' => true],
            ['group' => 'courier', 'key' => 'tcs_account_number', 'value' => null, 'type' => 'string', 'label' => 'TCS Account Number', 'description' => 'Your TCS account number', 'is_sensitive' => true],

            ['group' => 'courier', 'key' => 'trax_enabled', 'value' => '0', 'type' => 'boolean', 'label' => 'Trax Enabled', 'description' => 'Enable Trax courier integration', 'is_sensitive' => false],
            ['group' => 'courier', 'key' => 'trax_api_key', 'value' => null, 'type' => 'string', 'label' => 'Trax API Key', 'description' => 'Your Trax API key', 'is_sensitive' => true],

            ['group' => 'courier', 'key' => 'blueex_enabled', 'value' => '0', 'type' => 'boolean', 'label' => 'BlueEX Enabled', 'description' => 'Enable BlueEX courier integration', 'is_sensitive' => false],
            ['group' => 'courier', 'key' => 'blueex_api_key', 'value' => null, 'type' => 'string', 'label' => 'BlueEX API Key', 'description' => 'Your BlueEX API key', 'is_sensitive' => true],
            ['group' => 'courier', 'key' => 'blueex_account_number', 'value' => null, 'type' => 'string', 'label' => 'BlueEX Account Number', 'description' => 'Your BlueEX account number', 'is_sensitive' => true],

            // ─── General Settings ─────────────────────────────
            ['group' => 'general', 'key' => 'store_name', 'value' => 'Shoely', 'type' => 'string', 'label' => 'Store Name', 'description' => 'Your store name displayed to customers', 'is_sensitive' => false],
            ['group' => 'general', 'key' => 'store_email', 'value' => 'support@shoely.com', 'type' => 'string', 'label' => 'Store Email', 'description' => 'Primary contact email for customer communications', 'is_sensitive' => false],
            ['group' => 'general', 'key' => 'store_phone', 'value' => null, 'type' => 'string', 'label' => 'Store Phone', 'description' => 'Customer support phone number', 'is_sensitive' => false],
            ['group' => 'general', 'key' => 'store_currency', 'value' => 'PKR', 'type' => 'string', 'label' => 'Currency', 'description' => 'Default currency for the store', 'is_sensitive' => false],
            ['group' => 'general', 'key' => 'shipping_flat_rate', 'value' => '250', 'type' => 'integer', 'label' => 'Flat Shipping Rate (PKR)', 'description' => 'Default flat shipping rate in PKR', 'is_sensitive' => false],
        ];

        foreach ($settings as $setting) {
            Setting::updateOrCreate(
                ['key' => $setting['key']],
                $setting
            );
        }
    }
}
