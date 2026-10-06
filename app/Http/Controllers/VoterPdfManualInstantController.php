<?php

namespace App\Http\Controllers;

use App\Models\CoinTransaction;
use App\Models\Service;
use App\Models\ServiceRequest;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class VoterPdfManualInstantController extends Controller
{
    const DEFAULT_API_URL = 'https://apinice.in/api/v2/voter-manual-pdf.php';
    const DEFAULT_API_KEY = 'Y3VK89K8V8';

    /**
     * Display the Voter PDF Manual Instant generator form.
     */
    public function index()
    {
        $service = Service::where('slug', 'voter-pdf-manual-instant')
            ->orWhere('slug', 'voter-card-manual-maker')
            ->first();

        $user = auth()->user();
        $isStaff = $user ? $user->isStaff() : false;

        return Inertia::render('Utilities/VoterPdfManualInstant', [
            'service' => $service,
            'userCoins' => $user ? (int) $user->coins : 0,
            'isStaff' => $isStaff,
            'apiUrl' => $isStaff ? Setting::get('voter_pdf_manual_api_url', self::DEFAULT_API_URL) : null,
            'apiKey' => $isStaff ? Setting::get('voter_pdf_manual_api_key', self::DEFAULT_API_KEY) : null,
        ]);
    }

    /**
     * Generate Voter Card PDF data via apinice.in API.
     */
    public function generate(Request $request)
    {
        $request->validate([
            'epic_no'     => ['required', 'string', 'max:30'],
            'name'        => ['required', 'string', 'max:150'],
            'gender'      => ['required', 'string', 'in:MALE,FEMALE,OTHER,Male,Female,Other'],
            'father_name' => ['required', 'string', 'max:150'],
            'tahshil'     => ['required', 'string', 'max:120'],
            'address'     => ['required', 'string', 'max:600'],
            'language'    => ['required', 'string', 'max:10'],
            'imagefile'   => ['required', 'file', 'mimes:jpeg,jpg,png,webp', 'max:2048'],
        ]);

        $user = auth()->user();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Unauthenticated.'], 401);
        }

        $service = Service::where('slug', 'voter-pdf-manual-instant')
            ->orWhere('slug', 'voter-card-manual-maker')
            ->first();

        $coinCost = $service ? (int) $service->coin_cost : 30;
        $isStaff = $user->isStaff();

        if (!$isStaff && $user->coins < $coinCost) {
            return response()->json([
                'success' => false,
                'message' => "Apke account me insufficient balance hai. Is service ke liye {$coinCost} coins chahiye.",
            ], 400);
        }

        $epicNo = strtoupper(trim($request->input('epic_no')));
        $cleanName = strtoupper(trim($request->input('name')));
        $gender = strtoupper(trim($request->input('gender')));
        $fatherName = strtoupper(trim($request->input('father_name')));
        $fatherType = trim($request->input('father_type', 'Father')) ?: 'Father';
        $tahshil = trim($request->input('tahshil'));
        $district = trim($request->input('district', ''));
        $age = trim($request->input('age', ''));
        $assemblyNoName = trim($request->input('assembly_no_name', ''));
        $partNo = trim($request->input('part_no', ''));
        $partName = trim($request->input('part_name', ''));
        $address = trim($request->input('address'));
        $language = strtoupper(trim($request->input('language', 'HI')));

        // Local language fields
        $nameLocal = trim($request->input('name_local', ''));
        $genderLocal = trim($request->input('gender_local', ''));
        $fatherNameLocal = trim($request->input('father_name_local', ''));
        $dobLocal = trim($request->input('dob_local', ''));
        $assemblyNoNameLocal = trim($request->input('assembly_no_name_local', ''));
        $partNameLocal = trim($request->input('part_name_local', ''));
        $addressLocal = trim($request->input('address_local', ''));

        // Save uploaded photo to public disk
        $file = $request->file('imagefile');
        $storedPath = $file->store('voter-photos', 'public');
        $fullDiskPath = storage_path('app/public/' . $storedPath);
        $publicPhotoUrl = asset('storage/' . $storedPath);

        // API Configuration
        $baseUrl = trim(Setting::get('voter_pdf_manual_api_url', self::DEFAULT_API_URL));
        $apiKey = trim(Setting::get('voter_pdf_manual_api_key', self::DEFAULT_API_KEY));

        // Normalize URL: ensure .php if using apinice voter-manual-pdf
        if (str_contains($baseUrl, 'apinice.in/api/v2/voter-manual-pdf') && !str_contains($baseUrl, '.php')) {
            $baseUrl = str_replace('voter-manual-pdf', 'voter-manual-pdf.php', $baseUrl);
        }

        // Always append api_key to URL query string because apinice requires it
        $apiUrl = $baseUrl;
        if (!str_contains($apiUrl, 'api_key=')) {
            $apiUrl .= (str_contains($apiUrl, '?') ? '&' : '?') . 'api_key=' . urlencode($apiKey);
        }

        $cfile = new \CURLFile($fullDiskPath, $file->getClientMimeType(), 'imagefile');

        $postData = [
            'api_key'               => $apiKey,
            'epic_no'               => $epicNo,
            'name'                  => $cleanName,
            'gender'                => $gender,
            'father_name'           => $fatherName,
            'father_type'           => $fatherType,
            'tahshil'               => $tahshil,
            'district'              => $district,
            'age'                   => $age,
            'assembly_no_name'      => $assemblyNoName,
            'part_no'               => $partNo,
            'part_name'             => $partName,
            'address'               => $address,
            'language'              => $language,
            'name_local'            => $nameLocal,
            'gender_local'          => $genderLocal,
            'father_name_local'     => $fatherNameLocal,
            'dob_local'             => $dobLocal,
            'assembly_no_name_local'=> $assemblyNoNameLocal,
            'part_name_local'       => $partNameLocal,
            'address_local'         => $addressLocal,
            'imagefile'             => $cfile,
        ];

        try {
            $ch = curl_init($apiUrl);
            curl_setopt_array($ch, [
                CURLOPT_POST           => true,
                CURLOPT_POSTFIELDS     => $postData,
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_HTTPHEADER     => [
                    'X-API-Key: ' . $apiKey,
                    'x-api-key: ' . $apiKey,
                    'api_key: ' . $apiKey,
                    'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                ],
                CURLOPT_SSL_VERIFYPEER => false,
                CURLOPT_CONNECTTIMEOUT => 15,
                CURLOPT_TIMEOUT        => 60,
            ]);

            $rawResponse = curl_exec($ch);
            $curlError = curl_error($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);

            if ($curlError) {
                Log::error('VoterPdfManualInstant cURL Error: ' . $curlError);
                return response()->json([
                    'success' => false,
                    'message' => 'Voter API connection failed: ' . $curlError,
                ], 502);
            }

            $resData = json_decode($rawResponse, true);

            $isSuccess = false;
            if (is_array($resData)) {
                $status = strtolower($resData['status'] ?? '');
                if ($status === 'success' || (isset($resData['data']) && !empty($resData['data']['epic_no']))) {
                    $isSuccess = true;
                }
            }

            if (!$isSuccess) {
                $errMsg = $resData['message'] ?? 'Failed to generate Voter PDF with provider server.';
                return response()->json([
                    'success' => false,
                    'message' => $errMsg,
                    'raw'     => $resData,
                ], 400);
            }

            // Merge API-returned translated fields with our sent inputs
            $apiData = $resData['data'] ?? [];
            $mergedCard = array_merge([
                'epic_no'               => $epicNo,
                'name'                  => $cleanName,
                'name_local'            => $nameLocal ?: ($apiData['name_local'] ?? ''),
                'gender'                => $gender,
                'gender_local'          => $genderLocal ?: ($apiData['gender_local'] ?? ''),
                'father_name'           => $fatherName,
                'father_name_local'     => $fatherNameLocal ?: ($apiData['father_name_local'] ?? ''),
                'father_type'           => $fatherType ?: ($apiData['father_type'] ?? 'Father'),
                'age'                   => $age ?: ($apiData['age'] ?? ''),
                'dob_local'             => $dobLocal ?: ($apiData['dob_local'] ?? ''),
                'tahshil'               => $tahshil ?: ($apiData['tahshil'] ?? ''),
                'district'              => $district ?: ($apiData['district'] ?? ''),
                'assembly_no_name'      => $assemblyNoName ?: ($apiData['assembly_no_name'] ?? ''),
                'assembly_no_name_local'=> $assemblyNoNameLocal ?: ($apiData['assembly_no_name_local'] ?? ''),
                'part_no'               => $partNo ?: ($apiData['part_no'] ?? ''),
                'part_name'             => $partName ?: ($apiData['part_name'] ?? ''),
                'part_name_local'       => $partNameLocal ?: ($apiData['part_name_local'] ?? ''),
                'address'               => $address ?: ($apiData['address'] ?? ''),
                'address_local'         => $addressLocal ?: ($apiData['address_local'] ?? ''),
                'language'              => $language,
            ], $apiData);

            // Deduct coins only after confirmed success
            if (!$isStaff && $coinCost > 0) {
                $user->deductCoins($coinCost, CoinTransaction::TYPE_SERVICE_DEDUCTION, "Voter PDF Manual Instant: {$epicNo}");
            }

            // Create service request entry for tracking
            ServiceRequest::create([
                'user_id'       => $user->id,
                'service_id'    => $service ? $service->id : null,
                'service_name'  => $service ? $service->name : 'Voter PDF Manual Instant',
                'input_data'    => array_merge($mergedCard, [
                    'photo_path' => $storedPath,
                    'photo_url'  => $publicPhotoUrl,
                ]),
                'coins_charged' => $isStaff ? 0 : $coinCost,
                'status'        => ServiceRequest::STATUS_COMPLETED,
                'completed_at'  => now(),
            ]);

            return response()->json([
                'success'       => true,
                'message'       => $resData['message'] ?? 'Voter ID Card generated successfully.',
                'card_data'     => $mergedCard,
                'photo_url'     => $publicPhotoUrl,
                'coins_charged' => $isStaff ? 0 : $coinCost,
            ]);

        } catch (\Throwable $e) {
            Log::error('VoterPdfManualInstant Exception: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Server error: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Admin update API settings for Voter PDF Manual Instant.
     */
    public function updateSettings(Request $request)
    {
        $user = auth()->user();
        if (!$user || !$user->isStaff()) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'api_url' => 'required|url',
            'api_key' => 'nullable|string',
        ]);

        Setting::set('voter_pdf_manual_api_url', trim($request->api_url));
        if ($request->filled('api_key')) {
            Setting::set('voter_pdf_manual_api_key', trim($request->api_key));
        }

        return response()->json([
            'success' => true,
            'message' => 'Voter PDF Manual API settings updated successfully!',
            'apiUrl'  => Setting::get('voter_pdf_manual_api_url'),
            'apiKey'  => Setting::get('voter_pdf_manual_api_key'),
        ]);
    }
}
