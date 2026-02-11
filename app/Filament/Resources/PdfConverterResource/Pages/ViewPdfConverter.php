<?php

namespace App\Filament\Resources\PdfConverterResource\Pages;

use App\Filament\Resources\PdfConverterResource;
use Filament\Resources\Pages\ViewRecord;
use Filament\Infolists;
use Filament\Infolists\Infolist;

class ViewPdfConverter extends ViewRecord
{
    protected static string $resource = PdfConverterResource::class;

    public function infolist(Infolist $infolist): Infolist
    {
        return $infolist
            ->schema([
            Infolists\Components\Section::make('Converted Images')
            ->schema([
                Infolists\Components\ImageEntry::make('front_image_path')
                ->label('Front Image')
                ->disk('public')
                ->height(400),
                Infolists\Components\ImageEntry::make('back_image_path')
                ->label('Back Image')
                ->disk('public')
                ->height(400),
            ])
            ->columns(2),

            Infolists\Components\Section::make('File Information')
            ->schema([
                Infolists\Components\TextEntry::make('original_filename')
                ->label('Original Filename'),
                Infolists\Components\TextEntry::make('created_at')
                ->label('Converted At')
                ->dateTime(),
            ])
            ->columns(2),
        ]);
    }

    protected function getHeaderActions(): array
    {
        return [
            \Filament\Actions\Action::make('download_front')
            ->label('Download Front')
            ->icon('heroicon-o-arrow-down-tray')
            ->color('success')
            ->url(fn() => asset('storage/' . $this->record->front_image_path))
            ->openUrlInNewTab(),
            \Filament\Actions\Action::make('download_back')
            ->label('Download Back')
            ->icon('heroicon-o-arrow-down-tray')
            ->color('success')
            ->url(fn() => asset('storage/' . $this->record->back_image_path))
            ->openUrlInNewTab(),
        ];
    }
}
