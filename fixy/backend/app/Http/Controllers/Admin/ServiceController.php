<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Service;
use Illuminate\Http\Request;

class ServiceController extends Controller
{
    public function index()
    {
        // Бүх үйлчилгээг татахдаа, тус бүрт нь хэдэн засварчин байгаа тоог (withCount) цуг авчрах
        $services = Service::withCount('technicians')->get();
        return response()->json(['success' => true, 'data' => $services]);
    }

    public function store(Request $request)
    {
        $service = Service::create($request->all());
        return response()->json(['success' => true, 'data' => $service]);
    }

    // update, destroy үйлдлүүд мөн энд бичигдэнэ...
}