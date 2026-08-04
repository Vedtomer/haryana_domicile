<?php

namespace App\Models\Concerns;

trait OwnedByUser
{
    /**
     * Restrict the query to the given user's own records, unless they're an admin.
     */
    public function scopeVisibleTo($query, $user)
    {
        if (!$user->hasRole('super_admin') && !$user->isAdmin()) {
            $query->where('user_id', $user->id);
        }

        return $query;
    }
}
