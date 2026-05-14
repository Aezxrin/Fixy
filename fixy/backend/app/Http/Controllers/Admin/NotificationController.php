<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\SystemNotification;

class NotificationController extends Controller
{
    public function index()
    {
        // Хамгийн сүүлд орсон мэдэгдлүүдийг огноогоор нь уруудаж татах
        $notifications = SystemNotification::orderBy('created_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => $notifications
        ]);
    }
}