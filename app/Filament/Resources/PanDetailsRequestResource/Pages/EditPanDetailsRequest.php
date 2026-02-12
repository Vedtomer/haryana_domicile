<?php

namespace App\Filament\Resources\PanDetailsRequestResource\Pages;

use App\Filament\Resources\PanDetailsRequestResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditPanDetailsRequest extends EditRecord
{
    protected static string $resource = PanDetailsRequestResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
        ];
    }
}
