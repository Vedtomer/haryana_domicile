<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PrintJob;
use App\Models\PrintShop;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class PrintAgentApiController extends Controller
{
    /**
     * Agent Heartbeat
     * Updates online status and timestamp
     */
    public function heartbeat(Request $request)
    {
        $token = $request->input('token');
        if (!$token) {
            return response()->json(['success' => false, 'message' => 'Token required'], 401);
        }

        $shop = PrintShop::where('agent_token', $token)->first();
        if (!$shop) {
            return response()->json(['success' => false, 'message' => 'Invalid agent token'], 404);
        }

        $updateData = [
            'is_online' => true,
            'last_heartbeat_at' => now(),
        ];

        // Store detected printers list if sent by agent
        if ($request->has('printers')) {
            $printers = $request->input('printers');
            if (is_string($printers)) {
                $decoded = json_decode($printers, true);
                $updateData['detected_printers'] = is_array($decoded) ? array_values($decoded) : [];
            } elseif (is_array($printers)) {
                $updateData['detected_printers'] = array_values($printers);
            } else {
                $updateData['detected_printers'] = [];
            }
        }

        $shop->update($updateData);

        return response()->json([
            'success' => true,
            'shop_code' => $shop->shop_code,
            'shop_name' => $shop->shop_name,
            'is_online' => true,
            'bw_printer' => $shop->bw_printer,
            'color_printer' => $shop->color_printer,
            'printer_mode' => $shop->printer_mode ?: 'single',
        ]);
    }

    /**
     * Get Pending Jobs for this shop
     */
    public function getPendingJobs(Request $request)
    {
        $token = $request->query('token') ?: $request->input('token');
        if (!$token) {
            return response()->json(['success' => false, 'message' => 'Token required'], 401);
        }

        $shop = PrintShop::where('agent_token', $token)->first();
        if (!$shop) {
            return response()->json(['success' => false, 'message' => 'Invalid agent token'], 404);
        }

        // Also update heartbeat
        $shop->update([
            'is_online' => true,
            'last_heartbeat_at' => now(),
        ]);

        $jobs = PrintJob::where('print_shop_id', $shop->id)
            ->where('status', 'pending')
            ->orderBy('id', 'asc')
            ->take(5)
            ->get([
                'id',
                'job_code',
                'original_filename',
                'file_type',
                'total_pages',
                'color_type',
                'copies',
            ])
            ->map(function ($job) use ($shop) {
                $targetPrinter = null;
                if ($job->color_type === 'color' && $shop->color_printer) {
                    $targetPrinter = $shop->color_printer;
                } elseif ($shop->bw_printer) {
                    $targetPrinter = $shop->bw_printer;
                }
                return array_merge($job->toArray(), [
                    'target_printer' => $targetPrinter,
                ]);
            });

        return response()->json([
            'success' => true,
            'jobs' => $jobs,
            'bw_printer' => $shop->bw_printer,
            'color_printer' => $shop->color_printer,
        ]);
    }

    /**
     * Download File for a Job
     */
    public function downloadFile(Request $request, $jobCode)
    {
        $token = $request->query('token') ?: $request->input('token');
        if (!$token) {
            abort(401, 'Token required');
        }

        $shop = PrintShop::where('agent_token', $token)->first();
        if (!$shop) {
            abort(404, 'Invalid agent token');
        }

        $job = PrintJob::where('job_code', $jobCode)
            ->where('print_shop_id', $shop->id)
            ->firstOrFail();

        $candidates = [
            Storage::disk('public')->path($job->file_path),
            Storage::disk('local')->path($job->file_path),
            Storage::path($job->file_path),
            storage_path('app/' . $job->file_path),
            storage_path('app/public/' . $job->file_path),
            storage_path('app/private/' . $job->file_path),
            storage_path('app/private/public/' . $job->file_path),
            storage_path('app/public/print_jobs/' . $shop->shop_code . '/' . basename($job->file_path)),
            storage_path('app/private/public/print_jobs/' . $shop->shop_code . '/' . basename($job->file_path)),
            storage_path('app/private/print_jobs/' . $shop->shop_code . '/' . basename($job->file_path)),
        ];

        $path = null;
        foreach ($candidates as $candidate) {
            if (!empty($candidate) && file_exists($candidate)) {
                $path = $candidate;
                break;
            }
        }

        if (!$path) {
            \Log::error("PrintAgent downloadFile: Job #{$jobCode} file not found on disk. Checked: " . implode(', ', $candidates));
            abort(404, 'File not found on server');
        }

        return response()->download($path, $job->original_filename);
    }

    /**
     * Download SumatraPDF Engine for Agent
     */
    public function downloadEngine(Request $request)
    {
        $enginePath = resource_path('scripts/print-agent/SumatraPDF.exe');
        if (file_exists($enginePath)) {
            return response()->download($enginePath, 'SumatraPDF.exe');
        }
        abort(404, 'Engine binary not found on server');
    }

    /**
     * Update Job Status (printing, completed, failed)
     */
    public function updateJobStatus(Request $request)
    {
        $token = $request->input('token');
        $jobCode = $request->input('job_code');
        $status = $request->input('status');
        $error = $request->input('error');

        if (!$token || !$jobCode || !$status) {
            return response()->json(['success' => false, 'message' => 'Missing parameters'], 400);
        }

        $shop = PrintShop::where('agent_token', $token)->first();
        if (!$shop) {
            return response()->json(['success' => false, 'message' => 'Invalid agent token'], 404);
        }

        $job = PrintJob::where('job_code', $jobCode)
            ->where('print_shop_id', $shop->id)
            ->first();

        if (!$job) {
            return response()->json(['success' => false, 'message' => 'Job not found'], 404);
        }

        $updateData = ['status' => $status];
        if ($status === 'completed') {
            $updateData['printed_at'] = now();
            $updateData['error_message'] = null;
        } elseif ($status === 'failed') {
            $updateData['error_message'] = $error ?: 'Printing failed';
        }

        $job->update($updateData);

        return response()->json([
            'success' => true,
            'message' => 'Status updated successfully',
        ]);
    }
}
