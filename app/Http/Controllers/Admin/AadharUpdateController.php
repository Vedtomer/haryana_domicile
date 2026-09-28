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
    public static array $BOX_COORDINATES = [
        "date" => [
            [143.44, 52.33, 5.42, 5.59], [148.86, 52.33, 5.42, 5.59], [158.09, 52.33, 5.42, 5.59], [163.51, 52.33, 5.33, 5.59],
            [172.49, 52.33, 5.42, 5.59], [177.91, 52.33, 5.33, 5.59], [183.24, 52.33, 5.42, 5.59], [188.66, 52.33, 5.42, 5.59],
        ],
        "aadhar_number" => [
            [48.44, 78.5, 6.35, 5.33], [54.79, 78.5, 6.27, 5.33], [61.05, 78.5, 6.35, 5.33], [67.4, 78.5, 6.27, 5.33],
            [73.67, 78.5, 6.35, 5.33], [80.02, 78.5, 6.27, 5.33], [86.29, 78.5, 6.35, 5.33], [92.64, 78.5, 6.27, 5.33],
            [98.9, 78.5, 6.35, 5.33], [105.25, 78.5, 6.27, 5.33], [111.52, 78.5, 6.35, 5.33], [117.87, 78.5, 6.27, 5.33],
        ],
        "name" => [
            [48.44, 85.52, 6.26, 5.33], [54.7, 85.52, 6.27, 5.33], [60.97, 85.52, 6.18, 5.33], [67.15, 85.52, 6.27, 5.33],
            [73.42, 85.52, 6.18, 5.33], [79.6, 85.52, 6.26, 5.33], [85.86, 85.52, 6.27, 5.33], [92.13, 85.52, 6.18, 5.33],
            [98.31, 85.52, 6.27, 5.33], [104.58, 85.52, 6.26, 5.33], [110.84, 85.52, 6.18, 5.33], [117.02, 85.52, 6.27, 5.33],
            [123.29, 85.52, 6.27, 5.33], [129.56, 85.52, 6.18, 5.33], [135.74, 85.52, 6.26, 5.33], [142.0, 85.52, 6.27, 5.33],
            [148.27, 85.52, 6.18, 5.33], [154.45, 85.52, 6.27, 5.33], [160.72, 85.52, 6.18, 5.33], [166.9, 85.52, 6.27, 5.33],
            [173.17, 85.52, 6.26, 5.33], [179.43, 85.52, 6.18, 5.33],
        ],
        "house_no" => [
            [48.44, 92.81, 6.26, 5.33], [54.7, 92.81, 6.27, 5.33], [60.97, 92.81, 6.18, 5.33], [67.15, 92.81, 6.27, 5.33],
            [73.42, 92.81, 6.18, 5.33], [79.6, 92.81, 6.26, 5.33], [85.86, 92.81, 6.27, 5.33], [92.13, 92.81, 6.18, 5.33],
            [98.31, 92.81, 6.27, 5.33], [104.58, 92.81, 6.26, 5.33], [110.84, 92.81, 6.18, 5.33], [117.02, 92.81, 6.27, 5.33],
            [123.29, 92.81, 6.27, 5.33], [129.56, 92.81, 6.18, 5.33], [135.74, 92.81, 6.26, 5.33], [142.0, 92.81, 6.27, 5.33],
            [148.27, 92.81, 6.18, 5.33], [154.45, 92.81, 6.27, 5.33], [160.72, 92.81, 6.18, 5.33], [166.9, 92.81, 6.27, 5.33],
            [173.17, 92.81, 6.26, 5.33], [179.43, 92.81, 6.18, 5.33],
        ],
        "street" => [
            [48.44, 99.7, 6.26, 5.33], [54.7, 99.7, 6.27, 5.33], [60.97, 99.7, 6.18, 5.33], [67.15, 99.7, 6.27, 5.33],
            [73.42, 99.7, 6.18, 5.33], [79.6, 99.7, 6.26, 5.33], [85.86, 99.7, 6.27, 5.33], [92.13, 99.7, 6.18, 5.33],
            [98.31, 99.7, 6.27, 5.33], [104.58, 99.7, 6.26, 5.33], [110.84, 99.7, 6.18, 5.33], [117.02, 99.7, 6.27, 5.33],
            [123.29, 99.7, 6.27, 5.33], [129.56, 99.7, 6.18, 5.33], [135.74, 99.7, 6.26, 5.33], [142.0, 99.7, 6.27, 5.33],
            [148.27, 99.7, 6.18, 5.33], [154.45, 99.7, 6.27, 5.33], [160.72, 99.7, 6.18, 5.33], [166.9, 99.7, 6.27, 5.33],
            [173.17, 99.7, 6.26, 5.33], [179.43, 99.7, 6.18, 5.33],
        ],
        "landmark" => [
            [48.44, 106.55, 6.26, 5.33], [54.7, 106.55, 6.27, 5.33], [60.97, 106.55, 6.18, 5.33], [67.15, 106.55, 6.27, 5.33],
            [73.42, 106.55, 6.18, 5.33], [79.6, 106.55, 6.26, 5.33], [85.86, 106.55, 6.27, 5.33], [92.13, 106.55, 6.18, 5.33],
            [98.31, 106.55, 6.27, 5.33], [104.58, 106.55, 6.26, 5.33], [110.84, 106.55, 6.18, 5.33], [117.02, 106.55, 6.27, 5.33],
            [123.29, 106.55, 6.27, 5.33], [129.56, 106.55, 6.18, 5.33], [135.74, 106.55, 6.26, 5.33], [142.0, 106.55, 6.27, 5.33],
            [148.27, 106.55, 6.18, 5.33], [154.45, 106.55, 6.27, 5.33], [160.72, 106.55, 6.18, 5.33], [166.9, 106.55, 6.27, 5.33],
            [173.17, 106.55, 6.26, 5.33], [179.43, 106.55, 6.18, 5.33],
        ],
        "locality" => [
            [48.44, 113.54, 6.26, 5.33], [54.7, 113.54, 6.27, 5.33], [60.97, 113.54, 6.18, 5.33], [67.15, 113.54, 6.27, 5.33],
            [73.42, 113.54, 6.18, 5.33], [79.6, 113.54, 6.26, 5.33], [85.86, 113.54, 6.27, 5.33], [92.13, 113.54, 6.18, 5.33],
            [98.31, 113.54, 6.27, 5.33], [104.58, 113.54, 6.26, 5.33], [110.84, 113.54, 6.18, 5.33], [117.02, 113.54, 6.27, 5.33],
            [123.29, 113.54, 6.27, 5.33], [129.56, 113.54, 6.18, 5.33], [135.74, 113.54, 6.26, 5.33], [142.0, 113.54, 6.27, 5.33],
            [148.27, 113.54, 6.18, 5.33], [154.45, 113.54, 6.27, 5.33], [160.72, 113.54, 6.18, 5.33], [166.9, 113.54, 6.27, 5.33],
            [173.17, 113.54, 6.26, 5.33], [179.43, 113.54, 6.18, 5.33],
        ],
        "village_town" => [
            [48.44, 120.67, 6.26, 5.33], [54.7, 120.67, 6.27, 5.33], [60.97, 120.67, 6.18, 5.33], [67.15, 120.67, 6.27, 5.33],
            [73.42, 120.67, 6.18, 5.33], [79.6, 120.67, 6.26, 5.33], [85.86, 120.67, 6.27, 5.33], [92.13, 120.67, 6.18, 5.33],
            [98.31, 120.67, 6.27, 5.33], [104.58, 120.67, 6.26, 5.33], [110.84, 120.67, 6.18, 5.33], [117.02, 120.67, 6.27, 5.33],
            [123.29, 120.67, 6.27, 5.33], [129.56, 120.67, 6.18, 5.33], [135.74, 120.67, 6.26, 5.33], [142.0, 120.67, 6.27, 5.33],
            [148.27, 120.67, 6.18, 5.33], [154.45, 120.67, 6.27, 5.33], [160.72, 120.67, 6.18, 5.33], [166.9, 120.67, 6.27, 5.33],
            [173.17, 120.67, 6.26, 5.33], [179.43, 120.67, 6.18, 5.33],
        ],
        "post_office" => [
            [48.44, 127.38, 6.26, 5.33], [54.7, 127.38, 6.27, 5.33], [60.97, 127.38, 6.18, 5.33], [67.15, 127.38, 6.27, 5.33],
            [73.42, 127.38, 6.18, 5.33], [79.6, 127.38, 6.26, 5.33], [85.86, 127.38, 6.27, 5.33], [92.13, 127.38, 6.18, 5.33],
            [98.31, 127.38, 6.27, 5.33], [104.58, 127.38, 6.26, 5.33], [110.84, 127.38, 6.18, 5.33], [117.02, 127.38, 6.27, 5.33],
            [123.29, 127.38, 6.27, 5.33], [129.56, 127.38, 6.18, 5.33], [135.74, 127.38, 6.26, 5.33], [142.0, 127.38, 6.27, 5.33],
            [148.27, 127.38, 6.18, 5.33],
        ],
        "district" => [
            [48.44, 135.15, 6.26, 5.33], [54.7, 135.15, 6.27, 5.33], [60.97, 135.15, 6.18, 5.33], [67.15, 135.15, 6.27, 5.33],
            [73.42, 135.15, 6.18, 5.33], [79.6, 135.15, 6.26, 5.33], [85.86, 135.15, 6.27, 5.33], [92.13, 135.15, 6.18, 5.33],
            [98.31, 135.15, 6.27, 5.33], [104.58, 135.15, 6.26, 5.33], [110.84, 135.15, 6.18, 5.33], [117.02, 135.15, 6.27, 5.33],
            [123.29, 135.15, 6.27, 5.33], [129.56, 135.15, 6.18, 5.33], [135.74, 135.15, 6.26, 5.33], [142.0, 135.15, 6.27, 5.33],
            [148.27, 135.15, 6.18, 5.33],
        ],
        "state" => [
            [48.44, 142.51, 6.26, 5.42], [54.7, 142.51, 6.27, 5.42], [60.97, 142.51, 6.18, 5.42], [67.15, 142.51, 6.27, 5.42],
            [73.42, 142.51, 6.18, 5.42], [79.6, 142.51, 6.26, 5.42], [85.86, 142.51, 6.27, 5.42], [92.13, 142.51, 6.18, 5.42],
            [98.31, 142.51, 6.27, 5.42], [104.58, 142.51, 6.26, 5.42], [110.84, 142.51, 6.18, 5.42], [117.02, 142.51, 6.27, 5.42],
            [123.29, 142.51, 6.27, 5.42], [129.56, 142.51, 6.18, 5.42], [135.74, 142.51, 6.26, 5.42], [142.0, 142.51, 6.27, 5.42],
            [148.27, 142.51, 6.18, 5.42],
        ],
        "pin_code" => [
            [48.44, 149.99, 6.26, 5.33], [54.7, 149.99, 6.27, 5.33], [60.97, 149.99, 6.18, 5.33], [67.15, 149.99, 6.27, 5.33],
            [73.42, 149.99, 6.18, 5.33], [79.6, 149.99, 6.26, 5.33],
        ],
        "certifier_name" => [
            [48.35, 191.54, 6.27, 5.33], [54.62, 191.54, 6.27, 5.33], [60.89, 191.54, 6.18, 5.33], [67.07, 191.54, 6.27, 5.33],
            [73.34, 191.54, 6.18, 5.33], [79.52, 191.54, 6.27, 5.33], [85.79, 191.54, 6.26, 5.33], [92.05, 191.54, 6.18, 5.33],
            [98.23, 191.54, 6.27, 5.33], [104.5, 191.54, 6.27, 5.33], [110.77, 191.54, 6.18, 5.33], [116.95, 191.54, 6.26, 5.33],
            [123.21, 191.54, 6.27, 5.33], [129.48, 191.54, 6.18, 5.33], [135.66, 191.54, 6.27, 5.33], [141.93, 191.54, 6.27, 5.33],
            [148.2, 191.54, 6.18, 5.33], [154.38, 191.54, 6.26, 5.33], [160.64, 191.54, 6.18, 5.33], [166.82, 191.54, 6.27, 5.33],
            [173.09, 191.54, 6.27, 5.33], [179.36, 191.54, 6.18, 5.33],
        ],
        "certifier_designation" => [
            [48.35, 198.48, 6.27, 5.33], [54.62, 198.48, 6.27, 5.33], [60.89, 198.48, 6.18, 5.33], [67.07, 198.48, 6.27, 5.33],
            [73.34, 198.48, 6.18, 5.33], [79.52, 198.48, 6.27, 5.33], [85.79, 198.48, 6.26, 5.33], [92.05, 198.48, 6.18, 5.33],
            [98.23, 198.48, 6.27, 5.33], [104.5, 198.48, 6.27, 5.33], [110.77, 198.48, 6.18, 5.33], [116.95, 198.48, 6.26, 5.33],
            [123.21, 198.48, 6.27, 5.33], [129.48, 198.48, 6.18, 5.33], [135.66, 198.48, 6.27, 5.33], [141.93, 198.48, 6.27, 5.33],
            [148.2, 198.48, 6.18, 5.33], [154.38, 198.48, 6.26, 5.33], [160.64, 198.48, 6.18, 5.33], [166.82, 198.48, 6.27, 5.33],
            [173.09, 198.48, 6.27, 5.33], [179.36, 198.48, 6.18, 5.33],
        ],
        "certifier_address" => [
            [48.35, 205.43, 6.27, 5.33], [54.62, 205.43, 6.27, 5.33], [60.89, 205.43, 6.18, 5.33], [67.07, 205.43, 6.27, 5.33],
            [73.34, 205.43, 6.18, 5.33], [79.52, 205.43, 6.27, 5.33], [85.79, 205.43, 6.26, 5.33], [92.05, 205.43, 6.18, 5.33],
            [98.23, 205.43, 6.27, 5.33], [104.5, 205.43, 6.27, 5.33], [110.77, 205.43, 6.18, 5.33], [116.95, 205.43, 6.26, 5.33],
            [123.21, 205.43, 6.27, 5.33], [129.48, 205.43, 6.18, 5.33], [135.66, 205.43, 6.27, 5.33], [141.93, 205.43, 6.27, 5.33],
            [148.2, 205.43, 6.18, 5.33], [154.38, 205.43, 6.26, 5.33], [160.64, 205.43, 6.18, 5.33], [166.82, 205.43, 6.27, 5.33],
            [173.09, 205.43, 6.27, 5.33], [179.36, 205.43, 6.18, 5.33],
        ],
        "certifier_address2" => [
            [48.35, 212.46, 6.27, 5.33], [54.62, 212.46, 6.27, 5.33], [60.89, 212.46, 6.18, 5.33], [67.07, 212.46, 6.27, 5.33],
            [73.34, 212.46, 6.18, 5.33], [79.52, 212.46, 6.27, 5.33], [85.79, 212.46, 6.26, 5.33], [92.05, 212.46, 6.18, 5.33],
            [98.23, 212.46, 6.27, 5.33], [104.5, 212.46, 6.27, 5.33], [110.77, 212.46, 6.18, 5.33], [116.95, 212.46, 6.26, 5.33],
            [123.21, 212.46, 6.27, 5.33], [129.48, 212.46, 6.18, 5.33], [135.66, 212.46, 6.27, 5.33], [141.93, 212.46, 6.27, 5.33],
            [148.2, 212.46, 6.18, 5.33], [154.38, 212.46, 6.26, 5.33], [160.64, 212.46, 6.18, 5.33], [166.82, 212.46, 6.27, 5.33],
            [173.09, 212.46, 6.27, 5.33], [179.36, 212.46, 6.18, 5.33],
        ],
        "certifier_contact" => [
            [48.35, 219.4, 6.27, 5.33], [54.62, 219.4, 6.27, 5.33], [60.89, 219.4, 6.18, 5.33], [67.07, 219.4, 6.27, 5.33],
            [73.34, 219.4, 6.18, 5.33], [79.52, 219.4, 6.27, 5.33], [85.79, 219.4, 6.26, 5.33], [92.05, 219.4, 6.18, 5.33],
            [98.23, 219.4, 6.27, 5.33], [104.5, 219.4, 6.27, 5.33],
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
        $pdf->setPrintHeader(false);
        $pdf->setPrintFooter(false);
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

        // Helper to fill boxed text centered within exact [x, y, w, h] box bounds
        $fillBoxes = function (array $coords, ?string $text, string $font, float $fontSize) use ($pdf) {
            if (empty($text)) return;
            $pdf->SetFont($font, '', $fontSize);
            $text = strtoupper(trim((string)$text));
            $chars = str_split($text);
            foreach ($chars as $i => $char) {
                if (!isset($coords[$i])) break;
                [$x, $y, $w, $h] = $coords[$i];
                $pdf->SetXY($x, $y);
                $pdf->Cell($w, $h, $char, 0, 0, 'C');
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
        $fillBoxes(self::$BOX_COORDINATES['date'], $dateStr, $scriptFont, 14);

        // 2. Aadhaar Number (12 boxes)
        $fillBoxes(self::$BOX_COORDINATES['aadhar_number'], $aadharUpdate->aadhar_number, $scriptFont, 14);

        // 3. Name & Address Lines (22 boxes each)
        $fillBoxes(self::$BOX_COORDINATES['name'], $aadharUpdate->name, $scriptFont, 10);
        $fillBoxes(self::$BOX_COORDINATES['house_no'], $aadharUpdate->house_no ?: $aadharUpdate->c_o, $scriptFont, 10);
        $fillBoxes(self::$BOX_COORDINATES['street'], $aadharUpdate->street, $scriptFont, 10);
        $fillBoxes(self::$BOX_COORDINATES['landmark'], $aadharUpdate->landmark, $scriptFont, 10);
        $fillBoxes(self::$BOX_COORDINATES['locality'], $aadharUpdate->locality, $scriptFont, 10);
        $fillBoxes(self::$BOX_COORDINATES['village_town'], $aadharUpdate->village_town, $scriptFont, 10);

        // 17 boxes fields
        $fillBoxes(self::$BOX_COORDINATES['post_office'], $aadharUpdate->post_office, $scriptFont, 10);
        $fillBoxes(self::$BOX_COORDINATES['district'], $aadharUpdate->district, $scriptFont, 10);
        $fillBoxes(self::$BOX_COORDINATES['state'], $aadharUpdate->state, $scriptFont, 10);

        // PIN Code (6 boxes)
        $fillBoxes(self::$BOX_COORDINATES['pin_code'], $aadharUpdate->pin_code, $scriptFont, 13);

        // 4. Certifier Details
        $fillBoxes(self::$BOX_COORDINATES['certifier_name'], $aadharUpdate->certifier_name, $scriptFont, 10);
        $fillBoxes(self::$BOX_COORDINATES['certifier_designation'], $aadharUpdate->certifier_designation, $scriptFont, 10);
        $fillBoxes(self::$BOX_COORDINATES['certifier_address'], $aadharUpdate->certifier_address, $scriptFont, 10);
        $fillBoxes(self::$BOX_COORDINATES['certifier_address2'], $aadharUpdate->certifier_address2, $scriptFont, 10);

        // Contact Number (10 boxes)
        $fillBoxes(self::$BOX_COORDINATES['certifier_contact'], $aadharUpdate->certifier_contact, $scriptFont, 11);

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
