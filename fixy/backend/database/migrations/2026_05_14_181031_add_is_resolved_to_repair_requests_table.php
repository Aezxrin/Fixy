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
        $table->boolean('is_complaint_resolved')->default(false)->after('review');
    });
}

public function down()
{
    Schema::table('repair_requests', function (Blueprint $table) {
        $table->dropColumn('is_complaint_resolved');
    });
}
};
