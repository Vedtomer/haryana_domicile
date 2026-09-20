<?php
if (($_GET['key'] ?? '') !== 'fix2024') { http_response_code(403); die(); }

$envFile = __DIR__ . '/../.env';
$env = [];
foreach (file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
    if (str_starts_with(trim($line), '#') || !str_contains($line, '=')) continue;
    [$k, $v] = explode('=', $line, 2);
    $env[trim($k)] = trim($v, " \t\"'");
}

$pdo = new PDO("mysql:host={$env['DB_HOST']};port={$env['DB_PORT']};dbname={$env['DB_DATABASE']};charset=utf8mb4", $env['DB_USERNAME'], $env['DB_PASSWORD']);
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$ADMIN_ID = 1; // whitedevilkiler@gmail.com
$results = [];

echo "<pre style='background:#111;color:#eee;padding:20px;font-size:14px;'>";
echo "=== CLEARING ALL ADMIN (ID=1) HISTORY ===\n\n";

$pdo->beginTransaction();
try {
    // 1. activity_logs
    $s = $pdo->prepare("DELETE FROM activity_logs WHERE causer_id = ? OR subject_id = ?");
    $s->execute([$ADMIN_ID, $ADMIN_ID]);
    echo "activity_logs deleted: " . $s->rowCount() . "\n";

    // 2. sessions
    $s = $pdo->prepare("DELETE FROM sessions WHERE user_id = ?");
    $s->execute([$ADMIN_ID]);
    echo "sessions deleted: " . $s->rowCount() . "\n";

    // 3. notifications
    $s = $pdo->prepare("DELETE FROM notifications WHERE notifiable_id = ?");
    $s->execute([$ADMIN_ID]);
    echo "notifications deleted: " . $s->rowCount() . "\n";

    // 4. chat_messages
    try {
        $s = $pdo->prepare("DELETE FROM chat_messages WHERE sender_id = ? OR receiver_id = ?");
        $s->execute([$ADMIN_ID, $ADMIN_ID]);
        echo "chat_messages deleted: " . $s->rowCount() . "\n";
    } catch(Exception $e) { echo "chat_messages: " . $e->getMessage() . "\n"; }

    // 5. coin_transactions (created_by admin)
    $s = $pdo->prepare("DELETE FROM coin_transactions WHERE user_id = ?");
    $s->execute([$ADMIN_ID]);
    echo "coin_transactions deleted: " . $s->rowCount() . "\n";

    // 6. service_user (admin ki services)
    $s = $pdo->prepare("DELETE FROM service_user WHERE user_id = ?");
    $s->execute([$ADMIN_ID]);
    echo "service_user deleted: " . $s->rowCount() . "\n";

    // 7. referral_links
    $s = $pdo->prepare("DELETE FROM referral_links WHERE user_id = ?");
    $s->execute([$ADMIN_ID]);
    echo "referral_links deleted: " . $s->rowCount() . "\n";

    // 8. haryana_domiciles (admin ke naam pe kuch bacha ho)
    $s = $pdo->prepare("DELETE FROM haryana_domiciles WHERE user_id = ?");
    $s->execute([$ADMIN_ID]);
    echo "haryana_domiciles deleted: " . $s->rowCount() . "\n";

    // 9. birth_records
    $s = $pdo->prepare("DELETE FROM birth_records WHERE user_id = ?");
    $s->execute([$ADMIN_ID]);
    echo "birth_records deleted: " . $s->rowCount() . "\n";

    // 10. service_requests
    $s = $pdo->prepare("DELETE FROM service_requests WHERE user_id = ?");
    $s->execute([$ADMIN_ID]);
    echo "service_requests deleted: " . $s->rowCount() . "\n";

    // 11. coin_purchase_requests
    $s = $pdo->prepare("DELETE FROM coin_purchase_requests WHERE user_id = ?");
    $s->execute([$ADMIN_ID]);
    echo "coin_purchase_requests deleted: " . $s->rowCount() . "\n";

    // 12. password_reset_tokens
    $adminEmail = $pdo->query("SELECT email FROM users WHERE id = $ADMIN_ID")->fetchColumn();
    if ($adminEmail) {
        $s = $pdo->prepare("DELETE FROM password_reset_tokens WHERE email = ?");
        $s->execute([$adminEmail]);
        echo "password_reset_tokens deleted: " . $s->rowCount() . "\n";
    }

    // 13. reactivation_requests
    try {
        $s = $pdo->prepare("DELETE FROM reactivation_requests WHERE user_id = ?");
        $s->execute([$ADMIN_ID]);
        echo "reactivation_requests deleted: " . $s->rowCount() . "\n";
    } catch(Exception $e) {}

    $pdo->commit();
    echo "\n✅ ALL ADMIN HISTORY CLEARED!\n";

    // Verify
    echo "\n=== VERIFY: Admin (ID=1) remaining data ===\n";
    $tables = ['haryana_domiciles','birth_records','service_requests','coin_transactions','service_user','notifications','sessions','referral_links'];
    foreach ($tables as $t) {
        try {
            $count = $pdo->query("SELECT COUNT(*) FROM $t WHERE user_id = $ADMIN_ID")->fetchColumn();
            echo "$t: $count\n";
        } catch(Exception $e) {}
    }

} catch(Exception $e) {
    $pdo->rollBack();
    echo "❌ ERROR: " . $e->getMessage() . "\n";
}

echo "\n⚠️ DELETE: /public/fix_admin.php";
echo "</pre>";
