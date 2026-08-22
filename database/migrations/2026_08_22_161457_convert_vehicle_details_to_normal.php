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
        DB::table('services')->where('slug', 'vehicle-details')->update([
            'is_premium' => false,
            'coin_cost' => 20, // Normal coin cost
            'unlock_cost' => 0 // Removing premium unlock cost
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::table('services')->where('slug', 'vehicle-details')->update([
            'is_premium' => true,
            'coin_cost' => 0,
            'unlock_cost' => 500
        ]);
    }
};
