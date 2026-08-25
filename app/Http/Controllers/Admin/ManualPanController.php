<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use setasign\Fpdi\Fpdi;
use App\Models\ServiceRequest;
use Illuminate\Support\Facades\Storage;

class ManualPanController extends Controller
{
    public function create()
    {
        $service = $this->moduleService('pan-card-menual-pdf');
        
        // If not admin and not unlocked
        if (!auth()->user()->isAdmin() && !auth()->user()->hasRole('super_admin')) {
            if ($service && $service->is_premium && !$service->users()->where('user_id', auth()->id())->exists()) {
                return redirect()->route('dashboard')->with('error', 'Please unlock this premium service first.');
            }
        }

        return Inertia::render('Admin/ManualPan/Create', [
            'service' => $service,
        ]);
    }

    public function generate(Request $request)
    {
        $service = $this->moduleService('pan-card-menual-pdf');

        if ($error = $this->serviceBlocker($service)) {
            return back()->withInput()->with('error', $error);
        }

        $request->validate([
            'pan_number' => 'required|string|max:10',
            'name' => 'required|string|max:100',
            'father_name' => 'required|string|max:100',
            'dob' => 'required|string|max:20',
            'photo' => 'required|image|mimes:jpg,jpeg,png|max:2048',
            'signature' => 'required|image|mimes:jpg,jpeg,png|max:2048',
        ]);

        try {
            // Save uploaded images temporarily
            $photoPath = $request->file('photo')->store('temp', 'public');
            $sigPath = $request->file('signature')->store('temp', 'public');
            
            $fullPhotoPath = Storage::disk('public')->path($photoPath);
            $fullSigPath = Storage::disk('public')->path($sigPath);

            $pdf = new Fpdi('P', 'mm', 'A4');
            $pdf->AddPage();
            
            // Paths to templates
            $frontTemplate = public_path('images/pan/front.jpg');
            $backTemplate = public_path('images/pan/back.png');

            if (!file_exists($frontTemplate)) {
                return back()->with('error', 'Front template missing.');
            }

            // --- FRONT SIDE ---
            // Place front template (X, Y, Width, Height)
            // Assuming A4 width is 210mm. Let's make the card 86mm x 54mm (standard CR80 ID card size).
            // Actually Indian PAN is about 85.6mm x 54mm.
            $cardWidth = 85.6;
            $cardHeight = 54.0;
            
            // X and Y starting positions on the A4 page
            $startX = 20;
            $startY = 20;

            $pdf->Image($frontTemplate, $startX, $startY, $cardWidth, $cardHeight);

            // Set font for text
            $pdf->SetFont('Arial', 'B', 8);
            $pdf->SetTextColor(0, 0, 0);

            // Coordinates for Text (These are approximate and will need adjustment)
            // X and Y are absolute from top left of the A4 page. 
            // So we add $startX and $startY to the relative coordinates.
            
            // Name
            $pdf->SetXY($startX + 10, $startY + 20);
            $pdf->Cell(0, 0, strtoupper($request->name));

            // Father's Name
            $pdf->SetXY($startX + 10, $startY + 28);
            $pdf->Cell(0, 0, strtoupper($request->father_name));

            // DOB
            $pdf->SetXY($startX + 10, $startY + 36);
            $pdf->Cell(0, 0, $request->dob);

            // PAN Number
            $pdf->SetXY($startX + 10, $startY + 44);
            $pdf->Cell(0, 0, strtoupper($request->pan_number));

            // Place Photo
            // Approximate coordinates for photo on standard PAN
            $photoX = $startX + 65; 
            $photoY = $startY + 15;
            $photoW = 15;
            $photoH = 20;
            $pdf->Image($fullPhotoPath, $photoX, $photoY, $photoW, $photoH);

            // Place Signature
            // Approximate coordinates for signature
            $sigX = $startX + 65;
            $sigY = $startY + 36;
            $sigW = 15;
            $sigH = 8;
            $pdf->Image($fullSigPath, $sigX, $sigY, $sigW, $sigH);


            // --- BACK SIDE ---
            if (file_exists($backTemplate)) {
                $backY = $startY + $cardHeight + 10; // 10mm gap
                $pdf->Image($backTemplate, $startX, $backY, $cardWidth, $cardHeight);
            }

            // Output PDF to a temporary file
            $pdfName = 'PAN_Card_' . str_replace(' ', '_', $request->name) . '_' . time() . '.pdf';
            $outputPath = storage_path('app/public/temp/' . $pdfName);
            
            // Ensure temp directory exists
            if (!file_exists(storage_path('app/public/temp'))) {
                mkdir(storage_path('app/public/temp'), 0755, true);
            }

            $pdf->Output($outputPath, 'F');

            // Cleanup temp image files
            unlink($fullPhotoPath);
            unlink($fullSigPath);

            // Charge for service
            $this->chargeForService($service, null, "Manual PAN Generated: {$request->name}");

            // Return back with a success message and download URL
            return back()->with([
                'success' => 'PAN Card generated successfully!',
                'download_url' => route('admin.manual-pan.download', ['file' => $pdfName])
            ]);

        } catch (\Exception $e) {
            return back()->with('error', 'Error generating PDF: ' . $e->getMessage());
        }
    }

    public function download(Request $request)
    {
        $file = $request->query('file');
        if (!$file || !preg_match('/^PAN_Card_.*\.pdf$/', $file)) {
            abort(404);
        }

        $path = storage_path('app/public/temp/' . $file);
        
        if (!file_exists($path)) {
            abort(404, 'File not found or expired.');
        }

        return response()->download($path)->deleteFileAfterSend(true);
    }
}
