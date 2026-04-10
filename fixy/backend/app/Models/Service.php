<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\User; // User моделийг дуудах

class Service extends Model
{
    // 1. Гаднаас хадгалахыг зөвшөөрсөн баганууд (Mass Assignment хамгаалалт)
    protected $fillable = ['name', 'description', 'status'];

    // 2. Олон-той-Олон (Many-to-Many) харилцаа
    public function technicians()
    {
        // Нэг үйлчилгээг олон засварчин хийж чадна
        return $this->belongsToMany(User::class, 'service_user');
    }
}