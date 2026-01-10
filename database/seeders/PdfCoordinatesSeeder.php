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
            ['page' => 1, 'field_name' => 'district_top', 'x' => 1061, 'y' => 217, 'font_size' => 20, 'spacing' => null],
            ['page' => 1, 'field_name' => 'doc_district', 'x' => 979, 'y' => 1649, 'font_size' => 20, 'spacing' => null],
            ['page' => 1, 'field_name' => 'doc_tehsil', 'x' => 532, 'y' => 1645, 'font_size' => 20, 'spacing' => null],
            ['page' => 1, 'field_name' => 'doc_ward', 'x' => 1146, 'y' => 1556, 'font_size' => 20, 'spacing' => null],
            ['page' => 1, 'field_name' => 'doc_village', 'x' => 569, 'y' => 1556, 'font_size' => 20, 'spacing' => null],
            ['page' => 1, 'field_name' => 'doc_father_name', 'x' => 1059, 'y' => 1491, 'font_size' => 20, 'spacing' => null],
            ['page' => 1, 'field_name' => 'doc_applicant_name', 'x' => 474, 'y' => 1485, 'font_size' => 20, 'spacing' => null],
            ['page' => 1, 'field_name' => 'child_name', 'x' => 420, 'y' => 545, 'font_size' => 20, 'spacing' => null],
            ['page' => 1, 'field_name' => 'caste', 'x' => 1061, 'y' => 1079, 'font_size' => 20, 'spacing' => null],
            ['page' => 1, 'field_name' => 'district', 'x' => 420, 'y' => 545, 'font_size' => 20, 'spacing' => null],
            ['page' => 1, 'field_name' => 'age', 'x' => 420, 'y' => 496, 'font_size' => 20, 'spacing' => null],
            ['page' => 1, 'field_name' => 'ward_no', 'x' => 1061, 'y' => 463, 'font_size' => 20, 'spacing' => null],
            ['page' => 1, 'field_name' => 'village', 'x' => 420, 'y' => 463, 'font_size' => 20, 'spacing' => null],
            ['page' => 1, 'field_name' => 'father_name', 'x' => 1061, 'y' => 415, 'font_size' => 20, 'spacing' => null],
            ['page' => 1, 'field_name' => 'name', 'x' => 420, 'y' => 415, 'font_size' => 20, 'spacing' => null],
            ['page' => 1, 'field_name' => 'aadhar_start', 'x' => 262, 'y' => 364, 'font_size' => 20, 'spacing' => 35],
            ['page' => 1, 'field_name' => 'mobile_start', 'x' => 262, 'y' => 315, 'font_size' => 20, 'spacing' => 35],
            ['page' => 1, 'field_name' => 'tehsil_top', 'x' => 1061, 'y' => 168, 'font_size' => 20, 'spacing' => null],
            ['page' => 1, 'field_name' => 'tehsil', 'x' => 1061, 'y' => 496, 'font_size' => 20, 'spacing' => null],
            ['page' => 2, 'field_name' => 'district', 'x' => 224, 'y' => 400, 'font_size' => 20, 'spacing' => null],
            ['page' => 2, 'field_name' => 'tehsil', 'x' => 1005, 'y' => 350, 'font_size' => 20, 'spacing' => null],
            ['page' => 2, 'field_name' => 'ward_no', 'x' => 756, 'y' => 350, 'font_size' => 20, 'spacing' => null],
            ['page' => 2, 'field_name' => 'village', 'x' => 265, 'y' => 350, 'font_size' => 20, 'spacing' => null],
            ['page' => 2, 'field_name' => 'religion', 'x' => 1064, 'y' => 300, 'font_size' => 20, 'spacing' => null],
            ['page' => 2, 'field_name' => 'caste', 'x' => 766, 'y' => 300, 'font_size' => 20, 'spacing' => null],
            ['page' => 2, 'field_name' => 'age', 'x' => 500, 'y' => 300, 'font_size' => 20, 'spacing' => null],
            ['page' => 2, 'field_name' => 'father_name', 'x' => 1038, 'y' => 250, 'font_size' => 20, 'spacing' => null],
            ['page' => 2, 'field_name' => 'name', 'x' => 276, 'y' => 250, 'font_size' => 20, 'spacing' => null],
            ['page' => 2, 'field_name' => 'ration_card_no', 'x' => 900, 'y' => 450, 'font_size' => 20, 'spacing' => null],
            ['page' => 2, 'field_name' => 'aadhar_2', 'x' => 500, 'y' => 500, 'font_size' => 20, 'spacing' => null],
            ['page' => 2, 'field_name' => 'age_2', 'x' => 400, 'y' => 550, 'font_size' => 20, 'spacing' => null],
            
            // Page 3 coordinates
            ['page' => 3, 'field_name' => 'name', 'x' => 450, 'y' => 250, 'font_size' => 20, 'spacing' => null],
            ['page' => 3, 'field_name' => 'father_name', 'x' => 750, 'y' => 250, 'font_size' => 20, 'spacing' => null],
            ['page' => 3, 'field_name' => 'age', 'x' => 150, 'y' => 300, 'font_size' => 20, 'spacing' => null],
            ['page' => 3, 'field_name' => 'village', 'x' => 400, 'y' => 300, 'font_size' => 20, 'spacing' => null],
            ['page' => 3, 'field_name' => 'ward_no', 'x' => 850, 'y' => 300, 'font_size' => 20, 'spacing' => null],
            ['page' => 3, 'field_name' => 'tehsil', 'x' => 200, 'y' => 350, 'font_size' => 20, 'spacing' => null],
            ['page' => 3, 'field_name' => 'district', 'x' => 450, 'y' => 350, 'font_size' => 20, 'spacing' => null],
            ['page' => 3, 'field_name' => 'child_name', 'x' => 500, 'y' => 400, 'font_size' => 20, 'spacing' => null],
        ];
        
        foreach ($coords as $coord) {
            PdfCoordinate::create($coord);
        }
        
        $this->command->info('PDF coordinates seeded successfully!');
    }
}
