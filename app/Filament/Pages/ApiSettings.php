<?php

namespace App\Filament\Pages;

use App\Models\Setting;
use Filament\Forms\Components\Section;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Form;
use Filament\Notifications\Notification;
use Filament\Pages\Page;
use Filament\Actions\Action;

class ApiSettings extends Page
{
    protected static ?string $navigationIcon = 'heroicon-o-key';
    protected static ?string $navigationLabel = 'API Settings';
    protected static ?string $title = 'API Configuration';
    protected static ?string $slug = 'api-settings';
    protected static ?string $navigationGroup = 'Settings';
    protected static ?int $navigationSort = 10;
    protected static string $view = 'filament.pages.api-settings';

    // ── IDCard.Store ─────────────────────────────────────────────────────────
    public string $idcard_store_api_key = '';

    // ── Nexus API ────────────────────────────────────────────────────────────
    public string $nexus_api_key = '';

    // ── CallMeBot WhatsApp ───────────────────────────────────────────────────
    public string $callmebot_phone = '';
    public string $callmebot_api_key = '';

    // ── PPP API ──────────────────────────────────────────────────────────────
    public string $ppp_api_key = '';
    public string $ppp_aadhar_to_ppp_url = '';
    public string $ppp_to_aadhar_url = '';
    public string $ppp_to_mobile_url = '';
    public string $ppp_to_bank_url = '';

    // ── Vahan API ────────────────────────────────────────────────────────────
    public string $vahan_api_key = '';
    public string $vahan_puc_without_otp_url = '';
    public string $vahan_puc_send_otp_url = '';
    public string $vahan_puc_verify_otp_url = '';

    // ── Voter API ────────────────────────────────────────────────────────────
    public string $voter_api_key = '';
    public string $voter_sir_voter_list_url = '';

    // ── PDF Editor API ───────────────────────────────────────────────────────
    public string $pdf_api_key = '';
    public string $pdf_editor_api_url = '';

    // ── Card Maker API ───────────────────────────────────────────────────────
    public string $card_maker_api_key = '';
    public string $card_maker_voter_card_url = '';
    public string $card_maker_aadhar_card_url = '';
    public string $card_maker_voter_address_change_url = '';

    // ── Aadhar Update API ────────────────────────────────────────────────────
    public string $aadhar_update_api_key = '';
    public string $aadhar_update_mobile_update_url = '';
    public string $aadhar_update_dob_change_url = '';
    public string $aadhar_update_surname_change_url = '';
    public string $aadhar_update_full_name_change_url = '';

    public static function canAccess(): bool
    {
        return auth()->check() && auth()->user()->type === 'admin';
    }

    public static function shouldRegisterNavigation(): bool
    {
        return auth()->check() && auth()->user()->type === 'admin';
    }

    public function mount(): void
    {
        // Load all values from DB settings (fallback to env/config)
        $this->idcard_store_api_key = Setting::get('idcard_store_api_key', config('services.idcard_store.api_key', ''));

        $this->nexus_api_key = Setting::get('nexus_api_key', config('services.nexus.api_key', ''));

        $this->callmebot_phone   = Setting::get('callmebot_phone', config('services.callmebot.phone', ''));
        $this->callmebot_api_key = Setting::get('callmebot_api_key', config('services.callmebot.api_key', ''));

        $this->ppp_api_key           = Setting::get('ppp_api_key', config('services.ppp.api_key', ''));
        $this->ppp_aadhar_to_ppp_url = Setting::get('ppp_aadhar_to_ppp_url', config('services.ppp.aadhar_to_ppp_url', ''));
        $this->ppp_to_aadhar_url     = Setting::get('ppp_to_aadhar_url', config('services.ppp.ppp_to_aadhar_url', ''));
        $this->ppp_to_mobile_url     = Setting::get('ppp_to_mobile_url', config('services.ppp.ppp_to_mobile_url', ''));
        $this->ppp_to_bank_url       = Setting::get('ppp_to_bank_url', config('services.ppp.ppp_to_bank_url', ''));

        $this->vahan_api_key              = Setting::get('vahan_api_key', config('services.vahan.api_key', ''));
        $this->vahan_puc_without_otp_url  = Setting::get('vahan_puc_without_otp_url', config('services.vahan.puc_without_otp_url', ''));
        $this->vahan_puc_send_otp_url     = Setting::get('vahan_puc_send_otp_url', config('services.vahan.puc_send_otp_url', ''));
        $this->vahan_puc_verify_otp_url   = Setting::get('vahan_puc_verify_otp_url', config('services.vahan.puc_verify_otp_url', ''));

        $this->voter_api_key           = Setting::get('voter_api_key', config('services.voter.api_key', ''));
        $this->voter_sir_voter_list_url = Setting::get('voter_sir_voter_list_url', config('services.voter.sir_voter_list_url', ''));

        $this->pdf_api_key        = Setting::get('pdf_api_key', config('services.pdf.api_key', ''));
        $this->pdf_editor_api_url = Setting::get('pdf_editor_api_url', config('services.pdf.editor_api_url', ''));

        $this->card_maker_api_key                   = Setting::get('card_maker_api_key', config('services.card_maker.api_key', ''));
        $this->card_maker_voter_card_url             = Setting::get('card_maker_voter_card_url', config('services.card_maker.voter_card_url', ''));
        $this->card_maker_aadhar_card_url            = Setting::get('card_maker_aadhar_card_url', config('services.card_maker.aadhar_card_url', ''));
        $this->card_maker_voter_address_change_url   = Setting::get('card_maker_voter_address_change_url', config('services.card_maker.voter_address_change_url', ''));

        $this->aadhar_update_api_key              = Setting::get('aadhar_update_api_key', config('services.aadhar_update.api_key', ''));
        $this->aadhar_update_mobile_update_url    = Setting::get('aadhar_update_mobile_update_url', config('services.aadhar_update.mobile_update_url', ''));
        $this->aadhar_update_dob_change_url       = Setting::get('aadhar_update_dob_change_url', config('services.aadhar_update.dob_change_url', ''));
        $this->aadhar_update_surname_change_url   = Setting::get('aadhar_update_surname_change_url', config('services.aadhar_update.surname_change_url', ''));
        $this->aadhar_update_full_name_change_url = Setting::get('aadhar_update_full_name_change_url', config('services.aadhar_update.full_name_change_url', ''));
    }

