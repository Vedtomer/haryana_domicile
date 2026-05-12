<?php

namespace App\Filament\Pages;

use Filament\Pages\Page;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Concerns\InteractsWithForms;
use Filament\Forms\Contracts\HasForms;
use Filament\Forms\Form;
use Filament\Notifications\Notification;
use App\Models\CoinTransaction;
use App\Models\ServiceRequest;

class PhoneToAadhar extends Page implements HasForms
{
    use InteractsWithForms;

    protected static ?string $navigationIcon = 'heroicon-o-phone';
    protected static string $view = 'filament.pages.phone-to-aadhar';
    protected static ?string $title = 'Phone to Aadhar';
    protected static ?string $navigationLabel = 'Phone to Aadhar';
    protected static ?string $slug = 'phone-to-aadhar';
    protected static bool $shouldRegisterNavigation = true;

    public ?array $data = [];
    public $isLoading = false;

    public function mount(): void
    {
        $this->form->fill();
    }

    public function form(Form $form): Form
    {
        return $form
            ->schema([
                TextInput::make('mobile')
                    ->label('Mobile Number')
                    ->required()
                    ->tel()
                    ->length(10)
                    ->maxLength(10)
                    ->placeholder('Enter 10-digit mobile number'),
            ])
            ->statePath('data');
    }

    public function submit()
    {
        $formData = $this->form->getState();
        $mobile = $formData['mobile'];
        $user = auth()->user();

        if (!$user->hasEnoughCoins(30)) {
            Notification::make()
                ->title('Insufficient Coins')
                ->body('You need 30 coins for this service.')
                ->danger()
                ->send();
            return;
        }

        $this->isLoading = true;
        
        try {
            // Deduct coins
            $user->deductCoins(
                30, 
                CoinTransaction::TYPE_SERVICE_DEDUCTION, 
                "Phone to Aadhar Request - Mobile: " . $mobile
            );

            // Create service request for admin
            ServiceRequest::create([
                'user_id' => auth()->id(),
                'service_name' => 'Phone to Aadhar',
                'input_data' => ['mobile' => $mobile],
                'status' => 'pending',
                'completed_at' => null,
            ]);

            Notification::make()
                ->title('Request Submitted')
                ->body('Your request has been sent to the admin. You will be notified once it is completed.')
                ->success()
                ->send();

            $this->form->fill();
        } catch (\Exception $e) {
            Notification::make()
                ->title('Error')
                ->body('An error occurred while submitting your request.')
                ->danger()
                ->send();
        } finally {
            $this->isLoading = false;
        }
    }

    public function getHistoryProperty()
    {
        return ServiceRequest::where('user_id', auth()->id())
            ->where('service_name', 'Phone to Aadhar')
            ->latest()
            ->get();
    }
}
