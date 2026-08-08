<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use Inertia\Inertia;

use App\Http\Controllers\HaryanaDomicileController;
use App\Http\Controllers\PdfCoordinateController;

Route::get('/', function () {
    return Inertia::render('Frontend/Home');
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
        
        Route::resource('birth-records', \App\Http\Controllers\Admin\BirthRecordController::class);
        Route::resource('haryana-domicile', \App\Http\Controllers\Admin\HaryanaDomicileController::class);
        Route::get('haryana-domicile/{haryana_domicile}/print', [\App\Http\Controllers\Admin\HaryanaDomicileController::class, 'print'])->name('haryana-domicile.print');
        Route::resource('pan-requests', \App\Http\Controllers\Admin\PanRequestController::class);
        
        Route::resource('coin-requests', \App\Http\Controllers\Admin\CoinPurchaseRequestController::class)->only(['index', 'create', 'store', 'update']);
        Route::resource('users', \App\Http\Controllers\Admin\UserController::class);
        Route::patch('users/{user}/toggle-status', [\App\Http\Controllers\Admin\UserController::class, 'toggleStatus'])->name('users.toggle-status');
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
