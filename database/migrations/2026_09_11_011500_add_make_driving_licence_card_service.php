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
        // Check if driving-licence-pvc exists to rename, or insert make-driving-licence-card
        $existing = DB::table('services')
            ->where('slug', 'make-driving-licence-card')
            ->orWhere('slug', 'driving-licence-pvc')
            ->first();

        if ($existing) {
            DB::table('services')->where('id', $existing->id)->update([
                'name' => 'Make Driving Licence (Cards)',
                'slug' => 'make-driving-licence-card',
                'description' => 'Generate Print-Ready PVC Front, Back & A4 Sheet from Driving Licence Number and Date of Birth.',
                'icon' => 'directions_car',
                'coin_cost' => 20,
                'kind' => 'module',
                'module_key' => 'make_driving_licence_card',
                'is_active' => true,
                'visibility' => 'public',
                'is_premium' => false,
                'unlock_cost' => 0,
                'updated_at' => now(),
            ]);
        } else {
            DB::table('services')->insert([
                'name' => 'Make Driving Licence (Cards)',
                'slug' => 'make-driving-licence-card',
                'description' => 'Generate Print-Ready PVC Front, Back & A4 Sheet from Driving Licence Number and Date of Birth.',
                'icon' => 'directions_car',
                'coin_cost' => 20,
                'kind' => 'module',
                'module_key' => 'make_driving_licence_card',
                'is_active' => true,
                'visibility' => 'public',
                'is_premium' => false,
                'unlock_cost' => 0,
                'sort_order' => 23,
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
        DB::table('services')->where('slug', 'make-driving-licence-card')->delete();
    }
};
