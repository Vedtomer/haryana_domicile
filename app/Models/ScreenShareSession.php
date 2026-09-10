<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ScreenShareSession extends Model
{
    use HasFactory;

    protected $fillable = [
        'admin_id',
        'user_id',
        'status',
        'offer',
        'answer',
        'admin_candidates',
        'user_candidates',
        'ended_at',
    ];

    protected $casts = [
        'admin_candidates' => 'array',
        'user_candidates'  => 'array',
        'ended_at'         => 'datetime',
    ];

    public function admin(): BelongsTo
    {
        return $this->belongsTo(User::class, 'admin_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function isLive(): bool
    {
        return in_array($this->status, ['requesting', 'accepted']);
    }
}
