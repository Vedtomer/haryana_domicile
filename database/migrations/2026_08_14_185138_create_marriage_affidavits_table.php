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
        Schema::create('marriage_affidavits', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();

            $table->date('marriage_date')->nullable();
            $table->string('marriage_venue')->nullable();
            $table->string('religion')->nullable();

            $table->string('groom_name')->nullable();
            $table->string('groom_father_name')->nullable();
            $table->string('groom_address')->nullable();
            $table->date('groom_dob')->nullable();
            $table->string('groom_age')->nullable();

            $table->string('bride_name')->nullable();
            $table->string('bride_father_name')->nullable();
            $table->string('bride_address')->nullable();
            $table->date('bride_dob')->nullable();
            $table->string('bride_age')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('marriage_affidavits');
    }
};
