<?php
/**
 * ONE-TIME DATA TRANSFER SCRIPT
 * Run: https://cspjaankari.in/do_transfer.php?key=transfer2024
 * DELETE THIS FILE AFTER USE!
 */

$SECRET_KEY = 'transfer2024';
if (($_GET['key'] ?? '') !== $SECRET_KEY) {
    http_response_code(403);
    die('Forbidden');
}

$envFile = __DIR__ . '/../.env';
$env = [];
if (file_exists($envFile)) {
    foreach (file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
        if (str_starts_with(trim($line), '#')) continue;
        if (str_contains($line, '=')) {
            [$k, $v] = explode('=', $line, 2);
            $env[trim($k)] = trim($v, " \t\n\r\0\x0B\"'");
        }
    }
}

$host     = $env['DB_HOST']     ?? '127.0.0.1';
$port     = $env['DB_PORT']     ?? '3306';
$dbname   = $env['DB_DATABASE'] ?? '';
$username = $env['DB_USERNAME'] ?? '';
$password = $env['DB_PASSWORD'] ?? '';

try {
    $pdo = new PDO("mysql:host=$host;port=$port;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (Exception $e) {
    die('DB Connection Failed: ' . $e->getMessage());
}

$TARGET_ID = 9;
$ADMIN_ID  = 1;
$results = [];

$pdo->beginTransaction();
try {
    $s = $pdo->prepare("UPDATE haryana_domiciles SET user_id = ? WHERE user_id != ?");
    $s->execute([$TARGET_ID, $TARGET_ID]);
    $results['haryana_domiciles'] = $s->rowCount();

    $s = $pdo->prepare("UPDATE birth_records SET user_id = ? WHERE user_id != ?");
    $s->execute([$TARGET_ID, $TARGET_ID]);
    $results['birth_records'] = $s->rowCount();

    $s = $pdo->prepare("UPDATE marriage_affidavits SET user_id = ? WHERE user_id != ?");
    $s->execute([$TARGET_ID, $TARGET_ID]);
    $results['marriage_affidavits'] = $s->rowCount();

    $s = $pdo->prepare("UPDATE service_requests SET user_id = ? WHERE user_id != ?");
    $s->execute([$TARGET_ID, $TARGET_ID]);
    $results['service_requests'] = $s->rowCount();

    $s = $pdo->prepare("DELETE FROM service_user WHERE user_id = ?");
    $s->execute([$ADMIN_ID]);
    $results['service_user admin removed'] = $s->rowCount();

    $s = $pdo->prepare("UPDATE notifications SET notifiable_id = ? WHERE notifiable_id = ?");
    $s->execute([$TARGET_ID, $ADMIN_ID]);
    $results['notifications'] = $s->rowCount();

    $pdo->commit();
    $status = 'SUCCESS';
} catch (Exception $e) {
    $pdo->rollBack();
    $status = 'FAILED: ' . $e->getMessage();
}

// Verify
$verify = [];
foreach (['haryana_domiciles','birth_records','marriage_affidavits','service_requests'] as $t) {
    $row = $pdo->query("SELECT COUNT(*) as c FROM $t WHERE user_id = $TARGET_ID")->fetch(PDO::FETCH_ASSOC);
    $verify[$t] = $row['c'];
}
$row = $pdo->query("SELECT COUNT(*) as c FROM service_user WHERE user_id = $ADMIN_ID")->fetch(PDO::FETCH_ASSOC);
$verify['service_user(admin remaining)'] = $row['c'];

echo "<pre style='background:#111;color:#eee;padding:20px;font-size:14px;'>";
echo "STATUS: $status\n\n";
echo "=== TRANSFERRED ===\n";
foreach ($results as $k => $v) echo "$k: $v rows\n";
echo "\n=== VERIFY (vandana ID=9) ===\n";
foreach ($verify as $k => $v) echo "$k: $v records\n";
echo "\n⚠️  PLEASE DELETE THIS FILE NOW: /public/do_transfer.php";
echo "</pre>";
