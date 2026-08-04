<?php

namespace App\Http\Controllers;

abstract class Controller
{
    /**
     * Abort with 403 unless the current user is an admin or owns the given record.
     */
    protected function authorizeOwner($record): void
    {
        $user = auth()->user();
        if (!$user->hasRole('super_admin') && !$user->isAdmin() && $record->user_id !== $user->id) {
            abort(403);
        }
    }
}
