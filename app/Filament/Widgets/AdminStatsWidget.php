<?php

namespace App\Filament\Widgets;

use App\Models\User;
use App\Models\CoinPurchaseRequest;
use App\Models\ServiceRequest;
use App\Models\PanRequest;
use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class AdminStatsWidget extends BaseWidget
{
    public static function canView(): bool
    {
        return auth()->check() && auth()->user()->type === 'admin';
    }

    protected function getStats(): array
    {
        return [
            Stat::make('Total Users', User::where('type', 'user')->count())
                ->description('Registered service users')
                ->descriptionIcon('heroicon-m-users')
                ->color('success'),
            Stat::make('Pending Coin Requests', CoinPurchaseRequest::where('status', 'pending')->count())
                ->description('Requests awaiting approval')
                ->descriptionIcon('heroicon-m-currency-dollar')
                ->color('warning'),
            Stat::make('Pending PAN/Services', 
                PanRequest::where('status', 'pending')->count() + 
                ServiceRequest::where('status', 'pending')->count()
            )
                ->description('Total pending tasks')
                ->descriptionIcon('heroicon-m-clipboard-document-check')
                ->color('danger'),
        ];
    }
}
