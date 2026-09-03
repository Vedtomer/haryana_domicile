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
                'visibility' => Service::VISIBILITY_PRIVATE,
            ],
            [
                'name' => 'Vehicle Details (RC)',
                'slug' => 'vehicle-details',
                'description' => 'Instantly download complete RC details PDF by entering the vehicle registration number.',
                'icon' => '🚗',
                'coin_cost' => 20,
                'kind' => Service::KIND_MODULE,
                'module_key' => 'vehicle_details',
                'sort_order' => 6,
                'is_active' => true,
                'visibility' => Service::VISIBILITY_PRIVATE,
                'is_premium' => false,
                'unlock_cost' => 0,
            ],
            [
                'name' => 'Aadhar Update Form',
                'slug' => 'aadhar-update',
                'description' => 'Generate printable Aadhar update form filled with handwriting font.',
                'icon' => '📝',
                'coin_cost' => 20,
                'kind' => Service::KIND_MODULE,
                'module_key' => 'aadhar_update',
                'sort_order' => 7,
                'is_active' => true,
                'visibility' => Service::VISIBILITY_PRIVATE,
                'is_premium' => false,
                'unlock_cost' => 0,
            ],
            [
                'name' => 'Passport Photo Maker',
                'slug' => 'passport-maker',
                'description' => 'Create passport size photos with AI background removal and print-ready layouts.',
                'icon' => 'fas fa-id-badge',
                'coin_cost' => 20,
                'kind' => Service::KIND_MODULE,
                'module_key' => 'passport_maker',
                'sort_order' => 8,
                'is_active' => true,
                'visibility' => Service::VISIBILITY_PRIVATE,
                'is_premium' => false,
                'unlock_cost' => 0,
            ],
            [
                'name' => 'Aadhar To Pan Unmasked Instant',
                'slug' => 'aadhar-to-pan',
                'description' => 'Instantly find the unmasked PAN number linked to an Aadhaar number.',
                'icon' => '🔍',
                'coin_cost' => 69,
                'kind' => Service::KIND_MODULE,
                'module_key' => 'aadhar_to_pan',
                'sort_order' => 9,
                'is_active' => true,
                'visibility' => Service::VISIBILITY_PRIVATE,
                'is_premium' => false,
                'unlock_cost' => 0,
            ],
            [
                'name' => 'Saral Certificate Status',
                'slug' => 'saral-status',
                'description' => 'Check the status of any Saral Certificate using its reference number instantly.',
                'icon' => '📃',
                'coin_cost' => 0,
                'kind' => Service::KIND_MODULE,
                'module_key' => 'saral_status',
                'sort_order' => 10,
                'is_active' => true,
                'visibility' => Service::VISIBILITY_PRIVATE,
                'is_premium' => false,
                'unlock_cost' => 0,
            ],
        ];

        foreach ($services as $service) {
            $existing = Service::where('slug', $service['slug'])->first();
            if (!$existing) {
                Service::create($service);
            } else {
                // Update new fields without overwriting user-configured coin_cost/is_active
                $existing->update([
                    'is_premium' => $service['is_premium'] ?? false,
                    'unlock_cost' => $service['unlock_cost'] ?? 0,
                    'icon' => $service['icon'],
                    'description' => $service['description'],
                    'sort_order' => $service['sort_order'],
                ]);
            }
        }

        // Clean up old Telegram services that are no longer used
        $oldSlugs = [
            'telegram-num',
            'telegram-aadhar',
            'telegram-familyinfo',
            'telegram-pan',
            'telegram-ration',
            'mobile-to-details' // the old one
        ];
        Service::whereIn('slug', $oldSlugs)->delete();
    }
}
