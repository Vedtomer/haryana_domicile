<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use Inertia\Inertia;

use App\Http\Controllers\HaryanaDomicileController;
use App\Http\Controllers\PdfCoordinateController;

Route::get('/', function () {
    return Inertia::render('Frontend/Home');
});

Route::get('/migrate-db', function () {
    \Illuminate\Support\Facades\Artisan::call('migrate', ['--force' => true]);
    \Illuminate\Support\Facades\Artisan::call('db:seed', ['--class' => 'TenthPassbookSeeder', '--force' => true]);
    \Illuminate\Support\Facades\Artisan::call('db:seed', ['--class' => 'ServiceSeeder', '--force' => true]);
    return 'Database migrated and seeded successfully! Please go back to your dashboard.';
});

Route::get('/force-add-service', function () {
    \App\Models\Service::updateOrCreate(
        ['slug' => 'aadhar-to-pan'],
        [
            'name' => 'Aadhar To Pan Unmasked Instant',
            'description' => 'Instantly find the unmasked PAN number linked to an Aadhaar number.',
            'icon' => '🔍',
            'coin_cost' => 69,
            'kind' => \App\Models\Service::KIND_MODULE,
            'module_key' => 'aadhar_to_pan',
            'sort_order' => 9,
            'is_active' => true,
            'visibility' => \App\Models\Service::VISIBILITY_PUBLIC,
            'is_premium' => false,
            'unlock_cost' => 0,
        ]
    );
    \App\Models\Service::updateOrCreate(
        ['slug' => 'saral-status'],
        [
            'name' => 'Saral Certificate Status',
            'description' => 'Check the status of any Saral Certificate using its reference number instantly.',
            'icon' => '📃',
            'coin_cost' => 0,
            'kind' => \App\Models\Service::KIND_MODULE,
            'module_key' => 'saral_status',
            'sort_order' => 10,
            'is_active' => true,
            'visibility' => \App\Models\Service::VISIBILITY_PUBLIC,
            'is_premium' => false,
            'unlock_cost' => 0,
        ]
    );
    \App\Models\Service::updateOrCreate(
        ['slug' => 'pan-full-details-instant'],
        [
            'name' => 'PAN Full Details Instant',
            'description' => 'Get complete PAN card details instantly.',
            'icon' => 'fingerprint',
            'coin_cost' => 19,
            'kind' => \App\Models\Service::KIND_MODULE,
            'module_key' => 'pan_full_details_instant',
            'sort_order' => 11,
            'is_active' => true,
            'visibility' => \App\Models\Service::VISIBILITY_PUBLIC,
            'is_premium' => false,
            'unlock_cost' => 0,
        ]
    );
    \App\Models\Service::updateOrCreate(
        ['slug' => 'pan-to-aadhar-unmasked'],
        [
            'name' => 'PAN To Aadhaar Unmasked Instant',
            'description' => 'Get unmasked Aadhaar details instantly using PAN.',
            'icon' => 'badge',
            'coin_cost' => 99,
            'kind' => \App\Models\Service::KIND_MODULE,
            'module_key' => 'pan_to_aadhar_unmasked',
            'sort_order' => 12,
            'is_active' => true,
            'visibility' => \App\Models\Service::VISIBILITY_PUBLIC,
            'is_premium' => false,
            'unlock_cost' => 0,
        ]
    );
    return 'Service added successfully and made PUBLIC! Please go back to your dashboard.';
});

use App\Http\Controllers\AuthController;

Route::get('/admin', function () {
    return redirect('/login');
});

Route::get('/login', [AuthController::class, 'showLogin'])->name('login')->middleware('guest');
Route::post('/login', [AuthController::class, 'login'])->middleware('guest');
Route::get('/register', [AuthController::class, 'showRegister'])->name('register')->middleware('guest');
Route::post('/register', [AuthController::class, 'register'])->middleware('guest');
Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

