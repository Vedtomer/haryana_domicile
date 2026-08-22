<?php

namespace Database\Seeders;

use App\Models\Service;
use Illuminate\Database\Seeder;

class ServiceSeeder extends Seeder
{
    /**
     * Registers the built-in form modules as services so the admin can price them.
     * Safe to re-run: it never overwrites a coin cost the admin has already set.
     */
    public function run(): void
    {
        $services = [
            [
                'name' => 'Marriage Certificate',
                'slug' => 'marriage-certificate',
                'description' => 'Fill the marriage certificate form and print it instantly.',
                'icon' => '💍',
                'coin_cost' => 10,
                'kind' => Service::KIND_MODULE,
                'module_key' => 'marriage_form',
                'sort_order' => 1,
            ],
            [
                'name' => 'Birth Certificate',
                'slug' => 'birth-certificate',
                'description' => 'Create and print a birth record.',
                'icon' => '👶',
                'coin_cost' => 10,
                'kind' => Service::KIND_MODULE,
                'module_key' => 'birth_record',
                'sort_order' => 2,
            ],
            [
                'name' => 'Haryana Domicile',
                'slug' => 'haryana-domicile',
                'description' => 'Generate a Haryana domicile certificate.',
                'icon' => '📜',
                'coin_cost' => 10,
                'kind' => Service::KIND_MODULE,
                'module_key' => 'haryana_domicile',
                'sort_order' => 3,
            ],
            [
                'name' => 'PAN Card',
                'slug' => 'pan-card',
                'description' => 'Submit a PAN card application.',
                'icon' => '💳',
                'coin_cost' => 15,
                'kind' => Service::KIND_MODULE,
                'module_key' => 'pan_request',
                'sort_order' => 4,
            ],
            [
                'name' => 'Electricity Bill',
                'slug' => 'electricity-bill',
                'description' => 'View and instantly download your Haryana electricity bill.',
                'icon' => '⚡',
                'coin_cost' => 0,
                'kind' => Service::KIND_MODULE,
                'module_key' => 'electricity_bill',
                'sort_order' => 5,
                'is_active' => true,
                'visibility' => Service::VISIBILITY_PUBLIC,
            ],
            [
                'name' => 'Vehicle Details (RC)',
                'slug' => 'vehicle-details',
                'description' => 'Instantly download complete RC details PDF by entering the vehicle registration number.',
                'icon' => '🚗',
                'coin_cost' => 0,
                'kind' => Service::KIND_MODULE,
                'module_key' => 'vehicle_details',
                'sort_order' => 6,
                'is_active' => true,
                'visibility' => Service::VISIBILITY_PUBLIC,
                'is_premium' => true,
                'unlock_cost' => 999,
            ],
        ];

        foreach ($services as $service) {
            Service::firstOrCreate(['slug' => $service['slug']], $service);
        }
    }
}
