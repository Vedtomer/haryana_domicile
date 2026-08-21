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
        Schema::table('birth_records', function (Blueprint $table) {
            $table->string('father_signature')->nullable()->after('mother_aadhar');
            $table->string('mother_signature')->nullable()->after('father_signature');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('birth_records', function (Blueprint $table) {
            $table->dropColumn(['father_signature', 'mother_signature']);
        });
    }
};
