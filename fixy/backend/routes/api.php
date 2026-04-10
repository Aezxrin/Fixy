<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\AuthController; 
use App\Http\Controllers\Manager\ManagerDashboardController;
use App\Http\Controllers\Api\CallController;
use App\Http\Controllers\Admin\RepairRequestController;


/*
|--------------------------------------------------------------------------
| Public Routes (Нэвтрээгүй үед ажиллах)
|--------------------------------------------------------------------------
*/
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);
Route::post('/admin/login', [AuthController::class, 'login']);

/*
|--------------------------------------------------------------------------
| Protected Routes (Зөвхөн нэвтэрсэн үед ажиллах)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth:sanctum'])->group(function () {
    
    // Auth үйлдлүүд
    Route::get('/admin/me', [AuthController::class, 'me']);
    Route::post('/admin/logout', [AuthController::class, 'logout']);

    /* --- ADMIN ХЭСЭГ --- */
    Route::prefix('admin')->group(function () {
        // Дашбордын ерөнхий тоо мэдээ
        Route::get('/dashboard/summary', [DashboardController::class, 'summary']);
        Route::patch('/profile/password', [\App\Http\Controllers\Admin\UserController::class, 'updatePassword']);
        Route::patch('/profile/update', [\App\Http\Controllers\Admin\UserController::class, 'updateProfile']);
        // Хэрэглэгчдийн удирдлага (Иргэн, Засварчин бүгд энд багтана)
        // Бидний ярилцсан ?role_id=... шүүлтүүр энд ажиллана
        Route::get('/users', [UserController::class, 'index']); 
        Route::get('/users/{user}', [UserController::class, 'show']);
        Route::patch('/users/{user}', [UserController::class, 'update']);
        Route::get('/reports', [\App\Http\Controllers\Admin\ReportController::class, 'index']);
    });

    /* --- MANAGER ХЭСЭГ --- */
    Route::prefix('manager')->group(function () {
        // Хүлээгдэж буй засварчдыг авах
        Route::get('/dashboard/pending-technicians', [ManagerDashboardController::class, 'getPendingTechnicians']);
        
        // Засварчныг баталгаажуулах
        Route::put('/technicians/{id}/verify', [ManagerDashboardController::class, 'verifyTechnician']);
    });
    Route::get('/admin/calls', [RepairRequestController::class, 'index']); 
    Route::post('/calls', [CallController::class, 'store']);

    Route::get('/find-technicians', [CallController::class, 'findTechnicians']);
    Route::post('/calls/{id}/send-to-tech', [CallController::class, 'sendToTechnician']);

    Route::post('/calls/{id}/accept', [CallController::class, 'acceptRequest']);
    Route::post('/calls/{id}/decline', [CallController::class, 'declineRequest']);

    Route::post('/calls/{id}/pay-deposit', [CallController::class, 'payDeposit']);
    Route::post('/calls/{id}/cancel', [CallController::class, 'cancelRequest']);
    Route::post('/calls/{id}/start', [CallController::class, 'startRepair']);
    Route::post('/calls/{id}/finish', [CallController::class, 'finishRepair']);

    // Иргэний хийх үйлдэл (Эцсийн төлбөр төлөх)
    Route::post('/calls/{id}/pay-final', [CallController::class, 'payFinalAmount']);
    Route::post('/calls/{id}/update-draft', [CallController::class, 'updateDraft']);
    
    // Засварчны профайл харах (Иргэн сонгохдоо ашиглана)
    Route::get('/technicians/{id}/profile', [CallController::class, 'getTechnicianProfile']);
    Route::post('/calls/{id}/review', [CallController::class, 'submitReview']);
    Route::prefix('admin')->group(function () {
    // ... бусад route-үүд
    Route::apiResource('services', \App\Http\Controllers\Admin\ServiceController::class);
});
});