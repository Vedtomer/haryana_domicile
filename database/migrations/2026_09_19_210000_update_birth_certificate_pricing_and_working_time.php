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
        // 1. Birth Certificate Services (Color PDF & Name Add Merger)
        DB::table('services')
            ->where('slug', 'birth-certificate-download')
            ->orWhere('module_key', 'birth_certificate_download')
            ->update([
                'name' => 'Birth Certificate Services',
                'description' => 'Color PDF Download (300 Coins) | Name Add (400 Coins) | Working Time: 15 Min - 24 Hours',
                'icon' => '👶',
                'coin_cost' => 300,
                'is_active' => true,
                'visibility' => 'public',
                'is_premium' => false,
                'updated_at' => now(),
            ]);

        // 2. Birth Certificate Name Add Form
        DB::table('services')
            ->where('slug', 'birth-certificate')
            ->orWhere('module_key', 'birth_record')
            ->update([
                'name' => 'Birth Certificate Name Add',
                'description' => 'जन्म रिकार्ड में नाम जुड़वाने हेतु आवेदन पत्र (400 Coins) | Working Time: 15 Min - 24 Hours',
                'icon' => '📝',
                'coin_cost' => 400,
                'is_active' => true,
                'visibility' => 'public',
                'is_premium' => false,
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
