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
            ->where('slug', 'qr-to-print')
            ->orWhere('module_key', 'qr_to_print')
            ->first();

        if ($existing) {
            DB::table('services')->where('id', $existing->id)->update([
                'name' => 'QR to Print (Smart Counter)',
                'slug' => 'qr-to-print',
                'description' => 'Direct QR Scan & Auto Print from Customer Mobile to Shop Printer.',
                'icon' => '🖨️',
                'coin_cost' => 0,
                'kind' => 'module',
                'module_key' => 'qr_to_print',
                'is_active' => true,
                'visibility' => 'public',
                'is_premium' => false,
                'unlock_cost' => 0,
                'sort_order' => 1,
                'updated_at' => now(),
            ]);
        } else {
            DB::table('services')->insert([
                'name' => 'QR to Print (Smart Counter)',
                'slug' => 'qr-to-print',
                'description' => 'Direct QR Scan & Auto Print from Customer Mobile to Shop Printer.',
                'icon' => '🖨️',
                'coin_cost' => 0,
                'kind' => 'module',
                'module_key' => 'qr_to_print',
                'is_active' => true,
                'visibility' => 'public',
                'is_premium' => false,
                'unlock_cost' => 0,
                'sort_order' => 1,
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
        DB::table('services')->where('slug', 'qr-to-print')->delete();
    }
};
