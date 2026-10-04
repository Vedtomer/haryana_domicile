<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use Inertia\Inertia;

use App\Http\Controllers\HaryanaDomicileController;
use App\Http\Controllers\PdfCoordinateController;
use App\Http\Controllers\AuthController;

Route::get('/', function () {
    $services = \App\Models\Service::query()
        ->where('slug', '!=', 'haryana-domicile')
        ->where('name', 'not like', '%haryana domicile%')
        ->ordered()
        ->get()
        ->map(function (\App\Models\Service $service) {
            $isNew = ($service->created_at && $service->created_at->gt(now()->subDays(30)))
                || in_array($service->slug, ['qr-to-print', 'make-driving-licence-card', 'passport-maker', 'passport-apply', 'kundli-generator', 'mobile-to-info', 'bob-affidavit']);

            return [
                'id' => $service->id,
                'name' => $service->name,
                'slug' => $service->slug,
                'description' => $service->description,
                'icon' => $service->icon ?: '📄',
                'logo_url' => $service->logoUrl(),
                'coin_cost' => $service->coin_cost,
                'is_free' => $service->isFree(),
                'kind' => $service->kind,
                'is_premium' => (bool) $service->is_premium,
                'is_active' => (bool) $service->is_active,
                'is_new' => (bool) $isNew,
                'url' => $service->targetUrl(),
            ];
        });

    return Inertia::render('Frontend/Home', [
        'services' => $services,
    ]);
});

