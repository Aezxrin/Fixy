<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
{
    Schema::create('repair_requests', function (Blueprint $table) {
        $table->id();
        
        // Дуудлага өгсөн иргэн (Хэрэглэгч)
        $table->foreignId('customer_id')->constrained('users')->onDelete('cascade');
        
        // Дуудлага хүлээж авсан засварчин (Эхлээд хэн ч аваагүй буюу null байна)
        $table->foreignId('technician_id')->nullable()->constrained('users')->onDelete('set null');
        
        // Үйлчилгээний төрөл (Жишээ нь: "Угаалгын машин", "Цахилгаан", "Сантехник")
        $table->string('service_type'); 
        
        // Асуудлын дэлгэрэнгүй тайлбар
        $table->text('description'); 
        
        // Дуудлагын байршил, хаяг
        $table->string('address')->nullable();
        $table->decimal('latitude', 10, 8)->nullable();  // Өргөрөг
        $table->decimal('longitude', 11, 8)->nullable(); // Уртраг
        
        // Дуудлагын төлөв: pending (хүлээгдэж буй), accepted (авсан), in_progress (засаж байгаа), completed (дууссан), cancelled (цуцалсан)
        $table->enum('status', ['pending', 'accepted', 'in_progress', 'completed', 'cancelled'])->default('pending');
        
        // Засвар хийлгэхээр товлосон цаг (Хэрэв яаралтай биш бол)
        $table->dateTime('scheduled_at')->nullable();
        
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('repair_requests');
    }
};
