<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class PincodeLookupController extends Controller
{
    /**
     * India Post's public pincode API has no CORS headers, so the browser
     * can't call it directly — this proxies it and maps to district/tehsil.
     */
    public function lookup(Request $request, string $pincode)
    {
        if (!preg_match('/^\d{6}$/', $pincode)) {
            return response()->json(['message' => 'Invalid pincode.'], 422);
        }

        // The API rejects requests without a browser-like User-Agent.
        $response = Http::withHeaders(['User-Agent' => 'Mozilla/5.0'])
            ->timeout(5)
            ->get("https://api.postalpincode.in/pincode/{$pincode}");
        $result = $response->json()[0] ?? null;
        $postOffice = $result['PostOffice'][0] ?? null;

        if (!$postOffice) {
            return response()->json(['message' => 'Pincode not found.'], 404);
        }

        return response()->json([
            'district' => $postOffice['District'],
            'tehsil' => $postOffice['Block'],
        ]);
    }
}
