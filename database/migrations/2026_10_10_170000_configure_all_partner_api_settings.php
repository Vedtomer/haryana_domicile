<?php

use Illuminate\Database\Migrations\Migration;
use App\Models\Setting;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $settings = [
            // 1. Aadhar To Farmer All State Pdf
            'farmer_card_pdf_url'                => 'https://good-api-point.com/apis_partner/v1/farmer_card_api/farmer_card_pdf.php',
            
            // 2. Telecom ID Intelligence Verification
            'id_intelligence_api_url'            => 'https://good-api-point.com/apis_partner/v1/telecom_api/id_intelligence.php',

            // 3. Aadhar To Mask PAN
            'aadhar_to_mask_pan_api_url'         => 'https://good-api-point.com/apis_partner/v1/aadhar_card_api/aadhar_to_mask_pan.php',
            'nexus_aadhar_to_mask_pan_url'       => 'https://good-api-point.com/apis_partner/v1/aadhar_card_api/aadhar_to_mask_pan.php',

            // 4. Aadhar to name
            'aadhar_to_name_api_url'             => 'https://good-api-point.com/apis_partner/v1/aadhar_card_api/aadhar_to_name.php',
            'nexus_aadhar_to_name_url'           => 'https://good-api-point.com/apis_partner/v1/aadhar_card_api/aadhar_to_name.php',

            // 5. Aadhar To Pan Unmasked Instant
            'aadhar_to_pan_api_url'              => 'https://good-api-point.com/apis_partner/v1/aadhar_card_api/aadhaar_to_unmasked_pan.php',
            'nexus_aadhar_to_pan_url'            => 'https://good-api-point.com/apis_partner/v1/aadhar_card_api/aadhaar_to_unmasked_pan.php',

            // 6. Aadhar To Ration Find
            'aadhar_to_ration_api_url'           => 'https://good-api-point.com/apis_partner/v1/ration_card_api/uid_to_ration_no.php',

            // 7. UHBVN Electricity Bill
            'uhbvn_bill_url'                     => 'https://uhbvn.org.in/Rapdrp/BD?UID=',

            // 8. DHBVN Electricity Bill
            'dhbvn_bill_url'                     => 'https://dhbvn.org.in/Rapdrp/BD?UID=',

            // 9. Farmer Pdf Sarver All State 2
            'farmer_pdf_server2_url'             => 'https://good-api-point.com/apis_partner/v1/farmer_card_api/farmer_pdf_server2.php',

            // 10. Learning Licence Download
            'vahan_learning_licence_url'         => 'https://good-api-point.com/apis_partner/v1/vahan_service_api/learning_license_pdf.php',

            // 11. Mobile To Pan No. Instant
            'mobile_to_pan_api_url'              => 'https://good-api-point.com/apis_partner/v1/telecom_api/mobile_to_pan.php',
            'nexus_mobile_to_pan_url'            => 'https://good-api-point.com/apis_partner/v1/telecom_api/mobile_to_pan.php',

            // 12. PAN To Aadhaar Unmasked Instant
            'pan_to_aadhar_api_url'              => 'https://good-api-point.com/apis_partner/v1/pan_card_api/pan_to_aadhar.php',
            'nexus_pan_to_aadhar_url'            => 'https://good-api-point.com/apis_partner/v1/pan_card_api/pan_to_aadhar.php',

            // 13. PAN To GST Number Instant
            'pan_to_gst_api_url'                 => 'https://good-api-point.com/apis_partner/v1/pan_card_api/pan_to_gst.php',

            // 14. PAN To Mask Aadhar
            'pan_to_mask_uid_api_url'            => 'https://good-api-point.com/apis_partner/v1/pan_card_api/pan_to_mask_uid.php',

            // 15. Pan To Uid Advance Instant
            'pan_to_uid_api_url'                 => 'https://good-api-point.com/apis_partner/v1/pan_card_api/pan_to_uid_s1.php',
            'nexus_pan_to_uid_url'               => 'https://good-api-point.com/apis_partner/v1/pan_card_api/pan_to_uid_s1.php',

            // 16. Ration Advanse Details
            'ration_advance_details_api_url'     => 'https://good-api-point.com/apis_partner/v1/ration_card_api/up_ration_details.php',

            // 17. Ration Sleep Photo
            'ration_sleep_photo_api_url'         => 'https://good-api-point.com/apis_partner/v1/ration_card_api/bihar_ration_slip.php',

            // 18. Ration Card PDF Download
            'ration_card_pdf_api_url'            => 'https://good-api-point.com/apis_partner/v1/ration_card_api/ration_card_pdf.php',

            // 19. Ration to Aadhaar Find All State
            'ration_to_aadhar_all_state_api_url' => 'https://good-api-point.com/apis_partner/v1/ration_card_api/ration_to_uid_all.php',

            // 20. Ration To Aadhar Find UP
            'ration_to_aadhar_up_api_url'        => 'https://good-api-point.com/apis_partner/v1/ration_card_api/ration_to_uid_up.php',

            // 21. RC CARD INFO
            'vahan_rc_info_api_url'              => 'https://good-api-point.com/apis_partner/v1/vahan_service_api/rc_info_api.php',

            // 22. Rc Pdf Owner Book Print
            'vahan_rc_pdf_url'                   => 'https://good-api-point.com/apis_partner/v1/vahan_service_api/vechil_rc_pdf.php',

            // 23. Rc Pdf Sarver 2
            'vahan_rc_pdf2_url'                  => 'https://good-api-point.com/apis_partner/v1/vahan_service_api/vechil_rc_pdf2.php',

            // 24. Saral Certificate Status
            'saral_status_url'                   => 'https://edisha.gov.in/eForms/Status',

            // 25. Vehicle Challan Check
            'vahan_challan_api_url'              => 'https://good-api-point.com/apis_partner/v1/vahan_service_api/challan_find.php',

            // 26. Vehicle Details (RC)
            'vehicle_details_api_url'            => 'https://good-api-point.com/apis_partner/v1/vahan_service_api/rc_info_api.php',

            // 27. Voter Advanse Info
            'voter_advance_api_url'              => 'https://good-api-point.com/apis_partner/v1/voter_card_api/voter_advance.php',

            // 28. Voter Mobile Update Instant
            'voter_mobile_update_url'            => 'https://good-api-point.com/apis_partner/v1/voter_card_api/voter_mobile_link.php',

            // 29. Voter Name Find
            'voter_name_find_url'                => 'https://good-api-point.com/apis_partner/v1/voter_card_api/voter_to_name.php',
        ];

        foreach ($settings as $key => $value) {
            Setting::set($key, $value);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No reversal needed
    }
};
