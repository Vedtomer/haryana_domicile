<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;

class Service extends Model
{
    use SoftDeletes;
    const KIND_MODULE = 'module';   // user fills a built-in form, coins deducted instantly
    const KIND_MANUAL = 'manual';   // user submits a request, admin processes it

    const VISIBILITY_PUBLIC = 'public';
    const VISIBILITY_PRIVATE = 'private';

    /**
     * Built-in modules that already exist in the project. Admins can change the
     * coin cost / visibility of these but not their wiring.
     */
    const MODULES = [
        'qr_to_print' => [
            'label' => 'QR to Print (Smart Counter)',
            'model' => null,
            'index' => '/admin/qr-to-print',
            'create' => '/admin/qr-to-print',
        ],
        'marriage_form' => [
            'label' => 'Marriage Certificate',
            'model' => MarriageForm::class,
            'index' => '/admin/marriage-forms',
            'create' => '/admin/marriage-forms/create',
        ],
        'marriage_affidavit' => [
            'label' => 'New Marriage Certificate',
            'model' => MarriageAffidavit::class,
            'index' => '/admin/marriage-affidavits',
            'create' => '/admin/marriage-affidavits/create',
        ],
        'birth_record' => [
            'label' => 'Birth Certificate Name Add',
            'model' => BirthRecord::class,
            'index' => '/admin/birth-records',
            'create' => '/admin/birth-records/create',
        ],
        'birth_certificate_download' => [
            'label' => 'Birth Certificate Document Merger',
            'icon' => '👶',
            'model' => null,
            'index' => '/utilities/birth-certificate',
            'create' => '/utilities/birth-certificate',
        ],
        'haryana_domicile' => [
            'label' => 'Haryana Domicile',
            'model' => HaryanaDomicile::class,
            'index' => '/admin/haryana-domicile',
            'create' => '/admin/haryana-domicile/create',
        ],
        'pan_request' => [
            'label' => 'PAN Card',
            'model' => PanRequest::class,
            'index' => '/admin/pan-requests',
            'create' => '/admin/pan-requests/create',
        ],
        'manual_pan_card' => [
            'label' => 'Manual PAN Card',
            'model' => ManualPanCard::class,
            'index' => '/admin/manual-pan-cards',
            'create' => '/admin/manual-pan-cards/create',
        ],
        'electricity_bill' => [
            'label' => 'Electricity Bill',
            'model' => null,
            'index' => '/utilities/dhbvn-electricity-bill',
            'create' => '/utilities/dhbvn-electricity-bill',
        ],
        'dhbvn_electricity_bill' => [
            'label' => 'DHBVN Electricity Bill',
            'model' => null,
            'index' => '/utilities/dhbvn-electricity-bill',
            'create' => '/utilities/dhbvn-electricity-bill',
        ],
        'uhbvn_electricity_bill' => [
            'label' => 'UHBVN Electricity Bill',
            'model' => null,
            'index' => '/utilities/uhbvn-electricity-bill',
            'create' => '/utilities/uhbvn-electricity-bill',
        ],
        'ayushman_3lakh_income_make' => [
            'label' => 'Ayushman 3Lakh Income Make',
            'icon' => '🏥',
            'model' => null,
            'index' => '/utilities/ayushman-3lakh-income-make',
            'create' => '/utilities/ayushman-3lakh-income-make',
        ],
        'crs_portal' => [
            'label' => 'Birth Certificate Download',
            'icon' => '👶',
            'model' => null,
            'index' => '/utilities/birth-certificate',
            'create' => '/utilities/birth-certificate',
        ],
        'vehicle_details' => [
            'label' => 'Vehicle Details',
            'model' => null,
            'index' => '/utilities/vehicle-details',
            'create' => '/utilities/vehicle-details',
        ],
        'aadhar_to_family_id' => [
            'label' => 'Aadhar to Family ID',
            'model' => null,
            'index' => '/utilities/aadhar-to-family-id',
            'create' => '/utilities/aadhar-to-family-id',
        ],
        'aadhar_to_pan' => [
            'label' => 'Aadhar To Pan Unmasked Instant',
            'model' => null,
            'index' => '/utilities/aadhar-to-pan',
            'create' => '/utilities/aadhar-to-pan',
        ],
        'saral_status' => [
            'label' => 'Saral Certificate Status',
            'model' => null,
            'index' => '/utilities/saral-status',
            'create' => '/utilities/saral-status',
        ],
        'aadhar_to_name' => [
            'label' => 'Aadhar To Name',
            'model' => null,
            'index' => '/utilities/aadhar-to-name',
            'create' => '/utilities/aadhar-to-name',
        ],
        'aadhar_to_mask_pan' => [
            'label' => 'Aadhar To Pan Mask',
            'model' => null,
            'index' => '/utilities/aadhar-to-mask-pan',
            'create' => '/utilities/aadhar-to-mask-pan',
        ],
        'aadhar_to_info' => [
            'label' => 'Aadhaar No. To Info',
            'icon' => '🪪',
            'model' => null,
            'index' => '/utilities/aadhar-to-info',
            'create' => '/utilities/aadhar-to-info',
        ],
        'bihar_ration_card_maker' => [
            'label' => 'Bihar Ration Card Maker',
            'icon' => '📜',
            'model' => null,
            'index' => '/utilities/bihar-ration-card-maker',
            'create' => '/utilities/bihar-ration-card-maker',
        ],
        'aadhaar_services' => [
            'label' => 'Aadhaar Services',
            'model' => null,
            'index' => '/utilities/aadhaar-services',
            'create' => '/utilities/aadhaar-services',
        ],
        'pdf_resizer' => [
            'label' => 'PDF Resizer',
            'model' => null,
            'index' => '/utilities/pdf-resizer',
            'create' => '/utilities/pdf-resizer',
        ],
        'vehicle_to_mobile' => [
            'label' => 'Vehicle to Mobile Number',
            'model' => null,
            'index' => '/utilities/vehicle-to-mobile',
            'create' => '/utilities/vehicle-to-mobile',
        ],
        'passport_maker' => [
            'label' => 'Passport Photo Maker',
            'model' => null,
            'index' => '/utilities/passport-maker',
            'create' => '/utilities/passport-maker',
        ],
        'passport_apply' => [
            'label' => 'Passport Apply',
            'model' => null,
            'index' => '/utilities/passport-apply',
            'create' => '/utilities/passport-apply',
        ],
        'airtel_passbook' => [
            'label' => 'Airtel Passbook',
            'model' => AirtelPassbook::class,
            'index' => '/admin/airtel-passbook',
            'create' => '/admin/airtel-passbook/create',
        ],
        'pan_full_details_instant' => [
            'label' => 'PAN Full Details Instant',
            'model' => null,
            'index' => '/utilities/pan-full-details-instant',
            'create' => '/utilities/pan-full-details-instant',
        ],
        'pan_to_aadhar_unmasked' => [
            'label' => 'PAN To Aadhaar Unmasked Instant',
            'model' => null,
            'index' => '/utilities/pan-to-aadhar-unmasked',
            'create' => '/utilities/pan-to-aadhar-unmasked',
        ],
        'pan_to_uid_advance' => [
            'label' => 'Pan To Uid Advance Instant',
            'model' => null,
            'index' => '/utilities/pan-to-uid-advance',
            'create' => '/utilities/pan-to-uid-advance',
        ],
        'learning_licence_pdf' => [
            'label' => 'Learning Licence Download',
            'model' => null,
            'index' => '/utilities/learning-licence-pdf',
            'create' => '/utilities/learning-licence-pdf',
        ],
        'voter_mobile_update' => [
            'label' => 'Voter Mobile Update Instant',
            'model' => null,
            'index' => '/utilities/voter-mobile-update',
            'create' => '/utilities/voter-mobile-update',
        ],
        'mobile_to_pan' => [
            'label' => 'Mobile To Pan No. Instant',
            'model' => null,
            'index' => '/utilities/mobile-to-pan',
            'create' => '/utilities/mobile-to-pan',
        ],
        'rc_pdf_instant' => [
            'label' => 'Rc Pdf Instant',
            'model' => null,
            'index' => '/utilities/rc-pdf-instant',
            'create' => '/utilities/rc-pdf-instant',
        ],
        'pvc_card_maker' => [
            'label' => 'Smart PVC Card Maker',
            'model' => null,
            'index' => '/utilities/pvc-card-maker',
            'create' => '/utilities/pvc-card-maker',
        ],
        'aadhaar_pvc' => [
            'label' => 'Aadhaar PVC Card Maker',
            'icon' => '🔍',
            'index' => '/utilities/pvc-card-maker?card=aadhaar',
            'create' => '/utilities/pvc-card-maker?card=aadhaar',
        ],
        'haryana_familyid_pvc' => [
            'label' => 'Haryana Family ID PVC Card',
            'model' => null,
            'index' => '/utilities/pvc-card-maker?card=haryana_familyid',
            'create' => '/utilities/pvc-card-maker?card=haryana_familyid',
        ],
        'ayushman_pvc' => [
            'label' => 'Ayushman Bharat PVC Card',
            'model' => null,
            'index' => '/utilities/pvc-card-maker?card=ayushman',
            'create' => '/utilities/pvc-card-maker?card=ayushman',
        ],
        'voter_pvc' => [
            'label' => 'Voter (E-EPIC) PVC Card',
            'model' => null,
            'index' => '/utilities/pvc-card-maker?card=voter_epic',
            'create' => '/utilities/pvc-card-maker?card=voter_epic',
        ],
        'pan_nsdl_pvc' => [
            'label' => 'PAN Card (NSDL) PVC',
            'model' => null,
            'index' => '/utilities/pvc-card-maker?card=pan_nsdl',
            'create' => '/utilities/pvc-card-maker?card=pan_nsdl',
        ],
        'pan_uti_pvc' => [
            'label' => 'PAN Card (UTIITSL) PVC',
            'model' => null,
            'index' => '/utilities/pvc-card-maker?card=pan_uti',
            'create' => '/utilities/pvc-card-maker?card=pan_uti',
        ],
        'pan_instant_pvc' => [
            'label' => 'PAN Card (Instant e-Filing) PVC',
            'model' => null,
            'index' => '/utilities/pvc-card-maker?card=pan_incometax',
            'create' => '/utilities/pvc-card-maker?card=pan_incometax',
        ],
        'eshram_pvc' => [
            'label' => 'e-Shram PVC Card Maker',
            'model' => null,
            'index' => '/utilities/pvc-card-maker?card=eshram',
            'create' => '/utilities/pvc-card-maker?card=eshram',
        ],
        'make_driving_licence_card' => [
            'label' => 'Make Driving Licence (Cards)',
            'model' => null,
            'index' => '/utilities/make-driving-licence-card',
            'create' => '/utilities/make-driving-licence-card',
        ],
        'driving_licence_pvc' => [
            'label' => 'Make Driving Licence (Cards)',
            'model' => null,
            'index' => '/utilities/make-driving-licence-card',
            'create' => '/utilities/make-driving-licence-card',
        ],
        'healthid_pvc' => [
            'label' => 'ABHA Health ID PVC Card',
            'model' => null,
            'index' => '/utilities/pvc-card-maker?card=healthid',
            'create' => '/utilities/pvc-card-maker?card=healthid',
        ],
        'pmvishwakarma_pvc' => [
            'label' => 'PM Vishwakarma PVC Card',
            'model' => null,
            'index' => '/utilities/pvc-card-maker?card=pmvishwakarma',
            'create' => '/utilities/pvc-card-maker?card=pmvishwakarma',
        ],
        'aapar_pvc' => [
            'label' => 'APAAR / Student ID PVC Card',
            'model' => null,
            'index' => '/utilities/pvc-card-maker?card=aapar',
            'create' => '/utilities/pvc-card-maker?card=aapar',
        ],
        'verify_ifsc_code' => [
            'label' => 'Verify IFSC Code',
            'model' => null,
            'index' => '/utilities/verify-ifsc-code',
            'create' => '/utilities/verify-ifsc-code',
        ],
        'kundli_generator' => [
            'label' => 'Kundli Generator (Janam Kundli)',
            'icon' => '🪐',
            'model' => null,
            'index' => '/utilities/kundli',
            'create' => '/utilities/kundli',
        ],
        'make_kundli' => [
            'label' => 'Kundli Generator (Janam Kundli)',
            'icon' => '🪐',
            'model' => null,
            'index' => '/utilities/kundli',
            'create' => '/utilities/kundli',
        ],
        'aadhar_to_ppp_id' => [
            'label' => 'Aadhar Card to PPP ID',
            'icon' => '🆔',
            'model' => null,
            'index' => '/utilities/aadhar-to-ppp-id',
            'create' => '/utilities/aadhar-to-ppp-id',
        ],
        'ppp_to_aadhar_all_members' => [
            'label' => 'PPP ID to Aadhar Number All Member',
            'icon' => '👥',
            'model' => null,
            'index' => '/utilities/ppp-to-aadhar-all-members',
            'create' => '/utilities/ppp-to-aadhar-all-members',
        ],
        'ppp_to_mobile_all_members' => [
            'label' => 'PPP ID to Mobile Number All Member',
            'icon' => '📱',
            'model' => null,
            'index' => '/utilities/ppp-to-mobile-all-members',
            'create' => '/utilities/ppp-to-mobile-all-members',
        ],
        'ppp_to_bank_details' => [
            'label' => 'PPP ID to Bank Account & IFSC Code',
            'icon' => '🏦',
            'model' => null,
            'index' => '/utilities/ppp-to-bank-details',
            'create' => '/utilities/ppp-to-bank-details',
        ],
        'vehicle_puc_without_otp' => [
            'label' => 'Vehicle PUC Certificate Download',
            'icon' => '🚗',
            'model' => null,
            'index' => '/utilities/vehicle-puc-without-otp',
            'create' => '/utilities/vehicle-puc-without-otp',
        ],
        'vehicle_puc_with_otp' => [
            'label' => 'Vehicle PUC Certificate Download',
            'icon' => '🚗',
            'model' => null,
            'index' => '/utilities/vehicle-puc-without-otp',
            'create' => '/utilities/vehicle-puc-without-otp',
        ],
        'sir_voter_card_list' => [
            'label' => 'S.I.R Voter Card List',
            'icon' => '🗳️',
            'model' => null,
            'index' => '/utilities/sir-voter-card-list',
            'create' => '/utilities/sir-voter-card-list',
        ],
        'pdf_editor' => [
            'label' => 'PDF Editor Tool',
            'icon' => '📄',
            'model' => null,
            'index' => '/utilities/pdf-editor',
            'create' => '/utilities/pdf-editor',
        ],
        'voter_card_manual_maker' => [
            'label' => 'Voter Card Manual Maker',
            'icon' => '🗳️',
            'model' => null,
            'index' => '/utilities/voter-card-manual-maker',
            'create' => '/utilities/voter-card-manual-maker',
        ],
        'aadhar_card_manual' => [
            'label' => 'Aadhar Card Manual',
            'icon' => '🆔',
            'model' => null,
            'index' => '/utilities/aadhar-card-manual',
            'create' => '/utilities/aadhar-card-manual',
        ],
        'voter_card_manual_address_change' => [
            'label' => 'Voter Card Manual For Address Change',
            'icon' => '🏠',
            'model' => null,
            'index' => '/utilities/voter-card-manual-address-change',
            'create' => '/utilities/voter-card-manual-address-change',
        ],
        'aadhar_mobile_update' => [
            'label' => 'Aadhar Card Mobile Number Update',
            'icon' => '📱',
            'model' => null,
            'index' => '/utilities/aadhar-mobile-update',
            'create' => '/utilities/aadhar-mobile-update',
        ],
        'aadhar_dob_change' => [
            'label' => 'Aadhar Card DOB Change',
            'icon' => '📅',
            'model' => null,
            'index' => '/utilities/aadhar-dob-change',
            'create' => '/utilities/aadhar-dob-change',
        ],
        'aadhar_surname_change' => [
            'label' => 'Aadhar Card Surname Change',
            'icon' => '👤',
            'model' => null,
            'index' => '/utilities/aadhar-surname-change',
            'create' => '/utilities/aadhar-surname-change',
        ],
        'aadhar_full_name_change' => [
            'label' => 'Aadhar Card Full Name Change',
            'icon' => '🪪',
            'model' => null,
            'index' => '/utilities/aadhar-full-name-change',
            'create' => '/utilities/aadhar-full-name-change',
        ],
        'abha_health_id_make' => [
            'label' => 'ABHA Health ID Make',
            'icon' => '🏥',
            'model' => null,
            'index' => '/utilities/abha-health-id-make',
            'create' => '/utilities/abha-health-id-make',
        ],
    ];

