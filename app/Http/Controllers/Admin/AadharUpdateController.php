<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AadharUpdate;
use App\Models\PdfCoordinate;
use App\Notifications\SystemAlert;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AadharUpdateController extends Controller
{
    public function index()
    {
        $records = AadharUpdate::query()->visibleTo(auth()->user())->latest()->paginate(10);

        return Inertia::render('Admin/AadharUpdate/Index', [
            'records' => $records
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/AadharUpdate/Create');
    }

    public function store(Request $request)
    {
        $service = $this->moduleService('aadhar_update');

        if ($error = $this->serviceBlocker($service)) {
            return back()->withInput()->with('error', $error);
        }

        $data = $this->validated($request);
        $data['user_id'] = auth()->id();
        $record = AadharUpdate::create($data);

        $this->chargeForService($service, $record->id, "Aadhar Update #{$record->id}");

        SystemAlert::toAdmins(
            'New Aadhar Update Request',
            auth()->user()->name . " requested an Aadhar Update form (#{$record->id}).",
            '/admin/aadhar-update'
        );

        if ($request->boolean('save_and_create')) {
            return redirect()->route('admin.aadhar-update.create')
            ->with('success', 'Aadhar Update record created successfully.' . $this->chargeNote($service));
        }

        return redirect()->route('admin.aadhar-update.index')
            ->with('success', 'Aadhar Update record created successfully.' . $this->chargeNote($service));
    }

    public function edit(AadharUpdate $aadharUpdate)
    {
        $this->authorizeOwner($aadharUpdate);

        return Inertia::render('Admin/AadharUpdate/Edit', ['record' => $aadharUpdate]);
    }

    public function update(Request $request, AadharUpdate $aadharUpdate)
    {
        $this->authorizeOwner($aadharUpdate);
        $aadharUpdate->update($this->validated($request));

        return redirect()->route('admin.aadhar-update.index')->with('success', 'Aadhar Update record updated successfully.');
    }

    public function destroy(AadharUpdate $aadharUpdate)
    {
        $this->authorizeOwner($aadharUpdate);
        $aadharUpdate->delete();

        return redirect()->route('admin.aadhar-update.index')->with('success', 'Aadhar Update record deleted successfully.');
    }

    public function print(AadharUpdate $aadharUpdate)
    {
        $this->authorizeOwner($aadharUpdate);

        $pdfUrl = $this->generatePdfAndGetUrl($aadharUpdate);

        return redirect($pdfUrl);
    }

    private function generatePdfAndGetUrl(AadharUpdate $record): string
    {
        // For now, returning a placeholder or a very basic generated PDF
        // Since we don't have the template yet, I will use FPDF to generate a simple text PDF
        $tempDir = storage_path('app/tmp');
        if (!file_exists($tempDir)) {
            mkdir($tempDir, 0755, true);
        }
        
        $pdf = new \setasign\Fpdi\Fpdi();
        $pdf->AddPage();
        
        // Use standard font for placeholder
        $pdf->SetFont('Helvetica', 'B', 16);
        $pdf->Cell(0, 10, 'Aadhar Update Form (Placeholder)', 0, 1, 'C');
        
        $pdf->SetFont('Helvetica', '', 12);
        $pdf->Cell(0, 10, "Aadhar Number: " . $record->aadhar_number, 0, 1);
        $pdf->Cell(0, 10, "Name: " . $record->name, 0, 1);
        $pdf->Cell(0, 10, "Address: " . $record->house_no . ', ' . $record->village_town, 0, 1);
        
        $pdfPath = $tempDir . '/aadhar_update_' . $record->id . '.pdf';
        $pdf->Output('F', $pdfPath);

        // Copy to public for serving
        $publicPath = public_path('tmp/aadhar_update_' . $record->id . '.pdf');
        $publicDir = public_path('tmp');
        if (!file_exists($publicDir)) {
            mkdir($publicDir, 0755, true);
        }
        copy($pdfPath, $publicPath);

        return url('/tmp/aadhar_update_' . $record->id . '.pdf') . '?t=' . time();
    }

    private function validated(Request $request): array
    {
        return $request->validate([
            'aadhar_number' => 'required|string|max:12',
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
            'pin_code' => 'required|string|max:6',
            'dob' => 'nullable|date',
            'certifier_name' => 'nullable|string|max:255',
            'certifier_designation' => 'nullable|string|max:255',
            'certifier_address' => 'nullable|string',
            'certifier_contact' => 'nullable|string|max:20',
        ]);
    }
}
