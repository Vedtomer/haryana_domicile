<?php

namespace App\Http\Controllers;

use App\Models\PrintJob;
use App\Models\PrintShop;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use ZipArchive;

class QrPrintController extends Controller
{
    /**
     * Get or create the user's PrintShop instance
     */
    private function getOrCreateShop()
    {
        $user = Auth::user();
        if (!$user) {
            abort(401);
        }

        // If legacy table from previous attempt exists (with agent_secret), drop and recreate cleanly
        if (\Illuminate\Support\Facades\Schema::hasTable('print_shops') && \Illuminate\Support\Facades\Schema::hasColumn('print_shops', 'agent_secret')) {
            \Illuminate\Support\Facades\Schema::disableForeignKeyConstraints();
            \Illuminate\Support\Facades\Schema::dropIfExists('print_jobs');
            \Illuminate\Support\Facades\Schema::dropIfExists('print_shops');
            \Illuminate\Support\Facades\Schema::enableForeignKeyConstraints();
        }

        // Auto-create tables cleanly if not existing
        if (!\Illuminate\Support\Facades\Schema::hasTable('print_shops')) {
            \Illuminate\Support\Facades\Schema::create('print_shops', function ($table) {
                $table->id();
                $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
                $table->string('shop_code', 32)->unique();
                $table->string('shop_name', 191);
                $table->string('upi_id', 191)->nullable();
                $table->decimal('bw_rate', 8, 2)->default(2.00);
                $table->decimal('color_rate', 8, 2)->default(10.00);
                $table->boolean('is_online')->default(false);
                $table->timestamp('last_heartbeat_at')->nullable();
                $table->string('agent_token', 64)->unique();
                $table->json('detected_printers')->nullable();
                $table->string('bw_printer', 191)->nullable();
                $table->string('color_printer', 191)->nullable();
                $table->string('printer_mode', 32)->default('single');
                $table->timestamps();
            });
        } else {
            try {
                \Illuminate\Support\Facades\Schema::table('print_shops', function ($table) {
                    if (!\Illuminate\Support\Facades\Schema::hasColumn('print_shops', 'detected_printers')) {
                        $table->longText('detected_printers')->nullable();
                    }
                    if (!\Illuminate\Support\Facades\Schema::hasColumn('print_shops', 'bw_printer')) {
                        $table->string('bw_printer', 191)->nullable();
                    }
                    if (!\Illuminate\Support\Facades\Schema::hasColumn('print_shops', 'color_printer')) {
                        $table->string('color_printer', 191)->nullable();
                    }
                    if (!\Illuminate\Support\Facades\Schema::hasColumn('print_shops', 'printer_mode')) {
                        $table->string('printer_mode', 32)->default('single');
                    }
                    if (!\Illuminate\Support\Facades\Schema::hasColumn('print_shops', 'deleted_printers')) {
                        $table->longText('deleted_printers')->nullable();
                    }
                    if (!\Illuminate\Support\Facades\Schema::hasColumn('print_shops', 'subscription_expires_at')) {
                        $table->timestamp('subscription_expires_at')->nullable();
                    }
                });
            } catch (\Throwable $e) {
                // Ignore if columns already present
            }
        }

        if (!\Illuminate\Support\Facades\Schema::hasTable('print_jobs')) {
            \Illuminate\Support\Facades\Schema::create('print_jobs', function ($table) {
                $table->id();
                $table->foreignId('print_shop_id')->constrained('print_shops')->onDelete('cascade');
                $table->string('job_code', 32)->unique();
                $table->string('customer_name', 191)->nullable();
                $table->string('customer_phone', 32)->nullable();
                $table->string('original_filename', 255);
                $table->string('file_path', 255);
                $table->string('file_type', 32)->default('pdf');
                $table->integer('total_pages')->default(1);
                $table->string('color_type', 32)->default('bw');
                $table->integer('copies')->default(1);
                $table->decimal('total_amount', 8, 2)->default(0.00);
                $table->string('payment_method', 32)->default('cash');
                $table->string('payment_status', 32)->default('paid');
                $table->string('status', 32)->default('pending');
                $table->string('printer_name', 191)->nullable();
                $table->text('error_message')->nullable();
                $table->timestamp('printed_at')->nullable();
                $table->timestamps();
            });
        }

        $shop = PrintShop::where('user_id', $user->id)->first();

        if (!$shop) {
            do {
                $code = strtoupper(Str::random(6));
            } while (PrintShop::where('shop_code', $code)->exists());

            $shop = PrintShop::create([
                'user_id' => $user->id,
                'shop_code' => $code,
                'shop_name' => ($user->name ?: 'My Shop') . ' Print Point',
                'upi_id' => null,
                'bw_rate' => 2.00,
                'color_rate' => 10.00,
                'is_online' => false,
                'agent_token' => Str::random(40),
            ]);
        }

        return $shop;
    }

