<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('services', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->string('icon')->nullable();          // emoji shown on the dashboard card
            $table->unsignedInteger('coin_cost')->default(0); // 0 = free service
            $table->string('kind')->default('manual');   // 'module' = built-in form, 'manual' = admin handled
            $table->string('module_key')->nullable();    // marriage_form | birth_record | haryana_domicile | pan_request
            $table->json('fields')->nullable();          // manual services: [{label, type, required}]
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();

            $table->index(['is_active', 'sort_order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('services');
    }
};
