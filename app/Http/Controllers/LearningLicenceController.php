<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class LearningLicenceController extends Controller
{
    public function search(Request $request)
    {
        $request->validate([
            'applNum' => ['required', 'string']
        ]);

        $service = \App\Models\Service::where('slug', 'learning-licence-pdf')->first();
        $user = auth()->user();

        $coinCost = $service ? $service->coin_cost : 19;
        if ($user->coins < $coinCost && !$user->isAdmin() && !$user->hasRole('super_admin')) {
            return response()->json(['success' => false, 'message' => "Insufficient coins. This service requires {$coinCost} coins."]);
        }

        $applNum = strtoupper(trim($request->input('applNum')));
        $url = "https://nexus-dashboard.space/api/v1/vahan_service_api/learning_license_pdf.php?apiKey=38cc07892c07c566e3ce1a3289c589e284954d7c0e593386&applNum=" . urlencode($applNum);

        try {
            $response = Http::timeout(30)->get($url);

            if ($response->successful()) {
                $data = $response->json();

                if (isset($data['Status']) && $data['Status'] === 'Success' && (isset($data['data']) || isset($data['pdf_url']) || isset($data['pdf']))) {
                    if (!$user->isAdmin() && !$user->hasRole('super_admin') && $coinCost > 0) {
                        $user->deductCoins($coinCost, \App\Models\CoinTransaction::TYPE_SERVICE_DEDUCTION, 'Learning Licence PDF: ' . $applNum);
                    }

                    \App\Models\ServiceRequest::create([
                        'user_id'       => $user->id,
                        'service_id'    => $service ? $service->id : null,
                        'service_name'  => $service ? $service->name : 'Learning Licence PDF',
                        'input_data'    => ['Application Number' => $applNum],
                        'coins_charged' => $user->isAdmin() || $user->hasRole('super_admin') ? 0 : $coinCost,
                        'status'        => \App\Models\ServiceRequest::STATUS_COMPLETED,
                        'completed_at'  => now(),
                    ]);

                    return response()->json([
                        'success' => true,
                        'data'    => $data,
                        'message' => 'Details found successfully.',
                    ]);
                }

                return response()->json([
                    'success' => false,
                    'message' => $data['message'] ?? 'Details not found. Please check the Application Number.',
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'Details not found for this Application Number.',
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error communicating with the external server.',
            ]);
        }
    }
}
