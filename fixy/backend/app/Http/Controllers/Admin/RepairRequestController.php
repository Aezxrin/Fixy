<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\RepairRequest;
use Illuminate\Http\Request;

class RepairRequestController extends Controller
{
    public function index(Request $request)
    {
        // Вэбээс "pending", "completed" гэх мэт шүүлтүүр ирвэл барьж авах
        $status = $request->query('status');

        // with('customer') нь дуудлага өгсөн хүний нэр, мэдээллийг давхар татаж авчирна
        $query = RepairRequest::with('customer');

        // Хэрэв шүүлтүүр ирсэн бөгөөд тэр нь 'all' биш бол
        if ($status && $status !== 'all') {
            $query->where('status', $status);
        }

        // Хамгийн сүүлд өгсөн дуудлага нь хамгийн дээрээ гарах (Шинэ нь эхэндээ)
        $calls = $query->orderBy('created_at', 'desc')->get();

        // Вэб рүү датагаа буцаах
        return response()->json([
            'success' => true,
            'data' => $calls
        ]);
    }
}