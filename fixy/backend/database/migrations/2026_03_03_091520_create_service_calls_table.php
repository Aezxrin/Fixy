<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void {
    Schema::create('service_calls', function (Blueprint $table) {
        $table->id();
        $table->foreignId('user_id')->constrained()->onDelete('cascade'); // Захиалагч хэрэглэгч
        $table->foreignId('technician_id')->nullable()->constrained('users'); // Хуваарилагдсан техникч
        $table->string('service_type'); // Үйлчилгээний төрөл (Жишээ нь: Төмөр хийц гагнуур)
        $table->text('description'); // Асуудлын дэлгэрэнгүй тайлбар
        $table->string('location'); // Үйлчилгээ авах хаяг
        $table->enum('status', ['pending', 'assigned', 'in_progress', 'completed', 'cancelled'])->default('pending');
        $table->decimal('price', 10, 2)->nullable(); // Үйлчилгээний үнэ
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('service_calls');
    }
};
