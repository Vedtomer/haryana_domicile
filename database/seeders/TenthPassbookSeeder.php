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
        \App\Models\Service::where('module_key', 'tenth_passbook')
            ->orWhere('slug', 'tenth-passbook')
            ->delete();
    }
}
