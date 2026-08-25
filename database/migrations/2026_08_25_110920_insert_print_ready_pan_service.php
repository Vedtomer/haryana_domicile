<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $exists = DB::table('services')->where('slug', 'print-ready-manual-pan')->exists();
        
        if (!$exists) {
            DB::table('services')->insert([
                'name' => 'Print-Ready Manual PAN Card',
                'slug' => 'print-ready-manual-pan',
                'description' => 'Generate instant print-ready PAN card PDF',
                'icon' => '🪪',
                'coin_cost' => 50,
                'kind' => 'module',
                'module_key' => 'manual_pan_card',
                'is_active' => true,
                'visibility' => 'public',
                'is_premium' => false,
                'sort_order' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    public function down(): void
    {
        DB::table('services')->where('slug', 'print-ready-manual-pan')->delete();
    }
};
