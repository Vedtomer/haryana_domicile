<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PrintJob;
use App\Models\PrintShop;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class PrintAgentApiController extends Controller
{
    /**
     * Agent heartbeat: records liveness & installed printers.
     */
    public function heartbeat(Request $request): JsonResponse
    {
        $secret = $request->input('agent_secret');
        if (!$secret) {
            return response()->json(['success' => false, 'message' => 'Agent secret required'], 401);
        }

        $shop = PrintShop::where('agent_secret', $secret)->first();
        if (!$shop) {
            return response()->json(['success' => false, 'message' => 'Invalid agent secret'], 404);
        }

        $printers = $request->input('printers', []);

        $shop->agent_last_seen_at = now();
        if (!empty($printers) && is_array($printers)) {
            $shop->available_printers = $printers;

            // Auto-select default printer if none is selected yet
            if (!$shop->printer_name) {
                foreach ($printers as $p) {
                    if (!empty($p['default'])) {
                        $shop->printer_name = $p['name'];
                        break;
                    }
                }
                if (!$shop->printer_name && !empty($printers[0]['name'])) {
                    $shop->printer_name = $printers[0]['name'];
                }
            }
        }
        $shop->save();

        return response()->json([
            'success' => true,
            'shop' => [
                'shop_name'      => $shop->shop_name,
                'shop_code'      => $shop->shop_code,
                'target_printer' => $shop->printer_name,
                'color_printer'  => $shop->color_printer_name,
                'auto_print'     => $shop->is_auto_print,
            ],
        ]);
    }

    /**
     * Polling endpoint: returns queued jobs for this shop.
     */
    public function pendingJobs(Request $request): JsonResponse
    {
        $secret = $request->query('secret') ?: $request->input('agent_secret');
        if (!$secret) {
            return response()->json(['success' => false, 'message' => 'Secret required'], 401);
        }

        $shop = PrintShop::where('agent_secret', $secret)->first();
        if (!$shop) {
            return response()->json(['success' => false, 'message' => 'Shop not found'], 404);
        }

        // Update heartbeat as well on poll
        $shop->update(['agent_last_seen_at' => now()]);

        // If auto-print is disabled, only jobs that have been manually approved/queued by shop owner are processed
        $jobs = $shop->printJobs()
            ->where('job_status', 'queued')
            ->orderBy('id', 'asc')
            ->take(5)
            ->get();

        $formatted = $jobs->map(function (PrintJob $job) use ($shop) {
            return [
                'id'                 => $job->id,
                'job_code'           => $job->job_code,
                'customer_name'      => $job->customer_name ?: 'Counter Customer',
                'file_name'          => $job->file_name,
                'file_type'          => $job->file_type,
                'copies'             => $job->copies,
                'color_mode'         => $job->color_mode,
                'page_range'         => $job->page_range,
                'total_pages'        => $job->total_pages,
                'duplex'             => $job->duplex,
                'paper_size'         => $job->paper_size,
                'printer_name'       => $shop->printer_name,
                'color_printer_name' => $shop->color_printer_name,
                'download_url'       => $job->file_download_url,
            ];
        });

        return response()->json([
            'success' => true,
            'jobs'    => $formatted,
        ]);
    }

    /**
     * Download the file for printing.
     */
    public function download(Request $request, int $jobId)
    {
        $secret = $request->query('secret') ?: $request->input('agent_secret');
        if (!$secret) {
            abort(401, 'Unauthorized');
        }

        $shop = PrintShop::where('agent_secret', $secret)->firstOrFail();
        $job = $shop->printJobs()->findOrFail($jobId);

        $path = storage_path('app/public/' . $job->file_path);
        if (!file_exists($path)) {
            // Also check standard public disk
            if (Storage::disk('public')->exists($job->file_path)) {
                $path = Storage::disk('public')->path($job->file_path);
            } else {
                abort(404, 'File not found on server');
            }
        }

        return response()->download($path, $job->file_name);
    }

    /**
     * Update job status from agent (downloading, printing, printed, failed).
     */
    public function updateStatus(Request $request, int $jobId): JsonResponse
    {
        $secret = $request->input('agent_secret') ?: $request->query('secret');
        if (!$secret) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 401);
        }

        $shop = PrintShop::where('agent_secret', $secret)->firstOrFail();
        $job = $shop->printJobs()->findOrFail($jobId);

        $status = $request->input('status');
        $error = $request->input('error_message');

        if (in_array($status, ['downloading', 'printing', 'printed', 'failed'])) {
            $job->job_status = $status;
            if ($status === 'printed') {
                $job->printed_at = now();
            }
            if ($error) {
                $job->error_message = $error;
            }
            $job->save();
        }

        return response()->json([
            'success' => true,
            'job_id'  => $job->id,
            'status'  => $job->job_status,
        ]);
    }
}
