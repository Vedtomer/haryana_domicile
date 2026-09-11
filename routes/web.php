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
    try {
        $output = '';
        \Illuminate\Support\Facades\Artisan::call('migrate', ['--force' => true]);
        $output .= "=== MIGRATE OUTPUT ===\n" . \Illuminate\Support\Facades\Artisan::output() . "\n\n";

        try {
            \Illuminate\Support\Facades\Artisan::call('db:seed', ['--class' => 'TenthPassbookSeeder', '--force' => true]);
            $output .= "=== TENTH PASSBOOK SEEDER ===\n" . \Illuminate\Support\Facades\Artisan::output() . "\n\n";
        } catch (\Throwable $se1) {
            $output .= "TenthPassbookSeeder Notice: " . $se1->getMessage() . "\n\n";
        }

        try {
            \Illuminate\Support\Facades\Artisan::call('db:seed', ['--class' => 'ServiceSeeder', '--force' => true]);
            $output .= "=== SERVICE SEEDER ===\n" . \Illuminate\Support\Facades\Artisan::output() . "\n\n";
        } catch (\Throwable $se2) {
            $output .= "ServiceSeeder Notice: " . $se2->getMessage() . "\n\n";
        }

        \Illuminate\Support\Facades\Artisan::call('cache:clear');
        \Illuminate\Support\Facades\Artisan::call('config:clear');
        \Illuminate\Support\Facades\Artisan::call('view:clear');
        \Illuminate\Support\Facades\Artisan::call('route:clear');
        $output .= "=== ALL CACHES CLEARED ===\nDone.\n";

        return "<div style='font-family:sans-serif;padding:30px;max-width:800px;margin:40px auto;background:#f0fdf4;border:2px solid #22c55e;border-radius:16px;color:#166534;'>"
            . "<h2 style='margin-top:0;'>✓ Database Migrated & Seeded Successfully!</h2>"
            . "<pre style='background:#111;color:#4ade80;padding:16px;border-radius:8px;overflow-x:auto;font-size:13px;'>" . htmlspecialchars($output) . "</pre>"
            . "<p><a href='/dashboard' style='background:#16a34a;color:white;padding:12px 24px;text-decoration:none;border-radius:8px;font-weight:bold;display:inline-block;margin-top:10px;'>Go to Dashboard &rarr;</a></p>"
            . "</div>";
    } catch (\Throwable $e) {
        return "<div style='font-family:sans-serif;padding:30px;max-width:800px;margin:40px auto;background:#fef2f2;border:2px solid #ef4444;border-radius:16px;color:#991b1b;'>"
            . "<h2 style='margin-top:0;'>✕ Migration Error:</h2>"
            . "<p><b>Message:</b> " . htmlspecialchars($e->getMessage()) . "</p>"
            . "<pre style='background:#111;color:#f87171;padding:16px;border-radius:8px;overflow-x:auto;font-size:12px;'>" . htmlspecialchars($e->getTraceAsString()) . "</pre>"
            . "</div>";
    }
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
    \App\Models\Service::updateOrCreate(
        ['slug' => 'pan-to-uid-advance'],
        [
            'name' => 'Pan To Uid Advance Instant',
            'description' => 'Get advanced UID details instantly using PAN.',
            'icon' => 'fingerprint',
            'coin_cost' => 149,
            'kind' => \App\Models\Service::KIND_MODULE,
            'module_key' => 'pan_to_uid_advance',
            'sort_order' => 13,
            'is_active' => true,
            'visibility' => \App\Models\Service::VISIBILITY_PUBLIC,
            'is_premium' => false,
            'unlock_cost' => 0,
        ]
    );
    \App\Models\Service::updateOrCreate(
        ['slug' => 'learning-licence-pdf'],
        [
            'name' => 'Learning Licence PDF Download',
            'description' => 'Download Learning Licence PDF instantly.',
            'icon' => 'directions_car',
            'coin_cost' => 19,
            'kind' => \App\Models\Service::KIND_MODULE,
            'module_key' => 'learning_licence_pdf',
            'sort_order' => 14,
            'is_active' => true,
            'visibility' => \App\Models\Service::VISIBILITY_PUBLIC,
            'is_premium' => false,
            'unlock_cost' => 0,
        ]
    );
    \App\Models\Service::updateOrCreate(
        ['slug' => 'voter-mobile-update'],
        [
            'name' => 'Voter Mobile Update Instant',
            'description' => 'Link mobile number to Voter ID (EPIC) instantly.',
            'icon' => 'contact_phone',
            'coin_cost' => 19,
            'kind' => \App\Models\Service::KIND_MODULE,
            'module_key' => 'voter_mobile_update',
            'sort_order' => 15,
            'is_active' => true,
            'visibility' => \App\Models\Service::VISIBILITY_PUBLIC,
            'is_premium' => false,
            'unlock_cost' => 0,
        ]
    );
    \App\Models\Service::updateOrCreate(
        ['slug' => 'mobile-to-pan'],
        [
            'name' => 'Mobile To Pan No. Instant',
            'description' => 'Get PAN Number instantly using Mobile Number and Name',
            'icon' => 'find_in_page',
            'coin_cost' => 149,
            'kind' => \App\Models\Service::KIND_MODULE,
            'module_key' => 'mobile_to_pan',
            'sort_order' => 16,
            'is_active' => true,
            'visibility' => \App\Models\Service::VISIBILITY_PUBLIC,
            'is_premium' => false,
            'unlock_cost' => 0,
        ]
    );
    \App\Models\Service::updateOrCreate(
        ['slug' => 'rc-pdf-instant'],
        [
            'name' => 'Rc Pdf Instant',
            'description' => 'Download Vehicle RC PDF instantly.',
            'icon' => 'local_shipping',
            'coin_cost' => 99,
            'kind' => \App\Models\Service::KIND_MODULE,
            'module_key' => 'rc_pdf_instant',
            'sort_order' => 17,
            'is_active' => true,
            'visibility' => \App\Models\Service::VISIBILITY_PUBLIC,
            'is_premium' => false,
            'unlock_cost' => 0,
        ]
    );
    return 'Service added successfully and made PUBLIC! Please go back to your dashboard.';
});