Route::get('/migrate-db', function () {
    try {
        $output = '';
        
        $output .= "=== GIT & ENVIRONMENT DIAGNOSTICS ===\n";
        $output .= "Base Path: " . base_path() . "\n";
        $output .= "Public Path: " . public_path() . "\n";
        $output .= "Document Root: " . ($_SERVER['DOCUMENT_ROOT'] ?? 'none') . "\n";
        $output .= "Server Outbound IP: " . trim((string) @file_get_contents('https://api.ipify.org')) . "\n";
        $output .= "Current Good API Key: " . (\App\Models\Setting::get('aadhar_to_mask_pan_api_key') ?: 'NOT SET') . "\n";
        $output .= "Git Log Before: " . trim((string) @shell_exec('git log -1 --oneline 2>&1')) . "\n";

        // Pull latest from GitHub directly
        $gitPullOutput = @shell_exec('git fetch origin main 2>&1 && git reset --hard origin/main 2>&1');
        $output .= "Git Reset Output: " . trim((string) $gitPullOutput) . "\n";
        $output .= "Git Log After: " . trim((string) @shell_exec('git log -1 --oneline 2>&1')) . "\n\n";

        \Illuminate\Support\Facades\Artisan::call('migrate', ['--force' => true]);
        $output .= "=== MIGRATE OUTPUT ===\n" . \Illuminate\Support\Facades\Artisan::output() . "\n";
        $output .= "=== TABLES CHECK ===\n";
        $output .= "wallets: " . (\Illuminate\Support\Facades\Schema::hasTable('wallets') ? 'EXISTS' : 'MISSING') . "\n";
        $output .= "payment_orders: " . (\Illuminate\Support\Facades\Schema::hasTable('payment_orders') ? 'EXISTS' : 'MISSING') . "\n";
        $output .= "wallet_transactions: " . (\Illuminate\Support\Facades\Schema::hasTable('wallet_transactions') ? 'EXISTS' : 'MISSING') . "\n\n";



        try {
            \Illuminate\Support\Facades\Artisan::call('db:seed', ['--class' => 'TenthPassbookSeeder', '--force' => true]);
            $output .= "=== TENTH PASSBOOK SEEDER ===\n" . \Illuminate\Support\Facades\Artisan::output() . "\n\n";
        } catch (\Throwable $se1) {
            $output .= "TenthPassbookSeeder Notice: " . $se1->getMessage() . "\n\n";
        }

        // Ensure PAN Card Manual Maker is in services table
        try {
            \App\Models\Service::updateOrCreate(
                ['slug' => 'pan-card-manual-maker'],
                [
                    'name' => 'PAN Card Manual Maker',
                    'description' => 'Generate and print authentic Income Tax PAN Card PVC with photo, signature, and QR code.',
                    'icon' => '💳',
                    'coin_cost' => 20,
                    'kind' => 'module',
                    'module_key' => 'pan_card_manual_maker',
                    'is_active' => true,
                    'visibility' => 'public',
                    'is_premium' => false,
                    'unlock_cost' => 0,
                    'sort_order' => 41,
                ]
            );
            $output .= "=== PAN CARD MANUAL MAKER UPSERTED ===\n\n";
        } catch (\Throwable $pe) {
            $output .= "PanCardManualMaker error: " . $pe->getMessage() . "\n\n";
        }

        // Ensure Courier & Parcel Slip Maker is in services table
        try {
            \App\Models\Service::updateOrCreate(
                ['slug' => 'courier-slip-maker'],
                [
                    'name' => 'Courier & Parcel Slip Maker',
                    'description' => 'Generate and print professional Courier / Parcel Dispatch Slips & Shipping Labels on A3, A4 or sticker size with From, To, Aadhaar, Barcode & QR Code.',
                    'icon' => '📦',
                    'coin_cost' => 5,
                    'kind' => 'module',
                    'module_key' => 'courier_slip_maker',
                    'is_active' => true,
                    'visibility' => 'public',
                    'is_premium' => false,
                    'unlock_cost' => 0,
                    'sort_order' => 45,
                ]
            );
            $output .= "=== COURIER & PARCEL SLIP MAKER UPSERTED ===\n\n";
        } catch (\Throwable $cpe) {
            $output .= "CourierSlipMaker error: " . $cpe->getMessage() . "\n\n";
        }

        // Ensure Aadhar To Check Ncpi Status is in services table
        try {
            \App\Models\Service::updateOrCreate(
                ['slug' => 'aadhar-to-npci-status'],
                [
                    'name' => 'Aadhar To Check Ncpi Status',
                    'description' => 'Check real-time Aadhaar to NPCI / DBT Bank Linking and seeding status with Bank Name, Active Status, Mobile & PAN.',
                    'icon' => '🏦',
                    'coin_cost' => 14,
                    'kind' => 'module',
                    'module_key' => 'aadhar_to_npci_status',
                    'is_active' => true,
                    'visibility' => 'public',
                    'is_premium' => false,
                    'unlock_cost' => 0,
                    'sort_order' => 46,
                ]
            );
            $output .= "=== AADHAR TO NPCI STATUS UPSERTED ===\n\n";
        } catch (\Throwable $npe) {
            $output .= "AadharToNpciStatus error: " . $npe->getMessage() . "\n\n";
        }

        // Ensure Aadhar To Name is updated with 19 coins in services table
        try {
            \App\Models\Service::updateOrCreate(
                ['slug' => 'aadhar-to-name'],
                [
                    'name' => 'Aadhar To Name',
                    'description' => 'Instantly retrieve beneficiary Name, local name and linked mobile number using 12-digit Aadhaar number.',
                    'icon' => '🪪',
                    'coin_cost' => 19,
                    'kind' => 'module',
                    'module_key' => 'aadhar_to_name',
                    'is_active' => true,
                    'visibility' => 'public',
                    'is_premium' => false,
                    'unlock_cost' => 0,
                    'sort_order' => 47,
                ]
            );
            \App\Models\Setting::set('aadhar_to_name_api_url', 'https://good-api-point.com/apis_partner/v1/aadhar_card_api/aadhar_to_name.php');
            \App\Models\Setting::set('nexus_aadhar_to_name_url', 'https://good-api-point.com/apis_partner/v1/aadhar_card_api/aadhar_to_name.php');
            \App\Models\Setting::set('aadhar_to_name_api_key', '9d55e89b7aeee35171f269af07b6013a3b83db637f04ace03dbc8566a4461815');
            $output .= "=== AADHAR TO NAME UPSERTED (URL: " . \App\Models\Setting::get('aadhar_to_name_api_url') . ") ===\n\n";
        } catch (\Throwable $ane) {
            $output .= "AadharToName error: " . $ane->getMessage() . "\n\n";
        }

        // Ensure Aadhar To Mask PAN is updated in services table
        try {
            \App\Models\Service::updateOrCreate(
                ['slug' => 'aadhar-to-mask-pan'],
                [
                    'name' => 'Aadhar To Mask PAN',
                    'description' => 'Instantly retrieve linked Masked PAN Card number using 12-digit Aadhaar number.',
                    'icon' => '💳',
                    'coin_cost' => 19,
                    'kind' => 'module',
                    'module_key' => 'aadhar_to_mask_pan',
                    'is_active' => true,
                    'visibility' => 'public',
                    'is_premium' => false,
                    'unlock_cost' => 0,
                    'sort_order' => 48,
                ]
            );
            \App\Models\Setting::set('aadhar_to_mask_pan_api_url', 'https://good-api-point.com/apis_partner/v1/aadhar_card_api/aadhar_to_mask_pan.php');
            \App\Models\Setting::set('nexus_aadhar_to_mask_pan_url', 'https://good-api-point.com/apis_partner/v1/aadhar_card_api/aadhar_to_mask_pan.php');
            \App\Models\Setting::set('aadhar_to_mask_pan_api_key', '9d55e89b7aeee35171f269af07b6013a3b83db637f04ace03dbc8566a4461815');
            \App\Models\Setting::set('aadhar_to_pan_api_url', 'https://good-api-point.com/apis_partner/v1/aadhar_card_api/aadhaar_to_unmasked_pan.php');
            \App\Models\Setting::set('nexus_aadhar_to_pan_url', 'https://good-api-point.com/apis_partner/v1/aadhar_card_api/aadhaar_to_unmasked_pan.php');
            \App\Models\Setting::set('aadhar_to_pan_api_key', '9d55e89b7aeee35171f269af07b6013a3b83db637f04ace03dbc8566a4461815');
            \App\Models\Setting::set('aadhar_to_npci_api_key', '9d55e89b7aeee35171f269af07b6013a3b83db637f04ace03dbc8566a4461815');
            \App\Models\Setting::set('goodapi_token_id', 'aad64221e95f917989f63acd377c94f9054c3d85378ae3f512e6b74e958a4b22');
            \App\Models\Setting::set('goodapi_api_key', '9d55e89b7aeee35171f269af07b6013a3b83db637f04ace03dbc8566a4461815');
            $output .= "=== AADHAR TO MASK PAN & UNMASKED PAN UPSERTED ===\n\n";
        } catch (\Throwable $ampe) {
            $output .= "AadharToMaskPan error: " . $ampe->getMessage() . "\n\n";
        }

        // Ensure Mobile To Pan is configured with 99 coins and Good-API-Point endpoint
        try {
            \App\Models\Service::updateOrCreate(
                ['slug' => 'mobile-to-pan'],
                [
                    'name' => 'Mobile To Pan No. Instant',
                    'description' => 'Get PAN Number instantly using Mobile Number, First Name, and Last Name.',
                    'icon' => 'find_in_page',
                    'coin_cost' => 99,
                    'kind' => 'module',
                    'module_key' => 'mobile_to_pan',
                    'is_active' => true,
                    'visibility' => 'public',
                    'is_premium' => false,
                    'unlock_cost' => 0,
                    'sort_order' => 16,
                ]
            );
            \App\Models\Setting::set('mobile_to_pan_api_url', 'https://good-api-point.com/apis_partner/v1/telecom_api/mobile_to_pan.php');
            \App\Models\Setting::set('nexus_mobile_to_pan_url', 'https://good-api-point.com/apis_partner/v1/telecom_api/mobile_to_pan.php');
            \App\Models\Setting::set('mobile_to_pan_api_key', '9d55e89b7aeee35171f269af07b6013a3b83db637f04ace03dbc8566a4461815');
            $output .= "=== MOBILE TO PAN UPSERTED (99 COINS, GOOD-API-POINT) ===\n\n";
        } catch (\Throwable $mtpe) {
            $output .= "MobileToPan error: " . $mtpe->getMessage() . "\n\n";
        }

        // Ensure Sim No. To Aadhar Number is configured as module pointing to AadharToInfo
        try {
            \App\Models\Service::updateOrCreate(
                ['slug' => 'mobile-no-to-aadhar-number'],
                [
                    'name' => 'Sim No. To Aadhar Number',
                    'description' => 'Enter 12-digit Aadhaar Number to retrieve all linked SIMs, mobile numbers, circle & address details.',
                    'icon' => 'sim_card',
                    'coin_cost' => 99,
                    'kind' => 'module',
                    'module_key' => 'mobile_no_to_aadhar_number',
                    'is_active' => true,
                    'visibility' => 'public',
                    'is_premium' => false,
                    'unlock_cost' => 0,
                    'sort_order' => 14,
                ]
            );
            \App\Models\Setting::set('aadhar_to_info_api_url', 'https://api.paanel.shop/api/gateway.php');
            \App\Models\Setting::set('aadhar_to_info_api_key', 'SamXverma');
            $output .= "=== SIM NO TO AADHAR NUMBER UPSERTED (GATEWAY READY) ===\n\n";
        } catch (\Throwable $sme) {
            $output .= "SimNoToAadhar error: " . $sme->getMessage() . "\n\n";
        }

        // Ensure Aadhar To Ration Find is configured with 39 coins
        try {
            \App\Models\Service::updateOrCreate(
                ['slug' => 'aadhar-to-ration'],
                [
                    'name' => 'Aadhar To Ration Find',
                    'description' => 'Enter 12-digit Aadhaar Number to find Ration Card Number, Member Details & download official Ration Card slip.',
                    'icon' => 'receipt_long',
                    'coin_cost' => 39,
                    'kind' => 'module',
                    'module_key' => 'aadhar_to_ration',
                    'is_active' => true,
                    'visibility' => 'public',
                    'is_premium' => false,
                    'unlock_cost' => 0,
                    'sort_order' => 50,
                ]
            );
            \App\Models\Setting::set('aadhar_to_ration_api_url', 'https://good-api-point.com/apis_partner/v1/ration_card_api/uid_to_ration_no.php');
            \App\Models\Setting::set('aadhar_to_ration_api_key', '9d55e89b7aeee35171f269af07b6013a3b83db637f04ace03dbc8566a4461815');
            $output .= "=== AADHAR TO RATION FIND UPSERTED (39 COINS) ===\n\n";
        } catch (\Throwable $atre) {
            $output .= "AadharToRation error: " . $atre->getMessage() . "\n\n";
        }

        // Ensure Ration Card PDF Download is configured with 19 coins
        try {
            \App\Models\Service::updateOrCreate(
                ['slug' => 'ration-card-pdf'],
                [
                    'name' => 'Ration Card PDF Download',
                    'description' => 'Enter Ration Card Number to download official NFSA & State PDS Ration Card PDF copy.',
                    'icon' => 'picture_as_pdf',
                    'coin_cost' => 19,
                    'kind' => 'module',
                    'module_key' => 'ration_card_pdf',
                    'is_active' => true,
                    'visibility' => 'public',
                    'is_premium' => false,
                    'unlock_cost' => 0,
                    'sort_order' => 51,
                ]
            );
            \App\Models\Setting::set('ration_card_pdf_api_url', 'https://good-api-point.com/apis_partner/v1/ration_card_api/ration_card_pdf.php');
            \App\Models\Setting::set('ration_card_pdf_api_key', '9d55e89b7aeee35171f269af07b6013a3b83db637f04ace03dbc8566a4461815');
            $output .= "=== RATION CARD PDF DOWNLOAD UPSERTED (19 COINS) ===\n\n";
        } catch (\Throwable $rcpe) {
            $output .= "RationCardPdf error: " . $rcpe->getMessage() . "\n\n";
        }

        // Ensure Ration to Aadhaar Find All State is configured with 119 coins
        try {
            \App\Models\Service::updateOrCreate(
                ['slug' => 'ration-to-aadhar-all-state'],
                [
                    'name' => 'Ration to Aadhaar Find All State',
                    'description' => 'Select State and enter Ration Card Number to retrieve all family members linked Aadhaar UID numbers.',
                    'icon' => 'badge',
                    'coin_cost' => 119,
                    'kind' => 'module',
                    'module_key' => 'ration_to_aadhar_all_state',
                    'is_active' => true,
                    'visibility' => 'public',
                    'is_premium' => false,
                    'unlock_cost' => 0,
                    'sort_order' => 52,
                ]
            );
            \App\Models\Setting::set('ration_to_aadhar_all_state_api_url', 'https://good-api-point.com/apis_partner/v1/ration_card_api/ration_to_uid_all.php');
            \App\Models\Setting::set('ration_to_aadhar_all_state_api_key', '9d55e89b7aeee35171f269af07b6013a3b83db637f04ace03dbc8566a4461815');
            $output .= "=== RATION TO AADHAAR ALL STATE UPSERTED (119 COINS) ===\n\n";
        } catch (\Throwable $rtae) {
            $output .= "RationToAadharAllState error: " . $rtae->getMessage() . "\n\n";
        }

        // Ensure Ration To Aadhar Find UP is configured with 99 coins
        try {
            \App\Models\Service::updateOrCreate(
                ['slug' => 'ration-to-aadhar-up'],
                [
                    'name' => 'Ration To Aadhar Find UP',
                    'description' => 'Enter Uttar Pradesh Ration Card Number to find all family members linked Aadhaar UID numbers.',
                    'icon' => 'verified_user',
                    'coin_cost' => 99,
                    'kind' => 'module',
                    'module_key' => 'ration_to_aadhar_up',
                    'is_active' => true,
                    'visibility' => 'public',
                    'is_premium' => false,
                    'unlock_cost' => 0,
                    'sort_order' => 53,
                ]
            );
            \App\Models\Setting::set('ration_to_aadhar_up_api_url', 'https://good-api-point.com/apis_partner/v1/ration_card_api/ration_to_uid_up.php');
            \App\Models\Setting::set('ration_to_aadhar_up_api_key', '9d55e89b7aeee35171f269af07b6013a3b83db637f04ace03dbc8566a4461815');
            $output .= "=== RATION TO AADHAAR UP UPSERTED (99 COINS) ===\n\n";
        } catch (\Throwable $rtue) {
            $output .= "RationToAadharUp error: " . $rtue->getMessage() . "\n\n";
        }

        // Ensure Pan Details Server 2 is configured with 19 coins
        try {
            \App\Models\Service::updateOrCreate(
                ['slug' => 'pan-details-server-2'],
                [
                    'name' => 'Pan Details Server 2',
                    'description' => 'Enter 10-character PAN Card number to verify instant PAN cardholder details, Father Name, DOB & Aadhaar link status.',
                    'icon' => 'badge',
                    'coin_cost' => 19,
                    'kind' => 'module',
                    'module_key' => 'pan_details_server_2',
                    'is_active' => true,
                    'visibility' => 'public',
                    'is_premium' => false,
                    'unlock_cost' => 0,
                    'sort_order' => 54,
                ]
            );
            \App\Models\Setting::set('pan_details_server2_api_url', 'https://good-api-point.com/apis_partner/v1/pan_card_api/pan_server2.php');
            \App\Models\Setting::set('nexus_pan_details_url', 'https://good-api-point.com/apis_partner/v1/pan_card_api/pan_server2.php');
            \App\Models\Setting::set('pan_details_server2_api_key', '9d55e89b7aeee35171f269af07b6013a3b83db637f04ace03dbc8566a4461815');
            $output .= "=== PAN DETAILS SERVER 2 UPSERTED (19 COINS) ===\n\n";
        } catch (\Throwable $pdse) {
            $output .= "PanDetailsServer2 error: " . $pdse->getMessage() . "\n\n";
        }

        // Ensure PAN Full Details is configured with 29 coins
        try {
            \App\Models\Service::updateOrCreate(
                ['slug' => 'pan-full-details'],
                [
                    'name' => 'PAN Full Details',
                    'description' => 'Enter 10-character PAN Card number to get complete cardholder profile, Father Name, DOB, Address, Mobile & Aadhaar link status.',
                    'icon' => 'fingerprint',
                    'coin_cost' => 29,
                    'kind' => 'module',
                    'module_key' => 'pan_full_details',
                    'is_active' => true,
                    'visibility' => 'public',
                    'is_premium' => false,
                    'unlock_cost' => 0,
                    'sort_order' => 55,
                ]
            );
            \App\Models\Setting::set('pan_full_details_api_url', 'https://good-api-point.com/apis_partner/v1/pan_card_api/pan_full_details.php');
            \App\Models\Setting::set('nexus_pan_full_details_url', 'https://good-api-point.com/apis_partner/v1/pan_card_api/pan_full_details.php');
            \App\Models\Setting::set('pan_full_details_api_key', '9d55e89b7aeee35171f269af07b6013a3b83db637f04ace03dbc8566a4461815');
            $output .= "=== PAN FULL DETAILS UPSERTED (29 COINS) ===\n\n";
        } catch (\Throwable $pfe) {
            $output .= "PanFullDetails error: " . $pfe->getMessage() . "\n\n";
        }

        try {
            \App\Models\Service::updateOrCreate(
                ['slug' => 'pan-to-aadhar-unmasked'],
                [
                    'name' => 'PAN To Aadhaar Unmasked Instant',
                    'description' => 'Get unmasked Aadhaar details instantly using PAN, Name and DOB.',
                    'icon' => 'badge',
                    'coin_cost' => 99,
                    'kind' => \App\Models\Service::KIND_MODULE,
                    'module_key' => 'pan_to_aadhar_unmasked',
                    'is_active' => true,
                    'visibility' => 'public',
                    'is_premium' => false,
                    'unlock_cost' => 0,
                    'sort_order' => 12,
                ]
            );
            \App\Models\Setting::set('pan_to_aadhar_api_url', 'https://good-api-point.com/apis_partner/v1/pan_card_api/pan_to_aadhar.php');
            \App\Models\Setting::set('nexus_pan_to_aadhar_url', 'https://good-api-point.com/apis_partner/v1/pan_card_api/pan_to_aadhar.php');
            \App\Models\Setting::set('pan_to_aadhar_api_key', '9d55e89b7aeee35171f269af07b6013a3b83db637f04ace03dbc8566a4461815');
            $output .= "=== PAN TO AADHAAR UNMASKED UPSERTED (99 COINS, GOOD-API-POINT) ===\n\n";
        } catch (\Throwable $pae) {
            $output .= "PanToAadhar error: " . $pae->getMessage() . "\n\n";
        }

        try {
            \App\Models\Service::updateOrCreate(
                ['slug' => 'pan-to-gst'],
                [
                    'name' => 'PAN To GST Number Instant',
                    'description' => 'Find all GST numbers, business legal names and registration details using PAN.',
                    'icon' => 'domain',
                    'coin_cost' => 19,
                    'kind' => \App\Models\Service::KIND_MODULE,
                    'module_key' => 'pan_to_gst',
                    'is_active' => true,
                    'visibility' => 'public',
                    'is_premium' => false,
                    'unlock_cost' => 0,
                    'sort_order' => 56,
                ]
            );
            \App\Models\Setting::set('pan_to_gst_api_url', 'https://good-api-point.com/apis_partner/v1/pan_card_api/pan_to_gst.php');
            \App\Models\Setting::set('pan_to_gst_api_key', '9d55e89b7aeee35171f269af07b6013a3b83db637f04ace03dbc8566a4461815');
            $output .= "=== PAN TO GST UPSERTED (19 COINS, GOOD-API-POINT) ===\n\n";
        } catch (\Throwable $pge) {
            $output .= "PanToGst error: " . $pge->getMessage() . "\n\n";
        }

        try {
            \App\Models\Service::updateOrCreate(
                ['slug' => 'pan-to-mask-aadhar'],
                [
                    'name' => 'PAN To Mask Aadhar',
                    'description' => 'Find linked masked Aadhaar card number using 10-character PAN Card number.',
                    'icon' => 'fingerprint',
                    'coin_cost' => 29,
                    'kind' => \App\Models\Service::KIND_MODULE,
                    'module_key' => 'pan_to_mask_aadhar',
                    'is_active' => true,
                    'visibility' => 'public',
                    'is_premium' => false,
                    'unlock_cost' => 0,
                    'sort_order' => 57,
                ]
            );
            \App\Models\Setting::set('pan_to_mask_uid_api_url', 'https://good-api-point.com/apis_partner/v1/pan_card_api/pan_to_mask_uid.php');
            \App\Models\Setting::set('pan_to_mask_uid_api_key', '9d55e89b7aeee35171f269af07b6013a3b83db637f04ace03dbc8566a4461815');
            $output .= "=== PAN TO MASK AADHAR UPSERTED (29 COINS, GOOD-API-POINT) ===\n\n";
        } catch (\Throwable $pme) {
            $output .= "PanToMaskAadhar error: " . $pme->getMessage() . "\n\n";
        }

        try {
            \App\Models\Service::updateOrCreate(
                ['slug' => 'pan-to-uid-advance'],
                [
                    'name' => 'Pan To Uid Advance Instant',
                    'description' => 'Get advanced UID details instantly using PAN.',
                    'icon' => 'fingerprint',
                    'coin_cost' => 199,
                    'kind' => \App\Models\Service::KIND_MODULE,
                    'module_key' => 'pan_to_uid_advance',
                    'is_active' => true,
                    'visibility' => 'public',
                    'is_premium' => false,
                    'unlock_cost' => 0,
                    'sort_order' => 13,
                ]
            );
            \App\Models\Setting::set('nexus_pan_to_uid_url', 'https://good-api-point.com/apis_partner/v1/pan_card_api/pan_to_uid_s1.php');
            \App\Models\Setting::set('pan_to_uid_api_url', 'https://good-api-point.com/apis_partner/v1/pan_card_api/pan_to_uid_s1.php');
            $output .= "=== PAN TO UID ADVANCE INSTANT UPSERTED (199 COINS, GOOD-API-POINT) ===\n\n";
        } catch (\Throwable $pue) {
            $output .= "PanToUid error: " . $pue->getMessage() . "\n\n";
        }

        try {
            \App\Models\Service::updateOrCreate(
                ['slug' => 'vehicle-challan-check'],
                [
                    'name' => 'Vehicle Challan Check',
                    'description' => 'Check traffic e-challan details, fine amount, and violation status by vehicle registration number.',
                    'icon' => 'receipt_long',
                    'coin_cost' => 14,
                    'kind' => \App\Models\Service::KIND_MODULE,
                    'module_key' => 'vehicle_challan_check',
                    'is_active' => true,
                    'visibility' => 'public',
                    'is_premium' => false,
                    'unlock_cost' => 0,
                    'sort_order' => 59,
                ]
            );
            \App\Models\Setting::set('vahan_challan_api_url', 'https://good-api-point.com/apis_partner/v1/vahan_service_api/challan_find.php');
            \App\Models\Setting::set('vahan_challan_api_key', '9d55e89b7aeee35171f269af07b6013a3b83db637f04ace03dbc8566a4461815');
            $output .= "=== VEHICLE CHALLAN CHECK UPSERTED (14 COINS, GOOD-API-POINT) ===\n\n";
        } catch (\Throwable $vce) {
            $output .= "VehicleChallan error: " . $vce->getMessage() . "\n\n";
        }

        // Ensure Learning Licence PDF is configured with Good-API-Point endpoint
        try {
            \App\Models\Setting::set('vahan_learning_licence_url', 'https://good-api-point.com/apis_partner/v1/vahan_service_api/learning_license_pdf.php');
            if (empty(\App\Models\Setting::get('vahan_learning_licence_key'))) {
                \App\Models\Setting::set('vahan_learning_licence_key', '9d55e89b7aeee35171f269af07b6013a3b83db637f04ace03dbc8566a4461815');
            }
            $output .= "=== LEARNING LICENCE PDF UPDATED (GOOD-API-POINT) ===\n\n";
        } catch (\Throwable $lle) {
            $output .= "LearningLicence error: " . $lle->getMessage() . "\n\n";
        }

        // Ensure all users have access to all active services
        try {
            $allActiveServiceIds = \App\Models\Service::where('is_active', true)->pluck('id')->all();
            foreach (\App\Models\User::all() as $eachUser) {
                $eachUser->services()->syncWithoutDetaching($allActiveServiceIds);
            }
            // Promote SAM account to super_admin so they have full access to Admin Config
            $samUsers = \App\Models\User::where('name', 'like', '%SAM%')
                ->orWhere('email', 'like', '%sam%')
                ->get();
            foreach ($samUsers as $su) {
                $su->type = 'super_admin';
                $su->save();
            }
            $output .= "=== ALL USERS SERVICES SYNCED & SAM PROMOTED TO SUPER_ADMIN ===\n\n";
        } catch (\Throwable $ue) {
            $output .= "User sync notice: " . $ue->getMessage() . "\n\n";
        }

        // Ensure necessary schema adjustments
        try {
            if (\Illuminate\Support\Facades\Schema::hasTable('rent_agreements') && !\Illuminate\Support\Facades\Schema::hasColumn('rent_agreements', 'second_party_aadhar')) {
                \Illuminate\Support\Facades\Schema::table('rent_agreements', function ($table) {
                    $table->string('second_party_aadhar', 50)->nullable()->after('second_party_name');
                });
            }

            $logoDir = storage_path('app/public/service-logos');
            if (!file_exists($logoDir)) {
                @mkdir($logoDir, 0777, true);
            }
        } catch (\Throwable $te) {
            $output .= "Schema notice: " . $te->getMessage() . "\n\n";
        }

        // Seed default services ONLY if they do not exist yet (never overwrite admin changes or deletions)
        try {
            $defaultServices = [
                [
                    'slug' => 'dhbvn-electricity-bill',
                    'name' => 'DHBVN Electricity Bill',
                    'description' => 'Dakshin Haryana Bijli Vitran Nigam (DHBVN) duplicate electricity bill instant PDF download.',
                    'icon' => '⚡',
                    'logo' => 'service-logos/Yh61ZFPQAAE2Rfl7Jy4V0Lp3qzOTlu44eKCJUYuq.jpg',
                    'coin_cost' => 0,
                    'kind' => 'module',
                    'module_key' => 'dhbvn_electricity_bill',
                    'is_active' => true,
                    'visibility' => 'private',
                    'is_premium' => false,
                    'unlock_cost' => 0,
                    'sort_order' => 0,
                ],
                [
                    'slug' => 'uhbvn-electricity-bill',
                    'name' => 'UHBVN Electricity Bill',
                    'description' => 'Uttar Haryana Bijli Vitran Nigam (UHBVN) duplicate electricity bill instant PDF download.',
                    'icon' => '⚡',
                    'logo' => 'service-logos/Yh61ZFPQAAE2Rfl7Jy4V0Lp3qzOTlu44eKCJUYuq.jpg',
                    'coin_cost' => 0,
                    'kind' => 'module',
                    'module_key' => 'uhbvn_electricity_bill',
                    'is_active' => true,
                    'visibility' => 'private',
                    'is_premium' => false,
                    'unlock_cost' => 0,
                    'sort_order' => 0,
                ],
                [
                    'slug' => 'birth-certificate',
                    'name' => 'Birth Certificate Name Add',
                    'description' => 'जन्म रिकार्ड में नाम जुड़वाने हेतु स्वंय सत्यापित घोषणा पत्र (Name Add Form & Records)',
                    'icon' => '📝',
                    'coin_cost' => 10,
                    'kind' => 'module',
                    'module_key' => 'birth_record',
                    'is_active' => true,
                    'visibility' => 'public',
                    'is_premium' => false,
                    'unlock_cost' => 0,
                    'sort_order' => 0,
                ],
                [
                    'slug' => 'birth-certificate-download',
                    'name' => 'Birth Certificate Document Merger',
                    'description' => 'पुराना जन्म प्रमाण पत्र और आधार कार्ड जोड़कर 1 सिंगल PDF बनाएं (Document Merger)',
                    'icon' => '👶',
                    'coin_cost' => 0,
                    'kind' => 'module',
                    'module_key' => 'birth_certificate_download',
                    'is_active' => true,
                    'visibility' => 'public',
                    'is_premium' => false,
                    'unlock_cost' => 0,
                    'sort_order' => 3,
                ],
                [
                    'slug' => 'rent-agreement',
                    'name' => 'Rent Agreement',
                    'description' => 'Official Rent Agreement Generator - Generate, edit and print authentic 2-page Rent Agreements with adhesive stamps and notary seals.',
                    'icon' => '📜',
                    'coin_cost' => 149,
                    'kind' => 'module',
                    'module_key' => 'rent_agreement',
                    'is_active' => true,
                    'visibility' => 'public',
                    'is_premium' => false,
                    'unlock_cost' => 0,
                    'sort_order' => 0,
                ],
                [
                    'slug' => 'bob-affidavit',
                    'name' => 'BOB Affidavit',
                    'description' => 'Bank of Baroda (BOB) Affidavit / Rent Agreement Generator - Generate, edit and print authentic 2-page documents with adhesive stamps and notary seals.',
                    'icon' => '📜',
                    'coin_cost' => 149,
                    'kind' => 'module',
                    'module_key' => 'rent_agreement',
                    'is_active' => true,
                    'visibility' => 'public',
                    'is_premium' => false,
                    'unlock_cost' => 0,
                    'sort_order' => 0,
                ],
                [
                    'slug' => 'aadhar-card-form',
                    'name' => 'Aadhar Card form',
                    'description' => 'Certificate for Aadhaar Enrolment / Update (Proof of Address) Form Generator',
                    'icon' => '🪪',
                    'coin_cost' => 9,
                    'kind' => 'module',
                    'module_key' => 'aadhar_card_form',
                    'is_active' => true,
                    'visibility' => 'public',
                    'is_premium' => false,
                    'unlock_cost' => 0,
                    'sort_order' => 1,
                ],
                [
                    'slug' => 'salary-slip',
                    'name' => 'Salary Slip',
                    'description' => 'Official Salary Slip Generator - Create, edit and print authentic Salary Slips.',
                    'icon' => '💼',
                    'coin_cost' => 99,
                    'kind' => 'module',
                    'module_key' => 'salary_slip',
                    'is_active' => true,
                    'visibility' => 'public',
                    'is_premium' => false,
                    'unlock_cost' => 0,
                    'sort_order' => 0,
                ],
                [
                    'slug' => 'resume-maker',
                    'name' => 'Resume / CV Maker',
                    'description' => 'Automated Professional Resume, CV & Bio-Data Generator - Create, customize and print authentic 1-page Resumes with photo.',
                    'icon' => '📄',
                    'coin_cost' => 20,
                    'kind' => 'module',
                    'module_key' => 'resume_maker',
                    'is_active' => true,
                    'visibility' => 'public',
                    'is_premium' => false,
                    'unlock_cost' => 0,
                    'sort_order' => 1,
                ],
                [
                    'slug' => 'udhyam-registration',
                    'name' => 'Udhyam Registration',
                    'description' => 'Official Udyam / MSME Certificate Registration - Business, Bank CSP, CSC & Cyber Cafe registration service.',
                    'icon' => '🏢',
                    'coin_cost' => 149,
                    'kind' => 'manual',
                    'module_key' => null,
                    'fields' => json_encode([
                        ['label' => 'Applicant Name', 'type' => 'text', 'required' => '1'],
                        ['label' => 'Aadhaar Number', 'type' => 'text', 'required' => '1'],
                        ['label' => 'PAN Card Number', 'type' => 'text', 'required' => '1'],
                        ['label' => 'Email Address', 'type' => 'email', 'required' => '1'],
                        ['label' => 'WhatsApp Mobile Number', 'type' => 'text', 'required' => '1'],
                        ['label' => 'Enterprise / Shop Name', 'type' => 'text', 'required' => '1'],
                    ]),
                    'is_active' => true,
                    'visibility' => 'public',
                    'is_premium' => false,
                    'unlock_cost' => 0,
                    'sort_order' => 50,
                ],
            ];

            foreach ($defaultServices as $def) {
                // If it already exists (even if trashed/deleted), do NOT overwrite or resurrect it!
                $existing = \Illuminate\Support\Facades\DB::table('services')
                    ->where('slug', $def['slug'])
                    ->first();

                if (!$existing) {
                    \Illuminate\Support\Facades\DB::table('services')->insert(array_merge($def, [
                        'fields' => $def['fields'] ?? null,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]));
                } else {
                    // Make sure it is active and has fields if empty
                    \Illuminate\Support\Facades\DB::table('services')
                        ->where('id', $existing->id)
                        ->update([
                            'is_active' => 1,
                            'fields' => $existing->fields ?: ($def['fields'] ?? null),
                        ]);
                }
            }
        } catch (\Throwable $seDefaults) {
            $output .= "Defaults notice: " . $seDefaults->getMessage() . "\n\n";
        }

        try {
            \Illuminate\Support\Facades\Cache::flush();
            \Illuminate\Support\Facades\Artisan::call('cache:clear');
            \Illuminate\Support\Facades\Artisan::call('config:clear');
            \Illuminate\Support\Facades\Artisan::call('view:clear');
            \Illuminate\Support\Facades\Artisan::call('route:clear');
            if (function_exists('opcache_reset')) {
                @opcache_reset();
            }
        } catch (\Throwable $ce) {}

        $output .= "=== ALL CACHES CLEARED ===\nDone.\n\n";

        $output .= "=== PATHS & BUILD SYNC ===\n";
        $srcBuild = public_path('build');
        $destBuild = base_path('build');

        if (file_exists($srcBuild)) {
            if (!file_exists($destBuild)) {
                @mkdir($destBuild, 0755, true);
            }
            if (!file_exists($destBuild . '/assets')) {
                @mkdir($destBuild . '/assets', 0755, true);
            }
            // Copy manifest unconditionally
            if (file_exists($srcBuild . '/manifest.json')) {
                @copy($srcBuild . '/manifest.json', $destBuild . '/manifest.json');
            }
            // Copy all assets unconditionally
            $copied = 0;
            foreach (glob($srcBuild . '/assets/*.*') as $file) {
                $targetFile = $destBuild . '/assets/' . basename($file);
                @copy($file, $targetFile);
                $copied++;
            }
            $output .= "Synced {$copied} assets from public/build to document root build!\n";
        }
        $output .= "Files now in base_path(build/assets): " . count(glob($destBuild . '/assets/*.*')) . "\n";

        // Sync images from public/images to document root images
        $srcImages = public_path('images');
        $destImages = base_path('images');
        if (file_exists($srcImages)) {
            if (!file_exists($destImages)) {
                @mkdir($destImages, 0755, true);
            }
            $imgCopied = 0;
            foreach (glob($srcImages . '/*.*') as $imgFile) {
                @copy($imgFile, $destImages . '/' . basename($imgFile));
                $imgCopied++;
            }
            $output .= "Synced {$imgCopied} images from public/images to document root images!\n";
        }

        \Illuminate\Support\Facades\Artisan::call('view:clear');
        \Illuminate\Support\Facades\Artisan::call('optimize:clear');
        if (function_exists('opcache_reset')) {
            @opcache_reset();
        }

        return "<div style='font-family:sans-serif;padding:30px;max-width:800px;margin:40px auto;background:#f0fdf4;border:2px solid #22c55e;border-radius:16px;color:#166534;'>"
            . "<h2 style='margin-top:0;'>✓ Database Migrated & Seeded Successfully!</h2>"
            . "<pre style='background:#111;color:#4ade80;padding:16px;border-radius:8px;overflow-x:auto;font-size:13px;'>" . htmlspecialchars($output) . "</pre>"
            . "<p><a href='/dashboard' style='background:#16a34a;color:white;padding:12px 24px;text-decoration:none;border-radius:8px;font-weight:bold;display:inline-block;margin-top:10px;'>Go to Dashboard &rarr;</a></p>"
            . "</div>";
    } catch (\Throwable $e) {
        return "<div style='font-family:sans-serif;padding:30px;max-width:800px;margin:40px auto;background:#fef2f2;border:2px solid #ef4444;border-radius:16px;color:#991b1b;'>"
            . "<h2 style='margin-top:0;'>✕ Migration Error:</h2>"
            . "<p><b>Message:</b> " . htmlspecialchars($e->getMessage()) . "</p>"
            . "<pre style='background:#111;color:#f87171;padding:16px;border-radius:8px;overflow-x:auto;font-size:12px;'>" . htmlspecialchars($e->getTraceAsString()) . "</pre>"
            . "</div>";
    }
});

