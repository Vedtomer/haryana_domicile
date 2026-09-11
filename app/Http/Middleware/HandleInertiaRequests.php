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
            $response->headers->set('Cache-Control', 'no-cache, no-store, max-age=0, must-revalidate');
            $response->headers->set('Pragma', 'no-cache');
            $response->headers->set('Expires', '0');
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
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user() ? array_merge($request->user()->toArray(), [
                    'has_active_license' => $request->user()->hasActiveLicense(),
                    'license_expires_at' => $request->user()->license_expires_at ? $request->user()->license_expires_at->format('d M Y') : null,
                    'license_days_left' => $request->user()->licenseDaysLeft(),
                    'referral_code' => $request->user()->getActiveReferralCode(),
                    'referral_link' => $request->user()->referral_link,
                ]) : null,
            ],
            'flash' => [
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
                'login_voice' => $request->session()->get('login_voice'),
                'submitted_request' => $request->session()->get('submitted_request'),
                'generated_key' => $request->session()->get('generated_key'),
            ],

            'whatsappNumber' => fn () => \App\Models\Setting::get('whatsapp_number', '380630323112'),
            // Sidebar service links — kept in sync with what the admin has switched on,
            // and filtered by the same visibility rule the dashboard cards use.
            'navServices' => fn () => $request->user()
                ? \App\Models\Service::active()
                    ->when(
                        !($request->user()->isAdmin() || $request->user()->hasRole('super_admin')),
                        fn ($q) => $q->visibleTo($request->user())
                    )
                    ->ordered()->get()
                    ->map(fn ($s) => [
                        'id' => $s->id,
                        'name' => $s->name,
                        'icon' => $s->icon ?: '📄',
                        'logo_url' => $s->logoUrl(),
                        'url' => $s->targetUrl(),
                    ])
                : [],
            // Powers the bell in the header on every authenticated page.
            'notifications' => fn () => $request->user() ? [
                'unread' => $request->user()->unreadNotifications()->count(),
                'recent' => $request->user()->notifications()->take(8)->get()
                    ->map(fn ($n) => [
                        'id' => $n->id,
                        'title' => $n->data['title'] ?? '',
                        'body' => $n->data['body'] ?? '',
                        'url' => $n->data['url'] ?? null,
                        'level' => $n->data['level'] ?? 'info',
                        'read' => (bool) $n->read_at,
                        'ago' => $n->created_at->diffForHumans(),
                    ]),
            ] : null,
        ];
    }
}
