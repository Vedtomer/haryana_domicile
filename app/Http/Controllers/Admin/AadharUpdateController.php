<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AadharUpdate;
use App\Notifications\SystemAlert;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use setasign\Fpdi\Tcpdf\Fpdi;

class AadharUpdateController extends Controller
{
    /**
     * Exact box coordinates in millimeters on A4 page (210mm x 297mm)
     * extracted from authentic CorelDRAW template.
     */
    private static array $BOX_COORDINATES = [
        'date' => [
            [145.2, 50.52], [150.79, 50.52], [160.05, 50.52], [165.64, 50.52], [174.16, 50.52], [179.65, 50.52], [185.49, 50.52], [190.98, 50.52]
        ],
        'aadhar_number' => [
            [50.88, 76.57], [56.74, 76.57], [63.01, 76.57], [69.51, 76.57],
            [76.0, 76.57], [82.57, 76.57], [89.25, 76.57], [95.75, 76.57],
            [102.24, 76.57], [108.28, 76.57], [114.91, 76.57], [120.77, 76.57]
        ],
        'name' => [
            [49.81, 86.19], [56.66, 86.19], [63.2, 86.19], [69.21, 86.19],
            [75.42, 86.19], [81.62, 86.19], [87.65, 86.19], [94.05, 86.19],
            [100.27, 86.19], [105.6, 86.19], [111.81, 86.19], [117.91, 86.19],
            [123.67, 86.19], [130.96, 86.19], [137.87, 86.19], [144.26, 86.19],
            [150.55, 86.19], [156.92, 86.19], [163.31, 86.19], [169.75, 86.19],
            [175.16, 86.19], [181.44, 86.19]
        ],
        'house_no' => [
            [50.04, 100.6], [56.91, 100.6], [63.47, 100.6], [69.5, 100.6],
            [75.73, 100.6], [81.95, 100.6], [88.0, 100.6], [94.42, 100.6],
            [100.66, 100.6], [106.01, 100.6], [112.24, 100.6], [118.36, 100.6],
            [124.14, 100.6], [131.45, 100.6], [138.38, 100.6], [144.79, 100.6],
            [151.1, 100.6], [157.49, 100.6], [163.91, 100.6], [170.37, 100.6],
            [175.79, 100.6], [182.09, 100.6]
        ],
        'street' => [
            [49.81, 107.47], [56.66, 107.47], [63.2, 107.47], [69.21, 107.47],
            [75.42, 107.47], [81.62, 107.47], [87.65, 107.47], [94.05, 107.47],
            [100.27, 107.47], [105.6, 107.47], [111.81, 107.47], [117.91, 107.47],
            [123.67, 107.47], [130.96, 107.47], [137.87, 107.47], [144.26, 107.47],
            [150.55, 107.47], [156.92, 107.47], [163.31, 107.47], [169.75, 107.47],
            [175.16, 107.47], [181.44, 107.47]
        ],
        'landmark' => [
            [49.81, 114.17], [56.66, 114.17], [63.2, 114.17], [69.21, 114.17],
            [75.42, 114.17], [81.62, 114.17], [87.65, 114.17], [94.05, 114.17],
            [100.27, 114.17], [105.6, 114.17], [111.81, 114.17], [117.91, 114.17],
            [123.67, 114.17], [130.96, 114.17], [137.87, 114.17], [144.26, 114.17],
            [150.55, 114.17], [156.92, 114.17], [163.31, 114.17], [169.75, 114.17],
            [175.16, 114.17], [181.44, 114.17]
        ],
        'locality' => [
            [49.81, 121.43], [56.66, 121.43], [63.2, 121.43], [69.21, 121.43],
            [75.42, 121.43], [81.62, 121.43], [87.65, 121.43], [94.05, 121.43],
            [100.27, 121.43], [105.6, 121.43], [111.81, 121.43], [117.91, 121.43],
            [123.67, 121.43], [130.96, 121.43], [137.87, 121.43], [144.26, 121.43],
            [150.55, 121.43], [156.92, 121.43], [163.31, 121.43], [169.75, 121.43],
            [175.16, 121.43], [181.44, 121.43]
        ],
        'village_town' => [
            [49.81, 128.12], [56.66, 128.12], [63.2, 128.12], [69.21, 128.12],
            [75.42, 128.12], [81.62, 128.12], [87.65, 128.12], [94.05, 128.12],
            [100.27, 128.12], [105.6, 128.12], [111.81, 128.12], [117.91, 128.12],
            [123.67, 128.12], [130.96, 128.12], [137.87, 128.12], [144.26, 128.12],
            [150.55, 128.12], [156.92, 128.12], [163.31, 128.12], [169.75, 128.12],
            [175.16, 128.12], [181.44, 128.12]
        ],
        'post_office' => [
            [49.81, 136.0], [56.66, 136.0], [63.2, 136.0], [69.21, 136.0],
            [75.42, 136.0], [81.62, 136.0], [87.65, 136.0], [94.05, 136.0],
            [100.27, 136.0], [105.6, 136.0], [111.81, 136.0], [117.91, 136.0],
            [123.67, 136.0], [130.96, 136.0], [137.87, 136.0], [144.26, 136.0],
            [150.55, 136.0]
        ],
        'district' => [
            [49.81, 143.21], [56.66, 143.21], [63.2, 143.21], [69.21, 143.21],
            [75.42, 143.21], [81.62, 143.21], [87.65, 143.21], [94.05, 143.21],
            [100.27, 143.21], [105.6, 143.21], [111.81, 143.21], [117.91, 143.21],
            [123.67, 143.21], [130.96, 143.21], [137.87, 143.21], [144.26, 143.21],
            [150.55, 143.21]
        ],
        'state' => [
            [49.81, 150.75], [56.66, 150.75], [63.2, 150.75], [69.21, 150.75],
            [75.42, 150.75], [81.62, 150.75], [87.65, 150.75], [94.05, 150.75],
            [100.27, 150.75], [105.6, 150.75], [111.81, 150.75], [117.91, 150.75],
            [123.67, 150.75], [130.96, 150.75], [137.87, 150.75], [144.26, 150.75],
            [150.55, 150.75]
        ],
        'pin_code' => [
            [49.77, 163.58], [56.21, 163.58], [63.09, 163.58], [69.53, 163.58],
            [75.98, 163.58], [82.94, 163.58]
        ],
        'certifier_name' => [
            [49.81, 192.33], [56.66, 192.33], [63.2, 192.33], [69.21, 192.33],
            [75.42, 192.33], [81.62, 192.33], [87.65, 192.33], [94.05, 192.33],
            [100.27, 192.33], [105.6, 192.33], [111.81, 192.33], [117.91, 192.33],
            [123.67, 192.33], [130.96, 192.33], [137.87, 192.33], [144.26, 192.33],
            [150.55, 192.33], [156.92, 192.33], [163.31, 192.33], [169.75, 192.33],
            [175.16, 192.33], [181.44, 192.33]
        ],
        'certifier_designation' => [
            [49.81, 199.19], [56.66, 199.19], [63.2, 199.19], [69.21, 199.19],
            [75.42, 199.19], [81.62, 199.19], [87.65, 199.19], [94.05, 199.19],
            [100.27, 199.19], [105.6, 199.19], [111.81, 199.19], [117.91, 199.19],
            [123.67, 199.19], [130.96, 199.19], [137.87, 199.19], [144.26, 199.19],
            [150.55, 199.19], [156.92, 199.19], [163.31, 199.19], [169.75, 199.19],
            [175.16, 199.19], [181.44, 199.19]
        ],
        'certifier_address' => [
            [49.81, 206.18], [56.66, 206.18], [63.2, 206.18], [69.21, 206.18],
            [75.42, 206.18], [81.62, 206.18], [87.65, 206.18], [94.05, 206.18],
            [100.27, 206.18], [105.6, 206.18], [111.81, 206.18], [117.91, 206.18],
            [123.67, 206.18], [130.96, 206.18], [137.87, 206.18], [144.26, 206.18],
            [150.55, 206.18], [156.92, 206.18], [163.31, 206.18], [169.75, 206.18],
            [175.16, 206.18], [181.44, 206.18]
        ],
        'certifier_address2' => [
            [49.81, 213.11], [56.66, 213.11], [63.2, 213.11], [69.21, 213.11],
            [75.42, 213.11], [81.62, 213.11], [87.65, 213.11], [94.05, 213.11],
            [100.27, 213.11], [105.6, 213.11], [111.81, 213.11], [117.91, 213.11],
            [123.67, 213.11], [130.96, 213.11], [137.87, 213.11], [144.26, 213.11],
            [150.55, 213.11], [156.92, 213.11], [163.31, 213.11], [169.75, 213.11],
            [175.16, 213.11], [181.44, 213.11]
        ],
        'certifier_contact' => [
            [49.68, 219.81], [55.81, 219.81], [62.14, 219.81], [68.61, 219.81],
            [75.06, 219.81], [81.56, 219.81], [88.11, 219.81], [94.58, 219.81],
            [101.03, 219.81], [107.25, 219.81]
        ],
    ];

