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
            display: flex;
            flex-direction: column;
        }

        .dashboard-container::after {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 80%;
            height: 80%;
            background-image: url('/Digital_India_logo.png');
            background-repeat: no-repeat;
            background-position: center;
            background-size: contain;
            opacity: 0.05;
            pointer-events: none;
            z-index: 0;
            filter: grayscale(1) brightness(2);
        }

        .dashboard-container > * {
            position: relative;
            z-index: 1;
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

        /* Full Width Tweaks */
        .fi-main-ctn {
            max-width: 100% !important;
            padding: 0 !important;
        }
        .fi-content {
            padding: 0 !important;
        }

        @media (min-width: 1280px) {
            .service-grid {
                grid-template-columns: repeat(6, 1fr);
            }
        }
        @media (min-width: 1536px) {
            .service-grid {
                grid-template-columns: repeat(8, 1fr);
            }
        }
    </style>

    <div x-data="{ showPanModal: false, showPhoneToAadharModal: false }" 
         @open-pan-modal.window="showPanModal = true"
         @open-phone-aadhar-modal.window="showPhoneToAadharModal = true"
         class="relative">
        <div class="dashboard-container relative">
            <div class="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
                <h2 class="section-title text-xl font-black uppercase pl-2 border-l-4 border-blue-500">
                    <i class="fa-solid fa-layer-group mr-2 text-blue-400"></i>All Services
                </h2>

                <!-- Right Side Actions: Coins & Logout -->
                <div class="flex items-center gap-4 self-start md:self-auto">
                    <!-- Wallet Balance Badge -->
                    <div class="transition hover:scale-105">
                        <div class="flex items-center gap-3 bg-gradient-to-r from-yellow-400 to-amber-600 px-5 py-2.5 rounded-2xl shadow-lg border-2 border-amber-200/50 backdrop-blur-sm">
                            <div class="bg-white/20 p-2 rounded-xl">
                                <i class="fa-solid fa-coins text-white text-xl animate-pulse"></i>
                            </div>
                            <div class="flex flex-col">
                                <span class="text-[10px] font-bold text-amber-900/80 uppercase tracking-widest leading-none">Wallet Balance</span>
                                <div class="flex items-baseline gap-1">
                                    <span class="text-2xl font-black text-white leading-none">
                                        {{ number_format(auth()->user()->coins ?? 0) }}
                                    </span>
                                    <span class="text-[10px] font-bold text-white uppercase opacity-80">Coins</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Logout Button -->
                    <form id="logout-form" action="{{ route('filament.admin.auth.logout') }}" method="POST" class="h-full">
                        @csrf
                        <button type="submit" class="group flex items-center gap-3 bg-red-50 hover:bg-red-500 px-5 py-2.5 rounded-2xl border-2 border-red-200 hover:border-red-600 shadow-sm transition-all duration-300 h-full">
                            <div class="bg-red-100 group-hover:bg-white/20 p-2 rounded-xl transition-colors">
                                <i class="fa-solid fa-right-from-bracket text-red-600 group-hover:text-white text-xl"></i>
                            </div>
                            <span class="text-sm font-black text-red-600 group-hover:text-white uppercase tracking-tight">LOGOUT</span>
                        </button>
                    </form>
                </div>
            </div>
        
        <div class="service-grid">
            @php
            $services = [
                // Our Existing Actual Links
                ['name' => 'CUSTOMER<br>SUPPORT', 'image' => '/whatsapp_premium.png', 'bg' => 'bg-white text-black border border-green-500 shadow-lg shadow-green-500/10 hover:shadow-green-500/20', 'url' => 'https://wa.me/380630323112', 'external' => true],
            ];

            if(auth()->user() && auth()->user()->isAdmin()) {
                $services[] = ['name' => 'USER<br>MANAGEMENT', 'icon' => 'fa-users-gear', 'bg' => 'bg-blue-600 text-white border border-blue-700 shadow-md', 'icon_color' => 'text-white', 'url' => '/user-managements'];
            }

            $other_services = [
                ['name' => 'AADHAR<br>UPDATE', 'icon' => 'fa-fingerprint', 'bg' => 'bg-[#f0fdf4] text-black border border-green-200', 'icon_color' => 'text-green-700', 'url' => '/aadhar-card-address-form', 'count' => $counts['aadhar_update'] ?? 0],
                ['name' => 'HARYANA<br>DOMICILE', 'icon' => 'fa-id-badge', 'bg' => 'bg-[#1d4ed8] text-white', 'icon_color' => 'text-white', 'url' => '/haryana-domiciles', 'count' => $counts['haryana_domicile'] ?? 0],
                ['name' => 'BIRTH<br>RECORDS', 'icon' => 'fa-file-circle-plus', 'bg' => 'bg-[#db2777] text-white', 'icon_color' => 'text-white', 'url' => '/birth-records', 'count' => $counts['birth_records'] ?? 0],
                ['name' => 'PDF<br>CONVERTER', 'icon' => 'fa-file-pdf', 'bg' => 'bg-[#dc2626] text-white', 'icon_color' => 'text-white', 'url' => '/pdf-converters', 'count' => $counts['pdf_converter'] ?? 0],
                ['name' => 'PAN CARD', 'icon' => 'fa-address-card', 'bg' => 'bg-[#0f766e] text-white', 'icon_color' => 'text-white', 'url' => '#', 'onclick' => 'showPanModal = true'],

                ['name' => 'IRCTC<br>(TRAIN BOOKING)', 'icon' => 'fa-train', 'bg' => 'bg-white text-black border border-gray-200', 'icon_color' => 'text-purple-800', 'url' => 'https://www.irctc.co.in/nget/train-search', 'external' => true],
                ['name' => 'Mera Parivar<br>Meri Id', 'icon' => 'fa-users', 'bg' => 'bg-[#6366f1] text-white', 'icon_color' => 'text-white', 'url' => 'https://ppp-office.haryana.gov.in/', 'external' => true],
                ['name' => 'Aadhar Card To<br>Famliy Id', 'icon' => 'fa-wheat-awn', 'bg' => 'bg-[#166534] text-white border border-green-700', 'icon_color' => 'text-yellow-400', 'url' => 'https://fasal.haryana.gov.in/home/login', 'external' => true],
                ['name' => 'Pan To Aadhaar<br>Link Status', 'icon' => 'fa-link', 'bg' => 'bg-[#0369a1] text-white border border-sky-700', 'icon_color' => 'text-white', 'url' => 'https://eportal.incometax.gov.in/iec/foservices/#/pre-login/link-aadhaar-status', 'external' => true],
                ['name' => 'Link Aadhaar<br>to Pan', 'icon' => 'fa-link-slash', 'bg' => 'bg-[#0369a1] text-white border border-sky-700', 'icon_color' => 'text-orange-400', 'url' => 'https://eportal.incometax.gov.in/iec/foservices/#/pre-login/bl-link-aadhaar', 'external' => true],
                ['name' => 'RESIZE<br>PDF', 'icon' => 'fa-file-pdf', 'bg' => 'bg-red-600 text-white border border-red-700', 'icon_color' => 'text-white', 'url' => 'https://pdf.pi7.org/resize-pdf', 'external' => true],
                ['name' => 'Pention<br>Check', 'icon' => 'fa-hand-holding-heart', 'bg' => 'bg-[#6b21a8] text-white border border-purple-700', 'icon_color' => 'text-white', 'url' => 'https://pension.socialjusticehry.gov.in/Ben_Inf', 'external' => true],
                ['name' => 'LIC<br>PAY', 'icon' => 'fa-shield-heart', 'bg' => 'bg-blue-800 text-white border border-blue-900', 'icon_color' => 'text-yellow-400', 'url' => 'https://ebiz.licindia.in/D2CPM/#DirectPay', 'external' => true],
                ['name' => 'Photo Bg<br>Remove', 'icon' => 'fa-image-portrait', 'bg' => 'bg-indigo-600 text-white border border-indigo-700', 'icon_color' => 'text-white', 'url' => 'https://www.remove.bg/', 'external' => true],
                ['name' => 'Phone to<br>Aadhar', 'icon' => 'fa-mobile-retro', 'bg' => 'bg-[#be123c] text-white border border-rose-700', 'icon_color' => 'text-white', 'url' => '#', 'onclick' => 'showPhoneToAadharModal = true', 'count' => $counts['service_requests'] ?? 0],
            ];
            $services = array_merge($services, $other_services);
            @endphp

            @foreach($services as $service)
            @php
                $needsCoins = !in_array($service['name'], ['CUSTOMER<br>SUPPORT', 'USER<br>MANAGEMENT', 'LOGOUT<br>SYSTEM']);
                $hasOnclick = isset($service['onclick']);
            @endphp
            <a 
                @if($hasOnclick) 
                    @click.prevent="{{ $service['onclick'] }}" 
                    href="{{ $service['url'] }}"
                @elseif($needsCoins)
                    wire:click.prevent="useService('{{ $service['name'] }}', '{{ $service['url'] }}', {{ isset($service['external']) && $service['external'] ? 'true' : 'false' }})"
                    href="#"
                @else
                    href="{{ $service['url'] }}"
                    @if(isset($service['external']) && $service['external']) target="_blank" @endif
                @endif
                class="service-card {{ $service['bg'] }} relative cursor-pointer"
            >
                <div class="icon-box">
                    @if(isset($service['image']))
                        <img src="{{ $service['image'] }}" class="w-10 h-10 object-contain rounded-lg shadow-sm">
                    @else
                        <i class="fa-solid {{ $service['icon'] }} {{ $service['icon_color'] }}"></i>
                    @endif
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
    

    <script>
        document.addEventListener('livewire:init', () => {
            Livewire.on('open-external-url', (event) => {
                window.open(event.url, '_blank');
            });
        });
    </script>


    <!-- PAN Card Modal -->
    <div x-show="showPanModal" style="display: none;" class="relative z-[9999]" x-cloak>
        <div class="fixed inset-0 flex items-center justify-center p-4" @close-pan-modal.window="showPanModal = false">
            <!-- Backdrop -->
            <div @click="showPanModal = false" class="absolute inset-0 bg-black/80 backdrop-blur-sm"></div>
            
            <!-- Modal Content -->
            <div class="relative bg-gray-50 rounded-2xl shadow-2xl w-full max-w-5xl overflow-hidden animate-in fade-in zoom-in duration-300 flex flex-col max-h-[90vh]">
                <div class="bg-[#0f766e] p-5 text-white text-center shrink-0 shadow-md z-10">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-3">
                            <div class="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                                <i class="fa-solid fa-address-card text-2xl"></i>
                            </div>
                            <div class="text-left">
                                <h3 class="text-xl font-black uppercase tracking-wider leading-tight">PAN Card Portal</h3>
                                <p class="text-xs opacity-90">Apply & Track Applications</p>
                            </div>
                        </div>
                        <button type="button" @click="showPanModal = false" class="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                            <i class="fa-solid fa-xmark text-xl"></i>
                        </button>
                    </div>
                </div>
                
                <div class="flex-1 overflow-y-auto p-4 md:p-6">
                    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        
                        <!-- Form Section -->
                        <div class="lg:col-span-5 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-fit">
                            <h4 class="font-bold text-gray-800 mb-4 uppercase tracking-wider text-sm border-b border-gray-100 pb-3 flex items-center">
                                <i class="fa-solid fa-file-signature text-[#0f766e] mr-2"></i> New Application
                            </h4>
                            
                            @if(!$showPaymentStep)
                                <form wire:submit.prevent="initiatePanSubmit">
                                    <div class="mb-4">
                                        <label class="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Full Name</label>
                                        <input type="text" wire:model="pan_name" required class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-[#0f766e] focus:outline-none text-sm text-black placeholder-gray-400" placeholder="Applicant Name">
                                        @error('pan_name') <span class="text-red-500 text-xs mt-1 block">{{ $message }}</span> @enderror
                                    </div>

                                    <div class="mb-4">
                                        <label class="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Aadhar Number</label>
                                        <input type="text" wire:model="pan_aadhar" required maxlength="12" class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-[#0f766e] focus:outline-none text-sm text-black placeholder-gray-400" placeholder="12 Digit Aadhar No.">
                                        @error('pan_aadhar') <span class="text-red-500 text-xs mt-1 block">{{ $message }}</span> @enderror
                                    </div>

                                    <div class="mb-4">
                                        <label class="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Mobile Number (Optional)</label>
                                        <input type="text" wire:model="pan_mobile" maxlength="10" class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-[#0f766e] focus:outline-none text-sm text-black placeholder-gray-400" placeholder="10 Digit Mobile No.">
                                        @error('pan_mobile') <span class="text-red-500 text-xs mt-1 block">{{ $message }}</span> @enderror
                                    </div>

                                    <div class="mb-4">
                                        <label class="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Photo Upload</label>
                                        <input type="file" wire:model="pan_photo" accept="image/*" required class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-[#0f766e] focus:outline-none text-sm text-black">
                                        @error('pan_photo') <span class="text-red-500 text-xs mt-1 block">{{ $message }}</span> @enderror
                                        <div wire:loading wire:target="pan_photo" class="text-xs text-blue-500 mt-1"><i class="fa-solid fa-spinner fa-spin"></i> Uploading...</div>
                                    </div>
                                    
                                    <div class="mb-4">
                                        <label class="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Signature Upload</label>
                                        <input type="file" wire:model="pan_signature" accept="image/*" required class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-[#0f766e] focus:outline-none text-sm text-black">
                                        @error('pan_signature') <span class="text-red-500 text-xs mt-1 block">{{ $message }}</span> @enderror
                                        <div wire:loading wire:target="pan_signature" class="text-xs text-blue-500 mt-1"><i class="fa-solid fa-spinner fa-spin"></i> Uploading...</div>
                                    </div>
                                    
                                    <div class="mb-4">
                                        <label class="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Aadhar Card Upload</label>
                                        <input type="file" wire:model="pan_aadhar_doc" accept=".pdf,image/*" required class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-[#0f766e] focus:outline-none text-sm text-black">
                                        @error('pan_aadhar_doc') <span class="text-red-500 text-xs mt-1 block">{{ $message }}</span> @enderror
                                        <div wire:loading wire:target="pan_aadhar_doc" class="text-xs text-blue-500 mt-1"><i class="fa-solid fa-spinner fa-spin"></i> Uploading...</div>
                                    </div>
                                    
                                    <div class="mb-6">
                                        <div class="bg-blue-50 border-l-4 border-blue-500 p-3 mb-3 rounded-r-lg">
                                            <p class="text-xs text-blue-700 font-semibold leading-relaxed">
                                                <i class="fa-solid fa-circle-info mr-1"></i> Additional document me:<br>
                                                1. Old PAN Card<br>
                                                2. Passport, DMC, Birth Certificate<br>
                                                ase upload kare.
                                            </p>
                                        </div>
                                        <label class="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Additional Document</label>
                                        <input type="file" wire:model="pan_additional" accept=".pdf,image/*" required class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-[#0f766e] focus:outline-none text-sm text-black">
                                        @error('pan_additional') <span class="text-red-500 text-xs mt-1 block">{{ $message }}</span> @enderror
                                        <div wire:loading wire:target="pan_additional" class="text-xs text-blue-500 mt-1"><i class="fa-solid fa-spinner fa-spin"></i> Uploading...</div>
                                    </div>
                                    
                                    <button type="submit" class="w-full px-6 py-3.5 bg-[#0f766e] hover:bg-teal-700 text-white font-black rounded-xl shadow-lg shadow-teal-500/30 transition-all transform hover:-translate-y-1 uppercase text-sm tracking-widest relative">
                                        <span wire:loading.remove wire:target="initiatePanSubmit">Continue to Payment</span>
                                        <span wire:loading wire:target="initiatePanSubmit"><i class="fa-solid fa-spinner fa-spin mr-2"></i> Processing...</span>
                                    </button>
                                </form>
                            @else
                                <form wire:submit.prevent="confirmPanSubmit" class="flex flex-col items-center">
                                    <div class="bg-yellow-50 border-l-4 border-yellow-500 p-4 w-full mb-6 rounded-r-lg">
                                        <p class="text-sm text-yellow-800 font-bold mb-1">Payment Required (₹150)</p>
                                        <p class="text-xs text-yellow-700">Please scan the QR code below to pay Rs 150. Also, 20 coins will be deducted from your wallet.</p>
                                    </div>

                                    <div class="bg-white p-2 rounded-xl shadow-sm border border-gray-200 mb-6 inline-block">
                                        <img src="{{ asset('images/pan_qr.jpeg') }}" alt="Payment QR Code" class="w-48 h-48 object-cover rounded-lg">
                                    </div>

                                    <div class="w-full mb-6">
                                        <label class="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Transaction ID / UTR <span class="text-red-500">*</span></label>
                                        <input type="text" wire:model="payment_utr" required class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-[#0f766e] focus:outline-none text-sm text-black placeholder-gray-400" placeholder="Enter 12-digit UTR">
                                        @error('payment_utr') <span class="text-red-500 text-xs mt-1 block">{{ $message }}</span> @enderror
                                    </div>

                                    <div class="flex w-full gap-3">
                                        <button type="button" wire:click="$set('showPaymentStep', false)" class="flex-1 px-6 py-3 border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition-all uppercase text-xs">
                                            Back
                                        </button>
                                        <button type="submit" class="flex-[2] px-6 py-3 bg-[#0f766e] hover:bg-teal-700 text-white font-black rounded-xl shadow-lg shadow-teal-500/30 transition-all transform hover:-translate-y-1 uppercase text-xs tracking-widest">
                                            <span wire:loading.remove wire:target="confirmPanSubmit">Submit Application</span>
                                            <span wire:loading wire:target="confirmPanSubmit"><i class="fa-solid fa-spinner fa-spin mr-2"></i> Submitting...</span>
                                        </button>
                                    </div>
                                </form>
                            @endif
                        </div>

                        <!-- Applications List Section -->
                        <div class="lg:col-span-7 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-fit">
                            <h4 class="font-bold text-gray-800 mb-4 uppercase tracking-wider text-sm border-b border-gray-100 pb-3 flex items-center">
                                <i class="fa-solid fa-list-check text-[#0f766e] mr-2"></i> My Applications
                            </h4>
                            
                            @if(isset($my_pan_requests) && count($my_pan_requests) > 0)
                                <div class="overflow-x-auto rounded-xl border border-gray-100">
                                    <table class="w-full text-left border-collapse whitespace-nowrap">
                                        <thead>
                                            <tr class="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider">
                                                <th class="p-3 font-bold border-b border-gray-200">Date</th>
                                                <th class="p-3 font-bold border-b border-gray-200">Name</th>
                                                <th class="p-3 font-bold border-b border-gray-200">Status</th>
                                                <th class="p-3 font-bold border-b border-gray-200">Documents</th>
                                                @if(auth()->user() && auth()->user()->isAdmin())
                                                    <th class="p-3 font-bold border-b border-gray-200">Admin Actions</th>
                                                @endif
                                            </tr>
                                        </thead>
                                        <tbody class="text-sm text-gray-700 divide-y divide-gray-100">
                                            @foreach($my_pan_requests as $req)
                                            <tr class="hover:bg-gray-50/50 transition-colors">
                                                <td class="p-3 text-xs">{{ $req->created_at->format('d M, y') }}</td>
                                                <td class="p-3 font-semibold text-xs">{{ $req->name ?: 'N/A' }}</td>
                                                <td class="p-3">
                                                    @if($req->status === 'pending')
                                                        <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold bg-yellow-100 text-yellow-700 border border-yellow-200">
                                                            <i class="fa-solid fa-hourglass-half fa-spin"></i> In Process (15-20 Days)
                                                        </span>
                                                    @elseif($req->status === 'accepted' || $req->status === 'completed')
                                                        <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold bg-green-100 text-green-700 border border-green-200">
                                                            <i class="fa-solid fa-check-circle"></i> Accepted
                                                        </span>
                                                    @elseif($req->status === 'rejected')
                                                        <div class="flex flex-col gap-1">
                                                            <span class="inline-flex w-fit items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold bg-red-100 text-red-700 border border-red-200">
                                                                <i class="fa-solid fa-times-circle"></i> Rejected
                                                            </span>
                                                            @if($req->admin_notes)
                                                                <span class="text-[10px] text-red-600 italic break-words whitespace-normal max-w-[150px]"><i class="fa-solid fa-comment-dots"></i> {{ $req->admin_notes }}</span>
                                                            @endif
                                                        </div>
                                                    @else
                                                        <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold bg-gray-100 text-gray-700 border border-gray-200">
                                                            {{ ucfirst($req->status) }}
                                                        </span>
                                                    @endif
                                                </td>
                                                <td class="p-3 space-y-2">
                                                    @if($req->slip_document)
                                                        <a href="{{ Storage::url($req->slip_document) }}" target="_blank" class="block w-fit text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded text-xs font-bold transition-colors border border-blue-100"><i class="fa-solid fa-download mr-1"></i> Slip</a>
                                                    @endif
                                                    @if($req->final_pdf)
                                                        <a href="{{ Storage::url($req->final_pdf) }}" target="_blank" class="block w-fit text-green-600 hover:text-green-800 bg-green-50 hover:bg-green-100 px-2 py-1 rounded text-xs font-bold transition-colors border border-green-100"><i class="fa-solid fa-download mr-1"></i> PAN PDF</a>
                                                    @endif
                                                    @if(!$req->slip_document && !$req->final_pdf)
                                                        <span class="text-gray-400 text-xs italic">Pending</span>
                                                    @endif
                                                </td>
                                                @if(auth()->user() && auth()->user()->isAdmin())
                                                    <td class="p-3">
                                                        <div class="flex items-center gap-2">
                                                            <button type="button" wire:click="viewPanDetails({{ $req->id }})" class="p-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors border border-blue-200" title="View & Upload">
                                                                <i class="fa-solid fa-eye"></i>
                                                            </button>
                                                            @if($req->status === 'pending')
                                                                <button type="button" wire:click="approvePanRequest({{ (int)$req->id }})" class="p-1.5 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-colors border border-green-200" title="Approve">
                                                                    <i class="fa-solid fa-check"></i>
                                                                </button>
                                                                <button type="button" wire:click="openRejectModal({{ (int)$req->id }})" class="p-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors border border-red-200" title="Reject with Remark">
                                                                    <i class="fa-solid fa-xmark"></i>
                                                                </button>
                                                            @endif
                                                            <button type="button" wire:click="deletePanRequest({{ (int)$req->id }})" wire:confirm="Are you sure you want to delete this application?" class="p-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors border border-red-200" title="Delete">
                                                                <i class="fa-solid fa-trash"></i>
                                                            </button>
                                                        </div>
                                                    </td>
                                                @endif
                                            </tr>
                                            @endforeach
                                        </tbody>
                                    </table>
                                </div>
                            @else
                                <div class="text-center py-12 px-4 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                    <div class="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
                                        <i class="fa-regular fa-folder-open text-3xl text-gray-300"></i>
                                    </div>
                                    <p class="text-sm font-semibold text-gray-500">No Applications Yet</p>
                                    <p class="text-xs text-gray-400 mt-1">Submit a new application using the form.</p>
                                </div>
                            @endif
                        </div>
                        
                    </div>
            </div>
        </div>
    </div>

    <!-- Admin View/Upload Modal -->
    <div x-data="{ open: false }" 
         x-show="open" 
         @open-view-pan-modal.window="open = true" 
         @close-view-pan-modal.window="open = false" 
         class="fixed inset-0 z-[100] overflow-y-auto" 
         style="display: none;">
        <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
            <div x-show="open" x-transition.opacity class="fixed inset-0 transition-opacity bg-gray-900/75 backdrop-blur-sm" @click="open = false; $wire.closeViewPanModal()"></div>
            
            <div x-show="open" 
                 x-transition.enter="ease-out duration-300" 
                 x-transition.enter-start="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95" 
                 x-transition.enter-end="opacity-100 translate-y-0 sm:scale-100" 
                 x-transition.leave="ease-in duration-200" 
                 x-transition.leave-start="opacity-100 translate-y-0 sm:scale-100" 
                 x-transition.leave-end="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95" 
                 class="relative inline-block w-full max-w-4xl p-6 overflow-hidden text-left align-middle transition-all transform bg-white shadow-2xl rounded-2xl sm:my-8">
                
                <div class="flex justify-between items-center mb-5 pb-4 border-b border-gray-100">
                    <h3 class="text-xl font-black text-gray-800 uppercase tracking-wider flex items-center">
                        <i class="fa-solid fa-user-shield text-[#0f766e] mr-3 text-2xl"></i> Admin View & Upload
                    </h3>
                    <button @click="open = false; $wire.closeViewPanModal()" class="text-gray-400 hover:text-red-500 transition-colors">
                        <i class="fa-solid fa-xmark text-2xl"></i>
                    </button>
                </div>

                @php $viewingPanRequest = $viewingPanRequestId ? \App\Models\PanRequest::find($viewingPanRequestId) : null; @endphp
                @if($viewingPanRequest)
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <!-- User Details -->
                        <div class="bg-gray-50 p-4 rounded-xl border border-gray-100">
                            <h4 class="font-bold text-gray-700 border-b border-gray-200 pb-2 mb-3 text-sm uppercase tracking-wider">Applicant Details</h4>
                            <div class="space-y-2 text-sm">
                                <p><span class="font-semibold text-gray-500 w-32 inline-block">Name:</span> <span class="font-bold text-gray-800">{{ $viewingPanRequest->name }}</span></p>
                                <p><span class="font-semibold text-gray-500 w-32 inline-block">Aadhar No:</span> <span class="font-bold text-gray-800">{{ $viewingPanRequest->aadhar_number }}</span></p>
                                <p><span class="font-semibold text-gray-500 w-32 inline-block">Mobile:</span> <span class="font-bold text-gray-800">{{ $viewingPanRequest->mobile ?? 'N/A' }}</span></p>
                                <p><span class="font-semibold text-gray-500 w-32 inline-block">Status:</span> 
                                    <span class="font-bold {{ $viewingPanRequest->status === 'accepted' ? 'text-green-600' : ($viewingPanRequest->status === 'rejected' ? 'text-red-600' : 'text-yellow-600') }}">
                                        {{ ucfirst($viewingPanRequest->status) }}
                                    </span>
                                </p>
                                <div class="mt-3 bg-blue-50 border border-blue-100 p-3 rounded-lg">
                                    <span class="font-semibold text-blue-700 block text-xs uppercase mb-1">Transaction ID / UTR</span>
                                    <span class="font-black text-blue-900 text-lg">{{ $viewingPanRequest->utr_number ?? 'Not Provided' }}</span>
                                </div>
                            </div>
                        </div>

                        <!-- User Documents -->
                        <div class="bg-gray-50 p-4 rounded-xl border border-gray-100">
                            <h4 class="font-bold text-gray-700 border-b border-gray-200 pb-2 mb-3 text-sm uppercase tracking-wider">User Documents</h4>
                            <div class="grid grid-cols-2 gap-3 text-sm">
                                @if($viewingPanRequest->photo)
                                    <a href="{{ Storage::url($viewingPanRequest->photo) }}" target="_blank" class="flex flex-col items-center justify-center p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all group">
                                        <i class="fa-solid fa-image text-gray-400 group-hover:text-blue-500 text-2xl mb-2"></i>
                                        <span class="font-bold text-gray-600 text-xs">Photo</span>
                                    </a>
                                @endif
                                @if($viewingPanRequest->signature)
                                    <a href="{{ Storage::url($viewingPanRequest->signature) }}" target="_blank" class="flex flex-col items-center justify-center p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all group">
                                        <i class="fa-solid fa-signature text-gray-400 group-hover:text-blue-500 text-2xl mb-2"></i>
                                        <span class="font-bold text-gray-600 text-xs">Signature</span>
                                    </a>
                                @endif
                                @if($viewingPanRequest->aadhar_card_doc)
                                    <a href="{{ Storage::url($viewingPanRequest->aadhar_card_doc) }}" target="_blank" class="flex flex-col items-center justify-center p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all group">
                                        <i class="fa-solid fa-file-pdf text-gray-400 group-hover:text-blue-500 text-2xl mb-2"></i>
                                        <span class="font-bold text-gray-600 text-xs">Aadhar Doc</span>
                                    </a>
                                @endif
                                @if($viewingPanRequest->additional_document)
                                    <a href="{{ Storage::url($viewingPanRequest->additional_document) }}" target="_blank" class="flex flex-col items-center justify-center p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all group">
                                        <i class="fa-solid fa-folder-open text-gray-400 group-hover:text-blue-500 text-2xl mb-2"></i>
                                        <span class="font-bold text-gray-600 text-xs">Additional</span>
                                    </a>
                                @endif
                            </div>
                        </div>
                    </div>

                    <!-- Admin Upload Section -->
                    <div class="mt-6 bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                        <h4 class="font-bold text-gray-800 border-b border-gray-100 pb-3 mb-4 text-sm uppercase tracking-wider flex items-center">
                            <i class="fa-solid fa-cloud-arrow-up text-[#0f766e] mr-2"></i> Admin Actions: Upload Documents
                        </h4>
                        
                        <form wire:submit.prevent="saveAdminUploads" class="space-y-4">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label class="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Upload Slip</label>
                                    <input type="file" wire:model="admin_slip_upload" accept=".pdf,image/*" class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:border-[#0f766e] focus:outline-none text-sm text-black">
                                    @error('admin_slip_upload') <span class="text-red-500 text-xs mt-1 block">{{ $message }}</span> @enderror
                                    <div wire:loading wire:target="admin_slip_upload" class="text-xs text-blue-500 mt-1"><i class="fa-solid fa-spinner fa-spin"></i> Uploading...</div>
                                    @if($viewingPanRequest->slip_document)
                                        <p class="text-xs text-green-600 mt-2 font-bold"><i class="fa-solid fa-check-circle"></i> Slip already uploaded</p>
                                    @endif
                                </div>
                                
                                <div>
                                    <label class="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Upload Final PAN PDF</label>
                                    <input type="file" wire:model="admin_pan_pdf_upload" accept=".pdf" class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:border-[#0f766e] focus:outline-none text-sm text-black">
                                    @error('admin_pan_pdf_upload') <span class="text-red-500 text-xs mt-1 block">{{ $message }}</span> @enderror
                                    <div wire:loading wire:target="admin_pan_pdf_upload" class="text-xs text-blue-500 mt-1"><i class="fa-solid fa-spinner fa-spin"></i> Uploading...</div>
                                    @if($viewingPanRequest->final_pdf)
                                        <p class="text-xs text-green-600 mt-2 font-bold"><i class="fa-solid fa-check-circle"></i> Final PDF already uploaded</p>
                                    @endif
                                </div>
                            </div>
                            
                            <div class="flex justify-end pt-2 border-t border-gray-100 mt-4">
                                <button type="button" @click="open = false; $wire.closeViewPanModal()" class="px-5 py-2.5 mr-3 text-gray-600 bg-gray-100 hover:bg-gray-200 font-bold rounded-xl transition-colors text-sm uppercase">Cancel</button>
                                <button type="submit" class="px-6 py-2.5 bg-[#0f766e] hover:bg-teal-700 text-white font-black rounded-xl shadow-md transition-all text-sm uppercase flex items-center">
                                    <span wire:loading.remove wire:target="saveAdminUploads">Save Documents</span>
                                    <span wire:loading wire:target="saveAdminUploads"><i class="fa-solid fa-spinner fa-spin mr-2"></i> Saving...</span>
                                </button>
                            </div>
                        </form>
                    </div>
                @endif
            </div>
        </div>
    </div>
    <!-- Reject with Remark Modal -->
    <div x-data="{ open: false }"
         x-show="open"
         @open-reject-modal.window="open = true"
         @close-reject-modal.window="open = false"
         class="fixed inset-0 z-[200] overflow-y-auto"
         style="display:none;">
        <div class="flex items-center justify-center min-h-screen px-4">
            <div x-show="open" x-transition.opacity class="fixed inset-0 bg-gray-900/75 backdrop-blur-sm" @click="open = false"></div>
            <div x-show="open"
                 x-transition.enter="ease-out duration-200"
                 x-transition.enter-start="opacity-0 scale-95"
                 x-transition.enter-end="opacity-100 scale-100"
                 class="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 z-10">
                <div class="flex items-center mb-4 pb-3 border-b border-gray-100">
                    <div class="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mr-3">
                        <i class="fa-solid fa-xmark text-red-600 text-lg"></i>
                    </div>
                    <div>
                        <h3 class="font-black text-gray-800 text-lg">Reject Application</h3>
                        <p class="text-xs text-gray-500">User ko reason dikhega</p>
                    </div>
                    <button @click="open = false; $wire.set('rejectingPanId', null)" class="ml-auto text-gray-400 hover:text-red-500 transition-colors">
                        <i class="fa-solid fa-xmark text-xl"></i>
                    </button>
                </div>

                <form wire:submit.prevent="confirmRejectPanRequest">
                    <div class="mb-4">
                        <label class="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Rejection Reason / Remark <span class="text-red-500">*</span></label>
                        <textarea wire:model="reject_remark" rows="4" required
                            class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-red-400 focus:outline-none text-sm text-black placeholder-gray-400 resize-none"
                            placeholder="Rejection ka reason likhein (e.g. Documents unclear, Wrong Aadhar number, etc.)"></textarea>
                        @error('reject_remark') <span class="text-red-500 text-xs mt-1 block">{{ $message }}</span> @enderror
                    </div>

                    <div class="flex gap-3">
                        <button type="button" @click="open = false; $wire.set('rejectingPanId', null)" class="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 text-sm uppercase">
                            Cancel
                        </button>
                        <button type="submit" class="flex-[2] px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl shadow-md text-sm uppercase transition-colors">
                            <span wire:loading.remove wire:target="confirmRejectPanRequest">Reject Application</span>
                            <span wire:loading wire:target="confirmRejectPanRequest"><i class="fa-solid fa-spinner fa-spin mr-1"></i> Rejecting...</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <!-- Phone to Aadhar Modal -->
    <div x-show="showPhoneToAadharModal" style="display: none;" class="fixed inset-0 z-[9999] flex items-center justify-center p-4" x-cloak @close-phone-aadhar-modal.window="showPhoneToAadharModal = false">
        <!-- Backdrop -->
        <div @click="showPhoneToAadharModal = false" class="absolute inset-0 bg-black/80 backdrop-blur-sm"></div>
        
        <!-- Modal Content -->
        <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-300">
            <div class="bg-rose-600 p-6 text-white text-center">
                <div class="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <i class="fa-solid fa-mobile-retro text-3xl"></i>
                </div>
                <h3 class="text-xl font-black uppercase tracking-wider">Phone to Aadhar</h3>
                <p class="text-sm opacity-90">Enter mobile number to get Aadhar details</p>
            </div>
            
            <div class="p-8">
                <div class="mb-6">
                    <label class="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Mobile Number</label>
                    <input 
                        type="text" 
                        wire:model="phone_to_aadhar_mobile" 
                        maxlength="10"
                        class="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-rose-500 focus:outline-none text-lg font-bold tracking-widest text-[#be123c] text-center"
                        placeholder="Enter 10-Digit Mobile"
                    >
                    @error('phone_to_aadhar_mobile') <span class="text-red-500 text-xs mt-1 block">{{ $message }}</span> @enderror
                </div>
                
                <div class="flex gap-3">
                    <button 
                        type="button"
                        @click="showPhoneToAadharModal = false" 
                        class="flex-1 px-6 py-3 border-2 border-gray-100 text-gray-400 font-bold rounded-xl hover:bg-gray-50 transition-all uppercase text-xs"
                    >
                        Cancel
                    </button>
                    <button 
                        type="button"
                        wire:click="submitPhoneToAadhar" 
                        class="flex-[2] px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white font-black rounded-xl shadow-lg shadow-rose-500/30 transition-all transform hover:-translate-y-1 uppercase text-xs tracking-widest"
                    >
                        Submit Request
                    </button>
                </div>
            </div>
            
            <div class="bg-gray-50 p-4 text-center border-t border-gray-100">
                <p class="text-[10px] text-gray-400 font-bold uppercase tracking-widest text-rose-800">Standard Charges: 20 Coins</p>
            </div>
        </div>
    </div>
    </div>
</x-filament-panels::page>
