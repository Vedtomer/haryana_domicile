<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CoinTransaction extends Model
{
    // Transaction types
    const TYPE_PURCHASE = 'purchase';
    const TYPE_ADMIN_CREDIT = 'admin_credit';
    const TYPE_SERVICE_DEDUCTION = 'service_deduction';
    const TYPE_REFUND = 'refund';

    // Coin types
    const COIN_TYPE_TRIAL = 'trial';
    const COIN_TYPE_PAID = 'paid';

    // Service types
    const SERVICE_BIRTH_RECORD = 'birth_record';
    const SERVICE_HARYANA_DOMICILE = 'haryana_domicile';
    const SERVICE_PDF_CONVERTER = 'pdf_converter';

    protected $fillable = [
        'user_id',
        'amount',
        'balance_after',
        'type',
        'coin_type',
        'service_type',
        'service_id',
        'description',
        'created_by',
    ];

    protected $casts = [
        'amount' => 'integer',
        'balance_after' => 'integer',
        'service_id' => 'integer',
        'created_by' => 'integer',
    ];

    /**
     * Get the user that owns the transaction
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the admin user who created this transaction
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class , 'created_by');
    }
}
