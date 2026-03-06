<?php

namespace App\Filament\Resources\PdfConverterResource\Pages;

use App\Filament\Resources\PdfConverterResource;
use App\Services\PdfToImageService;
use Filament\Actions;
use Filament\Resources\Pages\CreateRecord;
use Filament\Notifications\Notification;
use Illuminate\Support\Facades\Storage;
use App\Traits\DeductServiceCoins;

class CreatePdfConverter extends CreateRecord
{
    use DeductServiceCoins;

    protected static string $resource = PdfConverterResource::class;

    protected function mutateFormDataBeforeCreate(array $data): array
    {
        // Deduct coins first
        $this->checkAndDeductCoins('PDF Converter');

        // Get the password from the form
        $password = $data['password'] ?? '';

        // Get the uploaded PDF path
        $pdfPath = $data['pdf_path'];
        $fullPdfPath = storage_path('app/public/' . $pdfPath);

        // Extract original filename
        $data['original_filename'] = basename($pdfPath);

        try {
            // Convert PDF to images
            $pdfService = new PdfToImageService();

            // Check if Imagick is available
            if (!$pdfService->isImagickAvailable()) {
                Notification::make()
                    ->title('Using Demo Mode')
                    ->body('Imagick is not installed. Using sample images for demonstration. Install Imagick for actual PDF conversion.')
                    ->warning()
                    ->send();
            }

            $images = $pdfService->convertToImages($fullPdfPath, $password);

            $data['front_image_path'] = $images['front'];
            $data['back_image_path'] = $images['back'];

            Notification::make()
                ->title('PDF Processed Successfully')
                ->body('Front and back images are ready.')
                ->success()
                ->send();

        }
        catch (\Exception $e) {
            Notification::make()
                ->title('Conversion Failed')
                ->body('Error: ' . $e->getMessage())
                ->danger()
                ->persistent()
                ->send();

            // Store the record anyway, but without images
            $data['front_image_path'] = null;
            $data['back_image_path'] = null;
        }

        // Remove password from data (we don't want to store it)
        unset($data['password']);

        // Set user_id
        $data['user_id'] = auth()->id();

        return $data;
    }

    protected function getRedirectUrl(): string
    {
        // Redirect to view page after creation
        return $this->getResource()::getUrl('view', ['record' => $this->record]);
    }

    protected function getCreatedNotificationTitle(): ?string
    {
        return 'PDF uploaded and processed';
    }
}