    /**
     * Shopkeeper Dashboard
     */
    public function index(Request $request)
    {
        $shop = $this->getOrCreateShop();

        // Realtime online check (active if heartbeat received in last 60s)
        $isOnline = $shop->last_heartbeat_at && $shop->last_heartbeat_at->diffInSeconds(now()) < 60;
        if ($shop->is_online !== $isOnline) {
            $shop->update(['is_online' => $isOnline]);
        }

        $jobs = PrintJob::where('print_shop_id', $shop->id)
            ->orderBy('id', 'desc')
            ->take(50)
            ->get();

        $todayStart = now()->startOfDay();
        $stats = [
            'total_jobs_today' => PrintJob::where('print_shop_id', $shop->id)->where('created_at', '>=', $todayStart)->count(),
            'completed_today' => PrintJob::where('print_shop_id', $shop->id)->where('created_at', '>=', $todayStart)->where('status', 'completed')->count(),
            'revenue_today' => (float)PrintJob::where('print_shop_id', $shop->id)->where('created_at', '>=', $todayStart)->where('status', 'completed')->sum('total_amount'),
            'pending_count' => PrintJob::where('print_shop_id', $shop->id)->where('status', 'pending')->count(),
        ];

        // Format detected_printers to always be a clean zero-indexed array list
        $rawPrinters = $shop->detected_printers;
        if (is_string($rawPrinters)) {
            $decoded = json_decode($rawPrinters, true);
            $rawPrinters = is_array($decoded) ? $decoded : [];
        } elseif (!is_array($rawPrinters)) {
            $rawPrinters = [];
        }
        $detectedPrinters = array_values($rawPrinters);

        // Auto-assign and repair B&W (Canon/Laser) and Color (Epson/Inkjet)
        \App\Http\Controllers\Api\PrintAgentApiController::autoRouteShopPrinters($shop, $detectedPrinters);

        return Inertia::render('Admin/QrPrint/Index', [
            'shop' => [
                'id' => $shop->id,
                'shop_code' => $shop->shop_code,
                'shop_name' => $shop->shop_name,
                'upi_id' => $shop->upi_id,
                'bw_rate' => (float)$shop->bw_rate,
                'color_rate' => (float)$shop->color_rate,
                'is_online' => (bool)$isOnline,
                'last_heartbeat_at' => $shop->last_heartbeat_at ? $shop->last_heartbeat_at->diffForHumans() : null,
                'agent_token' => $shop->agent_token,
                'upload_url' => url('/p/' . $shop->shop_code),
                'detected_printers' => $detectedPrinters,
                'deleted_printers' => is_array($shop->deleted_printers) ? array_values($shop->deleted_printers) : (json_decode($shop->deleted_printers, true) ?: []),
                'bw_printer' => $shop->bw_printer,
                'color_printer' => $shop->color_printer,
                'printer_mode' => $shop->printer_mode ?: 'single',
                'subscription_active' => $shop->isSubscriptionActive(),
                'subscription_expires_at' => $shop->subscription_expires_at ? $shop->subscription_expires_at->toIso8601String() : null,
                'subscription_days_left' => $shop->subscriptionDaysLeft(),
            ],
            'subscription' => [
                'is_active' => $shop->isSubscriptionActive(),
                'expires_at' => $shop->subscription_expires_at ? $shop->subscription_expires_at->format('d M Y, h:i A') : null,
                'days_left' => $shop->subscriptionDaysLeft(),
                'cost_coins' => 49,
                'duration_days' => 30,
                'user_coins' => (int) ($request->user() ? $request->user()->coins : 0),
            ],
            'jobs' => $jobs ?: [],
            'stats' => $stats,
        ]);
    }

    /**
     * Update Shop Settings
     */
    public function updateSettings(Request $request)
    {
        $shop = $this->getOrCreateShop();

        $validated = $request->validate([
            'shop_name' => 'required|string|max:100',
            'upi_id' => 'nullable|string|max:100',
            'bw_rate' => 'required|numeric|min:0.5|max:100',
            'color_rate' => 'required|numeric|min:1|max:500',
        ]);

        $shop->update($validated);

        return redirect()->back()->with('success', 'Shop settings updated successfully!');
    }

    /**
     * Update Printer Routing & Assignment Settings
     */
    public function updatePrinterSettings(Request $request)
    {
        $shop = $this->getOrCreateShop();

        $validated = $request->validate([
            'printer_mode' => 'required|in:single,dual',
            'bw_printer' => 'nullable|string|max:191',
            'color_printer' => 'nullable|string|max:191',
        ]);

        $shop->update($validated);

        return redirect()->back()->with('success', 'Printer configuration saved successfully!');
    }

