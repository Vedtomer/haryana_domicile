<?php

namespace App\Filament\Pages;

use Filament\Pages\Page;

class AdminDashboard extends Page
{
    protected static ?string $navigationIcon = 'heroicon-o-home';
    
    protected static ?string $title = 'Admin Dashboard';
    
    protected static ?string $slug = 'admin-dashboard';

    protected static string $view = 'filament.pages.admin-dashboard';

    protected function getHeaderWidgets(): array
    {
        return [
            \App\Filament\Widgets\AdminStatsWidget::class,
        ];
    }

    public static function canAccess(): bool
    {
        return auth()->check() && auth()->user()->type === 'admin';
    }

    public static function shouldRegisterNavigation(): bool
    {
        return auth()->check() && auth()->user()->type === 'admin';
    }
}
