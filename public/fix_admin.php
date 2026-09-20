<?php
if (($_GET['key'] ?? '') !== 'fix2024') { http_response_code(403); die(); }

// Auto-find project root
$bases = [
    '/home/u960828787/domains/cspjaankari.in/public_html',
    __DIR__ . '/..',
];
$base = '';
foreach ($bases as $b) {
    if (file_exists("$b/app/Filament/Resources/HaryanaDomicileResource.php")) {
        $base = realpath($b);
        break;
    }
}

echo "<pre style='background:#111;color:#eee;padding:20px;font-size:13px;'>";
echo "Base: $base\n\n";

// Target all Filament resources - remove confirmation from ALL delete actions
$resources = glob("$base/app/Filament/Resources/*.php");

foreach ($resources as $file) {
    $content = file_get_contents($file);
    $orig = $content;
    
    // Regex: add ->requiresConfirmation(false) after DeleteAction::make() if not already present
    $content = preg_replace(
        '/Tables\\\\Actions\\\\DeleteAction::make\(\)(?!\s*->requiresConfirmation)/',
        "Tables\\\\Actions\\\\DeleteAction::make()\n                    ->requiresConfirmation(false)",
        $content
    );
    
    // Regex: add ->requiresConfirmation(false) after DeleteBulkAction::make() if not already present
    $content = preg_replace(
        '/Tables\\\\Actions\\\\DeleteBulkAction::make\(\)(?!\s*->requiresConfirmation)/',
        "Tables\\\\Actions\\\\DeleteBulkAction::make()\n                        ->requiresConfirmation(false)",
        $content
    );
    
    if ($content !== $orig) {
        file_put_contents($file, $content);
        echo "✅ PATCHED: " . basename($file) . "\n";
    } else {
        echo "— Already OK: " . basename($file) . "\n";
    }
}

// Clear OPcache + view cache
if (function_exists('opcache_reset')) { opcache_reset(); }
foreach (glob("$base/storage/framework/views/*.php") as $f) { @unlink($f); }

echo "\n✅ Done! OPcache & view cache cleared.";
echo "\n⚠️ DELETE: /public/fix_admin.php";
echo "</pre>";
