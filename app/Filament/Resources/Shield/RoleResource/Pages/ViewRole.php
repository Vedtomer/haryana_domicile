<?php

namespace App\Filament\Resources\Shield\RoleResource\Pages;

use App\Filament\Resources\Shield\RoleResource;
use BezhanSalleh\FilamentShield\Resources\RoleResource\Pages\ViewRole as VendorViewRole;

class ViewRole extends VendorViewRole
{
    protected static string $resource = RoleResource::class;
}
