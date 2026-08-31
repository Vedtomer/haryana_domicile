<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Auto-deactivate users with 7+ days of inactivity — runs every day at 01:00 AM
Schedule::command('users:deactivate-inactive --days=7')->dailyAt('01:00');
