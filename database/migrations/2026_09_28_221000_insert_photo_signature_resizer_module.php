<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $exists = DB::table('services')->where('slug', 'photo-signature-resizer')->exists();
        if (!$exists) {
            DB::table('services')->insert([
                'name' => 'Sarkari Photo & Sign Resizer',
                'slug' => 'photo-signature-resizer',
                'description' => 'Resize photos & signatures for SSC, HSSC, UPSC, NTA exams to exact dimensions and KB with white background cleaner',
                'icon' => 'crop',
                'coin_cost' => 0,
                'kind' => 'module',
                'module_key' => 'photo_resizer',
                'is_active' => true,
                'visibility' => 'public',
                'is_premium' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        $existsWhatsapp = DB::table('services')->where('slug', 'customer-whatsapp')->exists();
        if (!$existsWhatsapp) {
            DB::table('services')->insert([
                'name' => 'Customer WhatsApp Sender',
                'slug' => 'customer-whatsapp',
                'description' => 'Send documents, receipts, slips and messages directly to customers on WhatsApp without saving contacts',
                'icon' => 'chat',
                'coin_cost' => 0,
                'kind' => 'module',
                'module_key' => 'customer_whatsapp',
                'is_active' => true,
                'visibility' => 'public',
                'is_premium' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        $existsAffidavit = DB::table('services')->where('slug', 'legal-affidavits')->exists();
        if (!$existsAffidavit) {
            DB::table('services')->insert([
                'name' => 'Govt Affidavits & Legal Forms',
                'slug' => 'legal-affidavits',
                'description' => 'Ready to print Vehicle Sale Agreement, Lost Document Affidavit, and Character Certificate Affidavits for e-Stamp paper',
                'icon' => 'gavel',
                'coin_cost' => 0,
                'kind' => 'module',
                'module_key' => 'legal_affidavits',
                'is_active' => true,
                'visibility' => 'public',
                'is_premium' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
        $existsKhata = DB::table('services')->where('slug', 'khata-tracker')->exists();
        if (!$existsKhata) {
            DB::table('services')->insert([
                'name' => 'Cyber Café Khata & Earning Tracker',
                'slug' => 'khata-tracker',
                'description' => 'Track customer udhaar, remaining balance, send WhatsApp reminders, and maintain daily expenses ledger',
                'icon' => 'menu_book',
                'coin_cost' => 0,
                'kind' => 'module',
                'module_key' => 'khata_tracker',
                'is_active' => true,
                'visibility' => 'public',
                'is_premium' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    public function down(): void
    {
        DB::table('services')->where('slug', 'photo-signature-resizer')->delete();
        DB::table('services')->where('slug', 'customer-whatsapp')->delete();
        DB::table('services')->where('slug', 'legal-affidavits')->delete();
        DB::table('services')->where('slug', 'khata-tracker')->delete();
    }
};
