<?php
use Illuminate\Support\Facades\Route;
Route::get('/test-login', function() {
    auth()->loginUsingId(1);
    return redirect('/dashboard');
});
