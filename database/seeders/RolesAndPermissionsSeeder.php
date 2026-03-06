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

        // Create Roles
        $superAdmin = Role::firstOrCreate(['name' => 'super_admin']);
        $admin = Role::firstOrCreate(['name' => 'admin']);
        $userRole = Role::firstOrCreate(['name' => 'user']);

        // Create a default super_admin for testing/setup
        $superAdminUser = User::firstOrCreate(
            ['email' => 'super@admin.com'],
            [
                'name' => 'Super Admin',
                'password' => Hash::make('admin'),
                'coins' => 1000
            ]
        );
        $superAdminUser->assignRole('super_admin');

        // Create a default admin for testing/setup
        $adminUser = User::firstOrCreate(
            ['email' => 'admin@admin.com'],
            [
                'name' => 'Admin User',
                'password' => Hash::make('admin'),
                'coins' => 500
            ]
        );
        $adminUser->assignRole('admin');

        $this->command->info('Super Admin & Admin users created successfully!');
        $this->command->info('Super Admin Email: super@admin.com');
        $this->command->info('Admin Email: admin@admin.com');
        $this->command->info('Password: password');
    }
}
