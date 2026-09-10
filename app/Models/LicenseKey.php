<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class LicenseKey extends Model
{
    use HasFactory;

    const STATUS_UNUSED = 'unused';
    const STATUS_ACTIVE = 'active';
    const STATUS_REVOKED = 'revoked';

    protected $fillable = [
        'key',
        'cost_coins',
        'duration_months',
        'status',
        'purchased_by',
        'activated_by',
        'activated_at',
        'expires_at',
        'notes',
    ];

    protected $casts = [
        'cost_coins' => 'integer',
        'duration_months' => 'integer',
        'activated_at' => 'datetime',
        'expires_at' => 'datetime',
    ];

    /**
     * Generate a unique formatted license key (e.g. LIC-9B2F-48A1-C7D3)
     */
    public static function generateUniqueKey(): string
    {
        do {
            $part1 = strtoupper(Str::random(4));
            $part2 = strtoupper(Str::random(4));
            $part3 = strtoupper(Str::random(4));
            $key = "LIC-{$part1}-{$part2}-{$part3}";
        } while (static::where('key', $key)->exists());

        return $key;
    }

    /**
     * Activate this license key for a specific user
     */
    public function activateFor(User $user): void
    {
        $duration = $this->duration_months ?: 6;
        $expiry = $user->activateLicense($duration);

        $this->update([
            'status' => self::STATUS_ACTIVE,
            'activated_by' => $user->id,
            'activated_at' => now(),
            'expires_at' => $expiry,
        ]);
    }

    public function purchaser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'purchased_by');
    }

    public function activator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'activated_by');
    }
}
