<?php

namespace App\Http\Controllers;

use App\Models\Service;
use App\Models\ServiceRequest;
use App\Models\Setting;
use App\Services\FasalService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AadharToFamilyIdController extends Controller
{
    public function search(Request $request)
    {
        $request->validate([
            'aadhar' => ['required', 'string', 'regex:/^[0-9]{12}$/'],
        ], [
            'aadhar.required' => 'Please enter a 12-digit Aadhaar number.',
            'aadhar.regex' => 'Aadhaar number must be exactly 12 numerical digits.',
        ]);

        $service = Service::where('slug', 'aadhar-to-family-id')->first();
        $user = auth()->user();

        $cleanAadhar = preg_replace('/\D/', '', $request->input('aadhar'));
        $baseUrl = trim((string) Setting::get('ppp_aadhar_to_ppp_url', ''));
        $apiKey = trim((string) Setting::get('ppp_api_key', ''));

        $isFasalUrl = empty($baseUrl) || str_contains($baseUrl, 'fasal.haryana.gov.in');

        if (!$isFasalUrl) {
            // Custom API URL
            try {
                if (str_contains($baseUrl, '{aadhar}') || str_contains($baseUrl, '{aadharnum}')) {
                    $url = str_replace(['{aadhar}', '{aadharnum}'], [urlencode($cleanAadhar), urlencode($cleanAadhar)], $baseUrl);
                } elseif (str_ends_with($baseUrl, '=')) {
                    $url = $baseUrl . urlencode($cleanAadhar);
                } else {
                    $separator = str_contains($baseUrl, '?') ? '&' : '?';
                    $url = $baseUrl . $separator . "aadharnum=" . urlencode($cleanAadhar);
                }

                $headers = ['X-Requested-With' => 'XMLHttpRequest'];
                if (!empty($apiKey)) {
                    $headers['Authorization'] = 'Bearer ' . $apiKey;
                }

                $response = Http::withoutVerifying()
                    ->connectTimeout(8)
                    ->timeout(15)
                    ->withHeaders($headers)
                    ->post($url, ['aadhar' => $cleanAadhar]);

                if ($response->successful()) {
                    $data = $response->json();
                    $familyId = $data['family_id'] ?? $data['familyId'] ?? $data['Payload'][0]['familyID'] ?? null;

                    if ($familyId) {
                        $this->logRequest($user, $service, $cleanAadhar, $familyId);

                        return response()->json([
                            'success' => true,
                            'family_id' => $familyId,
                            'message' => 'Family ID found successfully.',
                        ]);
                    }
                }
            } catch (\Throwable $e) {
                Log::error('AadharToFamilyIdController custom API error: ' . $e->getMessage());
            }
        }

        // Default: use FasalService
        $fasal = app(FasalService::class);
        $result = $fasal->searchByAadhar($cleanAadhar);

        if (!empty($result['success']) && !empty($result['family_id'])) {
            $this->logRequest($user, $service, $cleanAadhar, $result['family_id']);

            return response()->json([
                'success' => true,
                'family_id' => $result['family_id'],
                'message' => 'Family ID found successfully.',
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => $result['message'] ?? 'Family ID not found or service unavailable.',
        ]);
    }

    private function logRequest($user, $service, string $aadhar, string $familyId): void
    {
        try {
            ServiceRequest::create([
                'user_id' => $user->id,
                'service_id' => $service ? $service->id : null,
                'service_name' => $service ? $service->name : 'Aadhar to Family ID',
                'input_data' => ['Aadhar Number' => $aadhar, 'Family ID' => $familyId],
                'coins_charged' => 0,
                'status' => ServiceRequest::STATUS_COMPLETED,
                'completed_at' => now(),
            ]);
        } catch (\Throwable $e) {
            Log::error('AadharToFamilyId ServiceRequest error: ' . $e->getMessage());
        }
    }
}
