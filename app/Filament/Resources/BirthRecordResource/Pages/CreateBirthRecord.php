<?php

namespace App\Filament\Resources\BirthRecordResource\Pages;

use App\Filament\Resources\BirthRecordResource;
use Filament\Actions;
use Filament\Resources\Pages\CreateRecord;
use App\Traits\DeductServiceCoins;

class CreateBirthRecord extends CreateRecord
{
    use DeductServiceCoins;

    protected static string $resource = BirthRecordResource::class;

    protected function mutateFormDataBeforeCreate(array $data): array
    {
        $this->checkAndDeductCoins('Birth Record');
        $data['user_id'] = auth()->id();
        return $data;
    }
}
