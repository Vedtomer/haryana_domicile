<?php

namespace App\Filament\Resources\HaryanaDomicileResource\Pages;

use App\Filament\Resources\HaryanaDomicileResource;
use Filament\Resources\Pages\Page;
use App\Models\HaryanaDomicile;
use Filament\Resources\Pages\Concerns\InteractsWithRecord;
use Filament\Actions\Action;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Log;

class PrintHaryanaDomicile extends Page
{
    use InteractsWithRecord;

    protected static string $resource = HaryanaDomicileResource::class;

    protected static string $view = 'filament.resources.haryana-domicile-resource.pages.print-haryana-domicile';

    protected static ?string $title = 'Print Haryana Domicile';
    
    // Hide the navigation from the sidebar (it's accessed via action)
    protected static bool $shouldRegisterNavigation = false;

    public function mount(int | string $record): void
    {
        $this->record = $this->resolveRecord($record);
        
        // Automatically generate and redirect to PDF
        $pdfUrl = $this->generatePdfAndGetUrl();
        redirect($pdfUrl);
    }

    protected function getHeaderActions(): array
    {
        return [
            Action::make('downloadPdf')
                ->label('Download PDF')
                ->icon('heroicon-o-arrow-down-tray')
                ->color('success')
                ->url(fn () => $this->generatePdfAndGetUrl())
                ->openUrlInNewTab(),
        ];
    }

