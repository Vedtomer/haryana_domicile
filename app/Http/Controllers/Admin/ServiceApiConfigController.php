<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Service;
use App\Models\Setting;
use Illuminate\Http\Request;

class ServiceApiConfigController extends Controller
{
    /**
     * Comprehensive mapping of service slugs & module keys to their respective API settings.
     */
    public const SERVICE_API_MAP = [
        // PVC Card Maker & Driving Licence & Kundli (Provider: idcard.store)
        'pvc-card-maker' => [
            'name' => 'PVC Card Maker (idcard.store)',
            'provider' => 'IDCard.Store API Gateway',
            'help' => 'IDCard.Store API key (https://idcard.store/u/settings/security)',
            'fields' => [
                [
                    'key' => 'idcard_store_api_key',
                    'label' => 'API Key (Bearer Token)',
                    'type' => 'password',
                    'default' => '4657123a-ccb9-4fb0-b3ed-5e1e24c0e5d5',
                    'placeholder' => 'e.g. 4657123a-ccb9-4fb0-b3ed-5e1e24c0e5d5',
                ],
                [
                    'key' => 'idcard_store_base_url',
                    'label' => 'API Base URL',
                    'type' => 'text',
                    'default' => 'https://api.idcard.store',
                    'placeholder' => 'https://api.idcard.store',
                ],
            ],
        ],
        'aadhaar-pvc-card'          => 'pvc-card-maker',
        'haryana-familyid-pvc'      => 'pvc-card-maker',
        'ayushman-pvc'              => 'pvc-card-maker',
        'voter-pvc-card'            => 'pvc-card-maker',
        'pan-nsdl-pvc'              => 'pvc-card-maker',
        'pan-uti-pvc'               => 'pvc-card-maker',
        'pan-instant-pvc'           => 'pvc-card-maker',
        'eshram-pvc-card'           => 'pvc-card-maker',
        'healthid-pvc'              => 'pvc-card-maker',
        'pmvishwakarma-pvc'         => 'pvc-card-maker',
        'aapar-pvc'                 => 'pvc-card-maker',
        'make-driving-licence-card' => 'pvc-card-maker',
        'driving-licence-card'      => 'pvc-card-maker',
        'kundli'                    => 'pvc-card-maker',

        // Aadhar to NPCI Status
        'aadhar-to-npci-status' => [
            'name' => 'Aadhar to NPCI Status',
            'provider' => 'GoodAPI Partner',
            'help' => 'NPCI Bank Seeding & DBT Status API',
            'fields' => [
                [
                    'key' => 'aadhar_to_npci_api_url',
                    'label' => 'NPCI API URL',
                    'type' => 'text',
                    'default' => 'https://good-api-point.com/apis_partner/v1/bank_info_api/npci_api.php',
                    'placeholder' => 'https://good-api-point.com/apis_partner/v1/bank_info_api/npci_api.php',
                ],
                [
                    'key' => 'aadhar_to_npci_api_key',
                    'label' => 'Partner API Key',
                    'type' => 'password',
                    'default' => 'ebee2f1362ef867dc06dee82f9bbef5d1780d7ba9218fe28f6f3217c386a52e1',
                    'placeholder' => 'e.g. ebee2f1362ef867dc06dee82f9bbef5d1780d7ba9218fe28f6f3217c386a52e1',
                ],
            ],
        ],

        // Aadhar to Name
        'aadhar-to-name' => [
            'name' => 'Aadhaar to Name / Details',
            'provider' => 'GoodAPI Partner',
            'fields' => [
                [
                    'key' => 'aadhar_to_name_api_url',
                    'label' => 'Aadhar to Name URL',
                    'type' => 'text',
                    'default' => 'https://good-api-point.com/apis_partner/v1/aadhar_card_api/aadhar_to_name.php',
                    'placeholder' => 'https://good-api-point.com/apis_partner/v1/aadhar_card_api/aadhar_to_name.php',
                ],
                [
                    'key' => 'aadhar_to_name_api_key',
                    'label' => 'Partner API Key',
                    'type' => 'password',
                    'default' => 'ebee2f1362ef867dc06dee82f9bbef5d1780d7ba9218fe28f6f3217c386a52e1',
                ],
            ],
        ],

        // Aadhar to Mask PAN
        'aadhar-to-mask-pan' => [
            'name' => 'Aadhar to Mask PAN',
            'provider' => 'GoodAPI Partner',
            'fields' => [
                [
                    'key' => 'aadhar_to_mask_pan_api_url',
                    'label' => 'Mask PAN API URL',
                    'type' => 'text',
                    'default' => 'https://good-api-point.com/apis_partner/v1/aadhar_card_api/aadhar_to_mask_pan.php',
                ],
                [
                    'key' => 'aadhar_to_mask_pan_api_key',
                    'label' => 'Partner API Key',
                    'type' => 'password',
                    'default' => 'ebee2f1362ef867dc06dee82f9bbef5d1780d7ba9218fe28f6f3217c386a52e1',
                ],
            ],
        ],

        // Aadhar to PAN (Full / Unmasked)
        'aadhar-to-pan' => [
            'name' => 'Aadhar to PAN (Unmasked)',
            'provider' => 'GoodAPI Partner',
            'fields' => [
                [
                    'key' => 'aadhar_to_pan_api_url',
                    'label' => 'Aadhar to PAN URL',
                    'type' => 'text',
                    'default' => 'https://good-api-point.com/apis_partner/v1/aadhar_card_api/aadhaar_to_unmasked_pan.php',
                ],
                [
                    'key' => 'aadhar_to_pan_api_key',
                    'label' => 'Partner API Key',
                    'type' => 'password',
                    'default' => 'ebee2f1362ef867dc06dee82f9bbef5d1780d7ba9218fe28f6f3217c386a52e1',
                ],
            ],
        ],

        // Mobile to PAN
        'mobile-to-pan' => [
            'name' => 'Mobile to PAN',
            'provider' => 'GoodAPI Partner',
            'fields' => [
                [
                    'key' => 'mobile_to_pan_api_url',
                    'label' => 'Mobile to PAN URL',
                    'type' => 'text',
                    'default' => 'https://good-api-point.com/apis_partner/v1/telecom_api/mobile_to_pan.php',
                ],
                [
                    'key' => 'mobile_to_pan_api_key',
                    'label' => 'Partner API Key',
                    'type' => 'password',
                    'default' => 'ebee2f1362ef867dc06dee82f9bbef5d1780d7ba9218fe28f6f3217c386a52e1',
                ],
            ],
        ],

        // PAN Details Server 2
        'pan-details-server2' => [
            'name' => 'PAN Details Server 2',
            'provider' => 'GoodAPI Partner',
            'fields' => [
                [
                    'key' => 'pan_details_server2_api_url',
                    'label' => 'PAN Server 2 URL',
                    'type' => 'text',
                    'default' => 'https://good-api-point.com/apis_partner/v1/pan_card_api/pan_server2.php',
                ],
                [
                    'key' => 'pan_details_server2_api_key',
                    'label' => 'Partner API Key',
                    'type' => 'password',
                    'default' => 'ebee2f1362ef867dc06dee82f9bbef5d1780d7ba9218fe28f6f3217c386a52e1',
                ],
            ],
        ],

        // PAN Full Details
        'pan-full-details' => [
            'name' => 'PAN Full Details',
            'provider' => 'GoodAPI Partner',
            'fields' => [
                [
                    'key' => 'pan_full_details_api_url',
                    'label' => 'PAN Full Details URL',
                    'type' => 'text',
                    'default' => 'https://good-api-point.com/apis_partner/v1/pan_card_api/pan_full_details.php',
                ],
                [
                    'key' => 'goodapi_api_key',
                    'label' => 'Partner API Key',
                    'type' => 'password',
                    'default' => 'ebee2f1362ef867dc06dee82f9bbef5d1780d7ba9218fe28f6f3217c386a52e1',
                ],
            ],
        ],

        // PAN to Aadhar
        'pan-to-aadhar' => [
            'name' => 'PAN to Aadhar',
            'provider' => 'GoodAPI Partner',
            'fields' => [
                [
                    'key' => 'pan_to_aadhar_api_url',
                    'label' => 'PAN to Aadhar URL',
                    'type' => 'text',
                    'default' => 'https://good-api-point.com/apis_partner/v1/pan_card_api/pan_to_aadhar.php',
                ],
                [
                    'key' => 'goodapi_api_key',
                    'label' => 'Partner API Key',
                    'type' => 'password',
                    'default' => 'ebee2f1362ef867dc06dee82f9bbef5d1780d7ba9218fe28f6f3217c386a52e1',
                ],
            ],
        ],

        // PAN to UID
        'pan-to-uid' => [
            'name' => 'PAN to UID',
            'provider' => 'GoodAPI Partner',
            'fields' => [
                [
                    'key' => 'pan_to_uid_api_url',
                    'label' => 'PAN to UID URL',
                    'type' => 'text',
                    'default' => 'https://good-api-point.com/apis_partner/v1/pan_card_api/pan_to_uid_s1.php',
                ],
                [
                    'key' => 'pan_to_uid_api_key',
                    'label' => 'Partner API Key',
                    'type' => 'password',
                    'default' => 'ebee2f1362ef867dc06dee82f9bbef5d1780d7ba9218fe28f6f3217c386a52e1',
                ],
            ],
        ],

        // PAN to GST
        'pan-to-gst' => [
            'name' => 'PAN to GST',
            'provider' => 'GoodAPI Partner',
            'fields' => [
                [
                    'key' => 'pan_to_gst_api_url',
                    'label' => 'PAN to GST URL',
                    'type' => 'text',
                    'default' => 'https://good-api-point.com/apis_partner/v1/pan_card_api/pan_to_gst.php',
                ],
                [
                    'key' => 'pan_to_gst_api_key',
                    'label' => 'Partner API Key',
                    'type' => 'password',
                    'default' => 'ebee2f1362ef867dc06dee82f9bbef5d1780d7ba9218fe28f6f3217c386a52e1',
                ],
            ],
        ],

        // PAN to Mask Aadhar
        'pan-to-mask-aadhar' => [
            'name' => 'PAN to Mask Aadhar',
            'provider' => 'GoodAPI Partner',
            'fields' => [
                [
                    'key' => 'pan_to_mask_uid_api_url',
                    'label' => 'Mask UID URL',
                    'type' => 'text',
                    'default' => 'https://good-api-point.com/apis_partner/v1/pan_card_api/pan_to_mask_uid.php',
                ],
                [
                    'key' => 'pan_to_mask_uid_api_key',
                    'label' => 'Partner API Key',
                    'type' => 'password',
                    'default' => 'ebee2f1362ef867dc06dee82f9bbef5d1780d7ba9218fe28f6f3217c386a52e1',
                ],
            ],
        ],

        // Vehicle to Mobile
        'vehicle-to-mobile' => [
            'name' => 'Vehicle to Mobile',
            'provider' => 'Paanel Shop / Vahan Gateway',
            'fields' => [
                [
                    'key' => 'vehicle_to_mobile_api_url',
                    'label' => 'Vehicle to Mobile URL',
                    'type' => 'text',
                    'default' => 'https://api.paanel.shop/api/gateway.php',
                ],
                [
                    'key' => 'vehicle_to_mobile_api_key',
                    'label' => 'API Key',
                    'type' => 'password',
                    'default' => 'SamXverma',
                ],
            ],
        ],

        // Vehicle Details
        'vehicle-details' => [
            'name' => 'Vehicle Details',
            'provider' => 'Paanel Shop',
            'fields' => [
                [
                    'key' => 'vehicle_details_api_url',
                    'label' => 'Vehicle Details URL',
                    'type' => 'text',
                    'default' => 'https://api.paanel.shop/api/gateway.php',
                ],
                [
                    'key' => 'vehicle_details_api_key',
                    'label' => 'API Key',
                    'type' => 'password',
                    'default' => 'SamXverma',
                ],
            ],
        ],

        // Vehicle Challan Check
        'vehicle-challan-check' => [
            'name' => 'Vehicle Challan Check',
            'provider' => 'GoodAPI Partner',
            'fields' => [
                [
                    'key' => 'vahan_challan_api_url',
                    'label' => 'Challan API URL',
                    'type' => 'text',
                    'default' => 'https://good-api-point.com/apis_partner/v1/vahan_service_api/challan_find.php',
                ],
                [
                    'key' => 'vahan_challan_api_key',
                    'label' => 'Partner API Key',
                    'type' => 'password',
                    'default' => 'ebee2f1362ef867dc06dee82f9bbef5d1780d7ba9218fe28f6f3217c386a52e1',
                ],
            ],
        ],

        // RC Card Info
        'rc-card-info' => [
            'name' => 'RC Card Info',
            'provider' => 'Paanel Shop',
            'fields' => [
                [
                    'key' => 'vahan_rc_info_api_url',
                    'label' => 'RC Info URL',
                    'type' => 'text',
                    'default' => 'https://api.paanel.shop/api/gateway.php',
                ],
                [
                    'key' => 'vahan_rc_info_api_key',
                    'label' => 'API Key',
                    'type' => 'password',
                    'default' => 'SamXverma',
                ],
            ],
        ],

        // RC PDF Download
        'rc-pdf' => [
            'name' => 'RC PDF Download (Server 1)',
            'provider' => 'GoodAPI Partner',
            'fields' => [
                [
                    'key' => 'vahan_rc_pdf_url',
                    'label' => 'RC PDF Server 1 URL',
                    'type' => 'text',
                    'default' => 'https://good-api-point.com/apis_partner/v1/vahan_service_api/vechil_rc_pdf.php',
                ],
                [
                    'key' => 'vahan_rc_pdf_key',
                    'label' => 'Partner API Key',
                    'type' => 'password',
                    'default' => 'ebee2f1362ef867dc06dee82f9bbef5d1780d7ba9218fe28f6f3217c386a52e1',
                ],
            ],
        ],
        'rc-pdf-server2' => [
            'name' => 'RC PDF Download (Server 2)',
            'provider' => 'GoodAPI Partner',
            'fields' => [
                [
                    'key' => 'vahan_rc_pdf2_url',
                    'label' => 'RC PDF Server 2 URL',
                    'type' => 'text',
                    'default' => 'https://good-api-point.com/apis_partner/v1/vahan_service_api/vechil_rc_pdf2.php',
                ],
                [
                    'key' => 'vahan_rc_pdf2_key',
                    'label' => 'Partner API Key',
                    'type' => 'password',
                    'default' => 'ebee2f1362ef867dc06dee82f9bbef5d1780d7ba9218fe28f6f3217c386a52e1',
                ],
            ],
        ],

        // Learning Licence PDF
        'learning-licence-pdf' => [
            'name' => 'Learning Licence PDF',
            'provider' => 'GoodAPI Partner',
            'fields' => [
                [
                    'key' => 'vahan_learning_licence_url',
                    'label' => 'Learning Licence URL',
                    'type' => 'text',
                    'default' => 'https://good-api-point.com/apis_partner/v1/vahan_service_api/learning_license_pdf.php',
                ],
                [
                    'key' => 'vahan_learning_licence_key',
                    'label' => 'Partner API Key',
                    'type' => 'password',
                    'default' => 'ebee2f1362ef867dc06dee82f9bbef5d1780d7ba9218fe28f6f3217c386a52e1',
                ],
            ],
        ],

        // Mobile to Info
        'mobile-to-info' => [
            'name' => 'Mobile to Info',
            'provider' => 'ApiNice Gateway',
            'fields' => [
                [
                    'key' => 'mobile_to_info_api_url',
                    'label' => 'Mobile to Info URL',
                    'type' => 'text',
                    'default' => 'https://apinice.in/api/v1/mobile_number_info?apiKey=Y3VK89K8V8&mobile=9876543210',
                ],
                [
                    'key' => 'mobile_to_info_api_key',
                    'label' => 'API Key',
                    'type' => 'password',
                    'default' => 'Y3VK89K8V8',
                ],
            ],
        ],

        // Aadhar to Info
        'aadhar-to-info' => [
            'name' => 'Aadhar to Info',
            'provider' => 'Paanel Shop',
            'fields' => [
                [
                    'key' => 'aadhar_to_info_api_url',
                    'label' => 'Aadhar to Info URL',
                    'type' => 'text',
                    'default' => 'https://api.paanel.shop/api/gateway.php',
                ],
                [
                    'key' => 'aadhar_to_info_api_key',
                    'label' => 'API Key',
                    'type' => 'password',
                    'default' => 'SamXverma',
                ],
            ],
        ],

        // Aadhar to Ration
        'aadhar-to-ration' => [
            'name' => 'Aadhar to Ration Card Number',
            'provider' => 'GoodAPI Partner',
            'fields' => [
                [
                    'key' => 'aadhar_to_ration_api_url',
                    'label' => 'Aadhar to Ration URL',
                    'type' => 'text',
                    'default' => 'https://good-api-point.com/apis_partner/v1/ration_card_api/uid_to_ration_no.php',
                ],
                [
                    'key' => 'aadhar_to_ration_api_key',
                    'label' => 'Partner API Key',
                    'type' => 'password',
                    'default' => 'ebee2f1362ef867dc06dee82f9bbef5d1780d7ba9218fe28f6f3217c386a52e1',
                ],
            ],
        ],

        // Ration Card PDF
        'ration-card-pdf' => [
            'name' => 'Ration Card PDF Download',
            'provider' => 'GoodAPI Partner',
            'fields' => [
                [
                    'key' => 'ration_card_pdf_api_url',
                    'label' => 'Ration PDF URL',
                    'type' => 'text',
                    'default' => 'https://good-api-point.com/apis_partner/v1/ration_card_api/ration_card_pdf.php',
                ],
                [
                    'key' => 'ration_card_pdf_api_key',
                    'label' => 'Partner API Key',
                    'type' => 'password',
                    'default' => 'ebee2f1362ef867dc06dee82f9bbef5d1780d7ba9218fe28f6f3217c386a52e1',
                ],
            ],
        ],

        // Ration to Aadhar All State
        'ration-to-aadhar-all-state' => [
            'name' => 'Ration to Aadhar All State',
            'provider' => 'GoodAPI Partner',
            'fields' => [
                [
                    'key' => 'ration_to_aadhar_all_state_api_url',
                    'label' => 'All State Ration URL',
                    'type' => 'text',
                    'default' => 'https://good-api-point.com/apis_partner/v1/ration_card_api/ration_to_uid_all.php',
                ],
                [
                    'key' => 'ration_to_aadhar_all_state_api_key',
                    'label' => 'Partner API Key',
                    'type' => 'password',
                    'default' => 'ebee2f1362ef867dc06dee82f9bbef5d1780d7ba9218fe28f6f3217c386a52e1',
                ],
            ],
        ],

        // Ration to Aadhar UP
        'ration-to-aadhar-up' => [
            'name' => 'Ration to Aadhar UP',
            'provider' => 'GoodAPI Partner',
            'fields' => [
                [
                    'key' => 'ration_to_aadhar_up_api_url',
                    'label' => 'UP Ration to Aadhar URL',
                    'type' => 'text',
                    'default' => 'https://good-api-point.com/apis_partner/v1/ration_card_api/ration_to_uid_up.php',
                ],
                [
                    'key' => 'ration_to_aadhar_up_api_key',
                    'label' => 'Partner API Key',
                    'type' => 'password',
                    'default' => 'ebee2f1362ef867dc06dee82f9bbef5d1780d7ba9218fe28f6f3217c386a52e1',
                ],
            ],
        ],

        // Ration Advance Details
        'ration-advance-details' => [
            'name' => 'Ration Advance Details (UP)',
            'provider' => 'GoodAPI Partner',
            'fields' => [
                [
                    'key' => 'ration_advance_details_api_url',
                    'label' => 'Ration Advance URL',
                    'type' => 'text',
                    'default' => 'https://good-api-point.com/apis_partner/v1/ration_card_api/up_ration_details.php',
                ],
                [
                    'key' => 'ration_advance_details_api_key',
                    'label' => 'Partner API Key',
                    'type' => 'password',
                    'default' => 'ebee2f1362ef867dc06dee82f9bbef5d1780d7ba9218fe28f6f3217c386a52e1',
                ],
            ],
        ],

        // Bihar Ration Slip Photo
        'ration-sleep-photo' => [
            'name' => 'Bihar Ration Slip with Photo',
            'provider' => 'GoodAPI Partner',
            'fields' => [
                [
                    'key' => 'ration_sleep_photo_api_url',
                    'label' => 'Bihar Slip URL',
                    'type' => 'text',
                    'default' => 'https://good-api-point.com/apis_partner/v1/ration_card_api/bihar_ration_slip.php',
                ],
                [
                    'key' => 'ration_sleep_photo_api_key',
                    'label' => 'Partner API Key',
                    'type' => 'password',
                    'default' => 'ebee2f1362ef867dc06dee82f9bbef5d1780d7ba9218fe28f6f3217c386a52e1',
                ],
            ],
        ],

        // Farmer Card PDF (Server 1 & 2)
        'aadhar-to-farmer-pdf' => [
            'name' => 'Farmer Card PDF Server 1',
            'provider' => 'GoodAPI Partner',
            'fields' => [
                [
                    'key' => 'farmer_card_pdf_url',
                    'label' => 'Farmer PDF Server 1 URL',
                    'type' => 'text',
                    'default' => 'https://good-api-point.com/apis_partner/v1/farmer_card_api/farmer_card_pdf.php',
                ],
                [
                    'key' => 'farmer_card_pdf_key',
                    'label' => 'Partner API Key',
                    'type' => 'password',
                    'default' => 'ebee2f1362ef867dc06dee82f9bbef5d1780d7ba9218fe28f6f3217c386a52e1',
                ],
            ],
        ],
        'farmer-pdf-server2' => [
            'name' => 'Farmer Card PDF Server 2',
            'provider' => 'GoodAPI Partner',
            'fields' => [
                [
                    'key' => 'farmer_pdf_server2_url',
                    'label' => 'Farmer PDF Server 2 URL',
                    'type' => 'text',
                    'default' => 'https://good-api-point.com/apis_partner/v1/farmer_card_api/farmer_pdf_server2.php',
                ],
                [
                    'key' => 'farmer_pdf_server2_key',
                    'label' => 'Partner API Key',
                    'type' => 'password',
                    'default' => 'ebee2f1362ef867dc06dee82f9bbef5d1780d7ba9218fe28f6f3217c386a52e1',
                ],
            ],
        ],

        // ID Intelligence
        'aadhar-to-id-intelligence' => [
            'name' => 'Aadhaar ID Intelligence',
            'provider' => 'GoodAPI Partner',
            'fields' => [
                [
                    'key' => 'id_intelligence_api_url',
                    'label' => 'ID Intelligence URL',
                    'type' => 'text',
                    'default' => 'https://good-api-point.com/apis_partner/v1/telecom_api/id_intelligence.php',
                ],
                [
                    'key' => 'id_intelligence_api_key',
                    'label' => 'Partner API Key',
                    'type' => 'password',
                    'default' => 'ebee2f1362ef867dc06dee82f9bbef5d1780d7ba9218fe28f6f3217c386a52e1',
                ],
            ],
        ],

        // Voter Mobile Update
        'voter-mobile-update' => [
            'name' => 'Voter Mobile Update',
            'provider' => 'GoodAPI Partner',
            'fields' => [
                [
                    'key' => 'voter_mobile_update_url',
                    'label' => 'Voter Mobile Link URL',
                    'type' => 'text',
                    'default' => 'https://good-api-point.com/apis_partner/v1/voter_card_api/voter_mobile_link.php',
                ],
                [
                    'key' => 'voter_mobile_update_key',
                    'label' => 'Partner API Key',
                    'type' => 'password',
                    'default' => 'ebee2f1362ef867dc06dee82f9bbef5d1780d7ba9218fe28f6f3217c386a52e1',
                ],
            ],
        ],

        // Voter Advance Info
        'voter-advance-info' => [
            'name' => 'Voter Advance Info',
            'provider' => 'GoodAPI Partner',
            'fields' => [
                [
                    'key' => 'voter_advance_api_url',
                    'label' => 'Voter Advance URL',
                    'type' => 'text',
                    'default' => 'https://good-api-point.com/apis_partner/v1/voter_card_api/voter_advance.php',
                ],
                [
                    'key' => 'voter_advance_api_key',
                    'label' => 'Partner API Key',
                    'type' => 'password',
                    'default' => 'ebee2f1362ef867dc06dee82f9bbef5d1780d7ba9218fe28f6f3217c386a52e1',
                ],
            ],
        ],

        // Voter Name Find
        'voter-name-find' => [
            'name' => 'Voter Name Find',
            'provider' => 'GoodAPI Partner',
            'fields' => [
                [
                    'key' => 'voter_name_find_url',
                    'label' => 'Voter Name Find URL',
                    'type' => 'text',
                    'default' => 'https://good-api-point.com/apis_partner/v1/voter_card_api/voter_to_name.php',
                ],
                [
                    'key' => 'voter_name_find_key',
                    'label' => 'Partner API Key',
                    'type' => 'password',
                    'default' => 'ebee2f1362ef867dc06dee82f9bbef5d1780d7ba9218fe28f6f3217c386a52e1',
                ],
            ],
        ],

        // Family ID to Mobile
        'family-id-to-mobile' => [
            'name' => 'Family ID to Mobile',
            'provider' => 'Paanel Shop / Gateway',
            'fields' => [
                [
                    'key' => 'family_id_to_mobile_api_url',
                    'label' => 'Family ID to Mobile URL',
                    'type' => 'text',
                    'default' => 'https://api.paanel.shop/api/gateway.php',
                ],
                [
                    'key' => 'family_id_to_mobile_api_key',
                    'label' => 'API Key',
                    'type' => 'password',
                    'default' => 'SamXverma',
                ],
            ],
        ],

        // Aadhar to PPP ID
        'aadhar-to-ppp-id' => [
            'name' => 'Aadhar to PPP / Family ID',
            'provider' => 'Fasal Haryana Portal',
            'fields' => [
                [
                    'key' => 'ppp_aadhar_to_ppp_url',
                    'label' => 'Aadhar to PPP URL',
                    'type' => 'text',
                    'default' => 'https://fasal.haryana.gov.in/Home/GetFDbyAadhar',
                ],
                [
                    'key' => 'ppp_api_key',
                    'label' => 'API Key (Optional)',
                    'type' => 'password',
                    'default' => '',
                ],
            ],
        ],

        // Aadhaar Updates
        'aadhar-mobile-update' => [
            'name' => 'Aadhaar Mobile Update',
            'provider' => 'Aadhaar Update Gateway',
            'fields' => [
                [
                    'key' => 'aadhar_update_mobile_update_url',
                    'label' => 'Mobile Update Gateway URL',
                    'type' => 'text',
                ],
                [
                    'key' => 'aadhar_update_api_key',
                    'label' => 'API Key',
                    'type' => 'password',
                ],
            ],
        ],
        'aadhar-dob-change' => [
            'name' => 'Aadhaar DOB Change',
            'provider' => 'Aadhaar Update Gateway',
            'fields' => [
                [
                    'key' => 'aadhar_update_dob_change_url',
                    'label' => 'DOB Change Gateway URL',
                    'type' => 'text',
                ],
                [
                    'key' => 'aadhar_update_api_key',
                    'label' => 'API Key',
                    'type' => 'password',
                ],
            ],
        ],
        'aadhar-surname-change' => [
            'name' => 'Aadhaar Surname Change',
            'provider' => 'Aadhaar Update Gateway',
            'fields' => [
                [
                    'key' => 'aadhar_update_surname_change_url',
                    'label' => 'Surname Change Gateway URL',
                    'type' => 'text',
                ],
                [
                    'key' => 'aadhar_update_api_key',
                    'label' => 'API Key',
                    'type' => 'password',
                ],
            ],
        ],
        'aadhar-fullname-change' => [
            'name' => 'Aadhaar Full Name Change',
            'provider' => 'Aadhaar Update Gateway',
            'fields' => [
                [
                    'key' => 'aadhar_update_full_name_change_url',
                    'label' => 'Full Name Change Gateway URL',
                    'type' => 'text',
                ],
                [
                    'key' => 'aadhar_update_api_key',
                    'label' => 'API Key',
                    'type' => 'password',
                ],
            ],
        ],

        // ABHA Health ID
        'abha-health-id' => [
            'name' => 'ABHA Health ID (ABDM)',
            'provider' => 'National Health Authority',
            'fields' => [
                [
                    'key' => 'abha_api_url',
                    'label' => 'ABHA API URL',
                    'type' => 'text',
                    'default' => 'https://abha.abdm.gov.in/abha/v3',
                ],
                [
                    'key' => 'abha_client_id',
                    'label' => 'Client ID',
                    'type' => 'text',
                ],
                [
                    'key' => 'abha_client_secret',
                    'label' => 'Client Secret',
                    'type' => 'password',
                ],
                [
                    'key' => 'abha_api_key',
                    'label' => 'API Key / Token',
                    'type' => 'password',
                ],
            ],
        ],
    ];

