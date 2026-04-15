<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\RepairRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class RepairRequestController extends Controller
{
    // 1. Админ вэб рүү дуудлагуудыг илгээх
    public function index(Request $request)
    {
        $status = $request->query('status');
        $query = RepairRequest::with('customer');

        if ($status && $status !== 'all') {
            $query->where('status', $status);
        }

        $calls = $query->orderBy('created_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => $calls
        ]);
    }

    // 2. Хэрэглэгчийн Апп-аас дуудлага ҮҮСГЭХ (Хадгалах)
    public function store(Request $request)
    {
        try {
            // Баазад шинэ дуудлага үүсгэх
            $call = new RepairRequest();
            $call->customer_id = Auth::id(); // Дуудлага өгч буй хэрэглэгчийн ID
            $call->service_type = $request->service_type;
            $call->description = $request->description;
            $call->address = $request->address;
            $call->status = 'pending'; // Шинэ дуудлага

            // Хэрэв тусгайлан засварчин сонгосон бол ID-г нь хадгалах
            if ($request->has('technician_id') && $request->technician_id !== 'null') {
                $call->technician_id = $request->technician_id;
            }

            // ЗУРАГ: Хэрэв зураг хавсаргасан байвал хадгалах
            if ($request->hasFile('image')) {
                // Зургийг public/requests_images хавтсанд хадгалах
                $imagePath = $request->file('image')->store('requests_images', 'public');
                
                // АЛДААГ ЗАССАН ХЭСЭГ: image биш image_path байна
                $call->image_path = $imagePath; 
            }

            $call->save();

            return response()->json([
                'success' => true,
                'data' => $call,
                'message' => 'Дуудлага амжилттай бүртгэгдлээ'
            ], 201);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Алдаа: ' . $e->getMessage()
            ], 500);
        }
    }

    // 3. Засварчны Апп-д зориулсан "Шинэ дуудлагууд" татах
    public function getPendingCalls()
    {
        $user = Auth::user();

        $calls = \App\Models\RepairRequest::where('status', 'pending')
            ->where('service_type', $user->service_type) // Өөрийнх нь мэргэжил байх
            ->where(function ($query) use ($user) {
                // 1. Хэнд ч хаяглагдаагүй ЕРӨНХИЙ дуудлага
                $query->whereNull('technician_id')
                // 2. ЭСВЭЛ яг энэ засварчинд зориулж СОНГОСОН дуудлага
                      ->orWhere('technician_id', $user->id);
            })
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $calls
        ]);
    }

    // Засварчин дуудлагыг хүлээн авах
    public function acceptCall($id)
    {
        $user = Auth::user();
        $call = RepairRequest::find($id);

        if (!$call || $call->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Энэ дуудлага олдсонгүй эсвэл өөр хүн хүлээж авсан байна.'
            ], 400);
        }

        // СОНГОСОН дуудлагыг өөртөө хариуцуулж 'accepted' болгох
        $call->technician_id = $user->id; 
        $call->status = 'accepted';
        $call->save();

        // БУСАД ДУУДЛАГЫГ ЦУЦЛАХ:
        RepairRequest::where('technician_id', $user->id)
            ->where('status', 'pending')
            ->where('id', '!=', $id) 
            ->update(['status' => 'cancelled']); 

        // Засварчин ажилд гарсан тул Газрын зураг дээрээс Офлайн болгох
        $user->is_on_duty = 0;
        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Дуудлагыг амжилттай хүлээж авлаа. Бусад дуудлагууд цуцлагдсан.'
        ]);
    }

    // Хэрэглэгч газрын зургаас засварчин сонгож дуудлагаа илгээх
    public function assignTechnician(Request $request, $id)
    {
        $call = RepairRequest::find($id);

        if (!$call) {
            return response()->json(['success' => false, 'message' => 'Дуудлага олдсонгүй'], 404);
        }

        // Сонгосон засварчны ID-г дуудлагад хадгалах
        $call->technician_id = $request->technician_id;
        $call->save();

        return response()->json([
            'success' => true,
            'message' => 'Дуудлагыг засварчин руу амжилттай илгээлээ'
        ]);
    }
    // Ажлыг дуусгах (Зураг хавсаргаж)
    public function completeCall(Request $request, $id)
    {
        $user = Auth::user();
        $call = RepairRequest::where('id', $id)->where('technician_id', $user->id)->first();

        if (!$call) {
            return response()->json(['success' => false, 'message' => 'Дуудлага олдсонгүй.'], 404);
        }

        $call->status = 'completed';

        // Хэрэв дууссан ажлын зураг ирвэл хадгалах
        if ($request->hasFile('completed_image')) {
            $path = $request->file('completed_image')->store('completed_jobs', 'public');
            // АНХААР: Танай баазад completed_image_path гэсэн багана байх шаардлагатай!
            $call->completed_image_path = $path; 
        }

        $call->save();

        // Засварчин суларсан тул дахин дуудлага хүлээж авахад бэлэн (Онлайн) болгох
        $user->is_on_duty = 1;
        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Ажил амжилттай дууслаа.'
        ]);
    }
}