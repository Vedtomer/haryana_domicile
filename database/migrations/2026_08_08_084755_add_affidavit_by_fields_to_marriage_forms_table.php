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
            $table->string('groom_affidavit_by')->default('father');
            $table->string('bride_affidavit_by')->default('father');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('marriage_forms', function (Blueprint $table) {
            $table->dropColumn(['groom_affidavit_by', 'bride_affidavit_by']);
        });
    }
};
