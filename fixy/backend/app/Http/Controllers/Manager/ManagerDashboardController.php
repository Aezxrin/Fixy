<?php

namespace App\Http\Controllers\Manager;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Complaint;
use Illuminate\Support\Facades\DB;

class ManagerDashboardController extends Controller
{
    /**
     * Менежерийн Dashboard-д зориулсан хүлээгдэж буй засварчдыг буцаах
     */
    public function getPendingTechnicians()
    {
        try {
            // ШИЙДЭЛ: contract_status болон signature_path-ийг заавал select дотор нэмэх ёстой
            $pendingTechnicians = User::where('role_id', 5)
                ->where('status', 'pending')
                ->select([
                    'id', 
                    'name', 
                    'email', 
                    'phone', 
                    'id_card_image', 
                    'certificate_image', 
                    'contract_status', // Нэмсэн
                    'signature_path',  // Нэмсэн
                    'created_at'
                ])
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $pendingTechnicians
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Өгөгдөл татахад алдаа гарлаа: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Менежер засварчин руу цахим гэрээ илгээх
     */
    public function sendContract($id)
    {
        try {
            $technician = User::where('role_id', 5)->findOrFail($id);

            $technician->contract_status = 'sent';
            $technician->save();

            return response()->json([
                'success' => true, 
                'message' => 'Засварчин руу цахим гэрээ амжилттай илгээгдлээ.'
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Алдаа: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Менежер гарын үсэгтэй гэрээг баталж, эрх олгох
     */
    public function approveContract($id)
    {
        try {
            $technician = User::where('role_id', 5)->findOrFail($id);

            // Хэрэв засварчин гэрээгээ зураагүй байвал батлах боломжгүй
            if ($technician->contract_status !== 'signed') {
                return response()->json([
                    'success' => false, 
                    'message' => 'Батлах боломжгүй. Засварчин хараахан гарын үсэг зураагүй байна.'
                ], 400);
            }

            $technician->contract_status = 'approved';
            $technician->status = 'active'; // Систем ашиглах эрхийг идэвхтэй болгоно
            $technician->save();

            return response()->json([
                'success' => true, 
                'message' => 'Гэрээг баталж, засварчны эрхийг амжилттай нээлээ.'
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Алдаа: ' . $e->getMessage()], 500);
        }
    }

    public function getComplaints()
    {
        $complaints = \App\Models\RepairRequest::with(['customer', 'technician'])
            ->whereNotNull('review')
            ->where('is_complaint_resolved', false)
            ->orderBy('updated_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $complaints
        ]);
    }
    public function resolveComplaint(Request $request, $id)
    {
        $complaint = \App\Models\RepairRequest::find($id);

        if (!$complaint) {
            return response()->json(['success' => false, 'message' => 'Олдсонгүй'], 404);
        }

        $complaint->is_complaint_resolved = true;
        $complaint->save();

        return response()->json([
            'success' => true,
            'message' => 'Гомдлыг амжилттай шийдвэрлэлээ.'
        ]);
    }

    /**
     * Хэрэглэгч/Засварчин хайх
     */
    public function searchUsers(Request $request)
    {
        $q = $request->query('q');
        if (!$q) return response()->json(['success' => true, 'data' => []]);

        $users = User::where(function($query) use ($q) {
            $query->where('name', 'like', "%{$q}%")
                  ->orWhere('phone', 'like', "%{$q}%")
                  ->orWhere('email', 'like', "%{$q}%");
        })->limit(10)->get();

        return response()->json(['success' => true, 'data' => $users]);
    }

    /**
     * Профайл болон түүх татах
     */
    public function getUserProfile($id)
    {
        try {
            $user = User::findOrFail($id);
            $calls = DB::table('repair_requests')
                        ->where('customer_id', $id)
                        ->orWhere('technician_id', $id)
                        ->orderBy('created_at', 'desc')
                        ->get();

            return response()->json([
                'success' => true,
                'data' => [
                    'user' => $user,
                    'calls' => $calls
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Мэдээлэл олдсонгүй'], 404);
        }
    }


}