<?php

namespace App\Filament\Pages;

use App\Services\FasalService;
use Filament\Pages\Page;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Concerns\InteractsWithForms;
use Filament\Forms\Contracts\HasForms;
use Filament\Forms\Form;
use Filament\Notifications\Notification;
use App\Models\CoinTransaction;
use Illuminate\Support\Facades\Storage;
use App\Models\ServiceRequest;
use Illuminate\Support\Facades\Log;

class FasalSearch extends Page implements HasForms
{
    use InteractsWithForms;

    protected static ?string $navigationIcon = 'heroicon-o-document-magnifying-glass';
    protected static string $view = 'filament.pages.fasal-search';
    protected static ?string $title = 'Fasal Aadhar to Family ID';
    protected static ?string $navigationLabel = 'Fasal Aadhar to Family ID';
    protected static ?string $slug = 'fasal-search';
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
                TextInput::make('aadhar_number')
                    ->label('Aadhar Number')
                    ->required()
                    ->numeric()
                    ->length(12)
                    ->maxLength(12)
                    ->minLength(12)
                    ->placeholder('Enter 12-digit Aadhar Number'),
            ])
            ->statePath('data');
    }

    public function search()
    {
        $formData = $this->form->getState();
        $aadharNumber = $formData['aadhar_number'];
        $user = auth()->user();

        if (!$user->hasEnoughCoins(10)) { 
            Notification::make()
                ->title('Insufficient Coins')
                ->body('You need 10 coins for this service.')
                ->danger()
                ->send();
            return;
        }

        $this->isLoading = true;
        
        try {
            $service = new FasalService();
            $result = $service->searchByAadhar($aadharNumber);

            if ($result && !empty($result)) {
                $user->deductCoins(
                    10, 
                    CoinTransaction::TYPE_SERVICE_DEDUCTION, 
                    "Fasal Aadhar Search - Aadhar: " . $aadharNumber
                );

                Notification::make()
                    ->title('Data Fetched')
                    ->body('Data retrieved successfully.')
                    ->success()
                    ->send();
            } else {
                Notification::make()
                    ->title('Search Failed')
                    ->body('Could not retrieve data. Please try again later.')
                    ->warning()
                    ->send();
            }
        } catch (\Exception $e) {
            Log::error('Fasal Search Exception: ' . $e->getMessage());
            Notification::make()
                ->title('Service Error')
                ->body('An error occurred: ' . $e->getMessage())
                ->danger()
                ->send();
        } finally {
            $this->isLoading = false;
        }
    }

    public function getHistoryProperty()
    {
        return ServiceRequest::where('user_id', auth()->id())
            ->where('service_name', 'Fasal Aadhar Search')
            ->orderBy('created_at', 'desc')
            ->get();
    }
}
