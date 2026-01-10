<?php

namespace App\Filament\Pages;

use Filament\Pages\Page;

class PdfCoordinates extends Page
{
    protected static ?string $navigationIcon = 'heroicon-o-cog-6-tooth';
    
    protected static ?string $navigationLabel = 'PDF Coordinates';
    
    protected static ?string $title = 'PDF Coordinate Settings';

    protected static bool $shouldRegisterNavigation = false;

    protected static string $view = 'filament.pages.pdf-coordinates';
    
    public $coords = [];
    public $allCoords = [];
    
    public function mount(): void
    {
        // Load all coordinates from database
        $dbCoords = \App\Models\PdfCoordinate::all();
        
        // Organize by pages
        for ($i = 1; $i <= 4; $i++) {
            $this->allCoords["page{$i}"] = [];
        }
        
        foreach ($dbCoords as $coord) {
            $pageKey = "page{$coord->page}";
            $this->allCoords[$pageKey][$coord->field_name] = [
                'x' => $coord->x,
                'y' => $coord->y,
                'fontSize' => $coord->font_size,
                'spacing' => $coord->spacing
            ];
        }
        
        // Default to page 1 for display
        $this->coords = $this->allCoords['page1'] ?? [];
    }
}
