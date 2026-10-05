<?php

namespace App\Http\Controllers;

use App\Models\CoinTransaction;
use App\Models\Service;
use App\Models\ServiceRequest;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class RationSleepPhotoController extends Controller
{
    public function index(Request $request)
    {
        $service = Service::where('slug', 'ration-sleep-photo')
            ->orWhere('slug', 'ration-slip-photo')
            ->orWhere('slug', 'bihar-ration-slip')
            ->first();
        $user = auth()->user();

        if ($service && $service->is_premium && !$user->isAdmin() && !$user->hasRole('super_admin') && !$service->users()->where('user_id', $user->id)->exists()) {
            return redirect('/dashboard')->with('error', 'Please unlock this premium service first.');
        }

        $coinCost = $service ? (int) $service->coin_cost : 49;
        $isStaff = $user && ($user->isAdmin() || $user->hasRole('admin') || $user->hasRole('super_admin') || in_array($user->type, ['admin', 'super_admin']));

        $apiUrl = trim(Setting::get('ration_sleep_photo_api_url', ''));
        if (empty($apiUrl)) {
            $apiUrl = 'https://good-api-point.com/apis_partner/v1/ration_card_api/bihar_ration_slip.php';
        }

        $apiKey = trim(Setting::get('ration_sleep_photo_api_key', ''));
        if (empty($apiKey)) {
            $apiKey = trim(Setting::get('aadhar_to_ration_api_key', Setting::get('goodapi_api_key', 'ebee2f1362ef867dc06dee82f9bbef5d1780d7ba9218fe28f6f3217c386a52e1')));
        }

        return Inertia::render('Utilities/RationSleepPhoto', [
            'service'        => $service,
            'currentService' => $service,
            'coinCost'       => $coinCost,
            'isAdmin'        => (bool) $isStaff,
            'apiUrl'         => $isStaff ? $apiUrl : null,
            'apiKey'         => $isStaff ? $apiKey : null,
        ]);
    }

    public function search(Request $request)
    {
        $request->validate([
            'ration' => ['required', 'string', 'min:5', 'max:35'],
            'type'   => ['nullable', 'string', 'max:20'],
        ], [
            'ration.required' => 'कृपया राशन कार्ड नंबर दर्ज करें (Please enter Ration Card Number).',
        ]);

        $service = Service::where('slug', 'ration-sleep-photo')
            ->orWhere('slug', 'ration-slip-photo')
            ->orWhere('slug', 'bihar-ration-slip')
            ->first();
        $user = auth()->user();

        $coinCost = $service ? (int) $service->coin_cost : 49;
        $isStaff = $user && ($user->isAdmin() || $user->hasRole('admin') || $user->hasRole('super_admin') || in_array($user->type, ['admin', 'super_admin']));

        if (!$isStaff && $user->coins < $coinCost) {
            return response()->json([
                'success' => false,
                'message' => "Insufficient coins. This service requires {$coinCost} coins. (Current balance: {$user->coins} coins)"
            ]);
        }

        $cleanRationNo = trim($request->input('ration'));
        $type = strtoupper(trim($request->input('type', 'R')));
        if (empty($type)) {
            $type = 'R';
        }

        $baseUrl = trim(Setting::get('ration_sleep_photo_api_url', 'https://good-api-point.com/apis_partner/v1/ration_card_api/bihar_ration_slip.php'));
        if (empty($baseUrl)) {
            $baseUrl = 'https://good-api-point.com/apis_partner/v1/ration_card_api/bihar_ration_slip.php';
        }

        if (str_contains($baseUrl, 'apiKey=ENTER_API_KEY') || str_contains($baseUrl, 'ration=RATION_NUMBER')) {
            $baseUrl = explode('?', $baseUrl)[0];
        }

        $apiKey = trim(Setting::get('ration_sleep_photo_api_key')
            ?: (Setting::get('aadhar_to_ration_api_key')
            ?: (Setting::get('goodapi_api_key')
            ?: 'ebee2f1362ef867dc06dee82f9bbef5d1780d7ba9218fe28f6f3217c386a52e1')));

        $queryParams = [
            'apiKey' => $apiKey,
            'ration' => $cleanRationNo,
            'type'   => $type,
        ];

        $url = $baseUrl . (str_contains($baseUrl, '?') ? '&' : '?') . http_build_query($queryParams);

        try {
            $response = Http::withHeaders([
                'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept'     => 'application/json, application/pdf, image/*, */*',
            ])->connectTimeout(15)->timeout(60)->get($url);

            $contentType = $response->header('Content-Type') ?? '';

            // 1. Raw PDF binary response from provider
            if (str_contains($contentType, 'application/pdf') || str_starts_with($response->body(), '%PDF')) {
                $pdfBase64 = base64_encode($response->body());

                if (!$isStaff && $coinCost > 0) {
                    $user->deductCoins($coinCost, CoinTransaction::TYPE_SERVICE_DEDUCTION, 'Ration Slip Photo Download: ' . $cleanRationNo);
                }

                ServiceRequest::create([
                    'user_id'       => $user->id,
                    'service_id'    => $service ? $service->id : null,
                    'service_name'  => $service ? $service->name : 'Ration Sleep Photo',
                    'input_data'    => [
                        'Ration Card Number' => $cleanRationNo,
                        'Type'               => $type,
                    ],
                    'coins_charged' => $isStaff ? 0 : $coinCost,
                    'status'        => ServiceRequest::STATUS_COMPLETED,
                    'completed_at'  => now(),
                ]);

                return response()->json([
                    'success'    => true,
                    'pdf_base64' => $pdfBase64,
                    'ration_no'  => $cleanRationNo,
                    'type'       => $type,
                    'is_pdf'     => true,
                    'filename'   => 'Ration_Slip_' . $cleanRationNo . '.pdf',
                    'message'    => 'Ration Slip Photo PDF generated successfully!',
                ]);
            }

            // 2. Raw Image binary response (JPEG, PNG, WEBP)
            if (str_contains($contentType, 'image/')) {
                $mime = explode(';', $contentType)[0];
                $imageBase64 = 'data:' . $mime . ';base64,' . base64_encode($response->body());

                if (!$isStaff && $coinCost > 0) {
                    $user->deductCoins($coinCost, CoinTransaction::TYPE_SERVICE_DEDUCTION, 'Ration Slip Photo Download: ' . $cleanRationNo);
                }

                ServiceRequest::create([
                    'user_id'       => $user->id,
                    'service_id'    => $service ? $service->id : null,
                    'service_name'  => $service ? $service->name : 'Ration Sleep Photo',
                    'input_data'    => [
                        'Ration Card Number' => $cleanRationNo,
                        'Type'               => $type,
                    ],
                    'coins_charged' => $isStaff ? 0 : $coinCost,
                    'status'        => ServiceRequest::STATUS_COMPLETED,
                    'completed_at'  => now(),
                ]);

                return response()->json([
                    'success'      => true,
                    'image_base64' => $imageBase64,
                    'ration_no'    => $cleanRationNo,
                    'type'         => $type,
                    'is_image'     => true,
                    'filename'     => 'Ration_Slip_' . $cleanRationNo . '.jpg',
                    'message'      => 'Ration Slip Photo fetched successfully!',
                ]);
            }

            $data = $response->json();

            if (is_array($data)) {
                $status = strtolower($data['status'] ?? ($data['Status'] ?? ''));
                $statusCode = $data['StatusCode'] ?? ($data['statusCode'] ?? null);
                $isSuccess = ($status === 'success' || (int) $statusCode === 100 || (isset($data['success']) && $data['success'] === true));

                $pdfBase64 = $data['pdf'] ?? ($data['pdf_base64'] ?? ($data['base64'] ?? ($data['data']['pdf'] ?? ($data['data']['pdf_base64'] ?? null))));
                $pdfUrl = $data['file_url'] ?? ($data['pdf_url'] ?? ($data['download_url'] ?? ($data['url'] ?? ($data['data']['file_url'] ?? ($data['data']['pdf_url'] ?? null)))));

                $photoBase64 = $data['photo'] ?? ($data['photo_base64'] ?? ($data['image'] ?? ($data['image_base64'] ?? ($data['data']['photo'] ?? ($data['data']['image'] ?? null)))));
                $photoUrl = $data['photo_url'] ?? ($data['image_url'] ?? ($data['slip_url'] ?? ($data['data']['photo_url'] ?? ($data['data']['image_url'] ?? null))));

                $payloadData = $data['data'] ?? $data;

                if ($isSuccess && (!empty($pdfBase64) || !empty($pdfUrl) || !empty($photoBase64) || !empty($photoUrl) || !empty($data['data']))) {
                    if (!$isStaff && $coinCost > 0) {
                        $user->deductCoins($coinCost, CoinTransaction::TYPE_SERVICE_DEDUCTION, 'Ration Slip Photo Download: ' . $cleanRationNo);
                    }

                    ServiceRequest::create([
                        'user_id'       => $user->id,
                        'service_id'    => $service ? $service->id : null,
                        'service_name'  => $service ? $service->name : 'Ration Sleep Photo',
                        'input_data'    => [
                            'Ration Card Number' => $cleanRationNo,
                            'Type'               => $type,
                        ],
                        'coins_charged' => $isStaff ? 0 : $coinCost,
                        'status'        => ServiceRequest::STATUS_COMPLETED,
                        'completed_at'  => now(),
                    ]);

                    return response()->json([
                        'success'      => true,
                        'data'         => $payloadData,
                        'pdf_base64'   => $pdfBase64,
                        'pdf_url'      => $pdfUrl,
                        'photo_base64' => $photoBase64,
                        'photo_url'    => $photoUrl,
                        'ration_no'    => $cleanRationNo,
                        'type'         => $type,
                        'filename'     => $pdfBase64 || $pdfUrl ? ('Ration_Slip_' . $cleanRationNo . '.pdf') : ('Ration_Slip_' . $cleanRationNo . '.jpg'),
                        'message'      => $data['message'] ?? 'Ration Slip Photo fetched successfully!',
                    ]);
                }

                $errMsg = $data['message'] ?? ($data['msg'] ?? "Ration slip photo record not found for '{$cleanRationNo}'.");
                return response()->json([
                    'success' => false,
                    'message' => $errMsg,
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'Invalid response from Ration Slip provider server.',
            ]);

        } catch (\Exception $e) {
            Log::warning('Good-API-Point Ration Slip Photo Exception', ['error' => $e->getMessage()]);

            return response()->json([
                'success' => false,
                'message' => 'API सर्वर से संपर्क नहीं हो सका: ' . $e->getMessage(),
            ]);
        }
    }

    public function updateApi(Request $request)
    {
        $user = auth()->user();
        if (!$user || (!$user->isAdmin() && !$user->hasRole('admin') && !$user->hasRole('super_admin') && !in_array($user->type, ['admin', 'super_admin']))) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'api_url' => 'required|url',
            'api_key' => 'nullable|string',
        ]);

        Setting::set('ration_sleep_photo_api_url', trim($request->api_url));
        if ($request->filled('api_key')) {
            Setting::set('ration_sleep_photo_api_key', trim($request->api_key));
        }

        return response()->json([
            'success' => true,
            'message' => 'Ration Slip Photo API settings updated successfully!',
            'apiUrl'  => Setting::get('ration_sleep_photo_api_url'),
            'apiKey'  => Setting::get('ration_sleep_photo_api_key'),
        ]);
    }
}
