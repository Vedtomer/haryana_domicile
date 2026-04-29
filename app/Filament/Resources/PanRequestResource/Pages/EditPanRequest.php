<?php

namespace App\Filament\Resources\PanRequestResource\Pages;

use App\Filament\Resources\PanRequestResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditPanRequest extends EditRecord
{
    protected static string $resource = PanRequestResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
        ];
    }
}
