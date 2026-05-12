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
        return Forms\Components\Grid::make()
            ->schema([
                Forms\Components\Section::make('Module & Service Access')
                    ->description('Enable or disable full access to specific services')
                    ->schema([
                        Forms\Components\Grid::make(3)
                            ->schema(static::getTogglesForOptions(PermissionSchema::getSidebarOptions())),
                    ]),
                Forms\Components\Section::make('Dashboard Access')
                    ->schema([
                        Forms\Components\Grid::make(3)
                            ->schema(static::getTogglesForOptions(PermissionSchema::getDashboardOptions())),
                    ]),
            ])
            ->columnSpan('full');
    }

    protected static function getTogglesForOptions(array $groupedOptions): array
    {
        $toggles = [];
        foreach ($groupedOptions as $groupLabel => $options) {
            foreach ($options as $module => $label) {
                $toggles[] = Forms\Components\Toggle::make('module_' . $module)
                    ->label($label)
                    ->inline(false)
                    ->afterStateHydrated(function ($component, $record) use ($module) {
                        if (! $record) return;
                        $perms = PermissionSchema::getModulePermissions($module);
                        $hasAny = $record->permissions->pluck('name')->intersect($perms)->isNotEmpty();
                        $component->state($hasAny);
                    })
                    ->dehydrated(true);
            }
        }
        return $toggles;
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

                                Forms\Components\Toggle::make('select_all')
                                    ->label('On All Services')
                                    ->helperText('Enable all modules with one click')
                                    ->live()
                                    ->afterStateUpdated(function ($state, Forms\Set $set) {
                                        $sidebar = PermissionSchema::getSidebarOptions();
                                        $dashboard = PermissionSchema::getDashboardOptions();
                                        
                                        foreach ($sidebar as $group) {
                                            foreach (array_keys($group) as $module) {
                                                $set('module_' . $module, $state);
                                            }
                                        }

                                        foreach ($dashboard as $group) {
                                            foreach (array_keys($group) as $module) {
                                                $set('module_' . $module, $state);
                                            }
                                        }
                                    }),
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
