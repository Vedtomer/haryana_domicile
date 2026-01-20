<?php

namespace App\Filament\Resources\BirthRecordResource\Pages;

use App\Filament\Resources\BirthRecordResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListBirthRecords extends ListRecords
{
    protected static string $resource = BirthRecordResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),
        ];
    }
}
