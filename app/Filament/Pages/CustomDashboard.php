<?php

namespace App\Filament\Pages;

use App\Models\BirthRecord;
use App\Models\HaryanaDomicile;
use App\Models\PanRequest;
use App\Models\PdfConverter;
use Filament\Pages\Dashboard as BaseDashboard;
use Filament\Notifications\Notification;
use App\Models\CoinTransaction;

class CustomDashboard extends BaseDashboard
{
    use \Livewire\WithFileUploads;

    public static function canAccess(): bool
    {
        return auth()->user()->can('page_CustomDashboard');
    }

    protected static string $view = 'filament.pages.custom-dashboard';
    protected static ?string $slug = 'dashboard';
    protected static string $routePath = 'dashboard';

    // PAN Card Form Properties
    public $pan_name;
    public $pan_aadhar;
    public $pan_mobile;
    public $pan_photo;
    public $pan_signature;
    public $pan_aadhar_doc;
    public $pan_additional;
    public $showPaymentStep = false;
    public $payment_utr;

    // View Details Modal Property
    public $viewingPanRequestId = null;
    public $admin_slip_upload;
    public $admin_pan_pdf_upload;

    // Reject Remark
    public $rejectingPanId = null;
    public $reject_remark = '';

    // Phone to Aadhar Service Properties
    public $phone_to_aadhar_mobile = '';
    public $showPhoneToAadharModal = false;

    public function openRejectModal($id)
    {
        if(auth()->user() && auth()->user()->can('update_pan::request')) {
            $this->rejectingPanId = (int)$id;
            $this->reject_remark = '';
            $this->dispatch('open-reject-modal');
        }
    }

    public function confirmRejectPanRequest()
    {
        $this->validate(['reject_remark' => 'required|string|min:5'], [
            'reject_remark.required' => 'Please enter a reason for rejection.',
            'reject_remark.min' => 'Reason must be at least 5 characters.',
        ]);

        if(auth()->user() && auth()->user()->can('update_pan::request') && $this->rejectingPanId) {
            PanRequest::where('id', $this->rejectingPanId)->update([
                'status' => 'rejected',
                'admin_notes' => $this->reject_remark,
            ]);
            Notification::make()->title('Application Rejected')->danger()->send();
            $this->rejectingPanId = null;
            $this->reject_remark = '';
            $this->dispatch('close-reject-modal');
        }
    }

    public function viewPanDetails($id)
    {
        if(auth()->user() && auth()->user()->can('update_pan::request')) {
            $this->viewingPanRequestId = $id;
            $this->dispatch('open-view-pan-modal');
        }
    }

    public function closeViewPanModal()
    {
        $this->viewingPanRequestId = null;
        $this->reset(['admin_slip_upload', 'admin_pan_pdf_upload']);
        $this->dispatch('close-view-pan-modal');
    }

    public function saveAdminUploads()
    {
        if(auth()->user() && auth()->user()->can('update_pan::request') && $this->viewingPanRequestId) {
            $this->validate([
                'admin_slip_upload' => 'nullable|file|max:5120',
                'admin_pan_pdf_upload' => 'nullable|file|mimes:pdf|max:5120',
            ]);

            $record = PanRequest::find($this->viewingPanRequestId);
            if (!$record) return;

            if ($this->admin_slip_upload) {
                $record->slip_document = $this->admin_slip_upload->store('pan-slips', 'public');
            }
            if ($this->admin_pan_pdf_upload) {
                $record->final_pdf = $this->admin_pan_pdf_upload->store('pan-final-pdfs', 'public');
                $record->status = 'accepted';
            }
            
            $record->save();

            Notification::make()->title('Documents Uploaded Successfully')->success()->send();
            $this->closeViewPanModal();
        }
    }

    public function closePanModal()
    {
        $this->reset(['pan_name', 'pan_aadhar', 'pan_mobile', 'pan_photo', 'pan_signature', 'pan_aadhar_doc', 'pan_additional', 'showPaymentStep', 'payment_utr']);
        $this->dispatch('close-pan-modal');
    }

    public function initiatePanSubmit()
    {
        $this->validate([
            'pan_name' => 'required|string|max:255',
            'pan_aadhar' => 'required|string|max:12',
            'pan_mobile' => 'nullable|string|max:10',
            'pan_photo' => 'required|image|max:2048',
            'pan_signature' => 'required|image|max:2048',
            'pan_aadhar_doc' => 'required|file|max:5120',
            'pan_additional' => 'required|file|max:5120',
        ]);

        if (!auth()->user()->hasEnoughCoins(20)) {
            Notification::make()
                ->title('Insufficient Coins')
                ->body('You need at least 20 coins to apply for a PAN Card.')
                ->danger()
                ->send();
            return;
        }

        // Show QR code step
        $this->showPaymentStep = true;
    }

