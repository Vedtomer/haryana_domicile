<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Add last_seen_at to users table if not already present
        if (!Schema::hasColumn('users', 'last_seen_at')) {
            Schema::table('users', function (Blueprint $table) {
                $table->timestamp('last_seen_at')->nullable()->after('last_activity_at');
            });
        }

        // 2. Create chat_messages table
        if (!Schema::hasTable('chat_messages')) {
            Schema::create('chat_messages', function (Blueprint $table) {
                $table->id();
                // Which user account thread this belongs to
                $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
                // Who actually sent the message (Admin or User)
                $table->foreignId('sender_id')->constrained('users')->onDelete('cascade');
                // 'admin' or 'user'
                $table->string('sender_type', 20)->default('user');
                $table->text('message');
                $table->boolean('is_read')->default(false);
                $table->timestamps();

                $table->index(['user_id', 'created_at']);
                $table->index(['user_id', 'is_read']);
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('chat_messages');

        if (Schema::hasColumn('users', 'last_seen_at')) {
            Schema::table('users', function (Blueprint $table) {
                $table->dropColumn('last_seen_at');
            });
        }
    }
};
