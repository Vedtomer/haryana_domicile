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

        $dailyBonusAwarded = false;
        if ($user && isset($user->last_daily_bonus_at)) {
            $today = now()->startOfDay();
            if (!$user->last_daily_bonus_at || $user->last_daily_bonus_at < $today) {
                $dailyBonusAwarded = $user->awardDailyLoginBonus();
            }
        }

        return [
            ...parent::share($request),
            'dailyBonusAwarded' => $dailyBonusAwarded,
            'auth' => [
                'user' => $user ? array_merge($user->toArray(), [
                    'has_active_license' => $user->hasActiveLicense(),
                    'license_expires_at' => $user->license_expires_at ? $user->license_expires_at->format('d M Y') : null,
                    'license_days_left'  => $user->licenseDaysLeft(),
                    'referral_code'      => $user->getActiveReferralCode(),
                    'referral_link'      => $user->referral_link,
                    'is_admin'           => $user->isAdmin(),
                    'is_staff'           => $user->isStaff(),
                ]) : null,
            ],
            'flash' => [
                'success'           => $request->session()->get('success'),
                'error'             => $request->session()->get('error'),
                'submitted_request' => $request->session()->get('submitted_request'),
                'generated_key'     => $request->session()->get('generated_key'),
            ],
            'pendingRequestsCount' => fn () => $user ? (
                ($user->isAdmin() || in_array($user->type ?? '', ['admin', 'super_admin']))
                    ? \App\Models\ServiceRequest::where('status', 'pending')->count()
                    : \App\Models\ServiceRequest::where('user_id', $user->id)->where('status', 'pending')->count()
            ) : 0,

            // Cached WhatsApp setting
            'whatsappNumber' => fn () => \Illuminate\Support\Facades\Cache::remember(
                'setting_whatsapp_number',
                600,
                fn () => \App\Models\Setting::get('whatsapp_number', '380630323112')
            ),

            // Sidebar service links — cached in cache store for 5 minutes
            'navServices' => fn () => $user
                ? \Illuminate\Support\Facades\Cache::remember(
                    'nav_services_v4_user_' . ($user->isAdmin() || $user->hasRole('super_admin') ? 'admin' : $user->id),
                    300,
                    function () use ($user) {
                        return \App\Models\Service::active()
                            ->when(
                                !($user->isAdmin() || $user->hasRole('super_admin')),
                                fn ($q) => $q->visibleTo($user)
                            )
                            ->ordered()
                            ->select(['id', 'name', 'icon', 'logo', 'module_key', 'kind', 'slug', 'coin_cost', 'is_premium'])
                            ->get()
                            ->map(fn ($s) => [
                                'id'         => $s->id,
                                'name'       => $s->name,
                                'slug'       => $s->slug,
                                'module_key' => $s->module_key,
                                'icon'       => $s->icon ?: '📄',
                                'logo_url'   => $s->logoUrl(),
                                'coin_cost'  => $s->coin_cost,
                                'is_free'    => $s->isFree(),
                                'is_premium' => (bool) $s->is_premium,
                                'url'        => $s->targetUrl(),
                            ]);
                    }
                )
                : [],

            // Active broadcast notices — cached for 60 seconds
            'activeBroadcastNotices' => fn () => \Illuminate\Support\Facades\Cache::remember(
                'active_broadcast_notices',
                60,
                function () {
                    try {
                        return \App\Models\BroadcastNotice::active()->latest()->take(5)->get();
                    } catch (\Throwable $e) {
                        return [];
                    }
                }
            ),

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
