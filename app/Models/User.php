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
        'coins',
        'type',
        'is_active',
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
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'coins' => 'integer',
        ];
    }

    /**
     * Get all coin transactions for this user
     */
    public function coinTransactions()
    {
        return $this->hasMany(CoinTransaction::class);
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
            $this->lockForUpdate()->decrement('coins', $amount);
            $this->refresh();

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
     * Add coins to user balance
     */
    public function addCoins(int $amount, string $type, string $description, ?int $createdBy = null, ?string $coinType = null): void
    {
        DB::transaction(function () use ($amount, $type, $description, $createdBy, $coinType) {
            // Lock the user row to prevent race conditions
            $this->lockForUpdate()->increment('coins', $amount);
            $this->refresh();

            // Create transaction record
            CoinTransaction::create([
                'user_id' => $this->id,
                'amount' => $amount,
                'balance_after' => $this->coins,
                'type' => $type,
                'coin_type' => $coinType,
                'service_type' => null,
                'service_id' => null,
                'description' => $description,
                'created_by' => $createdBy ?? auth()->id(),
            ]);
        });
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
