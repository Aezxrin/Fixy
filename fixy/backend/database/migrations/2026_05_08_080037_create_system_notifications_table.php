<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('system_notifications', function (Blueprint $table) {
            $table->id();
            // ШИНЭЭР НЭМСЭН: Хэнд очих мэдэгдэл вэ гэдгийг заана
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('cascade'); 
            
            $table->string('title'); // Мэдэгдлийн гарчиг
            $table->text('desc')->nullable(); // Дэлгэрэнгүй тайлбар
            $table->string('type')->default('system'); // Төрөл: warning, system, call г.м
            $table->boolean('is_read')->default(false); // Уншсан эсэх
            $table->timestamps(); // created_at, updated_at
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('system_notifications');
    }
};