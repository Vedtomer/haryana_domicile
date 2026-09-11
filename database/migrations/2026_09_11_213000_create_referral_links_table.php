<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (!Schema::hasTable('referral_links')) {
            Schema::create('referral_links', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
                $table->string('code', 30)->unique();
                $table->boolean('is_used')->default(false);
                $table->foreignId('used_by')->nullable()->constrained('users')->nullOnDelete();
                $table->timestamp('used_at')->nullable();
                $table->boolean('reward_paid')->default(false);
                $table->timestamp('reward_paid_at')->nullable();
                $table->timestamps();
            });
        }

        // Initialize active referral link for each existing user
        $users = DB::table('users')->get();
        foreach ($users as $user) {
            $code = $user->referral_code;
            if (empty($code)) {
                $code = 'CSP' . strtoupper(Str::random(5));
                DB::table('users')->where('id', $user->id)->update(['referral_code' => $code]);
            }

            $hasActive = DB::table('referral_links')
                ->where('user_id', $user->id)
                ->where('is_used', false)
                ->exists();

            if (!$hasActive) {
                DB::table('referral_links')->insertOrIgnore([
                    'user_id'    => $user->id,
                    'code'       => $code,
                    'is_used'    => false,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('referral_links');
    }
};
