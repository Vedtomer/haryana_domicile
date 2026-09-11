<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class PrintShop extends Model
{
    protected $fillable = [
        'user_id',
        'shop_code',
        'shop_name',
        'phone',
        'upi_id',
        'agent_secret',
        'agent_last_seen_at',
        'printer_name',
        'color_printer_name',
        'available_printers',
        'price_bw_page',
        'price_color_page',
        'price_photo_sheet',
        'is_auto_print',
        'is_cash_allowed',
        'is_online_allowed',
        'is_active',
    ];

    protected $casts = [
        'agent_last_seen_at' => 'datetime',
        'available_printers' => 'array',
        'price_bw_page'      => 'decimal:2',
        'price_color_page'   => 'decimal:2',
        'price_photo_sheet'  => 'decimal:2',
        'is_auto_print'      => 'boolean',
        'is_cash_allowed'    => 'boolean',
        'is_online_allowed'  => 'boolean',
        'is_active'          => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function printJobs(): HasMany
    {
        return $this->hasMany(PrintJob::class);
    }

    /**
     * Agent is considered online if heartbeat was within the last 30 seconds.
     */
    public function isAgentOnline(): bool
    {
        if (!$this->agent_last_seen_at) {
            return false;
        }

        return $this->agent_last_seen_at->diffInSeconds(now()) <= 30;
    }

    /**
     * Get the public customer upload URL.
     */
    public function getCustomerUrlAttribute(): string
    {
        return url('/p/' . $this->shop_code);
    }

    /**
     * Factory/Helper to ensure a user has a PrintShop profile.
     */
    public static function getOrCreateForUser(User $user): self
    {
        return static::firstOrCreate(
            ['user_id' => $user->id],
            [
                'shop_code'          => 'CSP-' . strtoupper(Str::random(6)),
                'shop_name'          => $user->name . ' CSC Print',
                'phone'              => $user->phone,
                'agent_secret'       => Str::random(48),
                'price_bw_page'      => 3.00,
                'price_color_page'   => 10.00,
                'price_photo_sheet'  => 30.00,
                'is_auto_print'      => true,
                'is_cash_allowed'    => true,
                'is_online_allowed'  => true,
            ]
        );
    }
}
