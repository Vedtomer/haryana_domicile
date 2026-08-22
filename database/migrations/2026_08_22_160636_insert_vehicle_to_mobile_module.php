<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $exists = DB::table('services')->where('slug', 'vehicle-to-mobile')->exists();
        if (!$exists) {
            DB::table('services')->insert([
                'name' => 'Vehicle to Mobile Number',
                'slug' => 'vehicle-to-mobile',
                'description' => 'Instant lookup of mobile number associated with a vehicle',
                'icon' => 'directions_car',
                'coin_cost' => 0,
                'kind' => 'module',
                'module_key' => 'vehicle_to_mobile',
                'is_active' => true,
                'visibility' => 'public',
                'is_premium' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::table('services')->where('slug', 'vehicle-to-mobile')->delete();
    }
};
