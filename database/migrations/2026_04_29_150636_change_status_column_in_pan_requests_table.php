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
        \Illuminate\Support\Facades\DB::statement("ALTER TABLE pan_requests MODIFY COLUMN status VARCHAR(50) DEFAULT 'pending'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Reverting to original enum if needed, though not strictly necessary
        \Illuminate\Support\Facades\DB::statement("ALTER TABLE pan_requests MODIFY COLUMN status ENUM('pending', 'completed') DEFAULT 'pending'");
    }
};
