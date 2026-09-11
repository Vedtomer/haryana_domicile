<?php

namespace App\Http\Controllers;

use App\Models\PrintJob;
use App\Models\PrintShop;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

class PublicPrintController extends Controller
{
    /**
     * Show customer mobile document upload page
     */
    public function showUploadPage($shopCode)
    {
        $shop = PrintShop::where('shop_code', $shopCode)->firstOrFail();

        // Consider online if heartbeat was within last 60 seconds
        $isOnline = $shop->last_heartbeat_at && $shop->last_heartbeat_at->diffInSeconds(now()) < 60;

        return Inertia::render('Public/QrPrint/PublicUpload', [
            'shop' => [
                'shop_code' => $shop->shop_code,
                'shop_name' => $shop->shop_name,
                'upi_id' => $shop->upi_id,
                'bw_rate' => (float)$shop->bw_rate,
                'color_rate' => (float)$shop->color_rate,
                'is_online' => (bool)$isOnline,
            ],
        ]);
    }

    /**
     * Handle customer document upload and create print job
     */
    public function uploadAndCreateJob(Request $request, $shopCode)
    {
        $shop = PrintShop::where('shop_code', $shopCode)->firstOrFail();

        $request->validate([
            'file' => 'required|file|mimes:pdf,jpg,jpeg,png,webp|max:51200',
            'copies' => 'nullable|integer|min:1|max:100',
            'color_type' => 'nullable|in:bw,color',
            'customer_name' => 'nullable|string|max:100',
            'customer_phone' => 'nullable|string|max:20',
            'payment_method' => 'nullable|in:cash,upi',
        ]);

        $file = $request->file('file');
        $extension = strtolower($file->getClientOriginalExtension());
        $originalFilename = $file->getClientOriginalName();
        $copies = max(1, (int)$request->input('copies', 1));
        $colorType = $request->input('color_type', 'bw');
        $paymentMethod = $request->input('payment_method', 'cash');

        // Store file explicitly on public disk: storage/app/public/print_jobs/{shopCode}
        $storedPath = $file->store("print_jobs/{$shopCode}", 'public');

        // Calculate pages using accurate disk path
        $fullPath = \Illuminate\Support\Facades\Storage::disk('public')->path($storedPath);
        $totalPages = 1;
        if ($extension === 'pdf') {
            $totalPages = $this->getPdfPageCount($fullPath);
        }

        // Calculate total amount
        $ratePerPage = ($colorType === 'color') ? (float)$shop->color_rate : (float)$shop->bw_rate;
        $totalAmount = round($totalPages * $ratePerPage * $copies, 2);

        $jobCode = 'P' . strtoupper(Str::random(6));

        $job = PrintJob::create([
            'print_shop_id' => $shop->id,
            'job_code' => $jobCode,
            'customer_name' => $request->input('customer_name'),
            'customer_phone' => $request->input('customer_phone'),
            'original_filename' => $originalFilename,
            'file_path' => $storedPath,
            'file_type' => $extension,
            'total_pages' => $totalPages,
            'color_type' => $colorType,
            'copies' => $copies,
            'total_amount' => $totalAmount,
            'payment_method' => $paymentMethod,
            'payment_status' => ($paymentMethod === 'upi') ? 'paid' : 'pending',
            'status' => 'pending',
        ]);

        return response()->json([
            'success' => true,
            'job_code' => $jobCode,
            'total_pages' => $totalPages,
            'copies' => $copies,
            'color_type' => $colorType,
            'total_amount' => $totalAmount,
            'status' => 'pending',
            'message' => 'Document uploaded successfully! Print request sent to shop printer.',
        ]);
    }

    /**
     * Check current status of a print job
     */
    public function checkJobStatus($jobCode)
    {
        $job = PrintJob::where('job_code', $jobCode)->firstOrFail();

        return response()->json([
            'success' => true,
            'job_code' => $job->job_code,
            'status' => $job->status,
            'printed_at' => $job->printed_at ? $job->printed_at->format('h:i A') : null,
            'error' => $job->error_message,
        ]);
    }

    /**
     * Lightweight PDF page counter
     */
    private function getPdfPageCount($filePath)
    {
        if (!file_exists($filePath)) {
            return 1;
        }

        $content = @file_get_contents($filePath);
        if (!$content) {
            return 1;
        }

        // 1. Search for /Count N
        if (preg_match_all('/\/Count\s+(\d+)/', $content, $matches)) {
            if (!empty($matches[1])) {
                return max(1, (int)max($matches[1]));
            }
        }

        // 2. Count occurrences of /Type /Page
        $pageMatches = preg_match_all('/\/Type\s*\/Page[^s]/', $content);
        if ($pageMatches > 0) {
            return $pageMatches;
        }

        return 1;
    }
}
