<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\User;

class Service extends Model
{
    protected $fillable = ['name', 'description', 'status'];

    // 1 Үйлчилгээ олон засварчинтай байна
    public function technicians()
    {
        // 'service_type' нь users хүснэгт дэх баганын нэр
        // role_id = 3 гэж давхар шүүвэл илүү найдвартай (Засварчин гэдгээр нь)
        return $this->hasMany(User::class, 'service_type', 'name')->where('role_id', 5);
    }
}