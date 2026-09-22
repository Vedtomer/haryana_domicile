<?php

namespace Tests\Feature;

use App\Models\Service;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class ServiceVisibilityAndSwitchAccountTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Role::firstOrCreate(['name' => 'public', 'guard_name' => 'web']);
    }

    public function test_new_user_sees_no_services_until_admin_assigns_them(): void
    {
        $newUser = User::factory()->create([
            'type' => 'user',
            'is_active' => true,
        ]);

        // Create several services (even if marked public)
        $service1 = Service::create([
            'name' => 'Test Service 1',
            'slug' => 'test-service-1',
            'is_active' => true,
            'visibility' => 'public',
        ]);
        $service2 = Service::create([
            'name' => 'Test Service 2',
            'slug' => 'test-service-2',
            'is_active' => true,
            'visibility' => 'public',
        ]);

        // 1. New user has NO services assigned, so visibleTo MUST return 0
        $this->assertEquals(0, Service::visibleTo($newUser)->count());

        // 2. Admin configures / assigns service1 to the user
        $newUser->services()->sync([$service1->id]);

        // 3. Now only service1 is visible to the user
        $visibleServices = Service::visibleTo($newUser)->get();
        $this->assertCount(1, $visibleServices);
        $this->assertEquals($service1->id, $visibleServices->first()->id);
    }

    public function test_admin_sees_all_active_services(): void
    {
        $admin = User::factory()->create([
            'type' => 'admin',
            'is_active' => true,
        ]);

        Service::create([
            'name' => 'Test Admin Service 1',
            'slug' => 'test-admin-service-1',
            'is_active' => true,
        ]);
        Service::create([
            'name' => 'Test Admin Service 2',
            'slug' => 'test-admin-service-2',
            'is_active' => true,
        ]);

        // Admin sees all active services
        $this->assertEquals(Service::where('is_active', true)->count(), Service::visibleTo($admin)->count());
        $this->assertGreaterThanOrEqual(2, Service::visibleTo($admin)->count());
    }

    public function test_switch_account_login_authenticates_and_allows_switching(): void
    {
        $user1 = User::factory()->create([
            'name' => 'Operator One',
            'email' => 'operator1@example.com',
            'password' => Hash::make('password123'),
            'type' => 'user',
            'is_active' => true,
        ]);

        $user2 = User::factory()->create([
            'name' => 'Operator Two',
            'email' => 'operator2@example.com',
            'password' => Hash::make('secret456'),
            'type' => 'user',
            'is_active' => true,
        ]);

        // Act as user1
        $this->actingAs($user1);

        // Switch by logging into user2
        $response = $this->post('/switch-account/login', [
            'login' => 'operator2@example.com',
            'password' => 'secret456',
        ]);

        $response->assertRedirect('/dashboard');
        $this->assertEquals($user2->id, auth()->id());

        // Both accounts are now in session
        $this->assertContains($user1->id, session('switched_accounts', []));
        $this->assertContains($user2->id, session('switched_accounts', []));

        // Switch back to user1 with 1-click
        $switchResponse = $this->post('/switch-account/switch', [
            'user_id' => $user1->id,
        ]);

        $switchResponse->assertRedirect('/dashboard');
        $this->assertEquals($user1->id, auth()->id());
    }

    public function test_admin_can_switch_to_user_and_switch_back_to_admin(): void
    {
        $admin = User::factory()->create([
            'name' => 'Super Admin',
            'type' => 'admin',
            'is_active' => true,
        ]);

        $regularUser = User::factory()->create([
            'name' => 'Regular User',
            'type' => 'user',
            'is_active' => true,
        ]);

        $this->actingAs($admin);

        // Admin switches into regular user
        $response = $this->post('/switch-account/switch', [
            'user_id' => $regularUser->id,
        ]);

        $response->assertRedirect('/dashboard');
        $this->assertEquals($regularUser->id, auth()->id());
        $this->assertEquals($admin->id, session('original_admin_id'));

        // Switched user clicks "Switch Back to Admin"
        $backResponse = $this->post('/switch-account/back-to-admin');

        $backResponse->assertRedirect('/dashboard');
        $this->assertEquals($admin->id, auth()->id());
        $this->assertNull(session('original_admin_id'));
    }

    public function test_account_can_be_removed_from_switcher(): void
    {
        $user1 = User::factory()->create(['type' => 'user', 'is_active' => true]);
        $user2 = User::factory()->create(['type' => 'user', 'is_active' => true]);

        $this->actingAs($user1);
        session(['switched_accounts' => [$user1->id, $user2->id]]);

        $response = $this->post('/switch-account/remove', [
            'user_id' => $user2->id,
        ]);

        $response->assertSessionHas('success');
        $this->assertNotContains($user2->id, session('switched_accounts', []));
    }
}
