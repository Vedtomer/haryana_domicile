<?php

namespace App\Livewire;

use Livewire\Component;
use Livewire\WithFileUploads;
use App\Models\CoinPurchaseRequest;
use App\Models\Setting;
use Filament\Notifications\Notification;

class AddCoinModal extends Component
{
    use WithFileUploads;

    public $isOpen = false;
    public $package_amount;
    public $payment_screenshot;

    public $isSuccess = false;
    public $submittedAmount = 0;
    public $submittedCoins = 0;
    public $requestId = null;
    public $submittedScreenshotUrl = null;
    public $whatsappNumber;
    
    public $packages = [
        100 => '100 Coins (₹100)',
        250 => '250 Coins (₹250)',
        500 => '500 Coins (₹500)',
        1000 => '1000 Coins (₹1000)',
    ];

    public function mount()
    {
        $this->whatsappNumber = Setting::get('whatsapp_number', '380630323112');
    }

    public function openModal()
    {
        $this->isOpen = true;
        $this->isSuccess = false;
        $this->whatsappNumber = Setting::get('whatsapp_number', '380630323112');
    }

    public function closeModal()
    {
        $this->isOpen = false;
        $this->isSuccess = false;
        $this->reset(['package_amount', 'payment_screenshot', 'submittedAmount', 'submittedCoins', 'requestId', 'submittedScreenshotUrl']);
    }

    public function submitRequest()
    {
        $this->validate([
            'package_amount' => 'required|in:100,250,500,1000',
            'payment_screenshot' => 'required|image|max:5120',
        ]);

        $screenshotPath = $this->payment_screenshot->store('coin-requests', 'public');

        $coinRequest = CoinPurchaseRequest::create([
            'user_id' => auth()->id(),
            'package_amount' => $this->package_amount,
            'coins_requested' => $this->package_amount,
            'utr_number' => 'N/A', // Set to N/A since it's removed from UI
            'payment_screenshot' => $screenshotPath,
            'status' => CoinPurchaseRequest::STATUS_PENDING,
        ]);

        $this->submittedAmount = $this->package_amount;
        $this->submittedCoins = $this->package_amount;
        $this->requestId = $coinRequest->id;
        $this->submittedScreenshotUrl = asset('storage/' . $screenshotPath);
        $this->isSuccess = true;

        Notification::make()
            ->title('Payment Request Submitted')
            ->body('Your coin request has been submitted. Please send screenshot on WhatsApp for fast verification.')
            ->success()
            ->send();
    }

    public function getWhatsAppUrl()
    {
        $cleanPhone = preg_replace('/[^0-9]/', '', $this->whatsappNumber ?: '380630323112');
        $user = auth()->user();

        $msg  = "*Coin Purchase - Payment Screenshot*\n";
        $msg .= "------------------------------------\n";
        if ($user?->name)  $msg .= "👤 *Name:* {$user->name}\n";
        if ($user?->phone) $msg .= "📱 *Phone:* {$user->phone}\n";
        if ($user?->email) $msg .= "📧 *Email:* {$user->email}\n";
        $msg .= "💰 *Amount Paid:* ₹{$this->submittedAmount}\n";
        $msg .= "🪙 *Coins Requested:* {$this->submittedCoins}\n";
        if ($this->requestId) $msg .= "🆔 *Request ID:* #{$this->requestId}\n";
        if ($this->submittedScreenshotUrl) {
            $msg .= "🔗 *Receipt:* {$this->submittedScreenshotUrl}\n";
        }
        $msg .= "------------------------------------\n";
        $msg .= "I have made the payment. Please verify and credit coins. Payment screenshot attached.";

        return "https://wa.me/{$cleanPhone}?text=" . urlencode($msg);
    }

    public function render()
    {
        return view('livewire.add-coin-modal');
    }
}
