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
            ['page' => 1, 'field_name' => 'district_top', 'x' => 1255, 'y' => 563, 'font_size' => 50, 'spacing' => null],
            ['page' => 1, 'field_name' => 'null', 'x' => 0, 'y' => 0, 'font_size' => 50, 'spacing' => null],
            ['page' => 1, 'field_name' => 'doc_tehsil', 'x' => 851, 'y' => 2870, 'font_size' => 50, 'spacing' => null],
            ['page' => 1, 'field_name' => 'doc_ward', 'x' => 1947, 'y' => 2712, 'font_size' => 50, 'spacing' => null],
            ['page' => 1, 'field_name' => 'doc_address', 'x' => 965, 'y' => 2727, 'font_size' => 50, 'spacing' => null],
            ['page' => 1, 'field_name' => 'doc_father_name', 'x' => 1816, 'y' => 2593, 'font_size' => 50, 'spacing' => null],
            ['page' => 1, 'field_name' => 'doc_applicant_name', 'x' => 798, 'y' => 2593, 'font_size' => 50, 'spacing' => null],
            ['page' => 1, 'field_name' => 'child_name', 'x' => 1162, 'y' => 1898, 'font_size' => 50, 'spacing' => null],
            ['page' => 1, 'field_name' => 'caste', 'x' => 1061, 'y' => 1079, 'font_size' => 50, 'spacing' => null],
            ['page' => 1, 'field_name' => 'district', 'x' => 1144, 'y' => 1492, 'font_size' => 50, 'spacing' => null],
            ['page' => 1, 'field_name' => 'ward_no', 'x' => 1659, 'y' => 1376, 'font_size' => 50, 'spacing' => null],
            ['page' => 1, 'field_name' => 'doc_district', 'x' => 1644, 'y' => 2870, 'font_size' => 50, 'spacing' => null],
            ['page' => 1, 'field_name' => 'tehsil', 'x' => 559, 'y' => 1488, 'font_size' => 50, 'spacing' => null],
            ['page' => 1, 'field_name' => 'tehsil_top', 'x' => 537, 'y' => 566, 'font_size' => 50, 'spacing' => null],
            ['page' => 1, 'field_name' => 'mobile_start', 'x' => 655, 'y' => 818, 'font_size' => 50, 'spacing' => 90],
            ['page' => 1, 'field_name' => 'name', 'x' => 436, 'y' => 1284, 'font_size' => 50, 'spacing' => null],
            ['page' => 1, 'field_name' => 'age', 'x' => 1933, 'y' => 1369, 'font_size' => 50, 'spacing' => null],
            ['page' => 1, 'field_name' => 'address', 'x' => 569, 'y' => 1387, 'font_size' => 50, 'spacing' => null],
            ['page' => 1, 'field_name' => 'aadhar_start', 'x' => 655, 'y' => 932, 'font_size' => 50, 'spacing' => 90],
            ['page' => 1, 'field_name' => 'father_name', 'x' => 1648, 'y' => 1291, 'font_size' => 50, 'spacing' => null],
            ['page' => 2, 'field_name' => 'ward_no', 'x' => 760, 'y' => 350, 'font_size' => 50, 'spacing' => null],
            ['page' => 2, 'field_name' => 'tehsil', 'x' => 998, 'y' => 350, 'font_size' => 50, 'spacing' => null],
            ['page' => 2, 'field_name' => 'address', 'x' => 248, 'y' => 350, 'font_size' => 50, 'spacing' => null],
            ['page' => 2, 'field_name' => 'religion', 'x' => 1051, 'y' => 300, 'font_size' => 50, 'spacing' => null],
            ['page' => 2, 'field_name' => 'caste', 'x' => 745, 'y' => 300, 'font_size' => 50, 'spacing' => null],
            ['page' => 2, 'field_name' => 'age', 'x' => 495, 'y' => 300, 'font_size' => 50, 'spacing' => null],
            ['page' => 2, 'field_name' => 'father_name', 'x' => 1044, 'y' => 250, 'font_size' => 50, 'spacing' => null],
            ['page' => 2, 'field_name' => 'name', 'x' => 283, 'y' => 250, 'font_size' => 50, 'spacing' => null],
            ['page' => 2, 'field_name' => 'ration_card_no', 'x' => 873, 'y' => 450, 'font_size' => 50, 'spacing' => null],
            ['page' => 2, 'field_name' => 'aadhar_2', 'x' => 595, 'y' => 500, 'font_size' => 50, 'spacing' => null],
            ['page' => 2, 'field_name' => 'age_2', 'x' => 298, 'y' => 550, 'font_size' => 50, 'spacing' => null],
            ['page' => 2, 'field_name' => 'district', 'x' => 211, 'y' => 400, 'font_size' => 50, 'spacing' => null],
            ['page' => 3, 'field_name' => 'name', 'x' => 524, 'y' => 250, 'font_size' => 50, 'spacing' => null],
            ['page' => 3, 'field_name' => 'father_name', 'x' => 1020, 'y' => 250, 'font_size' => 50, 'spacing' => null],
            ['page' => 3, 'field_name' => 'age', 'x' => 170, 'y' => 300, 'font_size' => 50, 'spacing' => null],
            ['page' => 3, 'field_name' => 'address', 'x' => 489, 'y' => 300, 'font_size' => 50, 'spacing' => null],
            ['page' => 3, 'field_name' => 'ward_no', 'x' => 1131, 'y' => 300, 'font_size' => 50, 'spacing' => null],
            ['page' => 3, 'field_name' => 'tehsil', 'x' => 213, 'y' => 350, 'font_size' => 50, 'spacing' => null],
            ['page' => 3, 'field_name' => 'district', 'x' => 571, 'y' => 350, 'font_size' => 50, 'spacing' => null],
            ['page' => 3, 'field_name' => 'child_name', 'x' => 593, 'y' => 400, 'font_size' => 50, 'spacing' => null],
        ];
        
        foreach ($coords as $coord) {
            PdfCoordinate::create($coord);
        }
        
        $this->command->info('PDF coordinates seeded successfully!');
    }
}
