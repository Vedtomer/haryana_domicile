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
            ['page' => 1, 'field_name' => 'district_top', 'x' => 761, 'y' => 310, 'font_size' => 20, 'spacing' => null],
            ['page' => 1, 'field_name' => 'doc_district', 'x' => 979, 'y' => 1649, 'font_size' => 20, 'spacing' => null],
            ['page' => 1, 'field_name' => 'doc_tehsil', 'x' => 532, 'y' => 1645, 'font_size' => 20, 'spacing' => null],
            ['page' => 1, 'field_name' => 'doc_ward', 'x' => 1146, 'y' => 1556, 'font_size' => 20, 'spacing' => null],
            ['page' => 1, 'field_name' => 'doc_village', 'x' => 723, 'y' => 1570, 'font_size' => 20, 'spacing' => null],
            ['page' => 1, 'field_name' => 'doc_father_name', 'x' => 1059, 'y' => 1491, 'font_size' => 20, 'spacing' => null],
            ['page' => 1, 'field_name' => 'doc_applicant_name', 'x' => 474, 'y' => 1485, 'font_size' => 20, 'spacing' => null],
            ['page' => 1, 'field_name' => 'child_name', 'x' => 698, 'y' => 1078, 'font_size' => 20, 'spacing' => null],
            ['page' => 1, 'field_name' => 'caste', 'x' => 1061, 'y' => 1079, 'font_size' => 20, 'spacing' => null],
            ['page' => 1, 'field_name' => 'district', 'x' => 706, 'y' => 853, 'font_size' => 20, 'spacing' => null],
            ['page' => 1, 'field_name' => 'age', 'x' => 1163, 'y' => 779, 'font_size' => 20, 'spacing' => null],
            ['page' => 1, 'field_name' => 'ward_no', 'x' => 997, 'y' => 782, 'font_size' => 20, 'spacing' => null],
            ['page' => 1, 'field_name' => 'village', 'x' => 443, 'y' => 795, 'font_size' => 20, 'spacing' => null],
            ['page' => 1, 'field_name' => 'father_name', 'x' => 987, 'y' => 738, 'font_size' => 20, 'spacing' => null],
            ['page' => 1, 'field_name' => 'name', 'x' => 293, 'y' => 737, 'font_size' => 20, 'spacing' => null],
            ['page' => 1, 'field_name' => 'aadhar_start', 'x' => 417, 'y' => 527, 'font_size' => 20, 'spacing' => 50],
            ['page' => 1, 'field_name' => 'mobile_start', 'x' => 414, 'y' => 461, 'font_size' => 20, 'spacing' => 50],
            ['page' => 1, 'field_name' => 'tehsil_top', 'x' => 378, 'y' => 315, 'font_size' => 20, 'spacing' => null],
            ['page' => 1, 'field_name' => 'tehsil', 'x' => 378, 'y' => 853, 'font_size' => 20, 'spacing' => null],
            ['page' => 2, 'field_name' => 'district', 'x' => 293, 'y' => 603, 'font_size' => 20, 'spacing' => null],
            ['page' => 2, 'field_name' => 'tehsil', 'x' => 1037, 'y' => 539, 'font_size' => 20, 'spacing' => null],
            ['page' => 2, 'field_name' => 'ward_no', 'x' => 777, 'y' => 522, 'font_size' => 20, 'spacing' => null],
            ['page' => 2, 'field_name' => 'village', 'x' => 333, 'y' => 539, 'font_size' => 20, 'spacing' => null],
            ['page' => 2, 'field_name' => 'religion', 'x' => 1090, 'y' => 477, 'font_size' => 20, 'spacing' => null],
            ['page' => 2, 'field_name' => 'caste', 'x' => 783, 'y' => 475, 'font_size' => 20, 'spacing' => null],
            ['page' => 2, 'field_name' => 'age', 'x' => 521, 'y' => 462, 'font_size' => 20, 'spacing' => null],
            ['page' => 2, 'field_name' => 'father_name', 'x' => 1107, 'y' => 417, 'font_size' => 20, 'spacing' => null],
            ['page' => 2, 'field_name' => 'name', 'x' => 342, 'y' => 417, 'font_size' => 20, 'spacing' => null],
            ['page' => 2, 'field_name' => 'ration_card_no', 'x' => 941, 'y' => 826, 'font_size' => 20, 'spacing' => null],
            ['page' => 2, 'field_name' => 'aadhar_2', 'x' => 635, 'y' => 887, 'font_size' => 20, 'spacing' => null],
            ['page' => 2, 'field_name' => 'age_2', 'x' => 321, 'y' => 950, 'font_size' => 20, 'spacing' => null],
            ['page' => 3, 'field_name' => 'name', 'x' => 593, 'y' => 311, 'font_size' => 20, 'spacing' => null],
            ['page' => 3, 'field_name' => 'father_name', 'x' => 1037, 'y' => 315, 'font_size' => 20, 'spacing' => null],
            ['page' => 3, 'field_name' => 'age', 'x' => 169, 'y' => 365, 'font_size' => 20, 'spacing' => null],
            ['page' => 3, 'field_name' => 'village', 'x' => 555, 'y' => 374, 'font_size' => 20, 'spacing' => null],
            ['page' => 3, 'field_name' => 'ward_no', 'x' => 1167, 'y' => 361, 'font_size' => 20, 'spacing' => null],
            ['page' => 3, 'field_name' => 'tehsil', 'x' => 230, 'y' => 438, 'font_size' => 20, 'spacing' => null],
            ['page' => 3, 'field_name' => 'district', 'x' => 634, 'y' => 438, 'font_size' => 20, 'spacing' => null],
            ['page' => 3, 'field_name' => 'child_name', 'x' => 666, 'y' => 498, 'font_size' => 20, 'spacing' => null],
        ];
        
        foreach ($coords as $coord) {
            PdfCoordinate::create($coord);
        }
        
        $this->command->info('PDF coordinates seeded successfully!');
    }
}
