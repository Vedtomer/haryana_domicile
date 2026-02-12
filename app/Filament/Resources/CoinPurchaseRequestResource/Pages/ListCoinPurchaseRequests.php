<?php

namespace App\Filament\Resources\CoinPurchaseRequestResource\Pages;

use App\Filament\Resources\CoinPurchaseRequestResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListCoinPurchaseRequests extends ListRecords
{
    protected static string $resource = CoinPurchaseRequestResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),
        ];
    }
}