    public function index()
    {
        $records = AadharUpdate::query()
            ->visibleTo(auth()->user())
            ->latest()
            ->paginate(10);

        return Inertia::render('Admin/AadharUpdate/Index', [
            'records' => $records,
        ]);
    }

    public function create()
    {
        $service = $this->moduleService('aadhar_card_form') ?? $this->moduleService('aadhar_update');
        if ($error = $this->serviceBlocker($service)) {
            return redirect()->route('dashboard')->with('error', $error);
        }

        return Inertia::render('Admin/AadharUpdate/Create', [
            'coinCost' => $service?->coin_cost ?? 9,
        ]);
    }

    public function store(Request $request)
    {
        $service = $this->moduleService('aadhar_card_form') ?? $this->moduleService('aadhar_update');

        if ($error = $this->serviceBlocker($service)) {
            return back()->withInput()->with('error', $error);
        }

        $data = $this->validated($request);
        $data['user_id'] = auth()->id();
        $record = AadharUpdate::create($data);

        $this->chargeForService($service, $record->id, "Aadhar Card Form #{$record->id}");

        SystemAlert::toAdmins(
            'New Aadhar Card Form Created',
            auth()->user()->name . " created an Aadhar Card Form (#{$record->id}) for {$record->name}.",
            '/admin/aadhar-update'
        );

        if ($request->boolean('save_and_create')) {
            return redirect()->route('admin.aadhar-update.create')
                ->with('success', 'Aadhar Card Form created successfully.' . $this->chargeNote($service));
        }

        return redirect()->route('admin.aadhar-update.index')
            ->with('success', 'Aadhar Card Form created successfully. Ready to print!' . $this->chargeNote($service))
            ->with('print_id', $record->id);
    }

