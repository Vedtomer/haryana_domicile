<?php

namespace App\Filament\Pages;

use Filament\Pages\Page;

class PdfCoordinates extends Page
{
    protected static ?string $navigationIcon = 'heroicon-o-cog-6-tooth';
    
    protected static ?string $navigationLabel = 'PDF Coordinates';
    
    protected static ?string $title = 'PDF Coordinate Settings';

    protected static string $view = 'filament.pages.pdf-coordinates';
    
    public $coords = [];
    public $allPages = [];
    
    public function mount(): void
    {
        $configPath = config_path('pdf_coordinates.json');
        
        if (file_exists($configPath)) {
            $config = json_decode(file_get_contents($configPath), true);
            
            // Load all pages
            for ($i = 1; $i <= 4; $i++) {
                $this->allPages["page{$i}"] = $config["page{$i}"] ?? [];
            }
            
            // Default to page 1 for display
            $this->coords = $this->allPages['page1'] ?? [];
        }
    }
}
