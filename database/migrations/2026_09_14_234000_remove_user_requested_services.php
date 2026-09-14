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
        $slugs = [
            'voter-card-manual-address-change',
            'pdf-editor',
            'pan-full-details-instant',
            'pan-details-instant',
            'pan-uti-pvc',
            'pan-instant-pvc',
            'pan-card',
        ];

        $names = [
            'Voter Card Manual For Address Change',
            'PDF Editor',
            'Pan Details Server Instant',
            'PAN Full Details Instant',
            'PAN Card (UTIITSL) PVC',
            'PAN Card (Instant e-Filing) PVC',
            'PAN Card',
        ];

        $serviceIds = DB::table('services')
            ->whereIn('slug', $slugs)
            ->orWhereIn('name', $names)
            ->pluck('id');

        if ($serviceIds->isNotEmpty()) {
            DB::table('service_user')->whereIn('service_id', $serviceIds)->delete();
            DB::table('services')->whereIn('id', $serviceIds)->delete();
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
