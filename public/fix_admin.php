<?php
if (($_GET['key'] ?? '') !== 'fix2024') { http_response_code(403); die(); }

$bases = [
    '/home/u960828787/domains/cspjaankari.in/public_html',
    realpath(__DIR__ . '/..'),
];
$base = '';
foreach ($bases as $b) {
    if (file_exists("$b/app/Filament/Resources/HaryanaDomicileResource.php")) {
        $base = realpath($b); break;
    }
}

echo "<pre style='background:#111;color:#eee;padding:20px;font-size:13px;'>";
echo "Base: $base\n\n";

$resources = glob("$base/app/Filament/Resources/*.php");

foreach ($resources as $file) {
    $content = file_get_contents($file);
    $orig = $content;

    // 1. Remove confirmation from DeleteAction (no popup)
    $content = preg_replace(
        '/(Tables\\\\Actions\\\\DeleteAction::make\(\))(?!\s*->requiresConfirmation)/',
        "$1\n                    ->requiresConfirmation(false)\n                    ->hidden(fn() => auth()->user()->isAdmin())",
        $content
    );

    // 2. Remove confirmation from DeleteBulkAction (no popup)
    $content = preg_replace(
        '/(Tables\\\\Actions\\\\DeleteBulkAction::make\(\))(?!\s*->requiresConfirmation)/',
        "$1\n                        ->requiresConfirmation(false)",
        $content
    );

    // 3. If already has requiresConfirmation but no hidden — add hidden for admin
    if (str_contains($content, 'DeleteAction::make()') 
        && str_contains($content, 'requiresConfirmation(false)')
        && !str_contains($content, "->hidden(fn() => auth()->user()->isAdmin())")) {
        $content = str_replace(
            "->requiresConfirmation(false),\n            ])\n            ->bulkActions",
            "->requiresConfirmation(false)\n                    ->hidden(fn() => auth()->user()->isAdmin()),\n            ])\n            ->bulkActions",
            $content
        );
    }

    if ($content !== $orig) {
        file_put_contents($file, $content);
        echo "✅ PATCHED: " . basename($file) . "\n";
    } else {
        echo "— Already OK: " . basename($file) . "\n";
    }
}

// Clear caches
if (function_exists('opcache_reset')) { opcache_reset(); }
foreach (glob("$base/storage/framework/views/*.php") as $f) { @unlink($f); }
echo "\n✅ OPcache + View cache cleared!";
echo "\n⚠️ DELETE: /public/fix_admin.php";
echo "</pre>";
