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
        'last_activity_at',
        'deactivated_reason',
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

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at'   => 'datetime',
            'password'            => 'hashed',
            'coins'               => 'integer',
            'last_activity_at'    => 'datetime',
        ];
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
}
