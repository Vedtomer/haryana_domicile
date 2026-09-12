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
        $existing = DB::table('services')->where('slug', 'aadhaar-pvc-card')->first();
        if (!$existing) {
            DB::table('services')->insert([
                'name' => 'Aadhaar PVC Card Maker',
                'slug' => 'aadhaar-pvc-card',
                'description' => 'Generate Print-Ready PVC Front & Back Card from e-Aadhaar PDF.',
                'icon' => '🔍',
                'coin_cost' => 20,
                'kind' => Service::KIND_MODULE,
                'module_key' => 'aadhaar_pvc',
                'sort_order' => 16,
                'is_active' => true,
                'visibility' => Service::VISIBILITY_PUBLIC,
                'is_premium' => false,
                'unlock_cost' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        } else {
            DB::table('services')->where('slug', 'aadhaar-pvc-card')->update([
                'name' => 'Aadhaar PVC Card Maker',
                'description' => 'Generate Print-Ready PVC Front & Back Card from e-Aadhaar PDF.',
                'icon' => '🔍',
                'kind' => Service::KIND_MODULE,
                'module_key' => 'aadhaar_pvc',
                'sort_order' => 16,
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
