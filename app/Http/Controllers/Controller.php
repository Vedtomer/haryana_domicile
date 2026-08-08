<?php

namespace App\Http\Controllers;

use App\Models\CoinTransaction;
use App\Models\Service;

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

    /**
     * Admins run the platform, so they use every service free of charge.
     */
    protected function isStaff(): bool
    {
        $user = auth()->user();

        return $user->isAdmin() || $user->hasRole('super_admin');
    }

    /**
     * The service record backing a built-in module, whether active or not —
     * a switched-off service must block the module, not silently make it free.
     */
    protected function moduleService(string $moduleKey): ?Service
    {
        return Service::where('module_key', $moduleKey)->first();
    }

    /**
     * Returns an error message when the current user may not use the service
     * (switched off, or not enough coins). Null means they may proceed.
     */
    protected function serviceBlocker(?Service $service): ?string
    {
        if (!$service || $this->isStaff()) {
            return null;
        }

        if (!$service->is_active) {
            return "{$service->name} is currently unavailable. Please try again later.";
        }

        if ($service->isFree()) {
            return null;
        }

        $user = auth()->user();
        if ($user->hasEnoughCoins($service->coin_cost)) {
            return null;
        }

        return "You need {$service->coin_cost} coins for {$service->name}, but you only have {$user->coins}. Please buy more coins.";
    }

    /**
     * Deduct the service price from the current user. No-op for free services and staff.
     */
    protected function chargeForService(?Service $service, ?int $recordId = null, ?string $description = null): void
    {
        if (!$service || $service->isFree() || $this->isStaff()) {
            return;
        }

        auth()->user()->deductCoins(
            $service->coin_cost,
            CoinTransaction::TYPE_SERVICE_DEDUCTION,
            $description ?? "{$service->name} — {$service->coin_cost} coins",
            $service->module_key ?? $service->slug,
            $recordId,
        );
    }

    /**
     * Suffix appended to the success flash so the user sees what the action cost.
     */
    protected function chargeNote(?Service $service): string
    {
        if (!$service || $service->isFree() || $this->isStaff()) {
            return '';
        }

        return " {$service->coin_cost} coins deducted. Balance: " . auth()->user()->fresh()->coins . ' coins.';
    }
}
