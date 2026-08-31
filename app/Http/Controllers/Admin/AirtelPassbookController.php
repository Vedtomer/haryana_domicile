<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AirtelPassbook;
use App\Notifications\SystemAlert;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AirtelPassbookController extends Controller
{
    public function index()
    {
        $records = AirtelPassbook::query()->visibleTo(auth()->user())->latest()->paginate(10);

        return Inertia::render('Admin/AirtelPassbook/Index', [
            'records' => $records
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/AirtelPassbook/Create');
    }

    public function store(Request $request)
    {
        $service = $this->moduleService('airtel_passbook');

        if ($error = $this->serviceBlocker($service)) {
            return back()->withInput()->with('error', $error);
        }

        $data = $this->validated($request);
        $data['user_id'] = auth()->id();

        $record = AirtelPassbook::create($data);

        $this->chargeForService($service, $record->id, "Airtel Passbook #{$record->id}");

        SystemAlert::toAdmins(
            'New Airtel Passbook Request',
            auth()->user()->name . " requested an Airtel Passbook (#{$record->id}).",
            '/admin/airtel-passbook'
        );

        if ($request->boolean('save_and_create')) {
            return redirect()->route('admin.airtel-passbook.create')
                ->with('success', 'Airtel Passbook created successfully.' . $this->chargeNote($service));
        }

        return redirect()->route('admin.airtel-passbook.index')
            ->with('success', 'Airtel Passbook created successfully.' . $this->chargeNote($service));
    }

    public function edit(AirtelPassbook $airtelPassbook)
    {
        $this->authorizeOwner($airtelPassbook);

        return Inertia::render('Admin/AirtelPassbook/Edit', ['record' => $airtelPassbook]);
    }

    public function update(Request $request, AirtelPassbook $airtelPassbook)
    {
        $this->authorizeOwner($airtelPassbook);
        
        $data = $this->validated($request, $airtelPassbook->id);
        
        $airtelPassbook->update($data);

        return redirect()->route('admin.airtel-passbook.index')->with('success', 'Airtel Passbook updated successfully.');
    }

    public function destroy(AirtelPassbook $airtelPassbook)
    {
        $this->authorizeOwner($airtelPassbook);
        
        $airtelPassbook->delete();

        return redirect()->route('admin.airtel-passbook.index')->with('success', 'Airtel Passbook deleted successfully.');
    }

    public function print(AirtelPassbook $airtelPassbook)
    {
        $this->authorizeOwner($airtelPassbook);

        $pdfUrl = $this->generatePdfAndGetUrl($airtelPassbook);

        return redirect($pdfUrl);
    }

    private function generatePdfAndGetUrl(AirtelPassbook $record): string
    {
        $templatePath = base_path('passbook/airtel new.pdf');
        
        if (!file_exists($templatePath)) {
            throw new \Exception("Template PDF not found at $templatePath");
        }

        $pdf = new \setasign\Fpdi\Fpdi();
        $pdf->setSourceFile($templatePath);
        $tplId = $pdf->importPage(1);
        
        $pdf->AddPage();
        $pdf->useTemplate($tplId, 0, 0, 210); // Standard A4 Width 210mm

        $pdf->SetFont('Arial', 'B', 11);
        $pdf->SetTextColor(0, 0, 0);
        $pdf->SetFillColor(255, 255, 255);

        // Erase old values block on the right side
        // X = 100mm, Y = 80mm, W = 100mm, H = 150mm
        $pdf->Rect(100, 80, 100, 150, 'F');

        $coords = [
            'reference_number' => ['x' => 103, 'y' => 86.6],
            'uid_number'       => ['x' => 103, 'y' => 97.0],
            'account_number'   => ['x' => 103, 'y' => 107.0],
            'ifsc_code'        => ['x' => 103, 'y' => 117.3],
            'first_name'       => ['x' => 103, 'y' => 127.6],
            'last_name'        => ['x' => 103, 'y' => 138.0],
            'address'          => ['x' => 103, 'y' => 148.3],
            'nominee_name'     => ['x' => 103, 'y' => 168.6], // Notice gap for missing fields if any
            'nominee_relation' => ['x' => 103, 'y' => 179.0],
            'city'             => ['x' => 103, 'y' => 189.3],
            'gender'           => ['x' => 103, 'y' => 199.6],
            'mobile_number'    => ['x' => 103, 'y' => 210.0],
            'pin_code'         => ['x' => 103, 'y' => 220.0],
        ];

        foreach ($coords as $field => $c) {
            if (!empty($record->{$field})) {
                $pdf->SetXY($c['x'], $c['y'] - 4); // FPDF SetXY uses top-left, adjust baseline
                $pdf->Write(0, strtoupper($record->{$field}));
            }
        }

        $tempDir = storage_path('app/tmp');
        if (!file_exists($tempDir)) {
            mkdir($tempDir, 0755, true);
        }
        
        $pdfPath = $tempDir . '/airtel_passbook_' . $record->id . '.pdf';
        $pdf->Output('F', $pdfPath);

        $publicDir = public_path('tmp');
        if (!file_exists($publicDir)) {
            mkdir($publicDir, 0755, true);
        }
        $publicPath = public_path('tmp/airtel_passbook_' . $record->id . '.pdf');
        copy($pdfPath, $publicPath);

        return url('/tmp/airtel_passbook_' . $record->id . '.pdf') . '?t=' . time();
    }

    private function validated(Request $request, $id = null): array
    {
        $rules = [
            'reference_number' => 'nullable|string|max:255',
            'uid_number' => 'nullable|string|max:255',
            'account_number' => 'required|string|max:255',
            'ifsc_code' => 'required|string|max:255',
            'first_name' => 'required|string|max:255',
            'last_name' => 'nullable|string|max:255',
            'address' => 'required|string|max:255',
            'nominee_name' => 'nullable|string|max:255',
            'nominee_relation' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:255',
            'gender' => 'nullable|string|max:50',
            'mobile_number' => 'nullable|string|max:255',
            'pin_code' => 'nullable|string|max:255',
        ];

        return $request->validate($rules);
    }
}
