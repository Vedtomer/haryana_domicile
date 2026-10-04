<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Deactivate old passport-maker service
        DB::table('services')->where('slug', 'passport-maker')->update([
            'is_active' => false,
            'updated_at' => now(),
        ]);

        // 2. Rename photo-signature-resizer to Passport Photo Maker
        DB::table('services')->where('slug', 'photo-signature-resizer')->update([
            'name' => 'Passport Photo Maker',
            'description' => 'Online Passport size photo maker with Name, DOP, DOB, Signature strip & Direct A4 6-per-line sheet printing',
            'icon' => 'badge',
            'updated_at' => now(),
        ]);
    }

    public function down(): void
    {
        DB::table('services')->where('slug', 'photo-signature-resizer')->update([
            'name' => 'Sarkari Photo & Sign Resizer',
            'updated_at' => now(),
        ]);
    }
};
