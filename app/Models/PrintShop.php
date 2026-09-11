<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PrintShop extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'shop_code',
        'shop_name',
        'upi_id',
        'bw_rate',
        'color_rate',
        'is_online',
        'last_heartbeat_at',
        'agent_token',
        'detected_printers',
        'bw_printer',
        'color_printer',
        'printer_mode',
        'deleted_printers',
    ];

    protected $casts = [
        'bw_rate' => 'decimal:2',
        'color_rate' => 'decimal:2',
        'is_online' => 'boolean',
        'last_heartbeat_at' => 'datetime',
        'detected_printers' => 'array',
        'deleted_printers' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function jobs(): HasMany
    {
        return $this->hasMany(PrintJob::class);
    }
}
