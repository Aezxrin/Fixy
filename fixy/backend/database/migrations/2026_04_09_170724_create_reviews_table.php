<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::create('reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('repair_request_id')->constrained('repair_requests')->onDelete('cascade'); // Ямар дуудлага дээр өгсөн үнэлгээ вэ
            $table->foreignId('reviewer_id')->constrained('users')->onDelete('cascade'); // Хэн үнэлсэн (Иргэн)
            $table->foreignId('reviewee_id')->constrained('users')->onDelete('cascade'); // Хэнийг үнэлсэн (Засварчин)
            $table->integer('rating'); // 1-ээс 5 од хүртэл
            $table->text('comment')->nullable(); // Сэтгэгдэл
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reviews');
    }
};
