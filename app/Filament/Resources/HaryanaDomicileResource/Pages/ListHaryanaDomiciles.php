<?php

namespace App\Filament\Resources\HaryanaDomicileResource\Pages;

use App\Filament\Resources\HaryanaDomicileResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListHaryanaDomiciles extends ListRecords
{
    protected static string $resource = HaryanaDomicileResource::class;

    protected ?string $heading = 'Resident File';

    protected function getTableQuery(): ?\Illuminate\Database\Eloquent\Builder
    {
        return parent::getTableQuery()->latest();
    }

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),
        ];
    }
}
