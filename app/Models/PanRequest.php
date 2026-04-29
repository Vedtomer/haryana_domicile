<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PanRequest extends Model
{
    // Status constants
    const STATUS_PENDING = 'pending';
    const STATUS_COMPLETED = 'completed';

    protected $fillable = [
        'user_id',
        'aadhar_number',
        'name',
        'mobile',
        'pan_number',
        'status',
        'utr_number',
        'admin_notes',
        'completed_by',
        'completed_at',
        'photo',
        'signature',
        'aadhar_card_doc',
        'additional_document',
        'slip_document',
        'final_pdf',
    ];

    protected $casts = [
        'completed_at' => 'datetime',
    ];

    /**
     * Get the user who made this request
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the admin who completed this request
     */
    public function completedBy(): BelongsTo
    {
        return $this->belongsTo(User::class , 'completed_by');
    }

    /**
     * Scope for pending requests
     */
    public function scopePending($query)
    {
        return $query->where('status', self::STATUS_PENDING);
    }

    /**
     * Scope for completed requests
     */
    public function scopeCompleted($query)
    {
        return $query->where('status', self::STATUS_COMPLETED);
    }
}