    public function saveAll(): void
    {
        // IDCard.Store
        Setting::set('idcard_store_api_key', trim($this->idcard_store_api_key));

        // Nexus
        Setting::set('nexus_api_key', trim($this->nexus_api_key));

        // CallMeBot
        Setting::set('callmebot_phone', trim($this->callmebot_phone));
        Setting::set('callmebot_api_key', trim($this->callmebot_api_key));

        // PPP
        Setting::set('ppp_api_key', trim($this->ppp_api_key));
        Setting::set('ppp_aadhar_to_ppp_url', trim($this->ppp_aadhar_to_ppp_url));
        Setting::set('ppp_to_aadhar_url', trim($this->ppp_to_aadhar_url));
        Setting::set('ppp_to_mobile_url', trim($this->ppp_to_mobile_url));
        Setting::set('ppp_to_bank_url', trim($this->ppp_to_bank_url));

        // Vahan
        Setting::set('vahan_api_key', trim($this->vahan_api_key));
        Setting::set('vahan_puc_without_otp_url', trim($this->vahan_puc_without_otp_url));
        Setting::set('vahan_puc_send_otp_url', trim($this->vahan_puc_send_otp_url));
        Setting::set('vahan_puc_verify_otp_url', trim($this->vahan_puc_verify_otp_url));

        // Voter
        Setting::set('voter_api_key', trim($this->voter_api_key));
        Setting::set('voter_sir_voter_list_url', trim($this->voter_sir_voter_list_url));

        // PDF Editor
        Setting::set('pdf_api_key', trim($this->pdf_api_key));
        Setting::set('pdf_editor_api_url', trim($this->pdf_editor_api_url));

        // Card Maker
        Setting::set('card_maker_api_key', trim($this->card_maker_api_key));
        Setting::set('card_maker_voter_card_url', trim($this->card_maker_voter_card_url));
        Setting::set('card_maker_aadhar_card_url', trim($this->card_maker_aadhar_card_url));
        Setting::set('card_maker_voter_address_change_url', trim($this->card_maker_voter_address_change_url));

        // Aadhar Update
        Setting::set('aadhar_update_api_key', trim($this->aadhar_update_api_key));
        Setting::set('aadhar_update_mobile_update_url', trim($this->aadhar_update_mobile_update_url));
        Setting::set('aadhar_update_dob_change_url', trim($this->aadhar_update_dob_change_url));
        Setting::set('aadhar_update_surname_change_url', trim($this->aadhar_update_surname_change_url));
        Setting::set('aadhar_update_full_name_change_url', trim($this->aadhar_update_full_name_change_url));

        Notification::make()
            ->title('✅ API Settings Saved!')
            ->body('Saari API settings successfully save ho gayi hain.')
            ->success()
            ->send();
    }

    protected function getFormActions(): array
    {
        return [];
    }
}
