<?php

namespace App\Models;

use App\Models\Concerns\OwnedByUser;
use Illuminate\Database\Eloquent\Model;

class MarriageAffidavit extends Model
{
    use OwnedByUser;

    protected $guarded = [];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
