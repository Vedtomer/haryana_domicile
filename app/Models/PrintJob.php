<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class PrintJob extends Model
{
    protected $fillable = [
        'print_shop_id',
        'job_code',
        'customer_name',
        'customer_phone',
        'file_path',
        'file_name',
        'file_type',
        'file_size',
        'copies',
        'color_mode',
        'page_range',
        'total_pages',
        'duplex',
        'paper_size',
        'service_type',
        'calculated_cost',
        'payment_status',
        'job_status',
        'error_message',
        'printed_at',
    ];

    protected $casts = [
        'copies'          => 'integer',
        'total_pages'     => 'integer',
        'file_size'       => 'integer',
        'calculated_cost' => 'decimal:2',
        'printed_at'      => 'datetime',
    ];

    public function printShop(): BelongsTo
    {
        return $this->belongsTo(PrintShop::class);
    }

    public function getFileDownloadUrlAttribute(): string
    {
        return url('/api/print-agent/download/' . $this->id . '?secret=' . $this->printShop->agent_secret);
    }
}
