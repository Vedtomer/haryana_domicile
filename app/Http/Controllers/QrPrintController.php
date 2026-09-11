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
            ],
            'jobs' => $jobs,
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

        // 4. Check-Status.bat & Uninstall-Service.bat
        if (file_exists($scriptsPath . '/Check-Status.bat')) {
            $zip->addFile($scriptsPath . '/Check-Status.bat', 'Check-Status.bat');
        }
        if (file_exists($scriptsPath . '/Uninstall-Service.bat')) {
            $zip->addFile($scriptsPath . '/Uninstall-Service.bat', 'Uninstall-Service.bat');
        }

        // 5. config.json
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
