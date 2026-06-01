<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SystemNotification extends Model
{
    use HasFactory;

    // ШИЙДЭЛ: Хүснэгтийн нэрийг яг бааз дээрхээр нь зааж өгөх
    protected $table = 'system_notifications';

    protected $fillable = [
        'user_id', 
        'title', 
        'desc', 
        'type', 
        'is_read'
    ];
}