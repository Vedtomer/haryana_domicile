<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TenthPassbook extends Model
{
    protected $fillable = [
        'user_id',
        'name',
        'father_name',
        'mother_name',
        'dob',
        'image_path',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function scopeVisibleTo($query, $user)
    {
        if ($user->hasRole('super_admin') || $user->isAdmin()) {
            return $query;
        }

        return $query->where('user_id', $user->id);
    }
}
