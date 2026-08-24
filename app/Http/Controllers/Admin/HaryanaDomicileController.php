<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\HaryanaDomicile;
use App\Models\PdfCoordinate;
use Illuminate\Http\Request;
use Inertia\Inertia;

class HaryanaDomicileController extends Controller
{
    public function index()
    {
        $records = HaryanaDomicile::query()->visibleTo(auth()->user())->latest()->paginate(10);

        return Inertia::render('Admin/HaryanaDomicile/Index', [
            'records' => $records
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/HaryanaDomicile/Create');
    }

    public function store(Request $request)
    {
        $service = $this->moduleService('haryana_domicile');

        if ($error = $this->serviceBlocker($service)) {
            return back()->withInput()->with('error', $error);
        }

        $data = $this->validated($request);
        $data['user_id'] = auth()->id();
        $record = HaryanaDomicile::create($data);

        $this->chargeForService($service, $record->id, "Haryana Domicile #{$record->id}");

        if ($request->boolean('save_and_create')) {
            return redirect()->route('admin.haryana-domicile.create')
            ->with('success', 'Haryana Domicile record created successfully.' . $this->chargeNote($service));
        }

        return redirect()->route('admin.haryana-domicile.index')
            ->with('success', 'Haryana Domicile record created successfully.' . $this->chargeNote($service));
    }

    public function edit(HaryanaDomicile $haryanaDomicile)
    {
        $this->authorizeOwner($haryanaDomicile);

        return Inertia::render('Admin/HaryanaDomicile/Edit', ['record' => $haryanaDomicile]);
    }

    public function update(Request $request, HaryanaDomicile $haryanaDomicile)
    {
        $this->authorizeOwner($haryanaDomicile);
        $haryanaDomicile->update($this->validated($request));

        return redirect()->route('admin.haryana-domicile.index')->with('success', 'Haryana Domicile record updated successfully.');
    }

    public function destroy(HaryanaDomicile $haryanaDomicile)
    {
        $this->authorizeOwner($haryanaDomicile);
        $haryanaDomicile->delete();

        return redirect()->route('admin.haryana-domicile.index')->with('success', 'Haryana Domicile record deleted successfully.');
    }

    public function print(HaryanaDomicile $haryanaDomicile)
    {
        $this->authorizeOwner($haryanaDomicile);

        $pdfUrl = $this->generatePdfAndGetUrl($haryanaDomicile);

        return redirect($pdfUrl);
    }

    private function generatePdfAndGetUrl(HaryanaDomicile $record): string
    {
        $filledImages = [];

        // Font settings
        $fontPath = public_path('fonts/Typist.ttf');
        $defaultFontSize = 50;
        $boxFontSize = 50;

        // Process each page (1.jpg through 4.jpg)
        for ($page = 1; $page <= 4; $page++) {
            $imagePath = public_path("FILE/{$page}.jpg");

            if (!file_exists($imagePath)) continue;

            // Load image
            $image = imagecreatefromjpeg($imagePath);
            $black = imagecolorallocate($image, 0, 0, 0);

            // Load coordinates from database
            $dbCoords = PdfCoordinate::where('page', $page)->get();
            $coords = [];
            foreach ($dbCoords as $coord) {
                $coords[$coord->field_name] = [
                    'x' => $coord->x,
                    'y' => $coord->y,
                    'fontSize' => 40,
                    'spacing' => 90
                ];
            }

            // Fill data based on page
            if ($page == 1) {
                // Tehsil and District at top
                $c = $coords['tehsil_top'] ?? ['x' => 320, 'y' => 145, 'fontSize' => $defaultFontSize];
                imagettftext($image, $c['fontSize'], 0, $c['x'], $c['y'], $black, $fontPath, $record->tehsil);

                $c = $coords['district_top'] ?? ['x' => 550, 'y' => 145, 'fontSize' => $defaultFontSize];
                imagettftext($image, $c['fontSize'], 0, $c['x'], $c['y'], $black, $fontPath, $record->district);

                // Mobile number boxes
                $c = $coords['mobile_start'] ?? ['x' => 190, 'y' => 218, 'fontSize' => $boxFontSize, 'spacing' => 90];
                $spacing = $c['spacing'] ?? 90;
                $this->fillNumberBoxesOnImage($image, $c['x'], $c['y'], $record->mobile, 10, $fontPath, $c['fontSize'], $black, $spacing);

                // Aadhar number boxes
                $c = $coords['aadhar_start'] ?? ['x' => 190, 'y' => 258, 'fontSize' => $boxFontSize, 'spacing' => 90];
                $spacing = $c['spacing'] ?? 90;
                $this->fillNumberBoxesOnImage($image, $c['x'], $c['y'], $record->aadhar, 12, $fontPath, $c['fontSize'], $black, $spacing);

                // Name
                $c = $coords['name'] ?? ['x' => 80, 'y' => 365, 'fontSize' => $defaultFontSize];
                imagettftext($image, $c['fontSize'], 0, $c['x'], $c['y'], $black, $fontPath, $record->name);

                // Father name
                $c = $coords['father_name'] ?? ['x' => 600, 'y' => 365, 'fontSize' => $defaultFontSize];
                imagettftext($image, $c['fontSize'], 0, $c['x'], $c['y'], $black, $fontPath, $record->father_name);

                // Address (Village column)
                $c = $coords['address'] ?? ['x' => 120, 'y' => 400, 'fontSize' => $defaultFontSize];
                imagettftext($image, $c['fontSize'], 0, $c['x'], $c['y'], $black, $fontPath, $record->village);

                // Ward no
                $c = $coords['ward_no'] ?? ['x' => 520, 'y' => 400, 'fontSize' => $defaultFontSize];
                imagettftext($image, $c['fontSize'], 0, $c['x'], $c['y'], $black, $fontPath, $record->ward_no ?? '');

                // Age
                $c = $coords['age'] ?? ['x' => 680, 'y' => 400, 'fontSize' => $defaultFontSize];
                imagettftext($image, $c['fontSize'], 0, $c['x'], $c['y'], $black, $fontPath, $record->age);

                // Tehsil
                $c = $coords['tehsil'] ?? ['x' => 280, 'y' => 435, 'fontSize' => $defaultFontSize];
                imagettftext($image, $c['fontSize'], 0, $c['x'], $c['y'], $black, $fontPath, $record->tehsil);

                // District
                $c = $coords['district'] ?? ['x' => 550, 'y' => 435, 'fontSize' => $defaultFontSize];
                imagettftext($image, $c['fontSize'], 0, $c['x'], $c['y'], $black, $fontPath, $record->district);

                // Child name
                $c = $coords['child_name'] ?? ['x' => 420, 'y' => 545, 'fontSize' => $defaultFontSize];
                imagettftext($image, $c['fontSize'], 0, $c['x'], $c['y'], $black, $fontPath, $record->child_name ?? '');

                // Document box fields
                $c = $coords['doc_applicant_name'] ?? ['x' => 230, 'y' => 1050, 'fontSize' => $boxFontSize];
                imagettftext($image, $c['fontSize'], 0, $c['x'], $c['y'], $black, $fontPath, $record->name);

                $c = $coords['doc_father_name'] ?? ['x' => 550, 'y' => 1050, 'fontSize' => $boxFontSize];
                imagettftext($image, $c['fontSize'], 0, $c['x'], $c['y'], $black, $fontPath, $record->father_name);

                $c = $coords['doc_address'] ?? ['x' => 230, 'y' => 1080, 'fontSize' => $boxFontSize];
                imagettftext($image, $c['fontSize'], 0, $c['x'], $c['y'], $black, $fontPath, $record->village);

                $c = $coords['doc_ward'] ?? ['x' => 750, 'y' => 1080, 'fontSize' => $boxFontSize];
                imagettftext($image, $c['fontSize'], 0, $c['x'], $c['y'], $black, $fontPath, $record->ward_no);

                $c = $coords['doc_tehsil'] ?? ['x' => 230, 'y' => 1110, 'fontSize' => $boxFontSize];
                imagettftext($image, $c['fontSize'], 0, $c['x'], $c['y'], $black, $fontPath, $record->tehsil);

                $c = $coords['doc_district'] ?? ['x' => 550, 'y' => 1110, 'fontSize' => $boxFontSize];
                imagettftext($image, $c['fontSize'], 0, $c['x'], $c['y'], $black, $fontPath, $record->district);
            }

            // Fill data for Page 2
            if ($page == 2) {
                $c = $coords['name'] ?? ['x' => 300, 'y' => 250, 'fontSize' => $defaultFontSize];
                imagettftext($image, $c['fontSize'], 0, $c['x'], $c['y'], $black, $fontPath, $record->name);

                $c = $coords['father_name'] ?? ['x' => 800, 'y' => 250, 'fontSize' => $defaultFontSize];
                imagettftext($image, $c['fontSize'], 0, $c['x'], $c['y'], $black, $fontPath, $record->father_name);

                $c = $coords['age'] ?? ['x' => 380, 'y' => 300, 'fontSize' => $defaultFontSize];
                imagettftext($image, $c['fontSize'], 0, $c['x'], $c['y'], $black, $fontPath, $record->age);

                $c = $coords['caste'] ?? ['x' => 600, 'y' => 300, 'fontSize' => $defaultFontSize];
                imagettftext($image, $c['fontSize'], 0, $c['x'], $c['y'], $black, $fontPath, $record->caste);

                $c = $coords['religion'] ?? ['x' => 900, 'y' => 300, 'fontSize' => $defaultFontSize];
                imagettftext($image, $c['fontSize'], 0, $c['x'], $c['y'], $black, $fontPath, $record->religion ?? '');

                $c = $coords['address'] ?? ['x' => 350, 'y' => 350, 'fontSize' => $defaultFontSize];
                imagettftext($image, $c['fontSize'], 0, $c['x'], $c['y'], $black, $fontPath, $record->village);

                $c = $coords['ward_no'] ?? ['x' => 680, 'y' => 350, 'fontSize' => $defaultFontSize];
                imagettftext($image, $c['fontSize'], 0, $c['x'], $c['y'], $black, $fontPath, $record->ward_no ?? '');

                $c = $coords['tehsil'] ?? ['x' => 950, 'y' => 350, 'fontSize' => $defaultFontSize];
                imagettftext($image, $c['fontSize'], 0, $c['x'], $c['y'], $black, $fontPath, $record->tehsil);

                $c = $coords['district'] ?? ['x' => 350, 'y' => 400, 'fontSize' => $defaultFontSize];
                imagettftext($image, $c['fontSize'], 0, $c['x'], $c['y'], $black, $fontPath, $record->district);

                $c = $coords['ration_card_no'] ?? ['x' => 900, 'y' => 450, 'fontSize' => $defaultFontSize];
                imagettftext($image, $c['fontSize'], 0, $c['x'], $c['y'], $black, $fontPath, $record->ration_card_no ?? '');

                $c = $coords['aadhar_2'] ?? ['x' => 500, 'y' => 500, 'fontSize' => $defaultFontSize];
                imagettftext($image, $c['fontSize'], 0, $c['x'], $c['y'], $black, $fontPath, $record->aadhar);

                $c = $coords['age_2'] ?? ['x' => 400, 'y' => 550, 'fontSize' => $defaultFontSize];
                imagettftext($image, $c['fontSize'], 0, $c['x'], $c['y'], $black, $fontPath, $record->age);
            }

            // Fill data for Page 3
            if ($page == 3) {
                $c = $coords['name'] ?? ['x' => 450, 'y' => 250, 'fontSize' => $defaultFontSize];
                imagettftext($image, $c['fontSize'], 0, $c['x'], $c['y'], $black, $fontPath, $record->name);

                $c = $coords['father_name'] ?? ['x' => 750, 'y' => 250, 'fontSize' => $defaultFontSize];
                imagettftext($image, $c['fontSize'], 0, $c['x'], $c['y'], $black, $fontPath, $record->father_name);

                $c = $coords['age'] ?? ['x' => 150, 'y' => 300, 'fontSize' => $defaultFontSize];
                imagettftext($image, $c['fontSize'], 0, $c['x'], $c['y'], $black, $fontPath, $record->age);

                $c = $coords['address'] ?? ['x' => 400, 'y' => 300, 'fontSize' => $defaultFontSize];
                imagettftext($image, $c['fontSize'], 0, $c['x'], $c['y'], $black, $fontPath, $record->village);

                $c = $coords['ward_no'] ?? ['x' => 850, 'y' => 300, 'fontSize' => $defaultFontSize];
                imagettftext($image, $c['fontSize'], 0, $c['x'], $c['y'], $black, $fontPath, $record->ward_no ?? '');

                $c = $coords['tehsil'] ?? ['x' => 200, 'y' => 350, 'fontSize' => $defaultFontSize];
                imagettftext($image, $c['fontSize'], 0, $c['x'], $c['y'], $black, $fontPath, $record->tehsil);

                $c = $coords['district'] ?? ['x' => 450, 'y' => 350, 'fontSize' => $defaultFontSize];
                imagettftext($image, $c['fontSize'], 0, $c['x'], $c['y'], $black, $fontPath, $record->district);

                $c = $coords['child_name'] ?? ['x' => 500, 'y' => 400, 'fontSize' => $defaultFontSize];
                imagettftext($image, $c['fontSize'], 0, $c['x'], $c['y'], $black, $fontPath, $record->child_name ?? '');
            }

            // Save filled image to temp directory
            $tempDir = storage_path('app/tmp');
            if (!file_exists($tempDir)) {
                mkdir($tempDir, 0755, true);
            }
            $outputPath = $tempDir . "/FILE_filled_{$page}.jpg";
            imagejpeg($image, $outputPath, 95);
            imagedestroy($image);

            $filledImages[] = $outputPath;
        }

        // Create PDF from images using FPDI
        $pdf = new \setasign\Fpdi\Fpdi();

        foreach ($filledImages as $imagePath) {
            $pdf->AddPage('P', 'A4');
            $pdf->Image($imagePath, 0, 0, 210, 297); // A4 size in mm
        }

        $pdfPath = $tempDir . '/FILE_filled.pdf';
        $pdf->Output('F', $pdfPath);

        // Copy to public for serving
        $publicPath = public_path('tmp/FILE_filled.pdf');
        $publicDir = public_path('tmp');
        if (!file_exists($publicDir)) {
            mkdir($publicDir, 0755, true);
        }
        copy($pdfPath, $publicPath);

        return url('/tmp/FILE_filled.pdf') . '?t=' . time();
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
            'pincode' => 'nullable|string|max:6',
            'tehsil' => 'required|string|max:255',
            'district' => 'required|string|max:255',
            'name' => 'required|string|max:255',
            'father_name' => 'required|string',
            'village' => 'required|string|max:255',
            'ward_no' => 'nullable|string|max:255',
            'age' => 'nullable|numeric',
            'mobile' => 'required|string|max:10',
            'aadhar' => 'required|string|max:12',
            'ration_card_no' => 'nullable|string|max:255',
            'caste' => 'required|string|max:255',
            'religion' => 'nullable|string',
            'child_name' => 'nullable|string|max:255',
        ]);
    }
}
