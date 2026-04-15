<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

class UserController extends Controller
{
    public function index(Request $request)
    {
        // Холбогдсон үйлчилгээнүүдийг давхар татах (with)
        $query = User::with('services'); 

        // Хэрэв role_id ирвэл шүүнэ (5 гэдгийг Засварчин гэж үзэв)
        if ($request->has('role_id')) {
            $query->where('role_id', $request->role_id);
        }

        return response()->json(['success' => true, 'data' => $query->get()]);
    }

    public function update(Request $request, User $user)
    {
        // Үндсэн мэдээллүүдийг шинэчлэх
        $user->update($request->only(['name', 'email', 'status', 'phone']));

        // ШИНЭ: Засварчны хийх үйлчилгээнүүдийн ID-г хүлээж авч бааз дээр холбох (Sync)
        if ($request->has('service_ids')) {
            $user->services()->sync($request->service_ids);
        }

        return response()->json(['success' => true, 'data' => $user->load('services')]);
    }
    public function updateProfile(Request $request)
{
    $user = Auth::user();

    $request->validate([
        'name' => 'required|string|max:255',
        'email' => 'required|email|unique:users,email,' . $user->id,
    ]);

    $user->update([
        'name' => $request->name,
        'email' => $request->email,
    ]);

    return response()->json([
        'success' => true,
        'message' => 'Мэдээлэл амжилттай шинэчлэгдлээ.',
        'user' => $user
    ]);
}
    public function updatePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required',
            'new_password' => 'required|min:6',
        ]);

        $user = Auth::user();

        // Одоогийн нууц үгийг шалгах
        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'success' => false, 
                'message' => 'Одоогийн нууц үг буруу байна.'
            ], 422);
        }

        // Шинэ нууц үгийг хадгалах
        $user->password = Hash::make($request->new_password);
        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Нууц үг амжилттай солигдлоо.'
        ]);
    }
    // 1. Засварчны өөрийнх нь хүлээж авсан (хийгдэж байгаа) ажлуудыг татах
    public function getMyJobs()
    {
        $user = Auth::user();

        // status нь 'accepted' (хүлээж авсан) эсвэл 'in_progress' (хийгдэж байгаа) ажлуудыг шүүнэ
        $jobs = \App\Models\RepairRequest::where('technician_id', $user->id)
            ->whereIn('status', ['accepted', 'in_progress'])
            ->orderBy('updated_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $jobs
        ]);
    }

    // 2. Ажлыг амжилттай дуусгах
    public function completeCall($id)
    {
        $user = Auth::user();
        $call = \App\Models\RepairRequest::where('id', $id)
            ->where('technician_id', $user->id)
            ->first();

        if (!$call) {
            return response()->json([
                'success' => false,
                'message' => 'Дуудлага олдсонгүй эсвэл танд хамааралгүй байна.'
            ], 404);
        }

        $call->status = 'completed'; // Төлөвийг 'дууссан' болгох
        $call->save();

        return response()->json([
            'success' => true,
            'message' => 'Ажлыг амжилттай дуусгалаа.'
        ]);
    }
    public function getOnlineTechnicians(Request $request)
    {
        $type = $request->query('type'); // Утаснаас ирж буй 'Сантехник' гэх мэт төрөл

        $query = \App\Models\User::where('role_id', 5)
            ->where('is_on_duty', 1)
            ->whereNotNull('latitude')
            ->whereNotNull('longitude');

        // Хэрэв type ирсэн бол шүүнэ (Таны баазад үйлчилгээний төрөл хадгалдаг багана байвал)
        // Жишээ нь 'service_type' гэсэн багана байдаг бол:
        // if ($type) {
        //     $query->where('service_type', $type);
        // }

        $technicians = $query->select('id', 'name', 'phone', 'latitude', 'longitude')->get();

        return response()->json([
            'success' => true,
            'data' => $technicians
        ]);
    }
    public function toggleDuty(Request $request)
    {
        $user = Auth::user();
        $user->is_on_duty = !$user->is_on_duty; // Төлөвийг эсрэгээр нь солих

        // Хэрэв Онлайн болж байвал байршлыг нь хадгална
        if ($user->is_on_duty) {
            $user->latitude = $request->latitude;
            $user->longitude = $request->longitude;
        } else {
            // Офлайн болбол байршлыг нь цэвэрлэх (газрын зураг дээрээс алга болгох)
            $user->latitude = null;
            $user->longitude = null;
        }

        $user->save();

        return response()->json([
            'success' => true,
            'is_on_duty' => $user->is_on_duty,
            'message' => $user->is_on_duty ? 'Та онлайн боллоо.' : 'Та офлайн боллоо.'
        ]);
    }
    public function getPendingCalls()
    {
        $user = Auth::user();

        $calls = \App\Models\RepairRequest::where('status', 'pending')
            ->where(function($query) use ($user) {
                // 1. Хэнд ч хаяглагдаагүй (Ерөнхий) дуудлага
                $query->whereNull('technician_id')
                // 2. Эсвэл яг энэ засварчинд хаяглагдсан дуудлага
                      ->orWhere('technician_id', $user->id);
            })
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $calls
        ]);
    }
}