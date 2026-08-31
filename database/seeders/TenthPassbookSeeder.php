<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class TenthPassbookSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        \App\Models\Service::updateOrCreate(
            ['module_key' => 'tenth_passbook'],
            [
                'name' => '10th Passbook Editor',
                'slug' => 'tenth-passbook',
                'description' => 'Generate and edit 10th marksheet/passbook with your photo.',
                'coin_cost' => 15,
                'is_active' => true,
                'kind' => 'module',
                'visibility' => 'public',
            ]
        );
    }
}
