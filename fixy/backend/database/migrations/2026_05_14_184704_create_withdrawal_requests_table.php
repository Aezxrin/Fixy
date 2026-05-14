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
    Schema::create('withdrawal_requests', function (Blueprint $table) {
        $table->id();
        $table->foreignId('user_id')->constrained(); // Засварчны ID
        $table->decimal('amount', 15, 2); // Татах дүн
        $table->string('bank_name'); // Банкны нэр
        $table->string('account_number'); // Дансны дугаар
        $table->string('account_holder'); // Хүлээн авагчийн нэр
        $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('withdrawal_requests');
    }
};
