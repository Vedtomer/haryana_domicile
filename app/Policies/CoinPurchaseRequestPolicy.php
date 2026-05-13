<?php

namespace App\Policies;

use App\Models\User;
use App\Models\CoinPurchaseRequest;
use Illuminate\Auth\Access\HandlesAuthorization;

class CoinPurchaseRequestPolicy
{
    use HandlesAuthorization;
    
    public function before(User $user, string $ability): ?bool
    {
        if ($user->type === 'admin') {
            return true;
        }

        return null;
    }

    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, CoinPurchaseRequest $coinPurchaseRequest): bool
    {
        return $user->id === $coinPurchaseRequest->user_id;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->can('create_coin::purchase::request');
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, CoinPurchaseRequest $coinPurchaseRequest): bool
    {
        return $user->can('update_coin::purchase::request');
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, CoinPurchaseRequest $coinPurchaseRequest): bool
    {
        return $user->can('delete_coin::purchase::request');
    }

    /**
     * Determine whether the user can bulk delete.
     */
    public function deleteAny(User $user): bool
    {
        return $user->can('delete_any_coin::purchase::request');
    }

    /**
     * Determine whether the user can permanently delete.
     */
    public function forceDelete(User $user, CoinPurchaseRequest $coinPurchaseRequest): bool
    {
        return $user->can('force_delete_coin::purchase::request');
    }

    /**
     * Determine whether the user can permanently bulk delete.
     */
    public function forceDeleteAny(User $user): bool
    {
        return $user->can('force_delete_any_coin::purchase::request');
    }

    /**
     * Determine whether the user can restore.
     */
    public function restore(User $user, CoinPurchaseRequest $coinPurchaseRequest): bool
    {
        return $user->can('restore_coin::purchase::request');
    }

    /**
     * Determine whether the user can bulk restore.
     */
    public function restoreAny(User $user): bool
    {
        return $user->can('restore_any_coin::purchase::request');
    }

    /**
     * Determine whether the user can replicate.
     */
    public function replicate(User $user, CoinPurchaseRequest $coinPurchaseRequest): bool
    {
        return $user->can('replicate_coin::purchase::request');
    }

    /**
     * Determine whether the user can reorder.
     */
    public function reorder(User $user): bool
    {
        return $user->can('reorder_coin::purchase::request');
    }
}
