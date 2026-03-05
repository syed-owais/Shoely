<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('settings', function (Blueprint $table) {
            $table->id();
            $table->string('group')->index();         // e.g. 'payment', 'courier', 'general'
            $table->string('key')->unique();           // e.g. 'jazzcash_enabled', 'jazzcash_merchant_id'
            $table->text('value')->nullable();          // The actual setting value
            $table->string('type')->default('string');  // string, boolean, json, encrypted
            $table->string('label')->nullable();        // Human-readable label for admin UI
            $table->text('description')->nullable();    // Help text for admin UI
            $table->boolean('is_sensitive')->default(false); // If true, value is encrypted
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('settings');
    }
};
