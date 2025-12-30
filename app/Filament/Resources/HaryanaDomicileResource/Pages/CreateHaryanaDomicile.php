<?php

namespace App\Filament\Resources\HaryanaDomicileResource\Pages;

use App\Filament\Resources\HaryanaDomicileResource;
use Filament\Actions;
use Filament\Resources\Pages\CreateRecord;

class CreateHaryanaDomicile extends CreateRecord
{
    protected static string $resource = HaryanaDomicileResource::class;

    protected function getRedirectUrl(): string
    {
        return $this->getResource()::getUrl('index');
    }
}
