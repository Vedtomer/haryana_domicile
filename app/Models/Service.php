<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Service extends Model
{
    const KIND_MODULE = 'module';   // user fills a built-in form, coins deducted instantly
    const KIND_MANUAL = 'manual';   // user submits a request, admin processes it

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
    ];

    protected $fillable = [
        'name',
        'slug',
        'description',
        'icon',
        'coin_cost',
        'kind',
        'module_key',
        'fields',
        'is_active',
        'sort_order',
    ];

    protected $casts = [
        'coin_cost' => 'integer',
        'sort_order' => 'integer',
        'is_active' => 'boolean',
        'fields' => 'array',
    ];

    public function requests(): HasMany
    {
        return $this->hasMany(ServiceRequest::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order')->orderBy('name');
    }

    public function isFree(): bool
    {
        return $this->coin_cost === 0;
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
