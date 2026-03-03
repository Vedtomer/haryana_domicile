<x-filament-panels::page>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    
    <style>
        .service-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
        }
        @media (min-width: 640px) {
            .service-grid {
                grid-template-columns: repeat(3, 1fr);
            }
        }
        @media (min-width: 1024px) {
            .service-grid {
                grid-template-columns: repeat(5, 1fr);
            }
        }
        
        .service-card {
            display: flex;
            align-items: center;
            padding: 8px 10px;
            border-radius: 6px;
            text-decoration: none !important;
            transition: transform 0.2s, box-shadow 0.2s;
            height: 56px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);
        }
        .service-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        }
        
        .icon-box {
            width: 36px;
            height: 36px;
            background: rgba(255,255,255,0.2);
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 12px;
            flex-shrink: 0;
            font-size: 18px;
        }
        /* Custom box overrides for icons on light backgrounds */
        .service-card.text-black .icon-box {
            background: rgba(0,0,0,0.05);
        }

        .service-title {
            font-size: 11px;
            font-weight: 800;
            line-height: 1.15;
            text-transform: uppercase;
            font-family: 'Segoe UI', Arial, sans-serif;
        }
        
        .dashboard-container {
            background: #f1f5f9;
            padding: 20px;
            border-radius: 12px;
            min-height: 80vh;
        }

        /* Filament overrides so the background matches */
        .fi-main {
            background-color: #f1f5f9 !important;
            background-image: none !important;
            animation: none !important;
        }
    </style>

    <div class="dashboard-container">
        <h2 class="text-xl font-bold text-slate-800 mb-6 uppercase tracking-wider pl-2 border-l-4 border-blue-600">All Services</h2>
        
        <div class="service-grid">
            @php
            $services = [
                // Our Existing Actual Links
                ['name' => 'AADHAR<br>UPDATE', 'icon' => 'fa-fingerprint', 'bg' => 'bg-[#f0fdf4] text-black border border-green-200', 'icon_color' => 'text-green-700', 'url' => '/admin/aadhar-card-address-form'],
                ['name' => 'HARYANA<br>DOMICILE', 'icon' => 'fa-id-badge', 'bg' => 'bg-[#1d4ed8] text-white', 'icon_color' => 'text-white', 'url' => '/admin/haryana-domiciles'],
                ['name' => 'BIRTH<br>RECORDS', 'icon' => 'fa-file-circle-plus', 'bg' => 'bg-[#db2777] text-white', 'icon_color' => 'text-white', 'url' => '/admin/birth-records'],
                ['name' => 'PDF<br>CONVERTER', 'icon' => 'fa-file-pdf', 'bg' => 'bg-[#dc2626] text-white', 'icon_color' => 'text-white', 'url' => '/admin/pdf-converters'],

                // Grid items from user's image reference
                ['name' => 'AEPS', 'icon' => 'fa-fingerprint', 'bg' => 'bg-[#f0fdf4] text-black border border-green-200', 'icon_color' => 'text-gray-800', 'url' => '#'],
                ['name' => 'MONEY<br>TRANSFER', 'icon' => 'fa-money-bill-transfer', 'bg' => 'bg-[#f97316] text-white', 'icon_color' => 'text-white', 'url' => '#'],
                ['name' => 'CASH<br>DEPOSIT', 'icon' => 'fa-money-bill-wave', 'bg' => 'bg-[#ef4444] text-white', 'icon_color' => 'text-yellow-300', 'url' => '#'],
                ['name' => 'MOBILE<br>RECHARGE', 'icon' => 'fa-mobile-screen', 'bg' => 'bg-[#f8fafc] text-black border border-gray-200', 'icon_color' => 'text-red-500', 'url' => '#'],
                ['name' => 'MSME<br>REGISTRATION', 'icon' => 'fa-building', 'bg' => 'bg-[#f8fafc] text-black border border-gray-200', 'icon_color' => 'text-blue-800', 'url' => '#'],
                
                ['name' => 'PAN CARD', 'icon' => 'fa-address-card', 'bg' => 'bg-[#0f766e] text-white', 'icon_color' => 'text-white', 'url' => '#'],
                ['name' => 'ACCOUNT<br>OPENING', 'icon' => 'fa-building-columns', 'bg' => 'bg-[#fcfdf6] text-black border border-lime-200', 'icon_color' => 'text-orange-500', 'url' => '#'],
                ['name' => 'MINI ATM', 'icon' => 'fa-credit-card', 'bg' => 'bg-[#334155] text-white', 'icon_color' => 'text-white', 'url' => '#'],
                ['name' => 'VOTER ID<br>CARD', 'icon' => 'fa-address-card', 'bg' => 'bg-[#1e3a8a] text-white', 'icon_color' => 'text-white', 'url' => '#'],
                ['name' => 'DRIVING<br>LICENCE', 'icon' => 'fa-id-card', 'bg' => 'bg-[#e11d48] text-white', 'icon_color' => 'text-white', 'url' => '#'],

                ['name' => 'ELECTRICITY<br>BILL', 'icon' => 'fa-lightbulb', 'bg' => 'bg-white text-black border border-gray-200', 'icon_color' => 'text-black', 'url' => '#'],
                ['name' => 'HEALTH<br>INSURANCE', 'icon' => 'fa-heart-pulse', 'bg' => 'bg-[#7e22ce] text-white', 'icon_color' => 'text-white', 'url' => '#'],
                ['name' => 'CAR<br>INSURANCE', 'icon' => 'fa-car', 'bg' => 'bg-[#422006] text-white', 'icon_color' => 'text-red-500', 'url' => '#'],
                ['name' => 'BIKE<br>INSURANCE', 'icon' => 'fa-motorcycle', 'bg' => 'bg-[#dc2626] text-white', 'icon_color' => 'text-green-400', 'url' => '#'],
                ['name' => 'TAX RETURN<br>FILING', 'icon' => 'fa-file-invoice-dollar', 'bg' => 'bg-[#0f766e] text-white', 'icon_color' => 'text-white', 'url' => '#'],

                ['name' => 'GST<br>SERVICES', 'icon' => 'fa-file-signature', 'bg' => 'bg-[#3b82f6] text-white border border-blue-400', 'icon_color' => 'text-red-500', 'url' => '#'],
                ['name' => 'CSP & KIOSK<br>BANKING', 'icon' => 'fa-building-columns', 'bg' => 'bg-[#1e40af] text-white', 'icon_color' => 'text-white', 'url' => '#'],
                ['name' => 'IRCTC<br>(TRAIN BOOKING)', 'icon' => 'fa-train', 'bg' => 'bg-white text-black border border-gray-200', 'icon_color' => 'text-purple-800', 'url' => '#'],
                ['name' => 'BUS<br>BOOKING', 'icon' => 'fa-bus', 'bg' => 'bg-[#f97316] text-white', 'icon_color' => 'text-white', 'url' => '#'],
                ['name' => 'HOTEL<br>BOOKING', 'icon' => 'fa-bed', 'bg' => 'bg-[#4d7c0f] text-white', 'icon_color' => 'text-blue-200', 'url' => '#'],
            ];
            @endphp

            @foreach($services as $service)
            <a href="{{ $service['url'] }}" class="service-card {{ $service['bg'] }}">
                <div class="icon-box">
                    <i class="fa-solid {{ $service['icon'] }} {{ $service['icon_color'] }}"></i>
                </div>
                <div class="service-title">
                    {!! $service['name'] !!}
                </div>
            </a>
            @endforeach
        </div>
    </div>
</x-filament-panels::page>
