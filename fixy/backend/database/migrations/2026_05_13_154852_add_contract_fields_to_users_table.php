<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('users', function (Blueprint $table) {
            // Гэрээний төлөв: none (байхгүй), sent (илгээсэн), signed (зурсан), approved (баталсан)
            $table->string('contract_status')->default('none'); 
            
            // Гарын үсгийн зургийн зам
            $table->string('signature_path')->nullable(); 
            
            // Гэрээ зурсан огноо
            $table->timestamp('contract_signed_at')->nullable(); 
        });
    }

    public function down()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['contract_status', 'signature_path', 'contract_signed_at']);
        });
    }
};