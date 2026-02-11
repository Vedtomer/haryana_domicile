<?php

namespace App\Filament\Resources\PdfConverterResource\Pages;

use App\Filament\Resources\PdfConverterResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListPdfConverters extends ListRecords
{
    protected static string $resource = PdfConverterResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),
        ];
    }
}
