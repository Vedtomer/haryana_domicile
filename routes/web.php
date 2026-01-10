<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;

use App\Http\Controllers\HaryanaDomicileController;
use App\Http\Controllers\PdfCoordinateController;

Route::get('/', function () {
    return redirect('/admin');
});

// Haryana Domicile Print Route
Route::get('/haryana-domicile/print/{id}', [HaryanaDomicileController::class, 'print'])->name('haryana-domicile.print');

// PDF Coordinate Settings Routes
Route::get('/pdf-coordinates', [PdfCoordinateController::class, 'index'])->name('pdf.coordinates');
Route::post('/api/save-coordinates', [PdfCoordinateController::class, 'save'])->name('api.save-coordinates');
