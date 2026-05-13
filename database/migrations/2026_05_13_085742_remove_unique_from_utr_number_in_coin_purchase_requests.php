<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('coin_purchase_requests', function (Blueprint $table) {
            $table->dropUnique('coin_purchase_requests_utr_number_unique');
            $table->string('utr_number')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('coin_purchase_requests', function (Blueprint $table) {
            $table->string('utr_number')->nullable(false)->change();
            $table->unique('utr_number');
        });
    }
};
