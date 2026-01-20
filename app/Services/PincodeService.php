<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;

class PincodeService
{
    /**
     * Fetch location details from pincode using India Post API
     * 
     * @param string $pincode
     * @return array|null
     */
    public static function getLocationFromPincode(string $pincode): ?array
    {
        // Validate pincode format (6 digits)
        if (!preg_match('/^[1-9][0-9]{5}$/', $pincode)) {
            return null;
        }

        // Cache the result for 30 days to avoid repeated API calls
        return Cache::remember("pincode_{$pincode}", 60 * 60 * 24 * 30, function () use ($pincode) {
            try {
                // Using India Post Pincode API with curl directly
                $url = "https://api.postalpincode.in/pincode/{$pincode}";
                
                $ch = curl_init();
                curl_setopt($ch, CURLOPT_URL, $url);
                curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
                curl_setopt($ch, CURLOPT_TIMEOUT, 10);
                curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
                curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
                curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
                curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
                
                $response = curl_exec($ch);
                $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
                $error = curl_error($ch);
                curl_close($ch);
                
                if ($error) {
                    \Illuminate\Support\Facades\Log::error("Pincode API cURL Error: " . $error, ['pincode' => $pincode]);
                    return null;
                }
                
                if ($httpCode === 200 && $response) {
                    $data = json_decode($response, true);
                    
                    \Illuminate\Support\Facades\Log::info("Pincode API Response for {$pincode}", ['data' => $data]);
                    
                    // Check if API returned valid data
                    if (isset($data[0]['Status']) && $data[0]['Status'] === 'Success' && !empty($data[0]['PostOffice'])) {
                        $postOffice = $data[0]['PostOffice'][0];
                        
                        return [
                            'city' => $postOffice['District'] ?? '',
                            'district' => $postOffice['District'] ?? '',
                            'state' => $postOffice['State'] ?? '',
                            'tehsil' => $postOffice['Block'] ?? '',
                            'pincode' => $pincode,
                        ];
                    }
                }
                
                \Illuminate\Support\Facades\Log::warning("Pincode API returned unsuccessful response", [
                    'pincode' => $pincode,
                    'http_code' => $httpCode,
                    'response' => $response
                ]);
                
                return null;
            } catch (\Exception $e) {
                // Log error with details
                \Illuminate\Support\Facades\Log::error("Pincode API Error: " . $e->getMessage(), [
                    'pincode' => $pincode,
                    'trace' => $e->getTraceAsString()
                ]);
                return null;
            }
        });
    }
}
