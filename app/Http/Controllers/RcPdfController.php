<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class RcPdfController extends Controller
{
    public function search(Request $request)
    {
        $request->validate([
            'vechil_no' => ['required', 'string']
        ]);

        $service = \App\Models\Service::where('slug', 'rc-pdf-instant')->first();
        $user = auth()->user();

        $coinCost = $service ? $service->coin_cost : 99;
        if ($user->coins < $coinCost && !$user->isAdmin() && !$user->hasRole('super_admin')) {
            return response()->json(['success' => false, 'message' => "Insufficient coins. This service requires {$coinCost} coins."]);
        }

        $vechilNo = strtoupper(trim(str_replace([' ', '-'], '', $request->input('vechil_no'))));
        $url = "https://nexus-dashboard.space/api/v1/vahan_service_api/vechil_rc_pdf.php?apiKey=38cc07892c07c566e3ce1a3289c589e284954d7c0e593386&vechil_no=" . urlencode($vechilNo);

        try {
            $response = Http::timeout(45)->get($url); // API takes >11s sometimes

            if ($response->successful()) {
                $data = $response->json();

                if (isset($data['Status']) && $data['Status'] === 'Success' && (isset($data['data']) || isset($data['file_url']) || isset($data['pdf']))) {
                    if (!$user->isAdmin() && !$user->hasRole('super_admin') && $coinCost > 0) {
                        $user->deductCoins($coinCost, \App\Models\CoinTransaction::TYPE_SERVICE_DEDUCTION, 'RC PDF Download: ' . $vechilNo);
                    }

                    \App\Models\ServiceRequest::create([
                        'user_id'       => $user->id,
                        'service_id'    => $service ? $service->id : null,
                        'service_name'  => $service ? $service->name : 'Rc Pdf Instant',
                        'input_data'    => ['Vehicle Number' => $vechilNo],
                        'coins_charged' => $user->isAdmin() || $user->hasRole('super_admin') ? 0 : $coinCost,
                        'status'        => \App\Models\ServiceRequest::STATUS_COMPLETED,
                        'completed_at'  => now(),
                    ]);

                    return response()->json([
                        'success' => true,
                        'data'    => $data,
                        'message' => 'RC PDF generated successfully.',
                    ]);
                }

                return response()->json([
                    'success' => false,
                    'message' => $data['message'] ?? 'Details not found. Please check the Vehicle Number.',
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'Details not found for this Vehicle Number.',
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error communicating with the external server.',
            ]);
        }
    }
}
