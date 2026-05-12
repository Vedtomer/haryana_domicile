<?php

namespace App\Filament\Resources\Shield;

use App\Filament\Resources\Shield\RoleResource\Pages;
use App\Filament\Resources\Shield\RoleResource\PermissionSchema;
use BezhanSalleh\FilamentShield\Resources\RoleResource as VendorRoleResource;
use BezhanSalleh\FilamentShield\Support\Utils;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Facades\Filament;
use Illuminate\Validation\Rules\Unique;
use Illuminate\Contracts\Support\Arrayable;
use Filament\Forms\Components\Tabs;
use Filament\Tables\Table;
use Illuminate\Support\Str;

class RoleResource extends VendorRoleResource
{
    protected static ?string $slug = 'shield/roles';

    public static function canViewAny(): bool
    {
        return auth()->check() && auth()->user()->type === 'admin';
    }

    public static function canCreate(): bool
    {
        return auth()->check() && auth()->user()->type === 'admin';
    }

    public static function canEdit($record): bool
    {
        return auth()->check() && auth()->user()->type === 'admin';
    }

    public static function canDelete($record): bool
    {
        return auth()->check() && auth()->user()->type === 'admin';
    }

    public static function getShieldFormComponents(): \Filament\Forms\Components\Component
    {
        return parent::getShieldFormComponents();
    }

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Grid::make()
                    ->schema([
                        Forms\Components\Section::make()
                            ->schema([
                                Forms\Components\TextInput::make('name')
                                    ->label(__('filament-shield::filament-shield.field.name'))
                                    ->unique(ignoreRecord: true)
                                    ->required()
                                    ->maxLength(255),

                                Forms\Components\Hidden::make('guard_name')
                                    ->default('web'),
                            ])
                            ->columns([
                                'sm' => 2,
                                'lg' => 3,
                            ])
                            ->columnSpanFull(),
                    ]),
                static::getShieldFormComponents(),
            ]);
    }

    public static function table(Table $table): Table
    {
        return parent::table($table);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListRoles::route('/'),
            'create' => Pages\CreateRole::route('/create'),
            'view' => Pages\ViewRole::route('/{record}'),
            'edit' => Pages\EditRole::route('/{record}/edit'),
        ];
    }
}
