<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BroadcastNotice extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'content',
        'type',
        'is_active',
        'show_as_popup',
        'button_text',
        'button_link',
        'expires_at',
        'created_by',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'show_as_popup' => 'boolean',
        'expires_at' => 'datetime',
    ];

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true)
            ->where(function ($q) {
                $q->whereNull('expires_at')
                  ->orWhere('expires_at', '>', now());
            });
    }
}
