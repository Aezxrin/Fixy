<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function summary()
    {
        try {
            // 1. Хэрэглэгч болон Засварчдын тоо
            $totalUsers = User::where('role_id', 4)->count(); 
            $totalTechnicians = User::where('role_id', 5)->count();

            // 2. Дуудлагын статистик (repair_requests хүснэгтээс)
            $activeCalls = DB::table('repair_requests')
                ->whereIn('status', ['pending', 'accepted', 'assigned', 'in_progress'])
                ->count(); 
                
            $completedCalls = DB::table('repair_requests')
                ->where('status', 'completed')
                ->count();

            // 3. Сүүлийн 5 хүсэлтийг хэрэглэгчийн нэртэй цуг татах
            $recentCalls = DB::table('repair_requests')
                ->leftJoin('users', 'repair_requests.customer_id', '=', 'users.id')
                ->select(
                    'repair_requests.id',
                    'users.name as customer_name',
                    'repair_requests.service_type',
                    'repair_requests.status',
                    'repair_requests.created_at'
                )
                ->orderBy('repair_requests.created_at', 'desc')
                ->limit(5)
                ->get();

            return response()->json([
                'success' => true,
                'stats' => [
                    'totalUsers' => $totalUsers,
                    'technicians' => $totalTechnicians,
                    'activeCalls' => $activeCalls,
                    'completedCalls' => $completedCalls
                ],
                'recentCalls' => $recentCalls
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Алдаа гарлаа: ' . $e->getMessage()
            ], 500);
        }
    }
}