    public function edit(AadharUpdate $aadharUpdate)
    {
        $this->authorizeOwner($aadharUpdate);

        return Inertia::render('Admin/AadharUpdate/Edit', [
            'record' => $aadharUpdate,
        ]);
    }

    public function update(Request $request, AadharUpdate $aadharUpdate)
    {
        $this->authorizeOwner($aadharUpdate);
        $aadharUpdate->update($this->validated($request));

        return redirect()->route('admin.aadhar-update.index')
            ->with('success', 'Aadhar Card Form updated successfully.')
            ->with('print_id', $aadharUpdate->id);
    }

    public function destroy(AadharUpdate $aadharUpdate)
    {
        $this->authorizeOwner($aadharUpdate);
        $aadharUpdate->delete();

        return redirect()->route('admin.aadhar-update.index')
            ->with('success', 'Aadhar Card Form deleted successfully.');
    }

    public function print(AadharUpdate $aadharUpdate)
    {
        $this->authorizeOwner($aadharUpdate);

        $templatePath = public_path('aadhar_update/template-1.pdf');
        if (!file_exists($templatePath)) {
            $templatePath = public_path('aadhar_update/template-1.jpg');
        }

        $pdf = new Fpdi();
        $pdf->SetAutoPageBreak(false);
        $pdf->SetMargins(0, 0, 0);
        $pdf->AddPage('P', 'A4');

        if (str_ends_with(strtolower($templatePath), '.pdf')) {
            $pdf->setSourceFile($templatePath);
            $tpl = $pdf->importPage(1);
            $pdf->useTemplate($tpl, 0, 0, 210, 297);
        } else {
            $pdf->Image($templatePath, 0, 0, 210, 297);
        }

        // Register BrittanySignature cursive font
        $scriptFont = 'brittanysignature';
        $fontDir = base_path('vendor/tecnickcom/tcpdf/fonts');
        if (is_dir($fontDir) && !file_exists($fontDir . '/brittanysignature.php') && file_exists(public_path('fonts/brittanysignature.php'))) {
            @copy(public_path('fonts/brittanysignature.php'), $fontDir . '/brittanysignature.php');
            @copy(public_path('fonts/brittanysignature.z'), $fontDir . '/brittanysignature.z');
            @copy(public_path('fonts/brittanysignature.ctg.z'), $fontDir . '/brittanysignature.ctg.z');
        }
        $ttfPath = public_path('fonts/BrittanySignature.ttf');
        if (file_exists($ttfPath)) {
            try {
                $scriptFont = \TCPDF_FONTS::addTTFfont($ttfPath, 'TrueTypeUnicode', '', 96) ?: 'brittanysignature';
            } catch (\Throwable $e) {
                $scriptFont = 'brittanysignature';
            }
        }

        $pdf->SetTextColor(0, 0, 0);

        // Helper to fill boxed text with specific font and size
        $fillBoxes = function (array $coords, ?string $text, string $font, float $fontSize, float $yOffset = -0.5, float $cellW = 5.0, float $cellH = 5.0) use ($pdf) {
            if (empty($text)) return;
            $pdf->SetFont($font, '', $fontSize);
            $text = strtoupper(trim((string)$text));
            $chars = str_split($text);
            foreach ($chars as $i => $char) {
                if (!isset($coords[$i])) break;
                $pdf->SetXY($coords[$i][0], $coords[$i][1] + $yOffset);
                $pdf->Cell($cellW, $cellH, $char, 0, 0, 'C');
            }
        };

        // 1. Date (Day, Month, Year in 8 boxes)
        $formDate = $aadharUpdate->date ?: ($aadharUpdate->created_at ? $aadharUpdate->created_at->format('Y-m-d') : date('Y-m-d'));
        try {
            $dateObj = Carbon::parse($formDate);
            $dateStr = $dateObj->format('dmY');
        } catch (\Throwable $e) {
            $dateStr = '01012026';
        }
        $fillBoxes(self::$BOX_COORDINATES['date'], $dateStr, $scriptFont, 18, -0.5);

        // 2. Aadhaar Number (12 boxes)
        $fillBoxes(self::$BOX_COORDINATES['aadhar_number'], $aadharUpdate->aadhar_number, $scriptFont, 18, -0.5);

        // 3. Name & Address Lines (22 boxes each, font size 10)
        $fillBoxes(self::$BOX_COORDINATES['name'], $aadharUpdate->name, $scriptFont, 10, -0.8);
        $fillBoxes(self::$BOX_COORDINATES['house_no'], $aadharUpdate->house_no ?: $aadharUpdate->c_o, $scriptFont, 10, -0.8);
        $fillBoxes(self::$BOX_COORDINATES['street'], $aadharUpdate->street, $scriptFont, 10, -0.8);
        $fillBoxes(self::$BOX_COORDINATES['landmark'], $aadharUpdate->landmark, $scriptFont, 10, -0.8);
        $fillBoxes(self::$BOX_COORDINATES['locality'], $aadharUpdate->locality, $scriptFont, 10, -0.8);
        $fillBoxes(self::$BOX_COORDINATES['village_town'], $aadharUpdate->village_town, $scriptFont, 10, -0.8);

        // 17 boxes fields
        $fillBoxes(self::$BOX_COORDINATES['post_office'], $aadharUpdate->post_office, $scriptFont, 10, -0.8);
        $fillBoxes(self::$BOX_COORDINATES['district'], $aadharUpdate->district, $scriptFont, 10, -0.8);
        $fillBoxes(self::$BOX_COORDINATES['state'], $aadharUpdate->state, $scriptFont, 10, -0.8);

        // PIN Code (6 boxes, font size 13)
        $fillBoxes(self::$BOX_COORDINATES['pin_code'], $aadharUpdate->pin_code, $scriptFont, 13, -0.6);

        // 4. Certifier Details
        $fillBoxes(self::$BOX_COORDINATES['certifier_name'], $aadharUpdate->certifier_name, $scriptFont, 10, -0.8);
        $fillBoxes(self::$BOX_COORDINATES['certifier_designation'], $aadharUpdate->certifier_designation, $scriptFont, 10, -0.8);
        $fillBoxes(self::$BOX_COORDINATES['certifier_address'], $aadharUpdate->certifier_address, $scriptFont, 10, -0.8);
        $fillBoxes(self::$BOX_COORDINATES['certifier_address2'], $aadharUpdate->certifier_address2, $scriptFont, 10, -0.8);

        // Contact Number (10 boxes, font size 11)
        $fillBoxes(self::$BOX_COORDINATES['certifier_contact'], $aadharUpdate->certifier_contact, $scriptFont, 11, -0.6);

        // 5. Checkboxes (Checkmarks)
        $pdf->SetFont('dejavusans', 'B', 11);

        $drawCheck = function (float $x, float $y) use ($pdf) {
            $pdf->SetXY($x, $y);
            $pdf->Cell(4.5, 4.5, '✓', 0, 0, 'C');
        };

        // Resident Status
        $resStatus = $aadharUpdate->resident_status ?? 'Resident';
        if ($resStatus === 'Non-Resident Indian (NRI)') {
            $drawCheck(36.5, 70.0);
        } elseif (str_contains($resStatus, 'Foreign') || str_contains($resStatus, 'OCI')) {
            $drawCheck(75.0, 70.0);
        } else {
            $drawCheck(17.0, 70.0); // Resident default
        }

        // Request Type
        $reqType = $aadharUpdate->request_type ?? 'Update Request';
        if ($reqType === 'New Enrolment') {
            $drawCheck(144.5, 70.0);
        } else {
            $drawCheck(171.5, 70.0); // Update Request default
        }

        // Certifier Category
        $cat = $aadharUpdate->certifier_category ?? 'Village Panchayat Head';
        if (str_contains($cat, 'MP') || str_contains($cat, 'MLA')) {
            $drawCheck(15.5, 239.0);
        } elseif (str_contains($cat, 'Group A') || str_contains($cat, 'EPFO')) {
            $drawCheck(15.5, 242.8);
        } elseif (str_contains($cat, 'Tehsildar') || str_contains($cat, 'Group B')) {
            $drawCheck(15.5, 248.6);
        } elseif (str_contains($cat, 'NACO') || str_contains($cat, 'Health')) {
            $drawCheck(15.5, 251.8);
        } elseif (str_contains($cat, 'Educational') || str_contains($cat, 'institution')) {
            $drawCheck(15.5, 257.6);
        } else {
            $drawCheck(15.5, 260.4); // Village Panchayat Head default
        }

        // Checklist for Certifier (Default all ticked like standard sample)
        $drawCheck(96.0, 232.8);  // No overwriting
        $drawCheck(118.3, 232.8); // Issue date filled
        $drawCheck(143.5, 232.8); // Resident's signature
        $drawCheck(171.5, 232.8); // Certifier's details
        $drawCheck(96.0, 236.0);  // Resident photo cross signed

        $cleanName = preg_replace('/[^A-Za-z0-9_\-]/', '_', $aadharUpdate->name);
        $filename = 'Aadhar_Card_Form_' . ($cleanName ?: $aadharUpdate->id) . '.pdf';

        return response()->streamDownload(function () use ($pdf) {
            echo $pdf->Output('S');
        }, $filename, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => "inline; filename=\"{$filename}\"",
        ]);
    }

    private function validated(Request $request): array
    {
        return $request->validate([
            'date' => 'nullable|string|max:20',
            'resident_status' => 'nullable|string|max:50',
            'request_type' => 'nullable|string|max:50',
            'aadhar_number' => 'required|string|max:20',
            'name' => 'required|string|max:255',
            'c_o' => 'nullable|string|max:255',
            'house_no' => 'nullable|string|max:255',
            'street' => 'nullable|string|max:255',
            'landmark' => 'nullable|string|max:255',
            'locality' => 'nullable|string|max:255',
            'village_town' => 'required|string|max:255',
            'post_office' => 'nullable|string|max:255',
            'district' => 'required|string|max:255',
            'state' => 'required|string|max:255',
            'pin_code' => 'required|string|max:10',
            'certifier_name' => 'nullable|string|max:255',
            'certifier_designation' => 'nullable|string|max:255',
            'certifier_address' => 'nullable|string|max:255',
            'certifier_address2' => 'nullable|string|max:255',
            'certifier_contact' => 'nullable|string|max:50',
            'certifier_category' => 'nullable|string|max:100',
        ]);
    }
}
