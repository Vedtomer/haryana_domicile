<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Storage;

class Service extends Model
{
    const KIND_MODULE = 'module';   // user fills a built-in form, coins deducted instantly
    const KIND_MANUAL = 'manual';   // user submits a request, admin processes it

    const VISIBILITY_PUBLIC = 'public';
    const VISIBILITY_PRIVATE = 'private';

    /**
     * Built-in modules that already exist in the project. Admins can change the
     * coin cost / visibility of these but not their wiring.
     */
    const MODULES = [
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
            'label' => 'Birth Certificate',
            'model' => BirthRecord::class,
            'index' => '/admin/birth-records',
            'create' => '/admin/birth-records/create',
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
            'index' => '/utilities/electricity-bill',
            'create' => '/utilities/electricity-bill',
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
        'aadhar_update' => [
            'label' => 'Aadhar Update Form',
            'model' => AadharUpdate::class,
            'index' => '/admin/aadhar-update',
            'create' => '/admin/aadhar-update/create',
        ],
        'passport_maker' => [
            'label' => 'Passport Photo Maker',
            'model' => null,
            'index' => '/utilities/passport-maker',
            'create' => '/utilities/passport-maker',
        ],
        'tenth_passbook' => [
            'label' => '10th Passbook Editor',
            'model' => TenthPassbook::class,
            'index' => '/admin/tenth-passbook',
            'create' => '/admin/tenth-passbook/create',
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
            'label' => 'Learning Licence PDF Download',
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
     * Public services are visible to everyone; private services only to
     * their assigned users.
     */
    public function scopeVisibleTo($query, User $user)
    {
        return $query->where(function ($q) use ($user) {
            $q->where('visibility', self::VISIBILITY_PUBLIC)
                ->orWhereHas('users', fn ($u) => $u->where('users.id', $user->id));
        });
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order')->orderBy('name');
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