    /**
     * Resolve configuration schema for a given service slug or module key.
     */
    protected function resolveConfigForSlug(string $slug): ?array
    {
        $cleanSlug = trim(strtolower($slug));

        // Direct match
        if (isset(self::SERVICE_API_MAP[$cleanSlug])) {
            $val = self::SERVICE_API_MAP[$cleanSlug];
            if (is_string($val) && isset(self::SERVICE_API_MAP[$val])) {
                return self::SERVICE_API_MAP[$val];
            }
            return $val;
        }

        // Check if it's a PVC variant
        if (str_contains($cleanSlug, 'pvc') || str_contains($cleanSlug, 'card-maker') || str_contains($cleanSlug, 'driving-licence')) {
            return self::SERVICE_API_MAP['pvc-card-maker'];
        }

        // Generic fallback for any other service
        return [
            'name' => ucwords(str_replace(['-', '_'], ' ', $cleanSlug)),
            'provider' => 'Custom Service Gateway',
            'help' => 'Configure custom API endpoint and authentication credentials',
            'fields' => [
                [
                    'key' => "{$cleanSlug}_api_url",
                    'label' => 'API Endpoint URL',
                    'type' => 'text',
                    'placeholder' => 'https://api.example.com/v1/endpoint',
                ],
                [
                    'key' => "{$cleanSlug}_api_key",
                    'label' => 'API Key / Token',
                    'type' => 'password',
                    'placeholder' => 'Enter API Key',
                ],
            ],
        ];
    }

