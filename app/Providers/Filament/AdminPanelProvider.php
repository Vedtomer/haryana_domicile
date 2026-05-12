<?php

namespace App\Providers\Filament;

use Filament\Http\Middleware\Authenticate;
use BezhanSalleh\FilamentShield\FilamentShieldPlugin;
use Filament\Http\Middleware\AuthenticateSession;
use Filament\Http\Middleware\DisableBladeIconComponents;
use Filament\Http\Middleware\DispatchServingFilamentEvent;
use Filament\Pages;
use Filament\Panel;
use Filament\PanelProvider;
use Filament\Support\Colors\Color;
use Filament\Widgets;
use Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse;
use Illuminate\Cookie\Middleware\EncryptCookies;
use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken;
use Illuminate\Routing\Middleware\SubstituteBindings;
use Illuminate\Session\Middleware\StartSession;
use Illuminate\View\Middleware\ShareErrorsFromSession;
use Filament\Navigation\NavigationItem;

class AdminPanelProvider extends PanelProvider
{
    public function panel(Panel $panel): Panel
    {
        $navItems = [];
        
        $externalLinks = [
            ['name' => 'CUSTOMER SUPPORT', 'icon' => 'heroicon-o-chat-bubble-oval-left-ellipsis', 'url' => 'https://wa.me/380630323112'],
            ['name' => 'Pan To Aadhaar Link Status', 'icon' => 'heroicon-o-link', 'url' => 'https://eportal.incometax.gov.in/iec/foservices/#/pre-login/link-aadhaar-status'],
            ['name' => 'RESIZE PDF', 'icon' => 'heroicon-o-document-minus', 'url' => 'https://pdf.pi7.org/resize-pdf'],
            ['name' => 'Pention Check', 'icon' => 'heroicon-o-hand-raised', 'url' => 'https://pension.socialjusticehry.gov.in/Ben_Inf'],
            ['name' => 'LIC PAY', 'icon' => 'heroicon-o-shield-check', 'url' => 'https://ebiz.licindia.in/D2CPM/#DirectPay'],
            ['name' => 'Photo Bg Remove', 'icon' => 'heroicon-o-photo', 'url' => 'https://www.remove.bg/'],
        ];

        $manualServices = [
            ['name' => 'Aadhaar Info', 'icon' => 'heroicon-o-identification', 'type' => 'aadhar'],
            ['name' => 'Family Info', 'icon' => 'heroicon-o-user-group', 'type' => 'familyinfo'],
            ['name' => 'Linked Mobile', 'icon' => 'heroicon-o-device-phone-mobile', 'type' => 'vnum'],
            ['name' => 'Instagram Intel', 'icon' => 'heroicon-o-camera', 'type' => 'insta'],
            ['name' => 'Pincode Details', 'icon' => 'heroicon-o-map-pin', 'type' => 'pincode'],
            ['name' => 'PAN Info', 'icon' => 'heroicon-o-credit-card', 'type' => 'pan'],
            ['name' => 'Telegram Number', 'icon' => 'heroicon-o-paper-airplane', 'type' => 'tgnum'],
            ['name' => 'Vehicle Owner', 'icon' => 'heroicon-o-truck', 'type' => 'vowner'],
            ['name' => 'IFSC Details', 'icon' => 'heroicon-o-building-library', 'type' => 'ifsc'],
            ['name' => 'GST Data', 'icon' => 'heroicon-o-briefcase', 'type' => 'gst'],
        ];

        foreach ($externalLinks as $link) {
            $navItems[] = NavigationItem::make($link['name'])
                ->icon($link['icon'])
                ->url($link['url'])
                ->openUrlInNewTab()
                ->group('Others');
        }

        foreach ($manualServices as $service) {
            $navItems[] = NavigationItem::make($service['name'])
                ->icon($service['icon'])
                ->url(fn () => \App\Filament\Pages\ManualService::getUrl(['type' => $service['type']]))
                ->visible(fn () => auth()->user()?->can('page_ManualService') ?? false)
                ->group('Others');
        }

        $navItems[] = NavigationItem::make('PAN CARD')
            ->icon('heroicon-o-identification')
            ->url('javascript:window.dispatchEvent(new CustomEvent("open-pan-modal"))')
            ->group('Others');

        return $panel
            ->default()
            ->id('admin')
            ->path('')
            ->login()
            ->registration(\App\Filament\Pages\Auth\Register::class)
            ->passwordReset()
            ->brandName('')
            ->brandLogo(asset('Digital_India_logo.png'))
            ->brandLogoHeight('2rem')
            ->sidebarWidth('14rem')
            ->darkMode(false)
            ->colors([
                'primary' => Color::Amber,
            ])
            ->discoverResources(in: app_path('Filament/Resources'), for: 'App\\Filament\\Resources')
            ->discoverPages(in: app_path('Filament/Pages'), for: 'App\\Filament\\Pages')
            ->pages([
                \App\Filament\Pages\CustomDashboard::class,
            ])
            ->discoverWidgets(in: app_path('Filament/Widgets'), for: 'App\\Filament\\Widgets')
            ->widgets([
                // Widgets\AccountWidget::class,
                // Widgets\FilamentInfoWidget::class,
            ])
            ->middleware([
                EncryptCookies::class,
                AddQueuedCookiesToResponse::class,
                StartSession::class,
                AuthenticateSession::class,
                ShareErrorsFromSession::class,
                VerifyCsrfToken::class,
                SubstituteBindings::class,
                DisableBladeIconComponents::class,
                DispatchServingFilamentEvent::class,
            ])
            ->plugins([
                FilamentShieldPlugin::make()
                    ->simpleResourcePermissionView(true),
            ])
            ->navigationItems($navItems)
            ->renderHook(
                \Filament\View\PanelsRenderHook::USER_MENU_BEFORE,
                fn (): string => view('filament.hooks.topbar-actions'),
            )
            ->userMenuItems([
                'pdf-coordinates' => \Filament\Navigation\MenuItem::make()
                    ->label('PDF Coordinates')
                    ->url(fn (): string => \App\Filament\Pages\PdfCoordinates::getUrl())
                    ->icon('heroicon-o-cog-6-tooth')
                    ->visible(fn (): bool => auth()->user()->type === 'admin'),
            ])
            ->authMiddleware([
                Authenticate::class,
            ]);
    }

    public function boot(): void
    {
        // Bind Filament's response contracts to our custom response classes
        $this->app->bind(\Filament\Http\Responses\Auth\Contracts\LogoutResponse::class, \App\Http\Responses\LogoutResponse::class);
        $this->app->bind(\Filament\Http\Responses\Auth\Contracts\LoginResponse::class, \App\Http\Responses\LoginResponse::class);
    }
}
