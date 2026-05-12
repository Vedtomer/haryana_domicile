<?php

namespace App\Filament\Resources\Shield\RoleResource\Pages;

use App\Filament\Resources\Shield\RoleResource;
use App\Filament\Resources\Shield\RoleResource\PermissionSchema;
use BezhanSalleh\FilamentShield\Resources\RoleResource\Pages\EditRole as VendorEditRole;
use BezhanSalleh\FilamentShield\Support\Utils;
use Illuminate\Support\Arr;

class EditRole extends VendorEditRole
{
    protected static string $resource = RoleResource::class;

    protected function mutateFormDataBeforeSave(array $data): array
    {
        $permissions = [];
        foreach ($data as $key => $value) {
            if (str_starts_with($key, 'sidebar_') || str_starts_with($key, 'topbar_') || str_starts_with($key, 'dashboard_')) {
                if (is_array($value)) {
                    foreach ($value as $module) {
                        $modulePerms = PermissionSchema::getModulePermissions($module);
                        foreach ($modulePerms as $perm) {
                            $permissions[] = $perm;
                        }
                    }
                }
            }
        }
        $this->permissions = collect($permissions)->unique();

        return Arr::only($data, ['name', 'guard_name']);
    }

    protected function afterSave(): void
    {
        if ($this->permissions) {
            $this->record->syncPermissions($this->permissions);
        }
    }

    protected function getRedirectUrl(): string
    {
        return $this->getResource()::getUrl('index');
    }
}
