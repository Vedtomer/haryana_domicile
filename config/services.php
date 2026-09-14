<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'callmebot' => [
        'phone' => env('CALLMEBOT_PHONE'),
        'api_key' => env('CALLMEBOT_API_KEY'),
    ],

    'nexus' => [
        'api_key' => env('NEXUS_API_KEY', '38cc07892c07c566e3ce1a3289c589e284954d7c0e593386'),
        'api_key_vahan' => env('NEXUS_API_KEY_VAHAN', '38cc07892c07c566e3ce1a3289c589e284954d7c0e593386'),
    ],

    'idcard_store' => [
        'base_url' => env('IDCARD_STORE_BASE_URL') ?: 'https://api.idcard.store',
        'api_key' => env('IDCARD_STORE_API_KEY') ?: '71ebc340-7c80-4c8f-9613-250094ba27c3',
        'cdn_url' => env('IDCARD_STORE_CDN_URL') ?: 'https://idmaker.mfcdn.in/',
    ],

    'ppp' => [
        'api_key' => env('PPP_API_KEY', ''),
        'aadhar_to_ppp_url' => env('PPP_AADHAR_TO_PPP_URL', ''),
        'ppp_to_aadhar_url' => env('PPP_TO_AADHAR_API_URL', ''),
        'ppp_to_mobile_url' => env('PPP_TO_MOBILE_API_URL', ''),
        'ppp_to_bank_url' => env('PPP_TO_BANK_API_URL', ''),
    ],

    'vahan' => [
        'api_key' => env('VAHAN_API_KEY', ''),
        'puc_without_otp_url' => env('PUC_WITHOUT_OTP_API_URL', ''),
        'puc_send_otp_url' => env('PUC_SEND_OTP_API_URL', ''),
        'puc_verify_otp_url' => env('PUC_VERIFY_OTP_API_URL', ''),
    ],

    'voter' => [
        'api_key' => env('VOTER_API_KEY', ''),
        'sir_voter_list_url' => env('SIR_VOTER_LIST_API_URL', ''),
    ],

    'pdf' => [
        'api_key' => env('PDF_API_KEY', ''),
        'editor_api_url' => env('PDF_EDITOR_API_URL', ''),
    ],

    'card_maker' => [
        'api_key' => env('CARD_MAKER_API_KEY', ''),
        'voter_card_url' => env('VOTER_CARD_MAKER_API_URL', ''),
        'aadhar_card_url' => env('AADHAR_CARD_MANUAL_API_URL', ''),
        'voter_address_change_url' => env('VOTER_ADDRESS_CHANGE_API_URL', ''),
    ],

];
