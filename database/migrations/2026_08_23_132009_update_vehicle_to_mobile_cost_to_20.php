<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        \Illuminate\Support\Facades\DB::table('services')->where('slug', 'vehicle-to-mobile')->update([
            'coin_cost' => 20
        ]);
    }

    public function down(): void
    {
        \Illuminate\Support\Facades\DB::table('services')->where('slug', 'vehicle-to-mobile')->update([
            'coin_cost' => 0
        ]);
    }
};
