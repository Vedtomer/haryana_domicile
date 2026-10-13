<?php

use App\Models\Service;
use App\Models\Setting;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $service = Service::where('slug', 'mobile-to-info')
            ->orWhere('slug', 'mobile-number-to-info')
            ->orWhere('module_key', 'mobile_to_info')
            ->first();

        if ($service) {
            $service->update([
                'name' => 'Mobile Number to Info',
                'coin_cost' => 99,
                'is_active' => true,
                'visibility' => 'public',
                'description' => 'Lookup subscriber name, father name, address, telecom circle and details from Mobile Number.',
                'icon' => 'contact_phone',
            ]);
        } else {
            Service::create([
                'name' => 'Mobile Number to Info',
                'slug' => 'mobile-to-info',
                'description' => 'Lookup subscriber name, father name, address, telecom circle and details from Mobile Number.',
                'icon' => 'contact_phone',
                'coin_cost' => 99,
                'kind' => 'module',
                'module_key' => 'mobile_to_info',
                'is_active' => true,
                'visibility' => 'public',
                'is_premium' => false,
                'unlock_cost' => 0,
                'sort_order' => 17,
            ]);
        }

        Setting::set('mobile_to_info_api_url', 'https://osint-apis-hub.onrender.com/api/num-info?key=1week&q=');
        Setting::set('mobile_to_info_api_key', '1week');

        $targetService = Service::where('slug', 'mobile-to-info')->first();
        if ($targetService) {
            foreach (\App\Models\User::all() as $u) {
                $u->services()->syncWithoutDetaching([$targetService->id]);
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No down migration needed
    }
};
