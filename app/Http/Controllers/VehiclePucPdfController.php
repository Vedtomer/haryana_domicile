<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Barryvdh\DomPDF\Facade\Pdf;
use BaconQrCode\Renderer\ImageRenderer;
use BaconQrCode\Renderer\RendererStyle\RendererStyle;
use BaconQrCode\Renderer\Image\SvgImageBackEnd;
use BaconQrCode\Writer;
use Illuminate\Support\Facades\Log;

class VehiclePucPdfController extends Controller
{
    /**
     * Generate and download the official PUC Certificate PDF
     */
    public function downloadPdf(Request $request)
    {
        $user = auth()->user();
        if (!$user) {
            abort(401, 'Unauthenticated');
        }

        $puc = $request->input('puc', []);

        // Fallback if individual fields are posted directly
        if (empty($puc)) {
            $puc = $request->all();
        }

        $regNo = strtoupper(trim(str_replace([' ', '-'], '', $puc['reg_no'] ?? $request->input('reg_no', 'HR26DK8337'))));
        if (empty($puc['reg_no'])) {
            $puc['reg_no'] = $regNo;
        }

        // Set sensible defaults if any field is missing
        $puc['puc_no'] = $puc['puc_no'] ?? $puc['certificate_no'] ?? ('PUC-' . substr($regNo, 0, 4) . '-' . rand(100000, 999999));
        $puc['test_date'] = $puc['test_date'] ?? date('d-M-Y H:i:s');
        $puc['valid_upto'] = $puc['valid_upto'] ?? date('d-M-Y', strtotime('+6 months'));
        $puc['status'] = $puc['status'] ?? 'VALID';
        $puc['emission_norms'] = $puc['emission_norms'] ?? 'BHARAT STAGE VI (BS-VI)';
        $puc['fuel_type'] = $puc['fuel_type'] ?? 'PETROL / HYBRID';
        $puc['vehicle_class'] = $puc['vehicle_class'] ?? 'Motor Car (LMV) / Private';
        $puc['chassis_no'] = $puc['chassis_no'] ?? ('MBL' . substr(md5($regNo . 'chassis'), 0, 14));
        $puc['engine_no'] = $puc['engine_no'] ?? ('ENG' . substr(md5($regNo . 'engine'), 0, 11));
        $puc['puc_center_name'] = $puc['puc_center_name'] ?? 'GOVT AUTHORIZED POLLUTION TESTING STATION';
        $puc['puc_center_code'] = $puc['puc_center_code'] ?? ('PUCC-' . substr($regNo, 0, 4) . '-01');

        // National Emblem Base64
        $emblemPath = public_path('images/emblem.svg');
        $emblemSvg = file_exists($emblemPath)
            ? 'data:image/svg+xml;base64,' . base64_encode(file_get_contents($emblemPath))
            : null;

        // Generate Verification QR Code
        $qrCodeSvg = null;
        try {
            $qrText = "POLLUTION UNDER CONTROL CERTIFICATE\n"
                . "Certificate No: " . $puc['puc_no'] . "\n"
                . "Vehicle Reg No: " . $puc['reg_no'] . "\n"
                . "Valid Upto: " . $puc['valid_upto'] . "\n"
                . "Status: " . $puc['status'] . "\n"
                . "Verify at: https://vahan.parivahan.gov.in/puc";

            $renderer = new ImageRenderer(
                new RendererStyle(90, 0),
                new SvgImageBackEnd()
            );
            $writer = new Writer($renderer);
            $qrCodeSvg = 'data:image/svg+xml;base64,' . base64_encode($writer->writeString($qrText));
        } catch (\Throwable $e) {
            Log::warning('PUC QR Code generation notice: ' . $e->getMessage());
        }

        $pdf = Pdf::loadView('pdf.puc_certificate', [
            'puc' => $puc,
            'emblemSvg' => $emblemSvg,
            'qrCodeSvg' => $qrCodeSvg,
        ]);

        $pdf->setPaper('a4', 'portrait');

        $fileName = 'PUC_Certificate_' . $regNo . '.pdf';

        return response($pdf->output())
            ->header('Content-Type', 'application/pdf')
            ->header('Content-Disposition', 'attachment; filename="' . $fileName . '"');
    }
}
