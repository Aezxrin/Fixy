<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\RepairRequest;
use App\Models\User; // ЗАСВАР: User моделийг заавал импортлох ёстой
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB; // ЗАСВАР: DB facade-ийг импортлох

class RepairRequestController extends Controller
{
    public function index(Request $request)
    {
        $status = $request->query('status');
        
        $query = RepairRequest::with(['customer', 'technician']);

        if ($status && $status !== 'all') {
            $query->where('status', $status);
        }

        $calls = $query->orderBy('created_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => $calls
        ]);
    }

    public function store(Request $request)
    {
        try {
            $call = new RepairRequest();
            $call->customer_id = Auth::id(); 
            $call->service_type = $request->input('serviceType', $request->service_type);          
            $call->description = $request->description;
            $call->address = $request->address;
            
            $call->latitude = $request->latitude;
            $call->longitude = $request->longitude;
            
            $call->status = 'pending'; 

            if ($request->has('technician_id') && $request->technician_id !== 'null') {
                $call->technician_id = $request->technician_id;
            }

            if ($request->hasFile('image')) {
                $imagePath = $request->file('image')->store('requests_images', 'public');
                $call->image_path = $imagePath; 
            }

            $call->save();

            return response()->json([
                'success' => true,
                'data' => $call,
                'message' => 'Дуудлага амжилттай бүртгэгдлээ'
            ], 201);
            
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Алдаа: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getPendingCalls()
    {
        $user = Auth::user();
        $calls = RepairRequest::with('customer')
            ->where('technician_id', $user->id)
            ->where('status', 'pending')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $calls
        ]);
    }

    public function getMyJobs(Request $request)
    {
        $user = Auth::user();
        $activeStatuses = ['accepted', 'on_the_way', 'waiting_final_payment'];       
        $query = RepairRequest::with('customer') 
            ->where('technician_id', $user->id);

        if ($request->query('status') === 'completed') {
            $query->where('status', 'completed');
        } else {
            $query->whereIn('status', $activeStatuses);
        }

        $calls = $query->orderBy('updated_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => $calls
        ]);
    }

    public function getStats()
    {
        $user = Auth::user();

        $completedCount = RepairRequest::where('technician_id', $user->id)
                            ->where('status', 'completed')
                            ->count();

        $income = RepairRequest::where('technician_id', $user->id)
                            ->where('status', 'completed')
                            ->sum('repair_fee');

        $rating = $user->rating ?? 5.0;

        return response()->json([
            'success' => true,
            'data' => [
                'income' => $income ?: 0, 
                'completed' => $completedCount,
                'rating' => number_format($rating, 1)
            ]
        ]);
    }

    public function acceptCall($id)
    {
        $user = Auth::user();
        $call = RepairRequest::find($id);

        if (!$call || $call->status !== 'pending' || $call->technician_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Энэ дуудлагыг хүлээж авах боломжгүй байна.'
            ], 400);
        }

        $call->status = 'awaiting_payment'; 
        $call->save();

        RepairRequest::where('technician_id', $user->id)
            ->where('status', 'pending')
            ->where('id', '!=', $id) 
            ->update(['status' => 'rejected']); 

        return response()->json([
            'success' => true,
            'message' => 'Дуудлагыг хүлээж авлаа. Иргэн төлбөр төлөхийг хүлээж байна.'
        ]);
    }

    public function payCallFee(Request $request, $id)
    {
        $call = RepairRequest::find($id);

        if (!$call || $call->status !== 'awaiting_payment') {
            return response()->json(['success' => false, 'message' => 'Төлбөр төлөх боломжгүй эсвэл олдсонгүй.'], 400);
        }

        try {
            DB::transaction(function () use ($call) {
                $call->status = 'accepted';
                $call->call_fee = 5000; 
                $call->save();

                $technician = User::find($call->technician_id);
                if ($technician) {
                    $technician->increment('balance', 5000);
                    $technician->is_on_duty = 0;
                    $technician->save();
                }
            });

            return response()->json([
                'success' => true,
                'message' => 'Төлбөр амжилттай төлөгдөж засварчин замдаа гарлаа.'
            ]);
        } catch (\Throwable $e) {
            return response()->json(['success' => false, 'message' => 'Алдаа: ' . $e->getMessage()], 500);
        }
    }
    
    public function assignTechnician(Request $request, $id)
    {
        $call = RepairRequest::find($id);

        if (!$call) {
            return response()->json(['success' => false, 'message' => 'Дуудлага олдсонгүй'], 404);
        }

        $call->technician_id = $request->technician_id;
        $call->save();

        return response()->json([
            'success' => true,
            'message' => 'Дуудлагыг засварчин руу амжилттай илгээлээ'
        ]);
    }

    public function completeCall(Request $request, $id)
    {
        $user = Auth::user();
        $call = RepairRequest::where('id', $id)->where('technician_id', $user->id)->first();

        if (!$call) {
            return response()->json(['success' => false, 'message' => 'Дуудлага олдсонгүй.'], 404);
        }

        $call->status = 'waiting_final_payment';

        if ($request->has('price')) {
            $call->repair_fee = $request->price;
        }

        if ($request->hasFile('completed_image')) {
            $path = $request->file('completed_image')->store('completed_jobs', 'public');
            $call->completed_image_path = $path; 
        }

        $call->save();

        return response()->json([
            'success' => true,
            'message' => 'Нэхэмжлэх илгээгдлээ. Иргэн төлбөр төлөхийг хүлээж байна.'
        ]);
    }
    
    public function getCustomerCalls()
    {
        $user = Auth::user();

        $calls = RepairRequest::with('technician')
            ->where('customer_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $calls
        ]);
    }

    public function finalizePayment(Request $request, $id)
    {
        $call = RepairRequest::find($id);

        if (!$call || $call->status !== 'waiting_final_payment') {
            return response()->json(['success' => false, 'message' => 'Төлбөр төлөх боломжгүй.'], 400);
        }

        try {
            \Illuminate\Support\Facades\DB::transaction(function () use ($call) {
                $call->status = 'completed';
                $call->save();

                $technician = \App\Models\User::find($call->technician_id);
                if ($technician) {
                    $techShare = $call->repair_fee * 0.60;
                    $technician->increment('balance', $techShare);
                    
                    $technician->is_on_duty = 1;
                    $technician->save();
                }
            });

            return response()->json(['success' => true, 'message' => 'Төлбөр амжилттай. Ажил дууслаа.']);
        } catch (\Throwable $e) {
            return response()->json(['success' => false, 'message' => 'Алдаа: ' . $e->getMessage()], 500);
        }
    }

    public function processPayment(Request $request, $id)
    {
        $request->validate([
            'payment_method' => 'required|in:qpay,socialpay,bank'
        ]);

        $repairRequest = RepairRequest::findOrFail($id);
        
        $repairRequest->payment_method = $request->payment_method;
       
        $repairRequest->save();

        return response()->json([
            'success' => true,
            'message' => 'Төлбөрийн хэрэгсэл амжилттай бүртгэгдлээ.',
            'data' => $repairRequest
        ]);
    }

    public function cancelRequest(Request $request, $id)
    {
        try {
            $call = RepairRequest::findOrFail($id);

            if (in_array($call->status, ['completed', 'cancelled', 'rejected'])) {
                return response()->json(['success' => false, 'message' => 'Энэ дуудлагыг цуцлах боломжгүй.']);
            }

            $message = "Дуудлага амжилттай цуцлагдлаа.";
            
            if ($call->status === 'on_the_way' && $call->technician_id) {
                DB::transaction(function () use ($call) {
                    $technician = User::find($call->technician_id);
                    
                    if ($technician) {
                        $technician->increment('balance', 5000);
                    }
                });
                $message = "Засварчин хэдийн замдаа гарсан тул таны баталгаажуулах хураамж (5,000₮) засварчны замын зардалд шилжлээ.";
            }

            $call->status = 'cancelled';
            $call->save();

            return response()->json([
                'success' => true,
                'message' => $message
            ]);

        } catch (\Throwable $e) {
            // ЗАСВАР: Бүх төрлийн алдааг (Exception, Error) барьж аваад буцаана
            return response()->json([
                'success' => false, 
                'message' => 'Сервер дээр алдаа гарлаа: ' . $e->getMessage()
            ], 500);
        }
    }
    public function confirmCashPayment(Request $request, $id)
    {
        $call = RepairRequest::find($id);

        if (!$call || $call->status !== 'waiting_final_payment') {
            return response()->json(['success' => false, 'message' => 'Бэлэн мөнгөний гүйлгээг баталгаажуулах боломжгүй байна.'], 400);
        }

        try {
            \Illuminate\Support\Facades\DB::transaction(function () use ($call) {
                $call->status = 'completed';
                $call->payment_method = 'cash'; 
                $call->save();

                $technician = \App\Models\User::find($call->technician_id);
                if ($technician) {
                    $commission = $call->repair_fee * 0.40;
                    $technician->decrement('balance', $commission);
                    
                    $technician->is_on_duty = 1;
                    $technician->save();
                }
            });

            return response()->json([
                'success' => true, 
                'message' => 'Төлбөрийг бэлнээр хүлээн авч баталгаажууллаа.'
            ]);
        } catch (\Throwable $e) {
            return response()->json(['success' => false, 'message' => 'Алдаа: ' . $e->getMessage()], 500);
        }
    }
    public function submitReview(Request $request, $id)
    {
        $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'review' => 'nullable|string'
        ]);

        $call = RepairRequest::where('id', $id)->first();

        if (!$call || $call->status !== 'completed') {
            return response()->json(['success' => false, 'message' => 'Зөвхөн дууссан ажилд үнэлгээ өгөх боломжтой.'], 400);
        }

        if ($call->rating) {
            return response()->json(['success' => false, 'message' => 'Та энэ дуудлагад аль хэдийн үнэлгээ өгсөн байна.']);
        }

        $call->rating = $request->rating;
        $call->review = $request->review;
        $call->save();
        $technician = \App\Models\User::find($call->technician_id);
        if ($technician) {
            $avgRating = RepairRequest::where('technician_id', $technician->id)
                                      ->whereNotNull('rating')
                                      ->avg('rating');
                                      
            $technician->rating = round($avgRating, 1);
            $technician->save();
        }

        return response()->json([
            'success' => true, 
            'message' => 'Үнэлгээ амжилттай илгээгдлээ. Баярлалаа!'
        ]);
    }
}