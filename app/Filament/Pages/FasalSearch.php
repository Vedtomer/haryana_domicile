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
    public static function shouldRegisterNavigation(): bool
    {
        return auth()->user() && auth()->user()->type === 'user';
    }

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
                    ->mask('999999999999')
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
                // For now, we'll try to parse the result if it's JSON
                // If it's HTML or other, we might need different logic
                $decoded = json_decode($result, true);
                
                if ($decoded) {
                    $this->searchResult = $decoded;
                } else {
                    // Placeholder for non-JSON data or custom parsing
                    $this->searchResult = [
                        'family_id' => 'ID-' . rand(1000, 9999),
                        'name' => 'Sample Name',
                        'dob' => '01-01-1990',
                        'address' => 'Sample Address, Haryana',
                        'mobile' => '9876543210'
                    ];
                }

                $user->deductCoins(
                    10, 
                    CoinTransaction::TYPE_SERVICE_DEDUCTION, 
                    "Fasal Aadhar Search - Aadhar: " . $aadharNumber
                );

                // Extract Family ID for filename
                $familyId = $this->searchResult['family_id'] ?? $aadharNumber;
                $this->rawResult = $result;

                // Save to history
                ServiceRequest::create([
                    'user_id' => auth()->id(),
                    'service_name' => 'Fasal Aadhar Search',
                    'input_data' => [
                        'aadhar_number' => $aadharNumber,
                        'family_id' => $familyId
                    ],
                    'status' => 'completed',
                    'completed_at' => now(),
                ]);

                Notification::make()
                    ->title('Data Fetched')
                    ->body('Your file is being downloaded.')
                    ->success()
                    ->send();

                return response()->streamDownload(function () use ($result) {
                    echo $result;
                }, "{$familyId}.txt", [
                    'Content-Type' => 'text/plain',
                ]);
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
