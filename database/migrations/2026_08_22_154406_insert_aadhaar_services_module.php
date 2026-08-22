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
        $exists = DB::table('services')->where('slug', 'aadhaar-services')->exists();
        if (!$exists) {
            DB::table('services')->insert([
                'name' => 'Aadhaar Services',
                'slug' => 'aadhaar-services',
                'description' => 'Official UIDAI portals for Aadhaar related utilities',
                'icon' => 'fingerprint',
                'coin_cost' => 0,
                'kind' => 'module',
                'module_key' => 'aadhaar_services',
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
        DB::table('services')->where('slug', 'aadhaar-services')->delete();
    }
};
