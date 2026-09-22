<?php

namespace Tests\Feature;

use App\Models\Service;
use App\Models\Setting;
use App\Models\User;
use App\Services\FasalService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class AadharToPppIdTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Role::firstOrCreate(['name' => 'public', 'guard_name' => 'web']);

        Service::firstOrCreate(
            ['slug' => 'aadhar-to-ppp-id'],
            [
                'name' => 'Aadhar Card to PPP ID Instant',
                'kind' => 'module',
                'module_key' => 'aadhar_to_ppp_id',
                'coin_cost' => 0,
                'is_active' => true,
                'is_premium' => false,
                'icon' => 'badge',
            ]
        );
    }

    public function test_guest_is_redirected_to_login(): void
    {
        $response = $this->get('/utilities/aadhar-to-ppp-id');
        $response->assertRedirect('/login');
    }

    public function test_user_without_assigned_service_is_blocked_by_middleware(): void
    {
        $user = User::factory()->create(['type' => 'user', 'is_active' => true]);

        $response = $this->actingAs($user)->get('/utilities/aadhar-to-ppp-id');
        $response->assertStatus(302);
        $response->assertRedirect('/dashboard');
    }

    public function test_authenticated_user_with_assigned_service_can_view_page(): void
    {
        $user = User::factory()->create(['type' => 'user', 'is_active' => true]);
        $service = Service::where('slug', 'aadhar-to-ppp-id')->first();
        $user->services()->attach($service->id);

        $response = $this->actingAs($user)->get('/utilities/aadhar-to-ppp-id');
        $response->assertStatus(200);
    }

    public function test_invalid_aadhar_returns_validation_error(): void
    {
        $user = User::factory()->create(['type' => 'user', 'is_active' => true]);
        $service = Service::where('slug', 'aadhar-to-ppp-id')->first();
        $user->services()->attach($service->id);

        $response = $this->actingAs($user)
            ->postJson('/utilities/aadhar-to-ppp-id/search', [
                'aadhar' => '12345',
            ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['aadhar']);
    }

    public function test_search_uses_fasal_service_and_returns_family_id(): void
    {
        $mockFasal = $this->createMock(FasalService::class);
        $mockFasal->expects($this->once())
            ->method('searchByAadhar')
            ->with('123456789012')
            ->willReturn([
                'success' => true,
                'family_id' => '1ABCD2345',
                'member_name' => 'RAMESH KUMAR',
                'message' => 'Family ID found successfully.',
            ]);

        $this->app->instance(FasalService::class, $mockFasal);

        $user = User::factory()->create(['type' => 'user', 'is_active' => true]);
        $service = Service::where('slug', 'aadhar-to-ppp-id')->first();
        $user->services()->attach($service->id);

        $response = $this->actingAs($user)
            ->postJson('/utilities/aadhar-to-ppp-id/search', [
                'aadhar' => '123456789012',
            ]);

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
            'family_id' => '1ABCD2345',
            'member_name' => 'RAMESH KUMAR',
        ]);

        $this->assertDatabaseHas('service_requests', [
            'user_id' => $user->id,
            'status' => 'completed',
        ]);
    }

    public function test_admin_can_update_ppp_api_settings(): void
    {
        $admin = User::factory()->create(['type' => 'admin', 'is_active' => true]);

        $response = $this->actingAs($admin)
            ->postJson('/utilities/aadhar-to-ppp-id/update-api', [
                'api_url' => 'https://custom-ppp-api.test/lookup?uid={aadhar}',
                'api_key' => 'secretPppKey',
            ]);

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
            'api_url' => 'https://custom-ppp-api.test/lookup?uid={aadhar}',
            'api_key' => 'secretPppKey',
        ]);

        $this->assertEquals('https://custom-ppp-api.test/lookup?uid={aadhar}', Setting::get('ppp_aadhar_to_ppp_url'));
        $this->assertEquals('secretPppKey', Setting::get('ppp_api_key'));
    }

    public function test_regular_user_cannot_update_ppp_api_settings(): void
    {
        $user = User::factory()->create(['type' => 'user', 'is_active' => true]);

        $response = $this->actingAs($user)
            ->postJson('/utilities/aadhar-to-ppp-id/update-api', [
                'api_url' => 'https://malicious.test/api',
            ]);

        $response->assertStatus(403);
    }

    public function test_custom_api_url_is_called_when_configured(): void
    {
        Setting::set('ppp_aadhar_to_ppp_url', 'https://custom-ppp-gateway.test/api?key={key}&aadharnum={aadhar}');
        Setting::set('ppp_api_key', 'myCustomToken');

        Http::fake([
            'https://custom-ppp-gateway.test/api?key=myCustomToken&aadharnum=987654321098*' => Http::response([
                'success' => true,
                'family_id' => '9XYZ9999',
                'member_name' => 'SURESH VERMA',
            ], 200),
        ]);

        $admin = User::factory()->create(['type' => 'admin', 'is_active' => true]);

        $response = $this->actingAs($admin)
            ->postJson('/utilities/aadhar-to-ppp-id/search', [
                'aadhar' => '987654321098',
            ]);

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
            'family_id' => '9XYZ9999',
            'member_name' => 'SURESH VERMA',
        ]);
    }
}
