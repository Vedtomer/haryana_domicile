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
        // 1. Ensure Smart PVC Card Maker is present, active, and public
        $smartPvc = DB::table('services')->where('slug', 'pvc-card-maker')->first();
        if (!$smartPvc) {
            DB::table('services')->insert([
                'name' => 'Smart PVC Card Maker',
                'slug' => 'pvc-card-maker',
                'description' => 'Generate Print-Ready PVC Front, Back & A4 Sheet from Haryana Family ID, Ayushman, Voter, PAN, e-Shram PDFs.',
                'icon' => '🪪',
                'coin_cost' => 20,
                'kind' => Service::KIND_MODULE,
                'module_key' => 'pvc_card_maker',
                'sort_order' => 14,
                'is_active' => true,
                'visibility' => Service::VISIBILITY_PUBLIC,
                'is_premium' => false,
                'unlock_cost' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        } else {
            DB::table('services')->where('slug', 'pvc-card-maker')->update([
                'is_active' => true,
                'visibility' => Service::VISIBILITY_PUBLIC,
                'updated_at' => now(),
            ]);
        }

        // 2. Ensure Aadhaar PVC Card Maker is present, active, and public
        $aadhaarPvc = DB::table('services')->where('slug', 'aadhaar-pvc-card')->first();
        if (!$aadhaarPvc) {
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
                'is_active' => true,
                'visibility' => Service::VISIBILITY_PUBLIC,
                'updated_at' => now(),
            ]);
        }

        // 3. Activate and make public any other services with Smart/Aadhaar/PVC in their name/slug
        DB::table('services')
            ->where('name', 'like', '%Smart%PVC%')
            ->orWhere('name', 'like', '%Smart%Aadhar%')
            ->orWhere('name', 'like', '%Smart%Aadhaar%')
            ->orWhere('name', 'like', '%Aadhaar%PVC%')
            ->orWhere('name', 'like', '%Aadhar%PVC%')
            ->orWhere('slug', 'like', '%pvc%')
            ->update([
                'is_active' => true,
                'visibility' => Service::VISIBILITY_PUBLIC,
                'updated_at' => now(),
            ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
    }
};
