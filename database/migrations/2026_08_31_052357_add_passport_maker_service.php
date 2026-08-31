<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Models\Service;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Service::firstOrCreate(
            ['slug' => 'passport-maker'],
            [
                'name' => 'Passport Photo Maker',
                'description' => 'Create passport size photos with AI background removal and print-ready layouts.',
                'icon' => 'fas fa-id-badge',
                'is_active' => true,
                'coin_cost' => 20,
                'is_premium' => false,
                'unlock_cost' => 0,
                'kind' => 'module',
                'module_key' => 'passport_maker',
                'visibility' => 'private'
            ]
        );
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Service::where('slug', 'passport-maker')->delete();
    }
};
