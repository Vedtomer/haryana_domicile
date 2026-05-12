<?php

namespace App\Http\Responses;

use Filament\Http\Responses\Auth\Contracts\LoginResponse as Responsable;
use Illuminate\Http\RedirectResponse;
use Livewire\Features\SupportRedirects\Redirector;

class LoginResponse implements Responsable
{
    public function toResponse($request): RedirectResponse|Redirector
    {
        $user = auth()->user();

        // Assign 'Public' role if user has no roles and is type 'user'
        if ($user->type === 'user' && $user->roles()->count() === 0) {
            $user->assignRole('Public');
        }

        if ($user->type === 'admin') {
            return redirect('/admin-dashboard');
        }

        return redirect('/dashboard');
    }
}
