<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\PdfCoordinate;

class PdfCoordinatesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Clear existing coordinates
        PdfCoordinate::truncate();
        
        // Coordinates
        $coords = [
            ['page' => 1, 'field_name' => 'district_top', 'x' => 1256, 'y' => 550, 'font_size' => 50, 'spacing' => null],
            ['page' => 1, 'field_name' => 'null', 'x' => 0, 'y' => 0, 'font_size' => 50, 'spacing' => null],
            ['page' => 1, 'field_name' => 'doc_tehsil', 'x' => 847, 'y' => 2905, 'font_size' => 40, 'spacing' => null],
            ['page' => 1, 'field_name' => 'doc_ward', 'x' => 1956, 'y' => 2729, 'font_size' => 40, 'spacing' => null],
            ['page' => 1, 'field_name' => 'doc_address', 'x' => 943, 'y' => 2764, 'font_size' => 40, 'spacing' => null],
            ['page' => 1, 'field_name' => 'doc_father_name', 'x' => 1793, 'y' => 2631, 'font_size' => 40, 'spacing' => null],
            ['page' => 1, 'field_name' => 'doc_applicant_name', 'x' => 804, 'y' => 2622, 'font_size' => 40, 'spacing' => null],
            ['page' => 1, 'field_name' => 'child_name', 'x' => 1162, 'y' => 1898, 'font_size' => 50, 'spacing' => null],
            ['page' => 1, 'field_name' => 'caste', 'x' => 1061, 'y' => 1079, 'font_size' => 50, 'spacing' => null],
            ['page' => 1, 'field_name' => 'district', 'x' => 1144, 'y' => 1508, 'font_size' => 50, 'spacing' => null],
            ['page' => 1, 'field_name' => 'ward_no', 'x' => 1659, 'y' => 1376, 'font_size' => 50, 'spacing' => null],
            ['page' => 1, 'field_name' => 'doc_district', 'x' => 1650, 'y' => 2912, 'font_size' => 40, 'spacing' => null],
            ['page' => 1, 'field_name' => 'tehsil', 'x' => 557, 'y' => 1503, 'font_size' => 50, 'spacing' => null],
            ['page' => 1, 'field_name' => 'tehsil_top', 'x' => 565, 'y' => 547, 'font_size' => 50, 'spacing' => null],
            ['page' => 1, 'field_name' => 'mobile_start', 'x' => 655, 'y' => 818, 'font_size' => 50, 'spacing' => 90],
            ['page' => 1, 'field_name' => 'name', 'x' => 425, 'y' => 1307, 'font_size' => 50, 'spacing' => null],
            ['page' => 1, 'field_name' => 'age', 'x' => 1933, 'y' => 1369, 'font_size' => 50, 'spacing' => null],
            ['page' => 1, 'field_name' => 'address', 'x' => 532, 'y' => 1414, 'font_size' => 50, 'spacing' => null],
            ['page' => 1, 'field_name' => 'aadhar_start', 'x' => 655, 'y' => 932, 'font_size' => 50, 'spacing' => 90],
            ['page' => 1, 'field_name' => 'father_name', 'x' => 1610, 'y' => 1307, 'font_size' => 50, 'spacing' => null],
            ['page' => 2, 'field_name' => 'ward_no', 'x' => 1286, 'y' => 884, 'font_size' => 50, 'spacing' => null],
            ['page' => 2, 'field_name' => 'tehsil', 'x' => 1720, 'y' => 911, 'font_size' => 50, 'spacing' => null],
            ['page' => 2, 'field_name' => 'address', 'x' => 402, 'y' => 920, 'font_size' => 50, 'spacing' => null],
            ['page' => 2, 'field_name' => 'religion', 'x' => 1795, 'y' => 804, 'font_size' => 50, 'spacing' => null],
            ['page' => 2, 'field_name' => 'caste', 'x' => 1286, 'y' => 804, 'font_size' => 50, 'spacing' => null],
            ['page' => 2, 'field_name' => 'age', 'x' => 789, 'y' => 777, 'font_size' => 50, 'spacing' => null],
            ['page' => 2, 'field_name' => 'father_name', 'x' => 1765, 'y' => 699, 'font_size' => 50, 'spacing' => null],
            ['page' => 2, 'field_name' => 'name', 'x' => 410, 'y' => 699, 'font_size' => 50, 'spacing' => null],
            ['page' => 2, 'field_name' => 'ration_card_no', 'x' => 1593, 'y' => 1423, 'font_size' => 50, 'spacing' => null],
            ['page' => 2, 'field_name' => 'aadhar_2', 'x' => 1014, 'y' => 1530, 'font_size' => 50, 'spacing' => null],
            ['page' => 2, 'field_name' => 'age_2', 'x' => 507, 'y' => 1635, 'font_size' => 50, 'spacing' => null],
            ['page' => 2, 'field_name' => 'district', 'x' => 362, 'y' => 1024, 'font_size' => 50, 'spacing' => null],
            ['page' => 3, 'field_name' => 'name', 'x' => 874, 'y' => 515, 'font_size' => 50, 'spacing' => null],
            ['page' => 3, 'field_name' => 'father_name', 'x' => 1733, 'y' => 517, 'font_size' => 50, 'spacing' => null],
            ['page' => 3, 'field_name' => 'age', 'x' => 235, 'y' => 599, 'font_size' => 50, 'spacing' => null],
            ['page' => 3, 'field_name' => 'address', 'x' => 802, 'y' => 637, 'font_size' => 50, 'spacing' => null],
            ['page' => 3, 'field_name' => 'ward_no', 'x' => 1965, 'y' => 597, 'font_size' => 50, 'spacing' => null],
            ['page' => 3, 'field_name' => 'tehsil', 'x' => 317, 'y' => 737, 'font_size' => 50, 'spacing' => null],
            ['page' => 3, 'field_name' => 'district', 'x' => 976, 'y' => 732, 'font_size' => 50, 'spacing' => null],
            ['page' => 3, 'field_name' => 'child_name', 'x' => 986, 'y' => 839, 'font_size' => 50, 'spacing' => null],
        ];
        
        foreach ($coords as $coord) {
            PdfCoordinate::create($coord);
        }
        
        $this->command->info('PDF coordinates seeded successfully!');
    }
}
