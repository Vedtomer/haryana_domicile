<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;

use App\Http\Controllers\HaryanaDomicileController;
use App\Http\Controllers\PdfCoordinateController;

Route::get('/', function () {
    return view('landing');
});

// Haryana Domicile Print Route
Route::get('/haryana-domicile/print/{id}', [HaryanaDomicileController::class, 'print'])->name('haryana-domicile.print');

// PDF Coordinate Settings Routes
Route::post('/api/save-coordinates', [PdfCoordinateController::class, 'save'])->name('api.save-coordinates');

// Birth Record Print Route
Route::get('/birth-records/{record}/print', \App\Http\Controllers\PrintBirthRecordController::class)->name('birth-records.print');
