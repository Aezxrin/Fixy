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
}