Route::get('/force-add-pvc-services', function () {
    $pvcServices = [
        [
            'name' => 'Smart PVC Card Maker',
            'slug' => 'pvc-card-maker',
            'description' => 'Generate Print-Ready PVC Front, Back & A4 Sheet from Haryana Family ID, Aadhaar, Ayushman, Voter, PAN, e-Shram PDFs.',
            'icon' => '🪪',
            'coin_cost' => 20,
            'kind' => \App\Models\Service::KIND_MODULE,
            'module_key' => 'pvc_card_maker',
            'sort_order' => 14,
            'is_active' => false,
            'visibility' => \App\Models\Service::VISIBILITY_PUBLIC,
            'is_premium' => false,
            'unlock_cost' => 0,
        ],
        [
            'name' => 'Haryana Family ID PVC Card',
            'slug' => 'haryana-familyid-pvc',
            'description' => 'Generate Print-Ready PVC Front, Back & A4 Sheet from Haryana Family ID PDF.',
            'icon' => '🆔',
            'coin_cost' => 20,
            'kind' => \App\Models\Service::KIND_MODULE,
            'module_key' => 'haryana_familyid_pvc',
            'sort_order' => 15,
            'is_active' => true,
            'visibility' => \App\Models\Service::VISIBILITY_PUBLIC,
            'is_premium' => false,
            'unlock_cost' => 0,
        ],
        [
            'name' => 'Aadhaar PVC Card Maker',
            'slug' => 'aadhaar-pvc-card',
            'description' => 'Generate Print-Ready PVC Front & Back Card from e-Aadhaar PDF.',
            'icon' => '🔍',
            'coin_cost' => 20,
            'kind' => \App\Models\Service::KIND_MODULE,
            'module_key' => 'aadhaar_pvc',
            'sort_order' => 16,
            'is_active' => true,
            'visibility' => \App\Models\Service::VISIBILITY_PUBLIC,
            'is_premium' => false,
            'unlock_cost' => 0,
        ],
        [
            'name' => 'Ayushman Bharat PVC Card',
            'slug' => 'ayushman-pvc',
            'description' => 'Generate Print-Ready PVC Front & Back Card from Ayushman Golden Card PDF.',
            'icon' => '🏥',
            'coin_cost' => 20,
            'kind' => \App\Models\Service::KIND_MODULE,
            'module_key' => 'ayushman_pvc',
            'sort_order' => 17,
            'is_active' => true,
            'visibility' => \App\Models\Service::VISIBILITY_PUBLIC,
            'is_premium' => false,
            'unlock_cost' => 0,
        ],
        [
            'name' => 'Voter (E-EPIC) PVC Card',
            'slug' => 'voter-pvc-card',
            'description' => 'Generate Print-Ready PVC Front & Back Card from Voter e-EPIC PDF.',
            'icon' => '🗳️',
            'coin_cost' => 20,
            'kind' => \App\Models\Service::KIND_MODULE,
            'module_key' => 'voter_pvc',
            'sort_order' => 18,
            'is_active' => true,
            'visibility' => \App\Models\Service::VISIBILITY_PUBLIC,
            'is_premium' => false,
            'unlock_cost' => 0,
        ],
        [
            'name' => 'PAN Card (NSDL) PVC',
            'slug' => 'pan-nsdl-pvc',
            'description' => 'Generate Print-Ready PVC Front & Back Card from NSDL e-PAN PDF.',
            'icon' => '💳',
            'coin_cost' => 20,
            'kind' => \App\Models\Service::KIND_MODULE,
            'module_key' => 'pan_nsdl_pvc',
            'sort_order' => 19,
            'is_active' => true,
            'visibility' => \App\Models\Service::VISIBILITY_PUBLIC,
            'is_premium' => false,
            'unlock_cost' => 0,
        ],
        [
            'name' => 'PAN Card (UTIITSL) PVC',
            'slug' => 'pan-uti-pvc',
            'description' => 'Generate Print-Ready PVC Front & Back Card from UTIITSL e-PAN PDF.',
            'icon' => '💳',
            'coin_cost' => 20,
            'kind' => \App\Models\Service::KIND_MODULE,
            'module_key' => 'pan_uti_pvc',
            'sort_order' => 20,
            'is_active' => true,
            'visibility' => \App\Models\Service::VISIBILITY_PUBLIC,
            'is_premium' => false,
            'unlock_cost' => 0,
        ],
        [
            'name' => 'PAN Card (Instant e-Filing) PVC',
            'slug' => 'pan-instant-pvc',
            'description' => 'Generate Print-Ready PVC Front & Back Card from Income Tax Instant e-PAN PDF.',
            'icon' => '💳',
            'coin_cost' => 20,
            'kind' => \App\Models\Service::KIND_MODULE,
            'module_key' => 'pan_instant_pvc',
            'sort_order' => 21,
            'is_active' => true,
            'visibility' => \App\Models\Service::VISIBILITY_PUBLIC,
            'is_premium' => false,
            'unlock_cost' => 0,
        ],
        [
            'name' => 'e-Shram PVC Card Maker',
            'slug' => 'eshram-pvc-card',
            'description' => 'Generate Print-Ready PVC Front & Back Card from e-Shram PDF.',
            'icon' => '👷',
            'coin_cost' => 20,
            'kind' => \App\Models\Service::KIND_MODULE,
            'module_key' => 'eshram_pvc',
            'sort_order' => 22,
            'is_active' => true,
            'visibility' => \App\Models\Service::VISIBILITY_PUBLIC,
            'is_premium' => false,
            'unlock_cost' => 0,
        ],
        [
            'name' => 'Make Driving Licence (Cards)',
            'slug' => 'make-driving-licence-card',
            'description' => 'Generate Print-Ready PVC Front, Back & A4 Sheet from Driving Licence Number and Date of Birth.',
            'icon' => '🚗',
            'coin_cost' => 20,
            'kind' => \App\Models\Service::KIND_MODULE,
            'module_key' => 'make_driving_licence_card',
            'sort_order' => 23,
            'is_active' => true,
            'visibility' => \App\Models\Service::VISIBILITY_PUBLIC,
            'is_premium' => false,
            'unlock_cost' => 0,
        ],
        [
            'name' => 'ABHA Health ID PVC Card',
            'slug' => 'healthid-pvc',
            'description' => 'Generate Print-Ready PVC Front & Back Card from ABHA Health ID PDF.',
            'icon' => '🏥',
            'coin_cost' => 20,
            'kind' => \App\Models\Service::KIND_MODULE,
            'module_key' => 'healthid_pvc',
            'sort_order' => 24,
            'is_active' => true,
            'visibility' => \App\Models\Service::VISIBILITY_PUBLIC,
            'is_premium' => false,
            'unlock_cost' => 0,
        ],
        [
            'name' => 'PM Vishwakarma PVC Card',
            'slug' => 'pmvishwakarma-pvc',
            'description' => 'Generate Print-Ready PVC Front & Back Card from PM Vishwakarma PDF.',
            'icon' => '🛠️',
            'coin_cost' => 20,
            'kind' => \App\Models\Service::KIND_MODULE,
            'module_key' => 'pmvishwakarma_pvc',
            'sort_order' => 25,
            'is_active' => true,
            'visibility' => \App\Models\Service::VISIBILITY_PUBLIC,
            'is_premium' => false,
            'unlock_cost' => 0,
        ],
        [
            'name' => 'APAAR / Student ID PVC Card',
            'slug' => 'aapar-pvc',
            'description' => 'Generate Print-Ready PVC Front & Back Card from APAAR Student ID PDF.',
            'icon' => '🎓',
            'coin_cost' => 20,
            'kind' => \App\Models\Service::KIND_MODULE,
            'module_key' => 'aapar_pvc',
            'sort_order' => 26,
            'is_active' => true,
            'visibility' => \App\Models\Service::VISIBILITY_PUBLIC,
            'is_premium' => false,
            'unlock_cost' => 0,
        ],
    ];

    foreach ($pvcServices as $service) {
        \App\Models\Service::updateOrCreate(
            ['slug' => $service['slug']],
            $service
        );
    }

    \App\Models\Service::where('slug', 'aadhar-update')->delete();

    return 'PVC Card Maker services added successfully and made PUBLIC! Please check your dashboard.';
});

