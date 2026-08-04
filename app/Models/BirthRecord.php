<?php

namespace App\Models;

use App\Models\Concerns\OwnedByUser;
use Illuminate\Database\Eloquent\Model;

class BirthRecord extends Model
{
    use OwnedByUser;

    protected $fillable = [
        'user_id',
        'district',
        'dob',
        'registration_no',
        'date_of_registration',
        'gender',
        'child_name',
        'father_name',
        'mother_name',
        'address_parents_birth',
        'permanent_address',
        'issuing_authority',
        'record_year',
        'record_father_name',
        'record_mother_name',
        'school_child_name',
        'school_dob',
        'school_father_name',
        'school_mother_name',
        'other_children',
        'father_aadhar',
        'mother_aadhar',
        'child_document',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    protected $casts = [
        'other_children' => 'array',
        'school_dob' => 'date',
        'dob' => 'date',
        'date_of_registration' => 'date',
    ];
}
