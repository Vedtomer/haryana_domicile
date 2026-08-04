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
            $table->string('district')->nullable()->after('marriage_venue');
            $table->string('religion')->nullable()->after('district');
            $table->string('nationality')->nullable()->after('religion');
            $table->string('groom_mother_name')->nullable()->after('groom_father_name');
            $table->date('groom_dob')->nullable()->after('groom_age');
            $table->string('bride_mother_name')->nullable()->after('bride_father_name');
            $table->date('bride_dob')->nullable()->after('bride_age');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('marriage_forms', function (Blueprint $table) {
            $table->dropColumn([
                'district',
                'religion',
                'nationality',
                'groom_mother_name',
                'groom_dob',
                'bride_mother_name',
                'bride_dob',
            ]);
        });
    }
};
