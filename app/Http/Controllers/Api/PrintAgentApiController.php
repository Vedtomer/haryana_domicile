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

        $shop->update([
            'is_online' => true,
            'last_heartbeat_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'shop_code' => $shop->shop_code,
            'shop_name' => $shop->shop_name,
            'is_online' => true,
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
            ]);

        return response()->json([
            'success' => true,
            'jobs' => $jobs,
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

        $path = storage_path('app/' . $job->file_path);
        if (!file_exists($path)) {
            // Also check public disk storage
            $publicPath = storage_path('app/public/' . $job->file_path);
            if (file_exists($publicPath)) {
                $path = $publicPath;
            } else {
                abort(404, 'File not found on server');
            }
        }

        return response()->download($path, $job->original_filename);
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
