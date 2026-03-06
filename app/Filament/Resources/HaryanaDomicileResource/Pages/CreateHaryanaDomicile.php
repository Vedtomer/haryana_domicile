<?php

namespace App\Filament\Resources\HaryanaDomicileResource\Pages;

use App\Filament\Resources\HaryanaDomicileResource;
use Filament\Actions;
use Filament\Resources\Pages\CreateRecord;
use App\Traits\DeductServiceCoins;

class CreateHaryanaDomicile extends CreateRecord
{
    use DeductServiceCoins;

    protected static string $resource = HaryanaDomicileResource::class;

    protected function getRedirectUrl(): string
    {
        return $this->getResource()::getUrl('index');
    }

    protected function mutateFormDataBeforeCreate(array $data): array
    {
        $this->checkAndDeductCoins('Haryana Domicile');
        $data['user_id'] = auth()->id();
        return $data;
    }
}
