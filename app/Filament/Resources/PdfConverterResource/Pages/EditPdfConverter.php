<?php

namespace App\Filament\Resources\PdfConverterResource\Pages;

use App\Filament\Resources\PdfConverterResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditPdfConverter extends EditRecord
{
    protected static string $resource = PdfConverterResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
        ];
    }
}
