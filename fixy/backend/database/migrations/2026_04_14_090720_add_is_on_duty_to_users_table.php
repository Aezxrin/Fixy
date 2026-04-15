<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('users', function (Blueprint $table) {
            // is_on_duty баганыг boolean (үнэн/худал) төрлөөр нэмж, анхны утгыг false (офлайн) болгох
            $table->boolean('is_on_duty')->default(false)->after('role_id'); 
        });
    }

    public function down()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('is_on_duty');
        });
    }
};