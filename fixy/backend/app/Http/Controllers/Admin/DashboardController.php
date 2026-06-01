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
            $totalUsers = User::where('role_id', 4)->count(); 
            $totalTechnicians = User::where('role_id', 5)->count();
            $activeCalls = DB::table('repair_requests')
                ->whereIn('status', ['pending', 'accepted', 'assigned', 'in_progress'])
                ->count();                
            $completedCalls = DB::table('repair_requests')
                ->where('status', 'completed')
                ->count();           
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
            $last7Days = collect(range(6, 0))->map(function($days) {
                return now()->subDays($days)->format('Y-m-d');
            });

            $callsTrend = DB::table('repair_requests')
                ->where('created_at', '>=', now()->subDays(6)->startOfDay())
                ->select(DB::raw('DATE(created_at) as date'), DB::raw('COUNT(*) as total'))
                ->groupBy('date')
                ->get()
                ->keyBy('date');

            $trendData = $last7Days->map(function($date) use ($callsTrend) {
                return [
                    'name' => date('m/d', strtotime($date)), 
                    'Нийт' => $callsTrend->has($date) ? $callsTrend[$date]->total : 0 
                ];
            })->values(); 
            $serviceDistribution = DB::table('repair_requests')
                ->select('service_type as name', DB::raw('COUNT(*) as value'))
                ->whereNotNull('service_type')
                ->groupBy('service_type')
                ->get();
            return response()->json([
                'success' => true,
                'stats' => [
                    'totalUsers' => $totalUsers,
                    'technicians' => $totalTechnicians,
                    'activeCalls' => $activeCalls,
                    'completedCalls' => $completedCalls
                ],
                'recentCalls' => $recentCalls,
                'trendData' => $trendData,
                'serviceDistribution' => $serviceDistribution
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Алдаа гарлаа: ' . $e->getMessage()
            ], 500);
        }
    }
}