<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ServiceRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'service_name',
        'input_data',
        'status',
        'admin_response',
        'attachment',
        'completed_by',
        'completed_at',
    ];

    protected $casts = [
        'completed_at' => 'datetime',
        'input_data' => 'array', // Useful if we store JSON
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function completedBy(): BelongsTo
    {
        return $this->belongsTo(User::class , 'completed_by');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }
}
