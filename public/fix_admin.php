<?php
if (($_GET['key'] ?? '') !== 'fix2024') { http_response_code(403); die(); }

$base = '/home/u960828787/domains/cspjaankari.in/public_html';
$file = "$base/app/Filament/Resources/HaryanaDomicileResource.php";

echo "<pre style='background:#111;color:#eee;padding:20px;font-size:13px;'>";

if (!file_exists($file)) {
    echo "ERROR: File not found at $file\n";
    // Try relative path
    $file = __DIR__ . '/../app/Filament/Resources/HaryanaDomicileResource.php';
    echo "Trying: $file\n";
}

$content = file_get_contents($file);

// Remove old actions block and replace with no-confirm delete
$old = "            ->actions([
                Tables\\Actions\\Action::make('print')
                    ->label('Print')
                    ->icon('heroicon-o-printer')
                    ->color('success')
                    ->url(fn (HaryanaDomicile \$record): string => HaryanaDomicileResource::getUrl('print', ['record' => \$record]))
                    ->openUrlInNewTab(),
                Tables\\Actions\\EditAction::make(),
            ])
            ->bulkActions([
                Tables\\Actions\\BulkActionGroup::make([
                    Tables\\Actions\\DeleteBulkAction::make(),
                ]),
            ]);";

$new = "            ->actions([
                Tables\\Actions\\Action::make('print')
                    ->label('Print')
                    ->icon('heroicon-o-printer')
                    ->color('success')
                    ->url(fn (HaryanaDomicile \$record): string => HaryanaDomicileResource::getUrl('print', ['record' => \$record]))
                    ->openUrlInNewTab(),
                Tables\\Actions\\EditAction::make(),
                Tables\\Actions\\DeleteAction::make()
                    ->requiresConfirmation(false),
            ])
            ->bulkActions([
                Tables\\Actions\\BulkActionGroup::make([
                    Tables\\Actions\\DeleteBulkAction::make()
                        ->requiresConfirmation(false),
                ]),
            ]);";

if (str_contains($content, $old)) {
    $content = str_replace($old, $new, $content);
    file_put_contents($file, $content);
    echo "✅ PATCHED: Delete confirmation removed!\n";
} elseif (str_contains($content, 'requiresConfirmation(false)')) {
    echo "⚠️ Already patched!\n";
} else {
    echo "❌ Pattern not found. Current actions block:\n";
    preg_match('/->actions\(\[(.*?)\]\)/s', $content, $m);
    echo htmlspecialchars($m[0] ?? 'NOT FOUND') . "\n";
}

// Clear OPcache
if (function_exists('opcache_reset')) { opcache_reset(); echo "✅ OPcache cleared\n"; }

// Also delete Laravel view cache
$viewCache = $base . '/storage/framework/views';
if (is_dir($viewCache)) {
    $files = glob($viewCache . '/*.php');
    foreach ($files as $f) { @unlink($f); }
    echo "✅ View cache cleared: " . count($files) . " files\n";
}

echo "\n⚠️ DELETE: /public/fix_admin.php";
echo "</pre>";