    public function confirmPanSubmit()
    {
        $this->validate([
            'payment_utr' => 'required|string|max:50',
        ], [
            'payment_utr.required' => 'Please enter the Transaction ID / UTR after making payment.'
        ]);

        if (!auth()->user()->hasEnoughCoins(20)) {
            return;
        }

        // Deduct 20 coins
        auth()->user()->deductCoins(
            20, 
            CoinTransaction::TYPE_SERVICE_DEDUCTION, 
            "PAN Card Application Fee - UTR: " . $this->payment_utr
        );

        $photoPath = $this->pan_photo->store('pan-documents', 'public');
        $signaturePath = $this->pan_signature->store('pan-documents', 'public');
        $aadharDocPath = $this->pan_aadhar_doc->store('pan-documents', 'public');
        $additionalPath = $this->pan_additional->store('pan-documents', 'public');

        PanRequest::create([
            'user_id' => auth()->id(),
            'name' => $this->pan_name,
            'aadhar_number' => $this->pan_aadhar,
            'mobile' => $this->pan_mobile,
            'photo' => $photoPath,
            'signature' => $signaturePath,
            'aadhar_card_doc' => $aadharDocPath,
            'additional_document' => $additionalPath,
            'status' => 'pending',
            'utr_number' => $this->payment_utr,
        ]);

        // Reset form
        $this->closePanModal();

        Notification::make()
            ->title('Application Submitted!')
            ->body('Your PAN Card application has been received successfully.')
            ->success()
            ->send();
    }

    public function submitPhoneToAadhar()
    {
        $this->validate([
            'phone_to_aadhar_mobile' => 'required|string|size:10',
        ], [
            'phone_to_aadhar_mobile.required' => 'Please enter a mobile number.',
            'phone_to_aadhar_mobile.size' => 'Mobile number must be exactly 10 digits.',
        ]);

        if (!auth()->user()->hasEnoughCoins(20)) {
            Notification::make()
                ->title('Insufficient Coins')
                ->body('You need at least 20 coins for this service.')
                ->danger()
                ->send();
            return;
        }

        // Deduct 20 coins
        auth()->user()->deductCoins(
            20, 
            \App\Models\CoinTransaction::TYPE_SERVICE_DEDUCTION, 
            "Phone to Aadhar Request - Mobile: " . $this->phone_to_aadhar_mobile
        );

        \App\Models\ServiceRequest::create([
            'user_id' => auth()->id(),
            'service_name' => 'Phone to Aadhar',
            'input_data' => ['mobile' => $this->phone_to_aadhar_mobile],
            'status' => 'pending',
        ]);

        $this->phone_to_aadhar_mobile = '';
        $this->dispatch('close-phone-aadhar-modal');

        Notification::make()
            ->title('Request Submitted!')
            ->body('Your Phone to Aadhar request has been received.')
            ->success()
            ->send();
    }

    public function approvePanRequest($id)
    {
        if(auth()->user() && auth()->user()->can('update_pan::request')) {
            PanRequest::where('id', $id)->update(['status' => 'accepted']);
            Notification::make()->title('Application Approved')->success()->send();
        }
    }

    public function rejectPanRequest($id)
    {
        if(auth()->user() && auth()->user()->can('update_pan::request')) {
            PanRequest::where('id', (int)$id)->update(['status' => 'rejected', 'admin_notes' => 'Rejected by admin']);
            Notification::make()->title('Application Rejected')->danger()->send();
        }
    }

    public function deletePanRequest($id)
    {
        if(auth()->user() && auth()->user()->can('delete_pan::request')) {
            PanRequest::where('id', $id)->delete();
            Notification::make()->title('Application Deleted')->success()->send();
        }
    }

    public function useService($serviceName, $url, $external = false)
    {
        $user = auth()->user();
        
        if ($external) {
            if (!$user->hasEnoughCoins(20)) {
                Notification::make()
                    ->title('Insufficient Coins')
                    ->body('You need at least 20 coins for this service.')
                    ->danger()
                    ->send();
                return;
            }

            $user->deductCoins(
                20, 
                CoinTransaction::TYPE_SERVICE_DEDUCTION, 
                "Used External Service: " . str_replace('<br>', ' ', $serviceName)
            );

            $this->dispatch('open-external-url', url: $url);
        } else {
            return redirect($url);
        }
    }

    protected function getViewData(): array
    {
        $user = auth()->user();
        $isAdmin = $user && $user->isAdmin();
        $userId = $user ? $user->id : null;

        return [
            'counts' => [
                'aadhar_update' => 0,
                'haryana_domicile' => $isAdmin ? HaryanaDomicile::count() : HaryanaDomicile::where('user_id', $userId)->count(),
                'birth_records' => $isAdmin ? BirthRecord::count() : BirthRecord::where('user_id', $userId)->count(),
                'pdf_converter' => $isAdmin ? PdfConverter::count() : PdfConverter::where('user_id', $userId)->count(),
                'pan_card' => $isAdmin ? PanRequest::count() : PanRequest::where('user_id', $userId)->count(),
                'service_requests' => $isAdmin ? \App\Models\ServiceRequest::where('status', 'pending')->count() : \App\Models\ServiceRequest::where('user_id', $userId)->count(),
            ],
            'my_pan_requests' => $isAdmin 
                ? PanRequest::orderBy('created_at', 'desc')->get() 
                : PanRequest::where('user_id', $userId)->orderBy('created_at', 'desc')->get(),
        ];
    }
}