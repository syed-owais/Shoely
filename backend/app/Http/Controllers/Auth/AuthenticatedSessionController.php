<?php

namespace App\Http\Controllers\Auth;

use App\Classes\RestAPI;
use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuthenticatedSessionController extends Controller
{
    /**
     * Handle an incoming authentication request.
     * Issues a Sanctum API token instead of session-based auth.
     */
    public function store(LoginRequest $request): JsonResponse
    {
        $request->authenticate();

        $user = $request->user();

        // Revoke old tokens and create a new one
        $user->tokens()->delete();
        $token = $user->createToken('auth-token')->plainTextToken;

        return RestAPI::response([
            'user' => [
                'id' => $user->id,
                'first_name' => $user->first_name,
                'last_name' => $user->last_name,
                'email' => $user->email,
                'phone' => $user->phone,
                'role' => $user->role,
            ],
            'token' => $token,
        ], true, 'Login successful');
    }

    /**
     * Destroy an authenticated session (revoke token).
     */
    public function destroy(Request $request): JsonResponse
    {
        // Revoke the current token
        $request->user()->currentAccessToken()->delete();

        return RestAPI::messageResponse('Logged out successfully');
    }
}
