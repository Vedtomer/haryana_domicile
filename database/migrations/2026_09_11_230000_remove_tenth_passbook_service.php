<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::table('services')
            ->where('slug', 'tenth-passbook')
            ->orWhere('module_key', 'tenth_passbook')
            ->delete();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
    }
};
