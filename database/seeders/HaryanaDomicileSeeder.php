<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class HaryanaDomicileSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Clear existing data to avoid duplicates if needed, or just insert
        // DB::table('haryana_domiciles')->truncate(); // Optional: decided not to truncate to be safe, or maybe I should? User said "create eska bhe", usually implies fresh data or adding to it. Let's just use insertOrIgnore or standard insert. Given it has IDs, I'll use insert.

        $data = [
            [
                'id' => 4,
                'tehsil' => 'Panipat',
                'district' => 'Panipat',
                'name' => 'Neelam',
                'father_name' => 'W/o Surender',
                'village' => 'Vikas Nagar',
                'ward_no' => '12',
                'age' => 34,
                'mobile' => '8816078444',
                'aadhar' => '910016173515',
                'caste' => 'Dhakot',
                'religion' => 'Hindu',
                'ration_card_no' => '066006592763',
                'child_name' => 'Neelam',
                'created_at' => '2026-01-13 11:06:22',
                'updated_at' => '2026-01-13 11:06:22',
            ],
            [
                'id' => 5,
                'tehsil' => 'Panipat',
                'district' => 'Panipat',
                'name' => 'Santosh',
                'father_name' => 'W/o Krishan',
                'village' => 'Bharat Nagar',
                'ward_no' => '12',
                'age' => 46,
                'mobile' => '8168425239',
                'aadhar' => '384867816262',
                'caste' => 'Hindu',
                'religion' => 'Hindu',
                'ration_card_no' => '9ESV7989',
                'child_name' => 'Santosh',
                'created_at' => '2026-01-13 11:23:18',
                'updated_at' => '2026-01-13 11:23:18',
            ],
            [
                'id' => 6,
                'tehsil' => 'Panipat',
                'district' => 'Panipat',
                'name' => 'Farid',
                'father_name' => 'S/o Fakrudin',
                'village' => '40, Hali Colony',
                'ward_no' => '12',
                'age' => 28,
                'mobile' => '9050990876',
                'aadhar' => '254137978015',
                'caste' => 'Ansari',
                'religion' => 'Muslim',
                'ration_card_no' => '066009494262',
                'child_name' => 'Farid',
                'created_at' => '2026-01-13 11:24:44',
                'updated_at' => '2026-01-13 11:24:44',
            ],
            [
                'id' => 7,
                'tehsil' => 'Panipat',
                'district' => 'Panipat',
                'name' => 'Surender Kumar',
                'father_name' => 'S/o Subhash',
                'village' => '1195 Vikas nagar',
                'ward_no' => '12',
                'age' => 38,
                'mobile' => '8816078444',
                'aadhar' => '883287294276',
                'caste' => 'Dakot',
                'religion' => 'Hindu',
                'ration_card_no' => '066006592763',
                'child_name' => 'Surender Kumar',
                'created_at' => '2026-01-13 11:26:53',
                'updated_at' => '2026-01-13 11:26:53',
            ],
            [
                'id' => 8,
                'tehsil' => 'Panipat',
                'district' => 'Panipat',
                'name' => 'Ved Prakash',
                'father_name' => 'S/o Satpal',
                'village' => '293/6 Quila Near police chowky',
                'ward_no' => '10',
                'age' => 33,
                'mobile' => '9802244899',
                'aadhar' => '770166559303',
                'caste' => 'kabiri',
                'religion' => 'Hindu',
                'ration_card_no' => '2576898',
                'child_name' => NULL,
                'created_at' => '2026-01-17 10:56:34',
                'updated_at' => '2026-01-17 10:56:34',
            ],
        ];

        foreach ($data as $item) {
            DB::table('haryana_domiciles')->updateOrInsert(
                ['id' => $item['id']],
                $item
            );
        }
    }
}
