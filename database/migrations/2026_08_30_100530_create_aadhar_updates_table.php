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
        Schema::create('aadhar_updates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('aadhar_number');
            $table->string('name');
            $table->string('c_o')->nullable();
            $table->string('house_no')->nullable();
            $table->string('street')->nullable();
            $table->string('landmark')->nullable();
            $table->string('locality')->nullable();
            $table->string('village_town');
            $table->string('post_office')->nullable();
            $table->string('district');
            $table->string('state');
            $table->string('pin_code');
            $table->string('certifier_name')->nullable();
            $table->string('certifier_designation')->nullable();
            $table->string('certifier_address')->nullable();
            $table->string('certifier_contact')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('aadhar_updates');
    }
};