Route::get('/set-goodapi-key', function (Request $request) {
    $key = trim($request->query('key', ''));
    if (empty($key)) {
        return "<div style='font-family:sans-serif;padding:30px;max-width:600px;margin:40px auto;background:#fef2f2;border:2px solid #ef4444;border-radius:12px;color:#991b1b;'>"
            . "<h2>✕ Key is missing</h2>"
            . "<p>Please pass your Good-API-Point API key in the URL like this:</p>"
            . "<p><code>https://cspjaankari.in/set-goodapi-key?key=YOUR_ACTUAL_KEY</code></p>"
            . "</div>";
    }
    \App\Models\Setting::set('aadhar_to_mask_pan_api_key', $key);
    \App\Models\Setting::set('aadhar_to_pan_api_key', $key);
    \App\Models\Setting::set('aadhar_to_name_api_key', $key);
    \App\Models\Setting::set('aadhar_to_npci_api_key', $key);
    \App\Models\Setting::set('goodapi_api_key', $key);
    \App\Models\Setting::set('nexus_api_key', $key);
    return "<div style='font-family:sans-serif;padding:30px;max-width:600px;margin:40px auto;background:#f0fdf4;border:2px solid #22c55e;border-radius:16px;color:#166534;'>"
        . "<h2>✓ Good-API-Point API Key Saved Successfully!</h2>"
        . "<p>Your API Key has been saved for:</p>"
        . "<ul>"
        . "<li><b>Aadhar To Mask PAN</b></li>"
        . "<li><b>Aadhar To Unmasked PAN</b></li>"
        . "<li><b>Aadhar To Name</b></li>"
        . "<li><b>Aadhar To NPCI Status</b></li>"
        . "</ul>"
        . "<p><a href='/utilities/aadhar-to-pan' style='display:inline-block;padding:12px 24px;background:#16a34a;color:#fff;border-radius:8px;text-decoration:none;font-weight:bold;'>Go To Aadhar To Pan &rarr;</a></p>"
        . "</div>";
});


Route::get('/force-add-service', function () {
    \App\Models\Service::updateOrCreate(
        ['slug' => 'aadhar-to-pan'],
        [
            'name' => 'Aadhar To Pan Unmasked Instant',
            'description' => 'Instantly find the unmasked PAN number linked to an Aadhaar number.',
            'icon' => '🔍',
            'coin_cost' => 69,
            'kind' => \App\Models\Service::KIND_MODULE,
            'module_key' => 'aadhar_to_pan',
            'sort_order' => 9,
            'is_active' => true,
            'visibility' => \App\Models\Service::VISIBILITY_PUBLIC,
            'is_premium' => false,
            'unlock_cost' => 0,
        ]
    );
    \App\Models\Service::updateOrCreate(
        ['slug' => 'saral-status'],
        [
            'name' => 'Saral Certificate Status',
            'description' => 'Check the status of any Saral Certificate using its reference number instantly.',
            'icon' => '📃',
            'coin_cost' => 0,
            'kind' => \App\Models\Service::KIND_MODULE,
            'module_key' => 'saral_status',
            'sort_order' => 10,
            'is_active' => true,
            'visibility' => \App\Models\Service::VISIBILITY_PUBLIC,
            'is_premium' => false,
            'unlock_cost' => 0,
        ]
    );
    \App\Models\Service::updateOrCreate(
        ['slug' => 'pan-to-aadhar-unmasked'],
        [
            'name' => 'PAN To Aadhaar Unmasked Instant',
            'description' => 'Get unmasked Aadhaar details instantly using PAN.',
            'icon' => 'badge',
            'coin_cost' => 99,
            'kind' => \App\Models\Service::KIND_MODULE,
            'module_key' => 'pan_to_aadhar_unmasked',
            'sort_order' => 12,
            'is_active' => true,
            'visibility' => \App\Models\Service::VISIBILITY_PUBLIC,
            'is_premium' => false,
            'unlock_cost' => 0,
        ]
    );
    \App\Models\Service::updateOrCreate(
        ['slug' => 'pan-to-uid-advance'],
        [
            'name' => 'Pan To Uid Advance Instant',
            'description' => 'Get advanced UID details instantly using PAN.',
            'icon' => 'fingerprint',
            'coin_cost' => 199,
            'kind' => \App\Models\Service::KIND_MODULE,
            'module_key' => 'pan_to_uid_advance',
            'sort_order' => 13,
            'is_active' => true,
            'visibility' => \App\Models\Service::VISIBILITY_PUBLIC,
            'is_premium' => false,
            'unlock_cost' => 0,
        ]
    );
    \App\Models\Service::updateOrCreate(
        ['slug' => 'aadhar-to-info'],
        [
            'name' => 'Aadhaar No. To Info',
            'description' => 'Find all linked mobile numbers, telecom circle, father name, and address from Aadhaar Number.',
            'icon' => 'contact_phone',
            'coin_cost' => 99,
            'kind' => \App\Models\Service::KIND_MODULE,
            'module_key' => 'aadhar_to_info',
            'sort_order' => 14,
            'is_active' => true,
            'visibility' => \App\Models\Service::VISIBILITY_PUBLIC,
            'is_premium' => false,
            'unlock_cost' => 0,
        ]
    );
    \App\Models\Service::updateOrCreate(
        ['slug' => 'learning-licence-pdf'],
        [
            'name' => 'Learning Licence Download',
            'description' => 'Download Learning Licence PDF instantly.',
            'icon' => 'directions_car',
            'coin_cost' => 19,
            'kind' => \App\Models\Service::KIND_MODULE,
            'module_key' => 'learning_licence_pdf',
            'sort_order' => 14,
            'is_active' => true,
            'visibility' => \App\Models\Service::VISIBILITY_PUBLIC,
            'is_premium' => false,
            'unlock_cost' => 0,
        ]
    );
    \App\Models\Service::updateOrCreate(
        ['slug' => 'voter-mobile-update'],
        [
            'name' => 'Voter Mobile Update Instant',
            'description' => 'Link mobile number to Voter ID (EPIC) instantly.',
            'icon' => 'contact_phone',
            'coin_cost' => 149,
            'kind' => \App\Models\Service::KIND_MODULE,
            'module_key' => 'voter_mobile_update',
            'sort_order' => 15,
            'is_active' => true,
            'visibility' => \App\Models\Service::VISIBILITY_PUBLIC,
            'is_premium' => false,
            'unlock_cost' => 0,
        ]
    );
    \App\Models\Service::updateOrCreate(
        ['slug' => 'mobile-to-pan'],
        [
            'name' => 'Mobile To Pan No. Instant',
            'description' => 'Get PAN Number instantly using Mobile Number, First Name, and Last Name.',
            'icon' => 'find_in_page',
            'coin_cost' => 99,
            'kind' => \App\Models\Service::KIND_MODULE,
            'module_key' => 'mobile_to_pan',
            'sort_order' => 16,
            'is_active' => true,
            'visibility' => \App\Models\Service::VISIBILITY_PUBLIC,
            'is_premium' => false,
            'unlock_cost' => 0,
        ]
    );
    \App\Models\Service::updateOrCreate(
        ['slug' => 'rc-pdf-instant'],
        [
            'name' => 'Rc Pdf Instant',
            'description' => 'Download Vehicle RC PDF instantly.',
            'icon' => 'local_shipping',
            'coin_cost' => 99,
            'kind' => \App\Models\Service::KIND_MODULE,
            'module_key' => 'rc_pdf_instant',
            'sort_order' => 17,
            'is_active' => true,
            'visibility' => \App\Models\Service::VISIBILITY_PUBLIC,
            'is_premium' => false,
            'unlock_cost' => 0,
        ]
    );

    $newServices = [
        [
            'name' => 'Aadhar Card to PPP ID Instant',
            'slug' => 'aadhar-to-ppp-id',
            'description' => 'Instantly retrieve Haryana Family ID (PPP ID) using 12-digit Aadhaar Number without OTP.',
            'icon' => '🆔',
            'coin_cost' => 0,
            'kind' => \App\Models\Service::KIND_MODULE,
            'module_key' => 'aadhar_to_ppp_id',
            'sort_order' => 31,
            'is_active' => true,
            'visibility' => \App\Models\Service::VISIBILITY_PUBLIC,
            'is_premium' => false,
            'unlock_cost' => 0,
        ],
        [
            'name' => 'PPP ID to Aadhar Number (All Members)',
            'slug' => 'ppp-to-aadhar-all-members',
            'description' => 'Fetch unmasked Aadhaar Card numbers of all family members from PPP ID without OTP.',
            'icon' => '👥',
            'coin_cost' => 20,
            'kind' => \App\Models\Service::KIND_MODULE,
            'module_key' => 'ppp_to_aadhar_all_members',
            'sort_order' => 32,
            'is_active' => true,
            'visibility' => \App\Models\Service::VISIBILITY_PUBLIC,
            'is_premium' => false,
            'unlock_cost' => 0,
        ],
        [
            'name' => 'PPP ID to Mobile Number (All Members)',
            'slug' => 'ppp-to-mobile-all-members',
            'description' => 'Fetch linked mobile numbers of all family members from PPP ID without OTP.',
            'icon' => '📱',
            'coin_cost' => 20,
            'kind' => \App\Models\Service::KIND_MODULE,
            'module_key' => 'ppp_to_mobile_all_members',
            'sort_order' => 33,
            'is_active' => true,
            'visibility' => \App\Models\Service::VISIBILITY_PUBLIC,
            'is_premium' => false,
            'unlock_cost' => 0,
        ],
        [
            'name' => 'PPP ID to Bank Account & IFSC Code',
            'slug' => 'ppp-to-bank-details',
            'description' => 'Fetch bank account numbers, IFSC codes, and branch details from PPP ID without OTP.',
            'icon' => '🏦',
            'coin_cost' => 20,
            'kind' => \App\Models\Service::KIND_MODULE,
            'module_key' => 'ppp_to_bank_details',
            'sort_order' => 34,
            'is_active' => true,
            'visibility' => \App\Models\Service::VISIBILITY_PUBLIC,
            'is_premium' => false,
            'unlock_cost' => 0,
        ],
        [
            'name' => 'PPP to Number',
            'slug' => 'ppp-to-number',
            'description' => 'Search registered mobile numbers by Family ID (PPP ID) & Official Haryana PPP Office Portal (https://ppp-office.haryana.gov.in/).',
            'icon' => '📱',
            'coin_cost' => 0,
            'kind' => \App\Models\Service::KIND_MODULE,
            'module_key' => 'ppp_to_number',
            'sort_order' => 35,
            'is_active' => true,
            'visibility' => \App\Models\Service::VISIBILITY_PUBLIC,
            'is_premium' => false,
            'unlock_cost' => 0,
        ],
        [
            'name' => 'Vehicle PUC (Without OTP)',
            'slug' => 'vehicle-puc-without-otp',
            'description' => 'Download Vehicle Pollution Under Control (PUC) certificate details instantly without OTP.',
            'icon' => '🚗',
            'coin_cost' => 20,
            'kind' => \App\Models\Service::KIND_MODULE,
            'module_key' => 'vehicle_puc_without_otp',
            'sort_order' => 35,
            'is_active' => true,
            'visibility' => \App\Models\Service::VISIBILITY_PUBLIC,
            'is_premium' => false,
            'unlock_cost' => 0,
        ],
        [
            'name' => 'Vehicle PUC (With OTP)',
            'slug' => 'vehicle-puc-with-otp',
            'description' => 'Verify with OTP and download official Vehicle PUC Certificate PDF.',
            'icon' => '🔐',
            'coin_cost' => 20,
            'kind' => \App\Models\Service::KIND_MODULE,
            'module_key' => 'vehicle_puc_with_otp',
            'sort_order' => 36,
            'is_active' => true,
            'visibility' => \App\Models\Service::VISIBILITY_PUBLIC,
            'is_premium' => false,
            'unlock_cost' => 0,
        ],
        [
            'name' => 'S.I.R Voter Card List',
            'slug' => 'sir-voter-card-list',
            'description' => 'Search electoral roll and voter card list by State, District, Assembly, or EPIC number.',
            'icon' => '🗳️',
            'coin_cost' => 20,
            'kind' => \App\Models\Service::KIND_MODULE,
            'module_key' => 'sir_voter_card_list',
            'sort_order' => 37,
            'is_active' => true,
            'visibility' => \App\Models\Service::VISIBILITY_PUBLIC,
            'is_premium' => false,
            'unlock_cost' => 0,
        ],
        [
            'name' => 'Voter Card Manual Maker',
            'slug' => 'voter-card-manual-maker',
            'description' => 'Create and customize manual Voter Card (EPIC) with photo, signature, and QR code.',
            'icon' => '🗳️',
            'coin_cost' => 20,
            'kind' => \App\Models\Service::KIND_MODULE,
            'module_key' => 'voter_card_manual_maker',
            'sort_order' => 39,
            'is_active' => true,
            'visibility' => \App\Models\Service::VISIBILITY_PUBLIC,
            'is_premium' => false,
            'unlock_cost' => 0,
        ],
        [
            'name' => 'Aadhar Card Manual',
            'slug' => 'aadhar-card-manual',
            'description' => 'Generate and customize manual Aadhaar Card with photo, QR code, and regional language details.',
            'icon' => '🆔',
            'coin_cost' => 25,
            'kind' => \App\Models\Service::KIND_MODULE,
            'module_key' => 'aadhar_card_manual',
            'sort_order' => 40,
            'is_active' => true,
            'visibility' => \App\Models\Service::VISIBILITY_PUBLIC,
            'is_premium' => false,
            'unlock_cost' => 0,
        ],
        [
            'name' => 'PAN Card Manual Maker',
            'slug' => 'pan-card-manual-maker',
            'description' => 'Generate and print authentic Income Tax PAN Card PVC with photo, signature, and QR code.',
            'icon' => '💳',
            'coin_cost' => 20,
            'kind' => \App\Models\Service::KIND_MODULE,
            'module_key' => 'pan_card_manual_maker',
            'sort_order' => 40,
            'is_active' => true,
            'visibility' => \App\Models\Service::VISIBILITY_PUBLIC,
            'is_premium' => false,
            'unlock_cost' => 0,
        ],
        [
            'name' => 'Courier & Parcel Slip Maker',
            'slug' => 'courier-slip-maker',
            'description' => 'Generate and print professional Courier / Parcel Dispatch Slips & Shipping Labels on A3, A4 or sticker size with From, To, Aadhaar, Barcode & QR Code.',
            'icon' => '📦',
            'coin_cost' => 5,
            'kind' => \App\Models\Service::KIND_MODULE,
            'module_key' => 'courier_slip_maker',
            'sort_order' => 45,
            'is_active' => true,
            'visibility' => \App\Models\Service::VISIBILITY_PUBLIC,
            'is_premium' => false,
            'unlock_cost' => 0,
        ],
        [
            'name' => 'Aadhar Card Mobile Number Update',
            'slug' => 'aadhar-mobile-update',
            'description' => 'Link or update mobile number on Aadhaar Card with instant acknowledgement receipt.',
            'icon' => '📱',
            'coin_cost' => 25,
            'kind' => \App\Models\Service::KIND_MODULE,
            'module_key' => 'aadhar_mobile_update',
            'sort_order' => 42,
            'is_active' => true,
            'visibility' => \App\Models\Service::VISIBILITY_PUBLIC,
            'is_premium' => false,
            'unlock_cost' => 0,
        ],
        [
            'name' => 'Aadhar Card DOB Change',
            'slug' => 'aadhar-dob-change',
            'description' => 'Apply for Date of Birth (DOB) correction on Aadhaar Card with supporting documents.',
            'icon' => '📅',
            'coin_cost' => 25,
            'kind' => \App\Models\Service::KIND_MODULE,
            'module_key' => 'aadhar_dob_change',
            'sort_order' => 43,
            'is_active' => true,
            'visibility' => \App\Models\Service::VISIBILITY_PUBLIC,
            'is_premium' => false,
            'unlock_cost' => 0,
        ],
        [
            'name' => 'Aadhar Card Surname Change',
            'slug' => 'aadhar-surname-change',
            'description' => 'Update or change surname/last name on Aadhaar Card after marriage or legal correction.',
            'icon' => '👤',
            'coin_cost' => 25,
            'kind' => \App\Models\Service::KIND_MODULE,
            'module_key' => 'aadhar_surname_change',
            'sort_order' => 44,
            'is_active' => true,
            'visibility' => \App\Models\Service::VISIBILITY_PUBLIC,
            'is_premium' => false,
            'unlock_cost' => 0,
        ],
        [
            'name' => 'Aadhar Card Full Name Change',
            'slug' => 'aadhar-full-name-change',
            'description' => 'Correct or update full legal name on Aadhaar Card with identity proof verification.',
            'icon' => '🪪',
            'coin_cost' => 25,
            'kind' => \App\Models\Service::KIND_MODULE,
            'module_key' => 'aadhar_full_name_change',
            'sort_order' => 45,
            'is_active' => true,
            'visibility' => \App\Models\Service::VISIBILITY_PUBLIC,
            'is_premium' => false,
            'unlock_cost' => 0,
        ],
    ];

    foreach ($newServices as $ns) {
        $srv = \App\Models\Service::updateOrCreate(['slug' => $ns['slug']], $ns);
    }

    return 'Services added successfully and made PUBLIC! Please go back to your dashboard.';
});

