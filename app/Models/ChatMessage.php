<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ChatMessage extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'sender_id',
        'sender_type',
        'message',
        'is_read',
    ];

    protected $casts = [
        'is_read' => 'boolean',
    ];

    protected $appends = [
        'formatted_time',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    public function getFormattedTimeAttribute(): string
    {
        if (!$this->created_at) {
            return '';
        }

        if ($this->created_at->isToday()) {
            return $this->created_at->format('h:i A');
        }

        if ($this->created_at->isYesterday()) {
            return 'Yesterday ' . $this->created_at->format('h:i A');
        }

        return $this->created_at->format('d M, h:i A');
    }
}
