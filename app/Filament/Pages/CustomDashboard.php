<?php

namespace App\Filament\Pages;

use App\Models\BirthRecord;
use App\Models\HaryanaDomicile;
use App\Models\PanRequest;
use App\Models\PdfConverter;
use Filament\Pages\Dashboard as BaseDashboard;
use Filament\Notifications\Notification;
use App\Models\CoinTransaction;

class CustomDashboard extends BaseDashboard
{
    protected static string $view = 'filament.pages.custom-dashboard';
    protected static ?string $slug = 'dashboard';
    protected static string $routePath = 'dashboard';

    public function useService($serviceName, $url, $external = false)
    {
        $user = auth()->user();
        
        if ($external) {
            if (!$user->hasEnoughCoins(20)) {
                Notification::make()
                    ->title('Insufficient Coins')
                    ->body('You need at least 20 coins for this service.')
                    ->danger()
                    ->send();
                return;
            }

            $user->deductCoins(
                20, 
                CoinTransaction::TYPE_SERVICE_DEDUCTION, 
                "Used External Service: " . str_replace('<br>', ' ', $serviceName)
            );

            $this->dispatch('open-external-url', url: $url);
        } else {
            return redirect($url);
        }
    }

    protected function getViewData(): array
    {
        return [
            'counts' => [
                'aadhar_update' => 0,
                'haryana_domicile' => HaryanaDomicile::count(),
                'birth_records' => BirthRecord::count(),
                'pdf_converter' => PdfConverter::count(),
                'pan_card' => PanRequest::count(),
            ],
        ];
    }
}