    protected $fillable = [
        'name',
        'slug',
        'description',
        'icon',
        'logo',
        'coin_cost',
        'kind',
        'module_key',
        'fields',
        'is_active',
        'visibility',
        'is_premium',
        'unlock_cost',
        'sort_order',
    ];

    protected $casts = [
        'coin_cost' => 'integer',
        'unlock_cost' => 'integer',
        'sort_order' => 'integer',
        'is_active' => 'boolean',
        'is_premium' => 'boolean',
        'fields' => 'array',
    ];

    public function requests(): HasMany
    {
        return $this->hasMany(ServiceRequest::class);
    }

    /**
     * Users this service is visible to, when it's private.
     */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Services visible to this user:
     * Admin/staff see all services. Regular users only see services they have been granted permission for by admin.
     */
    public function scopeVisibleTo($query, User $user)
    {
        if ($user->isAdmin() || $user->hasRole('admin') || $user->hasRole('super_admin') || in_array($user->type, ['admin', 'super_admin'])) {
            return $query;
        }

        return $query->whereHas('users', fn ($u) => $u->where('users.id', $user->id));
    }

    public function scopeOrdered($query)
    {
        return $query->orderByRaw('TRIM(name) ASC');
    }

    public function isFree(): bool
    {
        return $this->coin_cost === 0;
    }

    public function logoUrl(): ?string
    {
        return $this->logo ? Storage::disk('public')->url($this->logo) : null;
    }

    public function isPrivate(): bool
    {
        return $this->visibility === self::VISIBILITY_PRIVATE;
    }

    public function isModule(): bool
    {
        return $this->kind === self::KIND_MODULE && isset(self::MODULES[$this->module_key]);
    }

    /**
     * Eloquent model class backing this service, for built-in modules only.
     */
    public function moduleModel(): ?string
    {
        return self::MODULES[$this->module_key]['model'] ?? null;
    }

    /**
     * Where the dashboard card should link to.
     */
    public function targetUrl(): string
    {
        if ($this->isModule()) {
            return self::MODULES[$this->module_key]['index'];
        }

        return '/admin/service-requests/create?service=' . $this->slug;
    }
}
