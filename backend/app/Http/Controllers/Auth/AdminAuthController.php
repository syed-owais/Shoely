<?php

namespace App\Http\Controllers\Auth;

use App\Classes\RestAPI;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use App\Models\User;

class AdminAuthController extends Controller
{
    /**
     * Handle an incoming admin authentication request.
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => __('auth.failed'),
            ]);
        }

        if (!$user->isAdmin()) {
            return RestAPI::response('Access denied. Admin privileges required.', false, 'ADMIN_ACCESS_DENIED');
        }

        // Revoke older admin tokens if desired (optional, but good for security)
        $user->tokens()->where('name', 'admin-token')->delete();

        $token = $user->createToken('admin-token')->plainTextToken;

        return RestAPI::response([
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'first_name' => $user->first_name,
                'last_name' => $user->last_name,
                'email' => $user->email,
                'role' => $user->role,
            ],
        ], true, 'Admin successfully logged in');
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return RestAPI::messageResponse('Admin successfully logged out');
    }
}
