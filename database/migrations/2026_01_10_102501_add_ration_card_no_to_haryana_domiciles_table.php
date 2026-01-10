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
        Schema::table('haryana_domiciles', function (Blueprint $table) {
            $table->string('ration_card_no')->nullable()->after('religion');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('haryana_domiciles', function (Blueprint $table) {
            $table->dropColumn('ration_card_no');
        });
    }
};