    /**
     * Delete / Hide a Printer from the shop
     */
    public function deletePrinter(Request $request)
    {
        $shop = $this->getOrCreateShop();

        $request->validate([
            'printer_name' => 'required|string|max:191',
        ]);

        $printerName = $request->input('printer_name');

        // 1. Add to deleted_printers
        $deleted = is_array($shop->deleted_printers) ? $shop->deleted_printers : (json_decode($shop->deleted_printers, true) ?: []);
        if (!in_array($printerName, $deleted)) {
            $deleted[] = $printerName;
        }

        // 2. Remove from detected_printers
        $detected = is_array($shop->detected_printers) ? $shop->detected_printers : (json_decode($shop->detected_printers, true) ?: []);
        $updatedDetected = array_values(array_filter($detected, function ($p) use ($printerName) {
            $name = is_array($p) ? ($p['name'] ?? '') : (string)$p;
            return $name !== $printerName;
        }));

        $updates = [
            'deleted_printers' => array_values($deleted),
            'detected_printers' => $updatedDetected,
        ];

        // 3. Clear from assigned bw or color printer if it was selected
        if ($shop->bw_printer === $printerName) {
            $updates['bw_printer'] = null;
        }
        if ($shop->color_printer === $printerName) {
            $updates['color_printer'] = null;
        }

        $shop->update($updates);
        $shop->refresh();

        // Re-route remaining printers
        \App\Http\Controllers\Api\PrintAgentApiController::autoRouteShopPrinters($shop, $updatedDetected);

        return redirect()->back()->with('success', "Printer '{$printerName}' deleted successfully!");
    }

    /**
     * Restore a previously deleted printer
     */
    public function restorePrinter(Request $request)
    {
        $shop = $this->getOrCreateShop();

        $request->validate([
            'printer_name' => 'required|string|max:191',
        ]);

        $printerName = $request->input('printer_name');

        $deleted = is_array($shop->deleted_printers) ? $shop->deleted_printers : (json_decode($shop->deleted_printers, true) ?: []);
        $deleted = array_values(array_diff($deleted, [$printerName]));

        $shop->update([
            'deleted_printers' => $deleted,
        ]);

        return redirect()->back()->with('success', "Printer '{$printerName}' restored! Agent heartbeat will re-detect it.");
    }

    /**
     * Activate or renew 1-month subscription for 49 coins
     */
    public function subscribe(Request $request)
    {
        $user = $request->user();
        $shop = $this->getOrCreateShop();
        $cost = 49;

        if ($shop->isSubscriptionActive()) {
            $days = $shop->subscriptionDaysLeft();
            $expiry = $shop->subscription_expires_at->format('d M Y');
            return back()->with('error', "Aapka QR to Print plan pehle se active hai ({$expiry} tak, {$days} din baaki). Plan expire hone ke baad hi naya recharge hoga.");
        }

        if (!$user->hasEnoughCoins($cost)) {
            return back()->with('error', "Insufficient coins! QR to Print service activate karne ke liye aapke wallet me kam se kam {$cost} coins hone chahiye. (Aapka balance: {$user->coins} Coins)");
        }

        \Illuminate\Support\Facades\DB::transaction(function () use ($user, $shop, $cost) {
            $user->deductCoins(
                $cost,
                \App\Models\CoinTransaction::TYPE_SERVICE_DEDUCTION,
                "QR to Print Service - 1 Month Plan (49 Coins)",
                \App\Models\CoinTransaction::SERVICE_QR_TO_PRINT ?? 'qr_to_print',
                $shop->id
            );

            $shop->update([
                'subscription_expires_at' => now()->addDays(30),
            ]);
        });

        $days = (int) now()->diffInDays($shop->fresh()->subscription_expires_at, false);

        return back()->with('success', "🎉 QR to Print Service successfully activate ho gayi hai! 49 Coins deduct hue. Ab ye {$days} din tak active rahegi.");
    }

    /**
     * Printable A4 Counter Standee
     */
    public function standee(Request $request)
    {
        $shop = $this->getOrCreateShop();

        return Inertia::render('Admin/QrPrint/Standee', [
            'shop' => [
                'shop_code' => $shop->shop_code,
                'shop_name' => $shop->shop_name,
                'upi_id' => $shop->upi_id,
                'bw_rate' => (float)$shop->bw_rate,
                'color_rate' => (float)$shop->color_rate,
                'upload_url' => url('/p/' . $shop->shop_code),
            ],
        ]);
    }