use App\Http\Controllers\AuthController;

Route::get('/admin', function () {
    return redirect('/login');
});

Route::get('/login', [AuthController::class, 'showLogin'])->name('login')->middleware('guest');
Route::post('/login', [AuthController::class, 'login'])->middleware('guest');
Route::get('/captcha/refresh', [AuthController::class, 'refreshCaptcha'])->name('captcha.refresh')->middleware('throttle:30,1');
Route::get('/register', [AuthController::class, 'showRegister'])->name('register')->middleware('guest');
Route::post('/register/send-otp', [AuthController::class, 'sendOtp'])->name('register.send-otp')->middleware(['guest', 'throttle:6,1']);
Route::post('/register', [AuthController::class, 'register'])->middleware('guest');
Route::match(['get', 'post'], '/logout', [AuthController::class, 'logout'])->name('logout');

// Reactivation — no auth required (user is logged out)
Route::get('/reactivate', [\App\Http\Controllers\ReactivationController::class, 'show'])->name('reactivate.show');
Route::post('/reactivate', [\App\Http\Controllers\ReactivationController::class, 'store'])->name('reactivate.store');

    // Email Verification Routes (accessible when logged in, before email is verified)
    Route::middleware(['auth'])->group(function () {
        Route::get('/email/verify', [\App\Http\Controllers\EmailVerificationController::class, 'show'])->name('email.verify');
        Route::post('/email/send-otp', [\App\Http\Controllers\EmailVerificationController::class, 'sendOtp'])->name('email.send-otp')->middleware('throttle:6,1');
        Route::post('/email/verify', [\App\Http\Controllers\EmailVerificationController::class, 'verify'])->name('email.verify.post');
        Route::post('/email/update', [\App\Http\Controllers\EmailVerificationController::class, 'updateEmail'])->name('email.update')->middleware('throttle:6,1');
    });

    Route::middleware(['auth', 'verified.custom'])->group(function () {
        // 2FA Routes
        Route::get('/2fa/challenge', [\App\Http\Controllers\TwoFactorController::class, 'showChallenge'])->name('2fa.challenge');
        Route::post('/2fa/challenge', [\App\Http\Controllers\TwoFactorController::class, 'verifyChallenge'])->name('2fa.verify');
        Route::get('/2fa/setup', [\App\Http\Controllers\TwoFactorController::class, 'setup'])->name('2fa.setup');
        Route::post('/2fa/reset', [\App\Http\Controllers\TwoFactorController::class, 'resetSetup'])->name('2fa.reset');

        Route::get('/dashboard', [\App\Http\Controllers\DashboardController::class, 'index'])->name('dashboard');

        // License Purchase & Activation Routes
        Route::post('/license/buy', [\App\Http\Controllers\LicenseController::class, 'buy'])->name('license.buy');
        Route::post('/license/activate', [\App\Http\Controllers\LicenseController::class, 'activate'])->name('license.activate');

        // Real-Time Online Presence & Chat Routes
        Route::post('/chat/heartbeat', [\App\Http\Controllers\ChatController::class, 'heartbeat'])->name('chat.heartbeat');
        Route::get('/chat/unread-count', [\App\Http\Controllers\ChatController::class, 'getUnreadCount'])->name('chat.unread-count');
        Route::get('/chat/messages', [\App\Http\Controllers\ChatController::class, 'getUserChat'])->name('chat.user.messages');
        Route::post('/chat/send', [\App\Http\Controllers\ChatController::class, 'sendUserMessage'])->name('chat.user.send');

        // Real-Time Remote Screen Share Routes (User side)
        Route::get('/screen-share/incoming', [\App\Http\Controllers\ScreenShareController::class, 'checkIncoming'])->name('screen.incoming');
        Route::post('/screen-share/{session}/accept', [\App\Http\Controllers\ScreenShareController::class, 'acceptSession'])->name('screen.accept');
        Route::post('/screen-share/{session}/reject', [\App\Http\Controllers\ScreenShareController::class, 'rejectSession'])->name('screen.reject');
        Route::get('/screen-share/{session}/poll', [\App\Http\Controllers\ScreenShareController::class, 'pollUser'])->name('screen.user.poll');
        Route::post('/screen-share/{session}/candidate', [\App\Http\Controllers\ScreenShareController::class, 'sendCandidate'])->name('screen.candidate');
        Route::post('/screen-share/{session}/end', [\App\Http\Controllers\ScreenShareController::class, 'endSession'])->name('screen.end');

        // All portal services requiring active 6-Month license
        Route::middleware(['license.active'])->group(function () {
    
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

    Route::get('/utilities/pan-to-uid-advance', function () {
        $service = \App\Models\Service::where('slug', 'pan-to-uid-advance')->first();
        $user = auth()->user();
        if ($service && $service->is_premium && !$user->isAdmin() && !$user->hasRole('super_admin') && !$service->users()->where('user_id', $user->id)->exists()) {
            return redirect('/dashboard')->with('error', 'Please unlock this premium service first.');
        }
        return Inertia::render('Utilities/PanToUid');
    })->name('utilities.pan-to-uid-advance');

    Route::post('/utilities/pan-to-uid-advance/search', [\App\Http\Controllers\PanToUidController::class, 'search'])->name('utilities.pan-to-uid-advance.search');

    Route::get('/utilities/learning-licence-pdf', function () {
        $service = \App\Models\Service::where('slug', 'learning-licence-pdf')->first();
        $user = auth()->user();
        if ($service && $service->is_premium && !$user->isAdmin() && !$user->hasRole('super_admin') && !$service->users()->where('user_id', $user->id)->exists()) {
            return redirect('/dashboard')->with('error', 'Please unlock this premium service first.');
        }
        return Inertia::render('Utilities/LearningLicencePdf');
    })->name('utilities.learning-licence-pdf');

    Route::post('/utilities/learning-licence-pdf/search', [\App\Http\Controllers\LearningLicenceController::class, 'search'])->name('utilities.learning-licence-pdf.search');

    Route::get('/utilities/voter-mobile-update', function () {
        $service = \App\Models\Service::where('slug', 'voter-mobile-update')->first();
        $user = auth()->user();
        if ($service && $service->is_premium && !$user->isAdmin() && !$user->hasRole('super_admin') && !$service->users()->where('user_id', $user->id)->exists()) {
            return redirect('/dashboard')->with('error', 'Please unlock this premium service first.');
        }
        return Inertia::render('Utilities/VoterMobileUpdate');
    })->name('utilities.voter-mobile-update');

    Route::post('/utilities/voter-mobile-update/search', [\App\Http\Controllers\VoterMobileUpdateController::class, 'search'])->name('utilities.voter-mobile-update.search');

    Route::get('/utilities/mobile-to-pan', function () {
        $service = \App\Models\Service::where('slug', 'mobile-to-pan')->first();
        $user = auth()->user();
        if ($service && $service->is_premium && !$user->isAdmin() && !$user->hasRole('super_admin') && !$service->users()->where('user_id', $user->id)->exists()) {
            return redirect('/dashboard')->with('error', 'Please unlock this premium service first.');
        }
        return Inertia::render('Utilities/MobileToPan');
    })->name('utilities.mobile-to-pan');

    Route::post('/utilities/mobile-to-pan/search', [\App\Http\Controllers\MobileToPanController::class, 'search'])->name('utilities.mobile-to-pan.search');

    Route::get('/utilities/rc-pdf-instant', function () {
        $service = \App\Models\Service::where('slug', 'rc-pdf-instant')->first();
        $user = auth()->user();
        if ($service && $service->is_premium && !$user->isAdmin() && !$user->hasRole('super_admin') && !$service->users()->where('user_id', $user->id)->exists()) {
            return redirect('/dashboard')->with('error', 'Please unlock this premium service first.');
        }
        return Inertia::render('Utilities/RcPdf');
    })->name('utilities.rc-pdf-instant');

    Route::post('/utilities/rc-pdf-instant/search', [\App\Http\Controllers\RcPdfController::class, 'search'])->name('utilities.rc-pdf-instant.search');

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

    // IDCard Store Smart PVC Card Maker
    Route::get('/utilities/pvc-card-maker', [\App\Http\Controllers\PvcCardMakerController::class, 'index'])->name('utilities.pvc-card-maker');
    Route::post('/utilities/pvc-card-maker/generate', [\App\Http\Controllers\PvcCardMakerController::class, 'generate'])->name('utilities.pvc-card-maker.generate');
    Route::post('/utilities/pvc-card-maker/save-api-key', [\App\Http\Controllers\PvcCardMakerController::class, 'saveApiKey'])->name('utilities.pvc-card-maker.save-api-key');

    // Make Driving Licence (Cards)
    Route::get('/utilities/make-driving-licence-card', [\App\Http\Controllers\DrivingLicenceCardController::class, 'index'])->name('utilities.make-driving-licence-card');
    Route::post('/utilities/make-driving-licence-card/generate', [\App\Http\Controllers\DrivingLicenceCardController::class, 'generate'])->name('utilities.make-driving-licence-card.generate');
    Route::get('/utilities/driving-licence-card', function () {
        return redirect()->route('utilities.make-driving-licence-card');
    });

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

    }); // End of license.active middleware group

    // Admin Routes
    Route::prefix('admin')->name('admin.')->group(function() {
        // License Key Management — admin only
        Route::get('license-keys', [\App\Http\Controllers\LicenseController::class, 'adminIndex'])->name('license-keys.index')->middleware('admin');
        Route::post('license-keys/generate', [\App\Http\Controllers\LicenseController::class, 'adminGenerate'])->name('license-keys.generate')->middleware('admin');
        Route::post('license-keys/{id}/activate', [\App\Http\Controllers\LicenseController::class, 'adminActivate'])->name('license-keys.activate')->middleware('admin');
        Route::post('license-keys/{id}/deactivate', [\App\Http\Controllers\LicenseController::class, 'adminDeactivate'])->name('license-keys.deactivate')->middleware('admin');
        Route::post('license-keys/{id}/revoke', [\App\Http\Controllers\LicenseController::class, 'adminDeactivate'])->name('license-keys.revoke')->middleware('admin');
        Route::post('license-keys/{id}/reset-device', [\App\Http\Controllers\LicenseController::class, 'adminResetDevice'])->name('license-keys.reset-device')->middleware('admin');
        Route::delete('license-keys/{id}', [\App\Http\Controllers\LicenseController::class, 'adminDestroy'])->name('license-keys.destroy')->middleware('admin');

        // Service catalog — only admins can add services and set coin prices
        Route::patch('services/{service}/toggle-active', [\App\Http\Controllers\Admin\ServiceController::class, 'toggleActive'])
            ->name('services.toggle-active')->middleware('admin');
        Route::post('services/{service}', [\App\Http\Controllers\Admin\ServiceController::class, 'update'])
            ->name('services.update.post')->middleware('admin');
        Route::resource('services', \App\Http\Controllers\Admin\ServiceController::class)
            ->except('show')->middleware('admin');

        // Service requests — users submit, admins process
        Route::resource('service-requests', \App\Http\Controllers\Admin\ServiceRequestController::class)
            ->only(['index', 'create', 'store', 'show'])->middleware('license.active');
        Route::patch('service-requests/{serviceRequest}', [\App\Http\Controllers\Admin\ServiceRequestController::class, 'update'])
            ->name('service-requests.update')->middleware('admin');

        // Notifications
        Route::get('notifications', [\App\Http\Controllers\Admin\NotificationController::class, 'index'])->name('notifications.index');
        Route::post('notifications/read-all', [\App\Http\Controllers\Admin\NotificationController::class, 'markAllRead'])->name('notifications.read-all');
        Route::post('notifications/{id}/read', [\App\Http\Controllers\Admin\NotificationController::class, 'markRead'])->name('notifications.read');

        Route::resource('marriage-forms', \App\Http\Controllers\Admin\MarriageFormController::class)->middleware('license.active');
        Route::get('marriage-forms/{marriage_form}/print', [\App\Http\Controllers\Admin\MarriageFormController::class, 'print'])->name('marriage-forms.print');

        Route::resource('marriage-affidavits', \App\Http\Controllers\Admin\MarriageAffidavitController::class)->middleware('license.active');
        Route::get('marriage-affidavits/{marriage_affidavit}/print', [\App\Http\Controllers\Admin\MarriageAffidavitController::class, 'print'])->name('marriage-affidavits.print');

        Route::resource('birth-records', \App\Http\Controllers\Admin\BirthRecordController::class)->middleware('license.active');
        Route::resource('haryana-domicile', \App\Http\Controllers\Admin\HaryanaDomicileController::class)->middleware('license.active');
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

        // QR to Print (Smart Counter)
        Route::get('qr-to-print', [\App\Http\Controllers\QrPrintController::class, 'index'])->name('qr-to-print.index');
        Route::post('qr-to-print/settings', [\App\Http\Controllers\QrPrintController::class, 'updateSettings'])->name('qr-to-print.settings');
        Route::get('qr-to-print/standee', [\App\Http\Controllers\QrPrintController::class, 'standee'])->name('qr-to-print.standee');
        Route::get('qr-to-print/download-agent', [\App\Http\Controllers\QrPrintController::class, 'downloadAgentZip'])->name('qr-to-print.download-agent');
        Route::post('qr-to-print/reprint/{id}', [\App\Http\Controllers\QrPrintController::class, 'reprintJob'])->name('qr-to-print.reprint');
        Route::delete('qr-to-print/job/{id}', [\App\Http\Controllers\QrPrintController::class, 'deleteJob'])->name('qr-to-print.job.delete'); 

        Route::resource('airtel-passbook', \App\Http\Controllers\Admin\AirtelPassbookController::class);
        Route::get('airtel-passbook/{airtel_passbook}/print', [\App\Http\Controllers\Admin\AirtelPassbookController::class, 'print'])->name('airtel-passbook.print'); 

        Route::resource('coin-requests', \App\Http\Controllers\Admin\CoinPurchaseRequestController::class)->only(['index', 'create', 'store', 'update']);
        Route::resource('users', \App\Http\Controllers\Admin\UserController::class);
        Route::patch('users/{user}/toggle-status', [\App\Http\Controllers\Admin\UserController::class, 'toggleStatus'])->name('users.toggle-status');
        Route::post('users/{user}/add-coins', [\App\Http\Controllers\Admin\UserController::class, 'addCoins'])->name('users.add-coins');
        Route::post('users/{user}/clear-coins', [\App\Http\Controllers\Admin\UserController::class, 'clearCoins'])->name('users.clear-coins');

        // Admin Chat with Users
        Route::get('chat/{user}', [\App\Http\Controllers\ChatController::class, 'getAdminChat'])->name('admin.chat.messages');
        Route::post('chat/{user}/send', [\App\Http\Controllers\ChatController::class, 'sendAdminMessage'])->name('admin.chat.send');

        // Admin Screen Share & Display View
        Route::post('screen-share/{user}/start', [\App\Http\Controllers\ScreenShareController::class, 'startSession'])->name('admin.screen.start');
        Route::get('screen-share/{session}/poll', [\App\Http\Controllers\ScreenShareController::class, 'pollAdmin'])->name('admin.screen.poll');
        Route::post('screen-share/{session}/candidate', [\App\Http\Controllers\ScreenShareController::class, 'sendCandidate'])->name('admin.screen.candidate');
        Route::post('screen-share/{session}/end', [\App\Http\Controllers\ScreenShareController::class, 'endSession'])->name('admin.screen.end');

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

// Public Customer Mobile Portal for QR to Print
Route::get('/p/{shop_code}', [\App\Http\Controllers\PublicPrintController::class, 'showUploadPage'])->name('public.qr-print.upload');
Route::post('/p/{shop_code}/upload', [\App\Http\Controllers\PublicPrintController::class, 'uploadAndCreateJob'])->name('public.qr-print.submit');
Route::get('/p/job/{job_code}/status', [\App\Http\Controllers\PublicPrintController::class, 'checkJobStatus'])->name('public.qr-print.status');

// Silent Background Print Agent API
Route::prefix('api/print-agent')->group(function () {
    Route::post('/heartbeat', [\App\Http\Controllers\Api\PrintAgentApiController::class, 'heartbeat']);
    Route::get('/jobs', [\App\Http\Controllers\Api\PrintAgentApiController::class, 'getPendingJobs']);
    Route::get('/file/{job_code}', [\App\Http\Controllers\Api\PrintAgentApiController::class, 'downloadFile']);
    Route::post('/update-status', [\App\Http\Controllers\Api\PrintAgentApiController::class, 'updateJobStatus']);
});

