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
        $existing = DB::table('services')
            ->where('slug', 'aadhar-to-info')
            ->orWhere('module_key', 'aadhar_to_info')
            ->first();

        if ($existing) {
            DB::table('services')->where('id', $existing->id)->update([
                'name' => 'Aadhaar No. To Info',
                'slug' => 'aadhar-to-info',
                'description' => 'Find all linked mobile numbers, telecom circle, father name, and address from Aadhaar Number.',
                'icon' => 'contact_phone',
                'coin_cost' => 99,
                'kind' => 'module',
                'module_key' => 'aadhar_to_info',
                'is_active' => true,
                'visibility' => 'public',
                'is_premium' => false,
                'unlock_cost' => 0,
                'sort_order' => 15,
                'updated_at' => now(),
            ]);
        } else {
            DB::table('services')->insert([
                'name' => 'Aadhaar No. To Info',
                'slug' => 'aadhar-to-info',
                'description' => 'Find all linked mobile numbers, telecom circle, father name, and address from Aadhaar Number.',
                'icon' => 'contact_phone',
                'coin_cost' => 99,
                'kind' => 'module',
                'module_key' => 'aadhar_to_info',
                'is_active' => true,
                'visibility' => 'public',
                'is_premium' => false,
                'unlock_cost' => 0,
                'sort_order' => 15,
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
        DB::table('services')->where('slug', 'aadhar-to-info')->delete();
    }
};
