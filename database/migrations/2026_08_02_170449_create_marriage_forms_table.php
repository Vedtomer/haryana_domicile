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
        Schema::create('marriage_forms', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            
            // Groom Details
            $table->string('groom_name')->nullable();
            $table->string('groom_father_name')->nullable();
            $table->string('groom_address')->nullable();
            $table->string('groom_age')->nullable();
            
            // Bride Details
            $table->string('bride_name')->nullable();
            $table->string('bride_father_name')->nullable();
            $table->string('bride_address')->nullable();
            $table->string('bride_age')->nullable();
            
            // Marriage Details
            $table->date('marriage_date')->nullable();
            $table->string('marriage_venue')->nullable();
            
            // Groom Witness
            $table->string('groom_witness_name')->nullable();
            $table->string('groom_witness_father_name')->nullable();
            $table->string('groom_witness_address')->nullable();
            
            // Bride Witness
            $table->string('bride_witness_name')->nullable();
            $table->string('bride_witness_father_name')->nullable();
            $table->string('bride_witness_address')->nullable();
            
            // Pandit Details
            $table->string('pandit_name')->nullable();
            $table->string('pandit_father_name')->nullable();
            $table->string('pandit_address')->nullable();
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('marriage_forms');
    }
};