    /**
     * Get the API configuration and current saved values for a specific service.
     */
    public function getServiceConfig(Request $request)
    {
        $user = auth()->user();
        $isStaff = $user && ($user->isAdmin() || $user->hasRole('admin') || $user->hasRole('super_admin') || in_array($user->type, ['admin', 'super_admin']));

        if (!$isStaff) {
            return response()->json(['success' => false, 'message' => 'Unauthorized access.'], 403);
        }

        $slug = $request->query('service_slug') ?: ($request->query('slug') ?: $request->query('module_key'));
        $serviceId = $request->query('service_id');
        if (!$slug && $serviceId) {
            $svc = Service::find($serviceId);
            if ($svc) {
                $slug = $svc->slug ?: $svc->module_key;
            }
        }

        if (!$slug) {
            return response()->json(['success' => false, 'message' => 'Service identifier is required.'], 400);
        }

        $config = $this->resolveConfigForSlug($slug);
        if (!$config) {
            return response()->json(['success' => false, 'message' => 'No API configuration available for this service.'], 404);
        }

        // Fetch current values from settings table
        $values = [];
        $primaryKeyField = null;
        foreach ($config['fields'] as $field) {
            $default = $field['default'] ?? '';
            $values[$field['key']] = Setting::get($field['key'], $default);

            if (!$primaryKeyField && ($field['type'] === 'password' || str_contains($field['key'], 'key'))) {
                $primaryKeyField = $field;
            }
        }

        if (!$primaryKeyField && !empty($config['fields'])) {
            $primaryKeyField = $config['fields'][0];
        }

        $currentApiKey = $primaryKeyField ? ($values[$primaryKeyField['key']] ?? '') : '';

        return response()->json([
            'success' => true,
            'service_slug' => $slug,
            'name' => $config['name'],
            'provider' => $config['provider'] ?? 'API Provider',
            'help' => $config['help'] ?? null,
            'api_key' => $currentApiKey,
            'api_key_field' => $primaryKeyField ? $primaryKeyField['key'] : 'api_key',
            'api_key_label' => $primaryKeyField['label'] ?? 'API Key',
            'api_key_placeholder' => $primaryKeyField['placeholder'] ?? 'अपनी API Key यहाँ दर्ज करें...',
            'api_key_default' => $primaryKeyField['default'] ?? '',
            'fields' => $config['fields'],
            'values' => $values,
        ]);
    }