Route::get('/force-add-pvc-services', function () {
    $pvcServices = [
        [
            'name' => 'Smart PVC Card Maker',
            'slug' => 'pvc-card-maker',
            'description' => 'Generate Print-Ready PVC Front, Back & A4 Sheet from Haryana Family ID, Ayushman, Voter, PAN, e-Shram PDFs.',
            'icon' => '🪪',
            'coin_cost' => 20,
            'kind' => \App\Models\Service::KIND_MODULE,
            'module_key' => 'pvc_card_maker',
            'sort_order' => 14,
            'is_active' => true,
            'visibility' => \App\Models\Service::VISIBILITY_PUBLIC,
            'is_premium' => false,
            'unlock_cost' => 0,
        ],
        [
            'name' => 'Haryana Family ID PVC Card',
            'slug' => 'haryana-familyid-pvc',
            'description' => 'Generate Print-Ready PVC Front, Back & A4 Sheet from Haryana Family ID PDF.',
            'icon' => '🆔',
            'coin_cost' => 20,
            'kind' => \App\Models\Service::KIND_MODULE,
            'module_key' => 'haryana_familyid_pvc',
            'sort_order' => 15,
            'is_active' => true,
            'visibility' => \App\Models\Service::VISIBILITY_PUBLIC,
            'is_premium' => false,
            'unlock_cost' => 0,
        ],
        [
            'name' => 'Aadhaar PVC Card Maker',
            'slug' => 'aadhaar-pvc-card',
            'description' => 'Generate Print-Ready PVC Front & Back Card from e-Aadhaar PDF.',
            'icon' => '🔍',
            'coin_cost' => 20,
            'kind' => \App\Models\Service::KIND_MODULE,
            'module_key' => 'aadhaar_pvc',
            'sort_order' => 16,
            'is_active' => true,
            'visibility' => \App\Models\Service::VISIBILITY_PUBLIC,
            'is_premium' => false,
            'unlock_cost' => 0,
        ],
        [
            'name' => 'Ayushman Bharat PVC Card',
            'slug' => 'ayushman-pvc',
            'description' => 'Generate Print-Ready PVC Front & Back Card from Ayushman Golden Card PDF.',
            'icon' => '🏥',
            'coin_cost' => 20,
            'kind' => \App\Models\Service::KIND_MODULE,
            'module_key' => 'ayushman_pvc',
            'sort_order' => 17,
            'is_active' => true,
            'visibility' => \App\Models\Service::VISIBILITY_PUBLIC,
            'is_premium' => false,
            'unlock_cost' => 0,
        ],
        [
            'name' => 'Voter (E-EPIC) PVC Card',
            'slug' => 'voter-pvc-card',
            'description' => 'Generate Print-Ready PVC Front & Back Card from Voter e-EPIC PDF.',
            'icon' => '🗳️',
            'coin_cost' => 20,
            'kind' => \App\Models\Service::KIND_MODULE,
            'module_key' => 'voter_pvc',
            'sort_order' => 18,
            'is_active' => true,
            'visibility' => \App\Models\Service::VISIBILITY_PUBLIC,
            'is_premium' => false,
            'unlock_cost' => 0,
        ],
        [
            'name' => 'PAN Card (NSDL) PVC',
            'slug' => 'pan-nsdl-pvc',
            'description' => 'Generate Print-Ready PVC Front & Back Card from NSDL e-PAN PDF.',
            'icon' => '💳',
            'coin_cost' => 20,
            'kind' => \App\Models\Service::KIND_MODULE,
            'module_key' => 'pan_nsdl_pvc',
            'sort_order' => 19,
            'is_active' => true,
            'visibility' => \App\Models\Service::VISIBILITY_PUBLIC,
            'is_premium' => false,
            'unlock_cost' => 0,
        ],
        [
            'name' => 'e-Shram PVC Card Maker',
            'slug' => 'eshram-pvc-card',
            'description' => 'Generate Print-Ready PVC Front & Back Card from e-Shram PDF.',
            'icon' => '👷',
            'coin_cost' => 20,
            'kind' => \App\Models\Service::KIND_MODULE,
            'module_key' => 'eshram_pvc',
            'sort_order' => 22,
            'is_active' => true,
            'visibility' => \App\Models\Service::VISIBILITY_PUBLIC,
            'is_premium' => false,
            'unlock_cost' => 0,
        ],
        [
            'name' => 'Make Driving Licence (Cards)',
            'slug' => 'make-driving-licence-card',
            'description' => 'Generate Print-Ready PVC Front, Back & A4 Sheet from Driving Licence Number and Date of Birth.',
            'icon' => '🚗',
            'coin_cost' => 20,
            'kind' => \App\Models\Service::KIND_MODULE,
            'module_key' => 'make_driving_licence_card',
            'sort_order' => 23,
            'is_active' => true,
            'visibility' => \App\Models\Service::VISIBILITY_PUBLIC,
            'is_premium' => false,
            'unlock_cost' => 0,
        ],
        [
            'name' => 'ABHA Health ID PVC Card',
            'slug' => 'healthid-pvc',
            'description' => 'Generate Print-Ready PVC Front & Back Card from ABHA Health ID PDF.',
            'icon' => '🏥',
            'coin_cost' => 20,
            'kind' => \App\Models\Service::KIND_MODULE,
            'module_key' => 'healthid_pvc',
            'sort_order' => 24,
            'is_active' => true,
            'visibility' => \App\Models\Service::VISIBILITY_PUBLIC,
            'is_premium' => false,
            'unlock_cost' => 0,
        ],
        [
            'name' => 'PM Vishwakarma PVC Card',
            'slug' => 'pmvishwakarma-pvc',
            'description' => 'Generate Print-Ready PVC Front & Back Card from PM Vishwakarma PDF.',
            'icon' => '🛠️',
            'coin_cost' => 20,
            'kind' => \App\Models\Service::KIND_MODULE,
            'module_key' => 'pmvishwakarma_pvc',
            'sort_order' => 25,
            'is_active' => true,
            'visibility' => \App\Models\Service::VISIBILITY_PUBLIC,
            'is_premium' => false,
            'unlock_cost' => 0,
        ],
        [
            'name' => 'APAAR / Student ID PVC Card',
            'slug' => 'aapar-pvc',
            'description' => 'Generate Print-Ready PVC Front & Back Card from APAAR Student ID PDF.',
            'icon' => '🎓',
            'coin_cost' => 20,
            'kind' => \App\Models\Service::KIND_MODULE,
            'module_key' => 'aapar_pvc',
            'sort_order' => 26,
            'is_active' => true,
            'visibility' => \App\Models\Service::VISIBILITY_PUBLIC,
            'is_premium' => false,
            'unlock_cost' => 0,
        ],
    ];

    foreach ($pvcServices as $service) {
        \App\Models\Service::updateOrCreate(
            ['slug' => $service['slug']],
            $service
        );
    }

    \App\Models\Service::where('slug', 'aadhar-update')->delete();

    return 'PVC Card Maker services added successfully and made PUBLIC! Please check your dashboard.';
});

Route::get('/admin', function () {
    return redirect('/login');
});

Route::get('/login', [AuthController::class, 'showLogin'])->name('login')->middleware('guest');
Route::post('/login', [AuthController::class, 'login'])->middleware('guest');
Route::get('/captcha/refresh', [AuthController::class, 'refreshCaptcha'])->name('captcha.refresh')->middleware('throttle:30,1');
Route::get('/register', [AuthController::class, 'showRegister'])->name('register')->middleware('guest');
Route::post('/register/send-otp', [AuthController::class, 'sendOtp'])->name('register.send-otp')->middleware(['guest', 'throttle:6,1']);
Route::post('/register', [AuthController::class, 'register'])->middleware('guest');
Route::get('/forgot-password', [AuthController::class, 'showForgotPassword'])->name('password.request')->middleware('guest');
Route::post('/forgot-password/send-otp', [AuthController::class, 'sendForgotPasswordOtp'])->name('password.send-otp')->middleware(['guest', 'throttle:6,1']);
Route::post('/forgot-password/reset', [AuthController::class, 'resetPasswordWithOtp'])->name('password.reset.post')->middleware(['guest', 'throttle:6,1']);
Route::match(['get', 'post'], '/logout', [AuthController::class, 'logout'])->name('logout');

