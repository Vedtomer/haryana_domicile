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

    public static function getShieldFormComponents(): \Filament\Forms\Components\Component
    {
        $tabs = [];

        // 1. Sidebar Options Tab
        $sidebarComponents = [];
        $sidebarOptions = PermissionSchema::getSidebarOptions();
        
        foreach ($sidebarOptions as $label => $options) {
             $sidebarComponents[] = Forms\Components\Section::make($label)
                  ->compact()
                  ->schema([
                      Forms\Components\CheckboxList::make('sidebar_' . Str::slug($label))
                          ->label('')
                          ->hiddenLabel()
                          ->options($options)
                          ->bulkToggleable()
                          ->afterStateHydrated(function ($component, $record) {
                              if (! $record) return;
                              $optKeys = array_keys($component->getOptions()); // e.g. ['haryana_domicile']
                              $selected = [];
                              foreach ($optKeys as $module) {
                                  // If the role has the 'view_any' permission for this module, mark it as enabled
                                  $perms = PermissionSchema::getModulePermissions($module);
                                  $hasAny = $record->permissions->pluck('name')->intersect($perms)->isNotEmpty();
                                  if ($hasAny) {
                                      $selected[] = $module;
                                  }
                              }
                              $component->state($selected);
                          })
                          ->columns([
                              'sm' => 2,
                              'lg' => 4,
                          ])
                          ->columnSpanFull(),
                  ])
                  ->collapsible();
        }

        $tabs[] = Tabs\Tab::make('sidebar_options')
            ->label('Modules Access')
            ->badge(count($sidebarComponents))
            ->schema($sidebarComponents);

        // 2. Topbar Options Tab
        $topbarComponents = [];
        $topbarOptions = PermissionSchema::getTopbarOptions();
        
        foreach ($topbarOptions as $label => $options) {
             $topbarComponents[] = Forms\Components\Section::make($label)
                  ->compact()
                  ->schema([
                      Forms\Components\CheckboxList::make('topbar_' . Str::slug($label))
                          ->label('')
                          ->hiddenLabel()
                          ->options($options)
                          ->bulkToggleable()
                          ->afterStateHydrated(function ($component, $record) {
                              if (! $record) return;
                              $optKeys = array_keys($component->getOptions());
                              $selected = [];
                              foreach ($optKeys as $module) {
                                  $perms = PermissionSchema::getModulePermissions($module);
                                  $hasAny = $record->permissions->pluck('name')->intersect($perms)->isNotEmpty();
                                  if ($hasAny) {
                                      $selected[] = $module;
                                  }
                              }
                              $component->state($selected);
                          })
                          ->columns([
                              'sm' => 2,
                              'lg' => 4,
                          ])
                          ->columnSpanFull(),
                  ])
                  ->collapsible();
        }

        $tabs[] = Tabs\Tab::make('topbar_options')
            ->label('Settings Access')
            ->badge(count($topbarComponents))
            ->schema($topbarComponents);

        // 3. Dashboard Options Tab
        $dashboardComponents = [];
        $dashboardOptions = PermissionSchema::getDashboardOptions();
        
        foreach ($dashboardOptions as $label => $options) {
             $dashboardComponents[] = Forms\Components\Section::make($label)
                  ->compact()
                  ->schema([
                      Forms\Components\CheckboxList::make('dashboard_' . Str::slug($label))
                          ->label('')
                          ->hiddenLabel()
                          ->options($options)
                          ->bulkToggleable()
                          ->afterStateHydrated(function ($component, $record) {
                              if (! $record) return;
                              $optKeys = array_keys($component->getOptions());
                              $selected = [];
                              foreach ($optKeys as $module) {
                                  $perms = PermissionSchema::getModulePermissions($module);
                                  $hasAny = $record->permissions->pluck('name')->intersect($perms)->isNotEmpty();
                                  if ($hasAny) {
                                      $selected[] = $module;
                                  }
                              }
                              $component->state($selected);
                          })
                          ->columns([
                              'sm' => 2,
                              'lg' => 4,
                          ])
                          ->columnSpanFull(),
                  ])
                  ->collapsible();
        }

        $tabs[] = Tabs\Tab::make('dashboard_options')
            ->label('Dashboard Options')
            ->badge(count($dashboardComponents))
            ->schema($dashboardComponents);

        return Tabs::make('Permissions')
            ->tabs($tabs)
            ->columnSpan('full');
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

                                static::getSelectAllFormComponent(),
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
