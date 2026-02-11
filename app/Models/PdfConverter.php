<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PdfConverter extends Model
{
    protected $fillable = [
        'original_filename',
        'pdf_path',
        'front_image_path',
        'back_image_path',
    ];
}