// Reactivation — no auth required (user is logged out)
Route::get('/reactivate', [\App\Http\Controllers\ReactivationController::class, 'show'])->name('reactivate.show');
Route::post('/reactivate', [\App\Http\Controllers\ReactivationController::class, 'store'])->name('reactivate.store');

    // Email Verification Routes (accessible when logged in, before email is verified)
    Route::middleware(['auth'])->group(function () {
        Route::get('/email/verify', [\App\Http\Controllers\EmailVerificationController::class, 'show'])->name('email.verify');
        Route::post('/email/send-otp', [\App\Http\Controllers\EmailVerificationController::class, 'sendOtp'])->name('email.send-otp')->middleware('throttle:6,1');
        Route::post('/email/verify', [\App\Http\Controllers\EmailVerificationController::class, 'verify'])->name('email.verify.post');
        Route::post('/email/update', [\App\Http\Controllers\EmailVerificationController::class, 'updateEmail'])->name('email.update')->middleware('throttle:6,1');
    });

    Route::middleware(['auth', 'verified.custom'])->group(function () {
        // 2FA Routes
        Route::get('/2fa/challenge', [\App\Http\Controllers\TwoFactorController::class, 'showChallenge'])->name('2fa.challenge');
        Route::post('/2fa/challenge', [\App\Http\Controllers\TwoFactorController::class, 'verifyChallenge'])->name('2fa.verify');
        Route::get('/2fa/setup', [\App\Http\Controllers\TwoFactorController::class, 'setup'])->name('2fa.setup');
        Route::post('/2fa/reset', [\App\Http\Controllers\TwoFactorController::class, 'resetSetup'])->name('2fa.reset');

        Route::get('/dashboard', [\App\Http\Controllers\DashboardController::class, 'index'])->name('dashboard');
        Route::get('/referrals', fn() => redirect('/admin/referrals'))->name('referrals');

        // Secure Wallet Add Money routes (Accessible to all authenticated users)
        Route::get('/wallet/add', [\App\Http\Controllers\Admin\CoinPurchaseRequestController::class, 'create'])->name('wallet.add');
        Route::post('/wallet/create-order', [\App\Http\Controllers\WalletPaymentController::class, 'createOrder'])->name('wallet.create-order');
        Route::post('/wallet/verify-payment', [\App\Http\Controllers\WalletPaymentController::class, 'verifyPayment'])->name('wallet.verify-payment');

        // License Purchase & Activation Routes
        Route::post('/license/buy', [\App\Http\Controllers\LicenseController::class, 'buy'])->name('license.buy');
        Route::post('/license/activate', [\App\Http\Controllers\LicenseController::class, 'activate'])->name('license.activate');

        // Account Switching Routes
        Route::post('/switch-account/login', [\App\Http\Controllers\SwitchAccountController::class, 'login'])->name('switch-account.login');
        Route::post('/switch-account/switch', [\App\Http\Controllers\SwitchAccountController::class, 'switch'])->name('switch-account.switch');
        Route::post('/switch-account/back-to-admin', [\App\Http\Controllers\SwitchAccountController::class, 'switchBackAdmin'])->name('switch-account.back-to-admin');
        Route::post('/switch-account/remove', [\App\Http\Controllers\SwitchAccountController::class, 'remove'])->name('switch-account.remove');
        Route::get('/switch-account/search-users', [\App\Http\Controllers\SwitchAccountController::class, 'searchUsers'])->name('switch-account.search-users');

        // Real-Time Online Presence & Chat Routes
        Route::post('/chat/heartbeat', [\App\Http\Controllers\ChatController::class, 'heartbeat'])->name('chat.heartbeat');
        Route::post('/user/update-location', [\App\Http\Controllers\UserLocationController::class, 'updateLocation'])->name('user.update-location');
        Route::get('/chat/unread-count', [\App\Http\Controllers\ChatController::class, 'getUnreadCount'])->name('chat.unread-count');
        Route::get('/chat/messages', [\App\Http\Controllers\ChatController::class, 'getUserChat'])->name('chat.user.messages');
        Route::post('/chat/send', [\App\Http\Controllers\ChatController::class, 'sendUserMessage'])->name('chat.user.send');

        // Real-Time Remote Screen Share Routes (User side)
        Route::get('/screen-share/incoming', [\App\Http\Controllers\ScreenShareController::class, 'checkIncoming'])->name('screen.incoming');
        Route::post('/screen-share/{session}/accept', [\App\Http\Controllers\ScreenShareController::class, 'acceptSession'])->name('screen.accept');
        Route::post('/screen-share/{session}/reject', [\App\Http\Controllers\ScreenShareController::class, 'rejectSession'])->name('screen.reject');
        Route::get('/screen-share/{session}/poll', [\App\Http\Controllers\ScreenShareController::class, 'pollUser'])->name('screen.user.poll');
        Route::post('/screen-share/{session}/candidate', [\App\Http\Controllers\ScreenShareController::class, 'sendCandidate'])->name('screen.candidate');
        Route::post('/screen-share/{session}/end', [\App\Http\Controllers\ScreenShareController::class, 'endSession'])->name('screen.end');

        // All portal services requiring active 6-Month license
        Route::middleware(['license.active'])->group(function () {
    
    Route::get('/utilities/ayushman-3lakh-income-make', function () {
        return Inertia::render('Utilities/Ayushman3LakhIncomeMake');
    })->name('utilities.ayushman-3lakh-income-make');

    // Birth Certificate Download
    Route::get('/utilities/birth-certificate', [\App\Http\Controllers\BirthCertificateDownloadController::class, 'index'])->name('utilities.birth-certificate');
    Route::post('/utilities/birth-certificate/search', [\App\Http\Controllers\BirthCertificateDownloadController::class, 'search'])->name('utilities.birth-certificate.search');
    Route::post('/utilities/birth-certificate/quick-generate', [\App\Http\Controllers\BirthCertificateDownloadController::class, 'quickGenerate'])->name('utilities.birth-certificate.quick-generate');
    Route::post('/utilities/birth-certificate/merge-documents', [\App\Http\Controllers\BirthCertificateDownloadController::class, 'mergeDocuments'])->name('utilities.birth-certificate.merge-documents');
    Route::get('/utilities/birth-certificate/download-merged/{serviceRequest}', [\App\Http\Controllers\BirthCertificateDownloadController::class, 'downloadMerged'])->name('utilities.birth-certificate.download-merged');
    Route::get('/utilities/birth-certificate/download', function (Request $request) {
        $regNo = trim($request->query('registration_no', ''));
        $color = $request->query('color', 'blue');
        $border = $request->query('border', '1');

        $record = \App\Models\BirthRecord::where('registration_no', $regNo)
            ->orWhere('id', $regNo)
            ->latest()
            ->first();

        if ($record) {
            return redirect()->route('birth-records.print', [
                'record' => $record->id,
                'color' => $color,
                'border' => $border,
                'auto' => 1,
            ]);
        }

        return redirect()->route('utilities.birth-certificate', ['reg_no' => $regNo])
            ->with('error', 'Birth Certificate not found with this number.');
    })->name('utilities.birth-certificate.download');

    Route::get('/utilities/crs-portal', function () {
        return redirect()->route('utilities.birth-certificate');
    });

    // DHBVN Electricity Bill
    Route::get('/utilities/dhbvn-electricity-bill', function () {
        return Inertia::render('Utilities/DhbvnElectricityBill');
    })->name('utilities.dhbvn-electricity-bill');

    Route::get('/utilities/dhbvn-electricity-bill/download', function (Request $request) {
        $uid = trim($request->query('uid', ''));
        if (!$uid) return response()->json(['error' => 'Account number is required'], 400);

        $baseUrl = trim(\App\Models\Setting::get('dhbvn_bill_url') ?: 'https://dhbvn.org.in/Rapdrp/BD?UID=');
        $url = str_contains($baseUrl, '{uid}') ? str_replace('{uid}', urlencode($uid), $baseUrl) : $baseUrl . urlencode($uid);
        try {
            $response = \Illuminate\Support\Facades\Http::withoutVerifying()
                ->timeout(15)
                ->get($url);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::warning("DHBVN bill fetch error for {$url}: " . $e->getMessage());
            return response()->json(['error' => 'Unable to connect to DHBVN portal'], 502);
        }

        if ($response && $response->successful() && (str_contains(strtolower($response->header('Content-Type', '')), 'pdf') || str_starts_with($response->body(), '%PDF'))) {
            $service = \App\Models\Service::where('slug', 'dhbvn-electricity-bill')->first();

            \App\Models\ServiceRequest::create([
                'user_id' => auth()->id(),
                'service_id' => $service ? $service->id : null,
                'service_name' => $service ? $service->name : 'DHBVN Electricity Bill',
                'input_data' => [
                    'Account Number (UID)' => $uid,
                    'Discom' => 'DHBVN',
                ],
                'coins_charged' => 0,
                'status' => \App\Models\ServiceRequest::STATUS_COMPLETED,
                'completed_at' => now(),
            ]);

            return response($response->body())
                ->header('Content-Type', 'application/pdf')
                ->header('Content-Disposition', 'attachment; filename="DHBVN_Bill_' . $uid . '.pdf"');
        }

        return response()->json(['error' => 'Bill not found on DHBVN for Account Number ' . $uid], 404);
    })->name('utilities.dhbvn-electricity-bill.download');

    // UHBVN Electricity Bill
    Route::get('/utilities/uhbvn-electricity-bill', function () {
        return Inertia::render('Utilities/UhbvnElectricityBill');
    })->name('utilities.uhbvn-electricity-bill');

    Route::get('/utilities/uhbvn-electricity-bill/download', function (Request $request) {
        $uid = trim($request->query('uid', ''));
        if (!$uid) return response()->json(['error' => 'Account number is required'], 400);

        $baseUrl = trim(\App\Models\Setting::get('uhbvn_bill_url') ?: 'https://uhbvn.org.in/Rapdrp/BD?UID=');
        $url = str_contains($baseUrl, '{uid}') ? str_replace('{uid}', urlencode($uid), $baseUrl) : $baseUrl . urlencode($uid);
        try {
            $response = \Illuminate\Support\Facades\Http::withoutVerifying()
                ->timeout(15)
                ->get($url);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::warning("UHBVN bill fetch error for {$url}: " . $e->getMessage());
            return response()->json(['error' => 'Unable to connect to UHBVN portal'], 502);
        }

        if ($response && $response->successful() && (str_contains(strtolower($response->header('Content-Type', '')), 'pdf') || str_starts_with($response->body(), '%PDF'))) {
            $service = \App\Models\Service::where('slug', 'uhbvn-electricity-bill')->first();

            \App\Models\ServiceRequest::create([
                'user_id' => auth()->id(),
                'service_id' => $service ? $service->id : null,
                'service_name' => $service ? $service->name : 'UHBVN Electricity Bill',
                'input_data' => [
                    'Account Number (UID)' => $uid,
                    'Discom' => 'UHBVN',
                ],
                'coins_charged' => 0,
                'status' => \App\Models\ServiceRequest::STATUS_COMPLETED,
                'completed_at' => now(),
            ]);

            return response($response->body())
                ->header('Content-Type', 'application/pdf')
                ->header('Content-Disposition', 'attachment; filename="UHBVN_Bill_' . $uid . '.pdf"');
        }

        return response()->json(['error' => 'Bill not found on UHBVN for Account Number ' . $uid], 404);
    })->name('utilities.uhbvn-electricity-bill.download');

    // Compatibility Routes
    Route::get('/utilities/dhbvn-bill', function () {
        return redirect()->route('utilities.dhbvn-electricity-bill');
    })->name('utilities.dhbvn-bill');

    Route::get('/utilities/uhbvn-bill', function () {
        return redirect()->route('utilities.uhbvn-electricity-bill');
    })->name('utilities.uhbvn-bill');

    Route::get('/utilities/electricity-bill', function (Request $request) {
        $discom = strtolower(trim($request->query('discom', '')));
        if ($discom === 'uhbvn') {
            return redirect()->route('utilities.uhbvn-electricity-bill');
        }
        return redirect()->route('utilities.dhbvn-electricity-bill');
    })->name('utilities.electricity-bill');

    Route::get('/utilities/electricity-bill/download', function (Request $request) {
        $discom = strtolower(trim($request->query('discom', 'dhbvn')));
        $uid = trim($request->query('uid', ''));
        if ($discom === 'uhbvn') {
            return redirect("/utilities/uhbvn-electricity-bill/download?uid={$uid}");
        }
        return redirect("/utilities/dhbvn-electricity-bill/download?uid={$uid}");
    })->name('utilities.electricity-bill.download');

    Route::get('/utilities/aadhar-to-family-id', function () {
        $service = \App\Models\Service::where('slug', 'aadhar-to-family-id')->first();
        $user = auth()->user();
        if ($service && $service->is_premium && !$user->isAdmin() && !$user->hasRole('super_admin') && !$service->users()->where('user_id', $user->id)->exists()) {
            return redirect('/dashboard')->with('error', 'Please unlock this premium service first.');
        }
        return Inertia::render('Utilities/AadharToFamilyId');
    })->name('utilities.aadhar-to-family-id');

    Route::post('/utilities/aadhar-to-family-id/search', [\App\Http\Controllers\AadharToFamilyIdController::class, 'search'])->name('utilities.aadhar-to-family-id.search');

    Route::get('/utilities/aadhar-to-name', function () {
        $service = \App\Models\Service::where('slug', 'aadhar-to-name')->first();
        $user = auth()->user();
        if ($service && $service->is_premium && !$user->isAdmin() && !$user->hasRole('super_admin') && !$service->users()->where('user_id', $user->id)->exists()) {
            return redirect('/dashboard')->with('error', 'Please unlock this premium service first.');
        }
        $isStaff = $user && ($user->isAdmin() || $user->hasRole('admin') || $user->hasRole('super_admin') || in_array($user->type, ['admin', 'super_admin']));
        return Inertia::render('Utilities/AadharToName', [
            'coinCost' => $service ? (int) $service->coin_cost : 19,
            'service' => $service,
            'isAdmin' => (bool) $isStaff,
            'apiUrl' => $isStaff ? \App\Models\Setting::get('aadhar_to_name_api_url', 'https://good-api-point.com/apis_partner/v1/aadhar_card_api/aadhar_to_name.php') : null,
            'apiKey' => $isStaff ? \App\Models\Setting::get('aadhar_to_name_api_key', \App\Models\Setting::get('aadhar_to_npci_api_key', \App\Models\Setting::get('nexus_api_key', '38cc07892c07c566e3ce1a3289c589e284954d7c0e593386'))) : null,
        ]);
    })->name('utilities.aadhar-to-name');

    Route::post('/utilities/aadhar-to-name/search', [\App\Http\Controllers\AadharToNameController::class, 'search'])->name('utilities.aadhar-to-name.search');
    Route::post('/utilities/aadhar-to-name/update-api', [\App\Http\Controllers\AadharToNameController::class, 'updateApi'])->name('utilities.aadhar-to-name.update-api');

    Route::get('/utilities/aadhar-to-npci-status', [\App\Http\Controllers\AadharToNpciController::class, 'index'])->name('utilities.aadhar-to-npci-status');
    Route::post('/utilities/aadhar-to-npci-status/search', [\App\Http\Controllers\AadharToNpciController::class, 'search'])->name('utilities.aadhar-to-npci-status.search');
    Route::post('/utilities/aadhar-to-npci-status/update-api', [\App\Http\Controllers\AadharToNpciController::class, 'updateApi'])->name('utilities.aadhar-to-npci-status.update-api');

    Route::get('/utilities/aadhar-to-info', function () {
        $service = \App\Models\Service::where('slug', 'aadhar-to-info')->first();
        $user = auth()->user();
        if ($service && $service->is_premium && !$user->isAdmin() && !$user->hasRole('super_admin') && !$service->users()->where('user_id', $user->id)->exists()) {
            return redirect('/dashboard')->with('error', 'Please unlock this premium service first.');
        }
        $isStaff = $user && ($user->isAdmin() || $user->hasRole('admin') || $user->hasRole('super_admin') || in_array($user->type, ['admin', 'super_admin']));

        return Inertia::render('Utilities/AadharToInfo', [
            'coinCost' => $service ? (int) $service->coin_cost : 99,
            'service' => $service,
            'isAdmin' => (bool) $isStaff,
            'apiUrl' => $isStaff ? \App\Models\Setting::get('aadhar_to_info_api_url', 'https://api.paanel.shop/api/gateway.php') : null,
            'apiKey' => $isStaff ? \App\Models\Setting::get('aadhar_to_info_api_key', 'SamXverma') : null,
        ]);
    })->name('utilities.aadhar-to-info');

    Route::post('/utilities/aadhar-to-info/search', [\App\Http\Controllers\AadharToInfoController::class, 'search'])->name('utilities.aadhar-to-info.search');
    Route::post('/utilities/aadhar-to-info/update-api', [\App\Http\Controllers\AadharToInfoController::class, 'updateApi'])->name('utilities.aadhar-to-info.update-api');
    Route::get('/utilities/aadhar-to-info/download-pdf', [\App\Http\Controllers\AadharToInfoController::class, 'downloadPdf'])->name('utilities.aadhar-to-info.download-pdf');
    Route::post('/utilities/aadhar-to-info/download-pdf', [\App\Http\Controllers\AadharToInfoController::class, 'downloadPdf'])->name('utilities.aadhar-to-info.download-pdf.post');

    Route::get('/utilities/mobile-no-to-aadhar-number', function () {
        $service = \App\Models\Service::where('slug', 'mobile-no-to-aadhar-number')->first()
            ?: \App\Models\Service::where('slug', 'aadhar-to-info')->first();
        $user = auth()->user();
        if ($service && $service->is_premium && !$user->isAdmin() && !$user->hasRole('super_admin') && !$service->users()->where('user_id', $user->id)->exists()) {
            return redirect('/dashboard')->with('error', 'Please unlock this premium service first.');
        }
        $isStaff = $user && ($user->isAdmin() || $user->hasRole('admin') || $user->hasRole('super_admin') || in_array($user->type, ['admin', 'super_admin']));

        return Inertia::render('Utilities/AadharToInfo', [
            'coinCost' => $service ? (int) $service->coin_cost : 99,
            'service' => $service,
            'isAdmin' => (bool) $isStaff,
            'apiUrl' => $isStaff ? \App\Models\Setting::get('aadhar_to_info_api_url', 'https://api.paanel.shop/api/gateway.php') : null,
            'apiKey' => $isStaff ? \App\Models\Setting::get('aadhar_to_info_api_key', 'SamXverma') : null,
        ]);
    })->name('utilities.mobile-no-to-aadhar-number');

    Route::post('/utilities/mobile-no-to-aadhar-number/search', [\App\Http\Controllers\AadharToInfoController::class, 'search'])->name('utilities.mobile-no-to-aadhar-number.search');

    Route::get('/utilities/bihar-ration-card-maker', [\App\Http\Controllers\BiharRationCardMakerController::class, 'index'])->name('utilities.bihar-ration-card-maker');
    Route::post('/utilities/bihar-ration-card-maker/deduct-coins', [\App\Http\Controllers\BiharRationCardMakerController::class, 'deductCoins'])->name('utilities.bihar-ration-card-maker.deduct-coins');

    Route::get('/utilities/pan-details-server-2', [\App\Http\Controllers\PanDetailsServer2Controller::class, 'index'])->name('utilities.pan-details-server-2');
    Route::post('/utilities/pan-details-server-2/search', [\App\Http\Controllers\PanDetailsServer2Controller::class, 'search'])->name('utilities.pan-details-server-2.search');
    Route::post('/utilities/pan-details-server-2/update-api', [\App\Http\Controllers\PanDetailsServer2Controller::class, 'updateApi'])->name('utilities.pan-details-server-2.update-api');

    Route::get('/utilities/pan-details-instant', function () {
        $service = \App\Models\Service::where('slug', 'pan-details-instant')->first();
        $user = auth()->user();
        if ($service && $service->is_premium && !$user->isAdmin() && !$user->hasRole('super_admin') && !$service->users()->where('user_id', $user->id)->exists()) {
            return redirect('/dashboard')->with('error', 'Please unlock this premium service first.');
        }
        return Inertia::render('Utilities/PanDetails');
    })->name('utilities.pan-details-instant');

    Route::post('/utilities/pan-details-instant/search', [\App\Http\Controllers\PanDetailsController::class, 'search'])->name('utilities.pan-details-instant.search');

    Route::get('/utilities/pan-full-details', [\App\Http\Controllers\PanFullDetailsController::class, 'index'])->name('utilities.pan-full-details');
    Route::post('/utilities/pan-full-details/search', [\App\Http\Controllers\PanFullDetailsController::class, 'search'])->name('utilities.pan-full-details.search');
    Route::post('/utilities/pan-full-details/update-api', [\App\Http\Controllers\PanFullDetailsController::class, 'updateApi'])->name('utilities.pan-full-details.update-api');

    Route::get('/utilities/pan-full-details-instant', [\App\Http\Controllers\PanFullDetailsController::class, 'index'])->name('utilities.pan-full-details-instant');
    Route::post('/utilities/pan-full-details-instant/search', [\App\Http\Controllers\PanFullDetailsController::class, 'search']);

    Route::get('/utilities/pan-to-aadhar-unmasked', [\App\Http\Controllers\PanToAadharController::class, 'index'])->name('utilities.pan-to-aadhar-unmasked');
    Route::post('/utilities/pan-to-aadhar-unmasked/search', [\App\Http\Controllers\PanToAadharController::class, 'search'])->name('utilities.pan-to-aadhar-unmasked.search');
    Route::post('/utilities/pan-to-aadhar-unmasked/update-api', [\App\Http\Controllers\PanToAadharController::class, 'updateApi'])->name('utilities.pan-to-aadhar-unmasked.update-api');

    Route::get('/utilities/pan-to-aadhar', [\App\Http\Controllers\PanToAadharController::class, 'index'])->name('utilities.pan-to-aadhar');
    Route::post('/utilities/pan-to-aadhar/search', [\App\Http\Controllers\PanToAadharController::class, 'search'])->name('utilities.pan-to-aadhar.search');
    Route::post('/utilities/pan-to-aadhar/update-api', [\App\Http\Controllers\PanToAadharController::class, 'updateApi'])->name('utilities.pan-to-aadhar.update-api');

    Route::get('/utilities/pan-to-gst', [\App\Http\Controllers\PanToGstController::class, 'index'])->name('utilities.pan-to-gst');
    Route::post('/utilities/pan-to-gst/search', [\App\Http\Controllers\PanToGstController::class, 'search'])->name('utilities.pan-to-gst.search');
    Route::post('/utilities/pan-to-gst/update-api', [\App\Http\Controllers\PanToGstController::class, 'updateApi'])->name('utilities.pan-to-gst.update-api');

    Route::get('/utilities/pan-to-mask-aadhar', [\App\Http\Controllers\PanToMaskAadharController::class, 'index'])->name('utilities.pan-to-mask-aadhar');
    Route::post('/utilities/pan-to-mask-aadhar/search', [\App\Http\Controllers\PanToMaskAadharController::class, 'search'])->name('utilities.pan-to-mask-aadhar.search');
    Route::post('/utilities/pan-to-mask-aadhar/update-api', [\App\Http\Controllers\PanToMaskAadharController::class, 'updateApi'])->name('utilities.pan-to-mask-aadhar.update-api');
    Route::get('/utilities/pan-to-mask-uid', fn() => redirect()->route('utilities.pan-to-mask-aadhar'));

    Route::get('/utilities/pan-to-uid-advance', function () {
        $service = \App\Models\Service::where('slug', 'pan-to-uid-advance')->first();
        $user = auth()->user();
        if ($service && $service->is_premium && !$user->isAdmin() && !$user->hasRole('super_admin') && !$service->users()->where('user_id', $user->id)->exists()) {
            return redirect('/dashboard')->with('error', 'Please unlock this premium service first.');
        }
        $coinCost = $service ? (int) $service->coin_cost : 199;
        $isStaff = $user && ($user->isAdmin() || $user->hasRole('admin') || $user->hasRole('super_admin') || in_array($user->type, ['admin', 'super_admin']));

        return Inertia::render('Utilities/PanToUid', [
            'service'  => $service,
            'coinCost' => $coinCost,
            'isAdmin'  => (bool) $isStaff,
            'apiUrl'   => $isStaff ? \App\Models\Setting::get('pan_to_uid_api_url', \App\Models\Setting::get('nexus_pan_to_uid_url', 'https://good-api-point.com/apis_partner/v1/pan_card_api/pan_to_uid_s1.php')) : null,
            'apiKey'   => $isStaff ? \App\Models\Setting::get('pan_to_uid_api_key', \App\Models\Setting::get('goodapi_api_key', '9d55e89b7aeee35171f269af07b6013a3b83db637f04ace03dbc8566a4461815')) : null,
        ]);
    })->name('utilities.pan-to-uid-advance');

    Route::post('/utilities/pan-to-uid-advance/search', [\App\Http\Controllers\PanToUidController::class, 'search'])->name('utilities.pan-to-uid-advance.search');
    Route::post('/utilities/pan-to-uid-advance/update-api', [\App\Http\Controllers\PanToUidController::class, 'updateApi'])->name('utilities.pan-to-uid-advance.update-api');

    Route::get('/utilities/learning-licence-pdf', [\App\Http\Controllers\LearningLicenceController::class, 'index'])->name('utilities.learning-licence-pdf');
    Route::get('/utilities/learning-license-pdf', [\App\Http\Controllers\LearningLicenceController::class, 'index'])->name('utilities.learning-license-pdf');
    Route::post('/utilities/learning-licence-pdf/search', [\App\Http\Controllers\LearningLicenceController::class, 'search'])->name('utilities.learning-licence-pdf.search');
    Route::post('/utilities/learning-licence-pdf/update-api', [\App\Http\Controllers\LearningLicenceController::class, 'updateApi'])->name('utilities.learning-licence-pdf.update-api');
    Route::post('/utilities/learning-licence-pdf/deduct-coins', [\App\Http\Controllers\LearningLicenceController::class, 'deductCoins'])->name('utilities.learning-licence-pdf.deduct-coins');

    Route::get('/utilities/voter-mobile-update', function () {
        $service = \App\Models\Service::where('slug', 'voter-mobile-update')->first();
        $user = auth()->user();
        if ($service && $service->is_premium && !$user->isAdmin() && !$user->hasRole('super_admin') && !$service->users()->where('user_id', $user->id)->exists()) {
            return redirect('/dashboard')->with('error', 'Please unlock this premium service first.');
        }
        return Inertia::render('Utilities/VoterMobileUpdate');
    })->name('utilities.voter-mobile-update');

    Route::post('/utilities/voter-mobile-update/search', [\App\Http\Controllers\VoterMobileUpdateController::class, 'search'])->name('utilities.voter-mobile-update.search');

    Route::get('/utilities/mobile-to-pan', [\App\Http\Controllers\MobileToPanController::class, 'index'])->name('utilities.mobile-to-pan');
    Route::post('/utilities/mobile-to-pan/search', [\App\Http\Controllers\MobileToPanController::class, 'search'])->name('utilities.mobile-to-pan.search');
    Route::post('/utilities/mobile-to-pan/update-api', [\App\Http\Controllers\MobileToPanController::class, 'updateApi'])->name('utilities.mobile-to-pan.update-api');

    Route::get('/utilities/mobile-to-info', [\App\Http\Controllers\MobileToInfoController::class, 'index'])->name('utilities.mobile-to-info');
    Route::post('/utilities/mobile-to-info/search', [\App\Http\Controllers\MobileToInfoController::class, 'search'])->name('utilities.mobile-to-info.search');
    Route::post('/utilities/mobile-to-info/update-api', [\App\Http\Controllers\MobileToInfoController::class, 'updateApi'])->name('utilities.mobile-to-info.update-api');

    Route::get('/utilities/rc-pdf-instant', function () {
        $service = \App\Models\Service::where('slug', 'rc-pdf-instant')->first();
        $user = auth()->user();
        if ($service && $service->is_premium && !$user->isAdmin() && !$user->hasRole('super_admin') && !$service->users()->where('user_id', $user->id)->exists()) {
            return redirect('/dashboard')->with('error', 'Please unlock this premium service first.');
        }
        return Inertia::render('Utilities/RcPdf');
    })->name('utilities.rc-pdf-instant');

    Route::post('/utilities/rc-pdf-instant/search', [\App\Http\Controllers\RcPdfController::class, 'search'])->name('utilities.rc-pdf-instant.search');

    Route::get('/utilities/aadhar-to-mask-pan', function () {
        $service = \App\Models\Service::where('slug', 'aadhar-to-mask-pan')->first();
        $user = auth()->user();
        if ($service && $service->is_premium && !$user->isAdmin() && !$user->hasRole('super_admin') && !$service->users()->where('user_id', $user->id)->exists()) {
            return redirect('/dashboard')->with('error', 'Please unlock this premium service first.');
        }
        $isStaff = $user && ($user->isAdmin() || $user->hasRole('admin') || $user->hasRole('super_admin') || in_array($user->type, ['admin', 'super_admin']));
        return Inertia::render('Utilities/AadharToMaskPan', [
            'coinCost' => $service ? (int) $service->coin_cost : 19,
            'service' => $service,
            'isAdmin' => (bool) $isStaff,
            'apiUrl' => $isStaff ? \App\Models\Setting::get('aadhar_to_mask_pan_api_url', 'https://good-api-point.com/apis_partner/v1/aadhar_card_api/aadhar_to_mask_pan.php') : null,
            'apiKey' => $isStaff ? \App\Models\Setting::get('aadhar_to_mask_pan_api_key', \App\Models\Setting::get('aadhar_to_name_api_key', \App\Models\Setting::get('aadhar_to_npci_api_key', \App\Models\Setting::get('nexus_api_key', '')))) : null,
        ]);
    })->name('utilities.aadhar-to-mask-pan');

    Route::post('/utilities/aadhar-to-mask-pan/search', [\App\Http\Controllers\AadharToMaskPanController::class, 'search'])->name('utilities.aadhar-to-mask-pan.search');
    Route::post('/utilities/aadhar-to-mask-pan/update-api', [\App\Http\Controllers\AadharToMaskPanController::class, 'updateApi'])->name('utilities.aadhar-to-mask-pan.update-api');

    Route::get('/utilities/aadhar-to-pan', function () {
        $service = \App\Models\Service::where('slug', 'aadhar-to-pan')->first();
        $user = auth()->user();
        if ($service && $service->is_premium && !$user->isAdmin() && !$user->hasRole('super_admin') && !$service->users()->where('user_id', $user->id)->exists()) {
            return redirect('/dashboard')->with('error', 'Please unlock this premium service first.');
        }
        $isStaff = $user && ($user->isAdmin() || $user->hasRole('admin') || $user->hasRole('super_admin') || in_array($user->type, ['admin', 'super_admin']));

        return Inertia::render('Utilities/AadharToPan', [
            'currentService' => $service,
            'coinCost' => $service ? (int) $service->coin_cost : 69,
            'isAdmin' => $isStaff,
            'apiUrl' => $isStaff ? \App\Models\Setting::get('aadhar_to_pan_api_url', \App\Models\Setting::get('nexus_aadhar_to_pan_url', 'https://good-api-point.com/apis_partner/v1/aadhar_card_api/aadhaar_to_unmasked_pan.php')) : null,
            'apiKey' => $isStaff ? \App\Models\Setting::get('aadhar_to_pan_api_key', \App\Models\Setting::get('aadhar_to_mask_pan_api_key', \App\Models\Setting::get('goodapi_api_key', ''))) : null,
        ]);
    })->name('utilities.aadhar-to-pan');

    Route::post('/utilities/aadhar-to-pan/search', [\App\Http\Controllers\AadharToPanController::class, 'search'])->name('utilities.aadhar-to-pan.search');
    Route::post('/utilities/aadhar-to-pan/update-api', [\App\Http\Controllers\AadharToPanController::class, 'updateApi'])->name('utilities.aadhar-to-pan.update-api');

    Route::get('/utilities/aadhar-to-ration', [\App\Http\Controllers\AadharToRationController::class, 'index'])->name('utilities.aadhar-to-ration');
    Route::post('/utilities/aadhar-to-ration/search', [\App\Http\Controllers\AadharToRationController::class, 'search'])->name('utilities.aadhar-to-ration.search');
    Route::post('/utilities/aadhar-to-ration/download-pdf', [\App\Http\Controllers\AadharToRationController::class, 'downloadPdf'])->name('utilities.aadhar-to-ration.download-pdf');
    Route::post('/utilities/aadhar-to-ration/update-api', [\App\Http\Controllers\AadharToRationController::class, 'updateApi'])->name('utilities.aadhar-to-ration.update-api');

    Route::get('/utilities/ration-card-pdf', [\App\Http\Controllers\RationCardPdfController::class, 'index'])->name('utilities.ration-card-pdf');
    Route::post('/utilities/ration-card-pdf/download', [\App\Http\Controllers\RationCardPdfController::class, 'download'])->name('utilities.ration-card-pdf.download');
    Route::post('/utilities/ration-card-pdf/update-api', [\App\Http\Controllers\RationCardPdfController::class, 'updateApi'])->name('utilities.ration-card-pdf.update-api');

    Route::get('/utilities/ration-to-aadhar-all-state', [\App\Http\Controllers\RationToAadharAllStateController::class, 'index'])->name('utilities.ration-to-aadhar-all-state');
    Route::post('/utilities/ration-to-aadhar-all-state/search', [\App\Http\Controllers\RationToAadharAllStateController::class, 'search'])->name('utilities.ration-to-aadhar-all-state.search');
    Route::post('/utilities/ration-to-aadhar-all-state/update-api', [\App\Http\Controllers\RationToAadharAllStateController::class, 'updateApi'])->name('utilities.ration-to-aadhar-all-state.update-api');

    Route::get('/utilities/ration-to-aadhar-up', [\App\Http\Controllers\RationToAadharUpController::class, 'index'])->name('utilities.ration-to-aadhar-up');
    Route::post('/utilities/ration-to-aadhar-up/search', [\App\Http\Controllers\RationToAadharUpController::class, 'search'])->name('utilities.ration-to-aadhar-up.search');
    Route::post('/utilities/ration-to-aadhar-up/update-api', [\App\Http\Controllers\RationToAadharUpController::class, 'updateApi'])->name('utilities.ration-to-aadhar-up.update-api');

    Route::get('/utilities/saral-status', function () {
        $service = \App\Models\Service::where('slug', 'saral-status')->first();
        $user = auth()->user();
        if ($service && $service->is_premium && !$user->isAdmin() && !$user->hasRole('super_admin') && !$service->users()->where('user_id', $user->id)->exists()) {
            return redirect('/dashboard')->with('error', 'Please unlock this premium service first.');
        }
        return Inertia::render('Utilities/SaralStatus');
    })->name('utilities.saral-status');

    Route::post('/utilities/saral-status/search', [\App\Http\Controllers\SaralStatusController::class, 'search'])->name('utilities.saral-status.search');

    Route::get('/utilities/aadhaar-services', function () {
        $service = \App\Models\Service::where('slug', 'aadhaar-services')->first();
        $user = auth()->user();
        if ($service && $service->is_premium && !$user->isAdmin() && !$user->hasRole('super_admin') && !$service->users()->where('user_id', $user->id)->exists()) {
            return redirect('/dashboard')->with('error', 'Please unlock this premium service first.');
        }
        return Inertia::render('Utilities/AadhaarServices');
    })->name('utilities.aadhaar-services');

    Route::get('/utilities/pdf-resizer', function () {
        $service = \App\Models\Service::where('slug', 'pdf-resizer')->first();
        $user = auth()->user();
        if ($service && $service->is_premium && !$user->isAdmin() && !$user->hasRole('super_admin') && !$service->users()->where('user_id', $user->id)->exists()) {
            return redirect('/dashboard')->with('error', 'Please unlock this premium service first.');
        }
        return Inertia::render('Utilities/PdfResizer');
    })->name('utilities.pdf-resizer');

    Route::get('/utilities/photo-signature-resizer', function () {
        return Inertia::render('Utilities/PhotoSignatureResizer');
    })->name('utilities.photo-signature-resizer');

    Route::get('/utilities/customer-whatsapp', function () {
        return Inertia::render('Utilities/CustomerWhatsAppSender');
    })->name('utilities.customer-whatsapp');

    Route::get('/utilities/legal-affidavits', function () {
        return Inertia::render('Utilities/LegalAffidavitMaker');
    })->name('utilities.legal-affidavits');

    Route::get('/utilities/khata-tracker', [\App\Http\Controllers\CyberCafeKhataController::class, 'index'])->name('utilities.khata-tracker');
    Route::post('/utilities/khata-tracker/khata', [\App\Http\Controllers\CyberCafeKhataController::class, 'storeKhata'])->name('utilities.khata-tracker.store-khata');
    Route::put('/utilities/khata-tracker/khata/{khata}', [\App\Http\Controllers\CyberCafeKhataController::class, 'updateKhata'])->name('utilities.khata-tracker.update-khata');
    Route::delete('/utilities/khata-tracker/khata/{khata}', [\App\Http\Controllers\CyberCafeKhataController::class, 'destroyKhata'])->name('utilities.khata-tracker.destroy-khata');
    Route::post('/utilities/khata-tracker/expense', [\App\Http\Controllers\CyberCafeKhataController::class, 'storeExpense'])->name('utilities.khata-tracker.store-expense');
    Route::delete('/utilities/khata-tracker/expense/{expense}', [\App\Http\Controllers\CyberCafeKhataController::class, 'destroyExpense'])->name('utilities.khata-tracker.destroy-expense');

    Route::get('/utilities/vehicle-to-mobile', function () {
        $service = \App\Models\Service::where('slug', 'vehicle-to-mobile')->first();
        return Inertia::render('Utilities/VehicleToMobile');
    })->name('utilities.vehicle-to-mobile');

    Route::post('/utilities/vehicle-to-mobile/search', [\App\Http\Controllers\VehicleToMobileController::class, 'search'])->name('utilities.vehicle-to-mobile.search');

    Route::get('/utilities/vehicle-challan-check', [\App\Http\Controllers\VehicleChallanController::class, 'index'])->name('utilities.vehicle-challan-check');
    Route::post('/utilities/vehicle-challan-check/search', [\App\Http\Controllers\VehicleChallanController::class, 'search'])->name('utilities.vehicle-challan-check.search');
    Route::post('/utilities/vehicle-challan-check/update-api', [\App\Http\Controllers\VehicleChallanController::class, 'updateApi'])->name('utilities.vehicle-challan-check.update-api');
    Route::get('/utilities/challan-check', fn() => redirect()->route('utilities.vehicle-challan-check'));
    Route::get('/utilities/challan-find', fn() => redirect()->route('utilities.vehicle-challan-check'));

    Route::get('/utilities/verify-ifsc-code', [\App\Http\Controllers\IfscVerificationController::class, 'index'])->name('utilities.verify-ifsc-code');
    Route::post('/utilities/verify-ifsc-code/verify', [\App\Http\Controllers\IfscVerificationController::class, 'verify'])->name('utilities.verify-ifsc-code.verify');

    Route::get('/utilities/passport-maker', [\App\Http\Controllers\PassportMakerController::class, 'index'])->name('utilities.passport-maker');
    Route::post('/utilities/passport-maker/deduct-coins', [\App\Http\Controllers\PassportMakerController::class, 'deductCoins'])->name('utilities.passport-maker.deduct-coins');

    // Passport Apply Service
    Route::get('/utilities/passport-apply', [\App\Http\Controllers\PassportApplyController::class, 'index'])->name('utilities.passport-apply');
    Route::post('/utilities/passport-apply', [\App\Http\Controllers\PassportApplyController::class, 'store'])->name('utilities.passport-apply.store');
    Route::get('/utilities/passport-apply/pincode/{pincode}', [\App\Http\Controllers\PassportApplyController::class, 'pincodeLookup'])->name('utilities.passport-apply.pincode');

    // IDCard Store Smart PVC Card Maker
    Route::get('/utilities/pvc-card-maker', [\App\Http\Controllers\PvcCardMakerController::class, 'index'])->name('utilities.pvc-card-maker');
    Route::post('/utilities/pvc-card-maker/generate', [\App\Http\Controllers\PvcCardMakerController::class, 'generate'])->name('utilities.pvc-card-maker.generate');
    Route::post('/utilities/pvc-card-maker/save-api-key', [\App\Http\Controllers\PvcCardMakerController::class, 'saveApiKey'])->name('utilities.pvc-card-maker.save-api-key');
    Route::get('/utilities/download-card-asset', [\App\Http\Controllers\PvcCardMakerController::class, 'downloadAsset'])->name('utilities.download-card-asset');

    // Make Driving Licence (Cards)
    Route::get('/utilities/make-driving-licence-card', [\App\Http\Controllers\DrivingLicenceCardController::class, 'index'])->name('utilities.make-driving-licence-card');
    Route::post('/utilities/make-driving-licence-card/generate', [\App\Http\Controllers\DrivingLicenceCardController::class, 'generate'])->name('utilities.make-driving-licence-card.generate');
    Route::get('/utilities/driving-licence-card', function () {
        return redirect()->route('utilities.make-driving-licence-card');
    });

    // Kundli Generator (Janam Kundli)
    Route::get('/utilities/kundli', [\App\Http\Controllers\KundliController::class, 'index'])->name('utilities.kundli');
    Route::post('/utilities/kundli/generate', [\App\Http\Controllers\KundliController::class, 'generate'])->name('utilities.kundli.generate');
    Route::get('/utilities/kundli/cities', [\App\Http\Controllers\KundliController::class, 'searchCities'])->name('utilities.kundli.cities');
    Route::get('/utilities/kundli/download', [\App\Http\Controllers\KundliController::class, 'downloadAsset'])->name('utilities.kundli.download');

    Route::get('/utilities/vehicle-details', function () {
        return Inertia::render('Utilities/VehicleDetails');
    })->name('utilities.vehicle-details');

    Route::get('/utilities/vehicle-details/download', function (Request $request) {
        $service = \App\Models\Service::where('slug', 'vehicle-details')->first();
        $user = auth()->user();
        
        $regNo = $request->query('reg_no');
        if (!$regNo) return back()->with('error', 'Vehicle Registration Number is required');

        $coinCost = $service ? $service->coin_cost : 20; // Default to 20 if service not found
        if ($user->coins < $coinCost && !$user->isAdmin() && !$user->hasRole('super_admin')) {
            return back()->with('error', "Insufficient coins. This service requires {$coinCost} coins.");
        }

        $cleanRegNo = strtoupper(trim(str_replace([' ', '-'], '', $regNo)));
        $baseUrl = trim(\App\Models\Setting::get('vehicle_details_api_url') ?: 'https://api.paanel.shop/api/gateway.php');
        $apiKey = trim(\App\Models\Setting::get('vehicle_details_api_key') ?: 'SamXverma');

        if (str_contains($baseUrl, '{key}') || str_contains($baseUrl, '{Policy}') || str_contains($baseUrl, '{reg_no}')) {
            $url = str_replace(
                ['{key}', '{Policy}', '{reg_no}', '{vehicle_number}'],
                [urlencode($apiKey), urlencode($cleanRegNo), urlencode($cleanRegNo), urlencode($cleanRegNo)],
                $baseUrl
            );
        } else {
            $separator = str_contains($baseUrl, '?') ? '&' : '?';
            $url = $baseUrl . $separator . "key=" . urlencode($apiKey) . "&Policy=" . urlencode($cleanRegNo);
        }
        $response = \Illuminate\Support\Facades\Http::connectTimeout(10)->timeout(30)->get($url);

        if ($response->successful()) {
            $json = $response->json();
            $rawData = $json['data'] ?? [];
            $data = $rawData['meta_data']['signzy_response']['result'] ?? $rawData;

            $regFound = $data['regNo'] ?? $data['vehicleNumber'] ?? $rawData['registration_number'] ?? $rawData['vehicle_details']['registration_no'] ?? null;

            if ($regFound) {
                $data['regNo'] = $data['regNo'] ?? $regFound;
                $data['vehicleClass'] = $data['vehicleClass'] ?? ($data['class'] ?? ($rawData['vehicle_details']['vehicle_category_description'] ?? 'Motor Car(LMV)'));
                $data['owner'] = !empty($data['owner']) ? $data['owner'] : ($rawData['customer_details']['full_name'] ?? 'N/A');
                $data['ownerFatherName'] = !empty($data['ownerFatherName']) ? $data['ownerFatherName'] : ($rawData['customer_details']['father_name'] ?? 'N/A');
                $data['chassis'] = !empty($data['chassis']) ? $data['chassis'] : ($rawData['chassis_number'] ?? ($rawData['vehicle_details']['chassis_no'] ?? 'N/A'));
                $data['engine'] = !empty($data['engine']) ? $data['engine'] : ($rawData['engine_number'] ?? ($rawData['vehicle_details']['engine_no'] ?? 'N/A'));
                $data['presentAddress'] = !empty($data['presentAddress']) ? $data['presentAddress'] : ($rawData['customer_details']['communication_address']['address_line'] ?? 'N/A');
                $data['vehicleInsurancePolicyNumber'] = !empty($data['vehicleInsurancePolicyNumber']) ? $data['vehicleInsurancePolicyNumber'] : ($rawData['previous_policy_number'] ?? 'N/A');
                $data['vehicleInsuranceUpto'] = !empty($data['vehicleInsuranceUpto']) ? $data['vehicleInsuranceUpto'] : ($rawData['previous_policy_exp_date'] ?? 'N/A');
                $data['vehicleInsuranceCompanyName'] = !empty($data['vehicleInsuranceCompanyName']) ? $data['vehicleInsuranceCompanyName'] : ($rawData['previous_insurer_code'] ?? 'N/A');
                $data['vehicleColour'] = !empty($data['vehicleColour']) ? $data['vehicleColour'] : ($rawData['vehicle_details']['vehicle_color'] ?? 'N/A');
                $data['regDate'] = !empty($data['regDate']) ? $data['regDate'] : ($rawData['vehicle_details']['registration_date'] ?? 'N/A');
                $data['model'] = !empty($data['model']) ? $data['model'] : ($rawData['vehicle_details']['model'] ?? 'N/A');
                $data['vehicleManufacturerName'] = !empty($data['vehicleManufacturerName']) ? $data['vehicleManufacturerName'] : ($rawData['vehicle_details']['manufacturer'] ?? 'N/A');
                $data['type'] = !empty($data['type']) ? $data['type'] : ($rawData['vehicle_details']['fuel_type'] ?? 'N/A');
                $data['rcExpiryDate'] = !empty($data['rcExpiryDate']) ? $data['rcExpiryDate'] : ($rawData['vehicle_details']['fitness_upto'] ?? ($rawData['vehicle_details']['rc_expiry_date'] ?? 'N/A'));
                $data['vehicleTaxUpto'] = !empty($data['vehicleTaxUpto']) ? $data['vehicleTaxUpto'] : ($rawData['vehicle_details']['tax_upto'] ?? 'N/A');
                $data['puccUpto'] = !empty($data['puccUpto']) ? $data['puccUpto'] : 'N/A';
                $data['puccNumber'] = !empty($data['puccNumber']) ? $data['puccNumber'] : 'N/A';
                $data['rcFinancer'] = !empty($data['rcFinancer']) ? $data['rcFinancer'] : ($rawData['vehicle_details']['financier'] ?? 'NONE');
                $data['regAuthority'] = !empty($data['regAuthority']) ? $data['regAuthority'] : ($rawData['vehicle_details']['rto_name'] ?? 'N/A');
                $data['normsType'] = !empty($data['normsType']) ? $data['normsType'] : 'N/A';
                $data['bodyType'] = !empty($data['bodyType']) ? $data['bodyType'] : 'N/A';
                $data['ownerCount'] = !empty($data['ownerCount']) ? $data['ownerCount'] : '1';
                $data['status'] = !empty($data['status']) ? $data['status'] : 'ACTIVE';
                $data['vehicleCubicCapacity'] = !empty($data['vehicleCubicCapacity']) ? $data['vehicleCubicCapacity'] : ($rawData['vehicle_details']['cubic_capacity'] ?? 'N/A');
                $data['grossVehicleWeight'] = !empty($data['grossVehicleWeight']) ? $data['grossVehicleWeight'] : ($rawData['vehicle_details']['gross_vehicle_weight'] ?? 'N/A');
                $data['unladenWeight'] = !empty($data['unladenWeight']) ? $data['unladenWeight'] : ($rawData['vehicle_details']['unladen_weight'] ?? 'N/A');
                $data['vehicleSeatCapacity'] = !empty($data['vehicleSeatCapacity']) ? $data['vehicleSeatCapacity'] : ($rawData['vehicle_details']['seating_capacity'] ?? 'N/A');
                $data['wheelbase'] = !empty($data['wheelbase']) ? $data['wheelbase'] : ($rawData['vehicle_details']['wheelbase'] ?? 'N/A');

                foreach ($data as $k => $v) {
                    if (is_string($v) && trim($v) === '') {
                        $data[$k] = 'N/A';
                    }
                }

                // Determine State Name
                $stateMap = [
                    'AN' => 'ANDAMAN & NICOBAR', 'AP' => 'ANDHRA PRADESH', 'AR' => 'ARUNACHAL PRADESH',
                    'AS' => 'ASSAM', 'BR' => 'BIHAR', 'CH' => 'CHANDIGARH', 'CG' => 'CHHATTISGARH',
                    'DD' => 'DAMAN & DIU', 'DL' => 'DELHI', 'DN' => 'DADRA & NAGAR HAVELI', 'GA' => 'GOA',
                    'GJ' => 'GUJARAT', 'HR' => 'HARYANA', 'HP' => 'HIMACHAL PRADESH', 'JK' => 'JAMMU & KASHMIR',
                    'JH' => 'JHARKHAND', 'KA' => 'KARNATAKA', 'KL' => 'KERALA', 'LA' => 'LADAKH',
                    'LD' => 'LAKSHADWEEP', 'MP' => 'MADHYA PRADESH', 'MH' => 'MAHARASHTRA', 'MN' => 'MANIPUR',
                    'ML' => 'MEGHALAYA', 'MZ' => 'MIZORAM', 'NL' => 'NAGALAND', 'OD' => 'ODISHA',
                    'OR' => 'ODISHA', 'PB' => 'PUNJAB', 'PY' => 'PUDUCHERRY', 'RJ' => 'RAJASTHAN',
                    'SK' => 'SIKKIM', 'TN' => 'TAMIL NADU', 'TS' => 'TELANGANA', 'TR' => 'TRIPURA',
                    'UP' => 'UTTAR PRADESH', 'UK' => 'UTTARAKHAND', 'UA' => 'UTTARAKHAND', 'WB' => 'WEST BENGAL',
                    'BH' => 'BHARAT',
                ];
                $stCode = substr(strtoupper($cleanRegNo), 0, 2);
                $stateName = $stateMap[$stCode] ?? null;
                if (!$stateName && !empty($data['regAuthority']) && $data['regAuthority'] !== 'N/A') {
                    $parts = explode(',', $data['regAuthority']);
                    $stateName = strtoupper(trim(end($parts)));
                }
                $data['stateName'] = $stateName ?: 'INDIA';
                $data['stateCode'] = $stCode ?: 'IND';

                // Non-Transport (NT) or Transport (T)
                $vClassUpper = strtoupper($data['vehicleClass'] ?? '');
                $isT = (str_contains($vClassUpper, 'GOODS') || str_contains($vClassUpper, 'COMMERCIAL') || str_contains($vClassUpper, 'TAXI') || str_contains($vClassUpper, 'TRANSPORT') || str_contains($vClassUpper, 'BUS') || str_contains($vClassUpper, 'TRUCK'));
                $data['isTransport'] = $isT ? 'T' : 'NT';

                // Month-Year of Mfg
                $mfg = $rawData['manufacturing_date'] ?? ($rawData['vehicle_details']['mfg_date'] ?? null);
                if (!$mfg && !empty($data['regDate']) && $data['regDate'] !== 'N/A') {
                    try {
                        $mfg = \Carbon\Carbon::parse($data['regDate'])->format('m-Y');
                    } catch (\Throwable $e) {
                        $mfg = null;
                    }
                }
                $data['mfgMonthYear'] = $mfg ?: '01-2021';
                $data['cylinders'] = $rawData['vehicle_details']['no_of_cylinders'] ?? (isset($data['vehicleCubicCapacity']) && intval($data['vehicleCubicCapacity']) > 0 && intval($data['vehicleCubicCapacity']) < 1000 ? '3' : '4');
                $data['horsePower'] = $rawData['vehicle_details']['horse_power'] ?? ($rawData['vehicle_details']['hp'] ?? 'N/A');
                $data['ownership'] = !empty($rawData['ownership_type']) ? strtoupper($rawData['ownership_type']) : 'INDIVIDUAL';

                // Load Emblem SVG Base64
                $emblemPath = public_path('images/emblem.svg');
                if (file_exists($emblemPath)) {
                    $data['emblemSvg'] = 'data:image/svg+xml;base64,' . base64_encode(file_get_contents($emblemPath));
                } else {
                    $data['emblemSvg'] = null;
                }

                // Generate QR Code as SVG data URI
                try {
                    $qrText = "Regn No: " . $data['regNo'] . "\nRegn Date: " . $data['regDate'] . "\nOwner: " . $data['owner'] . "\nChassis No: " . $data['chassis'] . "\nEngine No: " . $data['engine'] . "\nClass: " . $data['vehicleClass'] . "\nMaker: " . $data['vehicleManufacturerName'] . "\nModel: " . $data['model'] . "\nFuel: " . $data['type'] . "\nValid Upto: " . ($data['rcExpiryDate'] ?? 'N/A');
                    $renderer = new \BaconQrCode\Renderer\ImageRenderer(
                        new \BaconQrCode\Renderer\RendererStyle\RendererStyle(120, 0),
                        new \BaconQrCode\Renderer\Image\SvgImageBackEnd()
                    );
                    $writer = new \BaconQrCode\Writer($renderer);
                    $data['qrCodeSvg'] = 'data:image/svg+xml;base64,' . base64_encode($writer->writeString($qrText));
                } catch (\Throwable $e) {
                    $data['qrCodeSvg'] = null;
                }

                // Deduct coins only if successful
                if (!$user->isAdmin() && !$user->hasRole('super_admin') && $coinCost > 0) {
                    $user->deductCoins($coinCost, \App\Models\CoinTransaction::TYPE_SERVICE_DEDUCTION, 'Vehicle Details Download: ' . strtoupper($cleanRegNo));
                }

                \App\Models\ServiceRequest::create([
                    'user_id' => $user->id,
                    'service_id' => $service ? $service->id : null,
                    'service_name' => $service ? $service->name : 'Vehicle Details (RC)',
                    'input_data' => ['Vehicle Registration Number' => strtoupper($cleanRegNo)],
                    'coins_charged' => $user->isAdmin() || $user->hasRole('super_admin') ? 0 : $coinCost,
                    'status' => \App\Models\ServiceRequest::STATUS_COMPLETED,
                    'completed_at' => now(),
                ]);
                
                $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdf.vehicle_details', ['data' => $data]);
                $pdf->setPaper('a4', 'portrait');
                return response($pdf->output())
                    ->header('Content-Type', 'application/pdf')
                    ->header('Content-Disposition', 'attachment; filename="RC_Smart_Card_' . strtoupper($cleanRegNo) . '.pdf"');
            }
        }

        return back()->with('error', 'Vehicle details not found. Please check the Registration Number.');
    })->name('utilities.vehicle-details.download');

    // 1. Aadhar Card to PPP ID Instant
    Route::get('/utilities/aadhar-to-ppp-id', [\App\Http\Controllers\AadharToPppIdController::class, 'index'])->name('utilities.aadhar-to-ppp-id');
    Route::post('/utilities/aadhar-to-ppp-id/search', [\App\Http\Controllers\AadharToPppIdController::class, 'search'])->name('utilities.aadhar-to-ppp-id.search');
    Route::post('/utilities/aadhar-to-ppp-id/update-api', [\App\Http\Controllers\AadharToPppIdController::class, 'updateApi'])->name('utilities.aadhar-to-ppp-id.update-api');

    // 2. PPP ID to Aadhar Number (All Members - Without OTP)
    Route::get('/utilities/ppp-to-aadhar-all-members', function () {
        return Inertia::render('Utilities/PppToAadharAllMembers');
    })->name('utilities.ppp-to-aadhar-all-members');
    Route::post('/utilities/ppp-to-aadhar-all-members/search', [\App\Http\Controllers\PppToAadharAllMembersController::class, 'search'])->name('utilities.ppp-to-aadhar-all-members.search');

    // 3. PPP ID to Mobile Number (All Members - Without OTP)
    Route::get('/utilities/ppp-to-mobile-all-members', function () {
        return Inertia::render('Utilities/PppToMobileAllMembers');
    })->name('utilities.ppp-to-mobile-all-members');
    Route::post('/utilities/ppp-to-mobile-all-members/search', [\App\Http\Controllers\PppToMobileAllMembersController::class, 'search'])->name('utilities.ppp-to-mobile-all-members.search');

    // 4. PPP ID to Bank Account & IFSC Code (Without OTP)
    Route::get('/utilities/ppp-to-bank-details', function () {
        return Inertia::render('Utilities/PppToBankDetails');
    })->name('utilities.ppp-to-bank-details');
    Route::post('/utilities/ppp-to-bank-details/search', [\App\Http\Controllers\PppToBankDetailsController::class, 'search'])->name('utilities.ppp-to-bank-details.search');

    // PPP to Number (Search & Official Portal https://ppp-office.haryana.gov.in/)
    Route::get('/utilities/ppp-to-number', [\App\Http\Controllers\PppToNumberController::class, 'index'])->name('utilities.ppp-to-number');
    Route::post('/utilities/ppp-to-number/search', [\App\Http\Controllers\PppToNumberController::class, 'search'])->name('utilities.ppp-to-number.search');
    Route::post('/utilities/ppp-to-number/update-api', [\App\Http\Controllers\PppToNumberController::class, 'updateApi'])->name('utilities.ppp-to-number.update-api');

    // 5. Vehicle PUC (Without OTP - Instant)
    Route::get('/utilities/vehicle-puc-without-otp', function () {
        return Inertia::render('Utilities/VehiclePucWithoutOtp');
    })->name('utilities.vehicle-puc-without-otp');
    Route::post('/utilities/vehicle-puc-without-otp/search', [\App\Http\Controllers\VehiclePucWithoutOtpController::class, 'search'])->name('utilities.vehicle-puc-without-otp.search');

    // 6. Vehicle PUC (Without OTP alias & redirect)
    Route::get('/utilities/vehicle-puc-with-otp', function () {
        return redirect()->route('utilities.vehicle-puc-without-otp');
    })->name('utilities.vehicle-puc-with-otp');
    Route::post('/utilities/vehicle-puc-with-otp/search', [\App\Http\Controllers\VehiclePucWithoutOtpController::class, 'search'])->name('utilities.vehicle-puc-with-otp.search');
    Route::post('/utilities/vehicle-puc-with-otp/send-otp', [\App\Http\Controllers\VehiclePucWithoutOtpController::class, 'search'])->name('utilities.vehicle-puc-with-otp.send-otp');
    Route::post('/utilities/vehicle-puc-with-otp/verify-otp', [\App\Http\Controllers\VehiclePucWithoutOtpController::class, 'search'])->name('utilities.vehicle-puc-with-otp.verify-otp');

    // PUC PDF Download
    Route::match(['get', 'post'], '/utilities/vehicle-puc/download-pdf', [\App\Http\Controllers\VehiclePucPdfController::class, 'downloadPdf'])->name('utilities.vehicle-puc.download-pdf');

    // 7. S.I.R Voter Card List
    Route::get('/utilities/sir-voter-card-list', function () {
        return Inertia::render('Utilities/SirVoterCardList');
    })->name('utilities.sir-voter-card-list');
    Route::post('/utilities/sir-voter-card-list/search', [\App\Http\Controllers\SirVoterCardListController::class, 'search'])->name('utilities.sir-voter-card-list.search');

    // 8. PDF Editor
    Route::get('/utilities/pdf-editor', function () {
        return Inertia::render('Utilities/PdfEditor');
    })->name('utilities.pdf-editor');
    Route::post('/utilities/pdf-editor/process', [\App\Http\Controllers\PdfEditorController::class, 'process'])->name('utilities.pdf-editor.process');

    // 9. Voter Card Manual Maker
    Route::get('/utilities/voter-card-manual-maker', function () {
        return Inertia::render('Utilities/VoterCardManualMaker');
    })->name('utilities.voter-card-manual-maker');
    Route::post('/utilities/voter-card-manual-maker/generate', [\App\Http\Controllers\VoterCardManualMakerController::class, 'generate'])->name('utilities.voter-card-manual-maker.generate');

    // 10. Aadhar Card Manual
    Route::get('/utilities/aadhar-card-manual', function () {
        return Inertia::render('Utilities/AadharCardManual');
    })->name('utilities.aadhar-card-manual');
    Route::post('/utilities/aadhar-card-manual/generate', [\App\Http\Controllers\AadharCardManualController::class, 'generate'])->name('utilities.aadhar-card-manual.generate');

    // 10.1 PAN Card Manual Maker
    Route::get('/utilities/pan-card-manual-maker', function () {
        return Inertia::render('Utilities/PanCardManualMaker');
    })->name('utilities.pan-card-manual-maker');
    Route::post('/utilities/pan-card-manual-maker/generate', [\App\Http\Controllers\PanCardManualMakerController::class, 'generate'])->name('utilities.pan-card-manual-maker.generate');

    // 10.2 Courier & Parcel Slip Maker
    Route::get('/utilities/courier-slip-maker', function () {
        return Inertia::render('Utilities/CourierSlipMaker');
    })->name('utilities.courier-slip-maker');
    Route::post('/utilities/courier-slip-maker/generate', [\App\Http\Controllers\CourierSlipMakerController::class, 'generate'])->name('utilities.courier-slip-maker.generate');
    Route::get('/utilities/courier-slip-maker/pincode/{pincode}', [\App\Http\Controllers\CourierSlipMakerController::class, 'lookupPincode'])->name('utilities.courier-slip-maker.pincode');

    // 11. Voter Card Manual For Address Change
    Route::get('/utilities/voter-card-manual-address-change', function () {
        return Inertia::render('Utilities/VoterCardManualAddressChange');
    })->name('utilities.voter-card-manual-address-change');
    Route::post('/utilities/voter-card-manual-address-change/generate', [\App\Http\Controllers\VoterCardManualAddressChangeController::class, 'generate'])->name('utilities.voter-card-manual-address-change.generate');

    // 12. Aadhar Card Mobile Number Update
    Route::get('/utilities/aadhar-mobile-update', function () {
        return Inertia::render('Utilities/AadharMobileUpdate');
    })->name('utilities.aadhar-mobile-update');
    Route::post('/utilities/aadhar-mobile-update/update', [\App\Http\Controllers\AadharMobileUpdateController::class, 'update'])->name('utilities.aadhar-mobile-update.update');

    // 13. Aadhar Card DOB Change
    Route::get('/utilities/aadhar-dob-change', function () {
        return Inertia::render('Utilities/AadharDobChange');
    })->name('utilities.aadhar-dob-change');
    Route::post('/utilities/aadhar-dob-change/update', [\App\Http\Controllers\AadharDobChangeController::class, 'update'])->name('utilities.aadhar-dob-change.update');

    // 14. Aadhar Card Surname Change
    Route::get('/utilities/aadhar-surname-change', function () {
        return Inertia::render('Utilities/AadharSurnameChange');
    })->name('utilities.aadhar-surname-change');
    Route::post('/utilities/aadhar-surname-change/update', [\App\Http\Controllers\AadharSurnameChangeController::class, 'update'])->name('utilities.aadhar-surname-change.update');

    // 15. Aadhar Card Full Name Change
    Route::get('/utilities/aadhar-full-name-change', function () {
        return Inertia::render('Utilities/AadharFullNameChange');
    })->name('utilities.aadhar-full-name-change');
    Route::post('/utilities/aadhar-full-name-change/update', [\App\Http\Controllers\AadharFullNameChangeController::class, 'update'])->name('utilities.aadhar-full-name-change.update');

    // 16. ABHA Health ID Make
    Route::get('/utilities/abha-health-id-make', [\App\Http\Controllers\AbhaHealthIdMakeController::class, 'index'])->name('utilities.abha-health-id-make');
    Route::post('/utilities/abha-health-id-make/send-otp', [\App\Http\Controllers\AbhaHealthIdMakeController::class, 'sendOtp'])->name('utilities.abha-health-id-make.send-otp');
    Route::post('/utilities/abha-health-id-make/verify-otp', [\App\Http\Controllers\AbhaHealthIdMakeController::class, 'verifyOtp'])->name('utilities.abha-health-id-make.verify-otp');

    // Premium Service Unlock
    Route::post('/services/{service}/unlock', function (\App\Models\Service $service) {
        $user = auth()->user();
        if (!$service->is_premium) {
            return back()->with('error', 'This service is not premium.');
        }
        if ($service->users()->where('user_id', $user->id)->exists()) {
            return back()->with('error', 'Service is already unlocked.');
        }
        if ($user->coins < $service->unlock_cost) {
            return back()->with('error', 'Insufficient coins to unlock. Please recharge.');
        }
        
        \Illuminate\Support\Facades\DB::transaction(function () use ($user, $service) {
            $user->deductCoins($service->unlock_cost, \App\Models\CoinTransaction::TYPE_SERVICE_DEDUCTION, "Unlocked Premium Service: {$service->name}");
            $service->users()->attach($user->id);
        });

        return back()->with('success', "Service {$service->name} unlocked successfully!");
    })->name('services.unlock');

    }); // End of license.active middleware group

    // Admin Routes
    Route::prefix('admin')->name('admin.')->group(function() {
        // License Key Management — admin only
        Route::get('license-keys', [\App\Http\Controllers\LicenseController::class, 'adminIndex'])->name('license-keys.index')->middleware('admin');
        Route::post('license-keys/generate', [\App\Http\Controllers\LicenseController::class, 'adminGenerate'])->name('license-keys.generate')->middleware('admin');
        Route::post('license-keys/{id}/activate', [\App\Http\Controllers\LicenseController::class, 'adminActivate'])->name('license-keys.activate')->middleware('admin');
        Route::post('license-keys/{id}/deactivate', [\App\Http\Controllers\LicenseController::class, 'adminDeactivate'])->name('license-keys.deactivate')->middleware('admin');
        Route::post('license-keys/{id}/revoke', [\App\Http\Controllers\LicenseController::class, 'adminDeactivate'])->name('license-keys.revoke')->middleware('admin');
        Route::post('license-keys/{id}/reset-device', [\App\Http\Controllers\LicenseController::class, 'adminResetDevice'])->name('license-keys.reset-device')->middleware('admin');
        Route::delete('license-keys/{id}', [\App\Http\Controllers\LicenseController::class, 'adminDestroy'])->name('license-keys.destroy')->middleware('admin');

        // Service catalog — only admins can add services and set coin prices
        Route::patch('services/{service}/toggle-active', [\App\Http\Controllers\Admin\ServiceController::class, 'toggleActive'])
            ->name('services.toggle-active')->middleware('admin');
        Route::post('services/{service}', [\App\Http\Controllers\Admin\ServiceController::class, 'update'])
            ->name('services.update.post')->middleware('admin');
        Route::resource('services', \App\Http\Controllers\Admin\ServiceController::class)
            ->except('show')->middleware('admin');

        // Service requests — users submit, admins process
        Route::resource('service-requests', \App\Http\Controllers\Admin\ServiceRequestController::class)
            ->only(['index', 'create', 'store', 'show'])->middleware('license.active');
        Route::patch('service-requests/{serviceRequest}', [\App\Http\Controllers\Admin\ServiceRequestController::class, 'update'])
            ->name('service-requests.update')->middleware('admin');

        // Notifications
        Route::get('notifications', [\App\Http\Controllers\Admin\NotificationController::class, 'index'])->name('notifications.index');
        Route::post('notifications/read-all', [\App\Http\Controllers\Admin\NotificationController::class, 'markAllRead'])->name('notifications.read-all');
        Route::post('notifications/{id}/read', [\App\Http\Controllers\Admin\NotificationController::class, 'markRead'])->name('notifications.read');

        Route::resource('marriage-forms', \App\Http\Controllers\Admin\MarriageFormController::class)->middleware('license.active');
        Route::get('marriage-forms/{marriage_form}/print', [\App\Http\Controllers\Admin\MarriageFormController::class, 'print'])->name('marriage-forms.print');

        Route::resource('marriage-affidavits', \App\Http\Controllers\Admin\MarriageAffidavitController::class)->middleware('license.active');
        Route::get('marriage-affidavits/{marriage_affidavit}/print', [\App\Http\Controllers\Admin\MarriageAffidavitController::class, 'print'])->name('marriage-affidavits.print');

        Route::resource('birth-records', \App\Http\Controllers\Admin\BirthRecordController::class)->middleware('license.active');
        Route::resource('haryana-domicile', \App\Http\Controllers\Admin\HaryanaDomicileController::class)->middleware('license.active');
        Route::get('haryana-domicile/{haryana_domicile}/print', [\App\Http\Controllers\Admin\HaryanaDomicileController::class, 'print'])->name('haryana-domicile.print');

        Route::resource('rent-agreement', \App\Http\Controllers\Admin\RentAgreementController::class)->middleware('license.active');
        Route::get('rent-agreement/{rent_agreement}/print', [\App\Http\Controllers\Admin\RentAgreementController::class, 'print'])->name('rent-agreement.print');

        Route::resource('bob-affidavit', \App\Http\Controllers\Admin\RentAgreementController::class)->middleware('license.active');
        Route::get('bob-affidavit/{bob_affidavit}/print', [\App\Http\Controllers\Admin\RentAgreementController::class, 'print'])->name('bob-affidavit.print');

        Route::resource('salary-slip', \App\Http\Controllers\Admin\SalarySlipController::class)->middleware('license.active');
        Route::get('salary-slip/{salary_slip}/print', [\App\Http\Controllers\Admin\SalarySlipController::class, 'print'])->name('salary-slip.print');
        Route::get('salary-slip/{salary_slip}/download', [\App\Http\Controllers\Admin\SalarySlipController::class, 'download'])->name('salary-slip.download');

        Route::resource('resume-maker', \App\Http\Controllers\Admin\ResumeMakerController::class)->middleware('license.active');
        Route::get('resume-maker/{resume}/print', [\App\Http\Controllers\Admin\ResumeMakerController::class, 'printView'])->name('resume-maker.print');

        
        Route::get('aadhar-update/grid', function () {
        return response()->file(public_path('aadhar_update/grid.jpg'));
    })->name('aadhar-update.grid');

    Route::resource('aadhar-update', \App\Http\Controllers\Admin\AadharUpdateController::class)->middleware('license.active');
    Route::get('aadhar-update/{aadhar_update}/print', [\App\Http\Controllers\Admin\AadharUpdateController::class, 'print'])->name('aadhar-update.print');

    Route::resource('aadhar-card-form', \App\Http\Controllers\Admin\AadharUpdateController::class)->middleware('license.active');
    Route::get('aadhar-card-form/{aadhar_update}/print', [\App\Http\Controllers\Admin\AadharUpdateController::class, 'print'])->name('aadhar-card-form.print');

    Route::get('pincode-lookup/{pincode}', [\App\Http\Controllers\Admin\PincodeLookupController::class, 'lookup'])->name('pincode-lookup');
        Route::resource('pan-requests', \App\Http\Controllers\Admin\PanRequestController::class);
        
        Route::resource('manual-pan-cards', \App\Http\Controllers\Admin\ManualPanCardController::class);
        Route::get('manual-pan-cards/{manual_pan_card}/print', [\App\Http\Controllers\Admin\ManualPanCardController::class, 'print'])->name('manual-pan-cards.print'); 

        Route::resource('tenth-passbook', \App\Http\Controllers\Admin\TenthPassbookController::class);
        Route::get('tenth-passbook/{tenth_passbook}/print', [\App\Http\Controllers\Admin\TenthPassbookController::class, 'print'])->name('tenth-passbook.print'); 

        // Aadhaar PDF Converter direct image download
        Route::get('pdf-converters/{record}/download/{type}', [\App\Http\Controllers\PvcCardMakerController::class, 'downloadPdfConverterImage'])->name('pdf-converters.download'); 

        // QR to Print (Smart Counter)
        Route::get('qr-to-print', [\App\Http\Controllers\QrPrintController::class, 'index'])->name('qr-to-print.index');
        Route::post('qr-to-print/settings', [\App\Http\Controllers\QrPrintController::class, 'updateSettings'])->name('qr-to-print.settings');
        Route::post('qr-to-print/printer-settings', [\App\Http\Controllers\QrPrintController::class, 'updatePrinterSettings'])->name('qr-to-print.printer-settings');
        Route::post('qr-to-print/delete-printer', [\App\Http\Controllers\QrPrintController::class, 'deletePrinter'])->name('qr-to-print.delete-printer');
        Route::post('qr-to-print/restore-printer', [\App\Http\Controllers\QrPrintController::class, 'restorePrinter'])->name('qr-to-print.restore-printer');
        Route::post('qr-to-print/subscribe', [\App\Http\Controllers\QrPrintController::class, 'subscribe'])->name('qr-to-print.subscribe');
        Route::get('qr-to-print/standee', [\App\Http\Controllers\QrPrintController::class, 'standee'])->name('qr-to-print.standee');
        Route::get('qr-to-print/download-agent', [\App\Http\Controllers\QrPrintController::class, 'downloadAgentZip'])->name('qr-to-print.download-agent');
        Route::post('qr-to-print/reprint/{id}', [\App\Http\Controllers\QrPrintController::class, 'reprintJob'])->name('qr-to-print.reprint');
        Route::delete('qr-to-print/job/{id}', [\App\Http\Controllers\QrPrintController::class, 'deleteJob'])->name('qr-to-print.job.delete'); 

        Route::resource('airtel-passbook', \App\Http\Controllers\Admin\AirtelPassbookController::class);
        Route::get('airtel-passbook/{airtel_passbook}/print', [\App\Http\Controllers\Admin\AirtelPassbookController::class, 'print'])->name('airtel-passbook.print'); 

        Route::resource('coin-requests', \App\Http\Controllers\Admin\CoinPurchaseRequestController::class)->only(['index', 'create', 'store', 'update']);

        // PayCoreX Payment Gateway routes (for authenticated users)
        Route::post('payment/paycorex/create-order', [\App\Http\Controllers\PaycorexPaymentController::class, 'createOrder'])->name('payment.paycorex.create-order');
        Route::post('payment/paycorex/check-status', [\App\Http\Controllers\PaycorexPaymentController::class, 'checkStatus'])->name('payment.paycorex.check-status');

        // Secure Wallet Add Money alias routes
        Route::get('wallet/add', [\App\Http\Controllers\Admin\CoinPurchaseRequestController::class, 'create'])->name('wallet.add.alias');
        Route::post('wallet/create-order', [\App\Http\Controllers\WalletPaymentController::class, 'createOrder'])->name('wallet.create-order.alias');
        Route::post('wallet/verify-payment', [\App\Http\Controllers\WalletPaymentController::class, 'verifyPayment'])->name('wallet.verify-payment.alias');

        Route::resource('users', \App\Http\Controllers\Admin\UserController::class)->middleware('admin');
        Route::patch('users/{user}/toggle-status', [\App\Http\Controllers\Admin\UserController::class, 'toggleStatus'])->name('users.toggle-status')->middleware('admin');
        Route::post('users/{user}/add-coins', [\App\Http\Controllers\Admin\UserController::class, 'addCoins'])->name('users.add-coins')->middleware('admin');
        Route::post('users/{user}/clear-coins', [\App\Http\Controllers\Admin\UserController::class, 'clearCoins'])->name('users.clear-coins')->middleware('admin');
        Route::patch('users/{user}/update-device-limit', [\App\Http\Controllers\Admin\UserController::class, 'updateDeviceLimit'])->name('users.update-device-limit')->middleware('admin');
        Route::post('users/{user}/reset-device-lock', [\App\Http\Controllers\Admin\UserController::class, 'resetDeviceLock'])->name('users.reset-device-lock')->middleware('admin');
        Route::post('users/clear-all-work-data', [\App\Http\Controllers\Admin\UserController::class, 'clearAllWorkData'])->name('users.clear-all-work-data')->middleware('admin');
        Route::post('users/{user}/clear-work-data', [\App\Http\Controllers\Admin\UserController::class, 'clearUserWorkData'])->name('users.clear-work-data')->middleware('admin');

        // Admin Chat with Users
        Route::get('chat/{user}', [\App\Http\Controllers\ChatController::class, 'getAdminChat'])->name('admin.chat.messages')->middleware('admin');
        Route::post('chat/{user}/send', [\App\Http\Controllers\ChatController::class, 'sendAdminMessage'])->name('admin.chat.send')->middleware('admin');

        // Admin Screen Share & Display View
        Route::post('screen-share/{user}/start', [\App\Http\Controllers\ScreenShareController::class, 'startSession'])->name('admin.screen.start')->middleware('admin');
        Route::get('screen-share/{session}/poll', [\App\Http\Controllers\ScreenShareController::class, 'pollAdmin'])->name('admin.screen.poll')->middleware('admin');
        Route::post('screen-share/{session}/candidate', [\App\Http\Controllers\ScreenShareController::class, 'sendCandidate'])->name('admin.screen.candidate')->middleware('admin');
        Route::post('screen-share/{session}/end', [\App\Http\Controllers\ScreenShareController::class, 'endSession'])->name('admin.screen.end')->middleware('admin');

        Route::get('reactivation-requests', [\App\Http\Controllers\Admin\ReactivationRequestController::class, 'index'])->name('reactivation-requests.index')->middleware('admin');
        Route::post('reactivation-requests/{reactivationRequest}/approve', [\App\Http\Controllers\Admin\ReactivationRequestController::class, 'approve'])->name('reactivation-requests.approve')->middleware('admin');
        Route::post('reactivation-requests/{reactivationRequest}/reject',  [\App\Http\Controllers\Admin\ReactivationRequestController::class, 'reject'])->name('reactivation-requests.reject')->middleware('admin');

        Route::get('user-permissions', [\App\Http\Controllers\Admin\UserPermissionsController::class, 'index'])->name('user-permissions.index')->middleware('admin');
        Route::post('user-permissions/{user}', [\App\Http\Controllers\Admin\UserPermissionsController::class, 'update'])->name('user-permissions.update')->middleware('admin');
        Route::get('profile', [\App\Http\Controllers\Admin\ProfileController::class, 'edit'])->name('profile.edit');
        Route::put('profile', [\App\Http\Controllers\Admin\ProfileController::class, 'update'])->name('profile.update');
        Route::get('referrals', [\App\Http\Controllers\ReferralController::class, 'index'])->name('referrals.index');
        Route::post('referrals/generate-new', [\App\Http\Controllers\ReferralController::class, 'generateNew'])->name('referrals.generate-new');

        // Payment / QR Settings — admin only
        Route::get('payment-settings', [\App\Http\Controllers\Admin\PaymentSettingController::class, 'edit'])->name('payment-settings.edit')->middleware('admin');
        Route::put('payment-settings', [\App\Http\Controllers\Admin\PaymentSettingController::class, 'update'])->name('payment-settings.update')->middleware('admin');
        Route::post('payment-settings/test-paycorex', [\App\Http\Controllers\PaycorexPaymentController::class, 'testConnection'])->name('payment-settings.test-paycorex')->middleware('admin');

        // API Settings — admin only
        Route::get('api-settings', [\App\Http\Controllers\Admin\ApiSettingController::class, 'edit'])->name('api-settings.edit')->middleware('admin');
        Route::put('api-settings', [\App\Http\Controllers\Admin\ApiSettingController::class, 'update'])->name('api-settings.update')->middleware('admin');

        // Broadcast Notices / Announcements
        Route::resource('notices', \App\Http\Controllers\Admin\BroadcastNoticeController::class)->except(['create', 'show', 'edit'])->middleware('admin');
        Route::patch('notices/{notice}/toggle-status', [\App\Http\Controllers\Admin\BroadcastNoticeController::class, 'toggleStatus'])->name('notices.toggle-status')->middleware('admin');

        // Haryana Domicile PDF Coordinates — admin only
        Route::get('pdf-coordinates', [PdfCoordinateController::class, 'edit'])->name('pdf-coordinates.edit')->middleware('admin');
        Route::post('pdf-coordinates', [PdfCoordinateController::class, 'save'])->name('pdf-coordinates.save')->middleware('admin');
    });
});

