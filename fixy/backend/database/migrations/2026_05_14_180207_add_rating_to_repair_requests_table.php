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
           $table->integer('rating')->nullable()->after('status'); // 1-5 одны үнэлгээ
           $table->text('review')->nullable()->after('rating'); // Санал гомдол/Сэтгэгдэл
       });
   }

   public function down()
   {
       Schema::table('repair_requests', function (Blueprint $table) {
           $table->dropColumn(['rating', 'review']);
       });
   }
};
