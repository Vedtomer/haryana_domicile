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
            border-radius: 12px;
            text-decoration: none !important;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            height: 56px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            border: 1px solid rgba(255, 255, 255, 0.1);
            background-clip: padding-box;
        }
        .service-card:hover {
            transform: translateY(-3px) scale(1.02);
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1);
            filter: brightness(1.1);
        }
        
        .icon-box {
            width: 36px;
            height: 36px;
            background: rgba(255,255,255,0.15);
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 12px;
            flex-shrink: 0;
            font-size: 18px;
            backdrop-filter: blur(4px);
        }

        .service-title {
            font-size: 11px;
            font-weight: 800;
            line-height: 1.15;
            text-transform: uppercase;
            font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
            letter-spacing: 0.025em;
        }
        
        .dashboard-container {
            padding: 20px;
            border-radius: 16px;
            min-height: 90vh;
            width: 100%;
            border: 1px solid rgba(255, 255, 255, 0.05);
            box-shadow: inset 0 0 100px rgba(0,0,0,0.5);
            position: relative;
            overflow: hidden;
        }

        .dashboard-container::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: radial-gradient(circle at 50% 0%, rgba(59, 130, 246, 0.15) 0%, transparent 50%);
            pointer-events: none;
        }

        .section-title {
            color: #f8fafc;
            text-shadow: 0 0 20px rgba(59, 130, 246, 0.5);
            letter-spacing: 0.1em;
        }

        /* Full Screen Overrides */
        :host, :root {
            --sidebar-width: 0px !important;
            --collapsed-sidebar-width: 0px !important;
        }
        
        /* Hide Filament Layout Elements */
        .fi-sidebar, 
        .fi-topbar,
        .fi-sidebar-active,
        aside {
            display: none !important;
            width: 0 !important;
        }

        /* Make Main Content Full Width & No Padding */
        .fi-main, 
        .fi-content,
        main,
        .fi-main-ctn {
            padding: 0 !important;
            margin: 0 !important;
            max-width: 100% !important;
            width: 100% !important;
        }

        .fi-page-header {
            display: none !important;
        }

        section {
            padding: 0 !important;
            max-width: 100% !important;
        }
    </style>

    <div x-data="{ showBillModal: false, billUid: '6894882000' }" class="relative">
        <div class="dashboard-container">
        <h2 class="section-title text-xl font-black mb-8 uppercase pl-2 border-l-4 border-blue-500">
            <i class="fa-solid fa-layer-group mr-2 text-blue-400"></i>All Services
        </h2>
        
        <div class="service-grid">
            @php
            $services = [
                // Our Existing Actual Links
                ['name' => 'AADHAR<br>UPDATE', 'icon' => 'fa-fingerprint', 'bg' => 'bg-[#f0fdf4] text-black border border-green-200', 'icon_color' => 'text-green-700', 'url' => '/admin/aadhar-card-address-form', 'count' => $counts['aadhar_update'] ?? 0],
                ['name' => 'HARYANA<br>DOMICILE', 'icon' => 'fa-id-badge', 'bg' => 'bg-[#1d4ed8] text-white', 'icon_color' => 'text-white', 'url' => '/admin/haryana-domiciles', 'count' => $counts['haryana_domicile'] ?? 0],
                ['name' => 'BIRTH<br>RECORDS', 'icon' => 'fa-file-circle-plus', 'bg' => 'bg-[#db2777] text-white', 'icon_color' => 'text-white', 'url' => '/admin/birth-records', 'count' => $counts['birth_records'] ?? 0],
                ['name' => 'PDF<br>CONVERTER', 'icon' => 'fa-file-pdf', 'bg' => 'bg-[#dc2626] text-white', 'icon_color' => 'text-white', 'url' => '/admin/pdf-converters', 'count' => $counts['pdf_converter'] ?? 0],
                ['name' => 'PDF TO WORD', 'icon' => 'fa-file-word', 'bg' => 'bg-[#2b5797] text-white', 'icon_color' => 'text-white', 'url' => 'https://www.ilovepdf.com/pdf_to_word', 'external' => true],
                ['name' => 'PAN CARD', 'icon' => 'fa-address-card', 'bg' => 'bg-[#0f766e] text-white', 'icon_color' => 'text-white', 'url' => 'https://onlineservices.proteantech.in/paam/endUserRegisterContact.html', 'external' => true],

                // Grid items from user's image reference
                ['name' => 'MOBILE<br>RECHARGE', 'icon' => 'fa-mobile-screen', 'bg' => 'bg-[#f8fafc] text-black border border-gray-200', 'icon_color' => 'text-red-500', 'url' => 'https://paytm.com/', 'external' => true],
                ['name' => 'MSME<br>REGISTRATION', 'icon' => 'fa-building', 'bg' => 'bg-[#f8fafc] text-black border border-gray-200', 'icon_color' => 'text-blue-800', 'url' => 'https://udyamregistration.gov.in/Government-India/Ministry-MSME-registration.htm', 'external' => true],
                
                ['name' => 'ACCOUNT<br>OPENING', 'icon' => 'fa-building-columns', 'bg' => 'bg-[#fcfdf6] text-black border border-lime-200', 'icon_color' => 'text-orange-500', 'url' => 'https://www.hdfcbank.com/personal/save/accounts/savings-accounts', 'external' => true],
                ['name' => 'VOTER ID<br>CARD', 'icon' => 'fa-address-card', 'bg' => 'bg-[#1e3a8a] text-white', 'icon_color' => 'text-white', 'url' => 'https://voters.eci.gov.in/', 'external' => true],
                ['name' => 'DRIVING<br>LICENCE', 'icon' => 'fa-id-card', 'bg' => 'bg-[#e11d48] text-white', 'icon_color' => 'text-white', 'url' => 'https://parivahan.gov.in/', 'external' => true],

                ['name' => 'ELECTRICITY<br>BILL', 'icon' => 'fa-lightbulb', 'bg' => 'bg-white text-black border border-gray-200', 'icon_color' => 'text-black', 'url' => 'https://epayment.uhbvn.org.in/', 'external' => true],
                ['name' => 'HEALTH<br>INSURANCE', 'icon' => 'fa-heart-pulse', 'bg' => 'bg-[#7e22ce] text-white', 'icon_color' => 'text-white', 'url' => 'https://www.hdfcergo.com/promotions/health-insurance/os-insurance-1.html?&utm_source=google_search_2&utm_medium=cpc&utm_campaign=Health_Search_Core-ROI-Neev_Broad&utm_adgroup=Health-Insurance&utm_campaign=23219663237&utm_content=185260599302&adid=782094737998&utm_term=health%20insurance&utm_network=g&utm_matchtype=b&utm_device=c&utm_location=1007766&utm_sitelink={sitelink}&utm_placement=&ci=googlesearch&gad_source=1&gad_campaignid=23219663237&gbraid=0AAAAADy0Cuh-9YcLU-0od1P9LyrrkqsdJ&gclid=Cj0KCQiA8KTNBhD_ARIsAOvp6DKFwVNPwZukH__4C0rhj0UIYToK_LdRwgce8g1GXHuYi5YXg4qY8_8aAtKaEALw_wcB', 'external' => true],
                ['name' => 'CAR<br>INSURANCE', 'icon' => 'fa-car', 'bg' => 'bg-[#422006] text-white', 'icon_color' => 'text-red-500', 'url' => 'https://ci.policybazaar.com/v1?pb_source=google&pb_medium=cpc&pb_term=Car%20insurance&pb_campaign=High_Position_Desktop_ROI00Car_Insurance_networkg&gad_source=1&gad_campaignid=6764353897&gbraid=0AAAAAD7HssIXgo461fbYdUxwQPfCy9HrC&gclid=Cj0KCQiA8KTNBhD_ARIsAOvp6DKGPrp1IZb1u-LbrmQ3FCS6V8Mkr1Dzb0Q6OEPksrVD4kHCVBBqXqEaAnkpEALw_wcB', 'external' => true],
                ['name' => 'BIKE<br>INSURANCE', 'icon' => 'fa-motorcycle', 'bg' => 'bg-[#dc2626] text-white', 'icon_color' => 'text-green-400', 'url' => 'https://ci.policybazaar.com/v1?pb_source=google&pb_medium=cpc&pb_term=Car%20insurance&pb_campaign=High_Position_Desktop_ROI00Car_Insurance_networkg&gad_source=1&gad_campaignid=6764353897&gbraid=0AAAAAD7HssIXgo461fbYdUxwQPfCy9HrC&gclid=Cj0KCQiA8KTNBhD_ARIsAOvp6DKGPrp1IZb1u-LbrmQ3FCS6V8Mkr1Dzb0Q6OEPksrVD4kHCVBBqXqEaAnkpEALw_wcB', 'external' => true],
                ['name' => 'TAX RETURN<br>FILING', 'icon' => 'fa-file-invoice-dollar', 'bg' => 'bg-[#0f766e] text-white', 'icon_color' => 'text-white', 'url' => 'https://www.incometax.gov.in/iec/foportal/', 'external' => true],

                ['name' => 'GST<br>SERVICES', 'icon' => 'fa-file-signature', 'bg' => 'bg-[#3b82f6] text-white border border-blue-400', 'icon_color' => 'text-red-500', 'url' => 'https://www.incometax.gov.in/iec/foportal/', 'external' => true],
                ['name' => 'IRCTC<br>(TRAIN BOOKING)', 'icon' => 'fa-train', 'bg' => 'bg-white text-black border border-gray-200', 'icon_color' => 'text-purple-800', 'url' => 'https://www.irctc.co.in/nget/train-search', 'external' => true],
                ['name' => 'Mera Parivar<br>Meri Id', 'icon' => 'fa-users', 'bg' => 'bg-[#6366f1] text-white', 'icon_color' => 'text-white', 'url' => 'https://ppp-office.haryana.gov.in/', 'external' => true],
                ['name' => 'UHBVN BILL<br>PRINT', 'icon' => 'fa-print', 'bg' => 'bg-[#fbbf24] text-black border border-yellow-400', 'icon_color' => 'text-red-600', 'url' => '#', 'onclick' => 'showBillModal = true'],
            ];
            @endphp

            @foreach($services as $service)
            <a 
                @if(isset($service['onclick'])) 
                    @click.prevent="{{ $service['onclick'] }}" 
                @endif
                href="{{ $service['url'] }}" 
                @if(isset($service['external']) && $service['external']) target="_blank" @endif 
                class="service-card {{ $service['bg'] }} relative"
            >
                <div class="icon-box">
                    <i class="fa-solid {{ $service['icon'] }} {{ $service['icon_color'] }}"></i>
                </div>
                <div class="service-title">
                    {!! $service['name'] !!}
                </div>
                @if(isset($service['count']) && $service['count'] > 0)
                <div class="absolute top-1 right-1 bg-black text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-sm">
                    {{ $service['count'] }}
                </div>
                @endif
            </a>
            @endforeach
        </div>
    </div>

    <!-- Bill Print Modal -->
    <template x-if="showBillModal">
        <div class="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <!-- Backdrop -->
            <div @click="showBillModal = false" class="absolute inset-0 bg-black/80 backdrop-blur-sm"></div>
            
            <!-- Modal Content -->
            <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-300">
                <div class="bg-yellow-500 p-6 text-white text-center">
                    <div class="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                        <i class="fa-solid fa-print text-3xl"></i>
                    </div>
                    <h3 class="text-xl font-black uppercase tracking-wider">UHBVN Bill Print</h3>
                    <p class="text-sm opacity-90">Enter UID to print electricity bill</p>
                </div>
                
                <div class="p-8">
                    <div class="mb-6">
                        <label class="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Consumer UID</label>
                        <input 
                            type="text" 
                            x-model="billUid" 
                            class="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-yellow-500 focus:outline-none text-lg font-bold tracking-widest text-[#1d4ed8] text-center"
                            placeholder="Enter UID Number"
                        >
                    </div>
                    
                    <div class="flex gap-3">
                        <button 
                            @click="showBillModal = false" 
                            class="flex-1 px-6 py-3 border-2 border-gray-100 text-gray-400 font-bold rounded-xl hover:bg-gray-50 transition-all uppercase text-xs"
                        >
                            Cancel
                        </button>
                        <button 
                            @click="window.open('https://uhbvn.org.in/Rapdrp/BD?UID=' + billUid, '_blank'); showBillModal = false" 
                            class="flex-[2] px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-black rounded-xl shadow-lg shadow-yellow-500/30 transition-all transform hover:-translate-y-1 uppercase text-xs tracking-widest"
                        >
                            Print Bill Now
                        </button>
                    </div>
                </div>
                
                <div class="bg-gray-50 p-4 text-center border-t border-gray-100">
                    <p class="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Haryana Electricity Board Portal</p>
                </div>
            </div>
        </div>
    </template>
</div>
</x-filament-panels::page>
