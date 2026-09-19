<?php

namespace App\Http\Controllers;

use App\Models\BirthRecord;
use App\Models\CoinTransaction;
use App\Models\Service;
use App\Models\ServiceRequest;
use App\Notifications\SystemAlert;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class BirthCertificateDownloadController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();
        return Inertia::render('Utilities/BirthCertificateDownload', [
            'defaultRegNo' => $request->query('reg_no', ''),
            'userCoins' => $user ? $user->coins : 0,
            'isStaff' => $user ? ($user->isAdmin() || $user->isStaff()) : false,
        ]);
    }

    public function mergeDocuments(Request $request)
    {
        $request->validate([
            'service_type' => 'required|in:color_pdf,name_add',
            'child_name' => 'nullable|string|max:255',
            'registration_no' => 'nullable|string|max:255',
            'old_birth_certificate' => 'required|file|mimes:pdf,jpg,jpeg,png|max:10240',
            'father_aadhar' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:10240',
            'mother_aadhar' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:10240',
            'child_aadhar' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:10240',
            'include_cover' => 'nullable',
        ]);

        $user = auth()->user();
        $serviceType = $request->input('service_type', 'color_pdf');
        $childName = trim($request->input('child_name', ''));
        $regNo = trim($request->input('registration_no', ''));
        $includeCover = filter_var($request->input('include_cover', true), FILTER_VALIDATE_BOOLEAN);

        // Pricing: Name Add = 400 coins, Color PDF = 300 coins
        $cost = ($serviceType === 'name_add') ? 400 : 300;
        $serviceTitle = ($serviceType === 'name_add')
            ? 'Birth Certificate Name Add'
            : 'Birth Certificate Color PDF Download';

        $isStaff = $user ? ($user->isAdmin() || $user->isStaff()) : false;

        // 1. Coin Balance Check
        if (!$isStaff && !$user->hasEnoughCoins($cost)) {
            return response()->json([
                'success' => false,
                'insufficient_coins' => true,
                'required_coins' => $cost,
                'current_coins' => $user->coins,
                'message' => "🔒 Coin Balance Insufficient: Aapke wallet me {$user->coins} coins hain, jabki is service ({$serviceTitle}) ke liye {$cost} coins ki aavashyakta hai. Kripya pehle coins recharge karein.",
            ], 402);
        }

        // 2. Deduct Coins
        if (!$isStaff && $cost > 0) {
            $user->deductCoins(
                $cost,
                CoinTransaction::TYPE_SERVICE_DEDUCTION,
                "{$serviceTitle} (#{$regNo}) — {$cost} coins",
                'birth_certificate'
            );
        }

        // 3. Save Uploaded Files to Storage
        $subDir = 'service-documents/birth_certificate/' . date('Y/m');
        $oldFile = $request->file('old_birth_certificate');
        $oldPath = $oldFile->store($subDir, 'public');

        $fatherFile = $request->file('father_aadhar');
        $fatherPath = $fatherFile ? $fatherFile->store($subDir, 'public') : null;

        $motherFile = $request->file('mother_aadhar');
        $motherPath = $motherFile ? $motherFile->store($subDir, 'public') : null;

        $childFile = $request->file('child_aadhar');
        $childPath = $childFile ? $childFile->store($subDir, 'public') : null;

        // 4. Generate Combined Single PDF
        $pdf = new \setasign\Fpdi\Fpdi();

        if ($includeCover) {
            $pdf->AddPage('P', 'A4');
            $pdf->SetMargins(15, 15, 15);

            // Top Header Banner
            $pdf->SetFillColor(30, 58, 138); // Navy #1e3a8a
            $pdf->Rect(15, 15, 180, 24, 'F');

            $pdf->SetTextColor(255, 255, 255);
            $pdf->SetFont('Helvetica', 'B', 13);
            $pdf->SetXY(15, 18);
            $safeTitle = iconv('UTF-8', 'ISO-8859-1//TRANSLIT//IGNORE', $serviceTitle) ?: $serviceTitle;
            $pdf->Cell(180, 7, strtoupper($safeTitle), 0, 1, 'C');

            $pdf->SetFont('Helvetica', '', 10);
            $pdf->Cell(180, 6, 'Application & Supporting Documents Dossier', 0, 1, 'C');

            $pdf->SetTextColor(30, 41, 59);
            $pdf->Ln(8);

            // Working Time & Info Highlight Box
            $pdf->SetFillColor(254, 243, 199); // Amber light
            $pdf->SetDrawColor(245, 158, 11);
            $pdf->Rect(15, $pdf->GetY(), 180, 12, 'DF');
            $pdf->SetXY(18, $pdf->GetY() + 2.5);
            $pdf->SetFont('Helvetica', 'B', 10);
            $pdf->SetTextColor(180, 83, 9);
            $pdf->Cell(174, 7, 'WORKING TIME: 15 MIN TO 24 HOURS | STATUS: SUBMITTED (PENDING PROCESSING)', 0, 1, 'L');

            $pdf->SetTextColor(30, 41, 59);
            $pdf->Ln(8);

            // Details Table
            $pdf->SetFont('Helvetica', 'B', 11);
            $pdf->Cell(180, 7, 'Application Details:', 0, 1, 'L');
            $pdf->SetDrawColor(203, 213, 225);
            $pdf->Line(15, $pdf->GetY(), 195, $pdf->GetY());
            $pdf->Ln(4);

            $pdf->SetFont('Helvetica', 'B', 10);
            $pdf->Cell(55, 7, 'Service Requested:', 0, 0, 'L');
            $pdf->SetFont('Helvetica', '', 10);
            $pdf->Cell(125, 7, "{$serviceTitle} ({$cost} Coins)", 0, 1, 'L');

            $pdf->SetFont('Helvetica', 'B', 10);
            $pdf->Cell(55, 7, 'Child Name:', 0, 0, 'L');
            $pdf->SetFont('Helvetica', '', 10);
            $safeName = iconv('UTF-8', 'ISO-8859-1//TRANSLIT//IGNORE', $childName) ?: $childName;
            $pdf->Cell(125, 7, $safeName ?: 'Not Specified', 0, 1, 'L');

            if ($regNo) {
                $pdf->SetFont('Helvetica', 'B', 10);
                $pdf->Cell(55, 7, 'Registration Number:', 0, 0, 'L');
                $pdf->SetFont('Helvetica', '', 10);
                $pdf->Cell(125, 7, $regNo, 0, 1, 'L');
            }

            $pdf->SetFont('Helvetica', 'B', 10);
            $pdf->Cell(55, 7, 'Submission Date & Time:', 0, 0, 'L');
            $pdf->SetFont('Helvetica', '', 10);
            $pdf->Cell(125, 7, now()->format('d-m-Y h:i A'), 0, 1, 'L');

            $pdf->SetFont('Helvetica', 'B', 10);
            $pdf->Cell(55, 7, 'Estimated Completion:', 0, 0, 'L');
            $pdf->SetFont('Helvetica', 'B', 10);
            $pdf->SetTextColor(37, 99, 235);
            $pdf->Cell(125, 7, 'Within 15 Minutes to 24 Hours', 0, 1, 'L');
            $pdf->SetTextColor(30, 41, 59);

            $pdf->Ln(6);

            // Document Checklist Table
            $pdf->SetFont('Helvetica', 'B', 11);
            $pdf->Cell(180, 7, 'Enclosed Supporting Documents:', 0, 1, 'L');
            $pdf->Line(15, $pdf->GetY(), 195, $pdf->GetY());
            $pdf->Ln(4);

            $docs = [
                ['name' => '1. Old Birth Certificate (Original/Copy)', 'status' => 'Enclosed (Page Attached)'],
                ['name' => "2. Father's Aadhaar Card", 'status' => $fatherFile ? 'Enclosed (Page Attached)' : 'Not Provided'],
                ['name' => "3. Mother's Aadhaar Card", 'status' => $motherFile ? 'Enclosed (Page Attached)' : 'Not Provided'],
                ['name' => "4. Child's Aadhaar Card", 'status' => $childFile ? 'Enclosed (Page Attached)' : 'Not Applicable / Not Provided'],
            ];

            $pdf->SetFont('Helvetica', 'B', 9);
            $pdf->SetFillColor(241, 245, 249);
            $pdf->Cell(120, 7, ' Document Description', 1, 0, 'L', true);
            $pdf->Cell(60, 7, ' Status', 1, 1, 'C', true);

            $pdf->SetFont('Helvetica', '', 9);
            foreach ($docs as $doc) {
                $pdf->Cell(120, 7, ' ' . $doc['name'], 1, 0, 'L');
                $pdf->Cell(60, 7, $doc['status'], 1, 1, 'C');
            }

            $pdf->Ln(12);
            $pdf->SetFont('Helvetica', 'I', 8.5);
            $pdf->SetTextColor(100, 116, 139);
            $pdf->MultiCell(180, 4.5, "Note: All attached documents below have been verified and bundled into this single dossier for processing. The completed certificate will be updated within 15 minutes to 24 hours.");
        }

        // 5. Append uploaded files
        $filesToAppend = [
            'Old Birth Certificate' => $oldFile,
            "Father's Aadhaar" => $fatherFile,
            "Mother's Aadhaar" => $motherFile,
            "Child's Aadhaar" => $childFile,
        ];

        foreach ($filesToAppend as $label => $file) {
            if (!$file || !$file->isValid()) continue;

            $realPath = $file->getRealPath();
            $mime = strtolower($file->getMimeType());
            $ext = strtolower($file->getClientOriginalExtension());

            if ($mime === 'application/pdf' || $ext === 'pdf') {
                try {
                    $pageCount = $pdf->setSourceFile($realPath);
                    for ($pageNo = 1; $pageNo <= $pageCount; $pageNo++) {
                        $tplId = $pdf->importPage($pageNo);
                        $size = $pdf->getTemplateSize($tplId);
                        $orientation = $size['width'] > $size['height'] ? 'L' : 'P';
                        $pdf->AddPage($orientation, [$size['width'], $size['height']]);
                        $pdf->useTemplate($tplId);
                    }
                } catch (\Exception $e) {
                    \Log::warning("Could not append PDF for {$label}: " . $e->getMessage());
                }
            } else {
                // Image file
                $info = @getimagesize($realPath);
                if ($info) {
                    $imgWidth = $info[0];
                    $imgHeight = $info[1];
                    $orientation = $imgWidth > $imgHeight ? 'L' : 'P';
                    $pdf->AddPage($orientation, 'A4');

                    $pageW = $orientation === 'L' ? 297 : 210;
                    $pageH = $orientation === 'L' ? 210 : 297;

                    $margin = 10;
                    $availW = $pageW - ($margin * 2);
                    $availH = $pageH - ($margin * 2);

                    $scale = min($availW / $imgWidth, $availH / $imgHeight);
                    $renderW = $imgWidth * $scale;
                    $renderH = $imgHeight * $scale;

                    $x = ($pageW - $renderW) / 2;
                    $y = ($pageH - $renderH) / 2;

                    $pdf->Image($realPath, $x, $y, $renderW, $renderH);
                }
            }
        }

        $pdfContent = $pdf->Output('S');

        // Save merged PDF to public disk
        $safeName = preg_replace('/[^A-Za-z0-9_-]/', '_', $childName) ?: 'Birth_Record';
        $mergedFileName = "Birth_Submission_{$safeName}_" . time() . ".pdf";
        $mergedStoragePath = "{$subDir}/{$mergedFileName}";
        Storage::disk('public')->put($mergedStoragePath, $pdfContent);

        // 6. Create ServiceRequest
        $service = Service::where('slug', 'birth-certificate-download')
            ->orWhere('module_key', 'birth_certificate_download')
            ->first() ?: Service::where('slug', 'birth-certificate')->first();

        $serviceRequest = ServiceRequest::create([
            'user_id' => $user->id,
            'service_id' => $service ? $service->id : null,
            'service_name' => $serviceTitle,
            'coins_charged' => $isStaff ? 0 : $cost,
            'status' => ServiceRequest::STATUS_PENDING,
            'estimated_time' => '15 Min - 24 Hours',
            'input_data' => [
                'Service Requested' => "{$serviceTitle} ({$cost} Coins)",
                'Working Time' => '15 Min - 24 Hours',
                'Coins Charged' => "{$cost} Coins",
                'Child Name' => $childName ?: 'N/A',
                'Registration No' => $regNo ?: 'N/A',
                'Submission PDF' => [
                    'type' => 'file',
                    'path' => $mergedStoragePath,
                    'name' => $mergedFileName,
                ],
                'Old Birth Certificate' => [
                    'type' => 'file',
                    'path' => $oldPath,
                    'name' => $oldFile->getClientOriginalName(),
                ],
                'Father Aadhaar' => $fatherPath ? [
                    'type' => 'file',
                    'path' => $fatherPath,
                    'name' => $fatherFile->getClientOriginalName(),
                ] : 'Not Provided',
                'Mother Aadhaar' => $motherPath ? [
                    'type' => 'file',
                    'path' => $motherPath,
                    'name' => $motherFile->getClientOriginalName(),
                ] : 'Not Provided',
                'Child Aadhaar' => $childPath ? [
                    'type' => 'file',
                    'path' => $childPath,
                    'name' => $childFile->getClientOriginalName(),
                ] : 'Not Provided',
            ],
        ]);

        // Alert Admins
        try {
            SystemAlert::toAdmins(
                'New Birth Certificate Request',
                "{$user->name} requested {$serviceTitle} (#{$serviceRequest->id}). Working Time: 15 Min - 24 Hours.",
                "/admin/service-requests/{$serviceRequest->id}"
            );
        } catch (\Throwable $e) {
            // Ignore notification failure
        }

        $downloadUrl = route('utilities.birth-certificate.download-merged', $serviceRequest->id);

        return response()->json([
            'success' => true,
            'message' => "Aapki {$serviceTitle} request safaltapoorvak submit ho gayi hai! Working Time: 15 Min se 24 Hours. {$cost} coins deduct ho gaye hain.",
            'service_name' => $serviceTitle,
            'coins_deducted' => $cost,
            'remaining_coins' => $user->fresh()->coins,
            'working_time' => '15 Min - 24 Hours',
            'request_id' => $serviceRequest->id,
            'download_url' => $downloadUrl,
            'download_name' => $mergedFileName,
        ]);
    }

    public function downloadMerged(ServiceRequest $serviceRequest)
    {
        $user = auth()->user();
        if (!$user->isAdmin() && !$user->isStaff() && $serviceRequest->user_id !== $user->id) {
            abort(403, 'Unauthorized access to this document.');
        }

        $pdfInfo = $serviceRequest->input_data['Submission PDF'] ?? null;
        if (!$pdfInfo || empty($pdfInfo['path']) || !Storage::disk('public')->exists($pdfInfo['path'])) {
            abort(404, 'Submission PDF file not found.');
        }

        $fullPath = Storage::disk('public')->path($pdfInfo['path']);
        $filename = $pdfInfo['name'] ?? 'Birth_Certificate_Submission.pdf';

        return response()->download($fullPath, $filename, [
            'Content-Type' => 'application/pdf',
        ]);
    }
}
