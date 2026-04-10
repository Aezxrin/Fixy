<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RepairRequest extends Model
{
    const STATUS_DRAFT = 'draft';                      // Хайлт хийж буй
    const STATUS_PENDING_APPROVAL = 'pending_approval'; // Засварчин зөвшөөрөхийг хүлээж буй
    const STATUS_AWAITING_DEPOSIT = 'awaiting_deposit'; // Дуудлагын төлбөр хүлээж буй
    const STATUS_EN_ROUTE = 'en_route';                // Засварчин очиж яваа
    const STATUS_IN_PROGRESS = 'in_progress';          // Засварлаж буй
    const STATUS_AWAITING_PAYMENT = 'awaiting_payment';// Засвар дууссан, төлбөр хүлээж буй
    const STATUS_COMPLETED = 'completed';              // Бүрэн дууссан
    const STATUS_CANCELLED = 'cancelled';
    use HasFactory;

    protected $fillable = [
        'customer_id',
        'technician_id',
        'service_type',
        'description',
        'address',
        'latitude',
        'longitude',
        'status',
        'scheduled_at',
        'image_path',
        'call_fee',   
        'repair_fee'  
    ];

    // Энэ дуудлагыг өгсөн иргэн
    public function customer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'customer_id');
    }

    // Энэ дуудлагыг авсан засварчин
    public function technician(): BelongsTo
    {
        return $this->belongsTo(User::class, 'technician_id');
    }
}