<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use App\Models\Service;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $existing = DB::table('services')->where('slug', 'kundli-generator')->first();

        if (!$existing) {
            DB::table('services')->insert([
                'name' => 'Kundli Generator (Janam Kundli)',
                'slug' => 'kundli-generator',
                'description' => 'Generate and print detailed Janam Kundli with charts & planetary predictions.',
                'icon' => '🪐',
                'coin_cost' => 20,
                'kind' => Service::KIND_MODULE,
                'module_key' => 'kundli_generator',
                'sort_order' => 30,
                'is_active' => true,
                'visibility' => Service::VISIBILITY_PUBLIC,
                'is_premium' => false,
                'unlock_cost' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        } else {
            DB::table('services')->where('slug', 'kundli-generator')->update([
                'name' => 'Kundli Generator (Janam Kundli)',
                'description' => 'Generate and print detailed Janam Kundli with charts & planetary predictions.',
                'icon' => '🪐',
                'kind' => Service::KIND_MODULE,
                'module_key' => 'kundli_generator',
                'sort_order' => 30,
                'is_active' => true,
                'visibility' => Service::VISIBILITY_PUBLIC,
                'updated_at' => now(),
            ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
    }
};
