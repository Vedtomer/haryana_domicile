<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ServiceRequest extends Model
{
    use HasFactory;

    const STATUS_PENDING = 'pending';
    const STATUS_ACCEPTED = 'accepted';
    const STATUS_IN_PROGRESS = 'in_progress';
    const STATUS_COMPLETED = 'completed';
    const STATUS_REJECTED = 'rejected';

    const STATUSES = [
        self::STATUS_PENDING => 'Pending',
        self::STATUS_ACCEPTED => 'Accepted',
        self::STATUS_IN_PROGRESS => 'In Progress',
        self::STATUS_COMPLETED => 'Completed',
        self::STATUS_REJECTED => 'Rejected',
    ];

    protected $fillable = [
        'user_id',
        'service_id',
        'service_name',
        'input_data',
        'coins_charged',
        'status',
        'admin_response',
        'estimated_time',
        'attachment',
        'completed_by',
        'completed_at',
        'refunded_at',
    ];

    protected $casts = [
        'completed_at' => 'datetime',
        'refunded_at' => 'datetime',
        'coins_charged' => 'integer',
        'input_data' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }

    public function completedBy(): BelongsTo
    {
        return $this->belongsTo(User::class , 'completed_by');
    }

    public function scopePending($query)
    {
        return $query->where('status', self::STATUS_PENDING);
    }

    /**
     * Restrict the query to the given user's own requests, unless they're an admin.
     */
    public function scopeVisibleTo($query, $user)
    {
        if (!$user->hasRole('super_admin') && !$user->isAdmin()) {
            $query->where('user_id', $user->id);
        }

        return $query;
    }

    public function statusLabel(): string
    {
        return self::STATUSES[$this->status] ?? ucfirst($this->status);
    }

    /**
     * A rejected request refunds its coins once, and only if it was charged.
     */
    public function isRefundable(): bool
    {
        return $this->coins_charged > 0 && is_null($this->refunded_at);
    }
}
