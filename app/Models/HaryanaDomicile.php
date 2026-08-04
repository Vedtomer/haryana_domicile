<?php

namespace App\Models;

use App\Models\Concerns\OwnedByUser;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HaryanaDomicile extends Model
{
    use HasFactory, OwnedByUser;

    protected $fillable = [
        'user_id',
        'pincode',
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
        'religion',
        'ration_card_no',
        'child_name',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
