<?php

namespace App\Services;

use GuzzleHttp\Client;
use GuzzleHttp\Cookie\CookieJar;
use Illuminate\Support\Facades\Log;

class FasalService
{
    protected string $baseUrl = 'https://fasal.haryana.gov.in';

    /**
     * Search Family ID (PPP ID) by Aadhaar Number directly from fasal.haryana.gov.in
     *
     * Flow:
     * 1. Initialize session on https://fasal.haryana.gov.in/home/login to capture live ASP.NET & BIG-IP cookies.
     * 2. Post to /Home/GetFDbyAadhar with the authenticated cookie jar and headers.
     *
     * @param string $aadharNumber 12-digit Aadhaar number
     * @return array
     */
    public function searchByAadhar(string $aadharNumber): array
    {
        $cleanAadhar = preg_replace('/\D/', '', $aadharNumber);
        if (strlen($cleanAadhar) !== 12) {
            return [
                'success' => false,
                'message' => 'Please enter a valid 12-digit Aadhaar number.',
            ];
        }

        $cookieJar = new CookieJar();
        $client = new Client([
            'cookies' => $cookieJar,
            'verify' => false,
            'timeout' => 20,
            'connect_timeout' => 8,
            'headers' => [
                'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                'Accept-Language' => 'en-US,en;q=0.9,hi;q=0.8',
            ],
        ]);

        try {
            // 1. Visit /home/login to initialize cookies and establish session
            $loginUrl = "{$this->baseUrl}/home/login";
            $client->get($loginUrl);

            // 2. Query GetFDbyAadhar endpoint with active session
            $endpoint = "{$this->baseUrl}/Home/GetFDbyAadhar?aadharnum=" . urlencode($cleanAadhar);

            $response = $client->post($endpoint, [
                'headers' => [
                    'X-Requested-With' => 'XMLHttpRequest',
                    'Origin' => $this->baseUrl,
                    'Referer' => $loginUrl,
                    'Accept' => 'application/json, text/javascript, */*; q=0.01',
                    'Content-Type' => 'application/x-www-form-urlencoded; charset=UTF-8',
                ],
                'body' => 'Aadhar=' . urlencode($cleanAadhar),
            ]);

            $body = (string) $response->getBody();
            $data = json_decode($body, true);

            if (json_last_error() !== JSON_ERROR_NONE || !is_array($data)) {
                Log::warning('FasalService: Non-JSON response from portal: ' . substr($body, 0, 200));
                return [
                    'success' => false,
                    'message' => 'Haryana Fasal portal responded with an invalid format. Please try again.',
                ];
            }

            // Success case: Payload contains familyID
            if (!empty($data['success']) && isset($data['Payload'][0]['familyID'])) {
                $familyId = trim((string) $data['Payload'][0]['familyID']);
                $memberName = $data['Payload'][0]['memberName'] ?? null;

                return [
                    'success' => true,
                    'family_id' => $familyId,
                    'member_name' => $memberName,
                    'message' => 'Family ID found successfully.',
                    'raw' => $data,
                ];
            }

            // Informative error from portal
            $msg = $data['message'] ?? null;
            if (empty($msg) || $msg === '1' || $data['Payload'] == '1') {
                $msg = 'कृपया मान्य आधार नंबर दर्ज करें या इस आधार से कोई Family ID (PPP) लिंक नहीं है।';
            }

            return [
                'success' => false,
                'message' => $msg,
                'raw' => $data,
            ];

        } catch (\Throwable $e) {
            Log::error('FasalService::searchByAadhar Exception: ' . $e->getMessage());

            return [
                'success' => false,
                'message' => 'Haryana Fasal Portal server is currently busy or unreachable. Please try again in a few moments.',
            ];
        }
    }

    public function initSession(): bool
    {
        try {
            $client = new Client(['verify' => false, 'timeout' => 10]);
            $response = $client->get("{$this->baseUrl}/home/login");
            return $response->getStatusCode() === 200;
        } catch (\Throwable $e) {
            return false;
        }
    }
}
