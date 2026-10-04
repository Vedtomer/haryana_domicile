<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class PaymentOrder extends Model
{
    const STATUS_PENDING    = 'PENDING';
    const STATUS_PROCESSING = 'PROCESSING';
    const STATUS_SUCCESS    = 'SUCCESS';
    const STATUS_FAILED     = 'FAILED';
    const STATUS_CANCELLED  = 'CANCELLED';

    const VERIFY_UNVERIFIED = 'UNVERIFIED';
    const VERIFY_VALID      = 'VALID';
    const VERIFY_INVALID    = 'INVALID';
    const VERIFY_DUPLICATE  = 'DUPLICATE';

    protected $fillable = [
        'order_id',
        'user_id',
        'requested_amount',
        'verified_amount',
        'transaction_id',
        'payment_status',
        'verification_status',
        'payment_gateway',
        'payment_url',
        'qr_data',
        'raw_response',
    ];

    protected $casts = [
        'requested_amount' => 'decimal:2',
        'verified_amount'  => 'decimal:2',
        'raw_response'     => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function walletTransaction(): HasOne
    {
        return $this->hasOne(WalletTransaction::class, 'order_id', 'order_id');
    }

    public function isSuccess(): bool
    {
        return $this->payment_status === self::STATUS_SUCCESS;
    }
}
