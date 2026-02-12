<?php

namespace App\Filament\Resources\CoinPurchaseRequestResource\Pages;

use App\Filament\Resources\CoinPurchaseRequestResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditCoinPurchaseRequest extends EditRecord
{
    protected static string $resource = CoinPurchaseRequestResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
        ];
    }
}
