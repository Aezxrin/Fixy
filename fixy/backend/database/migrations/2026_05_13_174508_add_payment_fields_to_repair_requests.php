<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    // Migration файл дотор:
    public function up()
    {
        Schema::table('repair_requests', function (Blueprint $table) {
            $table->string('payment_method')->nullable(); // qpay, socialpay, bank_transfer
            $table->string('payment_status')->default('pending'); // pending, paid, failed
            $table->string('transaction_id')->nullable(); // Банкны гүйлгээний дугаар
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('repair_requests', function (Blueprint $table) {
            //
        });
    }
};
