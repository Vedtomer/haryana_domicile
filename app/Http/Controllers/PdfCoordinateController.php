<?php

namespace App\Http\Controllers;

use App\Models\PdfCoordinate;
use Illuminate\Http\Request;

class PdfCoordinateController extends Controller
{
    public function index()
    {
        // Load all coordinates from database
        $dbCoords = PdfCoordinate::all();
        $coords = [];
        
        // Group by page
        foreach ($dbCoords as $coord) {
            $pageKey = 'page' . $coord->page;
            if (!isset($coords[$pageKey])) {
                $coords[$pageKey] = [];
            }
            
            $coords[$pageKey][$coord->field_name] = [
                'x' => $coord->x,
                'y' => $coord->y,
                'fontSize' => $coord->font_size,
                'spacing' => $coord->spacing
            ];
        }
        
        // Ensure all pages exist
        for ($i = 1; $i <= 4; $i++) {
            if (!isset($coords["page$i"])) {
                $coords["page$i"] = [];
            }
        }
        
        return view('pdf-coordinates', ['allCoords' => $coords]);
    }

    public function save(Request $request)
    {
        $data = $request->all();
        
        // If data has page structure
        if (isset($data['page1']) || isset($data['page2']) || isset($data['page3']) || isset($data['page4'])) {
            foreach ($data as $pageKey => $fields) {
                if (!str_starts_with($pageKey, 'page')) continue;
                
                $pageNum = (int) str_replace('page', '', $pageKey);
                
                foreach ($fields as $fieldName => $coords) {
                    PdfCoordinate::updateOrCreate(
                        [
                            'page' => $pageNum,
                            'field_name' => $fieldName
                        ],
                        [
                            'x' => $coords['x'] ?? 0,
                            'y' => $coords['y'] ?? 0,
                            'font_size' => $coords['fontSize'] ?? 20,
                            'spacing' => $coords['spacing'] ?? null
                        ]
                    );
                }
            }
        }
        
        // Update the seeder file
        $this->updateSeederFile();
        
        return response()->json(['success' => true]);
    }

    private function updateSeederFile()
    {
        $coords = PdfCoordinate::orderBy('page')->get();
        
        $content = "<?php

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
        \$coords = [\n";

        foreach ($coords as $c) {
            $spacing = $c->spacing === null ? 'null' : $c->spacing;
            $content .= "            ['page' => {$c->page}, 'field_name' => '{$c->field_name}', 'x' => {$c->x}, 'y' => {$c->y}, 'font_size' => {$c->font_size}, 'spacing' => {$spacing}],\n";
        }

        $content .= "        ];
        
        foreach (\$coords as \$coord) {
            PdfCoordinate::create(\$coord);
        }
        
        \$this->command->info('PDF coordinates seeded successfully!');
    }
}
";
        
        file_put_contents(database_path('seeders/PdfCoordinatesSeeder.php'), $content);
    }
}
