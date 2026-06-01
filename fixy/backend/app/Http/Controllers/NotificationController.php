<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\SystemNotification;

class NotificationController extends Controller
{
    // 1. Өөрт ирсэн бүх мэдэгдлийг татах
    public function index(Request $request)
    {
        $notifications = SystemNotification::where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $notifications
        ]);
    }

    // 2. Мэдэгдлийг уншсан төлөвт оруулах
    public function markAsRead(Request $request, $id)
    {
        $notification = SystemNotification::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->first();

        if ($notification) {
            $notification->is_read = true;
            $notification->save();
        }

        return response()->json(['success' => true]);
    }
}