// Reactivation — no auth required (user is logged out)
Route::get('/reactivate', [\App\Http\Controllers\ReactivationController::class, 'show'])->name('reactivate.show');
Route::post('/reactivate', [\App\Http\Controllers\ReactivationController::class, 'store'])->name('reactivate.store');

    Route::middleware('auth')->group(function () {
        // 2FA Routes
        Route::get('/2fa/challenge', [\App\Http\Controllers\TwoFactorController::class, 'showChallenge'])->name('2fa.challenge');
        Route::post('/2fa/challenge', [\App\Http\Controllers\TwoFactorController::class, 'verifyChallenge'])->name('2fa.verify');
        Route::get('/2fa/setup', [\App\Http\Controllers\TwoFactorController::class, 'setup'])->name('2fa.setup');
        Route::post('/2fa/reset', [\App\Http\Controllers\TwoFactorController::class, 'resetSetup'])->name('2fa.reset');

        Route::get('/dashboard', [\App\Http\Controllers\DashboardController::class, 'index'])->name('dashboard');
    
    Route::get('/utilities/electricity-bill', function () {
        return Inertia::render('Utilities/ElectricityBill');
    })->name('utilities.electricity-bill');

    Route::get('/utilities/electricity-bill/download', function (Request $request) {
        $uid = $request->query('uid');
        if (!$uid) return back()->with('error', 'Account number is required');

        $url = "https://uhbvn.org.in/Rapdrp/BD?UID=" . $uid;
        $response = \Illuminate\Support\Facades\Http::get($url);

        // UHBVN returns text/plain or HTML if invalid, and application/pdf if valid
        if ($response->successful() && str_contains($response->header('Content-Type'), 'pdf')) {
            $service = \App\Models\Service::where('slug', 'electricity-bill')->first();
            \App\Models\ServiceRequest::create([
                'user_id' => auth()->id(),
                'service_id' => $service ? $service->id : null,
                'service_name' => $service ? $service->name : 'Electricity Bill',
                'input_data' => ['Account Number (UID)' => $uid],
                'coins_charged' => 0,
                'status' => \App\Models\ServiceRequest::STATUS_COMPLETED,
                'completed_at' => now(),
            ]);

            return response($response->body())
                ->header('Content-Type', 'application/pdf')
                ->header('Content-Disposition', 'attachment; filename="Electricity_Bill_' . $uid . '.pdf"');
        }

        return back()->with('error', 'Bill not found. Please check your Account Number.');
    })->name('utilities.electricity-bill.download');

    Route::get('/utilities/aadhar-to-family-id', function () {
        $service = \App\Models\Service::where('slug', 'aadhar-to-family-id')->first();
        $user = auth()->user();
        if ($service && $service->is_premium && !$user->isAdmin() && !$user->hasRole('super_admin') && !$service->users()->where('user_id', $user->id)->exists()) {
            return redirect('/dashboard')->with('error', 'Please unlock this premium service first.');
        }
        return Inertia::render('Utilities/AadharToFamilyId');
    })->name('utilities.aadhar-to-family-id');

    Route::post('/utilities/aadhar-to-family-id/search', [\App\Http\Controllers\AadharToFamilyIdController::class, 'search'])->name('utilities.aadhar-to-family-id.search');

    Route::get('/utilities/aadhar-to-name', function () {
        $service = \App\Models\Service::where('slug', 'aadhar-to-name')->first();
        $user = auth()->user();
        if ($service && $service->is_premium && !$user->isAdmin() && !$user->hasRole('super_admin') && !$service->users()->where('user_id', $user->id)->exists()) {
            return redirect('/dashboard')->with('error', 'Please unlock this premium service first.');
        }
        return Inertia::render('Utilities/AadharToName');
    })->name('utilities.aadhar-to-name');

    Route::post('/utilities/aadhar-to-name/search', [\App\Http\Controllers\AadharToNameController::class, 'search'])->name('utilities.aadhar-to-name.search');

    Route::get('/utilities/pan-details-instant', function () {
        $service = \App\Models\Service::where('slug', 'pan-details-instant')->first();
        $user = auth()->user();
        if ($service && $service->is_premium && !$user->isAdmin() && !$user->hasRole('super_admin') && !$service->users()->where('user_id', $user->id)->exists()) {
            return redirect('/dashboard')->with('error', 'Please unlock this premium service first.');
        }
        return Inertia::render('Utilities/PanDetails');
    })->name('utilities.pan-details-instant');

    Route::post('/utilities/pan-details-instant/search', [\App\Http\Controllers\PanDetailsController::class, 'search'])->name('utilities.pan-details-instant.search');

    Route::get('/utilities/pan-full-details-instant', function () {
        $service = \App\Models\Service::where('slug', 'pan-full-details-instant')->first();
        $user = auth()->user();
        if ($service && $service->is_premium && !$user->isAdmin() && !$user->hasRole('super_admin') && !$service->users()->where('user_id', $user->id)->exists()) {
            return redirect('/dashboard')->with('error', 'Please unlock this premium service first.');
        }
        return Inertia::render('Utilities/PanFullDetails');
    })->name('utilities.pan-full-details-instant');

    Route::post('/utilities/pan-full-details-instant/search', [\App\Http\Controllers\PanFullDetailsController::class, 'search'])->name('utilities.pan-full-details-instant.search');

    Route::get('/utilities/pan-to-aadhar-unmasked', function () {
        $service = \App\Models\Service::where('slug', 'pan-to-aadhar-unmasked')->first();
        $user = auth()->user();
        if ($service && $service->is_premium && !$user->isAdmin() && !$user->hasRole('super_admin') && !$service->users()->where('user_id', $user->id)->exists()) {
            return redirect('/dashboard')->with('error', 'Please unlock this premium service first.');
        }
        return Inertia::render('Utilities/PanToAadhar');
    })->name('utilities.pan-to-aadhar-unmasked');

    Route::post('/utilities/pan-to-aadhar-unmasked/search', [\App\Http\Controllers\PanToAadharController::class, 'search'])->name('utilities.pan-to-aadhar-unmasked.search');

    Route::get('/utilities/aadhar-to-mask-pan', function () {
        $service = \App\Models\Service::where('slug', 'aadhar-to-mask-pan')->first();
        $user = auth()->user();
        if ($service && $service->is_premium && !$user->isAdmin() && !$user->hasRole('super_admin') && !$service->users()->where('user_id', $user->id)->exists()) {
            return redirect('/dashboard')->with('error', 'Please unlock this premium service first.');
        }
        return Inertia::render('Utilities/AadharToMaskPan');
    })->name('utilities.aadhar-to-mask-pan');

    Route::post('/utilities/aadhar-to-mask-pan/search', [\App\Http\Controllers\AadharToMaskPanController::class, 'search'])->name('utilities.aadhar-to-mask-pan.search');

    Route::get('/utilities/aadhar-to-pan', function () {
        $service = \App\Models\Service::where('slug', 'aadhar-to-pan')->first();
        $user = auth()->user();
        if ($service && $service->is_premium && !$user->isAdmin() && !$user->hasRole('super_admin') && !$service->users()->where('user_id', $user->id)->exists()) {
            return redirect('/dashboard')->with('error', 'Please unlock this premium service first.');
        }
        return Inertia::render('Utilities/AadharToPan');
    })->name('utilities.aadhar-to-pan');

    Route::post('/utilities/aadhar-to-pan/search', [\App\Http\Controllers\AadharToPanController::class, 'search'])->name('utilities.aadhar-to-pan.search');

    Route::get('/utilities/saral-status', function () {
        $service = \App\Models\Service::where('slug', 'saral-status')->first();
        $user = auth()->user();
        if ($service && $service->is_premium && !$user->isAdmin() && !$user->hasRole('super_admin') && !$service->users()->where('user_id', $user->id)->exists()) {
            return redirect('/dashboard')->with('error', 'Please unlock this premium service first.');
        }
        return Inertia::render('Utilities/SaralStatus');
    })->name('utilities.saral-status');

    Route::post('/utilities/saral-status/search', [\App\Http\Controllers\SaralStatusController::class, 'search'])->name('utilities.saral-status.search');

    Route::get('/utilities/aadhaar-services', function () {
        $service = \App\Models\Service::where('slug', 'aadhaar-services')->first();
        $user = auth()->user();
        if ($service && $service->is_premium && !$user->isAdmin() && !$user->hasRole('super_admin') && !$service->users()->where('user_id', $user->id)->exists()) {
            return redirect('/dashboard')->with('error', 'Please unlock this premium service first.');
        }
        return Inertia::render('Utilities/AadhaarServices');
    })->name('utilities.aadhaar-services');

    Route::get('/utilities/pdf-resizer', function () {
        $service = \App\Models\Service::where('slug', 'pdf-resizer')->first();
        $user = auth()->user();
        if ($service && $service->is_premium && !$user->isAdmin() && !$user->hasRole('super_admin') && !$service->users()->where('user_id', $user->id)->exists()) {
            return redirect('/dashboard')->with('error', 'Please unlock this premium service first.');
        }
        return Inertia::render('Utilities/PdfResizer');
    })->name('utilities.pdf-resizer');

    Route::get('/utilities/vehicle-to-mobile', function () {
        $service = \App\Models\Service::where('slug', 'vehicle-to-mobile')->first();
        return Inertia::render('Utilities/VehicleToMobile');
    })->name('utilities.vehicle-to-mobile');

    Route::post('/utilities/vehicle-to-mobile/search', [\App\Http\Controllers\VehicleToMobileController::class, 'search'])->name('utilities.vehicle-to-mobile.search');



    Route::get('/utilities/passport-maker', [\App\Http\Controllers\PassportMakerController::class, 'index'])->name('utilities.passport-maker');
    Route::post('/utilities/passport-maker/deduct-coins', [\App\Http\Controllers\PassportMakerController::class, 'deductCoins'])->name('utilities.passport-maker.deduct-coins');

    Route::get('/utilities/vehicle-details', function () {
        return Inertia::render('Utilities/VehicleDetails');
    })->name('utilities.vehicle-details');

    Route::get('/utilities/vehicle-details/download', function (Request $request) {
        $service = \App\Models\Service::where('slug', 'vehicle-details')->first();
        $user = auth()->user();
        
        $regNo = $request->query('reg_no');
        if (!$regNo) return back()->with('error', 'Vehicle Registration Number is required');

        $coinCost = $service ? $service->coin_cost : 20; // Default to 20 if service not found
        if ($user->coins < $coinCost && !$user->isAdmin() && !$user->hasRole('super_admin')) {
            return back()->with('error', "Insufficient coins. This service requires {$coinCost} coins.");
        }

        $url = "https://api.paanel.shop/api/gateway.php?key=DuXxZxX&DJ=" . urlencode($regNo);
        $response = \Illuminate\Support\Facades\Http::get($url);

        if ($response->successful() && $response->json('data') && $response->json('data.regNo')) {
            $data = $response->json('data');
            
            // Deduct coins only if successful
            if (!$user->isAdmin() && !$user->hasRole('super_admin')) {
                $user->deductCoins($coinCost, \App\Models\CoinTransaction::TYPE_SERVICE_DEDUCTION, 'Vehicle Details Download: ' . strtoupper($regNo));
            }

            \App\Models\ServiceRequest::create([
                'user_id' => $user->id,
                'service_id' => $service ? $service->id : null,
                'service_name' => $service ? $service->name : 'Vehicle Details (RC)',
                'input_data' => ['Vehicle Registration Number' => strtoupper($regNo)],
                'coins_charged' => $user->isAdmin() || $user->hasRole('super_admin') ? 0 : $coinCost,
                'status' => \App\Models\ServiceRequest::STATUS_COMPLETED,
                'completed_at' => now(),
            ]);
            
            $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdf.vehicle_details', ['data' => $data]);
            return response($pdf->output())
                ->header('Content-Type', 'application/pdf')
                ->header('Content-Disposition', 'attachment; filename="Vehicle_Details_' . strtoupper($regNo) . '.pdf"');
        }

        return back()->with('error', 'Vehicle details not found. Please check the Registration Number.');
    })->name('utilities.vehicle-details.download');

    // Premium Service Unlock
    Route::post('/services/{service}/unlock', function (\App\Models\Service $service) {
        $user = auth()->user();
        if (!$service->is_premium) {
            return back()->with('error', 'This service is not premium.');
        }
        if ($service->users()->where('user_id', $user->id)->exists()) {
            return back()->with('error', 'Service is already unlocked.');
        }
        if ($user->coins < $service->unlock_cost) {
            return back()->with('error', 'Insufficient coins to unlock. Please recharge.');
        }
        
        \Illuminate\Support\Facades\DB::transaction(function () use ($user, $service) {
            $user->deductCoins($service->unlock_cost, \App\Models\CoinTransaction::TYPE_SERVICE_DEDUCTION, "Unlocked Premium Service: {$service->name}");
            $service->users()->attach($user->id);
        });

        return back()->with('success', "Service {$service->name} unlocked successfully!");
    })->name('services.unlock');

    // Admin Routes
    Route::prefix('admin')->name('admin.')->group(function() {
        // Service catalog — only admins can add services and set coin prices
        Route::resource('services', \App\Http\Controllers\Admin\ServiceController::class)
            ->except('show')->middleware('admin');

        // Service requests — users submit, admins process
        Route::resource('service-requests', \App\Http\Controllers\Admin\ServiceRequestController::class)
            ->only(['index', 'create', 'store', 'show']);
        Route::patch('service-requests/{serviceRequest}', [\App\Http\Controllers\Admin\ServiceRequestController::class, 'update'])
            ->name('service-requests.update')->middleware('admin');

        // Notifications
        Route::get('notifications', [\App\Http\Controllers\Admin\NotificationController::class, 'index'])->name('notifications.index');
        Route::post('notifications/read-all', [\App\Http\Controllers\Admin\NotificationController::class, 'markAllRead'])->name('notifications.read-all');
        Route::post('notifications/{id}/read', [\App\Http\Controllers\Admin\NotificationController::class, 'markRead'])->name('notifications.read');

        Route::resource('marriage-forms', \App\Http\Controllers\Admin\MarriageFormController::class);
        Route::get('marriage-forms/{marriage_form}/print', [\App\Http\Controllers\Admin\MarriageFormController::class, 'print'])->name('marriage-forms.print');

        Route::resource('marriage-affidavits', \App\Http\Controllers\Admin\MarriageAffidavitController::class);
        Route::get('marriage-affidavits/{marriage_affidavit}/print', [\App\Http\Controllers\Admin\MarriageAffidavitController::class, 'print'])->name('marriage-affidavits.print');

        Route::resource('birth-records', \App\Http\Controllers\Admin\BirthRecordController::class);
        Route::resource('haryana-domicile', \App\Http\Controllers\Admin\HaryanaDomicileController::class);
        Route::get('haryana-domicile/{haryana_domicile}/print', [\App\Http\Controllers\Admin\HaryanaDomicileController::class, 'print'])->name('haryana-domicile.print');
        
        Route::get('aadhar-update/grid', function () {
        return response()->file(public_path('aadhar_update/grid.jpg'));
    })->name('aadhar-update.grid');

    Route::resource('aadhar-update', \App\Http\Controllers\Admin\AadharUpdateController::class);
        Route::get('aadhar-update/{aadhar_update}/print', [\App\Http\Controllers\Admin\AadharUpdateController::class, 'print'])->name('aadhar-update.print');

        Route::get('pincode-lookup/{pincode}', [\App\Http\Controllers\Admin\PincodeLookupController::class, 'lookup'])->name('pincode-lookup');
        Route::resource('pan-requests', \App\Http\Controllers\Admin\PanRequestController::class);
        
        Route::resource('manual-pan-cards', \App\Http\Controllers\Admin\ManualPanCardController::class);
        Route::get('manual-pan-cards/{manual_pan_card}/print', [\App\Http\Controllers\Admin\ManualPanCardController::class, 'print'])->name('manual-pan-cards.print'); 

        Route::resource('tenth-passbook', \App\Http\Controllers\Admin\TenthPassbookController::class);
        Route::get('tenth-passbook/{tenth_passbook}/print', [\App\Http\Controllers\Admin\TenthPassbookController::class, 'print'])->name('tenth-passbook.print'); 

        Route::resource('airtel-passbook', \App\Http\Controllers\Admin\AirtelPassbookController::class);
        Route::get('airtel-passbook/{airtel_passbook}/print', [\App\Http\Controllers\Admin\AirtelPassbookController::class, 'print'])->name('airtel-passbook.print'); 

        Route::resource('coin-requests', \App\Http\Controllers\Admin\CoinPurchaseRequestController::class)->only(['index', 'create', 'store', 'update']);
        Route::resource('users', \App\Http\Controllers\Admin\UserController::class);
        Route::patch('users/{user}/toggle-status', [\App\Http\Controllers\Admin\UserController::class, 'toggleStatus'])->name('users.toggle-status');
        Route::post('users/{user}/add-coins', [\App\Http\Controllers\Admin\UserController::class, 'addCoins'])->name('users.add-coins');
        Route::post('users/{user}/clear-coins', [\App\Http\Controllers\Admin\UserController::class, 'clearCoins'])->name('users.clear-coins');

        Route::get('reactivation-requests', [\App\Http\Controllers\Admin\ReactivationRequestController::class, 'index'])->name('reactivation-requests.index');
        Route::post('reactivation-requests/{reactivationRequest}/approve', [\App\Http\Controllers\Admin\ReactivationRequestController::class, 'approve'])->name('reactivation-requests.approve');
        Route::post('reactivation-requests/{reactivationRequest}/reject',  [\App\Http\Controllers\Admin\ReactivationRequestController::class, 'reject'])->name('reactivation-requests.reject');

        Route::get('user-permissions', [\App\Http\Controllers\Admin\UserPermissionsController::class, 'index'])->name('user-permissions.index');
        Route::post('user-permissions/{user}', [\App\Http\Controllers\Admin\UserPermissionsController::class, 'update'])->name('user-permissions.update');
        Route::get('profile', [\App\Http\Controllers\Admin\ProfileController::class, 'edit'])->name('profile.edit');
        Route::put('profile', [\App\Http\Controllers\Admin\ProfileController::class, 'update'])->name('profile.update');

        // Payment / QR Settings — admin only
        Route::get('payment-settings', [\App\Http\Controllers\Admin\PaymentSettingController::class, 'edit'])->name('payment-settings.edit');
        Route::put('payment-settings', [\App\Http\Controllers\Admin\PaymentSettingController::class, 'update'])->name('payment-settings.update');



        // Haryana Domicile PDF Coordinates — admin only
        Route::get('pdf-coordinates', [PdfCoordinateController::class, 'edit'])->name('pdf-coordinates.edit');
        Route::post('pdf-coordinates', [PdfCoordinateController::class, 'save'])->name('pdf-coordinates.save');
    });
});

// Haryana Domicile Print Route
Route::get('/haryana-domicile/print/{id}', [HaryanaDomicileController::class, 'print'])->name('haryana-domicile.print');

// Birth Record Print Route
Route::get('/birth-records/{record}/print', \App\Http\Controllers\PrintBirthRecordController::class)->name('birth-records.print');


Route::get('/cc', function() {
    \Illuminate\Support\Facades\Artisan::call('cache:clear');
    \Illuminate\Support\Facades\Artisan::call('config:clear');
    \Illuminate\Support\Facades\Artisan::call('view:clear');
    \Illuminate\Support\Facades\Artisan::call('route:clear');
    return 'All caches cleared successfully!';
});

Route::get('/test-login', function() {
    auth()->loginUsingId(1);
    return redirect('/dashboard');
});
