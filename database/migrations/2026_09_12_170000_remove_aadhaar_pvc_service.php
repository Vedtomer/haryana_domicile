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
        DB::table('services')
            ->where('slug', 'aadhaar-pvc-card')
            ->orWhere('slug', 'aadhar-pvc-card')
            ->orWhere('slug', 'aadhar-pvc')
            ->orWhere('slug', 'aadhaar-pvc')
            ->orWhere('slug', 'aadhar-pdf-to-pvc')
            ->orWhere('slug', 'aadhar-pdf-to-pvc-instant')
            ->orWhere('slug', 'pdf-to-pvc-instant')
            ->orWhere('module_key', 'aadhaar_pvc')
            ->orWhere('module_key', 'aadhar_pvc')
            ->orWhere('name', 'like', '%Aadhaar%PVC%')
            ->orWhere('name', 'like', '%Aadhar%PVC%')
            ->orWhere('name', 'like', '%Aadhar%pdf%to%pvc%')
            ->orWhere('name', 'like', '%Aadhaar%pdf%to%pvc%')
            ->orWhere('name', 'like', '%pdf%to%pvc%')
            ->orWhere('name', 'like', '%Aadhar%Instant%')
            ->orWhere('slug', 'like', '%aadhar%pvc%')
            ->orWhere('slug', 'like', '%aadhaar%pvc%')
            ->orWhere('slug', 'like', '%pdf%to%pvc%')
            ->delete();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
    }
};
