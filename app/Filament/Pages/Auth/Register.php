<?php

namespace App\Filament\Pages\Auth;

use Filament\Pages\Auth\Register as BaseRegister;
use Illuminate\Database\Eloquent\Model;

use Filament\Forms\Components\Component;
use Filament\Forms\Components\TextInput;
use Illuminate\Support\Facades\Hash;

class Register extends BaseRegister
{
    protected function handleRegistration(array $data): Model
    {
        $data['type'] = 'user';
        $data['coins'] = 1000;
        
        $user = parent::handleRegistration($data);
        
        \App\Models\CoinTransaction::create([
            'user_id' => $user->id,
            'amount' => 1000,
            'balance_after' => 1000,
            'type' => \App\Models\CoinTransaction::TYPE_ADMIN_CREDIT,
            'description' => 'Welcome Bonus',
            'created_by' => $user->id,
        ]);
        
        return $user;
    }

    protected function getPasswordFormComponent(): Component
    {
        return TextInput::make('password')
            ->label(__('filament-panels::pages/auth/register.form.password.label'))
            ->password()
            ->revealable(filament()->arePasswordsRevealable())
            ->required()
            ->dehydrateStateUsing(fn ($state) => Hash::make($state))
            ->same('passwordConfirmation')
            ->validationAttribute(__('filament-panels::pages/auth/register.form.password.validation_attribute'));
    }
}
