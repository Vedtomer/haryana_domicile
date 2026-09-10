<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('license_keys', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->unsignedInteger('cost_coins')->default(50);
            $table->unsignedInteger('duration_months')->default(6);
            $table->string('status')->default('unused'); // unused, active, revoked
            $table->foreignId('purchased_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('activated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('activated_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->string('notes')->nullable();
            $table->timestamps();

            $table->index(['status', 'key']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('license_keys');
    }
};
