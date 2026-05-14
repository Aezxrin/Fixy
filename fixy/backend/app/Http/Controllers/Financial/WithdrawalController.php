<?php

namespace App\Http\Controllers\Financial;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\WithdrawalRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class WithdrawalController extends Controller
{
    /**
     * 1. Хүлээгдэж буй бүх хүсэлтийг татах
     */
    public function getPendingWithdrawals()
    {
        $user = Auth::user();

        // Таны хэлснээр Санхүүгийн ажилтан бол 3. 
        // Мөн Админ (1) нар давхар харах эрхтэй байхаар тохирууллаа.
        if ($user->role_id !== 3 && $user->role_id !== 1) {
            return response()->json([
                'success' => false,
                'message' => 'Танд энэ мэдээллийг харах эрх байхгүй. (Таны ID: ' . $user->role_id . ')'
            ], 403);
        }

        $requests = WithdrawalRequest::with('user')
            ->where('status', 'pending')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $requests
        ]);
    }

    /**
     * 2. Гүйлгээг батлах
     */
    public function approveWithdrawal(Request $request, $id)
    {
        $user = Auth::user();

        // Энд мөн адил 3 (Санхүү) эсвэл 1 (Админ) эсэхийг шалгана
        if ($user->role_id !== 3 && $user->role_id !== 1) {
            return response()->json([
                'success' => false,
                'message' => 'Танд энэ үйлдлийг хийх эрх байхгүй.'
            ], 403);
        }

        $withdrawal = WithdrawalRequest::findOrFail($id);

        if ($withdrawal->status !== 'pending') {
            return response()->json([
                'success' => false, 
                'message' => 'Энэ хүсэлт аль хэдийн шийдвэрлэгдсэн байна.'
            ], 400);
        }

        try {
            DB::transaction(function () use ($withdrawal) {
                $withdrawal->status = 'approved';
                $withdrawal->save();

                $technician = $withdrawal->user;
                if ($technician) {
                    $technician->decrement('balance', $withdrawal->amount);
                }
            });

            return response()->json([
                'success' => true, 
                'message' => 'Гүйлгээ амжилттай баталгаажлаа.'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Алдаа гарлаа: ' . $e->getMessage()
            ], 500);
        }
    }
    
}