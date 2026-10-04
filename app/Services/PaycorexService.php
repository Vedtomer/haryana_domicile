<?php

namespace App\Services;

use App\Models\Setting;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PaycorexService
{
    public const DEFAULT_USERNAME = '7494945476';
    public const DEFAULT_API_KEY  = '2d7bcd6c2467d343d9f1110ebd59da51';
    public const DEFAULT_BASE_URL = 'https://paycorex.in/api/v1';

    public function getUsername(): string
    {
        return trim((string) Setting::get('paycorex_username', self::DEFAULT_USERNAME));
    }

    public function getApiKey(): string
    {
        return trim((string) Setting::get('paycorex_api_key', self::DEFAULT_API_KEY));
    }

    public function getBaseUrl(): string
    {
        $url = trim((string) Setting::get('paycorex_base_url', self::DEFAULT_BASE_URL));
        return rtrim($url, '/');
    }

    public function isEnabled(): bool
    {
        $val = Setting::get('paycorex_enabled', '1');
        return filter_var($val, FILTER_VALIDATE_BOOLEAN) || $val === '1' || $val === 1;
    }

    /**
     * Common headers required by PayCoreX API
     */
    protected function getHeaders(?string $username = null, ?string $apiKey = null): array
    {
        return [
            'Content-Type'      => 'application/json',
            'x-client-username' => $username ?: $this->getUsername(),
            'x-client-apikey'   => $apiKey ?: $this->getApiKey(),
        ];
    }

    /**
     * Create an order on PayCoreX and get QR / payment URL
     *
     * @param array $payload [amount, customer_mobile, customer_email, order_id, redirect_url]
     * @return array
     */
    public function createOrder(array $payload): array
    {
        $url = $this->getBaseUrl() . '/create_order.php';
        $headers = $this->getHeaders();

        try {
            $response = Http::withoutVerifying()
                ->timeout(20)
                ->withHeaders($headers)
                ->post($url, [
                    'amount'          => (float) $payload['amount'],
                    'customer_mobile' => (string) ($payload['customer_mobile'] ?? '9999999999'),
                    'customer_email'  => (string) ($payload['customer_email'] ?? 'customer@cspjaankari.in'),
                    'order_id'        => (string) $payload['order_id'],
                    'redirect_url'    => (string) $payload['redirect_url'],
                ]);

            $json = $response->json();

            if ($response->successful() && is_array($json)) {
                return $json;
            }

            Log::warning('PayCoreX create_order returned non-200 or unexpected response', [
                'status' => $response->status(),
                'body'   => $response->body(),
            ]);

            return is_array($json) ? $json : [
                'status'  => 'failure',
                'message' => 'PayCoreX server error (HTTP ' . $response->status() . ')',
            ];
        } catch (\Throwable $e) {
            Log::error('PayCoreX create_order exception: ' . $e->getMessage());
            return [
                'status'  => 'failure',
                'message' => 'Unable to connect to PayCoreX: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Check order status (with optional UTR validation)
     *
     * @param string $orderId
     * @param string|null $utr
     * @return array
     */
    public function checkOrderStatus(string $orderId, ?string $utr = null): array
    {
        $url = $this->getBaseUrl() . '/check_order_status.php';
        $headers = $this->getHeaders();

        $data = ['order_id' => $orderId];
        if (!empty($utr)) {
            $data['utr'] = trim($utr);
        }

        try {
            $response = Http::withoutVerifying()
                ->timeout(15)
                ->withHeaders($headers)
                ->post($url, $data);

            $json = $response->json();
            if ($response->successful() && is_array($json)) {
                return $json;
            }

            // Fallback: check /check_status.php if check_order_status failed
            if (empty($utr)) {
                return $this->checkStatus($orderId);
            }

            return is_array($json) ? $json : [
                'status'       => 'failure',
                'order_status' => 'PENDING',
                'message'      => 'Status check failed: HTTP ' . $response->status(),
            ];
        } catch (\Throwable $e) {
            Log::error('PayCoreX check_order_status exception: ' . $e->getMessage());
            return [
                'status'       => 'failure',
                'order_status' => 'PENDING',
                'message'      => $e->getMessage(),
            ];
        }
    }

    /**
     * Basic check status endpoint (/check_status.php)
     */
    public function checkStatus(string $orderId): array
    {
        $url = $this->getBaseUrl() . '/check_status.php';
        $headers = $this->getHeaders();

        try {
            $response = Http::withoutVerifying()
                ->timeout(15)
                ->withHeaders($headers)
                ->post($url, ['order_id' => $orderId]);

            $json = $response->json();
            return is_array($json) ? $json : [
                'status'  => 'failure',
                'message' => 'Failed to check order status.',
            ];
        } catch (\Throwable $e) {
            return [
                'status'  => 'failure',
                'message' => $e->getMessage(),
            ];
        }
    }

    /**
     * Validate UTR endpoint (/validate_utr.php)
     */
    public function validateUtr(string $orderId, string $utr): array
    {
        $url = $this->getBaseUrl() . '/validate_utr.php';
        $headers = $this->getHeaders();

        try {
            $response = Http::withoutVerifying()
                ->timeout(15)
                ->withHeaders($headers)
                ->post($url, [
                    'order_id' => $orderId,
                    'utr'      => trim($utr),
                ]);

            $json = $response->json();
            return is_array($json) ? $json : [
                'status'  => false,
                'message' => 'Failed to validate UTR.',
            ];
        } catch (\Throwable $e) {
            return [
                'status'  => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    /**
     * Test connection to PayCoreX with custom or saved credentials
     */
    public function testConnection(?string $username = null, ?string $apiKey = null, ?string $baseUrl = null): array
    {
        $base = $baseUrl ? rtrim($baseUrl, '/') : $this->getBaseUrl();
        $url = $base . '/check_order_status.php';
        $headers = $this->getHeaders($username, $apiKey);

        try {
            $response = Http::withoutVerifying()
                ->timeout(10)
                ->withHeaders($headers)
                ->post($url, ['order_id' => 'TEST_PING_' . time()]);

            $json = $response->json();

            // Also test create_order to see subscription status
            $createTest = Http::withoutVerifying()
                ->timeout(10)
                ->withHeaders($headers)
                ->post($base . '/create_order.php', [
                    'amount'          => 1.00,
                    'customer_mobile' => '9999999999',
                    'customer_email'  => 'test@example.com',
                    'order_id'        => 'TEST_PING_' . time(),
                    'redirect_url'    => 'https://example.com',
                ]);
            $createJson = $createTest->json();

            return [
                'success'           => true,
                'http_status'       => $response->status(),
                'check_response'    => $json,
                'create_response'   => $createJson,
                'subscription_note' => $createJson['message'] ?? null,
            ];
        } catch (\Throwable $e) {
            return [
                'success' => false,
                'message' => $e->getMessage(),
            ];
        }
    }
}
