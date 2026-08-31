<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ReactivationRequest extends Model
{
    protected $fillable = [
        'user_id',
        'utr_number',
        'amount',
        'status',
        'admin_note',
        'approved_by',
        'approved_at',
        'payment_screenshot',
    ];

    protected $casts = [
        'approved_at' => 'datetime',
        'amount'      => 'integer',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function approvedBy()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function isPending(): bool
    {
        return $this->status === 'pending';
    }
}
