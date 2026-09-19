<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $slugs = [
            'pan-pdf',
            'pan-card-pdf',
            'pan-pdf-download',
            'pan-download-pdf',
            'instant-pan-pdf',
            'pan-pdf-service',
            'pan-find-pdf',
            'find-pan-pdf',
            'pan-number-to-pdf',
            'pan-to-pdf',
            'pan-pdf-instant',
            'pan-card-download-pdf',
            'e-pan-pdf',
            'epan-pdf',
        ];

        $names = [
            'PAN PDF',
            'Pan PDF',
            'PAN Card PDF',
            'Pan Card PDF',
            'PAN PDF Download',
            'Instant PAN PDF',
            'Download PAN PDF',
            'PAN PDF Service',
            'PAN Card (PDF)',
            'Pan Card Download PDF',
            'Pan PDF Instant',
            'E-PAN PDF',
            'e-PAN PDF',
        ];

        // Find any service with charge 129, or explicitly matching PAN PDF slugs/names
        $services = DB::table('services')
            ->where(function ($q) use ($slugs, $names) {
                $q->where('coin_cost', 129)
                  ->orWhere('unlock_cost', 129)
                  ->orWhereIn('slug', $slugs)
                  ->orWhereIn('name', $names)
                  ->orWhere(function ($sub) {
                      $sub->whereRaw('LOWER(name) LIKE ?', ['%pan%'])
                          ->whereRaw('LOWER(name) LIKE ?', ['%pdf%']);
                  })
                  ->orWhere(function ($sub) {
                      $sub->whereRaw('LOWER(slug) LIKE ?', ['%pan%'])
                          ->whereRaw('LOWER(slug) LIKE ?', ['%pdf%']);
                  })
                  ->orWhere('module_key', 'pan_pdf');
            })
            ->get();

        $serviceIds = $services->pluck('id')->all();

        if (!empty($serviceIds)) {
            // 1. Delete associated permissions / user assignments
            if (Schema::hasTable('service_user')) {
                DB::table('service_user')->whereIn('service_id', $serviceIds)->delete();
            }

            // 2. Null out foreign key in service_requests if table exists
            if (Schema::hasTable('service_requests')) {
                DB::table('service_requests')->whereIn('service_id', $serviceIds)->update(['service_id' => null]);
            }

            // 3. Delete the service completely
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
