<?php

use App\Models\Service;
use App\Models\User;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Update all existing services to private visibility
        DB::table('services')->update(['visibility' => 'private']);

        // 2. Protect existing users: Grant all active services to current regular users
        // so that existing customers do not lose any services.
        $activeServiceIds = DB::table('services')->where('is_active', true)->pluck('id')->toArray();

        if (!empty($activeServiceIds)) {
            $existingUsers = User::where('type', 'user')->get();
            foreach ($existingUsers as $user) {
                if ($user->services()->count() === 0) {
                    $user->services()->sync($activeServiceIds);
                }
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No-op
    }
};
