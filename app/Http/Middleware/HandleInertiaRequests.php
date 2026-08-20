<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

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
                'user' => $request->user(),
            ],
            'flash' => [
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
            ],
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
