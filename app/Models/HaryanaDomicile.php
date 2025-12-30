<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HaryanaDomicile extends Model
{
    use HasFactory;

    protected $fillable = [
        'tehsil',
        'district',
        'name',
        'father_name',
        'village',
        'ward_no',
        'age',
        'mobile',
        'aadhar',
        'caste',
        'child_name',
    ];
    //
}
