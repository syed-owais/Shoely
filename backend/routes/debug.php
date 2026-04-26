<?php

use Illuminate\Support\Facades\Route;

Route::get('/reset-cache', function () {
    Artisan::call('optimize:clear');
    Artisan::call('cache:clear');
    Artisan::call('route:clear');
    Artisan::call('config:clear');

    return response()->json([
        'message' => 'Cache reset successfully',
    ]);
});