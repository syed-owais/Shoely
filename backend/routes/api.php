<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\Auth\PasswordResetController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\PromoCodeController;
use App\Http\Controllers\Api\CampaignController;
use App\Http\Controllers\Api\AdminDashboardController;
use App\Http\Controllers\Api\ExportController;
use App\Http\Controllers\Api\SettingController;
use App\Http\Controllers\Auth\AdminAuthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// ==========================================
// PUBLIC ROUTES
// ==========================================

Route::get('/ping', function () {
    return response()->json(['message' => 'pong']);
});

// Auth Endpoints
Route::post('/register', [RegisteredUserController::class, 'store']);
Route::post('/login', [AuthenticatedSessionController::class, 'store']);
Route::post('/forgot-password', [PasswordResetController::class, 'sendResetLink']);
Route::post('/reset-password', [PasswordResetController::class, 'resetPassword']);

// Product Endpoints
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/featured', [ProductController::class, 'featured']);
Route::get('/products/{product}', [ProductController::class, 'show']);

// Campaign Endpoints
Route::get('/campaigns', [CampaignController::class, 'index']);

// Order Tracking (Public)
Route::post('/orders/track/{orderNumber}', [OrderController::class, 'track']);

// ==========================================
// CONSUMER PROTECTED ROUTES
// ==========================================
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        $user = $request->user();
        return response()->json([
            'user' => [
                'id' => $user->id,
                'first_name' => $user->first_name,
                'last_name' => $user->last_name,
                'email' => $user->email,
                'phone' => $user->phone,
                'role' => $user->role,
            ],
        ]);
    });

    Route::post('/logout', [AuthenticatedSessionController::class, 'destroy']);

    // Cart Endpoints
    Route::get('/cart', [CartController::class, 'index']);
    Route::post('/cart/items', [CartController::class, 'storeItem']);
    Route::put('/cart/items/{cartItem}', [CartController::class, 'updateItem']);
    Route::delete('/cart/items/{cartItem}', [CartController::class, 'destroyItem']);
    Route::post('/cart/sync', [CartController::class, 'sync']);

    // Order Endpoints
    Route::get('/orders', [OrderController::class, 'index']);
    Route::get('/orders', [OrderController::class, 'index']);
    Route::get('/orders/{order}', [OrderController::class, 'show']);

});

// Guest-accessible order checkout
Route::post('/orders/checkout', [OrderController::class, 'checkout']);

// Promo Code Endpoints (Consumer/Checkout phase)
Route::post('/promo-codes/validate', [PromoCodeController::class, 'validateCode']);

// ==========================================
// ADMIN PROTECTED ROUTES
// ==========================================
Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    // Admin Dashboard
    Route::get('/dashboard/stats', [AdminDashboardController::class, 'stats']);
    Route::get('/dashboard/chart', [AdminDashboardController::class, 'chartData']);

    // Admin Auth
    Route::get('/user', function (Request $request) {
        $user = $request->user();
        return response()->json([
            'user' => [
                'id' => $user->id,
                'first_name' => $user->first_name,
                'last_name' => $user->last_name,
                'email' => $user->email,
                'phone' => $user->phone,
                'role' => $user->role,
            ],
        ]);
    });

    Route::post('/logout', [AuthenticatedSessionController::class, 'destroy']);

    // Admin Products
    Route::get('/products', [ProductController::class, 'adminIndex']);
    Route::post('/products', [ProductController::class, 'store']);
    Route::put('/products/{product}', [ProductController::class, 'update']);
    Route::delete('/products/{product}', [ProductController::class, 'destroy']);

    // Admin Orders
    Route::get('/orders', [OrderController::class, 'adminIndex']);
    Route::get('/orders/{order}', [OrderController::class, 'adminShow']);
    Route::put('/orders/{order}/status', [OrderController::class, 'updateStatus']);

    // Admin Promo Codes
    Route::get('/promo-codes', [PromoCodeController::class, 'adminIndex']);
    Route::post('/promo-codes', [PromoCodeController::class, 'store']);
    Route::get('/promo-codes/{promo_code}', [PromoCodeController::class, 'show']);
    Route::put('/promo-codes/{promo_code}', [PromoCodeController::class, 'update']);
    Route::delete('/promo-codes/{promo_code}', [PromoCodeController::class, 'destroy']);

    // Admin Campaigns
    Route::get('/campaigns', [CampaignController::class, 'adminIndex']);
    Route::post('/campaigns', [CampaignController::class, 'store']);
    Route::get('/campaigns/{campaign}', [CampaignController::class, 'show']);
    Route::put('/campaigns/{campaign}', [CampaignController::class, 'update']);
    Route::delete('/campaigns/{campaign}', [CampaignController::class, 'destroy']);

    // Admin Settings
    Route::get('/settings', [SettingController::class, 'index']);
    Route::get('/settings/{group}', [SettingController::class, 'group']);
    Route::put('/settings', [SettingController::class, 'update']);

    // Admin Exports
    Route::get('/exports/orders', [ExportController::class, 'orders']);
    Route::get('/exports/customers', [ExportController::class, 'customers']);
});

// Admin Auth
Route::post('/admin/login', [AdminAuthController::class, 'store'])->middleware('throttle:5,1');
Route::post('/admin/logout', [AdminAuthController::class, 'destroy'])->middleware('auth:sanctum');
