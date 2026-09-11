<?php

namespace App\Http\Controllers;

use App\Models\PrintJob;
use App\Models\PrintShop;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class PublicPrintController extends Controller
{
    /**
     * Display the public customer mobile upload page.
     */
    public function show(string $shopCode): Response
    {
        $shop = PrintShop::where('shop_code', strtoupper(trim($shopCode)))
            ->where('is_active', true)
            ->firstOrFail();

        return Inertia::render('Public/QrPrint/PublicUpload', [
            'shop' => [
                'name'              => $shop->shop_name,
                'code'              => $shop->shop_code,
                'phone'             => $shop->phone,
                'is_online'         => $shop->isAgentOnline(),
                'printer_name'      => $shop->printer_name ?: 'Standard Printer',
                'color_printer_name'=> $shop->color_printer_name,
                'price_bw_page'     => (float) $shop->price_bw_page,
                'price_color_page'  => (float) $shop->price_color_page,
                'price_photo_sheet' => (float) $shop->price_photo_sheet,
                'is_cash_allowed'   => (bool) $shop->is_cash_allowed,
                'is_online_allowed' => (bool) $shop->is_online_allowed,
                'upi_id'            => $shop->upi_id,
            ],
        ]);
    }

    /**
     * Handle document upload and queue the print job.
     */
    public function upload(Request $request, string $shopCode): JsonResponse
    {
        $shop = PrintShop::where('shop_code', strtoupper(trim($shopCode)))
            ->where('is_active', true)
            ->firstOrFail();

        $request->validate([
            'file'           => 'required|file|mimes:pdf,jpg,jpeg,png,webp|max:51200',
            'copies'         => 'required|integer|min:1|max:100',
            'color_mode'     => 'required|in:bw,color',
            'page_range'     => 'nullable|string|max:50',
            'total_pages'    => 'required|integer|min:1|max:500',
            'duplex'         => 'required|in:simplex,duplex_long,duplex_short',
            'paper_size'     => 'required|string|max:20',
            'service_type'   => 'required|in:document,photo_sheet,id_card,resume',
            'customer_name'  => 'nullable|string|max:100',
            'customer_phone' => 'nullable|string|max:20',
            'payment_mode'   => 'required|in:cash,online',
        ]);

        $uploadedFile = $request->file('file');
        $extension = strtolower($uploadedFile->getClientOriginalExtension());
        $originalName = $uploadedFile->getClientOriginalName();
        $fileSize = $uploadedFile->getSize();

        $copies = (int) $request->input('copies', 1);
        $totalPages = (int) $request->input('total_pages', 1);
        $colorMode = $request->input('color_mode', 'bw');
        $serviceType = $request->input('service_type', 'document');

        // Calculate Cost
        if ($serviceType === 'photo_sheet') {
            $cost = $copies * (float) $shop->price_photo_sheet;
        } elseif ($colorMode === 'color') {
            $cost = $totalPages * $copies * (float) $shop->price_color_page;
        } else {
            $cost = $totalPages * $copies * (float) $shop->price_bw_page;
        }

        // Store file securely in public storage disk
        $safeDir = 'print_jobs/' . $shop->shop_code . '/' . date('Y-m-d');
        $fileName = time() . '_' . Str::slug(pathinfo($originalName, PATHINFO_FILENAME)) . '.' . $extension;
        $filePath = $uploadedFile->storeAs($safeDir, $fileName, 'public');

        $jobCode = 'PJ-' . strtoupper(Str::random(6));

        $job = PrintJob::create([
            'print_shop_id'   => $shop->id,
            'job_code'        => $jobCode,
            'customer_name'   => $request->input('customer_name') ?: 'Counter Customer',
            'customer_phone'  => $request->input('customer_phone'),
            'file_path'       => $filePath,
            'file_name'       => $originalName,
            'file_type'       => $extension,
            'file_size'       => $fileSize,
            'copies'          => $copies,
            'color_mode'      => $colorMode,
            'page_range'      => $request->input('page_range') ?: 'all',
            'total_pages'     => $totalPages,
            'duplex'          => $request->input('duplex', 'simplex'),
            'paper_size'      => $request->input('paper_size', 'A4'),
            'service_type'    => $serviceType,
            'calculated_cost' => $cost,
            'payment_status'  => $request->input('payment_mode') === 'online' ? 'paid_online' : 'paid_cash',
            'job_status'      => 'queued',
        ]);

        return response()->json([
            'success'   => true,
            'job_code'  => $job->job_code,
            'job_id'    => $job->id,
            'cost'      => $cost,
            'status'    => $job->job_status,
            'message'   => 'Print command received successfully! Sending to printer...',
        ]);
    }

    /**
     * Poll print job status from customer mobile.
     */
    public function jobStatus(string $jobCode): JsonResponse
    {
        $job = PrintJob::where('job_code', strtoupper(trim($jobCode)))->firstOrFail();

        return response()->json([
            'success'       => true,
            'job_code'      => $job->job_code,
            'job_status'    => $job->job_status,
            'error_message' => $job->error_message,
            'printed_at'    => $job->printed_at ? $job->printed_at->format('h:i A') : null,
        ]);
    }
}
