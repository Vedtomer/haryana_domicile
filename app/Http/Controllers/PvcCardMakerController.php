<?php

namespace App\Http\Controllers;

use App\Models\CoinTransaction;
use App\Models\Service;
use App\Models\ServiceRequest;
use App\Services\IdCardStoreService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PvcCardMakerController extends Controller
{
    public const CARD_SLUG_MAP = [
        'haryana_familyid' => 'haryana-familyid-pvc',
        'ayushman'         => 'ayushman-pvc',
        'voter_epic'       => 'voter-pvc-card',
        'pan_nsdl'         => 'pan-nsdl-pvc',
        'pan_uti'          => 'pan-uti-pvc',
        'pan_incometax'    => 'pan-instant-pvc',
        'eshram'           => 'eshram-pvc-card',
        'driving_licence'  => 'make-driving-licence-card',
        'healthid'         => 'healthid-pvc',
        'pmvishwakarma'    => 'pmvishwakarma-pvc',
        'aapar'            => 'aapar-pvc',
    ];

    public function index(Request $request)
    {
        $user = auth()->user();
        $isAdmin = $this->isStaff();

        $selectedCard = $request->query('card', 'haryana_familyid');
        if ($selectedCard === 'driving_licence' || $selectedCard === 'driving-licence-pvc') {
            return redirect()->route('utilities.make-driving-licence-card');
        }

        $cards = IdCardStoreService::ENDPOINTS;

        $dbServices = Service::whereIn('slug', array_values(self::CARD_SLUG_MAP))->get()->keyBy('slug');
        $genericService = Service::where('slug', 'pvc-card-maker')->first();
        $fallbackCost = $genericService ? $genericService->coin_cost : 20;

        $cardsData = [];
        foreach ($cards as $key => $card) {
            $slug = self::CARD_SLUG_MAP[$key] ?? null;
            $dbServ = $slug ? ($dbServices[$slug] ?? null) : null;
            $cost = $dbServ ? $dbServ->coin_cost : $fallbackCost;
            $name = $dbServ ? $dbServ->name : $card['name'];
            $desc = $dbServ ? $dbServ->description : $card['description'];

            $cardsData[] = [
                'key'              => $key,
                'name'             => $name,
                'description'      => $desc,
                'icon'             => $card['icon'],
                'accepts_password' => $card['accepts_password'],
                'accepts_phone'    => $card['accepts_phone'] ?? false,
                'coin_cost'        => $cost,
            ];
        }

        $activeKey = trim(\App\Models\Setting::get('idcard_store_api_key') ?: (config('services.idcard_store.api_key') ?: '71ebc340-7c80-4c8f-9613-250094ba27c3'));

        return Inertia::render('Utilities/PvcCardMaker', [
            'cards'         => $cardsData,
            'defaultCard'   => $selectedCard,
            'isStandalone'  => $request->has('card'),
            'userCoins'     => $user->coins,
            'isAdmin'       => $isAdmin,
            'isConfigured'  => !empty($activeKey),
            'apiKey'        => $isAdmin ? $activeKey : null,
        ]);
    }

    public function saveApiKey(Request $request)
    {
        if (!$this->isStaff()) {
            return response()->json(['success' => false, 'message' => 'Unauthorized.'], 403);
        }

        $request->validate([
            'api_key' => 'required|string|min:5'
        ]);

        $key = trim($request->input('api_key'));
        \App\Models\Setting::set('idcard_store_api_key', $key);

        return response()->json([
            'success' => true,
            'message' => 'IDCard.Store API Key saved successfully!',
        ]);
    }

    public function generate(Request $request, IdCardStoreService $idCardStoreService)
    {
        $request->validate([
            'card_type' => 'required|string',
            'file'      => 'required|file|mimes:pdf|max:15360',
            'password'  => 'nullable|string|max:100',
            'phone'     => 'nullable|string|max:10',
        ]);

        $cardType = $request->input('card_type');
        if (!isset(IdCardStoreService::ENDPOINTS[$cardType])) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid card type specified.',
            ], 422);
        }

        $user = auth()->user();
        $isAdmin = $this->isStaff();

        $slug = self::CARD_SLUG_MAP[$cardType] ?? 'pvc-card-maker';
        $dbService = Service::where('slug', $slug)->first() ?: Service::where('slug', 'pvc-card-maker')->first();
        $coinCost = $dbService ? $dbService->coin_cost : 20;

        if (!$isAdmin && $user->coins < $coinCost) {
            return response()->json([
                'success' => false,
                'message' => "Insufficient coins. You need {$coinCost} coins to generate this card.",
            ]);
        }

        $file = $request->file('file');
        $extraParams = [];
        if ($request->filled('password')) {
            $extraParams['password'] = $request->input('password');
        }
        if ($request->has('phone')) {
            $extraParams['phone'] = $request->input('phone');
        }

        $result = $idCardStoreService->generateCard($cardType, $file, $extraParams);

        if (!$result['success']) {
            return response()->json([
                'success' => false,
                'message' => $result['message'],
            ]);
        }

        // Deduct coins if not admin
        if (!$isAdmin && $coinCost > 0) {
            $user->deductCoins(
                $coinCost,
                CoinTransaction::TYPE_SERVICE_DEDUCTION,
                ($dbService ? $dbService->name : ($result['card_name'] ?? $cardType)) . ' Generation'
            );
        }

        // Record service request in database
        ServiceRequest::create([
            'user_id'       => $user->id,
            'service_id'    => $dbService ? $dbService->id : null,
            'service_name'  => $dbService ? $dbService->name : ('PVC Card Maker: ' . ($result['card_name'] ?? $cardType)),
            'input_data'    => [
                'card_type' => $cardType,
                'file_name' => $file->getClientOriginalName(),
                'has_password' => $request->filled('password'),
            ],
            'coins_charged' => $isAdmin ? 0 : $coinCost,
            'status'        => ServiceRequest::STATUS_COMPLETED,
            'completed_at'  => now(),
        ]);

        return response()->json([
            'success'   => true,
            'message'   => $result['message'] ?? 'PVC Card generated successfully!',
            'card_name' => $result['card_name'],
            'cards'     => $result['cards'] ?? [],
            'a4_common' => $result['a4_common'] ?? null,
            'sample'    => $result['sample'] ?? false,
            'userCoins' => $user->fresh()->coins,
        ]);
    }

    /**
     * Proxy asset download with forced Content-Disposition: attachment
     * so that browser directly downloads the file instead of previewing it in a new tab.
     */
    public function downloadAsset(Request $request)
    {
        $url = $request->query('url');
        $rawFilename = $request->query('filename') ?: 'card_asset.png';

        if (!$url) {
            abort(400, 'URL parameter is missing.');
        }

        // Sanitize filename to avoid header injection and path traversal
        $safeFilename = preg_replace('/[^a-zA-Z0-9_\.-]/', '_', $rawFilename);
        if (!pathinfo($safeFilename, PATHINFO_EXTENSION)) {
            $safeFilename .= '.png';
        }

        // Check if the URL is a local public storage path or absolute URL
        $parsed = parse_url($url);
        $host = $parsed['host'] ?? null;
        $appHost = parse_url(config('app.url'), PHP_URL_HOST);

        if (!$host || $host === $appHost || $host === 'localhost') {
            $path = $parsed['path'] ?? $url;
            $cleanPath = preg_replace('#^/?storage/#', '', $path);
            $localCandidate = storage_path('app/public/' . $cleanPath);
            if (file_exists($localCandidate)) {
                return response()->download($localCandidate, $safeFilename, [
                    'Content-Disposition' => 'attachment; filename="' . $safeFilename . '"',
                ]);
            }
        }

        // Allowed remote hosts
        $allowedHosts = [
            'idmaker.mfcdn.in',
            'api.idcard.store',
        ];

        $isAllowed = false;
        foreach ($allowedHosts as $allowed) {
            if ($host === $allowed || ($host && str_ends_with($host, '.' . $allowed))) {
                $isAllowed = true;
                break;
            }
        }

        if (!$isAllowed) {
            abort(403, 'Unauthorized domain for download.');
        }

        try {
            $response = \Illuminate\Support\Facades\Http::timeout(60)->get($url);
            if (!$response->successful()) {
                abort(404, 'File could not be fetched from remote server.');
            }

            $contentType = $response->header('Content-Type') ?: 'application/octet-stream';
            $content = $response->body();

            return response($content, 200, [
                'Content-Type'        => $contentType,
                'Content-Disposition' => 'attachment; filename="' . $safeFilename . '"',
                'Content-Length'      => strlen($content),
                'Cache-Control'       => 'no-cache, no-store, must-revalidate',
                'Pragma'              => 'no-cache',
                'Expires'             => '0',
            ]);
        } catch (\Throwable $e) {
            abort(500, 'Download failed: ' . $e->getMessage());
        }
    }

    /**
     * Download front or back image for Filament Aadhaar PDF Converter
     */
    public function downloadPdfConverterImage(\App\Models\PdfConverter $record, string $type)
    {
        $user = auth()->user();
        if (!$user) {
            abort(401);
        }

        if (!$user->isAdmin() && !$user->hasRole('super_admin') && $record->user_id !== $user->id) {
            abort(403, 'Unauthorized access.');
        }

        $field = ($type === 'back') ? 'back_image_path' : 'front_image_path';
        $relative = $record->$field;

        if (!$relative) {
            abort(404, 'Image path not recorded.');
        }

        $path = storage_path('app/public/' . $relative);
        if (!file_exists($path)) {
            abort(404, 'File not found on server.');
        }

        $ext = pathinfo($path, PATHINFO_EXTENSION) ?: 'png';
        $baseName = pathinfo($record->original_filename ?: 'aadhar_card', PATHINFO_FILENAME);
        $safeBase = preg_replace('/[^a-zA-Z0-9_\.-]/', '_', $baseName) ?: 'aadhar_card';
        $filename = "{$safeBase}_{$type}.{$ext}";

        return response()->download($path, $filename, [
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
            'Content-Type'        => 'image/' . ($ext === 'jpg' ? 'jpeg' : $ext),
        ]);
    }
}
