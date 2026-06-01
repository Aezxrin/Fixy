<?php

namespace App\Http\Controllers\Financial;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\WithdrawalRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class WithdrawalController extends Controller
{
    public function getPendingWithdrawals()
    {
        $user = Auth::user();
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
    public function approveWithdrawal(Request $request, $id)
    {
        $user = Auth::user();
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
    public function store(Request $request)
    {
        $user = Auth::user();
        $request->validate([
            'amount' => 'required|numeric|min:1000', 
            'bank_name' => 'required|string',
            'account_number' => 'required|string',
            'account_holder' => 'required|string',
        ]);
        if ($user->balance < $request->amount) {
            return response()->json([
                'success' => false,
                'message' => 'Таны үлдэгдэл хүрэлцэхгүй байна.'
            ], 400);
        }
        try {
            WithdrawalRequest::create([
                'user_id' => $user->id,
                'amount' => $request->amount,
                'bank_name' => $request->bank_name,
                'account_number' => $request->account_number,
                'account_holder' => $request->account_holder,
                'status' => 'pending',
            ]);
            return response()->json([
                'success' => true,
                'message' => 'Таны хүсэлт амжилттай илгээгдлээ.'
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Хүсэлт үүсгэхэд алдаа гарлаа: ' . $e->getMessage()
            ], 500);
        }
    }
    public function getMyHistory()
    {
        $user = Auth::user();
        $history = WithdrawalRequest::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $history
        ]);
    }
}