<?php

namespace App\Http\Controllers;

use App\Models\BirthRecord;
use App\Models\Service;
use App\Models\ServiceRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BirthCertificateDownloadController extends Controller
{
    public function index(Request $request)
    {
        return Inertia::render('Utilities/BirthCertificateDownload', [
            'defaultRegNo' => $request->query('reg_no', ''),
        ]);
    }

    public function search(Request $request)
    {
        $request->validate([
            'registration_no' => 'required|string',
        ]);

        $regNo = trim($request->input('registration_no'));
        $color = $request->input('color', 'blue');
        $border = $request->boolean('border', true) ? '1' : '0';

        $user = auth()->user();

        // 1. Search locally in BirthRecords table
        $record = BirthRecord::query()
            ->visibleTo($user)
            ->where(function ($q) use ($regNo) {
                $q->where('registration_no', $regNo)
                  ->orWhere('registration_no', 'like', "%{$regNo}%")
                  ->orWhere('id', $regNo);
            })
            ->latest()
            ->first();

        // Also check if admin or if record exists anywhere
        if (!$record && ($user->isAdmin() || $user->hasRole('super_admin'))) {
            $record = BirthRecord::where('registration_no', $regNo)
                ->orWhere('registration_no', 'like', "%{$regNo}%")
                ->latest()
                ->first();
        }

        if ($record) {
            $service = Service::where('slug', 'birth-certificate-download')->first()
                ?: Service::where('slug', 'birth-certificate')->first();

            ServiceRequest::create([
                'user_id' => $user->id,
                'service_id' => $service ? $service->id : null,
                'service_name' => 'Birth Certificate Download',
                'input_data' => [
                    'Registration Number' => $record->registration_no,
                    'Child Name' => $record->child_name,
                    'Color' => $color,
                ],
                'coins_charged' => 0,
                'status' => ServiceRequest::STATUS_COMPLETED,
                'completed_at' => now(),
            ]);

            $printUrl = route('birth-records.print', [
                'record' => $record->id,
                'color' => $color,
                'border' => $border,
                'auto' => 1,
            ]);

            return response()->json([
                'success' => true,
                'record' => $record,
                'print_url' => $printUrl,
                'message' => 'Birth Certificate record found successfully!',
            ]);
        }

        return response()->json([
            'success' => false,
            'not_found' => true,
            'message' => "सर्टिफिकेट / रजिस्ट्रेशन नंबर \"{$regNo}\" का कोई रिकॉर्ड नहीं मिला। कृपया सही रजिस्ट्रेशन नंबर दर्ज करें।",
        ], 404);
    }

    public function quickGenerate(Request $request)
    {
        $validated = $request->validate([
            'registration_no' => 'required|string',
            'child_name' => 'required|string',
            'gender' => 'required|string',
            'dob' => 'required|date',
            'father_name' => 'required|string',
            'mother_name' => 'required|string',
            'district' => 'required|string',
            'permanent_address' => 'required|string',
            'issuing_authority' => 'nullable|string',
            'record_year' => 'nullable|string',
            'date_of_registration' => 'nullable|date',
            'color' => 'nullable|string',
            'border' => 'nullable|boolean',
        ]);

        $user = auth()->user();

        $validated['user_id'] = $user->id;
        $validated['issuing_authority'] = $validated['issuing_authority'] ?: 'जिला रजिस्ट्रार / नगर निगम';
        $validated['record_year'] = $validated['record_year'] ?: date('Y', strtotime($validated['dob']));
        $validated['date_of_registration'] = $validated['date_of_registration'] ?: $validated['dob'];
        $validated['address_parents_birth'] = $validated['permanent_address'];
        $validated['record_father_name'] = $validated['father_name'];
        $validated['record_mother_name'] = $validated['mother_name'];

        $color = $request->input('color', 'blue');
        $border = $request->boolean('border', true) ? '1' : '0';

        $record = BirthRecord::create($validated);

        $service = Service::where('slug', 'birth-certificate')->first();

        ServiceRequest::create([
            'user_id' => $user->id,
            'service_id' => $service ? $service->id : null,
            'service_name' => 'Birth Certificate Name Add',
            'input_data' => [
                'Registration Number' => $record->registration_no,
                'Child Name' => $record->child_name,
                'Color' => $color,
            ],
            'coins_charged' => 0,
            'status' => ServiceRequest::STATUS_COMPLETED,
            'completed_at' => now(),
        ]);

        $printUrl = route('birth-records.print', [
            'record' => $record->id,
            'color' => $color,
            'border' => $border,
            'auto' => 1,
        ]);

        return response()->json([
            'success' => true,
            'record' => $record,
            'print_url' => $printUrl,
            'message' => 'Birth Certificate declaration generated successfully!',
        ]);
    }

    public function mergeDocuments(Request $request)
    {
        $request->validate([
            'child_name' => 'nullable|string|max:255',
            'registration_no' => 'nullable|string|max:255',
            'old_birth_certificate' => 'required|file|mimes:pdf,jpg,jpeg,png|max:10240',
            'father_aadhar' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:10240',
            'mother_aadhar' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:10240',
            'child_aadhar' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:10240',
            'include_cover' => 'nullable',
        ]);

        $childName = trim($request->input('child_name', ''));
        $regNo = trim($request->input('registration_no', ''));
        $includeCover = filter_var($request->input('include_cover', true), FILTER_VALIDATE_BOOLEAN);

        $pdf = new \setasign\Fpdi\Fpdi();

        // 1. Cover Slip / Index Page (if requested or if details provided)
        if ($includeCover && ($childName || $regNo)) {
            $pdf->AddPage('P', 'A4');
            $pdf->SetMargins(15, 15, 15);
            
            // Header Box
            $pdf->SetFillColor(30, 58, 138); // Navy blue #1e3a8a
            $pdf->Rect(15, 15, 180, 22, 'F');
            
            $pdf->SetTextColor(255, 255, 255);
            $pdf->SetFont('Helvetica', 'B', 14);
            $pdf->SetXY(15, 19);
            $pdf->Cell(180, 7, 'BIRTH RECORD - SUPPORTING DOCUMENTS', 0, 1, 'C');
            $pdf->SetFont('Helvetica', '', 10);
            $pdf->Cell(180, 6, 'Child Name Addition Application File', 0, 1, 'C');

            $pdf->SetTextColor(30, 41, 59);
            $pdf->Ln(10);

            // Details Box
            $pdf->SetFont('Helvetica', 'B', 12);
            $pdf->Cell(180, 8, 'Application & Record Details:', 0, 1, 'L');
            $pdf->SetDrawColor(203, 213, 225);
            $pdf->Line(15, $pdf->GetY(), 195, $pdf->GetY());
            $pdf->Ln(4);

            $pdf->SetFont('Helvetica', 'B', 10);
            $pdf->Cell(60, 8, 'Name to be Added (Child):', 0, 0, 'L');
            $pdf->SetFont('Helvetica', '', 11);
            $safeName = iconv('UTF-8', 'ISO-8859-1//TRANSLIT//IGNORE', $childName) ?: $childName;
            $pdf->Cell(120, 8, $safeName ?: 'N/A', 0, 1, 'L');

            if ($regNo) {
                $pdf->SetFont('Helvetica', 'B', 10);
                $pdf->Cell(60, 8, 'Registration No:', 0, 0, 'L');
                $pdf->SetFont('Helvetica', '', 11);
                $pdf->Cell(120, 8, $regNo, 0, 1, 'L');
            }

            $pdf->SetFont('Helvetica', 'B', 10);
            $pdf->Cell(60, 8, 'Generated Date & Time:', 0, 0, 'L');
            $pdf->SetFont('Helvetica', '', 10);
            $pdf->Cell(120, 8, now()->format('d-m-Y h:i A'), 0, 1, 'L');

            $pdf->Ln(6);

            // Document Checklist Table
            $pdf->SetFont('Helvetica', 'B', 12);
            $pdf->Cell(180, 8, 'Enclosed Supporting Documents:', 0, 1, 'L');
            $pdf->Line(15, $pdf->GetY(), 195, $pdf->GetY());
            $pdf->Ln(4);

            $docs = [
                ['name' => '1. Old Birth Certificate (Original/Copy)', 'status' => 'Enclosed (Page Attached)'],
                ['name' => "2. Father's Identity Proof (Aadhaar Card)", 'status' => $request->hasFile('father_aadhar') ? 'Enclosed (Page Attached)' : 'Not Provided'],
                ['name' => "3. Mother's Identity Proof (Aadhaar Card)", 'status' => $request->hasFile('mother_aadhar') ? 'Enclosed (Page Attached)' : 'Not Provided'],
                ['name' => "4. Child's Identity Proof (Aadhaar Card)", 'status' => $request->hasFile('child_aadhar') ? 'Enclosed (Page Attached)' : 'Not Applicable / Not Available'],
            ];

            $pdf->SetFont('Helvetica', 'B', 10);
            $pdf->SetFillColor(241, 245, 249);
            $pdf->Cell(120, 8, ' Document Description', 1, 0, 'L', true);
            $pdf->Cell(60, 8, ' Status', 1, 1, 'C', true);

            $pdf->SetFont('Helvetica', '', 10);
            foreach ($docs as $doc) {
                $pdf->Cell(120, 8, ' ' . $doc['name'], 1, 0, 'L');
                $pdf->Cell(60, 8, $doc['status'], 1, 1, 'C');
            }

            $pdf->Ln(15);
            $pdf->SetFont('Helvetica', 'I', 9);
            $pdf->SetTextColor(100, 116, 139);
            $pdf->MultiCell(180, 5, "Note: All attached documents below have been verified and combined into this single submission PDF for the purpose of Child Name Addition in Civil Registration System (CRS) / Municipal Corporation Records.");
        }

        // Ordered list of files to append
        $filesToAppend = [
            'Old Birth Certificate' => $request->file('old_birth_certificate'),
            "Father's Aadhaar" => $request->file('father_aadhar'),
            "Mother's Aadhaar" => $request->file('mother_aadhar'),
            "Child's Aadhaar" => $request->file('child_aadhar'),
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
                // Image file (JPG/PNG)
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

        $content = $pdf->Output('S');

        // Log request in service requests
        $user = auth()->user();
        if ($user) {
            ServiceRequest::create([
                'user_id' => $user->id,
                'service_id' => null,
                'service_name' => 'Birth Certificate Document Merger',
                'input_data' => [
                    'Child Name' => $childName,
                    'Registration No' => $regNo,
                    'Files Merged' => count(array_filter($filesToAppend)),
                ],
                'coins_charged' => 0,
                'status' => ServiceRequest::STATUS_COMPLETED,
                'completed_at' => now(),
            ]);
        }

        $safeFilename = preg_replace('/[^A-Za-z0-9_-]/', '_', $childName) ?: 'Birth_Record';
        $filename = "Birth_Documents_{$safeFilename}_" . date('Ymd_His') . ".pdf";

        return response($content, 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
            'Cache-Control' => 'no-cache, no-store, must-revalidate',
        ]);
    }
}
