<?php

namespace App\Http\Controllers;

use App\Models\PrintJob;
use App\Models\PrintShop;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Inertia\Inertia;
use Inertia\Response;
use ZipArchive;

class QrPrintController extends Controller
{
    /**
     * Shop management dashboard for QR Cloud Printing.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $shop = PrintShop::getOrCreateForUser($user);

        $jobs = $shop->printJobs()
            ->latest('id')
            ->take(30)
            ->get()
            ->map(fn (PrintJob $j) => [
                'id'              => $j->id,
                'job_code'        => $j->job_code,
                'customer_name'   => $j->customer_name,
                'customer_phone'  => $j->customer_phone,
                'file_name'       => $j->file_name,
                'file_type'       => $j->file_type,
                'copies'          => $j->copies,
                'color_mode'      => $j->color_mode,
                'page_range'      => $j->page_range,
                'total_pages'     => $j->total_pages,
                'duplex'          => $j->duplex,
                'service_type'    => $j->service_type,
                'calculated_cost' => (float) $j->calculated_cost,
                'payment_status'  => $j->payment_status,
                'job_status'      => $j->job_status,
                'error_message'   => $j->error_message,
                'created_at'      => $j->created_at->diffForHumans(),
                'printed_at'      => $j->printed_at ? $j->printed_at->diffForHumans() : null,
                'download_url'    => $j->file_download_url,
            ]);

        $customerUrl = url('/p/' . $shop->shop_code);
        $qrUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=350x350&margin=10&data=' . urlencode($customerUrl);

        return Inertia::render('Admin/QrPrint/Index', [
            'shop' => [
                'id'                 => $shop->id,
                'shop_code'          => $shop->shop_code,
                'shop_name'          => $shop->shop_name,
                'phone'              => $shop->phone,
                'upi_id'             => $shop->upi_id,
                'is_online'          => $shop->isAgentOnline(),
                'agent_last_seen'    => $shop->agent_last_seen_at ? $shop->agent_last_seen_at->diffForHumans() : 'Never',
                'printer_name'       => $shop->printer_name,
                'color_printer_name' => $shop->color_printer_name,
                'available_printers' => $shop->available_printers ?: [],
                'price_bw_page'      => (float) $shop->price_bw_page,
                'price_color_page'   => (float) $shop->price_color_page,
                'price_photo_sheet'  => (float) $shop->price_photo_sheet,
                'is_auto_print'      => (bool) $shop->is_auto_print,
                'is_cash_allowed'    => (bool) $shop->is_cash_allowed,
                'is_online_allowed'  => (bool) $shop->is_online_allowed,
                'customer_url'       => $customerUrl,
                'qr_url'             => $qrUrl,
                'agent_secret'       => $shop->agent_secret,
            ],
            'jobs' => $jobs,
        ]);
    }

    /**
     * Update shop printing settings and pricing.
     */
    public function updateSettings(Request $request): RedirectResponse
    {
        $shop = PrintShop::getOrCreateForUser($request->user());

        $data = $request->validate([
            'shop_name'          => 'required|string|max:150',
            'phone'              => 'nullable|string|max:20',
            'upi_id'             => 'nullable|string|max:100',
            'printer_name'       => 'nullable|string|max:150',
            'color_printer_name' => 'nullable|string|max:150',
            'price_bw_page'      => 'required|numeric|min:0.5',
            'price_color_page'   => 'required|numeric|min:1',
            'price_photo_sheet'  => 'required|numeric|min:5',
            'is_auto_print'      => 'boolean',
            'is_cash_allowed'    => 'boolean',
            'is_online_allowed'  => 'boolean',
        ]);

        $shop->update($data);

        return back()->with('success', 'Print settings updated successfully!');
    }

    /**
     * Printable Shop QR Counter Standee / Poster.
     */
    public function standee(Request $request): Response
    {
        $shop = PrintShop::getOrCreateForUser($request->user());
        $customerUrl = url('/p/' . $shop->shop_code);
        $qrUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=500x500&margin=15&data=' . urlencode($customerUrl);

        return Inertia::render('Admin/QrPrint/Standee', [
            'shop' => [
                'shop_name'         => $shop->shop_name,
                'shop_code'         => $shop->shop_code,
                'phone'             => $shop->phone,
                'price_bw_page'     => (float) $shop->price_bw_page,
                'price_color_page'  => (float) $shop->price_color_page,
                'price_photo_sheet' => (float) $shop->price_photo_sheet,
                'customer_url'      => $customerUrl,
                'qr_url'            => $qrUrl,
            ],
        ]);
    }

    /**
     * Download turnkey Windows Print Agent pre-configured for this shop.
     */
    public function downloadAgent(Request $request)
    {
        $shop = PrintShop::getOrCreateForUser($request->user());

        $templateScript = File::get(resource_path('scripts/print-agent/agent.ps1'));
        $templateBat = File::get(resource_path('scripts/print-agent/Start-Agent.bat'));

        // Inject this shop's specific secret and host
        $customScript = str_replace(
            ['__AGENT_SECRET__', 'https://cspjaankari.in'],
            [$shop->agent_secret, url('/')],
            $templateScript
        );

        $tempZip = storage_path('app/temp_agent_' . $shop->shop_code . '_' . time() . '.zip');

        $zip = new ZipArchive();
        if ($zip->open($tempZip, ZipArchive::CREATE | ZipArchive::OVERWRITE) === true) {
            $zip->addFromString('agent.ps1', $customScript);
            $zip->addFromString('Start-Agent.bat', $templateBat);
            $zip->addFromString('README_INSTRUCTIONS.txt', "CSP JAANKARI - QR CLOUD PRINT AGENT\n=========================================\n1. Extract this entire folder to your Desktop.\n2. Double-click 'Start-Agent.bat'.\n3. Keep the black window open. It will automatically detect your Windows printer and print customer documents as they arrive!\n\nShop Name: {$shop->shop_name}\nShop Code: {$shop->shop_code}\nSupport: +91 91226 91369\n");
            $zip->close();
        }

        return response()->download($tempZip, 'CSP-Print-Agent-' . $shop->shop_code . '.zip')->deleteFileAfterSend(true);
    }

    /**
     * Trigger reprint of a job.
     */
    public function reprintJob(Request $request, int $id): RedirectResponse
    {
        $shop = PrintShop::getOrCreateForUser($request->user());
        $job = $shop->printJobs()->findOrFail($id);

        $job->update([
            'job_status'    => 'queued',
            'error_message' => null,
        ]);

        return back()->with('success', "Job #{$job->job_code} queued for re-printing!");
    }

    /**
     * Cancel a queued job.
     */
    public function cancelJob(Request $request, int $id): RedirectResponse
    {
        $shop = PrintShop::getOrCreateForUser($request->user());
        $job = $shop->printJobs()->findOrFail($id);

        $job->update(['job_status' => 'cancelled']);

        return back()->with('success', "Job #{$job->job_code} cancelled.");
    }
}
