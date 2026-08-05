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
        Schema::table('marriage_forms', function (Blueprint $table) {
            $table->string('bride_father_father_name')->nullable()->after('bride_father_name');
            $table->string('bride_father_address')->nullable()->after('bride_address');
            $table->string('groom_father_father_name')->nullable()->after('groom_father_name');
            $table->string('groom_father_address')->nullable()->after('groom_address');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('marriage_forms', function (Blueprint $table) {
            $table->dropColumn([
                'bride_father_father_name',
                'bride_father_address',
                'groom_father_father_name',
                'groom_father_address',
            ]);
        });
    }
};
