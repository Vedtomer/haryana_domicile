<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class FamilyDataService
{
    public function getFamilyData($aadharNumber)
    {
        $encodedAadhar = base64_encode($aadharNumber);
        $baseUrl = 'https://ppp-office.haryana.gov.in';
        $searchUrl = $baseUrl . '/AddNewFamily/FamilySearch';
        $responseUrl = $baseUrl . '/AddNewFamily/GetResponse';

        // 1. Setup Base Request configuration
        $request = Http::timeout(45)
            ->connectTimeout(20)
            ->withoutVerifying()
            ->withHeaders([
                'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                'Accept' => 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language' => 'en-US,en;q=0.9',
            ]);


        try {
            // 2. Initialize Session (GET landing page to get fresh cookies)
            $initialResponse = $request->get($searchUrl);
            
            if (!$initialResponse->successful()) {
                Log::error('FamilyData Session Init Failed', ['status' => $initialResponse->status()]);
                return null;
            }

            $cookies = $initialResponse->cookies();
            
            // 3. Extract RequestVerificationToken from the HTML if possible
            preg_match('/__RequestVerificationToken.*value="([^"]*)"/', $initialResponse->body(), $matches);
            $token = $matches[1] ?? null;

            // 4. Perform Search Request
            $searchRequest = $request->withCookies($cookies->toArray(), 'ppp-office.haryana.gov.in')
                ->withHeaders([
                    'X-Requested-With' => 'XMLHttpRequest',
                    'Referer' => $searchUrl,
                    'Origin' => $baseUrl,
                ]);

            if ($token) {
                $searchRequest->withHeaders(['__RequestVerificationToken' => $token]);
            }

            $response = $searchRequest->asForm()->post($responseUrl, [
                'Aadahr' => $encodedAadhar, // Kept spelling as provided by user
            ]);

            if ($response->successful()) {
                return $response->body();
            }

            Log::error('FamilyData Search Request Failed', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

        } catch (\Exception $e) {
            Log::error('FamilyData Service Exception', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
        }

        return null;
    }
}