// Haryana Domicile Print Route
Route::get('/haryana-domicile/print/{id}', [HaryanaDomicileController::class, 'print'])->name('haryana-domicile.print');

// Birth Record Print Route
Route::get('/birth-records/{record}/print', \App\Http\Controllers\PrintBirthRecordController::class)->name('birth-records.print');

// English to Hindi Transliteration API
Route::get('/api/transliterate-hindi', function (\Illuminate\Http\Request $request) {
    $text = trim($request->query('text', ''));
    if ($text === '') {
        return response()->json(['success' => true, 'result' => '']);
    }

    try {
        $url = 'https://inputtools.google.com/request?text=' . urlencode($text) . '&itc=hi-t-i0-und&num=1';
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
        curl_setopt($ch, CURLOPT_TIMEOUT, 4);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)');
        $response = curl_exec($ch);
        curl_close($ch);

        if ($response) {
            $data = json_decode($response, true);
            if (isset($data[0]) && $data[0] === 'SUCCESS' && isset($data[1][0][1][0])) {
                return response()->json(['success' => true, 'result' => $data[1][0][1][0]]);
            }
        }
    } catch (\Throwable $e) {
        // Silently ignore and fallback
    }

    return response()->json(['success' => false, 'result' => $text]);
})->name('api.transliterate-hindi');


