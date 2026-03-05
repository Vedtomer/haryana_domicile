<?php

namespace App\Filament\Pages;

use App\Models\BirthRecord;
use App\Models\HaryanaDomicile;
use App\Models\PanRequest;
use App\Models\PdfConverter;
use Filament\Pages\Dashboard as BaseDashboard;

class CustomDashboard extends BaseDashboard
{
    protected static string $view = 'filament.pages.custom-dashboard';

    protected function getViewData(): array
    {
        return [
            'counts' => [
                'aadhar_update' => 0,
                'haryana_domicile' => HaryanaDomicile::count(),
                'birth_records' => BirthRecord::count(),
                'pdf_converter' => PdfConverter::count(),
                'pan_card' => PanRequest::count(),
            ],
        ];
    }
}
