<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use App\Models\RepairRequest;
use Carbon\Carbon;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $query = User::query(); 
        if ($request->has('role_id')) {
            $query->where('role_id', $request->role_id);
        }
        if ($request->has('search') && $request->search != '') {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                ->orWhere('email', 'like', "%{$search}%")
                ->orWhere('phone', 'like', "%{$search}%")
                ->orWhere('service_type', 'LIKE', "%{$search}%");
            });
        }
        if ($request->has('status') && $request->status != 'all') {
            $query->where('status', $request->status);
        }
        if ($request->has('date_from') && $request->date_from != '') {
            $query->whereDate('created_at', '>=', $request->date_from);
        }
        if ($request->has('date_to') && $request->date_to != '') {
            $query->whereDate('created_at', '<=', $request->date_to);
        }
        $users = $query->orderBy('created_at', 'desc')->paginate(10);
        return response()->json($users); 
    }

    public function update(Request $request, User $user)
    {
        $user->update($request->only(['name', 'email', 'status', 'phone']));
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
            'phone' => 'nullable|string',
            'bio' => 'nullable|string|max:1000' 
        ]);

        $user->name = $request->name;
        $user->email = $request->email;
        if ($request->has('phone')) $user->phone = $request->phone;
        if ($request->has('bio')) $user->bio = $request->bio; 
        
        $user->save();

        return response()->json(['success' => true, 'user' => $user]);
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

    public function getOnlineTechnicians(Request $request)
    {
        $type = $request->query('type'); // Утаснаас ирж буй төрөл (Жишээ нь: Сантехник)

        $query = \App\Models\User::where('role_id', 5)
            ->where('is_on_duty', 1)
            ->whereNotNull('latitude')
            ->whereNotNull('longitude');

        if (!empty($type)) {
            $query->where('service_type', $type);
        }

        $technicians = $query->select('id', 'name', 'phone', 'latitude', 'longitude', 'service_type')->get();

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
    
    public function show($id)
    {
        try {
            $user = \App\Models\User::find($id);
            if (!$user) {
                return response()->json(['success' => false, 'message' => 'Засварчин олдсонгүй'], 404);
            }

            // ШИНЭЧЛЭЛТ: Зөвхөн тоог нь биш, дууссан ажлуудыг нь БҮТНЭЭР нь (зурагтай нь) татаж авах
            $completedJobs = \App\Models\RepairRequest::where('technician_id', $id)
                                ->where('status', 'completed')
                                ->orderBy('updated_at', 'desc')
                                ->get();

            // Үнэлгээ 
            $rating = $user->rating ?? 4.9;

            return response()->json([
                'success' => true,
                'user' => $user, // Үүнд avatar_path, bio бүгд очино
                
                // ИРГЭНИЙ АПП РУУ ЗУРГУУДЫГ НЬ ДАВХАР ИЛГЭЭХ
                'completed_jobs' => $completedJobs, 
                'completed_count' => $completedJobs->count(), // Тоог нь тусад нь явуулах
                
                'stats' => [
                    'completed_jobs' => $completedJobs->count(),
                    'rating' => $rating
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }
    public function uploadAvatar(Request $request)
    {
        $request->validate([
            'avatar' => 'required|image|mimes:jpeg,png,jpg|max:5120', // 5MB хүртэлх хэмжээтэй зураг
        ]);

        $user = Auth::user();

        if ($request->hasFile('avatar')) {
            // Хуучин зураг байвал устгах (Сонголттой)
            if ($user->avatar_path && \Illuminate\Support\Facades\Storage::disk('public')->exists($user->avatar_path)) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($user->avatar_path);
            }

            // Шинэ зургийг хадгалах
            $path = $request->file('avatar')->store('avatars', 'public');
            $user->avatar_path = $path;
            $user->save();

            return response()->json([
                'success' => true,
                'message' => 'Профайл зураг амжилттай солигдлоо.',
                'avatar_url' => asset('storage/' . $path) // Зургийн бүтэн хаягийг буцаах
            ]);
        }

        return response()->json(['success' => false, 'message' => 'Зураг олдсонгүй'], 400);
    }
    public function signContract(Request $request)
    {
        $request->validate([
            'signature' => 'required|string',
        ]);

        $user = Auth::user();

        try {
            // 1. Base64 зургийг салгаж авах (жишээ нь: "data:image/png;base64,iVBORw0KGgo...")
            $image_parts = explode(";base64,", $request->signature);
            
            if (count($image_parts) != 2) {
                return response()->json(['success' => false, 'message' => 'Зургийн формат буруу байна.'], 400);
            }

            $image_type_aux = explode("image/", $image_parts[0]);
            $image_type = $image_type_aux[1] ?? 'png';
            $image_base64 = base64_decode($image_parts[1]);

            // 2. Файлын нэр үүсгэх
            $fileName = 'signatures/tech_' . $user->id . '_' . time() . '.' . $image_type;

            // 3. Зургийг public disk-д хадгалах
            Storage::disk('public')->put($fileName, $image_base64);

            // 4. Өгөгдлийн санг шинэчлэх
            $user->signature_path = $fileName;
            $user->contract_status = 'signed'; // Хянагдаж байна гэсэн төлөвт орно
            $user->contract_signed_at = Carbon::now();
            $user->save();

            return response()->json([
                'success' => true,
                'message' => 'Гэрээнд амжилттай гарын үсэг зурлаа.'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Гарын үсэг хадгалахад алдаа гарлаа: ' . $e->getMessage()
            ], 500);
        }
    }
}