<?php

namespace App\Http\Controllers\Manager;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;

class ManagerDashboardController extends Controller
{
    /**
     * Менежерийн Dashboard-д зориулсан мэдээллийг буцаах
     */
    public function getPendingTechnicians()
    {
        try {
            // Мэдээлэл татахдаа id_card_image болон certificate_image багануудыг цуг авна
            $pendingTechnicians = User::where('role_id', 5)
                                      ->where('status', 'pending')
                                      ->select('id', 'name', 'email', 'phone', 'id_card_image', 'certificate_image', 'created_at') // Энэ мөрийг нэмлээ
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
     * Засварчныг баталгаажуулах (Зөвшөөрөх)
     */
    public function verifyTechnician($id)
    {
        try {
            $technician = User::where('role_id', 5)->findOrFail($id);
            
            // Төлөвийг 'active' болгож өөрчлөх
            $technician->status = 'active';
            $technician->save();

            return response()->json([
                'success' => true,
                'message' => 'Засварчин амжилттай баталгаажлаа.'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Алдаа гарлаа: ' . $e->getMessage()
            ], 500);
        }
    }
    public function rejectTechnician($id)
    {
        try {
            $technician = User::where('role_id', 5)->findOrFail($id);
            
            // Төлөвийг 'rejected' болгож өөрчлөх эсвэл шууд устгах
            $technician->status = 'rejected'; 
            $technician->save();

            return response()->json([
                'success' => true,
                'message' => 'Засварчны хүсэлтээс татгалзлаа.'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Алдаа гарлаа: ' . $e->getMessage()
            ], 500);
        }
    }
}