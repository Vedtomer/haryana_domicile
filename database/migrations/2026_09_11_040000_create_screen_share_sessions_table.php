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
        Schema::create('screen_share_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('admin_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->enum('status', ['requesting', 'accepted', 'rejected', 'ended'])->default('requesting');
            $table->longText('offer')->nullable();
            $table->longText('answer')->nullable();
            $table->longText('admin_candidates')->nullable();
            $table->longText('user_candidates')->nullable();
            $table->timestamp('ended_at')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'status']);
            $table->index(['admin_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('screen_share_sessions');
    }
};
