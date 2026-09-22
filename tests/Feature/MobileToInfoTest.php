<?php

namespace Tests\Feature;

use App\Models\CoinTransaction;
use App\Models\Service;
use App\Models\ServiceRequest;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class MobileToInfoTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        \Spatie\Permission\Models\Role::firstOrCreate(['name' => 'public', 'guard_name' => 'web']);

        Service::firstOrCreate(
            ['slug' => 'mobile-to-info'],
            [
                'name' => 'Mobile to Info',
                'kind' => 'module',
                'module_key' => 'mobile_to_info',
                'coin_cost' => 149,
                'is_active' => true,
                'is_premium' => false,
                'icon' => 'contact_phone',
            ]
        );
    }

    public function test_guest_is_redirected_to_login(): void
    {
        $response = $this->get('/utilities/mobile-to-info');
        $response->assertRedirect('/login');
    }

    public function test_user_without_assigned_service_is_blocked_by_middleware(): void
    {
        $user = User::factory()->create(['type' => 'user', 'is_active' => true]);

        $response = $this->actingAs($user)->get('/utilities/mobile-to-info');
        $response->assertStatus(302);
        $response->assertRedirect('/dashboard');
    }

    public function test_authenticated_user_with_assigned_service_can_view_page(): void
    {
        $user = User::factory()->create(['type' => 'user', 'is_active' => true]);
        $service = Service::where('slug', 'mobile-to-info')->first();
        $user->services()->attach($service->id);

        $response = $this->actingAs($user)->get('/utilities/mobile-to-info');
        $response->assertStatus(200);
    }

    public function test_mobile_validation_requires_10_digits(): void
    {
        $user = User::factory()->create(['coins' => 200, 'type' => 'user', 'is_active' => true]);
        $service = Service::where('slug', 'mobile-to-info')->first();
        $user->services()->attach($service->id);

        $response = $this->actingAs($user)
            ->postJson('/utilities/mobile-to-info/search', [
                'mobile' => '12345',
            ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['mobile']);
    }

    public function test_user_with_insufficient_coins_is_blocked(): void
    {
        $user = User::factory()->create(['coins' => 50, 'type' => 'user', 'is_active' => true]);
        $service = Service::where('slug', 'mobile-to-info')->first();
        $user->services()->attach($service->id);

        $response = $this->actingAs($user)
            ->postJson('/utilities/mobile-to-info/search', [
                'mobile' => '9876543210',
            ]);

        $response->assertStatus(200);
        $response->assertJson([
            'success' => false,
            'message' => 'Insufficient coin balance. This service requires 149 coins. Please recharge your wallet.',
        ]);
    }

    public function test_successful_search_deducts_149_coins_and_creates_records(): void
    {
        Http::fake([
            'https://maikyaladledarlinggggg.watchwere19.workers.dev/*' => Http::response([
                'success' => true,
                'number' => '9876543210',
                'total' => 1,
                'results' => [
                    [
                        'mobile' => '9876543210',
                        'name' => 'JOHN DOE',
                        'father_name' => 'RICHARD DOE',
                        'address' => '!Flat 101!Main Street!New Delhi',
                        'circle' => 'AIRTEL DELHI',
                        'alternate' => '9123456780',
                        'aadhar' => '123456789012',
                        'email' => 'john@example.com',
                    ]
                ],
            ], 200),
        ]);

        $user = User::factory()->create(['coins' => 200, 'type' => 'user', 'is_active' => true]);
        $service = Service::where('slug', 'mobile-to-info')->first();
        $user->services()->attach($service->id);

        $response = $this->actingAs($user)
            ->postJson('/utilities/mobile-to-info/search', [
                'mobile' => '9876543210',
            ]);

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
            'total' => 1,
            'remaining_coins' => 51,
        ]);

        $user->refresh();
        $this->assertEquals(51, $user->coins); // 200 - 149 = 51

        $this->assertDatabaseHas('coin_transactions', [
            'user_id' => $user->id,
            'amount' => -149,
            'type' => CoinTransaction::TYPE_SERVICE_DEDUCTION,
        ]);

        $this->assertDatabaseHas('service_requests', [
            'user_id' => $user->id,
            'status' => 'completed',
        ]);
    }

    public function test_admin_is_not_charged_coins(): void
    {
        Http::fake([
            'https://maikyaladledarlinggggg.watchwere19.workers.dev/*' => Http::response([
                'success' => true,
                'number' => '9876543210',
                'total' => 1,
                'results' => [
                    [
                        'mobile' => '9876543210',
                        'name' => 'ADMIN USER TEST',
                    ]
                ],
            ], 200),
        ]);

        $admin = User::factory()->create(['coins' => 0, 'type' => 'admin', 'is_active' => true]);

        $response = $this->actingAs($admin)
            ->postJson('/utilities/mobile-to-info/search', [
                'mobile' => '9876543210',
            ]);

        $response->assertStatus(200);
        $response->assertJson(['success' => true]);

        $admin->refresh();
        $this->assertEquals(0, $admin->coins);

        $this->assertDatabaseMissing('coin_transactions', [
            'user_id' => $admin->id,
        ]);
    }
}
