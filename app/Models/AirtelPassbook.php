<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AirtelPassbook extends Model
{
    protected $guarded = [];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function scopeVisibleTo($query, User $user)
    {
        return $query->where('user_id', $user->id);
    }
}
