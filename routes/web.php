<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;

Route::get('/', function () {
    return redirect('/admin');
});

use App\Http\Controllers\HaryanaDomicileController;

Route::get('/haryana-domicile/print/{id}', [HaryanaDomicileController::class, 'print'])->name('haryana-domicile.print');

// PDF Coordinate Settings
Route::get('/pdf-coordinates', function () {
    $configPath = config_path('pdf_coordinates.json');
    $coords = [];
    
    if (file_exists($configPath)) {
        $config = json_decode(file_get_contents($configPath), true);
        $coords = $config['page1'] ?? [];
    }
    
    return view('pdf-coordinates', ['coords' => $coords]);
})->name('pdf.coordinates');

Route::post('/api/save-coordinates', function (Request $request) {
    $data = $request->all();
    
    // If data already has page structure, use it directly
    if (isset($data['page1']) || isset($data['page2']) || isset($data['page3']) || isset($data['page4'])) {
        $config = $data;
    } else {
        // Legacy format - convert to page structure
        $config = ['page1' => []];
        
        foreach ($data as $key => $value) {
            $parts = explode('_', $key);
            if (count($parts) >= 2) {
                $fieldName = implode('_', array_slice($parts, 0, -1));
                $property = end($parts);
                
                if (!isset($config['page1'][$fieldName])) {
                    $config['page1'][$fieldName] = [];
                }
                $config['page1'][$fieldName][$property] = (int)$value;
            }
        }
    }
    
    file_put_contents(config_path('pdf_coordinates.json'), json_encode($config, JSON_PRETTY_PRINT));
    
    return response()->json(['success' => true]);
});
