<?php

namespace App\Http\Responses;

use Filament\Http\Responses\Auth\Contracts\LoginResponse as LoginResponseContract;
use Illuminate\Http\RedirectResponse;
use Livewire\Features\SupportRedirects\Redirector;

class LoginResponse implements LoginResponseContract
{
    public function toResponse($request): RedirectResponse|Redirector
    {
        // Since we removed the /admin prefix, the root url is handled by a custom 
        // blade view directly instead of filament.admin.pages.dashboard
        // So we redirect directly to the /dashboard url, or wherever your dashboard route is now defined.
        
        return redirect()->to('/'); 
    }
}
