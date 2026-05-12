<?php

namespace App\Filament\Pages;

use App\Services\FamilyDataService;
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

class FamilyDataSearch extends Page implements HasForms
{
    use InteractsWithForms;

    protected static ?string $navigationIcon = 'heroicon-o-users';
    protected static string $view = 'filament.pages.family-data-search';
    protected static ?string $title = 'Aadhar to Family Data';
    protected static ?string $navigationLabel = 'Aadhar to Family Data';
    protected static ?string $slug = 'family-data-search';
    protected static bool $shouldRegisterNavigation = false;

    public ?array $data = [];
    public $familyData = null;
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
                    ->placeholder('Enter 12-digit Aadhar Number'),
            ])
            ->statePath('data');
    }

    public function search()
    {
        $formData = $this->form->getState();
        $aadharNumber = $formData['aadhar_number'];
        $user = auth()->user();

        if (!$user->hasEnoughCoins(20)) {
            Notification::make()
                ->title('Insufficient Coins')
                ->body('You need 20 coins for this service.')
                ->danger()
                ->send();
            return;
        }

        $this->isLoading = true;
        
        try {
            $service = new FamilyDataService();
            $result = $service->getFamilyData($aadharNumber);

            if ($result && !empty($result)) {
                // Determine extension and data type
                $extension = 'txt';
                $isBinary = false;
                
                if (str_starts_with($result, 'JVBERi')) {
                    $extension = 'pdf';
                    $isBinary = true;
                } elseif (str_starts_with($result, 'iVBORw0') || str_starts_with($result, '/9j/')) {
                    $extension = 'png';
                    $isBinary = true;
                }

                // Deduct coins only on success
                $user->deductCoins(
                    20, 
                    CoinTransaction::TYPE_SERVICE_DEDUCTION, 
                    "Aadhar to Family Data - Aadhar: " . $aadharNumber
                );

                // Save to storage
                $fileName = 'family_data/' . auth()->id() . '_' . time() . '.' . $extension;
                $saveData = $isBinary ? base64_decode($result) : $result;
                Storage::disk('public')->put($fileName, $saveData);

                ServiceRequest::create([
                    'user_id' => auth()->id(),
                    'service_name' => 'Aadhar to Family Data',
                    'input_data' => ['aadhar_number' => $aadharNumber],
                    'status' => 'completed',
                    'attachment' => $fileName,
                    'completed_at' => now(),
                ]);

                $this->familyData = $result;
                $this->dispatch('record-loaded');
                
                Notification::make()
                    ->title('Data Fetched Successfully')
                    ->success()
                    ->send();
            } else {
                Notification::make()
                    ->title('No Data Found')
                    ->body('The service returned an empty response. Please check the Aadhar number or try again later.')
                    ->warning()
                    ->send();
            }
        } catch (\Exception $e) {
            Log::error('Aadhar Search Exception: ' . $e->getMessage());
            Notification::make()
                ->title('Service Error')
                ->body('An error occurred while connecting to the service: ' . $e->getMessage())
                ->danger()
                ->send();
        } finally {
            $this->isLoading = false;
        }
    }

    public function viewRecord($id)
    {
        $record = ServiceRequest::find($id);
        if ($record && $record->attachment) {
            $data = Storage::disk('public')->get($record->attachment);
            
            // If it's a binary file (PDF/Image), we need to encode it for the frontend
            $extension = pathinfo($record->attachment, PATHINFO_EXTENSION);
            if (in_array($extension, ['pdf', 'png', 'jpg'])) {
                $this->familyData = base64_encode($data);
            } else {
                $this->familyData = $data;
            }
            
            $this->dispatch('record-loaded');
            
            Notification::make()
                ->title('Record Loaded')
                ->success()
                ->send();
        }
    }

    public function getHistoryProperty()
    {
        return ServiceRequest::where('user_id', auth()->id())
            ->where('service_name', 'Aadhar to Family Data')
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function clear()
    {
        $this->familyData = null;
        $this->form->fill();
    }
}
