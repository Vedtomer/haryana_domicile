<?php

namespace App\Filament\Pages;

use Filament\Pages\Page;
use Filament\Forms\Concerns\InteractsWithForms;
use Filament\Forms\Contracts\HasForms;
use Filament\Forms\Form;
use Filament\Forms;
use Filament\Actions\Action;
use Filament\Notifications\Notification;
use Illuminate\Support\Facades\Storage;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Blade;

class PanCardGenerator extends Page implements HasForms
{
    use InteractsWithForms;

    protected static ?string $navigationIcon = 'heroicon-o-document-text';

    protected static string $view = 'filament.pages.pan-card-generator';

    protected static ?string $navigationLabel = 'PAN Card Generator';

    protected static ?string $title = 'PAN Card Generator';

    public ?array $data = [];

    public function mount(): void
    {
        $this->form->fill();
    }

    public function form(Form $form): Form
    {
        return $form
            ->schema([
            Forms\Components\Section::make('Applicant Details')
            ->columns(2)
            ->schema([
                Forms\Components\TextInput::make('name')
                ->label('Name on Card')
                ->required()
                ->placeholder('e.g. RAJ KARAN'),
                Forms\Components\TextInput::make('father_name')
                ->label('Father\'s Name')
                ->required()
                ->placeholder('e.g. RAM PHAL'),
                Forms\Components\DatePicker::make('dob')
                ->label('Date of Birth')
                ->required()
                ->displayFormat('d/m/Y')
                ->native(false),
                Forms\Components\TextInput::make('pan_number')
                ->label('PAN Number')
                ->required()
                ->regex('/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/')
                ->placeholder('e.g. ABCDE1234F'),
                Forms\Components\FileUpload::make('photo')
                ->label('Photo')
                ->image()
                ->directory('pan-uploads')
                ->required()
                ->preserveFilenames(),
                Forms\Components\FileUpload::make('signature')
                ->label('Signature')
                ->image()
                ->directory('pan-uploads')
                ->required()
                ->preserveFilenames(),
            ])
            ]),
        ])
        ->statePath('data');
    }

    public function generatePdf()
    {
        $data = $this->form->getState();

        $pdf = Pdf::loadView('pdf.pan-card', ['data' => $data]);

        return response()->streamDownload(function () use ($pdf) {
            echo $pdf->output();
        }, 'pan-card-' . $data['pan_number'] . '.pdf');
    }
}
