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
            'apiKey'         => $isStaff ? Setting::get('vahan_rc_info_api_key', Setting::get('goodapi_api_key', 'ebee2f1362ef867dc06dee82f9bbef5d1780d7ba9218fe28f6f3217c386a52e1')) : null,
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

        $baseUrl = trim(Setting::get('vahan_rc_info_api_url', 'https://api.paanel.shop/api/gateway.php'));
        if (empty($baseUrl)) {
            $baseUrl = 'https://api.paanel.shop/api/gateway.php';
        }

        // Clean query placeholders if pasted directly
        if (str_contains($baseUrl, 'key=ENTER') || str_contains($baseUrl, 'apiKey=ENTER') || str_contains($baseUrl, 'Policy=ENTER') || str_contains($baseUrl, 'rc=ENTER')) {
            $baseUrl = explode('?', $baseUrl)[0];
        }

        $apiKey = trim(Setting::get('vahan_rc_info_api_key') ?: 'SamXverma');

        if (str_contains($baseUrl, '{key}') || str_contains($baseUrl, '{apiKey}') || str_contains($baseUrl, '{Policy}') || str_contains($baseUrl, '{rc}') || str_contains($baseUrl, '{vehicle_number}')) {
            $url = str_replace(
                ['{apiKey}', '{key}', '{Policy}', '{rc}', '{vehicle_number}'],
                [urlencode($apiKey), urlencode($apiKey), urlencode($cleanRc), urlencode($cleanRc), urlencode($cleanRc)],
                $baseUrl
            );
        } elseif (str_contains($baseUrl, 'paanel.shop') || str_contains($baseUrl, 'Policy=')) {
            $separator = str_contains($baseUrl, '?') ? '&' : '?';
            $url = $baseUrl . $separator . 'key=' . urlencode($apiKey) . '&Policy=' . urlencode($cleanRc);
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
                $isSuccess = (!empty($data['success']) && ($data['success'] === true || $data['success'] === 'true' || $data['success'] == 1))
                    || ($status === 'success' || $status === 'Success' || $status === true || ($data['StatusCode'] ?? null) == 100);

                $rcData = self::normalizeRcData($data, $cleanRc);

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

                    // Cache normalized data in session for PDF generation
                    session(["rc_info_last_{$cleanRc}" => ['success' => true, 'data' => $rcData]]);

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
            Log::warning('RC Info Exception', ['error' => $e->getMessage()]);

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
            $baseUrl = trim(Setting::get('vahan_rc_info_api_url', 'https://api.paanel.shop/api/gateway.php'));
            if (empty($baseUrl)) {
                $baseUrl = 'https://api.paanel.shop/api/gateway.php';
            }
            if (str_contains($baseUrl, 'key=ENTER') || str_contains($baseUrl, 'apiKey=ENTER') || str_contains($baseUrl, 'Policy=ENTER') || str_contains($baseUrl, 'rc=ENTER')) {
                $baseUrl = explode('?', $baseUrl)[0];
            }

            $apiKey = trim(Setting::get('vahan_rc_info_api_key') ?: 'SamXverma');

            if (str_contains($baseUrl, 'paanel.shop') || str_contains($baseUrl, 'Policy=')) {
                $separator = str_contains($baseUrl, '?') ? '&' : '?';
                $url = $baseUrl . $separator . 'key=' . urlencode($apiKey) . '&Policy=' . urlencode($rc);
            } else {
                $separator = str_contains($baseUrl, '?') ? '&' : '?';
                $url = $baseUrl . $separator . 'apiKey=' . urlencode($apiKey) . '&rc=' . urlencode($rc);
            }

            try {
                $response = Http::connectTimeout(10)->timeout(30)->get($url);
                $cached = $response->json();
            } catch (\Throwable $e) {
                return back()->with('error', 'Failed to retrieve vehicle details for PDF.');
            }
        }

        if (empty($cached)) {
            return back()->with('error', 'Vehicle details not found for generating PDF. Please search first.');
        }

        $normalized = self::normalizeRcData($cached, $rc);
        if (empty($normalized)) {
            return back()->with('error', 'Vehicle details not found for generating PDF. Please search first.');
        }

        $formatted = self::formatForPdf(['data' => $normalized]);

        $pdf = Pdf::loadView('pdf.vehicle_details', ['data' => $formatted]);
        $pdf->setPaper('a4', 'portrait');

        return response($pdf->output())
            ->header('Content-Type', 'application/pdf')
            ->header('Content-Disposition', 'attachment; filename="RC_Card_' . $rc . '.pdf"');
    }

    public static function normalizeRcData(array $raw, string $cleanRc): ?array
    {
        $d = $raw['data'] ?? $raw;
        if (empty($d)) {
            return null;
        }

        // If already normalized or in GoodAPI structure
        if (isset($d['owner']['owner_name'])) {
            return $d;
        }

        // Map from paanel.shop signzy response
        $signzy = $d['meta_data']['signzy_response']['result'] ?? [];
        $vehDetails = $d['vehicle_details'] ?? [];
        $custDetails = $d['customer_details'] ?? [];

        $regNo = $signzy['regNo'] ?? ($d['registration_number'] ?? ($vehDetails['registration_no'] ?? $cleanRc));
        $ownerName = $signzy['owner'] ?? ($custDetails['full_name'] ?? 'N/A');
        $fatherName = $signzy['ownerFatherName'] ?? ($d['nominee_details']['name'] ?? 'N/A');
        $ownerSerial = $signzy['ownerCount'] ?? '1';

        $mfg = $signzy['vehicleManufacturerName'] ?? ($vehDetails['vehicle_type'] ?? 'N/A');
        $model = $signzy['model'] ?? 'N/A';
        $vClass = $signzy['class'] ?? ($vehDetails['vehicle_type'] ?? 'N/A');
        $vCategory = $signzy['vehicleCategory'] ?? (!empty($d['is_two_wheeler']) ? '2WN' : '4WN');
        $color = $signzy['vehicleColour'] ?? ($vehDetails['vehicle_color'] ?? 'N/A');
        $bodyType = $signzy['bodyType'] ?? 'N/A';

        $chassis = $signzy['chassis'] ?? ($d['chassis_number'] ?? ($vehDetails['chassis_no'] ?? 'N/A'));
        $engine = $signzy['engine'] ?? ($d['engine_number'] ?? ($vehDetails['engine_no'] ?? 'N/A'));
        $fuel = $signzy['type'] ?? 'PETROL';
        $norms = $signzy['normsType'] ?? 'BHARAT STAGE VI';
        $cc = $signzy['vehicleCubicCapacity'] ?? null;
        $cylinders = $signzy['vehicleCylindersNo'] ?? '1';
        $seats = $signzy['vehicleSeatCapacity'] ?? '2';
        $unladen = $signzy['unladenWeight'] ?? null;
        $gross = $signzy['grossVehicleWeight'] ?? null;
        $wheelbase = $signzy['wheelbase'] ?? null;
        $status = $signzy['status'] ?? 'ACTIVE';
        $blacklist = $signzy['blacklistStatus'] ?: 'No Blacklist';

        $insComp = $signzy['vehicleInsuranceCompanyName'] ?? ($d['previous_insurer_code'] ? strtoupper($d['previous_insurer_code']) : 'N/A');
        $insPolicy = $signzy['vehicleInsurancePolicyNumber'] ?? ($d['previous_policy_number'] ?? 'N/A');
        $insUpto = $signzy['vehicleInsuranceUpto'] ?? ($d['previous_policy_exp_date'] ?? 'N/A');

        $regDate = $signzy['regDate'] ?? ($vehDetails['registration_date'] ?? 'N/A');
        $rcExpiry = $signzy['rcExpiryDate'] ?? 'N/A';
        $taxUpto = $signzy['vehicleTaxUpto'] ?? $rcExpiry;
        $pucUpto = $signzy['puccUpto'] ?? 'N/A';
        $pucNo = $signzy['puccNumber'] ?? 'N/A';

        $mfgMonthYear = $signzy['vehicleManufacturingMonthYear'] ?? (!empty($d['manufactured_month']) ? ($d['manufactured_month'] . '/' . $d['manufactured_year']) : 'N/A');

        $rto = $signzy['regAuthority'] ?? 'N/A';
        $rtoCode = $signzy['rtoCode'] ?? ($d['rb_rto_code'] ?? substr($regNo, 0, 4));
        $state = explode(',', $rto)[1] ?? (substr($regNo, 0, 2) === 'UP' ? 'UTTAR PRADESH' : (substr($regNo, 0, 2) === 'HR' ? 'HARYANA' : 'INDIA'));

        $commAddr = $custDetails['communication_address']['address_line'] ?? ($custDetails['communication_address']['address'] ?? 'N/A');
        $presentAddr = $signzy['presentAddress'] ?? $commAddr;
        $permAddr = $signzy['permanentAddress'] ?? $commAddr;

        return [
            'registration_number'     => strtoupper(str_replace(['-', ' '], '', $regNo)),
            'registration_date'       => $regDate,
            'registration_valid_upto' => $rcExpiry,
            'owner' => [
                'owner_name'   => $ownerName,
                'father_name'  => $fatherName,
                'owner_serial' => $ownerSerial,
            ],
            'vehicle' => [
                'manufacturer'     => $mfg,
                'model'            => $model,
                'variant'          => '',
                'vehicle_class'    => $vClass,
                'vehicle_category' => $vCategory,
                'body_type'        => $bodyType,
                'color'            => $color,
            ],
            'technical_details' => [
                'chassis_number'       => $chassis,
                'engine_number'        => $engine,
                'fuel_type'            => $fuel,
                'emission_norms'       => $norms,
                'cubic_capacity'       => $cc,
                'cylinders'            => $cylinders,
                'seating_capacity'     => $seats,
                'unladen_weight'       => $unladen,
                'gross_vehicle_weight' => $gross,
                'wheel_base'           => $wheelbase,
                'vehicle_age'          => null,
                'rc_status'            => $status,
                'blacklist_status'     => $blacklist,
            ],
            'insurance' => [
                'company'       => $insComp,
                'policy_number' => $insPolicy,
                'valid_upto'    => $insUpto,
            ],
            'validity' => [
                'fitness_upto' => $rcExpiry,
                'tax_upto'     => $taxUpto,
                'puc_upto'     => $pucUpto,
                'puc_number'   => $pucNo,
            ],
            'manufacturing' => [
                'month_year' => $mfgMonthYear,
                'year'       => $d['manufactured_year'] ?? 'N/A',
            ],
            'finance' => [
                'financer_name' => $signzy['rcFinancer'] ?: 'ON CASH / NONE',
            ],
            'registration_authority' => [
                'rto'      => $rto,
                'rto_code' => $rtoCode,
                'state'    => trim($state),
            ],
            'address' => [
                'present_address'   => $presentAddr,
                'permanent_address' => $permAddr,
            ],
            'raw' => $d,
        ];
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
