<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class Resume extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'title',
        'full_name',
        'father_name',
        'mother_name',
        'dob',
        'gender',
        'marital_status',
        'nationality',
        'email',
        'phone',
        'address',
        'photo_url',
        'career_objective',
        'education',
        'experience',
        'skills',
        'languages',
        'hobbies',
        'declaration',
        'place',
        'date',
        'template_style',
        'accent_color',
    ];

    protected $casts = [
        'education' => 'array',
        'experience' => 'array',
        'skills' => 'array',
        'languages' => 'array',
        'hobbies' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function scopeVisibleTo($query, User $user)
    {
        if ($user->isAdmin() || $user->hasRole('admin') || $user->hasRole('super_admin') || in_array($user->type, ['admin', 'super_admin'])) {
            return $query;
        }

        return $query->where('user_id', $user->id);
    }

    public function fullPhotoUrl(): ?string
    {
        if (!$this->photo_url) {
            return null;
        }

        if (str_starts_with($this->photo_url, 'http://') || str_starts_with($this->photo_url, 'https://')) {
            return $this->photo_url;
        }

        return Storage::disk('public')->url($this->photo_url);
    }
}
