<?php

namespace App\Filament\Pages;

use Filament\Pages\Page;
use Filament\Forms\Concerns\InteractsWithForms;
use Filament\Forms\Contracts\HasForms;
use Filament\Forms\Form;
use Filament\Forms;
use Illuminate\Support\Facades\Storage;

class AadharCardAddressForm extends Page implements HasForms
{
    use InteractsWithForms;

    protected static ?string $navigationIcon = 'heroicon-o-document-text';
    protected static ?string $navigationLabel = 'Aadhar Address Form';
    protected static ?string $title = 'Aadhar Card Address Update Form';

    protected static string $view = 'filament.pages.aadhar-card-address-form';

    public ?array $data = [];

    public function mount(): void
    {
        $this->form->fill();
    }

    public function form(Form $form): Form
    {
        return $form
            ->schema([
            Forms\Components\Section::make('General Information')
            ->columns([
                'sm' => 3,
            ])
            ->schema([
                Forms\Components\Select::make('resident_status')
                ->label('Resident Status')
                ->options([
                    'Resident' => 'Resident',
                    'Non-Resident Indian (NRI)' => 'Non-Resident Indian (NRI)',
                ])
                ->default('Resident')
                ->required(),
                Forms\Components\Select::make('request_type')
                ->label('Request Type')
                ->options([
                    'New Enrolment' => 'New Enrolment',
                    'Update Request' => 'Update Request',
                ])
                ->default('Update Request')
                ->required(),
                Forms\Components\DatePicker::make('date')
                ->label('Date')
                ->default(now())
                ->displayFormat('d/m/Y')
                ->required(),
            ]),

            Forms\Components\Section::make('Resident details')
            ->columns([
                'sm' => 2,
            ])
            ->schema([
                Forms\Components\TextInput::make('aadhaar_number')
                ->label('Aadhaar Number')
                ->numeric()
                ->minLength(12)
                ->maxLength(12)
                ->extraInputAttributes([
                    'maxlength' => 12,
                    'oninput' => "if (this.value.length > 12) this.value = this.value.slice(0, 12);"
                ])
                ->placeholder('12 digit Aadhaar number')
                ->required(),
                Forms\Components\TextInput::make('full_name')
                ->label('Full Name')
                ->required(),
                Forms\Components\Select::make('care_of_type')
                ->label('Care of Type (C/o, S/o)')
                ->options([
                    'C/O' => 'C/O',
                    'S/O' => 'S/O',
                    'W/O' => 'W/O',
                    'D/O' => 'D/O',
                ])
                ->default('C/O')
                ->required(),
                Forms\Components\TextInput::make('care_of')
                ->label('Relative Name')
                ->required(),
                Forms\Components\TextInput::make('house_no')
                ->label('House No./ Bldg./ Apt.'),
                Forms\Components\TextInput::make('street')
                ->label('Street/ Road/ Lane')
                ->required(),
                Forms\Components\TextInput::make('landmark')
                ->label('Landmark'),
                Forms\Components\TextInput::make('area')
                ->label('Area/ Locality/ Sector'),
                Forms\Components\TextInput::make('village')
                ->label('Village/ Town/ City'),
                Forms\Components\TextInput::make('post_office')
                ->label('Post Office'),
                Forms\Components\TextInput::make('district')
                ->label('District')
                ->required(),
                Forms\Components\TextInput::make('state')
                ->label('State')
                ->required(),
                Forms\Components\TextInput::make('pin_code')
                ->label('PIN Code')
                ->numeric()
                ->length(6)
                ->required(),
                Forms\Components\DatePicker::make('dob')
                ->label('Date of Birth')
                ->displayFormat('d/m/Y')
                ->required(),
            ]),

            Forms\Components\Section::make('Certifier Details')
            ->columns([
                'sm' => 2,
            ])
            ->schema([
                Forms\Components\TextInput::make('certifier_name')
                ->label('Name of the Certifier')
                ->required(),
                Forms\Components\TextInput::make('designation')
                ->label('Designation')
                ->required(),
                Forms\Components\TextInput::make('office_address')
                ->label('Office Address')
                ->required(),
                Forms\Components\TextInput::make('contact_number')
                ->label('Contact Number')
                ->numeric()
                ->required(),
                Forms\Components\Select::make('certifier_category')
                ->label('Certifier Category')
                ->options([
                    'Gazetted Officer - Group A' => 'Gazetted Officer - Group A',
                    'Village Panchayat Head or Mukhiya' => 'Village Panchayat Head or Mukhiya',
                    'Gazetted Officer - Group B' => 'Gazetted Officer - Group B',
                    'MP/ MLA/ MLC/ Muncipal Councilor' => 'MP/ MLA/ MLC/ Muncipal Councilor',
                    'Tehsildar' => 'Tehsildar',
                    'Head of Recognized Educational Institution' => 'Head of Recognized Educational Institution',
                    'Superintendent/ Warden/ Matron/ Head of Institution of recognized shelter homes/ Orphanages' => 'Superintendent/ Warden...',
                    'EPFO Officer' => 'EPFO Officer',
                ])
                ->default('MP/ MLA/ MLC/ Muncipal Councilor')
                ->required(),
            ]),

            Forms\Components\Section::make('Uploads')
            ->schema([
                Forms\Components\FileUpload::make('photo')
                ->label('Applicant Photo (Passport Size)')
                ->image()
                ->directory('aadhar-uploads')
                ->required(),
            ]),
        ])
            ->statePath('data');
    }

