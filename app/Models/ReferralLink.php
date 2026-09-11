<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class ReferralLink extends Model
{
    protected $fillable = [
        'user_id',
        'code',
        'is_used',
        'used_by',
        'used_at',
        'reward_paid',
        'reward_paid_at',
    ];

    protected $casts = [
        'is_used'        => 'boolean',
        'used_at'        => 'datetime',
        'reward_paid'    => 'boolean',
        'reward_paid_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function usedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'used_by');
    }

    /**
     * Generate a unique referral code.
     */
    public static function generateUniqueCode(): string
    {
        do {
            $code = 'CSP' . strtoupper(Str::random(5));
        } while (static::where('code', $code)->exists() || User::where('referral_code', $code)->exists());

        return $code;
    }
}
