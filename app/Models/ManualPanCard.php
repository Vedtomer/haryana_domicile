<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ManualPanCard extends Model
{
    protected $fillable = [
        'user_id',
        'pan_number',
        'name',
        'father_name',
        'dob',
        'photo_path',
        'signature_path',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
