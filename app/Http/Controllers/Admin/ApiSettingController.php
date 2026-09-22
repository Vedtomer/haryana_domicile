<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ApiSettingController extends Controller
{
    public function edit()
    {
        $user = auth()->user();
        if (!$user || (!$user->isAdmin() && !$user->hasRole('super_admin'))) {
            abort(403, 'Unauthorized access.');
        }

        return Inertia::render('Admin/ApiSettings/Edit', [
            'settings' => [
                // IDCard.Store (PVC & Astrology)
                'idcard_store_api_key'  => Setting::get('idcard_store_api_key', config('services.idcard_store.api_key', '71ebc340-7c80-4c8f-9613-250094ba27c3')),
                'idcard_store_base_url' => Setting::get('idcard_store_base_url', config('services.idcard_store.base_url', 'https://api.idcard.store')),

                // Nexus API & KYC Services
                'nexus_api_key'                => Setting::get('nexus_api_key', config('services.nexus.api_key', '38cc07892c07c566e3ce1a3289c589e284954d7c0e593386')),
                'nexus_aadhar_to_name_url'     => Setting::get('nexus_aadhar_to_name_url', 'https://nexus-dashboard.space/api/v1/aadhar_card_api/aadhar_to_name.php'),
                'nexus_aadhar_to_mask_pan_url' => Setting::get('nexus_aadhar_to_mask_pan_url', 'https://nexus-dashboard.space/api/v1/aadhar_card_api/aadhar_to_mask_pan.php'),
                'nexus_aadhar_to_pan_url'      => Setting::get('nexus_aadhar_to_pan_url', 'https://nexus-dashboard.space/api/v1/aadhar_card_api/aadhaar_to_unmasked_pan.php'),
                'nexus_mobile_to_pan_url'      => Setting::get('nexus_mobile_to_pan_url', 'https://nexus-dashboard.space/api/v1/telecom_api/mobile_to_pan.php'),
                'nexus_mobile_to_pan_key'      => Setting::get('nexus_mobile_to_pan_key', ''),
                'nexus_pan_details_url'        => Setting::get('nexus_pan_details_url', 'https://nexus-dashboard.space/api/v1/pan_card_api/pan_server2.php'),
                'nexus_pan_full_details_url'   => Setting::get('nexus_pan_full_details_url', 'https://nexus-dashboard.space/api/v1/pan_card_api/pan_full_details.php'),
                'nexus_pan_to_aadhar_url'      => Setting::get('nexus_pan_to_aadhar_url', 'https://nexus-dashboard.space/api/v1/pan_card_api/pan_to_aadhar.php'),
                'nexus_pan_to_uid_url'         => Setting::get('nexus_pan_to_uid_url', 'https://nexus-dashboard.space/api/v1/pan_card_api/pan_to_uid_s1.php'),

                // Vahan & Transport
                'vahan_api_key'               => Setting::get('vahan_api_key', config('services.vahan.api_key', '')),
                'vahan_puc_without_otp_url'   => Setting::get('vahan_puc_without_otp_url', config('services.vahan.puc_without_otp_url', '')),
                'vahan_puc_send_otp_url'      => Setting::get('vahan_puc_send_otp_url', config('services.vahan.puc_send_otp_url', '')),
                'vahan_puc_verify_otp_url'    => Setting::get('vahan_puc_verify_otp_url', config('services.vahan.puc_verify_otp_url', '')),
                'vahan_rc_pdf_url'            => Setting::get('vahan_rc_pdf_url', 'https://nexus-dashboard.space/api/v1/vahan_service_api/vechil_rc_pdf.php'),
                'vahan_rc_pdf_key'            => Setting::get('vahan_rc_pdf_key', ''),
                'vahan_learning_licence_url'  => Setting::get('vahan_learning_licence_url', 'https://nexus-dashboard.space/api/v1/vahan_service_api/learning_license_pdf.php'),
                'vahan_learning_licence_key'  => Setting::get('vahan_learning_licence_key', ''),
                'vehicle_to_mobile_api_url'   => Setting::get('vehicle_to_mobile_api_url', 'https://api.paanel.shop/api/gateway.php'),
                'vehicle_to_mobile_api_key'   => Setting::get('vehicle_to_mobile_api_key', 'DuXxZxX'),
                'vehicle_details_api_url'     => Setting::get('vehicle_details_api_url', 'https://api.paanel.shop/api/gateway.php'),
                'vehicle_details_api_key'     => Setting::get('vehicle_details_api_key', 'SamXverma'),

                // Aadhaar Info & Updates
                'mobile_to_info_api_url'             => Setting::get('mobile_to_info_api_url', 'https://maikyaladledarlinggggg.watchwere19.workers.dev/?key=48hrs&q=9876543210'),
                'mobile_to_info_api_key'             => Setting::get('mobile_to_info_api_key', '48hrs'),
                'aadhar_to_info_api_url'             => Setting::get('aadhar_to_info_api_url', 'https://api.paanel.shop/api/gateway.php'),
                'aadhar_to_info_api_key'             => Setting::get('aadhar_to_info_api_key', 'SamXverma'),
                'aadhar_update_api_key'              => Setting::get('aadhar_update_api_key', config('services.aadhar_update.api_key', '')),
                'aadhar_update_mobile_update_url'    => Setting::get('aadhar_update_mobile_update_url', config('services.aadhar_update.mobile_update_url', '')),
                'aadhar_update_dob_change_url'       => Setting::get('aadhar_update_dob_change_url', config('services.aadhar_update.dob_change_url', '')),
                'aadhar_update_surname_change_url'   => Setting::get('aadhar_update_surname_change_url', config('services.aadhar_update.surname_change_url', '')),
                'aadhar_update_full_name_change_url' => Setting::get('aadhar_update_full_name_change_url', config('services.aadhar_update.full_name_change_url', '')),

                // PPP API (Parivar Pehchan Patra)
                'ppp_api_key'           => Setting::get('ppp_api_key', config('services.ppp.api_key', '')),
                'ppp_aadhar_to_ppp_url' => Setting::get('ppp_aadhar_to_ppp_url', config('services.ppp.aadhar_to_ppp_url', 'https://fasal.haryana.gov.in/Home/GetFDbyAadhar')),
                'ppp_to_aadhar_url'     => Setting::get('ppp_to_aadhar_url', config('services.ppp.ppp_to_aadhar_url', '')),
                'ppp_to_mobile_url'     => Setting::get('ppp_to_mobile_url', config('services.ppp.ppp_to_mobile_url', '')),
                'ppp_to_bank_url'       => Setting::get('ppp_to_bank_url', config('services.ppp.ppp_to_bank_url', '')),

                // Voter Services
                'voter_api_key'            => Setting::get('voter_api_key', config('services.voter.api_key', '')),
                'voter_sir_voter_list_url' => Setting::get('voter_sir_voter_list_url', config('services.voter.sir_voter_list_url', '')),
                'voter_mobile_update_url'  => Setting::get('voter_mobile_update_url', 'https://nexus-dashboard.space/api/v1/voter_card_api/voter_mobile_link.php'),
                'voter_mobile_update_key'  => Setting::get('voter_mobile_update_key', ''),

                // Card Maker Tools & PDF Editor
                'card_maker_api_key'                 => Setting::get('card_maker_api_key', config('services.card_maker.api_key', '')),
                'card_maker_voter_card_url'          => Setting::get('card_maker_voter_card_url', config('services.card_maker.voter_card_url', '')),
                'card_maker_aadhar_card_url'         => Setting::get('card_maker_aadhar_card_url', config('services.card_maker.aadhar_card_url', '')),
                'card_maker_voter_address_change_url' => Setting::get('card_maker_voter_address_change_url', config('services.card_maker.voter_address_change_url', '')),
                'pdf_api_key'                        => Setting::get('pdf_api_key', config('services.pdf.api_key', '')),
                'pdf_editor_api_url'                 => Setting::get('pdf_editor_api_url', config('services.pdf.editor_api_url', '')),

                // ABHA Health ID (ABDM)
                'abha_api_url'       => Setting::get('abha_api_url', config('services.abha.api_url') ?: 'https://abha.abdm.gov.in/abha/v3'),
                'abha_api_key'       => Setting::get('abha_api_key', config('services.abha.api_key', '')),
                'abha_client_id'     => Setting::get('abha_client_id', config('services.abha.client_id', '')),
                'abha_client_secret' => Setting::get('abha_client_secret', config('services.abha.client_secret', '')),

                // Utilities & Government Portals
                'dhbvn_bill_url'               => Setting::get('dhbvn_bill_url', 'https://dhbvn.org.in/Rapdrp/BD?UID='),
                'uhbvn_bill_url'               => Setting::get('uhbvn_bill_url', 'https://uhbvn.org.in/Rapdrp/BD?UID='),
                'saral_status_url'             => Setting::get('saral_status_url', 'https://edisha.gov.in/eForms/Status'),
                'kundli_city_autocomplete_url' => Setting::get('kundli_city_autocomplete_url', 'https://kundli.amd64.workers.dev/AstroChat/cities/allcountries/autocomplete'),
                'ifsc_api_url'                 => Setting::get('ifsc_api_url', 'https://ifsc.razorpay.com'),
                'pincode_api_url'              => Setting::get('pincode_api_url', 'https://api.postalpincode.in/pincode'),

                // CallMeBot WhatsApp Alerts
                'callmebot_phone'   => Setting::get('callmebot_phone', config('services.callmebot.phone', '')),
                'callmebot_api_key' => Setting::get('callmebot_api_key', config('services.callmebot.api_key', '')),
            ],
        ]);
    }

    public function update(Request $request)
    {
        $user = auth()->user();
        if (!$user || (!$user->isAdmin() && !$user->hasRole('super_admin'))) {
            abort(403, 'Unauthorized access.');
        }

        $fields = [
            // IDCard.Store
            'idcard_store_api_key',
            'idcard_store_base_url',

            // Nexus
            'nexus_api_key',
            'nexus_aadhar_to_name_url',
            'nexus_aadhar_to_mask_pan_url',
            'nexus_aadhar_to_pan_url',
            'nexus_mobile_to_pan_url',
            'nexus_mobile_to_pan_key',
            'nexus_pan_details_url',
            'nexus_pan_full_details_url',
            'nexus_pan_to_aadhar_url',
            'nexus_pan_to_uid_url',

            // Vahan & Transport
            'vahan_api_key',
            'vahan_puc_without_otp_url',
            'vahan_puc_send_otp_url',
            'vahan_puc_verify_otp_url',
            'vahan_rc_pdf_url',
            'vahan_rc_pdf_key',
            'vahan_learning_licence_url',
            'vahan_learning_licence_key',
            'vehicle_to_mobile_api_url',
            'vehicle_to_mobile_api_key',
            'vehicle_details_api_url',
            'vehicle_details_api_key',

            // Aadhaar Info & Updates
            'mobile_to_info_api_url',
            'mobile_to_info_api_key',
            'aadhar_to_info_api_url',
            'aadhar_to_info_api_key',
            'aadhar_update_api_key',
            'aadhar_update_mobile_update_url',
            'aadhar_update_dob_change_url',
            'aadhar_update_surname_change_url',
            'aadhar_update_full_name_change_url',

            // PPP
            'ppp_api_key',
            'ppp_aadhar_to_ppp_url',
            'ppp_to_aadhar_url',
            'ppp_to_mobile_url',
            'ppp_to_bank_url',

            // Voter
            'voter_api_key',
            'voter_sir_voter_list_url',
            'voter_mobile_update_url',
            'voter_mobile_update_key',

            // Card Maker & PDF
            'card_maker_api_key',
            'card_maker_voter_card_url',
            'card_maker_aadhar_card_url',
            'card_maker_voter_address_change_url',
            'pdf_api_key',
            'pdf_editor_api_url',

            // ABHA
            'abha_api_url',
            'abha_api_key',
            'abha_client_id',
            'abha_client_secret',

            // Utilities & Portals
            'dhbvn_bill_url',
            'uhbvn_bill_url',
            'saral_status_url',
            'kundli_city_autocomplete_url',
            'ifsc_api_url',
            'pincode_api_url',

            // WhatsApp
            'callmebot_phone',
            'callmebot_api_key',
        ];

        foreach ($fields as $field) {
            if ($request->has($field)) {
                $val = trim((string) $request->input($field, ''));
                Setting::set($field, $val);
            }
        }

        return back()->with('success', '✅ Saari API Settings successfully update ho gayi hain.');
    }
}
