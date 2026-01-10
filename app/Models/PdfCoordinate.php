<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PdfCoordinate extends Model
{
    use HasFactory;
    
    protected $fillable = [
        'page',
        'field_name',
        'x',
        'y',
        'font_size',
        'spacing'
    ];
    
    protected $casts = [
        'page' => 'integer',
        'x' => 'integer',
        'y' => 'integer',
        'font_size' => 'integer',
        'spacing' => 'integer',
    ];
}
