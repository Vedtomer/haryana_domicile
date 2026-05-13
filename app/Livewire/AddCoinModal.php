<?php

namespace App\Livewire;

use Livewire\Component;
use Livewire\WithFileUploads;
use App\Models\CoinPurchaseRequest;
use Filament\Notifications\Notification;

class AddCoinModal extends Component
{
    use WithFileUploads;

    public $isOpen = false;
    public $package_amount;
    public $payment_screenshot;
    
    public $packages = [
        100 => '100 Coins (₹100)',
        250 => '250 Coins (₹250)',
        500 => '500 Coins (₹500)',
        1000 => '1000 Coins (₹1000)',
    ];

    public function openModal()
    {
        $this->isOpen = true;
    }

    public function closeModal()
    {
        $this->isOpen = false;
        $this->reset(['package_amount', 'payment_screenshot']);
    }

    public function submitRequest()
    {
        $this->validate([
            'package_amount' => 'required|in:100,250,500,1000',
            'payment_screenshot' => 'required|image|max:5120',
        ]);

        $screenshotPath = $this->payment_screenshot->store('coin-requests', 'public');

        CoinPurchaseRequest::create([
            'user_id' => auth()->id(),
            'package_amount' => $this->package_amount,
            'coins_requested' => $this->package_amount,
            'utr_number' => 'N/A', // Set to N/A since it's removed from UI
            'payment_screenshot' => $screenshotPath,
            'status' => CoinPurchaseRequest::STATUS_PENDING,
        ]);

        Notification::make()
            ->title('Request Submitted')
            ->body('Your coin request has been submitted and is pending approval.')
            ->success()
            ->send();

        $this->closeModal();
    }

    public function render()
    {
        return view('livewire.add-coin-modal');
    }
}
