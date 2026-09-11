<?php


namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;
use Illuminate\Support\Facades\DB;
use Filament\Models\Contracts\FilamentUser;
use Filament\Panel;

class User extends Authenticatable implements FilamentUser
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasRoles;
    
    protected static function booted(): void
    {
        static::creating(function (User $user) {
            if (empty($user->referral_code)) {
                $user->referral_code = static::generateReferralCode();
            }
        });

        static::created(function (User $user) {
            if ($user->type === 'user') {
                $user->assignRole('public');
            }
        });
    }

    public function canAccessPanel(Panel $panel): bool
    {
        return true;
    }

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'phone',
        'password',
        'raw_password',
        'coins',
        'type',
        'is_active',
        'license_expires_at',
        'license_device_id',
        'license_device_name',
        'license_device_ip',
        'license_device_bound_at',
        'last_activity_at',
        'last_seen_at',
        'deactivated_reason',
        'referral_code',
        'referred_by',
        'referral_reward_paid',
        'referral_reward_paid_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $appends = [
        'is_online',
        'last_seen_human',
        'referral_code',
        'referral_link',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at'       => 'datetime',
            'password'                => 'hashed',
            'coins'                   => 'integer',
            'license_expires_at'      => 'datetime',
            'license_device_bound_at' => 'datetime',
            'last_activity_at'        => 'datetime',
            'last_seen_at'            => 'datetime',
            'referral_reward_paid'    => 'boolean',
            'referral_reward_paid_at' => 'datetime',
        ];
    }

    public function getIsOnlineAttribute(): bool
    {
        if (!$this->last_seen_at) {
            return false;
        }

        return $this->last_seen_at->greaterThanOrEqualTo(now()->subSeconds(150));
    }

    public function getLastSeenHumanAttribute(): string
    {
        if (!$this->last_seen_at) {
            return 'Never';
        }

        if ($this->is_online) {
            return 'Online now';
        }

        return $this->last_seen_at->diffForHumans();
    }

    public function chatMessages()
    {
        return $this->hasMany(\App\Models\ChatMessage::class, 'user_id');
    }

    /**
     * Check if user has an active portal license (admin is always active)
     */
    public function hasActiveLicense(): bool
    {
        if ($this->isAdmin() || $this->hasRole('super_admin')) {
            return true;
        }

        return $this->license_expires_at !== null && $this->license_expires_at->isFuture();
    }

    /**
     * Number of full days left in the license (0 if expired/none)
     */
    public function licenseDaysLeft(): int
    {
        if (!$this->license_expires_at || $this->license_expires_at->isPast()) {
            return 0;
        }

        return (int) now()->diffInDays($this->license_expires_at, false);
    }

    /**
     * Activate or extend license for given number of months (default 6)
     * and lock to specific desktop device if provided.
     */
    public function activateLicense(int $months = 6, ?string $deviceId = null, ?string $deviceName = null, ?string $deviceIp = null): \Carbon\Carbon
    {
        $base = ($this->license_expires_at && $this->license_expires_at->isFuture())
            ? $this->license_expires_at->copy()
            : now();

        $newExpiry = $base->addMonths($months);
        $data = ['license_expires_at' => $newExpiry];

        if ($deviceId) {
            $data['license_device_id'] = $deviceId;
            $data['license_device_name'] = $deviceName ?: ($this->license_device_name ?: 'Desktop PC');
            $data['license_device_ip'] = $deviceIp ?: request()->ip();
            $data['license_device_bound_at'] = now();
        }

        $this->update($data);

        return $newExpiry;
    }

    /**
     * Reset the desktop hardware lock for this user
     */
    public function resetDesktopLock(): void
    {
        $this->update([
            'license_device_id' => null,
            'license_device_name' => null,
            'license_device_ip' => null,
            'license_device_bound_at' => null,
        ]);
    }

    /**
     * Mark this user as recently active (call on any coin purchase or service use).
     * Resets the inactivity clock.
     */
    public function touchActivity(): void
    {
        $this->updateQuietly(['last_activity_at' => now()]);
    }


    /**
     * Returns true when account was deactivated specifically due to inactivity
     * (as opposed to an admin ban).
     */
    public function isDeactivatedByInactivity(): bool
    {
        return !$this->is_active && $this->deactivated_reason === 'inactivity';
    }

    /**
     * Get all coin transactions for this user
     */
    public function coinTransactions()
    {
        return $this->hasMany(CoinTransaction::class);
    }

    /**
     * Get all reactivation requests for this user
     */
    public function reactivationRequests()
    {
        return $this->hasMany(ReactivationRequest::class);
    }

    /**
     * Get the latest pending reactivation request
     */
    public function pendingReactivation()
    {
        return $this->reactivationRequests()->where('status', 'pending')->latest()->first();
    }

    /**
     * Get all services explicitly assigned to this user
     */
    public function services()
    {
        return $this->belongsToMany(Service::class);
    }

    /**
     * Check if user has enough coins
     */
    public function hasEnoughCoins(int $amount): bool
    {
        return $this->coins >= $amount;
    }

    /**
     * Deduct coins from user balance
     */
    public function deductCoins(int $amount, string $type, string $description, ?string $serviceType = null, ?int $serviceId = null): void
    {
        DB::transaction(function () use ($amount, $type, $description, $serviceType, $serviceId) {
            // Lock the user row to prevent race conditions
            $this->applyCoinDelta(-$amount);

            // Create transaction record
            CoinTransaction::create([
                'user_id' => $this->id,
                'amount' => -$amount,
                'balance_after' => $this->coins,
                'type' => $type,
                'service_type' => $serviceType,
                'service_id' => $serviceId,
                'description' => $description,
                'created_by' => auth()->id(),
            ]);
        });
    }

    /**
     * Add coins to user balance and record the transaction.
     *
     * @param int         $amount      Number of coins to add
     * @param string      $type        Transaction type (see CoinTransaction::TYPE_* constants)
     * @param string      $description Human-readable description stored on the transaction
     * @param int|null    $createdBy   Admin user ID who performed the action (defaults to auth user)
     * @param string|null $coinType    Coin category — MUST be set for admin-issued coins:
     *                                   - CoinTransaction::COIN_TYPE_PAID  ('paid')
     *                                       → User has paid real money. This amount contributes
     *                                         to PLATFORM REVENUE. Used when approving a
     *                                         CoinPurchaseRequest.
     *                                   - CoinTransaction::COIN_TYPE_TRIAL ('trial')
     *                                       → Complimentary / promotional coins. No monetary
     *                                         value. Does NOT count toward revenue.
     *                                   - null → System-generated (service deductions, refunds).
     *
     * NOTE: Only COIN_TYPE_PAID transactions represent real income.
     *       When generating revenue reports, always filter by coin_type = 'paid'.
     */
    public function addCoins(int $amount, string $type, string $description, ?int $createdBy = null, ?string $coinType = null): void
    {
        DB::transaction(function () use ($amount, $type, $description, $createdBy, $coinType) {
            $this->applyCoinDelta($amount);

            // Create transaction record
            CoinTransaction::create([
                'user_id'      => $this->id,
                'amount'       => $amount,
                'balance_after'=> $this->coins,
                'type'         => $type,
                'coin_type'    => $coinType,
                'service_type' => null,
                'service_id'   => null,
                'description'  => $description,
                'created_by'   => $createdBy ?? auth()->id(),
            ]);
        });
    }

    /**
     * Apply a signed change to this user's balance, locking only their own row.
     *
     * Must go through a keyed query: `$this->lockForUpdate()` builds an UNSCOPED
     * users query, so chaining increment/decrement onto it would move every
     * user's balance, not just this one's.
     */
    private function applyCoinDelta(int $delta): void
    {
        $locked = static::query()
            ->whereKey($this->getKey())
            ->lockForUpdate()
            ->firstOrFail();

        $balance = $locked->coins + $delta;

        static::query()->whereKey($this->getKey())->update(['coins' => $balance]);

        $this->coins = $balance;
        $this->syncOriginalAttribute('coins');
    }

    /**
     * Check if user is admin
     */
    public function isAdmin(): bool
    {
        return $this->type === 'admin';
    }

    /**
     * Check if user is retailer (legacy role, now mapped to user)
     */
    public function isRetailer(): bool
    {
        return $this->hasRole('public');
    }

    /**
     * Get all coin purchase requests for this user
     */
    public function coinPurchaseRequests()
    {
        return $this->hasMany(CoinPurchaseRequest::class);
    }

    /**
     * The user who referred this user.
     */
    public function referrer()
    {
        return $this->belongsTo(User::class, 'referred_by');
    }

    /**
     * Users who were referred by this user.
     */
    public function referrals()
    {
        return $this->hasMany(User::class, 'referred_by');
    }

    /**
     * All single-use referral links created by this user.
     */
    public function referralLinks()
    {
        return $this->hasMany(ReferralLink::class, 'user_id');
    }

    /**
     * Generate a unique referral code.
     */
    public static function generateReferralCode(): string
    {
        do {
            $code = 'CSP' . strtoupper(\Illuminate\Support\Str::random(5));
        } while (static::where('referral_code', $code)->exists() || (\Illuminate\Support\Facades\Schema::hasTable('referral_links') && ReferralLink::where('code', $code)->exists()));

        return $code;
    }

    /**
     * Get or create active single-use referral code for this user.
     * Each link works only once (single-use).
     */
    public function getActiveReferralCode(): string
    {
        try {
            if (\Illuminate\Support\Facades\Schema::hasTable('referral_links')) {
                $link = ReferralLink::where('user_id', $this->id)
                    ->where('is_used', false)
                    ->latest('id')
                    ->first();

                if (!$link) {
                    $code = static::generateReferralCode();
                    $link = ReferralLink::create([
                        'user_id' => $this->id,
                        'code'    => $code,
                        'is_used' => false,
                    ]);
                }

                if (($this->attributes['referral_code'] ?? null) !== $link->code) {
                    if (\Illuminate\Support\Facades\Schema::hasColumn('users', 'referral_code')) {
                        \Illuminate\Support\Facades\DB::table('users')->where('id', $this->id)->update(['referral_code' => $link->code]);
                    }
                    $this->attributes['referral_code'] = $link->code;
                }

                return $link->code;
            }
        } catch (\Throwable $e) {
            // fallback
        }

        if (empty($this->attributes['referral_code'])) {
            $code = static::generateReferralCode();
            $this->attributes['referral_code'] = $code;
            if ($this->exists && \Illuminate\Support\Facades\Schema::hasColumn('users', 'referral_code')) {
                try {
                    \Illuminate\Support\Facades\DB::table('users')->where('id', $this->id)->update(['referral_code' => $code]);
                } catch (\Throwable $e) {}
            }
        }

        return $this->attributes['referral_code'] ?? 'CSP' . $this->id;
    }

    /**
     * Generate a fresh new single-use referral link for this user.
     */
    public function generateNewReferralLink(): string
    {
        $code = static::generateReferralCode();

        try {
            if (\Illuminate\Support\Facades\Schema::hasTable('referral_links')) {
                ReferralLink::create([
                    'user_id' => $this->id,
                    'code'    => $code,
                    'is_used' => false,
                ]);
            }
        } catch (\Throwable $e) {}

        if (\Illuminate\Support\Facades\Schema::hasColumn('users', 'referral_code')) {
            \Illuminate\Support\Facades\DB::table('users')->where('id', $this->id)->update(['referral_code' => $code]);
        }
        $this->attributes['referral_code'] = $code;

        return $code;
    }

    /**
     * Accessor to ensure referral_code is always returned and valid.
     */
    public function getReferralCodeAttribute($value)
    {
        if (empty($value)) {
            return $this->getActiveReferralCode();
        }
        return $value;
    }

    /**
     * Get user's referral link.
     */
    public function getReferralLinkAttribute(): string
    {
        return url('/register?ref=' . $this->getActiveReferralCode());
    }

    /**
     * Check if a referred user has added ₹200+ and credit the ₹10 referral bonus once.
     */
    public function checkAndTriggerReferralBonus(int $addedAmount = 0): void
    {
        // Must be referred by someone and bonus must not already be paid
        if (!$this->referred_by || $this->referral_reward_paid) {
            return;
        }

        // Calculate total approved recharge package amount for this user
        $totalRecharged = \App\Models\CoinPurchaseRequest::where('user_id', $this->id)
            ->where('status', 'approved')
            ->sum('package_amount');

        // Condition: When user adds ₹200+ (or package 199/200+, or cumulative reaches ₹200+)
        if ($addedAmount >= 199 || $totalRecharged >= 199) {
            $referrer = static::find($this->referred_by);
            if ($referrer) {
                // Atomic check to prevent race conditions
                $affected = static::where('id', $this->id)
                    ->where('referral_reward_paid', false)
                    ->update([
                        'referral_reward_paid' => true,
                        'referral_reward_paid_at' => now(),
                    ]);

                if ($affected) {
                    $this->referral_reward_paid = true;
                    $this->referral_reward_paid_at = now();

                    // 10 Coins (₹10) referral bonus to referrer
                    $referrer->addCoins(
                        10,
                        CoinTransaction::TYPE_REFERRAL_BONUS,
                        "Referral Bonus: {$this->name} added ₹200+ to wallet",
                        null,
                        CoinTransaction::COIN_TYPE_PAID
                    );

                    // Congratulate referrer with notification
                    $referrer->notify(new \App\Notifications\SystemAlert(
                        '🎉 Referral Bonus Credited (+10 Coins)!',
                        "Aapke referral link se judne wale user '{$this->name}' ne ₹200+ add kiye. Aapke account me 10 Coins (₹10) credit ho gaye hain!",
                        '/admin/referrals',
                        'success'
                    ));
                }
            }
        }
    }
}
