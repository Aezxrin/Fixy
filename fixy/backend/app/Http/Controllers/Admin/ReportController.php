<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Barryvdh\DomPDF\Facade\Pdf; 

class ReportController extends Controller
{
    public function index(Request $request)
    {
        // 1. Утгуудыг уншихдаа trim() ашиглаж илүү зайг устгах (Алдаанаас сэргийлэх)
        $type = trim($request->input('type'));
        $action = trim($request->input('action')); 
        $from = $request->input('from');
        $to = $request->input('to');
        $serviceType = $request->input('service_type');
        $techName = $request->input('tech_name');

        // ==========================================
        // 1. ЗАСВАРЧДЫН ТАЙЛАН
        // ==========================================
        if ($type === 'technicians') {
            $query = DB::table('users')->where('role_id', 5);

            if ($from) $query->whereDate('created_at', '>=', $from);
            if ($to) $query->whereDate('created_at', '<=', $to);

            $technicians = $query->select(
                    'id', 'name', 'email', 'status', 'service_type',
                    DB::raw('(SELECT COUNT(*) FROM repair_requests WHERE repair_requests.technician_id = users.id AND status = "completed") as total_jobs'),
                    DB::raw('(SELECT AVG(rating) FROM repair_requests WHERE repair_requests.technician_id = users.id) as avg_rating')
                )->get();

            if ($action === 'preview') return response()->json($technicians);

            $pdf = Pdf::loadView('technicians', compact('technicians'));
            return $pdf->download('technicians_report.pdf');
        }

        // ==========================================
        // 2. ДУУДЛАГЫН ТАЙЛАН
        // ==========================================
        if ($type === 'calls') {
            $query = DB::table('repair_requests')
                ->leftJoin('users as customer', 'repair_requests.customer_id', '=', 'customer.id')
                ->leftJoin('users as technician', 'repair_requests.technician_id', '=', 'technician.id')
                ->select(
                    'repair_requests.id', 'repair_requests.service_type', 'repair_requests.image_path',
                    'repair_requests.completed_image_path', 'repair_requests.description', 'repair_requests.status',
                    'repair_requests.address', 'repair_requests.rating', 'repair_requests.repair_fee as price',
                    'customer.name as customer_name', 'technician.name as tech_name', 'repair_requests.created_at'
                );

            if ($from) $query->whereDate('repair_requests.created_at', '>=', $from);
            if ($to) $query->whereDate('repair_requests.created_at', '<=', $to);
            if ($serviceType) $query->where('repair_requests.service_type', $serviceType);
            if ($techName) $query->where('technician.name', 'LIKE', "%{$techName}%");

            $calls = $query->get();

            if ($action === 'preview') return response()->json($calls);

            $pdf = Pdf::loadView('calls', compact('calls'))->setPaper('a4', 'landscape');                    
            return $pdf->download('calls_report.pdf');
        }

        // ==========================================
        // 3. ҮЙЛЧЛҮҮЛЭГЧДИЙН ТАЙЛАН
        // ==========================================
        if ($type === 'users') {
            $query = DB::table('users')->where('role_id', 4);
            
            if ($from) $query->whereDate('created_at', '>=', $from);
            if ($to) $query->whereDate('created_at', '<=', $to);
            
            $customers = $query->get();

            if ($action === 'preview') return response()->json($customers);

            $pdf = Pdf::loadView('customers', compact('customers'))->setPaper('a4', 'landscape');                    
            return $pdf->download('customers_report.pdf');
        }       
        
        // ==========================================
        // 4. САНХҮҮГИЙН ТАЙЛАН
        // ==========================================
        if ($type === 'finance') {
            $query = DB::table('repair_requests')
                ->join('users', 'repair_requests.technician_id', '=', 'users.id')
                ->where('repair_requests.status', 'completed');

            if ($from) $query->whereDate('repair_requests.created_at', '>=', $from);
            if ($to) $query->whereDate('repair_requests.created_at', '<=', $to);
            if ($serviceType) $query->where('repair_requests.service_type', $serviceType);
            if ($techName) $query->where('users.name', 'LIKE', "%{$techName}%");

            $financeData = $query->select(
                    'users.name as tech_name',
                    DB::raw('COUNT(repair_requests.id) as total_jobs'),
                    DB::raw('SUM(repair_requests.repair_fee) as total_revenue'),
                    DB::raw('(SUM(repair_requests.repair_fee) * 0.10) as commission'),
                    DB::raw('(SUM(repair_requests.repair_fee) * 0.90) as net_income')
                )
                ->groupBy('users.id', 'users.name')
                ->get();

            if ($action === 'preview') return response()->json($financeData);

            $pdf = Pdf::loadView('finance', ['calls' => $financeData])->setPaper('a4', 'landscape');
            return $pdf->download('finance_report.pdf');
        }
        
        // Хэрэв үнэхээр төрөл таарахгүй бол алдаа буцаах
        return response()->json(['success' => false, 'message' => 'Тайлангийн төрөл олдсонгүй']);
    }
}