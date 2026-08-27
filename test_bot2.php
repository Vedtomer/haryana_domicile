<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$phone = config('services.callmebot.phone');
$apiKey = config('services.callmebot.api_key');

echo "Phone from config: " . ($phone ?? 'NULL') . "\n";
echo "API Key from config: " . ($apiKey ?? 'NULL') . "\n";
