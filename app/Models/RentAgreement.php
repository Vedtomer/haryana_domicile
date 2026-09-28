<?php

namespace App\Models;

use App\Models\Concerns\OwnedByUser;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RentAgreement extends Model
{
    use HasFactory, OwnedByUser;

    protected $fillable = [
        'user_id',
        'first_party_name',
        'first_party_aadhar',
        'first_party_father_name',
        'first_party_address',
        'second_party_name',
        'second_party_aadhar',
        'second_party_father_name',
        'second_party_address',
        'property_owner_title',
        'property_type',
        'property_area',
        'property_location',
        'property_city',
        'tenancy_months',
        'from_date',
        'to_date',
        'monthly_rent',
        'monthly_rent_words',
        'agreement_date',
    ];

    protected $casts = [
        'tenancy_months' => 'integer',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
