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
        if (Schema::hasTable('rent_agreements') && !Schema::hasColumn('rent_agreements', 'second_party_aadhar')) {
            Schema::table('rent_agreements', function (Blueprint $table) {
                $table->string('second_party_aadhar', 50)->nullable()->after('second_party_name');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('rent_agreements') && Schema::hasColumn('rent_agreements', 'second_party_aadhar')) {
            Schema::table('rent_agreements', function (Blueprint $table) {
                $table->dropColumn('second_party_aadhar');
            });
        }
    }
};
