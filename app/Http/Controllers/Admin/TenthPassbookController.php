<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\TenthPassbook;
use App\Notifications\SystemAlert;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class TenthPassbookController extends Controller
{
    public function index()
    {
        $records = TenthPassbook::query()->visibleTo(auth()->user())->latest()->paginate(10);

        return Inertia::render('Admin/TenthPassbook/Index', [
            'records' => $records
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/TenthPassbook/Create');
    }

    public function store(Request $request)
    {
        $service = $this->moduleService('tenth_passbook');

        if ($error = $this->serviceBlocker($service)) {
            return back()->withInput()->with('error', $error);
        }

        $data = $this->validated($request);
        $data['user_id'] = auth()->id();

        if ($request->hasFile('image')) {
            $data['image_path'] = $request->file('image')->store('tenth_passbooks', 'public');
        }

        $record = TenthPassbook::create($data);

        $this->chargeForService($service, $record->id, "10th Passbook #{$record->id}");

        SystemAlert::toAdmins(
            'New 10th Passbook Request',
            auth()->user()->name . " requested a 10th Passbook (#{$record->id}).",
            '/admin/tenth-passbook'
        );

        if ($request->boolean('save_and_create')) {
            return redirect()->route('admin.tenth-passbook.create')
                ->with('success', '10th Passbook record created successfully.' . $this->chargeNote($service));
        }

        return redirect()->route('admin.tenth-passbook.index')
            ->with('success', '10th Passbook record created successfully.' . $this->chargeNote($service));
    }

    public function edit(TenthPassbook $tenthPassbook)
    {
        $this->authorizeOwner($tenthPassbook);

        return Inertia::render('Admin/TenthPassbook/Edit', ['record' => $tenthPassbook]);
    }

    public function update(Request $request, TenthPassbook $tenthPassbook)
    {
        $this->authorizeOwner($tenthPassbook);
        
        $data = $this->validated($request, $tenthPassbook->id);
        
        if ($request->hasFile('image')) {
            if ($tenthPassbook->image_path) {
                Storage::disk('public')->delete($tenthPassbook->image_path);
            }
            $data['image_path'] = $request->file('image')->store('tenth_passbooks', 'public');
        }

        $tenthPassbook->update($data);

        return redirect()->route('admin.tenth-passbook.index')->with('success', '10th Passbook record updated successfully.');
    }

    public function destroy(TenthPassbook $tenthPassbook)
    {
        $this->authorizeOwner($tenthPassbook);
        
        if ($tenthPassbook->image_path) {
            Storage::disk('public')->delete($tenthPassbook->image_path);
        }
        
        $tenthPassbook->delete();

        return redirect()->route('admin.tenth-passbook.index')->with('success', '10th Passbook record deleted successfully.');
    }

    public function print(TenthPassbook $tenthPassbook)
    {
        $this->authorizeOwner($tenthPassbook);

        $pdfUrl = $this->generatePdfAndGetUrl($tenthPassbook);

        return redirect($pdfUrl);
    }

    private function generatePdfAndGetUrl(TenthPassbook $record): string
    {
        $templatePath = base_path('passbook/10th.pdf');
        
        if (!file_exists($templatePath)) {
            throw new \Exception("Template PDF not found at $templatePath");
        }

        // Initialize FPDI
        $pdf = new \setasign\Fpdi\Fpdi();
        $pdf->setSourceFile($templatePath);
        $tplId = $pdf->importPage(1);
        
        $pdf->AddPage();
        $pdf->useTemplate($tplId, 0, 0, 210); // Assuming A4 (210x297mm)

        $pdf->SetFont('Arial', '', 12);
        $pdf->SetTextColor(0, 0, 0);

        // Adjust these coordinates! (X, Y) in mm
        $coords = [
            'name' => ['x' => 50, 'y' => 50],
            'father_name' => ['x' => 50, 'y' => 60],
            'mother_name' => ['x' => 50, 'y' => 70],
            'dob' => ['x' => 50, 'y' => 80],
        ];

        foreach ($coords as $field => $c) {
            if (!empty($record->{$field})) {
                $pdf->SetXY($c['x'], $c['y']);
                $pdf->Write(0, $record->{$field});
            }
        }

        // Handle Image
        if ($record->image_path) {
            $imagePath = storage_path('app/public/' . $record->image_path);
            if (file_exists($imagePath)) {
                // Adjust image coordinates and size! (X, Y, W, H)
                $pdf->Image($imagePath, 150, 40, 30, 40);
            }
        }

        // Save output
        $tempDir = storage_path('app/tmp');
        if (!file_exists($tempDir)) {
            mkdir($tempDir, 0755, true);
        }
        
        $pdfPath = $tempDir . '/tenth_passbook_' . $record->id . '.pdf';
        $pdf->Output('F', $pdfPath);

        // Copy to public directory for serving
        $publicDir = public_path('tmp');
        if (!file_exists($publicDir)) {
            mkdir($publicDir, 0755, true);
        }
        $publicPath = public_path('tmp/tenth_passbook_' . $record->id . '.pdf');
        copy($pdfPath, $publicPath);

        return url('/tmp/tenth_passbook_' . $record->id . '.pdf') . '?t=' . time();
    }

    private function validated(Request $request, $id = null): array
    {
        $rules = [
            'name' => 'required|string|max:255',
            'father_name' => 'required|string|max:255',
            'mother_name' => 'required|string|max:255',
            'dob' => 'required|string|max:255',
            'image' => $id ? 'nullable|image|mimes:jpeg,png,jpg|max:2048' : 'required|image|mimes:jpeg,png,jpg|max:2048',
        ];

        return $request->validate($rules);
    }
}
