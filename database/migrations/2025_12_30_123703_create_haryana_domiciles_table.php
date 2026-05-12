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
        Schema::create('haryana_domiciles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->string('pincode')->nullable();
            $table->string('tehsil');
            $table->string('district');
            $table->string('name');
            $table->string('father_name');
            $table->string('village');
            $table->string('ward_no')->nullable();
            $table->integer('age');
            $table->string('mobile', 10);
            $table->string('aadhar', 12);
            $table->string('caste');
            $table->string('religion')->nullable();
            $table->string('ration_card_no')->nullable();
            $table->string('child_name')->nullable();
            $table->timestamps();

            $table->index('user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('haryana_domiciles');
    }
};
