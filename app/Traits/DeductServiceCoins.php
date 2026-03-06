<?php

namespace App\Traits;

use App\Models\CoinTransaction;
use Filament\Notifications\Notification;
use Illuminate\Validation\ValidationException;

trait DeductServiceCoins
{
    protected function checkAndDeductCoins(string $serviceName)
    {
        $user = auth()->user();

        if (!$user->hasEnoughCoins(20)) {
            Notification::make()
                ->title('Wallet Alert')
                ->body('Insufficient coins for this service. You need 20 coins.')
                ->danger()
                ->send();

            throw ValidationException::withMessages([
                'wallet' => 'Your wallet balance is too low for this service (20 coins required).'
            ]);
        }

        $user->deductCoins(
            20,
            CoinTransaction::TYPE_SERVICE_DEDUCTION,
            "Created Record: " . $serviceName
        );
    }
}
