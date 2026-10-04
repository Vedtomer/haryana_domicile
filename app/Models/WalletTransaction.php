<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WalletTransaction extends Model
{
    const TYPE_CREDIT = 'CREDIT';
    const TYPE_DEBIT  = 'DEBIT';

    const STATUS_COMPLETED = 'COMPLETED';
    const STATUS_PENDING   = 'PENDING';
    const STATUS_FAILED    = 'FAILED';

    protected $fillable = [
        'user_id',
        'amount',
        'transaction_id',
        'order_id',
        'type',
        'status',
        'description',
        'balance_after',
    ];

    protected $casts = [
        'amount'        => 'decimal:2',
        'balance_after' => 'decimal:2',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function paymentOrder(): BelongsTo
    {
        return $this->belongsTo(PaymentOrder::class, 'order_id', 'order_id');
    }
}
