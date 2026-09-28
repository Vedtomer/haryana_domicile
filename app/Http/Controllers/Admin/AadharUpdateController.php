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
        'date_day' => [
            [145.2, 53.63], [150.79, 53.63]
        ],
        'date_month' => [
            [160.05, 53.63], [165.64, 53.63]
        ],
        'date_year' => [
            [174.16, 53.63], [179.65, 53.63], [185.49, 53.63], [190.98, 53.63]
        ],
        'aadhar_number' => [
            [50.88, 79.68], [56.74, 79.68], [63.01, 79.68], [69.51, 79.68],
            [76.0, 79.68], [82.57, 79.68], [89.25, 79.68], [95.75, 79.68],
            [102.24, 79.68], [108.28, 79.68], [114.91, 79.68], [120.77, 79.68]
        ],
        'name' => [
            [49.81, 85.47], [56.66, 85.47], [63.2, 85.47], [69.21, 85.47],
            [75.42, 85.47], [81.62, 85.47], [87.65, 85.47], [94.05, 85.47],
            [100.27, 85.47], [105.6, 85.47], [111.81, 85.47], [117.91, 85.47],
            [123.67, 85.47], [130.96, 85.47], [137.87, 85.47], [144.26, 85.47],
            [150.55, 85.47], [156.92, 85.47], [163.31, 85.47], [169.75, 85.47],
            [175.16, 85.47], [181.44, 85.47]
        ],
        'house_no' => [
            [50.04, 99.87], [56.91, 99.87], [63.47, 99.87], [69.5, 99.87],
            [75.73, 99.87], [81.95, 99.87], [88.0, 99.87], [94.42, 99.87],
            [100.66, 99.87], [106.01, 99.87], [112.24, 99.87], [118.36, 99.87],
            [124.14, 99.87], [131.45, 99.87], [138.38, 99.87], [144.79, 99.87],
            [151.1, 99.87], [157.49, 99.87], [163.91, 99.87], [170.37, 99.87],
            [175.79, 99.87], [182.09, 99.87]
        ],
        'street' => [
            [49.81, 106.74], [56.66, 106.74], [63.2, 106.74], [69.21, 106.74],
            [75.42, 106.74], [81.62, 106.74], [87.65, 106.74], [94.05, 106.74],
            [100.27, 106.74], [105.6, 106.74], [111.81, 106.74], [117.91, 106.74],
            [123.67, 106.74], [130.96, 106.74], [137.87, 106.74], [144.26, 106.74],
            [150.55, 106.74], [156.92, 106.74], [163.31, 106.74], [169.75, 106.74],
            [175.16, 106.74], [181.44, 106.74]
        ],
        'landmark' => [
            [49.81, 113.44], [56.66, 113.44], [63.2, 113.44], [69.21, 113.44],
            [75.42, 113.44], [81.62, 113.44], [87.65, 113.44], [94.05, 113.44],
            [100.27, 113.44], [105.6, 113.44], [111.81, 113.44], [117.91, 113.44],
            [123.67, 113.44], [130.96, 113.44], [137.87, 113.44], [144.26, 113.44],
            [150.55, 113.44], [156.92, 113.44], [163.31, 113.44], [169.75, 113.44],
            [175.16, 113.44], [181.44, 113.44]
        ],
        'locality' => [
            [49.81, 120.71], [56.66, 120.71], [63.2, 120.71], [69.21, 120.71],
            [75.42, 120.71], [81.62, 120.71], [87.65, 120.71], [94.05, 120.71],
            [100.27, 120.71], [105.6, 120.71], [111.81, 120.71], [117.91, 120.71],
            [123.67, 120.71], [130.96, 120.71], [137.87, 120.71], [144.26, 120.71],
            [150.55, 120.71], [156.92, 120.71], [163.31, 120.71], [169.75, 120.71],
            [175.16, 120.71], [181.44, 120.71]
        ],
        'village_town' => [
            [49.81, 127.39], [56.66, 127.39], [63.2, 127.39], [69.21, 127.39],
            [75.42, 127.39], [81.62, 127.39], [87.65, 127.39], [94.05, 127.39],
            [100.27, 127.39], [105.6, 127.39], [111.81, 127.39], [117.91, 127.39],
            [123.67, 127.39], [130.96, 127.39], [137.87, 127.39], [144.26, 127.39],
            [150.55, 127.39], [156.92, 127.39], [163.31, 127.39], [169.75, 127.39],
            [175.16, 127.39], [181.44, 127.39]
        ],
        'post_office' => [
            [49.81, 135.27], [56.66, 135.27], [63.2, 135.27], [69.21, 135.27],
            [75.42, 135.27], [81.62, 135.27], [87.65, 135.27], [94.05, 135.27],
            [100.27, 135.27], [105.6, 135.27], [111.81, 135.27], [117.91, 135.27],
            [123.67, 135.27], [130.96, 135.27], [137.87, 135.27], [144.26, 135.27],
            [150.55, 135.27]
        ],
        'district' => [
            [49.81, 142.48], [56.66, 142.48], [63.2, 142.48], [69.21, 142.48],
            [75.42, 142.48], [81.62, 142.48], [87.65, 142.48], [94.05, 142.48],
            [100.27, 142.48], [105.6, 142.48], [111.81, 142.48], [117.91, 142.48],
            [123.67, 142.48], [130.96, 142.48], [137.87, 142.48], [144.26, 142.48],
            [150.55, 142.48]
        ],
        'state' => [
            [49.81, 150.02], [56.66, 150.02], [63.2, 150.02], [69.21, 150.02],
            [75.42, 150.02], [81.62, 150.02], [87.65, 150.02], [94.05, 150.02],
            [100.27, 150.02], [105.6, 150.02], [111.81, 150.02], [117.91, 150.02],
            [123.67, 150.02], [130.96, 150.02], [137.87, 150.02], [144.26, 150.02],
            [150.55, 150.02]
        ],
        'pin_code' => [
            [49.77, 164.63], [56.21, 164.63], [63.09, 164.63], [69.53, 164.63],
            [75.98, 164.63], [82.94, 164.63]
        ],
        'certifier_name' => [
            [49.81, 191.6], [56.66, 191.6], [63.2, 191.6], [69.21, 191.6],
            [75.42, 191.6], [81.62, 191.6], [87.65, 191.6], [94.05, 191.6],
            [100.27, 191.6], [105.6, 191.6], [111.81, 191.6], [117.91, 191.6],
            [123.67, 191.6], [130.96, 191.6], [137.87, 191.6], [144.26, 191.6],
            [150.55, 191.6], [156.92, 191.6], [163.31, 191.6], [169.75, 191.6],
            [175.16, 191.6], [181.44, 191.6]
        ],
        'certifier_designation' => [
            [49.81, 198.46], [56.66, 198.46], [63.2, 198.46], [69.21, 198.46],
            [75.42, 198.46], [81.62, 198.46], [87.65, 198.46], [94.05, 198.46],
            [100.27, 198.46], [105.6, 198.46], [111.81, 198.46], [117.91, 198.46],
            [123.67, 198.46], [130.96, 198.46], [137.87, 198.46], [144.26, 198.46],
            [150.55, 198.46], [156.92, 198.46], [163.31, 198.46], [169.75, 198.46],
            [175.16, 198.46], [181.44, 198.46]
        ],
        'certifier_address' => [
            [49.81, 205.45], [56.66, 205.45], [63.2, 205.45], [69.21, 205.45],
            [75.42, 205.45], [81.62, 205.45], [87.65, 205.45], [94.05, 205.45],
            [100.27, 205.45], [105.6, 205.45], [111.81, 205.45], [117.91, 205.45],
            [123.67, 205.45], [130.96, 205.45], [137.87, 205.45], [144.26, 205.45],
            [150.55, 205.45], [156.92, 205.45], [163.31, 205.45], [169.75, 205.45],
            [175.16, 205.45], [181.44, 205.45]
        ],
        'certifier_address2' => [
            [49.81, 212.38], [56.66, 212.38], [63.2, 212.38], [69.21, 212.38],
            [75.42, 212.38], [81.62, 212.38], [87.65, 212.38], [94.05, 212.38],
            [100.27, 212.38], [105.6, 212.38], [111.81, 212.38], [117.91, 212.38],
            [123.67, 212.38], [130.96, 212.38], [137.87, 212.38], [144.26, 212.38],
            [150.55, 212.38], [156.92, 212.38], [163.31, 212.38], [169.75, 212.38],
            [175.16, 212.38], [181.44, 212.38]
        ],
        'certifier_contact' => [
            [49.68, 219.98], [55.81, 219.98], [62.14, 219.98], [68.61, 219.98],
            [75.06, 219.98], [81.56, 219.98], [88.11, 219.98], [94.58, 219.98],
            [101.03, 219.98], [107.25, 219.98]
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

        // Font settings
        $pdf->SetFont('helvetica', 'B', 10);
        $pdf->SetTextColor(0, 0, 0);

        // Helper to fill boxed text
        $fillBoxes = function (array $coords, ?string $text, float $cellW = 5.0, float $cellH = 5.0) use ($pdf) {
            if (empty($text)) return;
            $text = strtoupper(trim((string)$text));
            $chars = str_split($text);
            foreach ($chars as $i => $char) {
                if (!isset($coords[$i])) break;
                $pdf->SetXY($coords[$i][0], $coords[$i][1]);
                $pdf->Cell($cellW, $cellH, $char, 0, 0, 'C');
            }
        };

        // 1. Date
        $formDate = $aadharUpdate->date ?: ($aadharUpdate->created_at ? $aadharUpdate->created_at->format('Y-m-d') : date('Y-m-d'));
        try {
            $dateObj = Carbon::parse($formDate);
            $day = $dateObj->format('d');
            $month = $dateObj->format('m');
            $year = $dateObj->format('Y');
        } catch (\Throwable $e) {
            $day = '01'; $month = '01'; $year = '2026';
        }
        $fillBoxes(self::$BOX_COORDINATES['date_day'], $day);
        $fillBoxes(self::$BOX_COORDINATES['date_month'], $month);
        $fillBoxes(self::$BOX_COORDINATES['date_year'], $year);

        // 2. Resident Details
        $fillBoxes(self::$BOX_COORDINATES['aadhar_number'], $aadharUpdate->aadhar_number);
        $fillBoxes(self::$BOX_COORDINATES['name'], $aadharUpdate->name);

        // 3. Address Details
        $fillBoxes(self::$BOX_COORDINATES['house_no'], $aadharUpdate->house_no ?: $aadharUpdate->c_o);
        $fillBoxes(self::$BOX_COORDINATES['street'], $aadharUpdate->street);
        $fillBoxes(self::$BOX_COORDINATES['landmark'], $aadharUpdate->landmark);
        $fillBoxes(self::$BOX_COORDINATES['locality'], $aadharUpdate->locality);
        $fillBoxes(self::$BOX_COORDINATES['village_town'], $aadharUpdate->village_town);
        $fillBoxes(self::$BOX_COORDINATES['post_office'], $aadharUpdate->post_office);
        $fillBoxes(self::$BOX_COORDINATES['district'], $aadharUpdate->district);
        $fillBoxes(self::$BOX_COORDINATES['state'], $aadharUpdate->state);
        $fillBoxes(self::$BOX_COORDINATES['pin_code'], $aadharUpdate->pin_code);

        // 4. Certifier Details
        $fillBoxes(self::$BOX_COORDINATES['certifier_name'], $aadharUpdate->certifier_name);
        $fillBoxes(self::$BOX_COORDINATES['certifier_designation'], $aadharUpdate->certifier_designation);
        $fillBoxes(self::$BOX_COORDINATES['certifier_address'], $aadharUpdate->certifier_address);
        $fillBoxes(self::$BOX_COORDINATES['certifier_address2'], $aadharUpdate->certifier_address2);
        $fillBoxes(self::$BOX_COORDINATES['certifier_contact'], $aadharUpdate->certifier_contact);

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
