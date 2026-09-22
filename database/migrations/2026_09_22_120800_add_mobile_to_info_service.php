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
            ->where('slug', 'mobile-to-info')
            ->orWhere('module_key', 'mobile_to_info')
            ->first();

        if ($existing) {
            DB::table('services')->where('id', $existing->id)->update([
                'name' => 'Mobile to Info',
                'slug' => 'mobile-to-info',
                'description' => 'Lookup subscriber name, father name, address, telecom circle and details from Mobile Number.',
                'icon' => 'contact_phone',
                'coin_cost' => 149,
                'kind' => 'module',
                'module_key' => 'mobile_to_info',
                'is_active' => true,
                'visibility' => 'public',
                'is_premium' => false,
                'unlock_cost' => 0,
                'sort_order' => 17,
                'updated_at' => now(),
            ]);
        } else {
            DB::table('services')->insert([
                'name' => 'Mobile to Info',
                'slug' => 'mobile-to-info',
                'description' => 'Lookup subscriber name, father name, address, telecom circle and details from Mobile Number.',
                'icon' => 'contact_phone',
                'coin_cost' => 149,
                'kind' => 'module',
                'module_key' => 'mobile_to_info',
                'is_active' => true,
                'visibility' => 'public',
                'is_premium' => false,
                'unlock_cost' => 0,
                'sort_order' => 17,
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
        DB::table('services')->where('slug', 'mobile-to-info')->delete();
    }
};
