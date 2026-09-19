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

use Illuminate\Support\Facades\Http;

class VehicleDetail extends Page implements HasForms
{
    use InteractsWithForms;

    protected static ?string $navigationIcon = 'heroicon-o-truck';
    protected static string $view = 'filament.pages.vehicle-detail';
    protected static ?string $title = 'Vehicle Detail';
    protected static ?string $navigationLabel = 'Vehicle Detail';
    protected static ?string $slug = 'vehicle-detail';
    public static function shouldRegisterNavigation(): bool
    {
        return auth()->check() && auth()->user()->can('page_VehicleDetail');
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
                TextInput::make('vehicle_number')
                    ->label('Vehicle Number')
                    ->required()
                    ->minLength(6)
                    ->maxLength(15)
                    ->placeholder('e.g. HR26AA1234')
                    ->extraInputAttributes(['style' => 'text-transform: uppercase']),
            ])
            ->statePath('data');
    }

    public function submit()
    {
        $formData = $this->form->getState();
        $vehicleNumber = strtoupper($formData['vehicle_number']);
        $user = auth()->user();

        // Price: 20 coins
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
            $user->deductCoins(
                30, 
                CoinTransaction::TYPE_SERVICE_DEDUCTION, 
                "Vehicle Detail Request - No: " . $vehicleNumber
            );

            $cleanRegNo = strtoupper(trim(str_replace([' ', '-'], '', $vehicleNumber)));
            $url = "https://api.paanel.shop/api/gateway.php?key=SamXverma&Policy=" . urlencode($cleanRegNo);
            $response = Http::connectTimeout(10)->timeout(30)->get($url);

            $adminResponse = null;
            $status = 'pending';
            $completedAt = null;

            if ($response->successful()) {
                $json = $response->json();
                $rawData = $json['data'] ?? [];
                $vData = $rawData['meta_data']['signzy_response']['result'] ?? $rawData;
                $regFound = $vData['regNo'] ?? $vData['vehicleNumber'] ?? $rawData['registration_number'] ?? null;

                if ($regFound) {
                    $owner = $vData['owner'] ?? ($rawData['customer_details']['full_name'] ?? 'N/A');
                    $model = $vData['model'] ?? 'N/A';
                    $mfg = $vData['vehicleManufacturerName'] ?? 'N/A';
                    $regDate = $vData['regDate'] ?? 'N/A';
                    $insurance = $vData['vehicleInsuranceCompanyName'] ?? 'N/A';
                    $policyNo = $vData['vehicleInsurancePolicyNumber'] ?? 'N/A';
                    $insUpto = $vData['vehicleInsuranceUpto'] ?? 'N/A';
                    $rcExpiry = $vData['rcExpiryDate'] ?? 'N/A';
                    $chassis = $vData['chassis'] ?? ($rawData['chassis_number'] ?? 'N/A');
                    $engine = $vData['engine'] ?? ($rawData['engine_number'] ?? 'N/A');
                    $rto = $vData['regAuthority'] ?? 'N/A';

                    $adminResponse = "Owner: {$owner}\nMaker/Model: {$mfg} - {$model}\nReg Date: {$regDate}\nRC Expiry: {$rcExpiry}\nRTO: {$rto}\nChassis: {$chassis}\nEngine: {$engine}\nInsurance: {$insurance}\nPolicy: {$policyNo} (Valid: {$insUpto})";
                    $status = 'completed';
                    $completedAt = now();
                }
            }

            ServiceRequest::create([
                'user_id' => auth()->id(),
                'service_name' => 'Vehicle Detail',
                'input_data' => ['vehicle_number' => $vehicleNumber],
                'status' => $status,
                'admin_response' => $adminResponse,
                'completed_at' => $completedAt,
            ]);

            if ($status === 'completed') {
                Notification::make()
                    ->title('Vehicle Details Retrieved')
                    ->body('Details found and displayed below in your history.')
                    ->success()
                    ->send();
            } else {
                Notification::make()
                    ->title('Request Submitted')
                    ->body('Your Vehicle Detail request has been recorded.')
                    ->info()
                    ->send();
            }

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
            ->where('service_name', 'Vehicle Detail')
            ->latest()
            ->get();
    }
}
