<?php

namespace App\Filament\Resources\MarriageFormResource\Pages;

use App\Filament\Resources\MarriageFormResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditMarriageForm extends EditRecord
{
    protected static string $resource = MarriageFormResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
        ];
    }
}
