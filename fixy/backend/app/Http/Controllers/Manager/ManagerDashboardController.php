<?php

namespace App\Http\Controllers\Manager;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Complaint;
use Illuminate\Support\Facades\DB;
use App\Models\SystemNotification;
use Barryvdh\DomPDF\Facade\Pdf;

class ManagerDashboardController extends Controller
{
    public function getPendingTechnicians()
    {
        try {
            $pendingTechnicians = User::where('role_id', 5)
                ->where('status', 'pending')
                ->select([
                    'id', 
                    'name', 
                    'email', 
                    'phone', 
                    'id_card_image', 
                    'certificate_image', 
                    'contract_status',
                    'signature_path',
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
    public function approveContract($id)
    {
        try {
            $technician = User::where('role_id', 5)->findOrFail($id);

            if ($technician->contract_status !== 'signed') {
                return response()->json([
                    'success' => false, 
                    'message' => 'Батлах боломжгүй. Засварчин хараахан гарын үсэг зураагүй байна.'
                ], 400);
            }

            $technician->contract_status = 'approved';
            $technician->status = 'active'; 
            $technician->save();
            \App\Models\SystemNotification::create([
                'user_id' => $technician->id, 
                'title' => 'Гэрээ батлагдлаа 🎉',
                'desc' => 'Таны системд илгээсэн гэрээ амжилттай батлагдлаа. Та одооноос дуудлага хүлээн авах бүрэн боломжтой боллоо.',
                'type' => 'system', 
                'is_read' => false
            ]);

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
    public function sendWarning(Request $request, $id)
    {
        try {
            SystemNotification::create([
                'user_id' => $id,
                'title' => 'Менежерээс сануулга ирлээ',
                'desc' => $request->input('message', 'Таны үйл ажиллагаатай холбоотой гомдол ирлээ. Анхаарна уу!'),
                'type' => 'warning',
            ]);

            return response()->json([
                'success' => true, 
                'message' => 'Сануулга амжилттай илгээгдлээ.'
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Алдаа: ' . $e->getMessage()], 500);
        }
    }

    public function suspendTechnician($id)
    {
        try {
            $technician = User::where('role_id', 5)->findOrFail($id);
            $technician->status = 'suspended'; 
            $technician->save();

            return response()->json([
                'success' => true, 
                'message' => 'Засварчны эрхийг амжилттай түдгэлзүүллээ.'
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Алдаа: ' . $e->getMessage()], 500);
        }
    }
    public function getContracts()
    {
        $technicians = User::where('role_id', 5)
            ->whereIn('contract_status', ['sent', 'signed', 'approved'])
            ->select('id', 'name', 'phone', 'email', 'contract_status', 'contract_signed_at', 'signature_path')
            ->orderBy('updated_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $technicians
        ]);
    }

    public function downloadContractPdf($id)
    {
        $technician = User::where('role_id', 5)->findOrFail($id);
        
        // ШИЙДЭЛ 1: Яг одоо нэвтэрсэн байгаа Менежерийн мэдээллийг авах
        $manager = auth()->user(); 

        if (!in_array($technician->contract_status, ['signed', 'approved'])) {
            return response()->json(['success' => false, 'message' => 'Гэрээ зурагдаагүй байна'], 400);
        }

        // ШИЙДЭЛ 2: technician болон manager хоёуланг нь PDF рүү дамжуулах
        $pdf = \PDF::loadView('manager.contract_pdf', compact('technician', 'manager'));
        
        return $pdf->download('Geree_' . $technician->name . '.pdf');
    }
}