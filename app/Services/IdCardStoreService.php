<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class IdCardStoreService
{
    public const ENDPOINTS = [
        'aadhaar' => [
            'name' => 'Aadhaar PVC Card',
            'endpoint' => '/card/make_aadhaar',
            'accepts_password' => true,
            'accepts_phone' => true,
            'icon' => 'fingerprint',
            'coin_cost' => 20,
            'description' => 'Generate PVC Card from e-Aadhaar PDF with password support',
        ],
        'haryana_familyid' => [
            'name' => 'Haryana Family ID',
            'endpoint' => '/card/hr/make_familyid',
            'accepts_password' => false,
            'icon' => 'badge',
            'coin_cost' => 20,
            'description' => 'Generate Print-Ready PVC Front, Back & A4 Sheet from Haryana Family ID PDF',
        ],
        'ayushman' => [
            'name' => 'Ayushman Bharat Card',
            'endpoint' => '/card/make_ayushman',
            'accepts_password' => false,
            'icon' => 'health_and_safety',
            'coin_cost' => 20,
            'description' => 'Generate PVC Card from Ayushman Golden Card PDF',
        ],
        'voter_epic' => [
            'name' => 'Voter (E-EPIC) Card',
            'endpoint' => '/card/make_voter_epic',
            'accepts_password' => false,
            'icon' => 'how_to_vote',
            'coin_cost' => 20,
            'description' => 'Generate PVC Card from e-EPIC Voter Card PDF',
        ],
        'pan_nsdl' => [
            'name' => 'PAN Card (NSDL)',
            'endpoint' => '/card/make_pancard_nsdl',
            'accepts_password' => true,
            'icon' => 'credit_card',
            'coin_cost' => 20,
            'description' => 'Generate PVC Card from NSDL e-PAN PDF',
        ],
        'pan_uti' => [
            'name' => 'PAN Card (UTIITSL)',
            'endpoint' => '/card/make_pancard_uti',
            'accepts_password' => true,
            'icon' => 'credit_card',
            'coin_cost' => 20,
            'description' => 'Generate PVC Card from UTIITSL e-PAN PDF',
        ],
        'pan_incometax' => [
            'name' => 'PAN Card (Instant e-Filing)',
            'endpoint' => '/card/make_pancard_incometax',
            'accepts_password' => true,
            'icon' => 'credit_card',
            'coin_cost' => 20,
            'description' => 'Generate PVC Card from Income Tax Instant e-PAN PDF',
        ],
        'eshram' => [
            'name' => 'e-Shram Card',
            'endpoint' => '/card/make_eshram',
            'accepts_password' => false,
            'icon' => 'engineering',
            'coin_cost' => 20,
            'description' => 'Generate PVC Card from e-Shram Card PDF',
        ],
        'driving_licence' => [
            'name' => 'Make Driving Licence (Cards)',
            'endpoint' => '/card/make_driving_licence',
            'accepts_password' => false,
            'icon' => 'directions_car',
            'coin_cost' => 20,
            'description' => 'Generate Print-Ready PVC Front, Back & A4 Sheet from Driving Licence Number and Date of Birth.',
        ],
        'healthid' => [
            'name' => 'ABHA Health ID',
            'endpoint' => '/card/make_healthid',
            'accepts_password' => false,
            'icon' => 'medical_services',
            'coin_cost' => 20,
            'description' => 'Generate PVC Card from ABHA Health ID PDF',
        ],
        'pmvishwakarma' => [
            'name' => 'PM Vishwakarma Card',
            'endpoint' => '/card/make_pmvishwakarma',
            'accepts_password' => false,
            'icon' => 'handyman',
            'coin_cost' => 20,
            'description' => 'Generate PVC Card from PM Vishwakarma PDF',
        ],
        'aapar' => [
            'name' => 'APAAR / Student ID Card',
            'endpoint' => '/card/make_aapar',
            'accepts_password' => false,
            'icon' => 'school',
            'coin_cost' => 20,
            'description' => 'Generate PVC Card from APAAR Student ID PDF',
        ],
    ];

    protected string $baseUrl;
    protected string $apiKey;
    protected string $cdnUrl;

    public function __construct()
    {
        $this->baseUrl = rtrim(config('services.idcard_store.base_url', 'https://api.idcard.store'), '/');
        $this->apiKey  = trim(\App\Models\Setting::get('idcard_store_api_key') ?: (config('services.idcard_store.api_key') ?: '71ebc340-7c80-4c8f-9613-250094ba27c3'));
        $this->cdnUrl  = rtrim(config('services.idcard_store.cdn_url', 'https://idmaker.mfcdn.in/'), '/');
    }

    /**
     * Check if the API key is configured.
     */
    public function isConfigured(): bool
    {
        return !empty($this->apiKey);
    }

    /**
     * Generate PVC card from uploaded document.
     */
    public function generateCard(string $cardKey, UploadedFile $file, array $extraParams = []): array
    {
        if (!isset(self::ENDPOINTS[$cardKey])) {
            return [
                'success' => false,
                'message' => 'Invalid card type requested.'
            ];
        }

        if (!$this->isConfigured()) {
            return [
                'success' => false,
                'message' => 'IDCard.Store API Key is not configured. Please set IDCARD_STORE_API_KEY in your .env file or admin settings.'
            ];
        }

        $config = self::ENDPOINTS[$cardKey];
        $url = $this->baseUrl . $config['endpoint'];

        $postFields = [];
        if (!empty($extraParams['password'])) {
            $postFields['password'] = $extraParams['password'];
        }
        if ($cardKey === 'aadhaar') {
            $isPhone = !empty($extraParams['phone']) && in_array(strtolower((string)$extraParams['phone']), ['true', 'yes', '1'], true);
            $postFields['phone'] = $isPhone ? 'true' : 'false';
            $postFields['new_design'] = !empty($extraParams['new_design']) ? 'true' : 'false';
        } elseif ($cardKey === 'driving_licence') {
            $postFields['relation'] = $extraParams['relation'] ?? 'DL No';
        } elseif (isset($extraParams['phone'])) {
            $isPhone = in_array(strtolower((string)$extraParams['phone']), ['true', 'yes', '1'], true);
            $postFields['phone'] = $isPhone ? 'true' : 'false';
        }

        try {
            $fileContent = file_get_contents($file->getRealPath());
            $rawName = $file->getClientOriginalName() ?: 'document.pdf';
            // Sanitize filename to prevent multipart encoding issues with non-ASCII / space characters
            $safeFileName = preg_replace('/[^a-zA-Z0-9_\.-]/', '_', $rawName) ?: 'document.pdf';
            if (!str_ends_with(strtolower($safeFileName), '.pdf')) {
                $safeFileName .= '.pdf';
            }

            $response = Http::timeout(60)
                ->connectTimeout(10)
                ->withHeaders([
                    'Authorization' => 'Bearer ' . $this->apiKey,
                    'User-Agent'    => 'CSPJaankari/1.0',
                ])
                ->attach('file', $fileContent, $safeFileName, ['Content-Type' => 'application/pdf'])
                ->post($url, $postFields);

            if ($response->successful()) {
                $data = $response->json();
                return $this->formatSuccessResponse($data, $config);
            }

            $status = $response->status();
            $body = $response->json() ?? [];
            $errorMsg = $body['message'] ?? $body['error'] ?? null;

            // Log detailed response to assist debugging
            Log::warning('IDCardStore API Request Failed', [
                'cardKey'      => $cardKey,
                'status'       => $status,
                'url'          => $url,
                'raw_fileName' => $rawName,
                'safe_fileName'=> $safeFileName,
                'response_body'=> $response->body(),
            ]);

            if (!$errorMsg && isset($body['detail'])) {
                if (is_string($body['detail'])) {
                    $errorMsg = $body['detail'];
                } elseif (is_array($body['detail'])) {
                    $messages = [];
                    foreach ($body['detail'] as $err) {
                        if (isset($err['loc']) && isset($err['msg'])) {
                            $field = end($err['loc']);
                            $messages[] = "$field: " . $err['msg'];
                        } elseif (isset($err['msg'])) {
                            $messages[] = $err['msg'];
                        }
                    }
                    $errorMsg = !empty($messages) ? implode(', ', $messages) : json_encode($body['detail']);
                }
            }

            if ($errorMsg === 'Insufficient funds. Please recharge your account.') {
                $errorMsg = 'idcard.store Wallet Balance Low: Aapke idcard.store account mein balance khatam hai. Kripya idcard.store par jakar wallet recharge karein.';
            } elseif ($errorMsg === 'Invalid card') {
                if ($cardKey === 'haryana_familyid') {
                    $errorMsg = "Uploaded PDF sahi format mein nahi hai. Kripya dhyan dein: Scanner se scan ki hui copy, photo se bani PDF ya browser se 'Print to PDF' support nahi karti. Kripya meraParivar portal (meraparivar.haryana.gov.in) se directly download kiya gaya official 'Parivar Pehchan Patra (Signed PPP)' PDF upload karein.";
                } else {
                    $errorMsg = "Uploaded PDF sahi format mein nahi hai ya is card type se match nahi karta. Kripya original {$config['name']} digital PDF upload karein.";
                }
            }

            if ($status === 401) {
                return [
                    'success' => false,
                    'message' => 'Invalid API Key for idcard.store. Please check your credentials.'
                ];
            }

            if ($status === 403) {
                return [
                    'success' => false,
                    'message' => $errorMsg ?: 'Access denied or insufficient balance on idcard.store wallet.'
                ];
            }

            if ($status === 400) {
                return [
                    'success' => false,
                    'message' => $errorMsg ?: 'Malformed file or invalid password. Please verify the uploaded PDF.'
                ];
            }

            return [
                'success' => false,
                'message' => $errorMsg ?: "API error ($status): Failed to generate card."
            ];

        } catch (\Exception $e) {
            Log::error('IDCardStore API Exception', [
                'cardKey' => $cardKey,
                'error' => $e->getMessage()
            ]);

            return [
                'success' => false,
                'message' => 'Connection failed with IDCard Store API: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Generate Driving Licence PVC card from DL details.
     */
    public function generateDrivingLicenceCard(string $dl, string $dob, string $relation = 'DL No', string $background = 'false', string $cardType = '1'): array
    {
        if (!$this->isConfigured()) {
            return [
                'success' => false,
                'message' => 'IDCard.Store API Key is not configured. Please set IDCARD_STORE_API_KEY in your .env file or admin settings.'
            ];
        }

        $url = $this->baseUrl . '/card/make_driving_licence';

        // Format DOB to DD-MM-YYYY
        $cleanDob = trim($dob);
        if (preg_match('/^(\d{4})-(\d{2})-(\d{2})$/', $cleanDob, $m)) {
            $cleanDob = "{$m[3]}-{$m[2]}-{$m[1]}";
        } elseif (preg_match('/^(\d{2})[-/](\d{2})[-/](\d{4})$/', $cleanDob, $m)) {
            $cleanDob = "{$m[1]}-{$m[2]}-{$m[3]}";
        }

        $cleanDl = strtoupper(trim($dl));
        $cleanRelation = in_array($relation, ['DL No', 'LL No'], true) ? $relation : 'DL No';
        $cleanBg = ($background === 'true' || $background === '1') ? 'true' : 'false';
        $cleanCardType = ($cardType === '2') ? '2' : '1';

        try {
            $response = Http::timeout(60)
                ->connectTimeout(10)
                ->withHeaders([
                    'Authorization' => 'Bearer ' . $this->apiKey,
                    'User-Agent'    => 'CSPJaankari/1.0',
                ])
                ->asMultipart()
                ->post($url, [
                    ['name' => 'relation',   'contents' => $cleanRelation],
                    ['name' => 'dl',         'contents' => $cleanDl],
                    ['name' => 'dob',        'contents' => $cleanDob],
                    ['name' => 'background', 'contents' => $cleanBg],
                    ['name' => 'card_type',  'contents' => $cleanCardType],
                ]);

            if ($response->successful()) {
                $data = $response->json();
                return $this->formatSuccessResponse($data, self::ENDPOINTS['driving_licence']);
            }

            $status = $response->status();
            $body = $response->json() ?? [];
            $errorMsg = $body['message'] ?? $body['error'] ?? $body['detail'] ?? null;

            if (is_array($errorMsg)) {
                $messages = [];
                foreach ($errorMsg as $err) {
                    if (isset($err['msg'])) {
                        $messages[] = $err['msg'];
                    }
                }
                $errorMsg = implode(', ', $messages);
            }

            if ($errorMsg === 'DL Not found') {
                $errorMsg = 'Driving Licence details not found. Kripya apna DL/LL Number aur Date of Birth verify karein.';
            } elseif ($errorMsg === 'Insufficient funds. Please recharge your account.') {
                $errorMsg = 'idcard.store Wallet Balance Low: Aapke idcard.store account mein balance khatam hai. Kripya idcard.store par wallet recharge karein.';
            }

            Log::warning('Driving Licence API Failed', [
                'status' => $status,
                'dl' => $cleanDl,
                'dob' => $cleanDob,
                'response' => $response->body(),
            ]);

            return [
                'success' => false,
                'message' => $errorMsg ?: "Failed to generate Driving Licence card (Error {$status}).",
            ];

        } catch (\Exception $e) {
            Log::error('Driving Licence API Exception', [
                'dl' => $cleanDl,
                'error' => $e->getMessage()
            ]);

            return [
                'success' => false,
                'message' => 'Connection failed with IDCard Store API: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Format the successful response and ensure all asset URLs are absolute CDN links.
     */
    protected function formatSuccessResponse(array $data, array $config): array
    {
        $cards = [];

        if (!empty($data['cards']) && is_array($data['cards'])) {
            foreach ($data['cards'] as $card) {
                $cards[] = [
                    'front'   => $this->ensureCdnUrl($card['front'] ?? null),
                    'back'    => $this->ensureCdnUrl($card['back'] ?? null),
                    'a4'      => $this->ensureCdnUrl($card['a4'] ?? null),
                    'a4_img'  => $this->ensureCdnUrl($card['a4_img'] ?? null),
                ];
            }
        }

        $a4Common = $this->ensureCdnUrl($data['a4_common'] ?? null);

        return [
            'success'   => true,
            'card_name' => $config['name'],
            'cards'     => $cards,
            'a4_common' => $a4Common,
            'sample'    => $data['sample'] ?? false,
            'message'   => $config['name'] . ' PVC card generated successfully!'
        ];
    }

    /**
     * Format relative path into absolute CDN URL.
     */
    protected function ensureCdnUrl(?string $path): ?string
    {
        if (empty($path)) {
            return null;
        }

        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
            return $path;
        }

        return $this->cdnUrl . '/' . ltrim($path, '/');
    }
}
