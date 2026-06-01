<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\RepairRequest;
use App\Models\User;
use Illuminate\Support\Facades\Storage;
use App\Models\Review;

class CallController extends Controller
{
    /**
     * 1. Иргэн дуудлагын мэдээллийг Draft (Ноорог) байдлаар хадгалах
     */
    public function store(Request $request)
    {
        $request->validate([
            'service_type' => 'required|string',
            'description' => 'required|string',
            'address' => 'required|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg|max:5120'
        ]);

        try {
            $customerId = $request->user()->id; 
            $imagePath = null;

            if ($request->hasFile('image')) {
                $imagePath = $request->file('image')->store('requests_images', 'public');
            }

            $repairRequest = RepairRequest::create([
                'customer_id' => $customerId,
                'service_type' => $request->service_type,
                'description' => $request->description,
                'address' => $request->address,
                'image_path' => $imagePath,
                'status' => RepairRequest::STATUS_DRAFT 
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Дуудлага ноорог байдлаар үүсгэгдлээ. Одоо засварчин хайна уу.',
                'data' => $repairRequest
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Алдаа гарлаа: ' . $e->getMessage()
            ], 500);
        }
    }
    public function updateDraft(Request $request, $requestId)
    {
        $request->validate([
            'description' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg|max:5120'
        ]);

        try {
            $repairRequest = RepairRequest::findOrFail($requestId);

            if ($repairRequest->status !== RepairRequest::STATUS_DRAFT) {
                return response()->json(['success' => false, 'message' => 'Энэ дуудлагыг одоо засах боломжгүй байна.'], 400);
            }

            if ($request->hasFile('image')) {
                if ($repairRequest->image_path) {
                    Storage::disk('public')->delete($repairRequest->image_path);
                }
                $repairRequest->image_path = $request->file('image')->store('requests_images', 'public');
            }

            if ($request->filled('description')) {
                $repairRequest->description = $request->description;
            }

            $repairRequest->save();

            return response()->json([
                'success' => true,
                'message' => 'Дуудлагын мэдээлэл шинэчлэгдлээ.',
                'data' => $repairRequest
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * 2. Ойролцоох идэвхтэй засварчдыг хайх
     */
    public function findTechnicians(Request $request)
    {
        try {
            $serviceType = $request->query('service_type');
            
            // Зөвхөн 'active' статустай засварчдыг авна
            $query = User::where('role_id', 5)
                         ->where('status', 'active');

            // Хэрэв иргэн тодорхой үйлчилгээ хайж байвал шүүнэ (Засварчинд specialty багана нэмсэн үед)
            // if ($serviceType) {
            //     $query->where('specialty', $serviceType);
            // }

            $technicians = $query->get(['id', 'name', 'phone', 'email']);

            return response()->json([
                'success' => true,
                'data' => $technicians
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }
    public function getTechnicianProfile($id)
    {
        try {
            $technician = User::where('role_id', 5)->findOrFail($id);

            // 1. Нийт амжилттай хийсэн засварын тоог олох
            $completedJobsCount = RepairRequest::where('technician_id', $id)
                ->where('status', RepairRequest::STATUS_COMPLETED)
                ->count();
            $averageRating = 4.8; 
            $totalReviews = 12;   

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $technician->id,
                    'name' => $technician->name,
                    'phone' => $technician->phone,
                    'email' => $technician->email,
                    'specialty' => $technician->specialty ?? 'Ерөнхий засвар', // Хэрэв баазад байгаа бол
                    'profile_image' => $technician->profile_image ?? null,
                    'stats' => [
                        'completed_jobs' => $completedJobsCount,
                        'average_rating' => $averageRating,
                        'total_reviews' => $totalReviews
                    ]
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Засварчин олдсонгүй.'], 404);
        }
    }

    public function sendToTechnician(Request $request, $requestId)
    {
        $request->validate([
            'technician_id' => 'required|exists:users,id'
        ]);

        try {
            $repairRequest = RepairRequest::findOrFail($requestId);
            
            // Статусыг 'pending_approval' болгож, засварчныг онооно
            $repairRequest->update([
                'technician_id' => $request->technician_id,
                'status' => RepairRequest::STATUS_PENDING_APPROVAL
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Дуудлага засварчинд илгээгдлээ. Хариу хүлээж байна.'
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }
    public function acceptRequest(Request $request, $requestId)
    {
        try {
            $repairRequest = RepairRequest::findOrFail($requestId);

            // Зөвхөн өөрт нь ирсэн, зөвшөөрөл хүлээж буй дуудлага мөн эсэхийг шалгах
            if ($repairRequest->status !== RepairRequest::STATUS_PENDING_APPROVAL) {
                return response()->json(['success' => false, 'message' => 'Энэ дуудлагыг зөвшөөрөх боломжгүй байна.'], 400);
            }

            // Статусыг 'awaiting_deposit' (Иргэн мөнгө төлөхийг хүлээж буй) болгож өөрчлөх
            $repairRequest->update([
                'status' => RepairRequest::STATUS_AWAITING_DEPOSIT
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Дуудлагыг хүлээж авлаа. Иргэн дуудлагын хураамж төлөхийг хүлээж байна.'
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * 5. Засварчин дуудлагаас ТАТГАЛЗАХ
     */
    public function declineRequest(Request $request, $requestId)
    {
        try {
            $repairRequest = RepairRequest::findOrFail($requestId);

            if ($repairRequest->status !== RepairRequest::STATUS_PENDING_APPROVAL) {
                return response()->json(['success' => false, 'message' => 'Энэ дуудлагаас татгалзах боломжгүй байна.'], 400);
            }

            // Татгалзсан тохиолдолд буцаагаад 'draft' төлөвт оруулж, technician_id-г устгана
            // Ингэснээр иргэн дахиад өөр засварчин хайгаад сонгох боломжтой болно
            $repairRequest->update([
                'technician_id' => null,
                'status' => RepairRequest::STATUS_DRAFT
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Дуудлагаас татгалзлаа.'
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }
    public function payDeposit(Request $request, $requestId)
    {
        try {
            $repairRequest = RepairRequest::findOrFail($requestId);

            // Зөвхөн төлбөр хүлээж буй төлөвтэй үед л мөнгө төлөх боломжтой
            if ($repairRequest->status !== RepairRequest::STATUS_AWAITING_DEPOSIT) {
                return response()->json(['success' => false, 'message' => 'Төлбөр төлөх боломжгүй төлөвт байна.'], 400);
            }

            // АНХААР: Яг бодит амьдрал дээр энд QPay, SocialPay, Toki зэрэг төлбөрийн системийн API шалгах логик орно.
            // Бид одоогоор төлбөр амжилттай төлөгдсөн гэж үзээд баазаа шууд шинэчилье.

            $repairRequest->update([
                'status' => RepairRequest::STATUS_EN_ROUTE, // Очиж явна төлөв рүү шилжих
                'call_fee' => 5000 // Дуудлагын хураамжийн баганад 5000-ыг хадгалах
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Төлбөр амжилттай төлөгдөж, засварчин тан руу гарлаа.',
                'data' => [
                    'status' => $repairRequest->status,
                    'call_fee' => $repairRequest->call_fee
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }
    public function cancelRequest(Request $request, $requestId)
    {
        try {
            $repairRequest = RepairRequest::findOrFail($requestId);
            $currentStatus = $repairRequest->status;

            // 1. Цуцлах боломжгүй төлөвүүдийг шалгах (Засвар эхэлсэн эсвэл дууссан бол)
            $nonCancellableStatuses = [
                RepairRequest::STATUS_IN_PROGRESS, 
                RepairRequest::STATUS_AWAITING_PAYMENT, 
                RepairRequest::STATUS_COMPLETED
            ];

            if (in_array($currentStatus, $nonCancellableStatuses)) {
                return response()->json([
                    'success' => false, 
                    'message' => 'Засварын ажил нэгэнт эхэлсэн тул цуцлах боломжгүй.'
                ], 400);
            }

            $penaltyMessage = '';

            // 2. Хэрэв засварчин замдаа гарсан (en_route) байхад цуцалбал
            if ($currentStatus === RepairRequest::STATUS_EN_ROUTE) {
                // АНХААР: Бодит амьдрал дээр энд Иргэний хэтэвчнээс 5000₮-ийг 
                // Засварчны хэтэвч рүү "Цагийн алдагдал" гээд шилжүүлэх логик бичигдэнэ.
                $penaltyMessage = 'Засварчин замдаа гарсан байсан тул дуудлагын хураамж болох 5000₮ засварчинд шилжиж, дуудлага цуцлагдлаа.';
            } else {
                // Бусад төлөвт (draft, pending_approval, awaiting_deposit) байхад нь цуцалвал мөнгө гарахгүй
                $penaltyMessage = 'Дуудлага амжилттай цуцлагдлаа.';
            }

            // 3. Статусыг CANCELLED болгож хадгалах
            $repairRequest->update([
                'status' => RepairRequest::STATUS_CANCELLED
            ]);

            return response()->json([
                'success' => true,
                'message' => $penaltyMessage
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }
    public function startRepair(Request $request, $requestId)
    {
        try {
            $repairRequest = RepairRequest::findOrFail($requestId);

            // Зөвхөн "Очиж явна" төлөвтэй үед л эхлүүлэх боломжтой
            if ($repairRequest->status !== RepairRequest::STATUS_EN_ROUTE) {
                return response()->json(['success' => false, 'message' => 'Энэ үйлдлийг хийх боломжгүй.'], 400);
            }

            $repairRequest->update([
                'status' => RepairRequest::STATUS_IN_PROGRESS
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Засварын ажил эхэллээ.'
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * 8. ҮЕ 4 (Засварчин): Засвар дууссан & Нийт үнийн дүнг илгээх
     */
    public function finishRepair(Request $request, $requestId)
    {
        // Засварчин заавал үнийн дүн бичиж явуулах ёстой
        $request->validate([
            'repair_fee' => 'required|numeric|min:0'
        ]);

        try {
            $repairRequest = RepairRequest::findOrFail($requestId);

            if ($repairRequest->status !== RepairRequest::STATUS_IN_PROGRESS) {
                return response()->json(['success' => false, 'message' => 'Засвар эхлээгүй байна.'], 400);
            }

            $repairRequest->update([
                'status' => RepairRequest::STATUS_AWAITING_PAYMENT,
                'repair_fee' => $request->repair_fee
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Засвар дууслаа. Иргэн рүү төлбөрийн нэхэмжлэл илгээгдлээ.',
                'data' => [
                    'repair_fee' => $repairRequest->repair_fee
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * 9. ҮЕ 4 (Иргэн): Эцсийн төлбөр төлж, дуудлагыг бүрэн хаах
     */
    public function payFinalAmount(Request $request, $requestId)
    {
        try {
            $repairRequest = RepairRequest::findOrFail($requestId);

            if ($repairRequest->status !== RepairRequest::STATUS_AWAITING_PAYMENT) {
                return response()->json(['success' => false, 'message' => 'Төлбөр төлөх боломжгүй байна.'], 400);
            }

            // АНХААР: Бодит амьдрал дээр энд банкны API (QPay, Toki) шалгах логик байна.

            // Төлбөр амжилттай болсон гэж үзээд статусыг COMPLETED болгоно
            $repairRequest->update([
                'status' => RepairRequest::STATUS_COMPLETED
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Төлбөр амжилттай төлөгдөж, дуудлага бүрэн хаагдлаа. Fixy үйлчилгээг сонгосонд баярлалаа!'
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }
    public function submitReview(Request $request, $requestId)
    {
        $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string'
        ]);

        try {
            $repairRequest = RepairRequest::findOrFail($requestId);

            // Зөвхөн COMPLETED (бүрэн дууссан) төлөвтэй үед л үнэлгээ өгч болно
            if ($repairRequest->status !== RepairRequest::STATUS_COMPLETED) {
                return response()->json(['success' => false, 'message' => 'Засвар дуусаагүй байхад үнэлгээ өгөх боломжгүй.'], 400);
            }

            // Давхар үнэлгээ өгөхөөс сэргийлэх
            $existingReview = Review::where('repair_request_id', $requestId)->first();
            if ($existingReview) {
                return response()->json(['success' => false, 'message' => 'Та энэ дуудлагад аль хэдийн үнэлгээ өгсөн байна.'], 400);
            }

            // Үнэлгээг баазад хадгалах
            $review = Review::create([
                'repair_request_id' => $requestId,
                'reviewer_id' => $repairRequest->customer_id, // Иргэн
                'reviewee_id' => $repairRequest->technician_id, // Засварчин
                'rating' => $request->rating,
                'comment' => $request->comment
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Үнэлгээ амжилттай хадгалагдлаа. Баярлалаа!',
                'data' => $review
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }
}