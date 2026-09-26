<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;
use Symfony\Component\HttpFoundation\Response;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Handle the incoming request.
     */
    public function handle(Request $request, \Closure $next): Response
    {
        $response = parent::handle($request, $next);

        if ($response instanceof Response) {
            $response->headers->set('Vary', 'X-Inertia');
            // Only Inertia XHR requests need no-cache; HTML full-page loads can use bfcache
            if ($request->inertia()) {
                $response->headers->set('Cache-Control', 'no-cache, no-store, must-revalidate');
                $response->headers->set('Pragma', 'no-cache');
            }
        }

        return $response;
    }

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user ? array_merge($user->toArray(), [
                    'has_active_license' => $user->hasActiveLicense(),
                    'license_expires_at' => $user->license_expires_at ? $user->license_expires_at->format('d M Y') : null,
                    'license_days_left'  => $user->licenseDaysLeft(),
                    'referral_code'      => $user->getActiveReferralCode(),
                    'referral_link'      => $user->referral_link,
                ]) : null,
            ],
            'flash' => [
                'success'           => $request->session()->get('success'),
                'error'             => $request->session()->get('error'),
                'submitted_request' => $request->session()->get('submitted_request'),
                'generated_key'     => $request->session()->get('generated_key'),
            ],

            // once() ensures one DB hit per request even if accessed multiple times
            'whatsappNumber' => fn () => once(fn () => \App\Models\Setting::get('whatsapp_number', '380630323112')),

            // Sidebar service links — cached per-request with once()
            'navServices' => fn () => $user
                ? once(function () use ($user) {
                    return \App\Models\Service::active()
                        ->when(
                            !($user->isAdmin() || $user->hasRole('super_admin')),
                            fn ($q) => $q->visibleTo($user)
                        )
                        ->ordered()
                        ->select(['id', 'name', 'icon', 'logo', 'module_key', 'kind', 'slug'])
                        ->get()
                        ->map(fn ($s) => [
                            'id'       => $s->id,
                            'name'     => $s->name,
                            'icon'     => $s->icon ?: '📄',
                            'logo_url' => $s->logoUrl(),
                            'url'      => $s->targetUrl(),
                        ]);
                })
                : [],

            // Notification bell data
            'notifications' => fn () => $user ? [
                'unread' => $user->unreadNotifications()->count(),
                'recent' => $user->notifications()->take(8)->get()
                    ->map(fn ($n) => [
                        'id'    => $n->id,
                        'title' => $n->data['title'] ?? '',
                        'body'  => $n->data['body'] ?? '',
                        'url'   => $n->data['url'] ?? null,
                        'level' => $n->data['level'] ?? 'info',
                        'read'  => (bool) $n->read_at,
                        'ago'   => $n->created_at->diffForHumans(),
                    ]),
            ] : null,

            'switchAccount' => fn () => $user ? [
                'is_switched_from_admin' => (bool) $request->session()->has('original_admin_id'),
                'original_admin_name'    => $request->session()->has('original_admin_id')
                    ? \App\Models\User::find($request->session()->get('original_admin_id'))?->name
                    : null,
                'authenticated_accounts' => \App\Models\User::whereIn('id', array_unique(array_merge(
                    [$user->id],
                    $request->session()->get('switched_accounts', [])
                )))
                    ->get(['id', 'name', 'email', 'phone', 'type', 'coins'])
                    ->map(fn ($u) => [
                        'id'         => $u->id,
                        'name'       => $u->name,
                        'email'      => $u->email,
                        'phone'      => $u->phone,
                        'type'       => $u->type,
                        'coins'      => $u->coins,
                        'is_current' => $u->id === $user->id,
                    ])->values()->all(),
            ] : null,

            'currentService' => fn () => $request->route()
                ? \App\Models\Service::where('slug', str_replace('utilities.', '', $request->route()->getName()))->first()
                : null,
        ];
    }
}
