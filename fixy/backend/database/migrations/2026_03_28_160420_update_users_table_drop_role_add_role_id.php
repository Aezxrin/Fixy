<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
{
    Schema::table('users', function (Blueprint $table) {
        // 1. role баганыг устгах
        $table->dropColumn('role');

        // 2. role_id-г nullable болгож нэмэх (Ингэснээр алдаа заахгүй)
        $table->foreignId('role_id')->after('email')->nullable()->constrained('roles')->onDelete('cascade');
    });
}

public function down(): void
{
    Schema::table('users', function (Blueprint $table) {
        // Ухраах үед (rollback) буцааж role багана нэмэх, role_id-г устгах
        $table->dropForeign(['role_id']);
        $table->dropColumn('role_id');
        $table->string('role')->after('email')->nullable();
    });
}
};
