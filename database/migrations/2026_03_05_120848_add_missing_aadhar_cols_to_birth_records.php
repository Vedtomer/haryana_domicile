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
            if (!Schema::hasColumn('birth_records', 'father_aadhar')) {
                $table->string('father_aadhar')->nullable();
            }
            if (!Schema::hasColumn('birth_records', 'mother_aadhar')) {
                $table->string('mother_aadhar')->nullable();
            }
            if (!Schema::hasColumn('birth_records', 'child_document')) {
                $table->string('child_document')->nullable();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('birth_records', function (Blueprint $table) {
            if (Schema::hasColumn('birth_records', 'father_aadhar')) {
                $table->dropColumn('father_aadhar');
            }
            if (Schema::hasColumn('birth_records', 'mother_aadhar')) {
                $table->dropColumn('mother_aadhar');
            }
            if (Schema::hasColumn('birth_records', 'child_document')) {
                $table->dropColumn('child_document');
            }
        });
    }
};
