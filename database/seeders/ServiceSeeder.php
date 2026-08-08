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
        ];

        foreach ($services as $service) {
            Service::firstOrCreate(['slug' => $service['slug']], $service);
        }
    }
}
