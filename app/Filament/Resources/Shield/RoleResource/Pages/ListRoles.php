<?php

namespace App\Filament\Resources\Shield\RoleResource\Pages;

use App\Filament\Resources\Shield\RoleResource;
use BezhanSalleh\FilamentShield\Resources\RoleResource\Pages\ListRoles as VendorListRoles;

class ListRoles extends VendorListRoles
{
    protected static string $resource = RoleResource::class;
}
