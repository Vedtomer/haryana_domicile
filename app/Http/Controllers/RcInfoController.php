<?php

namespace App\Http\Controllers;

use App\Models\CoinTransaction;
use App\Models\Service;
use App\Models\ServiceRequest;
use App\Models\Setting;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class RcInfoController extends Controller
{
    public function index(Request $request)
    {
        $service = Service::where('slug', 'rc-card-info')
            ->orWhere('slug', 'rc-info')
            ->first();
        $user = auth()->user();

        if ($service && $service->is_premium && !$user->isAdmin() && !$user->hasRole('super_admin') && !$service->users()->where('user_id', $user->id)->exists()) {
            return redirect('/dashboard')->with('error', 'Please unlock this premium service first.');
        }

        $coinCost = $service ? (int) $service->coin_cost : 14;
        $isStaff = $user && ($user->isAdmin() || $user->hasRole('admin') || $user->hasRole('super_admin') || in_array($user->type, ['admin', 'super_admin']));

        return Inertia::render('Utilities/RcInfo', [
            'service'        => $service,
            'currentService' => $service,
            'coinCost'       => $coinCost,
            'isAdmin'        => (bool) $isStaff,
            'apiUrl'         => $isStaff ? Setting::get('vahan_rc_info_api_url', 'https://good-api-point.com/apis_partner/v1/vahan_service_api/rc_info_api.php') : null,
            'apiKey'         => $isStaff ? Setting::get('vahan_rc_info_api_key', Setting::get('goodapi_api_key', '9d55e89b7aeee35171f269af07b6013a3b83db637f04ace03dbc8566a4461815')) : null,
        ]);
    }

    public function search(Request $request)
    {
        $request->validate([
            'rc' => ['required', 'string', 'min:6', 'max:15']
        ], [
            'rc.required' => 'Please enter a valid Vehicle Registration Number (e.g. HR26DK8337 or DL1CAB1234).'
        ]);

        $service = Service::where('slug', 'rc-card-info')
            ->orWhere('slug', 'rc-info')
            ->first();
        $user = auth()->user();

        $coinCost = $service ? (int) $service->coin_cost : 14;
        $isStaff = $user && ($user->isAdmin() || $user->hasRole('admin') || $user->hasRole('super_admin') || in_array($user->type, ['admin', 'super_admin']));

        if (!$isStaff && $user->coins < $coinCost) {
            return response()->json([
                'success' => false,
                'message' => "Insufficient coins. This service requires {$coinCost} coins. (Current balance: {$user->coins} coins)"
            ]);
        }

        $cleanRc = strtoupper(trim(preg_replace('/[^A-Za-z0-9]/', '', $request->input('rc'))));

        $baseUrl = trim(Setting::get('vahan_rc_info_api_url', 'https://good-api-point.com/apis_partner/v1/vahan_service_api/rc_info_api.php'));
        if (empty($baseUrl)) {
            $baseUrl = 'https://good-api-point.com/apis_partner/v1/vahan_service_api/rc_info_api.php';
        }

        // Clean query placeholders if pasted directly
        if (str_contains($baseUrl, 'apiKey=ENTER_API_KEY') || str_contains($baseUrl, 'rc=ENTER_RC_NUMBER')) {
            $baseUrl = explode('?', $baseUrl)[0];
        }

        $apiKey = trim(Setting::get('vahan_rc_info_api_key')
            ?: (Setting::get('goodapi_api_key')
            ?: '9d55e89b7aeee35171f269af07b6013a3b83db637f04ace03dbc8566a4461815'));

        if (str_contains($baseUrl, '{apiKey}') || str_contains($baseUrl, '{rc}') || str_contains($baseUrl, '{vehicle_number}')) {
            $url = str_replace(
                ['{apiKey}', '{rc}', '{vehicle_number}'],
                [urlencode($apiKey), urlencode($cleanRc), urlencode($cleanRc)],
                $baseUrl
            );
        } else {
            $separator = str_contains($baseUrl, '?') ? '&' : '?';
            $url = $baseUrl . $separator . 'apiKey=' . urlencode($apiKey) . '&rc=' . urlencode($cleanRc);
        }

        try {
            $response = Http::withHeaders([
                'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept'     => 'application/json, */*',
            ])->connectTimeout(10)->timeout(45)->get($url);

            $data = $response->json();

            if (is_array($data)) {
                $status = $data['status'] ?? ($data['Status'] ?? null);
                $isSuccess = ($status === 'success' || $status === 'Success' || $status === true || ($data['StatusCode'] ?? null) == 100);

                $rcData = $data['data'] ?? null;

                if ($isSuccess && !empty($rcData)) {
                    // Deduct coins only if non-staff
                    if (!$isStaff && $coinCost > 0) {
                        $user->deductCoins($coinCost, CoinTransaction::TYPE_SERVICE_DEDUCTION, 'RC CARD INFO Search: ' . $cleanRc);
                    }

                    try {
                        ServiceRequest::create([
                            'user_id'       => $user->id,
                            'service_id'    => $service ? $service->id : null,
                            'service_name'  => $service ? $service->name : 'RC CARD INFO',
                            'input_data'    => [
                                'Registration Number' => $cleanRc,
                                'Owner Name'          => $rcData['owner']['owner_name'] ?? 'N/A',
                                'Vehicle Model'       => $rcData['vehicle']['model'] ?? 'N/A',
                            ],
                            'coins_charged' => $isStaff ? 0 : $coinCost,
                            'status'        => ServiceRequest::STATUS_COMPLETED,
                            'completed_at'  => now(),
                        ]);
                    } catch (\Throwable $logEx) {
                        Log::error('ServiceRequest logging error in RcInfo: ' . $logEx->getMessage());
                    }

                    // Cache in session for PDF generation
                    session(["rc_info_last_{$cleanRc}" => $data]);

                    return response()->json([
                        'success'          => true,
                        'data'             => $rcData,
                        'raw'              => $data,
                        'message'          => $data['message'] ?? 'RC Details fetched successfully!',
                        'pdf_download_url' => route('utilities.rc-card-info.pdf', ['rc' => $cleanRc]),
                    ]);
                }

                $errMsg = $data['message'] ?? ($data['msg'] ?? "Vehicle registration record not found for '{$cleanRc}'.");
                return response()->json([
                    'success' => false,
                    'message' => $errMsg,
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'Invalid response from RC provider server. Please try again.',
            ]);

        } catch (\Exception $e) {
            Log::warning('Good-API-Point RC Info Exception', ['error' => $e->getMessage()]);

            return response()->json([
                'success' => false,
                'message' => 'API सर्वर से संपर्क नहीं हो सका: ' . $e->getMessage(),
            ]);
        }
    }

    public function downloadPdf(Request $request)
    {
        $rc = strtoupper(trim(preg_replace('/[^A-Za-z0-9]/', '', $request->query('rc') ?: $request->input('rc'))));
        if (empty($rc)) {
            return back()->with('error', 'Vehicle Registration Number is required.');
        }

        $cached = session("rc_info_last_{$rc}");

        // If not in session, try to fetch fresh from API
        if (!$cached) {
            $baseUrl = trim(Setting::get('vahan_rc_info_api_url', 'https://good-api-point.com/apis_partner/v1/vahan_service_api/rc_info_api.php'));
            if (empty($baseUrl)) {
                $baseUrl = 'https://good-api-point.com/apis_partner/v1/vahan_service_api/rc_info_api.php';
            }
            if (str_contains($baseUrl, 'apiKey=ENTER_API_KEY')) {
                $baseUrl = explode('?', $baseUrl)[0];
            }

            $apiKey = trim(Setting::get('vahan_rc_info_api_key')
                ?: (Setting::get('goodapi_api_key')
                ?: '9d55e89b7aeee35171f269af07b6013a3b83db637f04ace03dbc8566a4461815'));

            $separator = str_contains($baseUrl, '?') ? '&' : '?';
            $url = $baseUrl . $separator . 'apiKey=' . urlencode($apiKey) . '&rc=' . urlencode($rc);

            try {
                $response = Http::connectTimeout(10)->timeout(30)->get($url);
                $cached = $response->json();
            } catch (\Throwable $e) {
                return back()->with('error', 'Failed to retrieve vehicle details for PDF.');
            }
        }

        if (empty($cached) || empty($cached['data'])) {
            return back()->with('error', 'Vehicle details not found for generating PDF. Please search first.');
        }

        $formatted = self::formatForPdf($cached);

        $pdf = Pdf::loadView('pdf.vehicle_details', ['data' => $formatted]);
        $pdf->setPaper('a4', 'portrait');

        return response($pdf->output())
            ->header('Content-Type', 'application/pdf')
            ->header('Content-Disposition', 'attachment; filename="RC_Card_' . $rc . '.pdf"');
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

        Setting::set('vahan_rc_info_api_url', trim($request->api_url));
        if ($request->filled('api_key')) {
            Setting::set('vahan_rc_info_api_key', trim($request->api_key));
        }

        return response()->json([
            'success' => true,
            'message' => 'RC Info API settings updated successfully!',
            'apiUrl'  => Setting::get('vahan_rc_info_api_url'),
            'apiKey'  => Setting::get('vahan_rc_info_api_key'),
        ]);
    }

    public static function formatForPdf(array $raw): array
    {
        $d = $raw['data'] ?? $raw;
        $owner = $d['owner'] ?? [];
        $vehicle = $d['vehicle'] ?? [];
        $tech = $d['technical_details'] ?? [];
        $regAuth = $d['registration_authority'] ?? [];
        $addr = $d['address'] ?? [];
        $ins = $d['insurance'] ?? [];
        $val = $d['validity'] ?? [];
        $mfg = $d['manufacturing'] ?? [];
        $fin = $d['finance'] ?? [];

        $regNo = strtoupper($d['registration_number'] ?? ($d['regNo'] ?? 'N/A'));
        $stateCode = $regAuth['state'] ?? ($d['stateCode'] ?? substr($regNo, 0, 2));

        // Generate QR code for Smart Card
        $qrCodeSvg = null;
        try {
            $qrText = "PARIVAHAN SEWA e-RC\nReg No: {$regNo}\nOwner: " . ($owner['owner_name'] ?? 'N/A') . "\nChassis: " . ($tech['chassis_number'] ?? 'N/A') . "\nEngine: " . ($tech['engine_number'] ?? 'N/A') . "\nValidity: " . ($d['registration_valid_upto'] ?? ($val['fitness_upto'] ?? 'N/A'));
            $renderer = new \BaconQrCode\Renderer\ImageRenderer(
                new \BaconQrCode\Renderer\RendererStyle\RendererStyle(120, 0),
                new \BaconQrCode\Renderer\Image\SvgImageBackEnd()
            );
            $writer = new \BaconQrCode\Writer($renderer);
            $qrCodeSvg = 'data:image/svg+xml;base64,' . base64_encode($writer->writeString($qrText));
        } catch (\Throwable $e) {
            $qrCodeSvg = null;
        }

        $emblemPath = public_path('images/emblem.svg');
        $emblemSvg = file_exists($emblemPath) ? 'data:image/svg+xml;base64,' . base64_encode(file_get_contents($emblemPath)) : null;

        return [
            'regNo'                       => $regNo,
            'regDate'                     => $d['registration_date'] ?? 'N/A',
            'rcExpiryDate'                => $d['registration_valid_upto'] ?? ($val['fitness_upto'] ?? 'N/A'),
            'ownerCount'                  => $owner['owner_serial'] ?? '1',
            'chassis'                     => $tech['chassis_number'] ?? 'N/A',
            'engine'                      => $tech['engine_number'] ?? 'N/A',
            'owner'                       => $owner['owner_name'] ?? 'N/A',
            'ownerFatherName'             => $owner['father_name'] ?? 'N/A',
            'ownership'                   => 'INDIVIDUAL',
            'presentAddress'              => $addr['present_address'] ?? ($addr['permanent_address'] ?? 'N/A'),
            'permanentAddress'            => $addr['permanent_address'] ?? 'N/A',
            'type'                        => $tech['fuel_type'] ?? 'PETROL',
            'normsType'                   => $tech['emission_norms'] ?? 'BHARAT STAGE IV',
            'vehicleClass'                => $vehicle['vehicle_class'] ?? 'MOTOR CAR(LMV)',
            'mfgMonthYear'                => $mfg['month_year'] ?? ($mfg['year'] ?? 'N/A'),
            'cylinders'                   => $tech['cylinders'] ?? '4',
            'vehicleManufacturerName'     => $vehicle['manufacturer'] ?? 'N/A',
            'model'                       => ($vehicle['model'] ?? '') . (!empty($vehicle['variant']) ? ' ' . $vehicle['variant'] : ''),
            'vehicleColour'               => $vehicle['color'] ?? 'N/A',
            'bodyType'                    => $vehicle['body_type'] ?? 'SALOON',
            'vehicleSeatCapacity'         => $tech['seating_capacity'] ?? '5',
            'unladenWeight'               => $tech['unladen_weight'] ?? 'N/A',
            'grossVehicleWeight'          => $tech['gross_vehicle_weight'] ?? 'N/A',
            'vehicleCubicCapacity'        => $tech['cubic_capacity'] ?? ($tech['engine_cc'] ?? 'N/A'),
            'horsePower'                  => $tech['horse_power'] ?? 'N/A',
            'wheelbase'                   => $tech['wheel_base'] ?? 'N/A',
            'rcFinancer'                  => $fin['financer_name'] ?? 'ON CASH',
            'regAuthority'                => $regAuth['rto'] ?? 'N/A',
            'rtoCode'                     => $regAuth['rto_code'] ?? 'N/A',
            'stateCode'                   => $stateCode ?: 'IND',
            'stateName'                   => $regAuth['state'] ?? 'INDIA',
            'isTransport'                 => (str_contains(strtoupper($vehicle['vehicle_category'] ?? ''), 'COMMERCIAL') || str_contains(strtoupper($vehicle['vehicle_class'] ?? ''), 'TRANSPORT')) ? 'TR' : 'NT',
            'status'                      => $tech['rc_status'] ?? 'ACTIVE',
            'vehicleTaxUpto'              => $val['tax_upto'] ?? 'N/A',
            'puccUpto'                    => $val['puc_upto'] ?? 'N/A',
            'puccNumber'                  => $val['puc_number'] ?? 'N/A',
            'vehicleInsuranceCompanyName' => $ins['company'] ?? 'N/A',
            'vehicleInsurancePolicyNumber'=> $ins['policy_number'] ?? 'N/A',
            'vehicleInsuranceUpto'        => $ins['valid_upto'] ?? 'N/A',
            'emblemSvg'                   => $emblemSvg,
            'qrCodeSvg'                   => $qrCodeSvg,
        ];
    }
}
