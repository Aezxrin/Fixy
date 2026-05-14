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
use App\Http\Controllers\Admin\NotificationController;
use App\Http\Controllers\Financial\WithdrawalController;

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
    
    // ==========================================
    // ЕРӨНХИЙ ПРОФАЙЛ БОЛОН AUTH 
    // ==========================================
    Route::get('/me', [AuthController::class, 'me']); 
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::patch('/profile/update', [UserController::class, 'updateProfile']);
    Route::patch('/profile/password', [UserController::class, 'updatePassword']);
    Route::post('/profile/avatar', [UserController::class, 'uploadAvatar']);

    // ==========================================
    // 1. ИРГЭНИЙ АПП (Customer)
    // ==========================================
    Route::get('/customer/online-technicians', [UserController::class, 'getOnlineTechnicians']); 
    Route::get('/customer/my-calls', [RepairRequestController::class, 'getCustomerCalls']);
    
    Route::post('/calls', [RepairRequestController::class, 'store']); 
    Route::post('/calls/{id}/assign', [RepairRequestController::class, 'assignTechnician']); 
    Route::post('/calls/{id}/cancel', [RepairRequestController::class, 'cancelRequest']); // ЭНД ЗАСАЖ НЭМСЭН
    Route::post('/calls/{id}/pay', [RepairRequestController::class, 'payCallFee']);
    Route::post('/calls/{id}/finalize-payment', [RepairRequestController::class, 'finalizePayment']);
    Route::post('/requests/{id}/pay', [RepairRequestController::class, 'processPayment']);
    Route::post('/calls/{id}/review', [RepairRequestController::class, 'submitReview']);

    // ==========================================
    // 2. ЗАСВАРЧНЫ АПП (Technician)
    // ==========================================
    Route::post('/technician/toggle-duty', [UserController::class, 'toggleDuty']); 
    Route::get('/technicians/{id}', [UserController::class, 'show']); 
    
    Route::get('/technician/pending-calls', [RepairRequestController::class, 'getPendingCalls']); 
    Route::post('/technician/calls/{id}/accept', [RepairRequestController::class, 'acceptCall']); 
    Route::get('/technician/my-jobs', [RepairRequestController::class, 'getMyJobs']); 
    Route::post('/technician/calls/{id}/complete', [RepairRequestController::class, 'completeCall']); 
    Route::get('/technician/stats', [RepairRequestController::class, 'getStats']); 
    Route::post('/technician/contract/sign', [UserController::class, 'signContract']);
    Route::post('/technician/calls/{id}/confirm-cash', [RepairRequestController::class, 'confirmCashPayment']);
    Route::post('/technician/withdraw-request', [WithdrawalController::class, 'store']);
    
    // ==========================================
    // 3. ADMIN ХЭСЭГ
    // ==========================================
    Route::prefix('admin')->group(function () {
        Route::get('/dashboard/summary', [DashboardController::class, 'summary']);
        Route::patch('/profile/password', [UserController::class, 'updatePassword']);
        Route::patch('/profile/update', [UserController::class, 'updateProfile']);
        
        Route::get('/users', [UserController::class, 'index']); // 'admin/users' гэж давхардаж байсныг зассан
        Route::get('/users/{user}', [UserController::class, 'show']);
        Route::patch('/users/{user}', [UserController::class, 'update']);
        
        Route::get('/reports', [ReportController::class, 'index']);
        Route::get('/calls', [RepairRequestController::class, 'index']); 
        Route::apiResource('services', ServiceController::class); 
        Route::get('/notifications', [NotificationController::class, 'index']);
    });

    // ==========================================
    // 4. MANAGER ХЭСЭГ
    // ==========================================
    Route::prefix('manager')->group(function () {
        Route::get('/dashboard/pending-technicians', [ManagerDashboardController::class, 'getPendingTechnicians']);
        Route::get('/complaints', [ManagerDashboardController::class, 'getComplaints']);
        Route::put('/complaints/{id}/resolve', [ManagerDashboardController::class, 'resolveComplaint']);
        
        Route::get('/users/search', [ManagerDashboardController::class, 'searchUsers']);
        Route::get('/users/{id}/profile', [ManagerDashboardController::class, 'getUserProfile']);
        
        // Групп дотор дахин групп үүсгэж алдаа гаргасныг цэгцлэв
        Route::put('/technicians/{id}/verify', [ManagerDashboardController::class, 'verifyTechnician']);
        Route::post('/technicians/{id}/send-contract', [ManagerDashboardController::class, 'sendContract']);
        Route::post('/technicians/{id}/approve-contract', [ManagerDashboardController::class, 'approveContract']);
    });

    // ==========================================
    // 5. FINANCE ХЭСЭГ
    // ==========================================
    Route::middleware(['auth:sanctum'])->group(function () {
    // Санхүүгийн хэсэг
    Route::get('/finance/withdrawals/pending', [WithdrawalController::class, 'getPendingWithdrawals']);
    Route::post('/finance/withdrawals/{id}/approve', [WithdrawalController::class, 'approveWithdrawal']);
});
});