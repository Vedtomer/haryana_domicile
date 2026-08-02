<?php

namespace App\Filament\Resources\MarriageFormResource\Pages;

use App\Filament\Resources\MarriageFormResource;
use Filament\Resources\Pages\Page;
use Filament\Resources\Pages\Concerns\InteractsWithRecord;
use Barryvdh\DomPDF\Facade\Pdf;

class PrintMarriageForm extends Page
{
    use InteractsWithRecord;

    protected static string $resource = MarriageFormResource::class;
    protected static string $view = 'pdf.marriage_form'; 
    protected static bool $shouldRegisterNavigation = false;

    public function mount(int | string $record)
    {
        $this->record = $this->resolveRecord($record);
        
        $pdf = Pdf::loadView('pdf.marriage_form', ['record' => $this->record]);
        $pdf->setPaper('A4', 'portrait');
        
        // Save to public temp dir and redirect
        $tempDir = public_path('tmp');
        if (!file_exists($tempDir)) {
            mkdir($tempDir, 0755, true);
        }
        
        $fileName = 'Marriage_Form_' . $this->record->id . '_' . time() . '.pdf';
        $pdfPath = $tempDir . '/' . $fileName;
        $pdf->save($pdfPath);
        
        redirect(url('/tmp/' . $fileName));
    }
}