    /**
     * Generate and Download 1-Click Silent Windows Agent Package (.zip)
     */
    public function downloadAgentZip(Request $request)
    {
        $shop = $this->getOrCreateShop();

        $zipFileName = 'CSP-Print-Service-' . $shop->shop_code . '.zip';
        $tempDir = storage_path('app/temp_zip');
        if (!file_exists($tempDir)) {
            mkdir($tempDir, 0777, true);
        }
        $zipFilePath = $tempDir . '/' . $zipFileName;

        if (file_exists($zipFilePath)) {
            @unlink($zipFilePath);
        }

        $zip = new ZipArchive();
        if ($zip->open($zipFilePath, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== true) {
            abort(500, 'Could not create zip archive');
        }

        $scriptsPath = resource_path('scripts/print-agent');

        // 1. Install-Print-Service.bat
        if (file_exists($scriptsPath . '/Install-Print-Service.bat')) {
            $zip->addFile($scriptsPath . '/Install-Print-Service.bat', 'Install-Print-Service.bat');
        }

        // 2. silent_starter.vbs
        if (file_exists($scriptsPath . '/silent_starter.vbs')) {
            $zip->addFile($scriptsPath . '/silent_starter.vbs', 'silent_starter.vbs');
        }

        // 3. agent.ps1 (inject server_url and agent_token as defaults)
        if (file_exists($scriptsPath . '/agent.ps1')) {
            $ps1Content = file_get_contents($scriptsPath . '/agent.ps1');
            $ps1Content = str_replace('__SERVER_URL__', url('/'), $ps1Content);
            $ps1Content = str_replace('__AGENT_TOKEN__', $shop->agent_token, $ps1Content);
            $zip->addFromString('agent.ps1', $ps1Content);
        }

        // 4. Check-Status.bat, Run-Console-Debug.bat & Uninstall-Service.bat
        if (file_exists($scriptsPath . '/Check-Status.bat')) {
            $zip->addFile($scriptsPath . '/Check-Status.bat', 'Check-Status.bat');
        }
        if (file_exists($scriptsPath . '/Run-Console-Debug.bat')) {
            $zip->addFile($scriptsPath . '/Run-Console-Debug.bat', 'Run-Console-Debug.bat');
        }
        if (file_exists($scriptsPath . '/Uninstall-Service.bat')) {
            $zip->addFile($scriptsPath . '/Uninstall-Service.bat', 'Uninstall-Service.bat');
        }

        // 5. SumatraPDF.exe (Bundled 100% offline print engine)
        if (file_exists($scriptsPath . '/SumatraPDF.exe')) {
            $zip->addFile($scriptsPath . '/SumatraPDF.exe', 'SumatraPDF.exe');
        }

        // 6. config.json
        $configContent = json_encode([
            'shop_code' => $shop->shop_code,
            'shop_name' => $shop->shop_name,
            'server_url' => url('/'),
            'agent_token' => $shop->agent_token,
        ], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
        $zip->addFromString('config.json', $configContent);

        // 6. User Instructions
        $readme = "=================================================================\r\n"
            . "   CSP JAANKARI - CLOUD COUNTER PRINT SERVICE (1-CLICK SETUP)\r\n"
            . "=================================================================\r\n\r\n"
            . "STEP 1: Right-click this ZIP file and click 'Extract All' (ZIP ko pehle Extract karein).\r\n\r\n"
            . "STEP 2: Open extracted folder and double-click 'Install-Print-Service.bat'.\r\n\r\n"
            . "THAT'S ALL! DONE!\r\n\r\n"
            . "- Service starts running SILENTLY in the background immediately.\r\n"
            . "- You DO NOT need to keep any window open.\r\n"
            . "- Whenever you restart or turn on your PC, it auto-starts by itself.\r\n"
            . "- To check status anytime, double-click 'Check-Status.bat'.\r\n"
            . "- To remove service, double-click 'Uninstall-Service.bat'.\r\n";
        $zip->addFromString('README-INSTRUCTIONS.txt', $readme);

        $zip->close();

        return response()->download($zipFilePath, $zipFileName)->deleteFileAfterSend(true);
    }

    /**
     * Retry/Reprint a failed or completed job
     */
    public function reprintJob(Request $request, $id)
    {
        $shop = $this->getOrCreateShop();
        $job = PrintJob::where('id', $id)->where('print_shop_id', $shop->id)->firstOrFail();

        $job->update([
            'status' => 'pending',
            'error_message' => null,
            'printed_at' => null,
        ]);

        return redirect()->back()->with('success', "Job #{$job->job_code} sent back to print queue!");
    }

    /**
     * Delete Job and file
     */
    public function deleteJob(Request $request, $id)
    {
        $shop = $this->getOrCreateShop();
        $job = PrintJob::where('id', $id)->where('print_shop_id', $shop->id)->firstOrFail();

        if ($job->file_path && Storage::exists($job->file_path)) {
            Storage::delete($job->file_path);
        }

        $job->delete();

        return redirect()->back()->with('success', 'Job deleted successfully.');
    }
}
