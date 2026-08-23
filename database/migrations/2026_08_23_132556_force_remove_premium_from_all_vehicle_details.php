<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        \Illuminate\Support\Facades\DB::table('services')
            ->where('name', 'like', '%Vehicle%')
            ->orWhere('slug', 'like', '%vehicle%')
            ->update([
                'is_premium' => false,
                'coin_cost' => 20,
                'unlock_cost' => 0
            ]);
    }

    public function down(): void
    {
        // No down migration needed for this force fix
    }
};
