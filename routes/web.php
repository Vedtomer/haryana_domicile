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
    return 'Database migrated successfully! Please go back to your dashboard.';
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
Route::middleware('auth')->group(function () {
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

        if ($response->successful() && $response->json('success') && $response->json('data.data')) {
            $data = $response->json('data.data');
            
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
        

        
        Route::resource('coin-requests', \App\Http\Controllers\Admin\CoinPurchaseRequestController::class)->only(['index', 'create', 'store', 'update']);
        Route::resource('users', \App\Http\Controllers\Admin\UserController::class);
        Route::patch('users/{user}/toggle-status', [\App\Http\Controllers\Admin\UserController::class, 'toggleStatus'])->name('users.toggle-status');
        Route::post('users/{user}/add-coins', [\App\Http\Controllers\Admin\UserController::class, 'addCoins'])->name('users.add-coins');
        Route::post('users/{user}/clear-coins', [\App\Http\Controllers\Admin\UserController::class, 'clearCoins'])->name('users.clear-coins');

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
