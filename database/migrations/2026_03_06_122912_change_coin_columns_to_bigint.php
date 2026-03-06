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
        Schema::table('users', function (Blueprint $table) {
            $table->bigInteger('coins')->default(0)->change();
        });

        Schema::table('coin_transactions', function (Blueprint $table) {
            $table->bigInteger('amount')->change();
            $table->bigInteger('balance_after')->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->integer('coins')->change();
        });

        Schema::table('coin_transactions', function (Blueprint $table) {
            $table->integer('amount')->change();
            $table->integer('balance_after')->change();
        });
    }
};
