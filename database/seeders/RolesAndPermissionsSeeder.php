<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class RolesAndPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Generate Shield Permissions
        \Illuminate\Support\Facades\Artisan::call('shield:generate --all --panel=admin --no-interaction');

        // Create Roles
        $superAdmin = Role::firstOrCreate(['name' => 'super_admin']);
        $userRole = Role::firstOrCreate(['name' => 'user']);

        // Give all permissions to super_admin
        $allPermissions = Permission::all();
        $superAdmin->syncPermissions($allPermissions);

        // Give basic permissions to user
        $userRole->syncPermissions(['page_CustomDashboard']);

        // Create Admin User
        $adminUser = User::updateOrCreate(
            ['email' => 'admin@admin.com'],
            [
                'name' => 'Admin User',
                'password' => Hash::make('admin'),
                'coins' => 10000,
                'type' => 'admin'
            ]
        );
        $adminUser->assignRole($superAdmin);

        // Create Regular User
        $regularUser = User::updateOrCreate(
            ['email' => 'user@user.com'],
            [
                'name' => 'Regular User',
                'password' => Hash::make('user@123'),
                'coins' => 100,
                'type' => 'user'
            ]
        );
        $regularUser->assignRole($userRole);

        $this->command->info('Roles and Permissions synced!');
        $this->command->info('Admin Account: admin@admin.com / admin@123');
        $this->command->info('User Account: user@user.com / user@123');
    }
}
