<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PrintJob extends Model
{
    use HasFactory;

    protected $fillable = [
        'print_shop_id',
        'job_code',
        'customer_name',
        'customer_phone',
        'original_filename',
        'file_path',
        'file_type',
        'total_pages',
        'color_type',
        'copies',
        'total_amount',
        'payment_method',
        'payment_status',
        'status',
        'printer_name',
        'error_message',
        'printed_at',
    ];

    protected $casts = [
        'total_pages' => 'integer',
        'copies' => 'integer',
        'total_amount' => 'decimal:2',
        'printed_at' => 'datetime',
    ];

    public function shop(): BelongsTo
    {
        return $this->belongsTo(PrintShop::class, 'print_shop_id');
    }
}