    /**
     * Save the updated API settings for a specific service.
     */
    public function saveServiceConfig(Request $request)
    {
        $user = auth()->user();
        $isStaff = $user && ($user->isAdmin() || $user->hasRole('admin') || $user->hasRole('super_admin') || in_array($user->type, ['admin', 'super_admin']));

        if (!$isStaff) {
            return response()->json(['success' => false, 'message' => 'Unauthorized access.'], 403);
        }

        $slug = $request->input('service_slug') ?: ($request->input('slug') ?: $request->input('module_key'));
        $serviceId = $request->input('service_id');
        if (!$slug && $serviceId) {
            $svc = Service::find($serviceId);
            if ($svc) {
                $slug = $svc->slug ?: $svc->module_key;
            }
        }

        $config = $this->resolveConfigForSlug((string) $slug);

        // Find primary API Key field
        $primaryKeyField = null;
        if ($config && !empty($config['fields'])) {
            foreach ($config['fields'] as $field) {
                if ($field['type'] === 'password' || str_contains($field['key'], 'key')) {
                    $primaryKeyField = $field;
                    break;
                }
            }
            if (!$primaryKeyField) {
                $primaryKeyField = $config['fields'][0];
            }
        }

        // 1. Direct single 'api_key' input support
        $singleApiKey = $request->input('api_key');
        if ($singleApiKey !== null) {
            $cleanKeyVal = trim((string) $singleApiKey);

            if ($primaryKeyField) {
                Setting::set($primaryKeyField['key'], $cleanKeyVal);
            }

            // Automatically ensure all default URLs are populated so the API starts working instantly
            if ($config && !empty($config['fields'])) {
                foreach ($config['fields'] as $field) {
                    if (str_contains($field['key'], 'url') && !empty($field['default'])) {
                        $currentUrl = trim((string) Setting::get($field['key'], ''));
                        if (empty($currentUrl)) {
                            Setting::set($field['key'], $field['default']);
                        }
                    }
                }
            }

            // PVC / IDCard Store automatic base url wiring
            $cleanSlug = strtolower(trim((string) $slug));
            if (str_contains($cleanSlug, 'pvc') || str_contains($cleanSlug, 'card-maker') || str_contains($cleanSlug, 'driving-licence') || $cleanSlug === 'kundli') {
                Setting::set('idcard_store_api_key', $cleanKeyVal);
                Setting::set('idcard_store_base_url', 'https://api.idcard.store');
            }

            // NPCI automatic endpoint wiring
            if ($cleanSlug === 'aadhar-to-npci-status') {
                Setting::set('aadhar_to_npci_api_key', $cleanKeyVal);
                Setting::set('aadhar_to_npci_api_url', 'https://good-api-point.com/apis_partner/v1/bank_info_api/npci_api.php');
            }

            return response()->json([
                'success' => true,
                'message' => 'API Key सफलतापूर्वक सेव हो गई! यह सर्विस अब एक्टिव है।',
            ]);
        }

        // 2. Multi-field settings dictionary support
        $settings = $request->input('settings', []);
        if (empty($settings) || !is_array($settings)) {
            return response()->json(['success' => false, 'message' => 'No settings or API key provided to save.'], 400);
        }

        foreach ($settings as $key => $val) {
            $cleanKey = trim($key);
            $cleanVal = trim((string) $val);

            // Special sanitization for IDCard Store base URL to prevent /card path pollution
            if ($cleanKey === 'idcard_store_base_url') {
                $cleanVal = rtrim($cleanVal, '/');
                if (empty($cleanVal) || str_contains($cleanVal, 'idcard.store')) {
                    $cleanVal = 'https://api.idcard.store';
                }
            }

            Setting::set($cleanKey, $cleanVal);
        }

        return response()->json([
            'success' => true,
            'message' => 'API settings saved successfully! Changes are live immediately.',
        ]);
    }
}
