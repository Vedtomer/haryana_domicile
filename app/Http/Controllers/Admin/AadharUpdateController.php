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
        $imagePath = public_path('aadhar_update/template-1.jpg');
        $fontPath = public_path('fonts/Typist.ttf');
        
        if (!file_exists($imagePath)) {
            throw new \Exception("Aadhar update template image not found at $imagePath");
        }
        if (!file_exists($fontPath)) {
            throw new \Exception("Font not found at $fontPath");
        }

        // Load image
        $image = imagecreatefromjpeg($imagePath);
        $color = imagecolorallocate($image, 20, 20, 150); // Dark blue/black handwritten look

        // --- HARDCODED COORDINATES (Tweak these to align text perfectly) ---
        $coords = [
            'aadhar_number' => ['x' => 1000, 'y' => 370, 'fontSize' => 35, 'spacing' => 75],
            'name' => ['x' => 450, 'y' => 600, 'fontSize' => 30],
            'c_o' => ['x' => 200, 'y' => 700, 'fontSize' => 30],
            'house_no' => ['x' => 200, 'y' => 750, 'fontSize' => 30],
            'street' => ['x' => 200, 'y' => 800, 'fontSize' => 30],
            'landmark' => ['x' => 200, 'y' => 850, 'fontSize' => 30],
            'locality' => ['x' => 200, 'y' => 900, 'fontSize' => 30],
            'village_town' => ['x' => 200, 'y' => 950, 'fontSize' => 30],
            'post_office' => ['x' => 1200, 'y' => 750, 'fontSize' => 30],
            'district' => ['x' => 1200, 'y' => 800, 'fontSize' => 30],
            'state' => ['x' => 1200, 'y' => 850, 'fontSize' => 30],
            'pin_code' => ['x' => 1200, 'y' => 950, 'fontSize' => 30, 'spacing' => 60],
            'dob' => ['x' => 1500, 'y' => 600, 'fontSize' => 30],
            
            // Certifier Details
            'certifier_name' => ['x' => 400, 'y' => 1800, 'fontSize' => 30],
            'certifier_designation' => ['x' => 400, 'y' => 1850, 'fontSize' => 30],
            'certifier_address' => ['x' => 400, 'y' => 1900, 'fontSize' => 30],
            'certifier_contact' => ['x' => 400, 'y' => 1950, 'fontSize' => 30],
        ];

        // Draw each field
        foreach ($coords as $field => $c) {
            $value = $record->{$field} ?? '';
            if (empty($value)) continue;

            if (isset($c['spacing'])) {
                // Draw as individual boxes (like Aadhar or Pincode)
                $this->fillNumberBoxesOnImage($image, $c['x'], $c['y'], $value, strlen($value), $fontPath, $c['fontSize'], $color, $c['spacing']);
            } else {
                // Draw as standard text
                imagettftext($image, $c['fontSize'], 0, $c['x'], $c['y'], $color, $fontPath, $value);
            }
        }

        // Save filled image to temp directory
        $tempDir = storage_path('app/tmp');
        if (!file_exists($tempDir)) {
            mkdir($tempDir, 0755, true);
        }
        $filledImagePath = $tempDir . "/aadhar_update_filled_{$record->id}.jpg";
        imagejpeg($image, $filledImagePath, 95);
        imagedestroy($image);

        // Create PDF from image using FPDI
        $pdf = new \setasign\Fpdi\Fpdi();
        $pdf->AddPage('P', 'A4');
        $pdf->Image($filledImagePath, 0, 0, 210, 297); // A4 size in mm

        $pdfPath = $tempDir . '/aadhar_update_' . $record->id . '.pdf';
        $pdf->Output('F', $pdfPath);

        // Copy to public for serving
        $publicDir = public_path('tmp');
        if (!file_exists($publicDir)) {
            mkdir($publicDir, 0755, true);
        }
        $publicPath = public_path('tmp/aadhar_update_' . $record->id . '.pdf');
        copy($pdfPath, $publicPath);

        return url('/tmp/aadhar_update_' . $record->id . '.pdf') . '?t=' . time();
    }

    private function fillNumberBoxesOnImage($image, $startX, $y, $number, $count, $fontPath, $fontSize, $color, $spacing = 32)
    {
        $number = str_pad($number, $count, ' ', STR_PAD_RIGHT);
        $chars = str_split($number);

        for ($i = 0; $i < $count; $i++) {
            $x = $startX + ($i * $spacing);
            imagettftext($image, $fontSize, 0, $x + 8, $y, $color, $fontPath, $chars[$i] ?? '');
        }
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
