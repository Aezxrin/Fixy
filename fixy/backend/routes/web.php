<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;

Route::post('/admin/login', function (Request $request) {
    $credentials = $request->validate([
        'email' => ['required','email'],
        'password' => ['required'],
    ]);

    if (!Auth::attempt($credentials)) {
        return response()->json(['message' => 'Invalid credentials'], 422);
    }

    $user = $request->user();

    if ($user->role !== 'admin' || $user->status !== 'active') {
        Auth::logout();
        return response()->json(['message' => 'Forbidden'], 403);
    }

    $request->session()->regenerate();

    return response()->json([
        'user' => [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
        ],
    ]);
});
use App\Http\Controllers\Admin\AuthController;
use App\Http\Middleware\VerifyCsrfToken;

Route::post('/admin/login', [AuthController::class, 'login'])
    ->withoutMiddleware([VerifyCsrfToken::class]);  
Route::post('/admin/logout', [AuthController::class, 'logout'])
    ->withoutMiddleware([VerifyCsrfToken::class]);
Route::get('/admin/me', [AuthController::class, 'me']);
Route::get('/admin/me', function (Request $request) {
    $user = $request->user();
    if (!$user) return response()->json(['message' => 'Unauthenticated'], 401);
    if ($user->role !== 'admin') return response()->json(['message' => 'Forbidden'], 403);
    return response()->json(['user' => $user]);
});

Route::post('/admin/logout', function (Request $request) {
    Auth::logout();
    $request->session()->invalidate();
    $request->session()->regenerateToken();
    return response()->json(['ok' => true]);
});
