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
    public $isLoading = false;
    public $familyData = null;

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
            $service = new FamilyDataService();
            $result = $service->getFamilyData($aadharNumber);

            if ($result && !empty($result)) {
                // Determine extension and data type
                $extension = 'txt';
                $isBinary = false;
                $mime = 'text/plain';
                
                if (str_starts_with($result, 'JVBERi')) {
                    $extension = 'pdf';
                    $isBinary = true;
                    $mime = 'application/pdf';
                } elseif (str_starts_with($result, 'iVBORw0') || str_starts_with($result, '/9j/')) {
                    $extension = 'png';
                    $isBinary = true;
                    $mime = 'image/png';
                }

                // Deduct coins only on success
                $user->deductCoins(
                    30, 
                    CoinTransaction::TYPE_SERVICE_DEDUCTION, 
                    "Aadhar to Family Data - Aadhar: " . $aadharNumber
                );

                // Save to storage
                $fileName = 'family_data/' . auth()->id() . '_' . time() . '.' . $extension;
                $saveData = $isBinary ? base64_decode($result) : $result;
                Storage::disk('public')->put($fileName, $saveData);

                // Extract Family ID if possible (assuming it's in the text)
                $familyId = $aadharNumber;
                if (!$isBinary) {
                    // Try to find "NewFamilyID" or "Family ID"
                    if (preg_match('/(?:NewFamilyID|Family ID)\s*[:=-]?\s*([A-Z0-9]+)/i', $result, $matches)) {
                        $familyId = trim($matches[1]);
                    }
                }

                ServiceRequest::create([
                    'user_id' => auth()->id(),
                    'service_name' => 'Aadhar to Family Data',
                    'input_data' => [
                        'aadhar_number' => $aadharNumber,
                        'family_id' => $familyId
                    ],
                    'status' => 'completed',
                    'attachment' => $fileName,
                    'completed_at' => now(),
                ]);

                // Instead of download, show on page
                if (!$isBinary) {
                    $this->familyData = $result;
                } else {
                    $this->familyData = [
                        'url' => Storage::url($fileName),
                        'type' => $extension
                    ];
                }

                Notification::make()
                    ->title('Data Fetched Successfully')
                    ->success()
                    ->send();

            } else {
                Notification::make()
                    ->title('No Data Found')
                    ->body('The service returned an empty response.')
                    ->warning()
                    ->send();
            }
        } catch (\Exception $e) {
            Log::error('Aadhar Search Exception: ' . $e->getMessage());
            Notification::make()
                ->title('Service Error')
                ->body('An error occurred: ' . $e->getMessage())
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
            $extension = pathinfo($record->attachment, PATHINFO_EXTENSION);
            $mime = match($extension) {
                'pdf' => 'application/pdf',
                'png' => 'image/png',
                'jpg' => 'image/jpeg',
                default => 'text/plain',
            };
            
            return response()->streamDownload(function () use ($data) {
                echo $data;
            }, basename($record->attachment), [
                'Content-Type' => $mime,
            ]);
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
