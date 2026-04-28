<?php

namespace App\Traits;

use App\Models\User;
use Illuminate\Support\Facades\Auth;

trait Authorizable
{
    /**
     * Get the currently logged in user
     */
    protected function getAuthUser(): ?User
    {
        return auth()->user();
    }

    /**
     * Check if current user is admin (admin or super_admin)
     */
    protected function isAdmin(): bool
    {
        $user = $this->getAuthUser();
        return $user && $user->isAdmin();
    }

    /**
     * Check if current user is super admin
     */
    protected function isSuperAdmin(): bool
    {
        $user = $this->getAuthUser();
        return $user && $user->isSuperAdmin();
    }

    /**
     * Check if current user is a normal user
     */
    protected function isRegularUser(): bool
    {
        $user = $this->getAuthUser();
        return $user && $user->isUser();
    }

    /**
     * Get the current user's role
     */
    protected function getCurrentRole(): ?string
    {
        $user = $this->getAuthUser();
        return $user ? $user->getRole() : null;
    }

    /**
     * Get the current user's ID
     */
    protected function getCurrentUserId(): ?int
    {
        $user = $this->getAuthUser();
        return $user ? $user->id : null;
    }

    /**
     * Apply user-based filtering to queries
     * If admin: return all records
     * If user: return only records where user_id = current user
     */
    protected function applyUserFilter($query)
    {
        $user = $this->getAuthUser();
        
        if (!$user) {
            return $query->where('user_id', null);
        }

        // If admin or super admin, show all records
        if ($user->isAdmin()) {
            return $query;
        }

        // If regular user, show only their own records
        return $query->where('user_id', $user->id);
    }

    /**
     * Check if user can view all data
     */
    protected function canViewAllData(): bool
    {
        return $this->isAdmin();
    }

    /**
     * Check if user can view specific record
     */
    protected function canViewRecord($record): bool
    {
        $user = $this->getAuthUser();
        
        if (!$user) {
            return false;
        }

        // Admin can view all records
        if ($user->isAdmin()) {
            return true;
        }

        // Regular user can only view their own records
        return $record->user_id == $user->id;
    }

    /**
     * Check if user can edit specific record
     */
    protected function canEditRecord($record): bool
    {
        return $this->canViewRecord($record);
    }

    /**
     * Check if user can delete specific record
     */
    protected function canDeleteRecord($record): bool
    {
        return $this->canViewRecord($record);
    }

    /**
     * Authorize action for specific record
     */
    protected function authorizeRecord(string $action, $record): void
    {
        if (!$this->canViewRecord($record)) {
            abort(403, 'You are not authorized to ' . $action . ' this record.');
        }
    }
}