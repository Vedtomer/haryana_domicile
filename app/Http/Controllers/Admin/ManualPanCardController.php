<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ManualPanCard;
use App\Models\PdfCoordinate;
use Illuminate\Http\Request;
use Inertia\Inertia;
use setasign\Fpdi\Fpdi;
use Illuminate\Support\Facades\Storage;

class ManualPanCardController extends Controller
{
    public function index()
    {
        $records = ManualPanCard::with('user')
            ->when(!auth()->user()->isAdmin() && !auth()->user()->hasRole('super_admin'), function ($q) {
                $q->where('user_id', auth()->id());
            })
            ->latest()
            ->paginate(10);

        return Inertia::render('Admin/ManualPanCard/Index', [
            'records' => $records
        ]);
    }

    public function create()
    {
        $service = $this->moduleService('manual_pan_card');
        return Inertia::render('Admin/ManualPanCard/Create', [
            'blocker' => $this->serviceBlocker($service),
            'cost' => $service?->coin_cost ?? 0,
        ]);
    }

    public function store(Request $request)
    {
        $service = $this->moduleService('manual_pan_card');
        if ($blocker = $this->serviceBlocker($service)) {
            return back()->with('error', $blocker);
        }

        $request->validate([
            'pan_number' => 'required|string',
            'name' => 'required|string',
            'father_name' => 'required|string',
            'dob' => 'required|string',
            'photo' => 'required|image',
            'signature' => 'required|image',
        ]);

        $photoPath = $request->file('photo')->store('pan-docs', 'public');
        $signaturePath = $request->file('signature')->store('pan-docs', 'public');

        $record = ManualPanCard::create([
            'user_id' => auth()->id(),
            'pan_number' => $request->pan_number,
            'name' => $request->name,
            'father_name' => $request->father_name,
            'dob' => $request->dob,
            'photo_path' => $photoPath,
            'signature_path' => $signaturePath,
        ]);

        $this->chargeForService($service, $record->id, "Manual PAN Card ({$record->pan_number})");

        return redirect()->route('manual-pan-cards.index')->with('success', 'PAN Card generated successfully!' . $this->chargeNote($service));
    }

    public function print(ManualPanCard $manualPanCard)
    {
        $this->authorizeOwner($manualPanCard);

        $pdfUrl = $this->generatePdfAndGetUrl($manualPanCard);
        return redirect($pdfUrl);
    }

    private function generatePdfAndGetUrl(ManualPanCard $record): string
    {
        $imagePath = public_path('FILE/5.jpg');
        $fontPath = public_path('fonts/Typist.ttf'); // Using Typist, or we can use Helvetica but FPDF requires Arial/Helvetica built-in

        if (!file_exists($imagePath)) {
            throw new \Exception("Blank PAN template not found at $imagePath");
        }

        $pdf = new Fpdi();
        $pdf->AddPage('P', 'A4'); // Adjust orientation if needed
        $pdf->SetMargins(0, 0, 0);
        $pdf->SetAutoPageBreak(false);

        // Put image on entire page
        $pdf->Image($imagePath, 0, 0, 210, 297);

        // Fetch coordinates for page 5 (PAN Card)
        $coords = PdfCoordinate::where('page', 5)->get()->keyBy('field_name');

        // Function to draw text
        $drawText = function($key, $text) use ($pdf, $coords) {
            if (isset($coords[$key])) {
                $c = $coords[$key];
                $pdf->SetFont('Helvetica', 'B', $c->font_size > 0 ? $c->font_size / 3 : 12); // Approximate scale down from canvas to PDF
                // Adjust x,y from canvas space to PDF space. (A4 is 210mm wide)
                // Assuming canvas was ~800px wide, or image natural width. Let's scale it.
                // It's better to use exact FPDF coords or scale from image size.
                // We will implement standard scaling based on image size.
            }
        };

        // For simplicity, let's process the image using GD first, then wrap in PDF.
        // GD is much easier to scale because coordinates in DB map 1:1 to image pixels!
        return $this->generateViaGD($record, $imagePath, $coords);
    }

    private function generateViaGD(ManualPanCard $record, string $templatePath, $coords): string
    {
        $img = imagecreatefromjpeg($templatePath);
        if (!$img) {
            throw new \Exception("Could not load template image.");
        }

        $fontPath = public_path('fonts/Typist.ttf'); // Replace with Arial/Helvetica if needed
        $textColor = imagecolorallocate($img, 0, 0, 0);

        $drawText = function($key, $text) use ($img, $coords, $fontPath, $textColor) {
            if (isset($coords[$key]) && $coords[$key]->x > 0 && $coords[$key]->y > 0) {
                $c = $coords[$key];
                $fontSize = $c->font_size ?: 30;
                imagettftext($img, $fontSize, 0, $c->x, $c->y, $textColor, $fontPath, $text);
            }
        };

        // Draw Texts
        $drawText('pan_number', $record->pan_number);
        $drawText('name', strtoupper($record->name));
        $drawText('father_name', strtoupper($record->father_name));
        $drawText('dob', $record->dob);

        // Draw Images (Photo & Signature)
        $this->overlayImage($img, Storage::disk('public')->path($record->photo_path), $coords['photo'] ?? null, 150, 180); // Adjust size as needed
        $this->overlayImage($img, Storage::disk('public')->path($record->signature_path), $coords['signature'] ?? null, 250, 60);

        // Save to temporary file and output to PDF
        $tempImgPath = tempnam(sys_get_temp_dir(), 'pan_') . '.jpg';
        imagejpeg($img, $tempImgPath, 90);
        imagedestroy($img);

        // Now wrap in PDF
        $pdf = new Fpdi();
        // Calculate size in mm based on 300 DPI
        // 975px / 300 * 25.4 = 82.55mm
        // 615px / 300 * 25.4 = 52.07mm
        $pdf->AddPage('L', [82.55, 52.07]); 
        $pdf->Image($tempImgPath, 0, 0, 82.55, 52.07);

        $outputFilename = 'pan-card-' . $record->id . '.pdf';
        $outputPath = 'generated/' . $outputFilename;
        $pdf->Output('F', Storage::disk('public')->path($outputPath));

        @unlink($tempImgPath);

        return Storage::disk('public')->url($outputPath);
    }

    private function overlayImage($baseImg, $overlayPath, $coord, $targetW, $targetH)
    {
        if (!$coord || $coord->x == 0 || $coord->y == 0 || !file_exists($overlayPath)) {
            return;
        }

        $overlay = null;
        $ext = strtolower(pathinfo($overlayPath, PATHINFO_EXTENSION));
        if (in_array($ext, ['jpg', 'jpeg'])) {
            $overlay = imagecreatefromjpeg($overlayPath);
        } elseif ($ext == 'png') {
            $overlay = imagecreatefrompng($overlayPath);
        }

        if ($overlay) {
            $w = imagesx($overlay);
            $h = imagesy($overlay);
            
            // Resize and merge
            imagecopyresampled($baseImg, $overlay, $coord->x, $coord->y, 0, 0, $targetW, $targetH, $w, $h);
            imagedestroy($overlay);
        }
    }
}
