<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;

// Controllers
use App\Http\Controllers\Admin\AuthController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\ReportController;
use App\Http\Controllers\Admin\RepairRequestController;
use App\Http\Controllers\Admin\ServiceController;
use App\Http\Controllers\Manager\ManagerDashboardController;
// use App\Http\Controllers\Api\CallController; // Энийг түр ашиглахгүй тул комментлов

/*
|--------------------------------------------------------------------------
| Public Routes (Нэвтрээгүй үед ажиллах)
|--------------------------------------------------------------------------
*/
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);
Route::post('/admin/login', [AuthController::class, 'login']);

// Засварчин бүртгүүлэхэд зориулан үйлчилгээний төрлүүдийг татах
Route::get('/services', function () {
    $services = DB::table('services')
                ->select('id', 'name')
                ->get();
                
    return response()->json([
        'success' => true,
        'data' => $services
    ]);
});

/*
|--------------------------------------------------------------------------
| Protected Routes (Зөвхөн нэвтэрсэн үед ажиллах)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth:sanctum'])->group(function () {
    
    // Auth үйлдлүүд
    Route::get('/admin/me', [AuthController::class, 'me']);
    Route::post('/admin/logout', [AuthController::class, 'logout']);

    // ==========================================
    // 1. ХЭРЭГЛЭГЧИЙН АПП (Customer)
    // ==========================================
    Route::get('/customer/online-technicians', [UserController::class, 'getOnlineTechnicians']); // Газрын зураг дээр харах
    Route::post('/calls', [RepairRequestController::class, 'store']); // Шинэ дуудлага үүсгэх
    Route::post('/calls/{id}/assign', [RepairRequestController::class, 'assignTechnician']); // Дуудлагыг тодорхой засварчин руу илгээх

    // ==========================================
    // 2. ЗАСВАРЧНЫ АПП (Technician)
    // ==========================================
    Route::post('/technician/toggle-duty', [UserController::class, 'toggleDuty']); // Онлайн/Офлайн болох
    Route::get('/technician/pending-calls', [RepairRequestController::class, 'getPendingCalls']); // Шинэ дуудлагууд харах
    Route::post('/technician/calls/{id}/accept', [RepairRequestController::class, 'acceptCall']); // Дуудлага хүлээн авах
    Route::get('/technician/my-jobs', [UserController::class, 'getMyJobs']); // Хийгдэж буй ажлуудаа харах
    Route::post('/technician/calls/{id}/complete', [UserController::class, 'completeCall']); // Ажлыг дуусгах

    /* --- ADMIN ХЭСЭГ --- */
    Route::prefix('admin')->group(function () {
        Route::get('/dashboard/summary', [DashboardController::class, 'summary']);
        Route::patch('/profile/password', [UserController::class, 'updatePassword']);
        Route::patch('/profile/update', [UserController::class, 'updateProfile']);
        Route::get('/users', [UserController::class, 'index']); 
        Route::get('/users/{user}', [UserController::class, 'show']);
        Route::patch('/users/{user}', [UserController::class, 'update']);
        Route::get('/reports', [ReportController::class, 'index']);
        Route::get('/calls', [RepairRequestController::class, 'index']); 
        Route::apiResource('services', ServiceController::class); // Админ вэбээс үйлчилгээний төрөл удирдах
    });

    /* --- MANAGER ХЭСЭГ --- */
    Route::prefix('manager')->group(function () {
        Route::get('/dashboard/pending-technicians', [ManagerDashboardController::class, 'getPendingTechnicians']);
        Route::put('/technicians/{id}/verify', [ManagerDashboardController::class, 'verifyTechnician']);
    });

    // ==========================================
    // Хуучин CallController-ийн замууд (Цаашид төлбөр, үнэлгээ хийх үед сэргээж ашиглана)
    // ==========================================
    // Route::post('/calls/{id}/pay-deposit', [CallController::class, 'payDeposit']);
    // Route::post('/calls/{id}/pay-final', [CallController::class, 'payFinalAmount']);
    // Route::post('/calls/{id}/review', [CallController::class, 'submitReview']);
    // Route::get('/technicians/{id}/profile', [CallController::class, 'getTechnicianProfile']);
});