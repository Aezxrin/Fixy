<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
            'source' => 'nullable' // Вэб эвдрэхгүй байх гол нууц
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'И-мэйл эсвэл нууц үг буруу байна.'
            ], 401);
        }

        $source = $request->input('source');
        $roleId = (int) $user->role_id;

        // 1. АПП-ААС ХАНДАХ ҮЕД (Иргэн 4, Засварчин 5)
        if ($source === 'app') {
            if (!in_array($roleId, [4, 5])) {
                return response()->json([
                    'message' => 'Танд Аппликейшнд нэвтрэх эрх байхгүй байна.'
                ], 403);
            }
        } 
        // 2. ВЭБ-ЭЭС ХАНДАХ ҮЕД (Админ 1, Санхүү 2, Менежер 3)
        else {
            if (!in_array($roleId, [1, 2, 3])) {
                return response()->json([
                    'message' => 'Танд Вэб системд нэвтрэх эрх тохируулагдаагүй байна.'
                ], 403);
            }
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => $user
        ]);
    }

    public function me(Request $request)
{
    $user = $request->user();
    $userData = $user->toArray();
    
    // Энд л дундаж үнэлгээг тооцоолж нэмнэ
    // 'rating' багананд хадгалагдсан байгаа тул түүнийг ашиглана
    $userData['rating'] = (float) $user->rating; 
    
    return response()->json([
        'user' => $userData
    ]);
}

    public function logout(Request $request)
    {
        if ($request->user()) {
            $request->user()->currentAccessToken()->delete();
        }

        return response()->json(['message' => 'Амжилттай гарлаа']);
    }

    /**
     * Апп-аас шинээр хэрэглэгч бүртгүүлэх
     */
    public function register(Request $request)
    {
        // 1. Validation (Unique email шалгах)
        $request->validate([
            'name' => 'required|string',
            'email' => 'required|email|unique:users',
            'password' => 'required|min:6',
        ]);

        try {
            // ==========================================
            // ЭНД ЛОГ БИЧИХ ХЭСЭГ
            // ==========================================
            \Log::info('--- ШИНЭ БҮРТГЭЛ ---');
            \Log::info('Бүх дата:', $request->all());
            \Log::info('Ирсэн файлууд:', $request->allFiles());
            \Log::info('Иргэний үнэмлэх ирсэн эсэх:', ['status' => $request->hasFile('id_card_image')]);
            // ==========================================

            $idCardPath = null;
            $certPath = null;

            // 2. ЗУРАГ ШАЛГАХ ХЭСЭГ (Зөвхөн файл ирсэн үед л ажиллана)
            if ($request->hasFile('id_card_image')) {
                $idCardPath = $request->file('id_card_image')->store('documents', 'public');
            }

            if ($request->hasFile('certificate_image')) {
                $certPath = $request->file('certificate_image')->store('documents', 'public');
            }

            // 3. Баазад хадгалах
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'phone' => $request->phone,
                'password' => bcrypt($request->password),
                'role_id' => $request->type === 'technician' ? 5 : 4,
                'status' => $request->type === 'technician' ? 'pending' : 'active',
                
                // ШИНЭЭР НЭМСЭН МӨР: Үйлчилгээний төрөл хадгалах
                'service_type' => $request->service_type,

                // Хэрэв иргэн бол эдгээр нь NULL хэвээрээ байна
                'id_card_image' => $idCardPath,
                'certificate_image' => $certPath,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Амжилттай бүртгүүллээ',
                'user' => $user
            ], 201);

        }
        catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Алдаа: ' . $e->getMessage()
            ], 500);
        }
    }
}