<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    public function index(Request $request)
    {
        $type = $request->query('type');
        $from = $request->query('from');
        $to = $request->query('to');

        // 1. ЗАСВАРЧДЫН ТАЙЛАН
        if ($type === 'technicians') {
            $query = DB::table('users')->where('role_id', 5); // 5 гэдэг нь Засварчин гэж үзэв

            if ($from) $query->whereDate('created_at', '>=', $from);
            if ($to) $query->whereDate('created_at', '<=', $to);

            $technicians = $query->get();

            $data = $technicians->map(function ($tech) {
                // APP_URL-ийг .env-ээс авч зургийн бүтэн линкийг угсрах
                $baseUrl = env('APP_URL', 'http://localhost:8000'); 

                return [
                    'ID' => $tech->id,
                    'Овог Нэр' => $tech->name,
                    'И-мэйл' => $tech->email,
                    'Төлөв' => $tech->status,
                    // Зураг байвал линк болгоно, байхгүй бол 'Байхгүй' гэж харуулна
                    'Иргэний үнэмлэх' => $tech->id_card_image ? $baseUrl . '/storage/' . $tech->id_card_image : 'Байхгүй',
                    'Мэргэжлийн үнэмлэх' => $tech->certificate_image ? $baseUrl . '/storage/' . $tech->certificate_image : 'Байхгүй',
                ];
            });

            return response()->json(['success' => true, 'data' => $data]);
        }

        // 2. ДУУДЛАГЫН ТАЙЛАН (repair_requests хүснэгт)
        if ($type === 'calls') {
            $query = DB::table('repair_requests')
                ->leftJoin('users as customer', 'repair_requests.customer_id', '=', 'customer.id')
                ->leftJoin('users as technician', 'repair_requests.technician_id', '=', 'technician.id')
                ->select(
                    'repair_requests.id',
                    'repair_requests.service_type',
                    'repair_requests.description',
                    'repair_requests.status',
                    'repair_requests.address',
                    'customer.name as customer_name',
                    'technician.name as tech_name',
                    'repair_requests.created_at'
                );

            if ($from) $query->whereDate('repair_requests.created_at', '>=', $from);
            if ($to) $query->whereDate('repair_requests.created_at', '<=', $to);

            $calls = $query->get();

            $data = $calls->map(function ($call) {
                return [
                    'Дуудлага ID' => '#' . $call->id,
                    'Үйлчилгээ' => $call->service_type,
                    'Тайлбар' => $call->description,
                    'Хаяг' => $call->address,
                    'Үйлчлүүлэгч' => $call->customer_name ?? 'Тодорхойгүй',
                    'Засварчин' => $call->tech_name ?? 'Хуваарилагдаагүй',
                    'Төлөв' => $call->status,
                    // Огноог гоё форматлах
                    'Огноо' => $call->created_at ? date('Y-m-d', strtotime($call->created_at)) : '',
                ];
            });

            return response()->json(['success' => true, 'data' => $data]);
        }

        // 3. ҮЙЛЧЛҮҮЛЭГЧДИЙН ТАЙЛАН
        if ($type === 'users') {
            $query = DB::table('users')->where('role_id', 4); // 4 гэдэг нь Үйлчлүүлэгч гэж үзэв

            if ($from) $query->whereDate('created_at', '>=', $from);
            if ($to) $query->whereDate('created_at', '<=', $to);

            $users = $query->get();

            $data = $users->map(function ($user) {
                return [
                    'ID' => $user->id,
                    'Овог Нэр' => $user->name,
                    'И-мэйл' => $user->email,
                    'Төлөв' => $user->status,
                ];
            });

            return response()->json(['success' => true, 'data' => $data]);
        }

        return response()->json(['success' => true, 'data' => []]);
    }
}