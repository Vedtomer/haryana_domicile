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
            'abha-health-id-make',
        ];

        $names = [
            'ABHA Health ID Make',
        ];

        $moduleKeys = [
            'abha_health_id_make',
        ];

        $serviceIds = DB::table('services')
            ->whereIn('slug', $slugs)
            ->orWhereIn('name', $names)
            ->orWhereIn('module_key', $moduleKeys)
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