Route::get('/cc', function() {
    \Illuminate\Support\Facades\Artisan::call('cache:clear');
    \Illuminate\Support\Facades\Artisan::call('config:clear');
    \Illuminate\Support\Facades\Artisan::call('view:clear');
    \Illuminate\Support\Facades\Artisan::call('route:clear');
    if (function_exists('opcache_reset')) {
        @opcache_reset();
    }
    return 'All caches cleared successfully!';
});

Route::get('/speedup', function() {
    \Illuminate\Support\Facades\Artisan::call('config:cache');
    \Illuminate\Support\Facades\Artisan::call('route:cache');
    \Illuminate\Support\Facades\Artisan::call('view:cache');
    if (function_exists('opcache_reset')) {
        @opcache_reset();
    }
    return '<div style="font-family:sans-serif;padding:30px;background:#f0fdf4;color:#166534;border:2px solid #22c55e;border-radius:12px;max-width:600px;margin:50px auto;">'
        . '<h2>⚡ Site Speedup Activated!</h2>'
        . '<p>Configuration, Routes and Views have been pre-compiled and cached for maximum loading speed.</p>'
        . '</div>';
});


Route::get('/test-login', function() {
    auth()->loginUsingId(1);
    return redirect('/dashboard');
});

Route::get('/debug-shop-printers', function() {
    $shop = \App\Models\PrintShop::where('shop_code', 'G2YACN')->first();
    if ($shop) {
        \App\Http\Controllers\Api\PrintAgentApiController::autoRouteShopPrinters($shop);
    }
    $lastJobs = $shop ? \App\Models\PrintJob::where('print_shop_id', $shop->id)->orderBy('id', 'desc')->take(5)->get() : [];
    return response()->json([
        'shop' => $shop,
        'last_jobs' => $lastJobs,
    ]);
});

