<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$phone = env('CALLMEBOT_PHONE');
$apiKey = env('CALLMEBOT_API_KEY');

echo "Phone from env: " . ($phone ?? 'NULL') . "\n";
echo "API Key from env: " . ($apiKey ?? 'NULL') . "\n";

if ($phone && $apiKey) {
    try {
        $response = \Illuminate\Support\Facades\Http::timeout(10)->get('https://api.callmebot.com/whatsapp.php', [
            'phone' => $phone,
            'text' => "Test from test_bot.php",
            'apikey' => $apiKey,
        ]);
        echo "Status: " . $response->status() . "\n";
        echo "Body: " . $response->body() . "\n";
    } catch (\Exception $e) {
        echo "Exception: " . $e->getMessage() . "\n";
    }
}
