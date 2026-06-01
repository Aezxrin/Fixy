<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;

// Controllers
use App\Http\Controllers\Admin\{AuthController, UserController, DashboardController, ReportController, RepairRequestController, ServiceController};
use App\Http\Controllers\Admin\NotificationController as AdminNotificationController;
use App\Http\Controllers\Manager\ManagerDashboardController;
use App\Http\Controllers\Financial\WithdrawalController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\Admin\PayoutController;
/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);
Route::post('/admin/login', [AuthController::class, 'login']);

Route::get('/services', function () {
    return response()->json([
        'success' => true,
        'data' => DB::table('services')->select('id', 'name')->get()
    ]);
});

/*
|--------------------------------------------------------------------------
| Protected Routes
|--------------------------------------------------------------------------
*/
Route::middleware(['auth:sanctum'])->group(function () {

    Route::get('/me', [AuthController::class, 'me']); 
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::patch('/profile/update', [UserController::class, 'updateProfile']);
    Route::patch('/profile/password', [UserController::class, 'updatePassword']);
    Route::post('/profile/avatar', [UserController::class, 'uploadAvatar']);

    // Иргэн
    Route::get('/customer/online-technicians', [UserController::class, 'getOnlineTechnicians']); 
    Route::get('/customer/my-calls', [RepairRequestController::class, 'getCustomerCalls']);
    Route::post('/calls', [RepairRequestController::class, 'store']); 
    Route::post('/calls/{id}/assign', [RepairRequestController::class, 'assignTechnician']); 
    Route::post('/calls/{id}/cancel', [RepairRequestController::class, 'cancelRequest']);
    Route::post('/calls/{id}/pay', [RepairRequestController::class, 'payCallFee']);
    Route::post('/calls/{id}/finalize-payment', [RepairRequestController::class, 'finalizePayment']);
    Route::post('/requests/{id}/pay', [RepairRequestController::class, 'processPayment']);
    Route::post('/calls/{id}/review', [RepairRequestController::class, 'submitReview']);

    // Засварчин
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
    Route::get('/technician/withdraw-history', [WithdrawalController::class, 'getMyHistory']);
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::put('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    
    // Админ
    Route::prefix('admin')->group(function () {
        Route::get('/dashboard/summary', [DashboardController::class, 'summary']);
        Route::get('/users', [UserController::class, 'index']);
        Route::get('/users/{user}', [UserController::class, 'show']);
        Route::patch('/users/{user}', [UserController::class, 'update']);
        Route::get('/reports', [ReportController::class, 'index']);
        Route::get('/calls', [RepairRequestController::class, 'index']); 
        Route::apiResource('services', ServiceController::class); 
        Route::get('/notifications', [AdminNotificationController::class, 'index']);
        Route::delete('/requests/{id}', [RepairRequestController::class, 'destroy']);
        Route::get('/archived-requests', [RepairRequestController::class, 'getArchived']);
        Route::post('/requests/{id}/restore', [RepairRequestController::class, 'restore']);
    });

    // Mенежер
    Route::prefix('manager')->group(function () {
        Route::get('/dashboard/pending-technicians', [ManagerDashboardController::class, 'getPendingTechnicians']);
        Route::get('/complaints', [ManagerDashboardController::class, 'getComplaints']);
        Route::put('/complaints/{id}/resolve', [ManagerDashboardController::class, 'resolveComplaint']);
        Route::get('/users/search', [ManagerDashboardController::class, 'searchUsers']);
        Route::get('/users/{id}/profile', [ManagerDashboardController::class, 'getUserProfile']);
        Route::put('/technicians/{id}/verify', [ManagerDashboardController::class, 'verifyTechnician']);
        Route::post('/technicians/{id}/send-contract', [ManagerDashboardController::class, 'sendContract']);
        Route::post('/technicians/{id}/approve-contract', [ManagerDashboardController::class, 'approveContract']);
        Route::post('/technicians/{id}/send-warning', [ManagerDashboardController::class, 'sendWarning']);
        Route::post('/technicians/{id}/suspend', [ManagerDashboardController::class, 'suspendTechnician']);
        Route::get('/contracts', [ManagerDashboardController::class, 'getContracts']);
        Route::get('/contracts/{id}/pdf', [ManagerDashboardController::class, 'downloadContractPdf']);
    });

    // Санхүүгийн ажилтан
    Route::prefix('finance')->group(function () {
        Route::get('/withdrawals/pending', [WithdrawalController::class, 'getPendingWithdrawals']);
        Route::post('/withdrawals/{id}/approve', [WithdrawalController::class, 'approveWithdrawal']);
    });
});