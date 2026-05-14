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
    Schema::create('complaints', function (Blueprint $table) {
        $table->id();
        $table->string('customer_name'); // Гомдол гаргагч
        $table->string('technician_name'); // Холбогдох засварчин
        $table->text('issue'); // Гомдлын шалтгаан
        $table->string('status')->default('new'); // Төлөв: new, resolved
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('complaints');
    }
};
