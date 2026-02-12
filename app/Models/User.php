<?php


namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\DB;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'coins',
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
    public function addCoins(int $amount, string $type, string $description, ?int $createdBy = null): void
    {
        DB::transaction(function () use ($amount, $type, $description, $createdBy) {
            // Lock the user row to prevent race conditions
            $this->lockForUpdate()->increment('coins', $amount);
            $this->refresh();

            // Create transaction record
            CoinTransaction::create([
                'user_id' => $this->id,
                'amount' => $amount,
                'balance_after' => $this->coins,
                'type' => $type,
                'service_type' => null,
                'service_id' => null,
                'description' => $description,
                'created_by' => $createdBy ?? auth()->id(),
            ]);
        });
    }
}
