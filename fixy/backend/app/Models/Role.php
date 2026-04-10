<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Service extends Model
{
    protected $fillable = ['name', 'description', 'status'];

    // Энэ үйлчилгээг хийдэг засварчид
    public function technicians()
    {
        return $this->belongsToMany(User::class, 'service_user');
    }
}
