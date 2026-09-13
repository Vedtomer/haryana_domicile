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
        if (Schema::hasTable('marriage_forms') && !Schema::hasColumn('marriage_forms', 'application_date')) {
            Schema::table('marriage_forms', function (Blueprint $table) {
                $table->date('application_date')->nullable()->after('marriage_date');
            });
        }

        if (Schema::hasTable('marriage_affidavits') && !Schema::hasColumn('marriage_affidavits', 'application_date')) {
            Schema::table('marriage_affidavits', function (Blueprint $table) {
                $table->date('application_date')->nullable()->after('marriage_date');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('marriage_forms') && Schema::hasColumn('marriage_forms', 'application_date')) {
            Schema::table('marriage_forms', function (Blueprint $table) {
                $table->dropColumn('application_date');
            });
        }

        if (Schema::hasTable('marriage_affidavits') && Schema::hasColumn('marriage_affidavits', 'application_date')) {
            Schema::table('marriage_affidavits', function (Blueprint $table) {
                $table->dropColumn('application_date');
            });
        }
    }
};
