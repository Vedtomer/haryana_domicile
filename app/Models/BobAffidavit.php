<?php

namespace App\Models;

use App\Models\Concerns\OwnedByUser;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BobAffidavit extends Model
{
    use HasFactory, OwnedByUser;

    protected $fillable = [
        'user_id',
        'name',
        'father_name',
        'gender',
        'age',
        'dob',
        'mobile',
        'aadhar',
        'pan_no',
        'village',
        'tehsil',
        'district',
        'state',
        'pincode',
        'account_no',
        'cif_no',
        'branch_name',
        'ifsc_code',
        'affidavit_type',
        'reason',
        'notes',
    ];

    protected $casts = [
        'dob' => 'date',
        'age' => 'integer',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
