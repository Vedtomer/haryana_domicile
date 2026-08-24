<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::table('services')->update(['visibility' => 'private']);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('private', function (Blueprint $table) {
            //
        });
    }
};
