<?php

namespace App\Filament\Widgets;

use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class CoinBalanceWidget extends BaseWidget
{
    protected static ?int $sort = -1;

    protected function getStats(): array
    {
        $user = auth()->user();
        $coinBalance = $user->coins ?? 0;

        // Determine color based on balance
        $color = match (true) {
                $coinBalance >= 100 => 'success',
                $coinBalance >= 50 => 'info',
                $coinBalance >= 20 => 'warning',
                default => 'danger',
            };

        return [
            Stat::make('Your Coin Balance', $coinBalance)
            ->description('Coins available for services')
            ->descriptionIcon('heroicon-m-banknotes')
            ->color($color)
            ->chart([7, 2, 10, 3, 15, 4, $coinBalance]),
        ];
    }
}