    public function generatePdf()
    {
        $data = $this->form->getState();

        // Pass data to an action or handled here
        // We'll call a service or generate here directly since we need FPDI 
        return response()->streamDownload(function () use ($data) {
            $this->createAadharPdf($data);
        }, 'aadhar-form-' . now()->format('YmdHis') . '.pdf');
    }

    private function createAadharPdf($data)
    {
        $pdf = new \setasign\Fpdi\Tcpdf\Fpdi();
        $pdf->SetAutoPageBreak(false);
        $pdf->SetMargins(0, 0, 0);

        // Add a page
        $pdf->AddPage('P', 'A4');

        $templatePath = public_path('../aadhr card form/AADHR CARD FORM 100 PIS.pdf');
        if (!file_exists($templatePath)) {
            $templatePath = 'C:\\xampp\\htdocs\\haryana_domicile\\aadhr card form\\AADHR CARD FORM 100 PIS.pdf';
        }

        $pdf->setSourceFile($templatePath);
        $tplIdx = $pdf->importPage(1);
        $pdf->useTemplate($tplIdx, 0, 0, null, null, true);

        // General Font Settings
        $pdf->SetFont('helvetica', 'B', 10);
        $pdf->SetTextColor(0, 0, 0);

        // Helper for boxed text
        $printBoxedText = function ($text, $startX, $y, $boxWidth) use ($pdf) {
            $text = strtoupper(trim((string)$text));
            for ($i = 0; $i < strlen($text); $i++) {
                $char = substr($text, $i, 1);
                $pdf->SetXY($startX + ($i * $boxWidth), $y);
                $pdf->Cell($boxWidth, 5, $char, 0, 0, 'C');
            }
        };

        // 1. Date
        if (isset($data['date'])) {
            $dateStr = \Carbon\Carbon::parse($data['date'])->format('dmY');
            $printBoxedText($dateStr, 143, 31.5, 5.25);
        }

        // 2. Resident Status Checkbox
        $pdf->SetFont('helvetica', 'B', 12);
        if ($data['resident_status'] === 'Resident') {
            $pdf->SetXY(35.5, 41);
            $pdf->Cell(5, 5, '✓');
        }
        else {
            $pdf->SetXY(63.5, 41);
            $pdf->Cell(5, 5, '✓');
        }

        // 3. Request Type Checkbox
        if ($data['request_type'] === 'New Enrolment') {
            $pdf->SetXY(114, 41);
            $pdf->Cell(5, 5, '✓');
        }
        else {
            $pdf->SetXY(158, 41);
            $pdf->Cell(5, 5, '✓');
        }

        $pdf->SetFont('helvetica', 'B', 10);

        // 4. Aadhaar Number (12 boxes)
        if (isset($data['aadhaar_number'])) {
            // First 4
            $printBoxedText(substr($data['aadhaar_number'], 0, 4), 60, 46.5, 5.25);
            // Middle 4
            $printBoxedText(substr($data['aadhaar_number'], 4, 4), 88.5, 46.5, 5.25);
            // Last 4
            $printBoxedText(substr($data['aadhaar_number'], 8, 4), 116.5, 46.5, 5.25);
        }

        // 5. Full Name
        $printBoxedText($data['full_name'] ?? '', 16, 56.5, 5.25);

        // 6. C/o
        $careOfText = isset($data['care_of_type']) ? $data['care_of_type'] . ' ' . ($data['care_of'] ?? '') : ($data['care_of'] ?? '');
        $printBoxedText($careOfText, 27, 66.5, 5.25);

        // 7. House No.
        $printBoxedText($data['house_no'] ?? '', 44, 76.5, 5.25);

        // 8. Street / Road / Lane
        $printBoxedText($data['street'] ?? '', 16, 86.5, 5.25);

        // 9. Landmark
        $printBoxedText($data['landmark'] ?? '', 16, 96.5, 5.25);

        // 10. Area / Locality / Sector
        $printBoxedText($data['area'] ?? '', 16, 106.5, 5.25);

        // 11. Village / Town / City
        $printBoxedText($data['village'] ?? '', 16, 116.5, 5.25);

        // 12. Post Office
        $printBoxedText($data['post_office'] ?? '', 16, 126.5, 5.25);

        // 13. District
        $printBoxedText($data['district'] ?? '', 16, 136.5, 5.25);

        // 14. State
        $printBoxedText($data['state'] ?? '', 16, 146.5, 5.25);

        // 15. PIN Code
        $printBoxedText($data['pin_code'] ?? '', 28, 156.5, 5.25);

        // 16. Date of Birth
        if (isset($data['dob'])) {
            $dobStr = \Carbon\Carbon::parse($data['dob'])->format('dmY');
            $printBoxedText($dobStr, 94.5, 156.5, 5.25);
        }

        // 17. Certifier details
        $printBoxedText($data['certifier_name'] ?? '', 57, 188.5, 5.25);
        $printBoxedText($data['designation'] ?? '', 37, 196.5, 5.25);
        $printBoxedText($data['office_address'] ?? '', 44, 204.5, 5.25);
        $printBoxedText($data['contact_number'] ?? '', 44, 218.5, 5.25);

        // 18. Certifier Category Checkbox
        $pdf->SetFont('helvetica', 'B', 12);
        $categoryMap = [
            'Gazetted Officer - Group A' => [23.5, 227.5],
            'Village Panchayat Head or Mukhiya' => [23.5, 233.5],
            'Gazetted Officer - Group B' => [91, 227.5],
            'MP/ MLA/ MLC/ Muncipal Councilor' => [91, 233.5],
            'Tehsildar' => [159.5, 227.5],
            'Head of Recognized Educational Institution' => [159.5, 233.5],
            'Superintendent/ Warden/ Matron/ Head of Institution of recognized shelter homes/ Orphanages' => [23.5, 239.5],
            'EPFO Officer' => [159.5, 239.5],
        ];

        if (isset($data['certifier_category']) && isset($categoryMap[$data['certifier_category']])) {
            $coords = $categoryMap[$data['certifier_category']];
            $pdf->SetXY($coords[0], $coords[1]);
            $pdf->Cell(5, 5, '✓');
        }

        // Checklist marks (Hardcoded as checked like sample)
        $checklistMarks = [
            [12, 244.5], // no overwriting
            [12, 248.5], // issue date filled
            [12, 252.5], // resident's signature
            [12, 256.5], // certifier details
            [12, 260.5], // photo cross signed
        ];
        foreach ($checklistMarks as $mark) {
            $pdf->SetXY($mark[0], $mark[1]);
            $pdf->Cell(5, 5, '✓');
        }

        // 19. Photo
        if (!empty($data['photo'])) {
            $photoPath = storage_path('app/public/' . $data['photo']);
            if (file_exists($photoPath)) {
                $pdf->Image($photoPath, 162.5, 171.5, 33, 42); // Adjust W,H as needed to fit the box
            }
        }

        // Output PDF
        echo $pdf->Output('S');
    }
}
