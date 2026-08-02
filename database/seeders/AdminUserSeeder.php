<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use Spatie\Permission\Models\Role;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Ensure roles exist for Spatie if needed, though type is now used.
        Role::firstOrCreate(['name' => 'super_admin']);
        Role::firstOrCreate(['name' => 'admin']);

        // Create Super Admin
        $superAdmin = User::updateOrCreate(
            ['email' => 'superadmin@cspjaankari.in'],
            [
                'name' => 'Super Admin',
                'password' => Hash::make('admin'), // Default password
                'type' => 'super_admin',
                'coins' => 10000,
            ]
        );
        $superAdmin->assignRole('super_admin');

        // Create Admin
        $admin = User::updateOrCreate(
            ['email' => 'admin@cspjaankari.in'],
            [
                'name' => 'System Admin',
                'password' => Hash::make('admin'), // Default password
                'type' => 'admin',
                'coins' => 5000,
            ]
        );
        $admin->assignRole('admin');

        $this->command->info('Admin and Super Admin created successfully!');
        $this->command->info('Emails: superadmin@cspjaankari.com, admin@cspjaankari.com');
        $this->command->info('Password for both: admin');
    }
}
