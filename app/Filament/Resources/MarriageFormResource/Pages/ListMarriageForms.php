<?php

namespace App\Filament\Resources\MarriageFormResource\Pages;

use App\Filament\Resources\MarriageFormResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListMarriageForms extends ListRecords
{
    protected static string $resource = MarriageFormResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),
        ];
    }
}
