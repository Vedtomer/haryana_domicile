<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MobileRecharge extends Model
{
    const STATUS_SUCCESS = 'success';
    const STATUS_PROCESSING = 'processing';
    const STATUS_FAILED = 'failed';
    const STATUS_REFUNDED = 'refunded';

    protected $fillable = [
        'user_id',
        'mobile',
        'operator',
        'operator_name',
        'service_type',
        'amount',
        'coins_deducted',
        'txn_id',
        'provider_status',
        'status',
        'amount_deducted',
        'commission',
        'api_response',
        'failure_reason',
    ];

    protected $casts = [
        'amount' => 'float',
        'coins_deducted' => 'integer',
        'amount_deducted' => 'float',
        'commission' => 'float',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Complete operator catalog as provided by apinice.in API
     */
    public static function getOperators(): array
    {
        return [
            'prepaid' => [
                [
                    'code' => 'JO',
                    'name' => 'JIO',
                    'fullName' => 'Reliance Jio Prepaid',
                    'type' => 'Prepaid',
                    'commission' => '2.50%',
                    'theme' => '#0f3cc9',
                    'icon' => 'wifi_tethering',
                ],
                [
                    'code' => 'AT',
                    'name' => 'Airtel',
                    'fullName' => 'Bharti Airtel Prepaid',
                    'type' => 'Prepaid',
                    'commission' => '2.00%',
                    'theme' => '#e11d48',
                    'icon' => 'cell_tower',
                ],
                [
                    'code' => 'VI',
                    'name' => 'Vodafone Idea',
                    'fullName' => 'Vi (Vodafone Idea) Prepaid',
                    'type' => 'Prepaid',
                    'commission' => '3.00%',
                    'theme' => '#dc2626',
                    'icon' => 'signal_cellular_alt',
                ],
                [
                    'code' => 'BS',
                    'name' => 'BSNL',
                    'fullName' => 'BSNL GSM Prepaid',
                    'type' => 'Prepaid',
                    'commission' => '2.00%',
                    'theme' => '#2563eb',
                    'icon' => 'network_check',
                ],
                [
                    'code' => 'JL',
                    'name' => 'JIO LITE',
                    'fullName' => 'Reliance Jio Lite / Data',
                    'type' => 'Prepaid',
                    'commission' => '2.50%',
                    'theme' => '#0284c7',
                    'icon' => 'language',
                ],
            ],
            'postpaid' => [
                [
                    'code' => 'AP',
                    'name' => 'Airtel Postpaid',
                    'fullName' => 'Bharti Airtel Postpaid Bill',
                    'type' => 'Postpaid',
                    'commission' => '1.00%',
                    'theme' => '#be123c',
                    'icon' => 'receipt_long',
                ],
                [
                    'code' => 'VP',
                    'name' => 'Vodafone Postpaid',
                    'fullName' => 'Vi (Vodafone) Postpaid Bill',
                    'type' => 'Postpaid',
                    'commission' => '1.00%',
                    'theme' => '#b91c1c',
                    'icon' => 'receipt',
                ],
            ],
            'dth' => [
                [
                    'code' => 'AD',
                    'name' => 'Airtel Digital TV',
                    'fullName' => 'Airtel Digital TV DTH',
                    'type' => 'DTH',
                    'commission' => '1.50%',
                    'theme' => '#e11d48',
                    'icon' => 'tv',
                ],
                [
                    'code' => 'TS',
                    'name' => 'Tata Sky / Tata Play',
                    'fullName' => 'Tata Play (Tata Sky) DTH',
                    'type' => 'DTH',
                    'commission' => '1.50%',
                    'theme' => '#7c3aed',
                    'icon' => 'live_tv',
                ],
                [
                    'code' => 'DT',
                    'name' => 'Dish TV',
                    'fullName' => 'Dish TV DTH',
                    'type' => 'DTH',
                    'commission' => '1.50%',
                    'theme' => '#ea580c',
                    'icon' => 'satellite_alt',
                ],
                [
                    'code' => 'VD',
                    'name' => 'Videocon D2H',
                    'fullName' => 'Videocon D2H DTH',
                    'type' => 'DTH',
                    'commission' => '1.50%',
                    'theme' => '#0284c7',
                    'icon' => 'cast_connected',
                ],
            ],
        ];
    }
}
