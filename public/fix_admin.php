<?php
if (($_GET['key'] ?? '') !== 'fix2024') { http_response_code(403); die('Forbidden'); }

$results = [];

// Files to patch - remove isAdmin() bypass from getEloquentQuery
$resources = [
    __DIR__ . '/../app/Filament/Resources/HaryanaDomicileResource.php',
    __DIR__ . '/../app/Filament/Resources/BirthRecordResource.php',
    __DIR__ . '/../app/Filament/Resources/ServiceRequestResource.php',
    __DIR__ . '/../app/Filament/Resources/MarriageFormResource.php',
    __DIR__ . '/../app/Filament/Resources/PanRequestResource.php',
    __DIR__ . '/../app/Filament/Resources/CoinPurchaseRequestResource.php',
];

$patterns = [
    // Pattern 1
    "        if (auth()->user()->isAdmin()) {\n            return \$query;\n        }\n        \n        return \$query->where('user_id', auth()->id());" =>
    "        // All users (including admin) see only their own records\n        return \$query->where('user_id', auth()->id());",
    // Pattern 2
    "        if (auth()->user()->isAdmin()) {\n            return \$query;\n        }\n        return \$query->where('user_id', auth()->id());" =>
    "        // All users (including admin) see only their own records\n        return \$query->where('user_id', auth()->id());",
    // Pattern 3 (MarriageForm)
    "        if (auth()->user()->hasRole('super_admin') || auth()->user()->isAdmin()) {\n            return \$query;\n        }\n        return \$query->where('user_id', auth()->id());" =>
    "        // All users (including admin) see only their own records\n        return \$query->where('user_id', auth()->id());",
];

foreach ($resources as $file) {
    if (!file_exists($file)) {
        $results[basename($file)] = 'NOT FOUND';
        continue;
    }
    $content = file_get_contents($file);
    $original = $content;
    foreach ($patterns as $old => $new) {
        $content = str_replace($old, $new, $content);
    }
    if ($content !== $original) {
        file_put_contents($file, $content);
        $results[basename($file)] = '✅ PATCHED';
    } else {
        $results[basename($file)] = '⚠️ Already patched or pattern not found';
    }
}

// Also patch DashboardController
$dc = __DIR__ . '/../app/Http/Controllers/DashboardController.php';
if (file_exists($dc)) {
    $content = file_get_contents($dc);
    $orig = $content;
    $content = str_replace(
        "->when(!$isAdmin, fn (\$q) => \$q->visibleTo(\$user))",
        "->visibleTo(\$user)",
        $content
    );
    $content = str_replace(
        "->when(!\$isAdmin, fn (\$q) => \$q->visibleTo(\$user))",
        "->visibleTo(\$user)",
        $content
    );
    $content = str_replace(
        "'is_unlocked' => \$isAdmin || \$service->users->contains('id', \$user->id),",
        "'is_unlocked' => \$service->users->contains('id', \$user->id),",
        $content
    );
    if ($content !== $orig) {
        file_put_contents($dc, $content);
        $results['DashboardController.php'] = '✅ PATCHED';
    } else {
        $results['DashboardController.php'] = '⚠️ Already patched';
    }
}

// Clear OPcache if available
if (function_exists('opcache_reset')) {
    opcache_reset();
    $results['OPcache'] = '✅ CLEARED';
} else {
    $results['OPcache'] = 'Not available';
}

echo "<pre style='background:#111;color:#eee;padding:20px;font-size:14px;'>";
echo "=== PRODUCTION FIX RESULTS ===\n\n";
foreach ($results as $k => $v) echo "$k: $v\n";
echo "\n⚠️  DELETE THIS FILE: /public/fix_admin.php";
echo "</pre>";
