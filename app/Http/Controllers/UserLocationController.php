<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class UserLocationController extends Controller
{
    public function updateLocation(Request $request)
    {
        $user = auth()->user();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Unauthenticated'], 401);
        }

        $latitude = $request->input('latitude');
        $longitude = $request->input('longitude');
        $accuracy = $request->input('accuracy');
        $ip = $request->ip();

        $updateData = [
            'location_updated_at' => now(),
            'last_login_ip'       => $ip,
        ];

        if ($latitude !== null && $longitude !== null) {
            $updateData['latitude'] = $latitude;
            $updateData['longitude'] = $longitude;
            $updateData['location_accuracy'] = $accuracy;

            // Reverse geocoding via OpenStreetMap Nominatim
            try {
                $response = Http::withHeaders([
                    'User-Agent' => 'CSPJaankari/1.0 (admin@cspjaankari.in)'
                ])->timeout(3)->get("https://nominatim.openstreetmap.org/reverse", [
                    'format' => 'json',
                    'lat'    => $latitude,
                    'lon'    => $longitude,
                    'zoom'   => 16,
                    'addressdetails' => 1,
                ]);

                if ($response->successful()) {
                    $res = $response->json();
                    $address = $res['display_name'] ?? null;
                    $addrParts = $res['address'] ?? [];
                    $city = $addrParts['city'] ?? $addrParts['town'] ?? $addrParts['village'] ?? $addrParts['suburb'] ?? $addrParts['county'] ?? null;
                    $state = $addrParts['state'] ?? null;

                    if ($address) {
                        $updateData['location_address'] = $address;
                    }
                    if ($city) {
                        $updateData['location_city'] = $city;
                    }
                    if ($state) {
                        $updateData['location_state'] = $state;
                    }
                }
            } catch (\Throwable $e) {
                if (empty($updateData['location_address'])) {
                    $updateData['location_address'] = "GPS: {$latitude}, {$longitude}";
                }
            }
        } else {
            // Fallback to IP geolocation if GPS is denied/unavailable
            try {
                if ($ip && !in_array($ip, ['127.0.0.1', '::1'])) {
                    $response = Http::timeout(3)->get("http://ip-api.com/json/{$ip}?fields=status,city,regionName,country,lat,lon");
                    if ($response->successful() && ($response->json('status') === 'success')) {
                        $res = $response->json();
                        if (empty($user->latitude) && !empty($res['lat'])) {
                            $updateData['latitude'] = $res['lat'];
                            $updateData['longitude'] = $res['lon'];
                        }
                        $city = $res['city'] ?? '';
                        $state = $res['regionName'] ?? '';
                        $updateData['location_city'] = $city;
                        $updateData['location_state'] = $state;
                        $updateData['location_address'] = trim("{$city}, {$state}", ', ');
                    }
                }
            } catch (\Throwable $e) {}
        }

        $user->update($updateData);

        return response()->json([
            'success' => true,
            'location' => [
                'latitude' => $user->latitude,
                'longitude' => $user->longitude,
                'address' => $user->location_address,
                'city' => $user->location_city,
                'state' => $user->location_state,
                'google_maps_url' => $user->google_maps_url,
            ]
        ]);
    }
}
