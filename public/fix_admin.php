<?php
if (($_GET['key'] ?? '') !== 'fix2024') { http_response_code(403); die(); }

$base = '/home/u960828787/domains/cspjaankari.in/public_html';

echo "<pre style='background:#111;color:#eee;padding:20px;font-size:13px;'>";

// 1. Check actual file content
$file = "$base/app/Filament/Resources/HaryanaDomicileResource.php";
echo "=== HaryanaDomicileResource getEloquentQuery ===\n";
if (file_exists($file)) {
    $content = file_get_contents($file);
    // Extract getEloquentQuery function
    preg_match('/getEloquentQuery.*?(?=\n    (public|protected|private|\}))/s', $content, $m);
    echo ($m[0] ?? 'NOT FOUND') . "\n\n";
} else {
    echo "FILE NOT FOUND at: $file\n";
    // Try alternate paths
    $alt = __DIR__ . '/../app/Filament/Resources/HaryanaDomicileResource.php';
    echo "Trying: $alt\n";
    if (file_exists($alt)) {
        $content = file_get_contents($alt);
        preg_match('/getEloquentQuery.*?(?=\n    (public|protected|private|\}))/s', $content, $m);
        echo ($m[0] ?? 'NOT FOUND') . "\n";
    }
}

// 2. Clear all caches
echo "\n=== CLEARING CACHES ===\n";

// OPcache
if (function_exists('opcache_reset')) { opcache_reset(); echo "OPcache: CLEARED\n"; }

// Laravel cache files
$cachePaths = [
    "$base/bootstrap/cache/config.php",
    "$base/bootstrap/cache/routes-v7.php",
    "$base/bootstrap/cache/packages.php",
    __DIR__ . '/../bootstrap/cache/config.php',
    __DIR__ . '/../bootstrap/cache/routes-v7.php',
];
foreach ($cachePaths as $cp) {
    if (file_exists($cp)) {
        unlink($cp);
        echo "Deleted: " . basename($cp) . "\n";
    }
}

// 3. Direct DB fix - change user_id of ALL haryana_domicile records
echo "\n=== DB: Ensure all haryana_domicile records belong to vandana (ID=9) ===\n";
$envFile = __DIR__ . '/../.env';
$env = [];
foreach (file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
    if (str_starts_with(trim($line), '#') || !str_contains($line, '=')) continue;
    [$k, $v] = explode('=', $line, 2);
    $env[trim($k)] = trim($v, " \t\"'");
}
try {
    $pdo = new PDO("mysql:host={$env['DB_HOST']};port={$env['DB_PORT']};dbname={$env['DB_DATABASE']};charset=utf8mb4", $env['DB_USERNAME'], $env['DB_PASSWORD']);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Count before
    $total = $pdo->query("SELECT COUNT(*) FROM haryana_domiciles")->fetchColumn();
    $vandana = $pdo->query("SELECT COUNT(*) FROM haryana_domiciles WHERE user_id=9")->fetchColumn();
    $other = $pdo->query("SELECT COUNT(*) FROM haryana_domiciles WHERE user_id!=9")->fetchColumn();
    echo "Total: $total | Vandana(9): $vandana | Other: $other\n";
    
    // Force all to vandana
    $stmt = $pdo->prepare("UPDATE haryana_domiciles SET user_id=9");
    $stmt->execute();
    echo "Updated all to user_id=9: " . $stmt->rowCount() . " rows\n";
    
    // Verify admin(1) has 0
    $adminCount = $pdo->query("SELECT COUNT(*) FROM haryana_domiciles WHERE user_id=1")->fetchColumn();
    echo "Admin(1) records remaining: $adminCount\n";
    
} catch(Exception $e) {
    echo "DB Error: " . $e->getMessage() . "\n";
}

echo "\n⚠️ DELETE: /public/fix_admin.php";
echo "</pre>";
