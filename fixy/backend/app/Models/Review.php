<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Review extends Model
{
    use HasFactory;

    protected $fillable = [
        'repair_request_id',
        'reviewer_id',
        'reviewee_id',
        'rating',
        'comment'
    ];
}