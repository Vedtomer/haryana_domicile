<?php

namespace App\Http\Controllers;

use App\Models\CoinTransaction;
use App\Models\Service;
use App\Models\ServiceRequest;
use App\Services\IdCardStoreService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class KundliController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();
        $isAdmin = $this->isStaff();

        $service = Service::where('slug', 'kundli-generator')->first();
        $coinCost = $service ? $service->coin_cost : 20;

        return Inertia::render('Utilities/Kundli', [
            'coinCost'  => $coinCost,
            'userCoins' => $user->coins,
            'isAdmin'   => $isAdmin,
            'service'   => $service ? [
                'id'          => $service->id,
                'name'        => $service->name,
                'description' => $service->description,
                'coin_cost'   => $service->coin_cost,
            ] : [
                'name'        => 'Kundli Generator (Janam Kundli)',
                'description' => 'Generate and print detailed Janam Kundli with charts & planetary predictions.',
                'coin_cost'   => 20,
            ],
        ]);
    }

    public function searchCities(Request $request)
    {
        $query = trim($request->query('query', ''));
        if (strlen($query) < 2) {
            return response()->json(['data' => []]);
        }

        try {
            $url = 'https://kundli.amd64.workers.dev/AstroChat/cities/allcountries/autocomplete?limit=10&key=' . urlencode($query);
            $response = Http::timeout(8)->get($url);

            if ($response->successful()) {
                $raw = $response->json();
                $items = [];
                foreach ($raw['data'] ?? [] as $city) {
                    $label = $city['name'];
                    if (!empty($city['state'])) {
                        $label .= ', ' . $city['state'];
                    }
                    if (!empty($city['countryName'])) {
                        $label .= ', ' . $city['countryName'];
                    } elseif (!empty($city['countryCode'])) {
                        $label .= ', ' . $city['countryCode'];
                    }

                    $items[] = [
                        'label'          => $label,
                        'name'           => $city['name'],
                        'state'          => $city['state'] ?? '',
                        'country'        => $city['countryName'] ?? ($city['countryCode'] ?? ''),
                        'latitude'       => $city['latitude'],
                        'longitude'      => $city['longitude'],
                        'timezoneOffset' => $city['timezoneOffset'] ?? 5.5,
                    ];
                }
                return response()->json(['data' => $items]);
            }
        } catch (\Throwable $e) {
            Log::warning('Kundli city autocomplete error: ' . $e->getMessage());
        }

        return response()->json(['data' => []]);
    }

    public function generate(Request $request, IdCardStoreService $idCardStoreService)
    {
        $request->validate([
            'name'   => 'required|string|max:100',
            'gender' => 'required|in:male,female',
            'day'    => 'required|integer|between:1,31',
            'month'  => 'required|integer|between:1,12',
            'year'   => 'required|integer|between:1900,2030',
            'hour'   => 'required|integer|between:0,23',
            'min'    => 'required|integer|between:0,59',
            'sec'    => 'nullable|integer|between:0,59',
            'lang'   => 'required|in:1,2',
            'place'  => 'required|string|max:150',
            'tzone'  => 'required|numeric',
            'lat'    => 'required|numeric',
            'lon'    => 'required|numeric',
        ]);

        $user = auth()->user();
        $isAdmin = $this->isStaff();

        $service = Service::where('slug', 'kundli-generator')->first();
        $cost = $service ? $service->coin_cost : 20;

        if (!$isAdmin && $user->coins < $cost) {
            return response()->json([
                'success' => false,
                'message' => "Insufficient coins. This service requires {$cost} coins. (Your balance: {$user->coins} coins)"
            ], 422);
        }

        $deducted = false;
        if (!$isAdmin && $cost > 0) {
            $user->deductCoins($cost, CoinTransaction::TYPE_SERVICE_DEDUCTION, 'Kundli Generator: ' . $request->input('name'));
            $deducted = true;
        }

        try {
            $result = $idCardStoreService->generateKundli($request->all());

            if (!$result['success']) {
                if ($deducted) {
                    $user->addCoins($cost, CoinTransaction::TYPE_ADMIN_ADD, 'Refund: Kundli generation failed');
                }
                return response()->json([
                    'success' => false,
                    'message' => $result['message'] ?? 'Failed to generate Kundli from API.'
                ], 422);
            }

            // Create service request record
            ServiceRequest::create([
                'user_id'        => $user->id,
                'service_id'     => $service?->id,
                'service_name'   => 'Kundli Generator (Janam Kundli)',
                'input_data'     => [
                    'name'   => $request->input('name'),
                    'gender' => $request->input('gender'),
                    'dob'    => sprintf('%02d/%02d/%04d', $request->input('day'), $request->input('month'), $request->input('year')),
                    'tob'    => sprintf('%02d:%02d', $request->input('hour'), $request->input('min')),
                    'place'  => $request->input('place'),
                    'lang'   => $request->input('lang') == '2' ? 'Hindi' : 'English',
                ],
                'coins_charged'  => $deducted ? $cost : 0,
                'status'         => ServiceRequest::STATUS_COMPLETED,
                'admin_response' => 'Kundli generated successfully via API.',
            ]);

            return response()->json([
                'success'   => true,
                'html_url'  => $result['html_url'],
                'message'   => 'Janam Kundli generated successfully!',
                'userCoins' => $user->fresh()->coins,
            ]);
        } catch (\Throwable $e) {
            if ($deducted) {
                $user->addCoins($cost, CoinTransaction::TYPE_ADMIN_ADD, 'Refund: Kundli generation system error');
            }
            Log::error('KundliController Error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'An unexpected error occurred: ' . $e->getMessage()
            ], 500);
        }
    }

    public function downloadAsset(Request $request)
    {
        $url = $request->query('url');
        $filename = $request->query('filename', 'kundli.html');

        if (!$url || !filter_var($url, FILTER_VALIDATE_URL)) {
            abort(400, 'Invalid asset URL');
        }

        $host = parse_url($url, PHP_URL_HOST);
        $allowedHosts = ['idmaker.mfcdn.in', 'api.idcard.store', 'idcard.store'];
        if (!in_array($host, $allowedHosts, true) && !str_ends_with($host, '.mfcdn.in')) {
            abort(403, 'Asset host not allowed');
        }

        try {
            $response = Http::timeout(30)->get($url);
            if (!$response->successful()) {
                abort(404, 'File not found on asset server');
            }

            return response($response->body(), 200, [
                'Content-Type'        => 'text/html; charset=utf-8',
                'Content-Disposition' => 'attachment; filename="' . addslashes($filename) . '"',
                'Cache-Control'       => 'private, max-age=3600',
            ]);
        } catch (\Throwable $e) {
            abort(502, 'Could not fetch asset: ' . $e->getMessage());
        }
    }
}
