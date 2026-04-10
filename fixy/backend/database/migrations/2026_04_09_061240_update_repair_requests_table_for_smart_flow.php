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
    Schema::table('repair_requests', function (Blueprint $table) {
        // Хуучин статусыг шинэ олон сонголттой статусаар солих
        // draft, pending_approval, awaiting_deposit, en_route, in_progress, awaiting_payment, completed, cancelled
        $table->string('status')->default('draft')->change();
        
        // Шинэ үнийн дүнгүүд нэмэх
        $table->decimal('call_fee', 10, 2)->default(0)->after('status'); // Дуудлагын хураамж (Баталгаажуулах төлбөр)
        $table->decimal('repair_fee', 10, 2)->default(0)->after('call_fee'); // Засварын үндсэн төлбөр
        
        // Засварчны хариу өгөх хугацаа (Менежмент хийхэд хэрэгтэй)
        $table->timestamp('expired_at')->nullable()->after('scheduled_at');
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
