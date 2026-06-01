<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('repair_requests', function (Blueprint $table) {
            // Засварчинд мөнгийг нь өгсөн эсэхийг хадгалах багана (Анхны утга: 0 буюу Үгүй)
            $table->boolean('is_paid_to_tech')->default(false)->after('repair_fee');
            // Хэзээ төлсөн огноог хадгалах
            $table->timestamp('paid_at')->nullable()->after('is_paid_to_tech');
        });
    }

    public function down()
    {
        Schema::table('repair_requests', function (Blueprint $table) {
            $table->dropColumn(['is_paid_to_tech', 'paid_at']);
        });
    }
};