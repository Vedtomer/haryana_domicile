<?php

namespace App\Services;

use Exception;
use setasign\Fpdi\Fpdi;

class PdfToImageService
{
    /**
     * Convert a password-protected PDF to front and back images
     * Uses Imagick extension for PDF to image conversion
     *
     * @param string $pdfPath Full path to the PDF file
     * @param string $password PDF password
     * @return array Array with 'front' and 'back' image paths
     * @throws Exception
     */
    public function convertToImages(string $pdfPath, string $password): array
    {
        if (!file_exists($pdfPath)) {
            throw new Exception('PDF file not found: ' . $pdfPath);
        }

        // Use Imagick for conversion
        return $this->convertWithImagick($pdfPath, $password);
    }

    /**
     * Check if Imagick is available
     */
    public function isImagickAvailable(): bool
    {
        return extension_loaded('imagick');
    }

    /**
     * Convert using Imagick (if available)
     */
    private function convertWithImagick(string $pdfPath, string $password): array
    {
        if (!extension_loaded('imagick')) {
            throw new Exception('Imagick extension is not installed.');
        }

        try {
            $imagick = new \Imagick();

            // Set resolution for better quality
            $imagick->setResolution(300, 300);

            // Set password if provided
            if (!empty($password)) {
                $imagick->setPasswordAuthentication($password);
            }

            // Read the PDF
            $imagick->readImage($pdfPath);

            // Get number of pages
            $numPages = $imagick->getNumberImages();

            if ($numPages < 2) {
                throw new Exception('PDF must have at least 2 pages (front and back)');
            }

            // Create output directory
            $outputDir = storage_path('app/public/pdf-conversions/images');
            if (!file_exists($outputDir . '/front')) {
                mkdir($outputDir . '/front', 0755, true);
            }
            if (!file_exists($outputDir . '/back')) {
                mkdir($outputDir . '/back', 0755, true);
            }

            $timestamp = time() . '_' . uniqid();
            $frontPath = $outputDir . '/front/' . $timestamp . '_front.png';
            $backPath = $outputDir . '/back/' . $timestamp . '_back.png';

            // Convert first page (front)
            $imagick->setIteratorIndex(0);
            $imagick->setImageFormat('png');
            $imagick->setImageCompressionQuality(90);
            $imagick->writeImage($frontPath);

            // Convert second page (back)
            $imagick->setIteratorIndex(1);
            $imagick->setImageFormat('png');
            $imagick->setImageCompressionQuality(90);
            $imagick->writeImage($backPath);

            $imagick->clear();
            $imagick->destroy();

            return [
                'front' => str_replace(storage_path('app/public/'), '', $frontPath),
                'back' => str_replace(storage_path('app/public/'), '', $backPath),
            ];

        }
        catch (Exception $e) {
            throw new Exception('Failed to convert PDF: ' . $e->getMessage());
        }
    }
}
