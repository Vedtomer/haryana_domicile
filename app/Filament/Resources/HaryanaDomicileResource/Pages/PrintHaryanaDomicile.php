<?php

namespace App\Filament\Resources\HaryanaDomicileResource\Pages;

use App\Filament\Resources\HaryanaDomicileResource;
use Filament\Resources\Pages\Page;
use App\Models\HaryanaDomicile;
use Filament\Resources\Pages\Concerns\InteractsWithRecord;

class PrintHaryanaDomicile extends Page
{
    use InteractsWithRecord;

    protected static string $resource = HaryanaDomicileResource::class;

    protected static string $view = 'filament.resources.haryana-domicile-resource.pages.print-haryana-domicile';

    protected static ?string $title = 'Print Haryana Domicile';
    
    // Hide the navigation from the sidebar (it's accessed via action)
    protected static bool $shouldRegisterNavigation = false;

    public function mount(int | string $record): void
    {
        $this->record = $this->resolveRecord($record);
    }
}