    public function generatePdfAndGetUrl()
    {
        $record = $this->record;
        $filledImages = [];
        
        // Font settings
        $fontPath = public_path('fonts/Typist.ttf');
        $defaultFontSize = 50;
        $boxFontSize = 50;
        
        // Process each page (1.jpg through 4.jpg)
        for ($page = 1; $page <= 4; $page++) {
            $imagePath = public_path("FILE/{$page}.jpg");
            
            if (!file_exists($imagePath)) continue;
            
            // Load image
            $image = imagecreatefromjpeg($imagePath);
            $black = imagecolorallocate($image, 0, 0, 0);
            
            // Load coordinates from database
            $dbCoords = \App\Models\PdfCoordinate::where('page', $page)->get();
            $coords = [];
            foreach ($dbCoords as $coord) {
                $coords[$coord->field_name] = [
                    'x' => $coord->x,
                    'y' => $coord->y,
                    'fontSize' => 40,
                    'spacing' => 90
                ];
            }
            Log::info("PDF Gen Page $page: coords loaded", ['count' => count($coords), 'tehsil_top' => $coords['tehsil_top'] ?? 'MISSING']);
            // Fill data based on page
            if ($page == 1) {
                // Tehsil and District at top
                $c = $coords['tehsil_top'] ?? ['x' => 320, 'y' => 145, 'fontSize' => $defaultFontSize];
                imagettftext($image, $c['fontSize'], 0, $c['x'], $c['y'], $black, $fontPath, $record->tehsil);
                
                $c = $coords['district_top'] ?? ['x' => 550, 'y' => 145, 'fontSize' => $defaultFontSize];
                imagettftext($image, $c['fontSize'], 0, $c['x'], $c['y'], $black, $fontPath, $record->district);
                
                // Mobile number boxes
                $c = $coords['mobile_start'] ?? ['x' => 190, 'y' => 218, 'fontSize' => $boxFontSize, 'spacing' => 90];
                Log::info('Mobile coords:', ['data' => $c]);
                $spacing = $c['spacing'] ?? 90;
                $this->fillNumberBoxesOnImage($image, $c['x'], $c['y'], $record->mobile, 10, $fontPath, $c['fontSize'], $black, $spacing);
                
                // Aadhar number boxes
                $c = $coords['aadhar_start'] ?? ['x' => 190, 'y' => 258, 'fontSize' => $boxFontSize, 'spacing' => 90];
                $spacing = $c['spacing'] ?? 90;
                $this->fillNumberBoxesOnImage($image, $c['x'], $c['y'], $record->aadhar, 12, $fontPath, $c['fontSize'], $black, $spacing);
                
                // Name
                $c = $coords['name'] ?? ['x' => 80, 'y' => 365, 'fontSize' => $defaultFontSize];
                imagettftext($image, $c['fontSize'], 0, $c['x'], $c['y'], $black, $fontPath, $record->name);
                
                // Father name
                $c = $coords['father_name'] ?? ['x' => 600, 'y' => 365, 'fontSize' => $defaultFontSize];
                imagettftext($image, $c['fontSize'], 0, $c['x'], $c['y'], $black, $fontPath, $record->father_name);
                
                // Address (Village column)
                $c = $coords['address'] ?? ['x' => 120, 'y' => 400, 'fontSize' => $defaultFontSize];
                imagettftext($image, $c['fontSize'], 0, $c['x'], $c['y'], $black, $fontPath, $record->village);
                
                // Ward no
                $c = $coords['ward_no'] ?? ['x' => 520, 'y' => 400, 'fontSize' => $defaultFontSize];
                imagettftext($image, $c['fontSize'], 0, $c['x'], $c['y'], $black, $fontPath, $record->ward_no ?? '');
                
                // Age
                $c = $coords['age'] ?? ['x' => 680, 'y' => 400, 'fontSize' => $defaultFontSize];
                imagettftext($image, $c['fontSize'], 0, $c['x'], $c['y'], $black, $fontPath, $record->age);
                
                // Tehsil
                $c = $coords['tehsil'] ?? ['x' => 280, 'y' => 435, 'fontSize' => $defaultFontSize];
                imagettftext($image, $c['fontSize'], 0, $c['x'], $c['y'], $black, $fontPath, $record->tehsil);
                
                // District
                $c = $coords['district'] ?? ['x' => 550, 'y' => 435, 'fontSize' => $defaultFontSize];
                imagettftext($image, $c['fontSize'], 0, $c['x'], $c['y'], $black, $fontPath, $record->district);
                
                // Child name
                $c = $coords['child_name'] ?? ['x' => 420, 'y' => 545, 'fontSize' => $defaultFontSize];
                imagettftext($image, $c['fontSize'], 0, $c['x'], $c['y'], $black, $fontPath, $record->child_name ?? '');
                
                // Document box fields
                // Line 1 - Applicant Name (मैं .........)
                $c = $coords['doc_applicant_name'] ?? ['x' => 230, 'y' => 1050, 'fontSize' => $boxFontSize];
                Log::info('Doc Applicant Name coords:', ['data' => $c]);
                imagettftext($image, $c['fontSize'], 0, $c['x'], $c['y'], $black, $fontPath, $record->name);
                
                // Line 1 - Father Name (सुपुत्र/सुपुत्री/धर्मपत्नी श्री .........)
                $c = $coords['doc_father_name'] ?? ['x' => 550, 'y' => 1050, 'fontSize' => $boxFontSize];
                imagettftext($image, $c['fontSize'], 0, $c['x'], $c['y'], $black, $fontPath, $record->father_name);
                
                // Line 2 - Address (गांव/मोहल्ला .........)
                $c = $coords['doc_address'] ?? ['x' => 230, 'y' => 1080, 'fontSize' => $boxFontSize];
                imagettftext($image, $c['fontSize'], 0, $c['x'], $c['y'], $black, $fontPath, $record->village);
                
                // Line 2 - Ward Number (वार्ड नं. .........)
                $c = $coords['doc_ward'] ?? ['x' => 750, 'y' => 1080, 'fontSize' => $boxFontSize];
                imagettftext($image, $c['fontSize'], 0, $c['x'], $c['y'], $black, $fontPath, $record->ward_no);
                
                // Line 3 - Tehsil (तहसील .........)
                $c = $coords['doc_tehsil'] ?? ['x' => 230, 'y' => 1110, 'fontSize' => $boxFontSize];
                imagettftext($image, $c['fontSize'], 0, $c['x'], $c['y'], $black, $fontPath, $record->tehsil);
                
                // Line 3 - District (जिला .........)
                $c = $coords['doc_district'] ?? ['x' => 550, 'y' => 1110, 'fontSize' => $boxFontSize];
                imagettftext($image, $c['fontSize'], 0, $c['x'], $c['y'], $black, $fontPath, $record->district);
            }
            
            // Fill data for Page 2
            if ($page == 2) {
                // Name (First Name)
                $c = $coords['name'] ?? ['x' => 300, 'y' => 250, 'fontSize' => $defaultFontSize];
                imagettftext($image, $c['fontSize'], 0, $c['x'], $c['y'], $black, $fontPath, $record->name);
                
                // Relation Name (Father Name)
                $c = $coords['father_name'] ?? ['x' => 800, 'y' => 250, 'fontSize' => $defaultFontSize];
                imagettftext($image, $c['fontSize'], 0, $c['x'], $c['y'], $black, $fontPath, $record->father_name);
                
                // Age
                $c = $coords['age'] ?? ['x' => 380, 'y' => 300, 'fontSize' => $defaultFontSize];
                imagettftext($image, $c['fontSize'], 0, $c['x'], $c['y'], $black, $fontPath, $record->age);
                
                // Caste
                $c = $coords['caste'] ?? ['x' => 600, 'y' => 300, 'fontSize' => $defaultFontSize];
                imagettftext($image, $c['fontSize'], 0, $c['x'], $c['y'], $black, $fontPath, $record->caste);
                
                // Religion
                $c = $coords['religion'] ?? ['x' => 900, 'y' => 300, 'fontSize' => $defaultFontSize];
                imagettftext($image, $c['fontSize'], 0, $c['x'], $c['y'], $black, $fontPath, $record->religion ?? '');
                
                // Address (Village)
                $c = $coords['address'] ?? ['x' => 350, 'y' => 350, 'fontSize' => $defaultFontSize];
                Log::info("Page 2 Address", ['coords' => $c, 'value' => $record->village]);
                imagettftext($image, $c['fontSize'], 0, $c['x'], $c['y'], $black, $fontPath, $record->village);
                
                // Ward
                $c = $coords['ward_no'] ?? ['x' => 680, 'y' => 350, 'fontSize' => $defaultFontSize];
                imagettftext($image, $c['fontSize'], 0, $c['x'], $c['y'], $black, $fontPath, $record->ward_no ?? '');
                
                // Tehsil
                $c = $coords['tehsil'] ?? ['x' => 950, 'y' => 350, 'fontSize' => $defaultFontSize];
                imagettftext($image, $c['fontSize'], 0, $c['x'], $c['y'], $black, $fontPath, $record->tehsil);
                
                // District
                $c = $coords['district'] ?? ['x' => 350, 'y' => 400, 'fontSize' => $defaultFontSize];
                imagettftext($image, $c['fontSize'], 0, $c['x'], $c['y'], $black, $fontPath, $record->district);
                
                // Ration Card No
                $c = $coords['ration_card_no'] ?? ['x' => 900, 'y' => 450, 'fontSize' => $defaultFontSize];
                imagettftext($image, $c['fontSize'], 0, $c['x'], $c['y'], $black, $fontPath, $record->ration_card_no ?? '');
                
                // Aadhar (Page 2)
                $c = $coords['aadhar_2'] ?? ['x' => 500, 'y' => 500, 'fontSize' => $defaultFontSize];
                imagettftext($image, $c['fontSize'], 0, $c['x'], $c['y'], $black, $fontPath, $record->aadhar);
                
                // Age (Page 2 - Second mention)
                $c = $coords['age_2'] ?? ['x' => 400, 'y' => 550, 'fontSize' => $defaultFontSize];
                imagettftext($image, $c['fontSize'], 0, $c['x'], $c['y'], $black, $fontPath, $record->age);
            }
            
            // Fill data for Page 3
            if ($page == 3) {
                // Name
                $c = $coords['name'] ?? ['x' => 450, 'y' => 250, 'fontSize' => $defaultFontSize];
                imagettftext($image, $c['fontSize'], 0, $c['x'], $c['y'], $black, $fontPath, $record->name);
                
                // Relation Name (Father Name)
                $c = $coords['father_name'] ?? ['x' => 750, 'y' => 250, 'fontSize' => $defaultFontSize];
                imagettftext($image, $c['fontSize'], 0, $c['x'], $c['y'], $black, $fontPath, $record->father_name);
                
                // Age
                $c = $coords['age'] ?? ['x' => 150, 'y' => 300, 'fontSize' => $defaultFontSize];
                imagettftext($image, $c['fontSize'], 0, $c['x'], $c['y'], $black, $fontPath, $record->age);
                
                // Address (Village)
                $c = $coords['address'] ?? ['x' => 400, 'y' => 300, 'fontSize' => $defaultFontSize];
                Log::info("Page 3 Address", ['coords' => $c, 'value' => $record->village]);
                imagettftext($image, $c['fontSize'], 0, $c['x'], $c['y'], $black, $fontPath, $record->village);
                
                // Ward
                $c = $coords['ward_no'] ?? ['x' => 850, 'y' => 300, 'fontSize' => $defaultFontSize];
                imagettftext($image, $c['fontSize'], 0, $c['x'], $c['y'], $black, $fontPath, $record->ward_no ?? '');
                
                // Tehsil
                $c = $coords['tehsil'] ?? ['x' => 200, 'y' => 350, 'fontSize' => $defaultFontSize];
                imagettftext($image, $c['fontSize'], 0, $c['x'], $c['y'], $black, $fontPath, $record->tehsil);
                
                // District
                $c = $coords['district'] ?? ['x' => 450, 'y' => 350, 'fontSize' => $defaultFontSize];
                imagettftext($image, $c['fontSize'], 0, $c['x'], $c['y'], $black, $fontPath, $record->district);
                
                // Child Name
                $c = $coords['child_name'] ?? ['x' => 500, 'y' => 400, 'fontSize' => $defaultFontSize];
                imagettftext($image, $c['fontSize'], 0, $c['x'], $c['y'], $black, $fontPath, $record->child_name ?? '');
            }
            
            // Save filled image
            $outputPath = public_path("FILE_filled_{$page}.jpg");
            imagejpeg($image, $outputPath, 95);
            imagedestroy($image);
            
            $filledImages[] = $outputPath;
        }
        
        // Create PDF from images using FPDF
        $pdf = new \setasign\Fpdi\Fpdi();
        
        foreach ($filledImages as $imagePath) {
            $pdf->AddPage('P', 'A4');
            $pdf->Image($imagePath, 0, 0, 210, 297); // A4 size in mm
        }
        
        $pdfPath = public_path('FILE_filled.pdf');
        $pdf->Output('F', $pdfPath);
        
        return url('/FILE_filled.pdf') . '?t=' . time();
    }
    
    private function fillNumberBoxesOnImage($image, $startX, $y, $number, $count, $fontPath, $fontSize, $color, $spacing = 32)
    {
        $number = str_pad($number, $count, ' ', STR_PAD_RIGHT);
        $chars = str_split($number);
        
        for ($i = 0; $i < $count; $i++) {
            $x = $startX + ($i * $spacing);
            imagettftext($image, $fontSize, 0, $x + 8, $y, $color, $fontPath, $chars[$i] ?? '');
        }
    }
}
