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
        'api_key' => env('NEXUS_API_KEY', 'ebee2f1362ef867dc06dee82f9bbef5d1780d7ba9218fe28f6f3217c386a52e1'),
        'api_key_vahan' => env('NEXUS_API_KEY_VAHAN', 'ebee2f1362ef867dc06dee82f9bbef5d1780d7ba9218fe28f6f3217c386a52e1'),
    ],

    'goodapi' => [
        'api_key' => env('GOODAPI_API_KEY', 'ebee2f1362ef867dc06dee82f9bbef5d1780d7ba9218fe28f6f3217c386a52e1'),
        'token_id' => env('GOODAPI_TOKEN_ID', 'aad64221e95f917989f63acd377c94f9054c3d85378ae3f512e6b74e958a4b22'),
        'base_url' => 'https://good-api-point.com/apis_partner/v1/',
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

    'aadhar_update' => [
        'api_key' => env('AADHAR_UPDATE_API_KEY', ''),
        'mobile_update_url' => env('AADHAR_MOBILE_UPDATE_API_URL', ''),
        'dob_change_url' => env('AADHAR_DOB_CHANGE_API_URL', ''),
        'surname_change_url' => env('AADHAR_SURNAME_CHANGE_API_URL', ''),
        'full_name_change_url' => env('AADHAR_FULL_NAME_CHANGE_API_URL', ''),
    ],

    'openrouter' => [
        'api_key' => env('OPENROUTER_API_KEY', ''),
        'base_url' => env('OPENROUTER_BASE_URL', 'https://openrouter.ai/api/v1'),
    ],

    'openai' => [
        'api_key' => env('OPENAI_API_KEY', ''),
    ],

    'payment' => [
        'create_order_url' => env('PAYMENT_CREATE_ORDER_URL', 'https://paycorex.in/api/v1/create_order.php'),
        'verify_url'       => env('PAYMENT_VERIFY_URL', 'https://paycorex.in/api/v1/check_order_status.php'),
        'webhook_url'      => env('PAYMENT_WEBHOOK_URL', ''),
        'api_key'          => env('PAYMENT_API_KEY', '2d7bcd6c2467d343d9f1110ebd59da51'),
        'secret'           => env('PAYMENT_SECRET', ''),
        'merchant_id'      => env('PAYMENT_MERCHANT_ID', '7494945476'),
    ],

];
