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
use Illuminate\Support\Facades\Request;

class ManualService extends Page implements HasForms
{
    use InteractsWithForms;

    protected static ?string $navigationIcon = 'heroicon-o-rectangle-stack';
    protected static string $view = 'filament.pages.manual-service';
    protected static bool $shouldRegisterNavigation = false;

    public ?array $data = [];
    public $isLoading = false;
    public $serviceType;
    public $config = [];

    protected function getConfigs()
    {
        return [
            'num' => ['name' => 'Number Details', 'icon' => 'heroicon-o-phone', 'label' => 'Mobile Number', 'placeholder' => 'Enter 10-digit number', 'cost' => 30, 'length' => 10, 'type' => 'tel'],
            'aadhar' => ['name' => 'Aadhaar Info', 'icon' => 'heroicon-o-identification', 'label' => 'Aadhar Number', 'placeholder' => 'Enter 12-digit Aadhar', 'cost' => 30, 'length' => 12, 'type' => 'number'],
            'familyinfo' => ['name' => 'Family Info', 'icon' => 'heroicon-o-users', 'label' => 'Aadhar Number', 'placeholder' => 'Enter Aadhar for Family Info', 'cost' => 30, 'length' => 12, 'type' => 'number'],
            'weather' => ['name' => 'Weather Forecast', 'icon' => 'heroicon-o-cloud', 'label' => 'City Name', 'placeholder' => 'e.g. Delhi', 'cost' => 30],
            'vnum' => ['name' => 'Linked Mobile', 'icon' => 'heroicon-o-link', 'label' => 'Vehicle Number', 'placeholder' => 'e.g. HR26AA1234', 'cost' => 30, 'maxLength' => 15],
            'insta' => ['name' => 'Instagram Intel', 'icon' => 'heroicon-o-camera', 'label' => 'Instagram Username', 'placeholder' => 'e.g. username', 'cost' => 30],
            'pincode' => ['name' => 'Pincode Details', 'icon' => 'heroicon-o-map-pin', 'label' => 'Pincode', 'placeholder' => 'Enter 6-digit Pincode', 'cost' => 30, 'length' => 6, 'type' => 'number'],
            'pan' => ['name' => 'PAN Info', 'icon' => 'heroicon-o-credit-card', 'label' => 'PAN Number', 'placeholder' => 'e.g. ABCDE1234F', 'cost' => 30, 'length' => 10],
            'tgnum' => ['name' => 'Telegram Number', 'icon' => 'heroicon-o-paper-airplane', 'label' => 'Telegram ID / Mobile', 'placeholder' => 'Enter ID or Mobile', 'cost' => 30],
            'vowner' => ['name' => 'Vehicle Owner', 'icon' => 'heroicon-o-user-circle', 'label' => 'Vehicle Number', 'placeholder' => 'e.g. HR26AA1234', 'cost' => 30, 'maxLength' => 15],
            'ifsc' => ['name' => 'IFSC Details', 'icon' => 'heroicon-o-building-library', 'label' => 'IFSC Code', 'placeholder' => 'e.g. SBIN0001234', 'cost' => 30, 'length' => 11],
            'gst' => ['name' => 'GST Data', 'icon' => 'heroicon-o-briefcase', 'label' => 'GSTIN Number', 'placeholder' => 'Enter 15-digit GSTIN', 'cost' => 30, 'length' => 15],
        ];
    }

    public function mount(): void
    {
        $this->serviceType = request()->query('type', 'num');
        $configs = $this->getConfigs();
        
        if (!isset($configs[$this->serviceType])) {
            abort(404);
        }

        $this->config = $configs[$this->serviceType];
        $this->form->fill();
    }

    public function getTitle(): string
    {
        return $this->config['name'] ?? 'Manual Service';
    }

    public function form(Form $form): Form
    {
        $field = TextInput::make('input_value')
            ->label($this->config['label'] ?? 'Input')
            ->required()
            ->placeholder($this->config['placeholder'] ?? '');

        if (isset($this->config['length'])) {
            $field->length($this->config['length']);
            $field->maxLength($this->config['length']);
        }

        if (isset($this->config['maxLength'])) {
            $field->maxLength($this->config['maxLength']);
        }

        if (isset($this->config['type'])) {
            if ($this->config['type'] === 'tel') $field->tel();
            if ($this->config['type'] === 'number') $field->numeric();
        }

        return $form->schema([$field])->statePath('data');
    }

    public function submit()
    {
        $formData = $this->form->getState();
        $inputValue = $formData['input_value'];
        $user = auth()->user();
        $cost = $this->config['cost'] ?? 30;

        if (!$user->hasEnoughCoins($cost)) {
            Notification::make()
                ->title('Insufficient Coins')
                ->body("You need {$cost} coins for this service.")
                ->danger()
                ->send();
            return;
        }

        $this->isLoading = true;
        
        try {
            $user->deductCoins(
                $cost, 
                CoinTransaction::TYPE_SERVICE_DEDUCTION, 
                "{$this->config['name']} Request: " . $inputValue
            );

            ServiceRequest::create([
                'user_id' => auth()->id(),
                'service_name' => $this->config['name'],
                'input_data' => ['query' => $inputValue],
                'status' => 'pending',
            ]);

            Notification::make()
                ->title('Request Submitted')
                ->body('Admin will process your request shortly.')
                ->success()
                ->send();

            $this->form->fill();
        } catch (\Exception $e) {
            Notification::make()
                ->title('Error')
                ->body('Submission failed.')
                ->danger()
                ->send();
        } finally {
            $this->isLoading = false;
        }
    }

    public function getHistoryProperty()
    {
        return ServiceRequest::where('user_id', auth()->id())
            ->where('service_name', $this->config['name'])
            ->latest()
            ->get();
    }
}
