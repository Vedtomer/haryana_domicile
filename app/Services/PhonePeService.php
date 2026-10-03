<?php

namespace App\Services;

use App\Models\Setting;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PhonePeService
{
    /**
     * Check if PhonePe is enabled
     */
    public function isEnabled(): bool
    {
        return Setting::get('phonepe_enabled', '0') === '1';
    }

    /**
     * Get environment mode: 'sandbox' or 'production'
     */
    public function getMode(): string
    {
        return Setting::get('phonepe_mode', 'sandbox');
    }

    public function isSandbox(): bool
    {
        return $this->getMode() === 'sandbox';
    }

    /**
     * Get API version: 'v2' (OAuth / Client ID) or 'v1' (Merchant ID / Salt Key)
     */
    public function getVersion(): string
    {
        $explicit = Setting::get('phonepe_version');
        if ($explicit) {
            return $explicit;
        }

        // Auto-detect based on filled credentials
        if (!empty(Setting::get('phonepe_client_id')) && !empty(Setting::get('phonepe_client_secret'))) {
            return 'v2';
        }

        return 'v1';
    }

    /**
     * Check if minimum credentials exist to initiate payments
     */
    public function isConfigured(): bool
    {
        if ($this->getVersion() === 'v2') {
            return !empty(Setting::get('phonepe_client_id')) && !empty(Setting::get('phonepe_client_secret'));
        }

        return !empty(Setting::get('phonepe_merchant_id')) && !empty(Setting::get('phonepe_salt_key'));
    }

    /**
     * Get OAuth token for v2 Standard Checkout
     */
    public function getV2AccessToken(): ?string
    {
        $clientId = trim((string) Setting::get('phonepe_client_id'));
        $clientSecret = trim((string) Setting::get('phonepe_client_secret'));
        $clientVersion = trim((string) Setting::get('phonepe_client_version', '1')) ?: '1';

        if (empty($clientId) || empty($clientSecret)) {
            Log::error('PhonePe v2: Missing client_id or client_secret');
            return null;
        }

        $cacheKey = "phonepe_v2_token_{$this->getMode()}_" . substr($clientId, 0, 8);
        $cachedToken = Cache::get($cacheKey);
        if ($cachedToken) {
            return $cachedToken;
        }

        $tokenUrl = $this->isSandbox()
            ? 'https://api-preprod.phonepe.com/apis/pg-sandbox/v1/oauth/token'
            : 'https://api.phonepe.com/apis/identity-manager/v1/oauth/token';

        try {
            $response = Http::asForm()
                ->timeout(15)
                ->post($tokenUrl, [
                    'client_id'      => $clientId,
                    'client_version' => $clientVersion,
                    'client_secret'  => $clientSecret,
                    'grant_type'     => 'client_credentials',
                ]);

            if ($response->successful()) {
                $data = $response->json();
                $token = $data['access_token'] ?? $data['data']['access_token'] ?? null;
                $expiresIn = (int) ($data['expires_in'] ?? 3600);

                if ($token) {
                    Cache::put($cacheKey, $token, max(60, $expiresIn - 120));
                    return $token;
                }
            }

            Log::error('PhonePe v2 OAuth Token failed', [
                'status'   => $response->status(),
                'response' => $response->body(),
            ]);
        } catch (\Throwable $e) {
            Log::error('PhonePe v2 OAuth Token exception: ' . $e->getMessage());
        }

        return null;
    }

    /**
     * Initiate Payment Request
     *
     * @param string $merchantOrderId
     * @param int $amountInRupees
     * @param string $redirectUrl
     * @param string $callbackUrl
     * @param array $userMeta
     * @return array ['success' => bool, 'redirectUrl' => string|null, 'orderId' => string, 'error' => string|null]
     */
    public function initiatePayment(string $merchantOrderId, int $amountInRupees, string $redirectUrl, string $callbackUrl, array $userMeta = []): array
    {
        $amountInPaise = $amountInRupees * 100;
        $version = $this->getVersion();

        if ($version === 'v2') {
            return $this->initiatePaymentV2($merchantOrderId, $amountInPaise, $redirectUrl, $callbackUrl, $userMeta);
        }

        return $this->initiatePaymentV1($merchantOrderId, $amountInPaise, $redirectUrl, $callbackUrl, $userMeta);
    }

    /**
     * PhonePe v2 Checkout Pay
     */
    protected function initiatePaymentV2(string $merchantOrderId, int $amountInPaise, string $redirectUrl, string $callbackUrl, array $userMeta): array
    {
        $token = $this->getV2AccessToken();
        if (!$token) {
            return [
                'success' => false,
                'redirectUrl' => null,
                'orderId' => $merchantOrderId,
                'error' => 'Unable to authenticate with PhonePe Payment Gateway. Please verify API credentials in Admin Settings.',
            ];
        }

        $payUrl = $this->isSandbox()
            ? 'https://api-preprod.phonepe.com/apis/pg-sandbox/checkout/v2/pay'
            : 'https://api.phonepe.com/apis/pg/checkout/v2/pay';

        $payload = [
            'merchantOrderId' => $merchantOrderId,
            'amount'          => $amountInPaise,
            'expireAfter'     => 900,
            'meta'            => [
                'name'  => $userMeta['name'] ?? 'User',
                'phone' => !empty($userMeta['phone']) ? preg_replace('/[^0-9]/', '', $userMeta['phone']) : null,
                'email' => $userMeta['email'] ?? null,
            ],
            'paymentFlow'     => [
                'type'         => 'PG_CHECKOUT',
                'message'      => 'CSP Jaankari Coin Recharge',
                'merchantUrls' => [
                    'redirectUrl' => $redirectUrl,
                ],
            ],
        ];

        try {
            $response = Http::withHeaders([
                'Authorization' => "Oauth {$token}",
                'Content-Type'  => 'application/json',
            ])->timeout(20)->post($payUrl, $payload);

            $data = $response->json();

            if ($response->successful() && !empty($data['redirectUrl'])) {
                return [
                    'success'     => true,
                    'redirectUrl' => $data['redirectUrl'],
                    'orderId'     => $merchantOrderId,
                    'gatewayId'   => $data['orderId'] ?? null,
                    'error'       => null,
                ];
            }

            Log::error('PhonePe v2 Pay Request Error', [
                'payload'  => $payload,
                'status'   => $response->status(),
                'response' => $data,
            ]);

            return [
                'success'     => false,
                'redirectUrl' => null,
                'orderId'     => $merchantOrderId,
                'error'       => $data['message'] ?? 'Payment gateway could not initiate transaction. Please check credentials or try again.',
            ];
        } catch (\Throwable $e) {
            Log::error('PhonePe v2 Pay Exception: ' . $e->getMessage());
            return [
                'success'     => false,
                'redirectUrl' => null,
                'orderId'     => $merchantOrderId,
                'error'       => 'Connection to PhonePe failed: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * PhonePe v1 Pay Request (Merchant ID & Salt Key)
     */
    protected function initiatePaymentV1(string $merchantOrderId, int $amountInPaise, string $redirectUrl, string $callbackUrl, array $userMeta): array
    {
        $merchantId = trim((string) Setting::get('phonepe_merchant_id'));
        $saltKey = trim((string) Setting::get('phonepe_salt_key'));
        $saltIndex = trim((string) Setting::get('phonepe_salt_index', '1')) ?: '1';

        if (empty($merchantId) || empty($saltKey)) {
            return [
                'success' => false,
                'redirectUrl' => null,
                'orderId' => $merchantOrderId,
                'error' => 'PhonePe Merchant ID or Salt Key is not configured in Admin Settings.',
            ];
        }

        $payUrl = $this->isSandbox()
            ? 'https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay'
            : 'https://api.phonepe.com/apis/hermes/pg/v1/pay';

        $payload = [
            'merchantId'            => $merchantId,
            'merchantTransactionId' => $merchantOrderId,
            'merchantUserId'        => 'MUID_' . ($userMeta['user_id'] ?? '1'),
            'amount'                => $amountInPaise,
            'redirectUrl'           => $redirectUrl,
            'redirectMode'          => 'POST',
            'callbackUrl'           => $callbackUrl,
            'mobileNumber'          => !empty($userMeta['phone']) ? preg_replace('/[^0-9]/', '', $userMeta['phone']) : null,
            'paymentInstrument'     => [
                'type' => 'PAY_PAGE',
            ],
        ];

        $encodedPayload = base64_encode(json_encode($payload));
        $xVerify = hash('sha256', $encodedPayload . '/pg/v1/pay' . $saltKey) . '###' . $saltIndex;

        try {
            $response = Http::withHeaders([
                'Content-Type' => 'application/json',
                'X-VERIFY'     => $xVerify,
            ])->timeout(20)->post($payUrl, [
                'request' => $encodedPayload,
            ]);

            $data = $response->json();

            if ($response->successful() && ($data['success'] ?? false) === true) {
                $targetUrl = $data['data']['instrumentResponse']['redirectInfo']['url'] ?? null;
                if ($targetUrl) {
                    return [
                        'success'     => true,
                        'redirectUrl' => $targetUrl,
                        'orderId'     => $merchantOrderId,
                        'gatewayId'   => $data['data']['transactionId'] ?? null,
                        'error'       => null,
                    ];
                }
            }

            Log::error('PhonePe v1 Pay Request Error', [
                'status'   => $response->status(),
                'response' => $data,
            ]);

            return [
                'success'     => false,
                'redirectUrl' => null,
                'orderId'     => $merchantOrderId,
                'error'       => $data['message'] ?? 'Payment gateway could not initiate transaction.',
            ];
        } catch (\Throwable $e) {
            Log::error('PhonePe v1 Pay Exception: ' . $e->getMessage());
            return [
                'success'     => false,
                'redirectUrl' => null,
                'orderId'     => $merchantOrderId,
                'error'       => 'Connection to PhonePe failed: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Verify payment status directly from PhonePe API
     *
     * @param string $merchantOrderId
     * @return array ['success' => bool, 'state' => string, 'amount' => int, 'transactionId' => string|null, 'error' => string|null]
     */
    public function verifyPayment(string $merchantOrderId): array
    {
        $version = $this->getVersion();

        if ($version === 'v2') {
            return $this->verifyPaymentV2($merchantOrderId);
        }

        return $this->verifyPaymentV1($merchantOrderId);
    }

    /**
     * Verify v2 Order Status
     */
    protected function verifyPaymentV2(string $merchantOrderId): array
    {
        $token = $this->getV2AccessToken();
        if (!$token) {
            return [
                'success' => false,
                'state'   => 'AUTH_FAILED',
                'amount'  => 0,
                'error'   => 'Could not generate OAuth token for status check.',
            ];
        }

        $statusUrl = $this->isSandbox()
            ? "https://api-preprod.phonepe.com/apis/pg-sandbox/checkout/v2/order/{$merchantOrderId}/status"
            : "https://api.phonepe.com/apis/pg/checkout/v2/order/{$merchantOrderId}/status";

        try {
            $response = Http::withHeaders([
                'Authorization' => "Oauth {$token}",
            ])->timeout(15)->get($statusUrl);

            $data = $response->json();
            $state = strtoupper($data['state'] ?? 'UNKNOWN');

            // PhonePe v2 COMPLETED state indicates successful capture
            if ($response->successful() && $state === 'COMPLETED') {
                return [
                    'success'       => true,
                    'state'         => 'COMPLETED',
                    'amount'        => (int) (($data['amount'] ?? 0) / 100),
                    'transactionId' => $data['transactionId'] ?? $data['orderId'] ?? $merchantOrderId,
                    'raw'           => $data,
                    'error'         => null,
                ];
            }

            return [
                'success'       => false,
                'state'         => $state,
                'amount'        => (int) (($data['amount'] ?? 0) / 100),
                'transactionId' => $data['transactionId'] ?? null,
                'raw'           => $data,
                'error'         => $data['message'] ?? "Payment status: {$state}",
            ];
        } catch (\Throwable $e) {
            Log::error('PhonePe v2 Status Check Exception: ' . $e->getMessage());
            return [
                'success' => false,
                'state'   => 'ERROR',
                'amount'  => 0,
                'error'   => $e->getMessage(),
            ];
        }
    }

    /**
     * Verify v1 Order Status
     */
    protected function verifyPaymentV1(string $merchantOrderId): array
    {
        $merchantId = trim((string) Setting::get('phonepe_merchant_id'));
        $saltKey = trim((string) Setting::get('phonepe_salt_key'));
        $saltIndex = trim((string) Setting::get('phonepe_salt_index', '1')) ?: '1';

        $statusUrl = $this->isSandbox()
            ? "https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/status/{$merchantId}/{$merchantOrderId}"
            : "https://api.phonepe.com/apis/hermes/pg/v1/status/{$merchantId}/{$merchantOrderId}";

        $xVerify = hash('sha256', "/pg/v1/status/{$merchantId}/{$merchantOrderId}" . $saltKey) . '###' . $saltIndex;

        try {
            $response = Http::withHeaders([
                'Content-Type'  => 'application/json',
                'X-VERIFY'      => $xVerify,
                'X-MERCHANT-ID' => $merchantId,
            ])->timeout(15)->get($statusUrl);

            $data = $response->json();
            $code = $data['code'] ?? null;

            if ($response->successful() && $code === 'PAYMENT_SUCCESS') {
                return [
                    'success'       => true,
                    'state'         => 'COMPLETED',
                    'amount'        => (int) ((($data['data']['amount'] ?? 0)) / 100),
                    'transactionId' => $data['data']['transactionId'] ?? $merchantOrderId,
                    'raw'           => $data,
                    'error'         => null,
                ];
            }

            return [
                'success'       => false,
                'state'         => $code ?? 'FAILED',
                'amount'        => (int) ((($data['data']['amount'] ?? 0)) / 100),
                'transactionId' => $data['data']['transactionId'] ?? null,
                'raw'           => $data,
                'error'         => $data['message'] ?? 'Payment was not successful.',
            ];
        } catch (\Throwable $e) {
            Log::error('PhonePe v1 Status Check Exception: ' . $e->getMessage());
            return [
                'success' => false,
                'state'   => 'ERROR',
                'amount'  => 0,
                'error'   => $e->getMessage(),
            ];
        }
    }
}
