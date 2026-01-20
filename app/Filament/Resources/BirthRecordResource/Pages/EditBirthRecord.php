<?php

namespace App\Filament\Resources\BirthRecordResource\Pages;

use App\Filament\Resources\BirthRecordResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditBirthRecord extends EditRecord
{
    protected static string $resource = BirthRecordResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
        ];
    }
}
