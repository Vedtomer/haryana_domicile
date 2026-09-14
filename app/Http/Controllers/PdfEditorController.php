<?php

namespace App\Http\Controllers;

use App\Models\CoinTransaction;
use App\Models\Service;
use App\Models\ServiceRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PdfEditorController extends Controller
{
    public function process(Request $request)
    {
        $action = $request->input('action', 'compress'); // compress, merge, watermark, convert

        $service = Service::where('slug', 'pdf-editor')->first();
        $user = auth()->user();

        $coinCost = $service ? $service->coin_cost : 10;
        if ($user->coins < $coinCost && !$user->isAdmin() && !$user->hasRole('super_admin')) {
            return response()->json([
                'success' => false,
                'message' => "Insufficient coins. This service requires {$coinCost} coins."
            ]);
        }

        // =========================================================================
        // API CONFIGURATION (Put your PDF Editor API URL & Key here when provided)
        // =========================================================================
        $apiUrl = config('services.pdf.editor_api_url') ?: env('PDF_EDITOR_API_URL', '');
        $apiKey = config('services.pdf.api_key') ?: env('PDF_API_KEY', '');
        // =========================================================================

        try {
            if (!empty($apiUrl)) {
                $response = Http::connectTimeout(15)
                    ->timeout(60)
                    ->withHeaders([
                        'Authorization' => $apiKey ? 'Bearer ' . $apiKey : '',
                        'X-API-KEY' => $apiKey,
                        'Accept' => 'application/json',
                    ])
                    ->post($apiUrl, [
                        'action' => $action,
                        'data' => $request->all(),
                        'key' => $apiKey,
                    ]);

                if ($response->successful()) {
                    $data = $response->json();
                    $this->deductCoinsAndLogRequest($user, $service, $coinCost, 'PDF Action: ' . $action);

                    return response()->json([
                        'success' => true,
                        'download_url' => $data['download_url'] ?? null,
                        'file_base64' => $data['file_base64'] ?? null,
                        'message' => $data['message'] ?? 'PDF processed successfully.'
                    ]);
                }

                return response()->json([
                    'success' => false,
                    'message' => 'Failed to process PDF with the external server.'
                ]);
            }

            // Demo / Placeholder execution
            $this->deductCoinsAndLogRequest($user, $service, $coinCost, 'PDF Action: ' . $action);

            return response()->json([
                'success' => true,
                'is_demo' => true,
                'message' => 'PDF operation completed successfully. (API configuration pending. Edit API in controller when provided).'
            ]);

        } catch (\Exception $e) {
            Log::error('PdfEditorController error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Server communication error: ' . $e->getMessage()
            ]);
        }
    }

    private function deductCoinsAndLogRequest($user, $service, int $coinCost, string $queryIdentifier): void
    {
        if (!$user->isAdmin() && !$user->hasRole('super_admin') && $coinCost > 0) {
            $user->deductCoins($coinCost, CoinTransaction::TYPE_SERVICE_DEDUCTION, 'PDF Editor: ' . $queryIdentifier);
        }

        ServiceRequest::create([
            'user_id' => $user->id,
            'service_id' => $service ? $service->id : null,
            'service_name' => $service ? $service->name : 'PDF Editor',
            'input_data' => ['Action' => $queryIdentifier],
            'coins_charged' => $user->isAdmin() || $user->hasRole('super_admin') ? 0 : $coinCost,
            'status' => ServiceRequest::STATUS_COMPLETED,
            'completed_at' => now(),
        ]);
    }
}
