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
    Route::get('/dashboard', function () {
        return Inertia::render('Admin/Dashboard');
    })->name('dashboard');
    
    // Admin Routes
    Route::prefix('admin')->name('admin.')->group(function() {
        Route::resource('marriage-forms', \App\Http\Controllers\Admin\MarriageFormController::class);
        Route::get('marriage-forms/{marriage_form}/print', [\App\Http\Controllers\Admin\MarriageFormController::class, 'print'])->name('marriage-forms.print');
        
        Route::resource('birth-records', \App\Http\Controllers\Admin\BirthRecordController::class);
        Route::resource('haryana-domicile', \App\Http\Controllers\Admin\HaryanaDomicileController::class);
        Route::resource('pan-requests', \App\Http\Controllers\Admin\PanRequestController::class);
        
        Route::resource('coin-requests', \App\Http\Controllers\Admin\CoinPurchaseRequestController::class)->only(['index', 'update']);
        Route::resource('users', \App\Http\Controllers\Admin\UserController::class);
        Route::get('profile', [\App\Http\Controllers\Admin\ProfileController::class, 'edit'])->name('profile.edit');
        Route::put('profile', [\App\Http\Controllers\Admin\ProfileController::class, 'update'])->name('profile.update');
    });
});

// Haryana Domicile Print Route
Route::get('/haryana-domicile/print/{id}', [HaryanaDomicileController::class, 'print'])->name('haryana-domicile.print');

// PDF Coordinate Settings Routes
Route::post('/api/save-coordinates', [PdfCoordinateController::class, 'save'])->name('api.save-coordinates');

// Birth Record Print Route
Route::get('/birth-records/{record}/print', \App\Http\Controllers\PrintBirthRecordController::class)->name('birth-records.print');
