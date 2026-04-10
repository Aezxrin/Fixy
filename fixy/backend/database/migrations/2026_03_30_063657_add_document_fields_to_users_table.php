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
            // Засварчны бичиг баримтын зургуудыг хадгалах баганууд (хоосон байж болно)
            $table->string('id_card_image')->nullable()->after('status');
            $table->string('certificate_image')->nullable()->after('id_card_image');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['id_card_image', 'certificate_image']);
        });
    }
};
