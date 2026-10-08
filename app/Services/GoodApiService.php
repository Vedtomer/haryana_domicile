<?php

namespace App\Services;

use App\Models\Setting;
use Illuminate\Support\Facades\Http;

class GoodApiService
{
    const MASTER_KEY = 'ebee2f1362ef867dc06dee82f9bbef5d1780d7ba9218fe28f6f3217c386a52e1';
    const MASTER_TOKEN = 'aad64221e95f917989f63acd377c94f9054c3d85378ae3f512e6b74e958a4b22';

    const DEAD_KEYS = [
        '38cc07892c07c566e3ce1a3289c589e284954d7c0e593386',
        'ff43c0db8b9cdb5869ccac19872ce22936bc8508e8baaa66885aa5ec96289a41',
        'ENTER_API_KEY',
        'ENTER_KEY',
    ];

    /**
     * Get the active Good API Key, automatically resolving from setting or master fallback.
     */
    public static function getApiKey(?string $serviceSpecificKey = null): string
    {
        $candidate = trim((string) $serviceSpecificKey);
        if (!empty($candidate) && !in_array($candidate, self::DEAD_KEYS)) {
            return $candidate;
        }

        $candidate = trim((string) Setting::get('goodapi_api_key'));
        if (!empty($candidate) && !in_array($candidate, self::DEAD_KEYS)) {
            return $candidate;
        }

        $candidate = trim((string) Setting::get('nexus_api_key'));
        if (!empty($candidate) && !in_array($candidate, self::DEAD_KEYS)) {
            return $candidate;
        }

        return self::MASTER_KEY;
    }

    /**
     * Get the active Good API Token ID.
     */
    public static function getTokenId(): string
    {
        $candidate = trim((string) Setting::get('goodapi_token_id'));
        if (!empty($candidate)) {
            return $candidate;
        }

        return self::MASTER_TOKEN;
    }

    /**
     * Get standard HTTP headers required by Good API Partner gateway.
     */
    public static function getHeaders(?string $apiKey = null): array
    {
        $key = self::getApiKey($apiKey);
        $token = self::getTokenId();

        return [
            'User-Agent'    => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept'        => 'application/json, application/pdf, text/plain, */*',
            'X-API-KEY'     => $key,
            'api-key'       => $key,
            'Token-ID'      => $token,
            'token'         => $token,
            'Authorization' => 'Bearer ' . $key,
        ];
    }

    /**
     * Create an Http client preconfigured with timeouts and complete authentication headers.
     */
    public static function client(int $timeout = 45, ?string $apiKey = null)
    {
        return Http::withHeaders(self::getHeaders($apiKey))
            ->connectTimeout(12)
            ->timeout($timeout);
    }

    /**
     * Build URL with both query parameters and auth params injected.
     */
    public static function buildUrl(string $baseUrl, array $params = [], ?string $apiKey = null): string
    {
        $key = self::getApiKey($apiKey);
        $token = self::getTokenId();

        // Remove dead nexus domain
        if (str_contains($baseUrl, 'nexus-dashboard.space')) {
            $baseUrl = str_replace('nexus-dashboard.space', 'good-api-point.com', $baseUrl);
        }

        // Clean query placeholders if pasted literally
        if (str_contains($baseUrl, 'apiKey=ENTER_API_KEY') || str_contains($baseUrl, 'apiKey=')) {
            $parts = explode('?', $baseUrl);
            $baseUrl = $parts[0];
        }

        $params['apiKey'] = $key;
        $params['token'] = $token;

        $separator = str_contains($baseUrl, '?') ? '&' : '?';
        return $baseUrl . $separator . http_build_query($params);
    }
}
