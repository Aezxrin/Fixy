<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\RepairRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth; // Auth ашиглахын тулд үүнийг нэмсэн

class RepairRequestController extends Controller
{
    // 1. Админ вэб рүү дуудлагуудыг илгээх (Таны өмнөх код хэвээрээ)
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
        // Баазад шинэ дуудлага үүсгэх
        $call = new RepairRequest();
        $call->customer_id = Auth::id(); // Дуудлага өгч буй хэрэглэгчийн ID
        $call->service_type = $request->service_type;
        $call->description = $request->description;
        $call->address = $request->address;
        $call->status = 'pending'; // Шинэ дуудлага

        // УХААЛАГ ШИЛЖИЛТ: Хэрэв тусгайлан засварчин сонгосон бол ID-г нь хадгалах
        if ($request->has('technician_id') && $request->technician_id !== 'null') {
            $call->technician_id = $request->technician_id;
        }

        // ЗУРАГ: Хэрэв зураг хавсаргасан байвал хадгалах
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('requests', 'public');
            $call->image = $imagePath; // Бааздаа image гэсэн баганатай байх шаардлагатай
        }

        $call->save();

        return response()->json([
            'success' => true,
            'data' => $call,
            'message' => 'Дуудлага амжилттай бүртгэгдлээ'
        ]);
    }

    // 3. Засварчны Апп-д зориулсан "Шинэ дуудлагууд" татах
    public function getPendingCalls()
    {
        // 1. Одоо нэвтэрсэн байгаа Засварчны мэдээллийг авах
        $user = Auth::user();

        // 2. Зөвхөн тухайн засварчны үйлчилгээний төрөлтэй ижил дуудлагуудыг шүүх
        $calls = \App\Models\RepairRequest::where('status', 'pending')
            ->whereNull('technician_id') // Хэнд ч оноогдоогүй байх (эсвэл)
            ->where('service_type', $user->service_type) // <--- ХАМГИЙН ГОЛ ШҮҮЛТҮҮР ЭНЭ БАЙНА
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

        // 1. Дуудлага байгаа эсэх, мөн хэн нэгэн аль хэдийн авчихсан эсэхийг шалгах
        if (!$call || $call->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Энэ дуудлага олдсонгүй эсвэл өөр хүн хүлээж авсан байна.'
            ], 400);
        }

        // 2. СОНГОСОН дуудлагыг өөртөө хариуцуулж 'accepted' (Хүлээн авсан) болгох
        $call->technician_id = $user->id; // Хэрэв ерөнхий дуудлага байсан бол өөрийнхөө ID-г зооно
        $call->status = 'accepted';
        $call->save();

        // 3. БУСАД ДУУДЛАГЫГ ЦУЦЛАХ:
        // Яг энэ засварчинд хаяглагдаж ирсэн бусад 'pending' дуудлагуудыг автоматаар 'cancelled' болгох
        RepairRequest::where('technician_id', $user->id)
            ->where('status', 'pending')
            ->where('id', '!=', $id) // Саяны сонгосон дуудлагаас бусдыг нь
            ->update(['status' => 'cancelled']); 
            // Жич: Нийтэд (Ерөнхий) илгээгдсэн technician_id = null дуудлагууд цуцлагдахгүй, өөр засварчин авах боломжтой үлдэнэ.

        // 4. (УХААЛАГ НЭМЭЛТ) Засварчин ажилд гарсан тул Газрын зураг дээрээс Офлайн болгох (бусдад харагдахгүй)
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
    

}