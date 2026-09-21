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
                // IDCard.Store API
                'idcard_store_api_key' => Setting::get('idcard_store_api_key', config('services.idcard_store.api_key', '71ebc340-7c80-4c8f-9613-250094ba27c3')),

                // Nexus API
                'nexus_api_key' => Setting::get('nexus_api_key', config('services.nexus.api_key', '38cc07892c07c566e3ce1a3289c589e284954d7c0e593386')),

                // CallMeBot WhatsApp
                'callmebot_phone'   => Setting::get('callmebot_phone', config('services.callmebot.phone', '')),
                'callmebot_api_key' => Setting::get('callmebot_api_key', config('services.callmebot.api_key', '')),

                // PPP API
                'ppp_api_key'           => Setting::get('ppp_api_key', config('services.ppp.api_key', '')),
                'ppp_aadhar_to_ppp_url' => Setting::get('ppp_aadhar_to_ppp_url', config('services.ppp.aadhar_to_ppp_url', '')),
                'ppp_to_aadhar_url'     => Setting::get('ppp_to_aadhar_url', config('services.ppp.ppp_to_aadhar_url', '')),
                'ppp_to_mobile_url'     => Setting::get('ppp_to_mobile_url', config('services.ppp.ppp_to_mobile_url', '')),
                'ppp_to_bank_url'       => Setting::get('ppp_to_bank_url', config('services.ppp.ppp_to_bank_url', '')),

                // Vahan API
                'vahan_api_key'             => Setting::get('vahan_api_key', config('services.vahan.api_key', '')),
                'vahan_puc_without_otp_url' => Setting::get('vahan_puc_without_otp_url', config('services.vahan.puc_without_otp_url', '')),
                'vahan_puc_send_otp_url'    => Setting::get('vahan_puc_send_otp_url', config('services.vahan.puc_send_otp_url', '')),
                'vahan_puc_verify_otp_url'  => Setting::get('vahan_puc_verify_otp_url', config('services.vahan.puc_verify_otp_url', '')),

                // Voter API
                'voter_api_key'           => Setting::get('voter_api_key', config('services.voter.api_key', '')),
                'voter_sir_voter_list_url' => Setting::get('voter_sir_voter_list_url', config('services.voter.sir_voter_list_url', '')),

                // PDF Editor API
                'pdf_api_key'        => Setting::get('pdf_api_key', config('services.pdf.api_key', '')),
                'pdf_editor_api_url' => Setting::get('pdf_editor_api_url', config('services.pdf.editor_api_url', '')),

                // Card Maker API
                'card_maker_api_key'                 => Setting::get('card_maker_api_key', config('services.card_maker.api_key', '')),
                'card_maker_voter_card_url'           => Setting::get('card_maker_voter_card_url', config('services.card_maker.voter_card_url', '')),
                'card_maker_aadhar_card_url'          => Setting::get('card_maker_aadhar_card_url', config('services.card_maker.aadhar_card_url', '')),
                'card_maker_voter_address_change_url' => Setting::get('card_maker_voter_address_change_url', config('services.card_maker.voter_address_change_url', '')),

                // Aadhar Update API
                'aadhar_update_api_key'              => Setting::get('aadhar_update_api_key', config('services.aadhar_update.api_key', '')),
                'aadhar_update_mobile_update_url'    => Setting::get('aadhar_update_mobile_update_url', config('services.aadhar_update.mobile_update_url', '')),
                'aadhar_update_dob_change_url'       => Setting::get('aadhar_update_dob_change_url', config('services.aadhar_update.dob_change_url', '')),
                'aadhar_update_surname_change_url'   => Setting::get('aadhar_update_surname_change_url', config('services.aadhar_update.surname_change_url', '')),
                'aadhar_update_full_name_change_url' => Setting::get('aadhar_update_full_name_change_url', config('services.aadhar_update.full_name_change_url', '')),
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
            'idcard_store_api_key',
            'nexus_api_key',
            'callmebot_phone',
            'callmebot_api_key',
            'ppp_api_key',
            'ppp_aadhar_to_ppp_url',
            'ppp_to_aadhar_url',
            'ppp_to_mobile_url',
            'ppp_to_bank_url',
            'vahan_api_key',
            'vahan_puc_without_otp_url',
            'vahan_puc_send_otp_url',
            'vahan_puc_verify_otp_url',
            'voter_api_key',
            'voter_sir_voter_list_url',
            'pdf_api_key',
            'pdf_editor_api_url',
            'card_maker_api_key',
            'card_maker_voter_card_url',
            'card_maker_aadhar_card_url',
            'card_maker_voter_address_change_url',
            'aadhar_update_api_key',
            'aadhar_update_mobile_update_url',
            'aadhar_update_dob_change_url',
            'aadhar_update_surname_change_url',
            'aadhar_update_full_name_change_url',
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
