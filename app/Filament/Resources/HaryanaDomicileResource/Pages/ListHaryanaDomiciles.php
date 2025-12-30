<?php

namespace App\Filament\Resources\HaryanaDomicileResource\Pages;

use App\Filament\Resources\HaryanaDomicileResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListHaryanaDomiciles extends ListRecords
{
    protected static string $resource = HaryanaDomicileResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),
        ];
    }
}