// Public Customer Mobile Portal for QR to Print
Route::get('/p/{shop_code}', [\App\Http\Controllers\PublicPrintController::class, 'showUploadPage'])->name('public.qr-print.upload');
Route::post('/p/{shop_code}/upload', [\App\Http\Controllers\PublicPrintController::class, 'uploadAndCreateJob'])->name('public.qr-print.submit');
Route::get('/p/job/{job_code}/status', [\App\Http\Controllers\PublicPrintController::class, 'checkJobStatus'])->name('public.qr-print.status');

// Silent Background Print Agent API
Route::prefix('api/print-agent')->group(function () {
    Route::post('/heartbeat', [\App\Http\Controllers\Api\PrintAgentApiController::class, 'heartbeat']);
    Route::get('/jobs', [\App\Http\Controllers\Api\PrintAgentApiController::class, 'getPendingJobs']);
    Route::get('/file/{job_code}', [\App\Http\Controllers\Api\PrintAgentApiController::class, 'downloadFile']);
    Route::post('/update-status', [\App\Http\Controllers\Api\PrintAgentApiController::class, 'updateJobStatus']);
    Route::get('/engine', [\App\Http\Controllers\Api\PrintAgentApiController::class, 'downloadEngine']);
    Route::get('/script', [\App\Http\Controllers\Api\PrintAgentApiController::class, 'getLatestScript']);
});

// Storage fallback route - guarantees uploaded service logos and public files are always served
Route::get('/storage/{path}', function ($path) {
    $filePath = storage_path('app/public/' . $path);
    if (!file_exists($filePath)) {
        abort(404);
    }
    return response()->file($filePath);
})->where('path', '.*')->name('storage.local');

// PayCoreX Payment Gateway Redirect Callback
Route::match(['get', 'post'], '/payment/paycorex/callback', [\App\Http\Controllers\PaycorexPaymentController::class, 'callback'])->name('payment.paycorex.callback');

// Secure Wallet Webhook & Callback
Route::post('/wallet/webhook', [\App\Http\Controllers\WalletPaymentController::class, 'webhook'])->name('wallet.webhook');
Route::match(['get', 'post'], '/wallet/callback', [\App\Http\Controllers\WalletPaymentController::class, 'callback'])->name('wallet.callback');

