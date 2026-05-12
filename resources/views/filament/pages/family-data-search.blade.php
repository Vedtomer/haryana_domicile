<x-filament-panels::page>
    <style>
        @media print {
            .no-print { display: none !important; }
            .print-only { display: block !important; }
            .fi-main { padding: 0 !important; }
            .fi-content { padding: 0 !important; }
            .fi-section { border: none !important; box-shadow: none !important; }
        }
    </style>

    <div class="space-y-6">
        <!-- Search Section -->
        <div class="flex justify-center no-print">
            <div class="w-full max-w-lg">
                <x-filament::section>
                    <x-slot name="heading">
                        <div class="flex items-center gap-2">
                            <x-filament::icon icon="heroicon-o-magnifying-glass" class="w-5 h-5 text-primary-500" />
                            <span>Search Family Data</span>
                        </div>
                    </x-slot>

                    <form wire:submit="search" class="space-y-4">
                        {{ $this->form }}

                        <div class="flex gap-2">
                            <x-filament::button type="submit" class="flex-1" wire:loading.attr="disabled" wire:target="search">
                                <span wire:loading.remove wire:target="search">Fetch Data (30 Coins)</span>
                                <span wire:loading wire:target="search">
                                    <i class="fa-solid fa-spinner fa-spin mr-2"></i>Searching...
                                </span>
                            </x-filament::button>

                            @if($familyData)
                                <x-filament::button color="gray" @click="window.print()" icon="heroicon-m-printer">
                                    Print
                                </x-filament::button>
                                <x-filament::button color="danger" wire:click="clear" icon="heroicon-m-x-mark">
                                    Clear
                                </x-filament::button>
                            @endif
                        </div>
                    </form>
                </x-filament::section>
            </div>
        </div>

        <!-- Result Section -->
        @if($familyData)
            <div class="w-full animate-in fade-in duration-500">
                <x-filament::section>
                    <x-slot name="heading">
                        <div class="flex items-center justify-between no-print">
                            <div class="flex items-center gap-2">
                                <x-filament::icon icon="heroicon-o-document-text" class="w-5 h-5 text-success-500" />
                                <span>Family Information Details</span>
                            </div>
                            <span class="text-xs font-medium text-gray-500 italic">Scroll down to see full data</span>
                        </div>
                    </x-slot>

                    @if(is_array($familyData))
                        @if($familyData['type'] === 'pdf')
                            <div class="w-full h-[800px]">
                                <embed src="{{ $familyData['url'] }}" type="application/pdf" width="100%" height="100%" />
                            </div>
                        @else
                            <div class="flex justify-center">
                                <img src="{{ $familyData['url'] }}" class="max-w-full h-auto rounded-lg shadow-lg border border-gray-200" />
                            </div>
                        @endif
                    @else
                        @php
                            $parsedData = is_string($familyData) ? json_decode($familyData, true) : null;
                            $isValidJson = $parsedData && isset($parsedData['FamilyID']);
                        @endphp
                        
                        @if($isValidJson)
                            <div class="space-y-6 print-only">
                                <!-- Family Overview Card -->
                                <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
                                    <div class="bg-primary-50 dark:bg-primary-950/30 px-6 py-4 border-b border-gray-200 dark:border-gray-800">
                                        <div class="flex items-center justify-between">
                                            <h3 class="text-lg font-bold text-primary-800 dark:text-primary-300 flex items-center gap-2">
                                                <i class="fa-solid fa-house-chimney text-primary-500"></i> Family Overview
                                            </h3>
                                            <span class="bg-white dark:bg-gray-800 px-3 py-1 rounded-full text-sm font-black text-gray-700 dark:text-gray-200 shadow-sm border border-gray-100 dark:border-gray-700">
                                                ID: {{ $parsedData['FamilyID'] }}
                                            </span>
                                        </div>
                                    </div>
                                    <div class="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        <div class="space-y-1">
                                            <p class="text-xs font-bold text-gray-500 uppercase tracking-wider">House/Street</p>
                                            <p class="text-sm font-semibold text-gray-800 dark:text-gray-200">
                                                {{ $parsedData['FamilyHouseNumber'] ?? '' }} {{ $parsedData['FamilyStreetNumber'] ?? '' }}
                                            </p>
                                        </div>
                                        <div class="space-y-1">
                                            <p class="text-xs font-bold text-gray-500 uppercase tracking-wider">Address/Landmark</p>
                                            <p class="text-sm font-semibold text-gray-800 dark:text-gray-200">
                                                {{ $parsedData['FamilyAddress'] ?? '' }} {{ $parsedData['FamilyLandMark'] ?? '' }}
                                            </p>
                                        </div>
                                        <div class="space-y-1">
                                            <p class="text-xs font-bold text-gray-500 uppercase tracking-wider">Pin Code</p>
                                            <p class="text-sm font-semibold text-gray-800 dark:text-gray-200">
                                                {{ $parsedData['FamilyPinCode'] ?? 'N/A' }}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <!-- Members List -->
                                <div class="space-y-4">
                                    <h3 class="text-lg font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2 px-2">
                                        <i class="fa-solid fa-users text-primary-500"></i> Family Members ({{ count($parsedData['PppMemberDetails'] ?? []) }})
                                    </h3>
                                    
                                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        @foreach($parsedData['PppMemberDetails'] ?? [] as $member)
                                            <div class="relative bg-white dark:bg-gray-900 rounded-[24px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 dark:border-gray-800 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
                                                
                                                <!-- Top Row: Avatar & Name -->
                                                <div class="flex items-center gap-4 mb-5">
                                                    <div class="relative shrink-0">
                                                        <div class="w-14 h-14 rounded-full flex items-center justify-center text-2xl shadow-inner border-2 {{ ($member['Gender'] ?? '') === 'F' ? 'bg-pink-50 text-pink-500 border-pink-100' : 'bg-blue-50 text-blue-500 border-blue-100' }}">
                                                            <i class="fa-solid {{ ($member['Gender'] ?? '') === 'F' ? 'fa-person-dress' : 'fa-person' }}"></i>
                                                        </div>
                                                        <!-- Age Badge -->
                                                        <div class="absolute -bottom-2 -right-2 bg-gray-900 dark:bg-gray-700 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border-2 border-white dark:border-gray-900 shadow-sm">
                                                            {{ $member['Age'] ?? '--' }}y
                                                        </div>
                                                    </div>
                                                    <div class="min-w-0 flex-1">
                                                        <h4 class="text-base font-black text-gray-800 dark:text-gray-100 leading-tight truncate">
                                                            {{ $member['FirstName'] ?? '' }} {{ $member['LastName'] ?? '' }}
                                                        </h4>
                                                        <div class="inline-flex items-center gap-1.5 mt-1">
                                                            <span class="w-1.5 h-1.5 rounded-full {{ ($member['IsHouseHoldOrMember'] ?? '') === 'HEAD' || ($member['IsHouseHoldOrMember'] ?? '') === 'SELF' ? 'bg-primary-500' : 'bg-gray-300' }}"></span>
                                                            <p class="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider truncate">
                                                                {{ $member['IsHouseHoldOrMember'] ?? 'MEMBER' }}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <!-- Details Inner Box -->
                                                <div class="space-y-3.5 bg-gray-50/80 dark:bg-gray-800/50 rounded-2xl p-5 border border-gray-100/80 dark:border-gray-700/50 flex-grow">
                                                    <!-- Row 1 -->
                                                    <div class="flex items-center text-sm">
                                                        <div class="w-8 text-gray-400 shrink-0"><i class="fa-regular fa-address-card text-lg"></i></div>
                                                        <div class="flex-1 font-bold text-gray-700 dark:text-gray-200 tracking-wide truncate">{{ $member['AadhaarNo'] ?? 'N/A' }}</div>
                                                    </div>
                                                    <!-- Row 2 -->
                                                    <div class="flex items-center text-sm">
                                                        <div class="w-8 text-gray-400 shrink-0"><i class="fa-solid fa-mobile-screen text-lg"></i></div>
                                                        <div class="flex-1 font-bold text-gray-700 dark:text-gray-200 truncate">{{ $member['MobileNo'] ?? 'N/A' }}</div>
                                                    </div>
                                                    <!-- Row 3 -->
                                                    <div class="flex items-center text-sm">
                                                        <div class="w-8 text-gray-400 shrink-0"><i class="fa-solid fa-people-roof text-sm"></i></div>
                                                        <div class="flex-1 font-semibold text-gray-600 dark:text-gray-300 text-xs truncate">
                                                            F: {{ explode(' ', $member['FatherFirstName'] ?? '')[0] }} 
                                                            <span class="text-gray-300 mx-1">|</span> 
                                                            M: {{ explode(' ', $member['MotherFirstName'] ?? '')[0] }}
                                                        </div>
                                                    </div>
                                                    <!-- Row 4 -->
                                                    <div class="flex items-center text-sm">
                                                        <div class="w-8 text-gray-400 shrink-0"><i class="fa-solid fa-building-columns text-sm"></i></div>
                                                        <div class="flex-1 font-semibold text-gray-600 dark:text-gray-300 text-[11px] truncate">
                                                            @if(!empty($member['bankAccountNumber']))
                                                                <span class="font-bold text-gray-700 dark:text-gray-200">{{ $member['bankAccountNumber'] }}</span>
                                                                <span class="text-gray-300 mx-1">•</span> 
                                                                {{ $member['ifscCode'] }}
                                                            @else
                                                                No Bank Details
                                                            @endif
                                                        </div>
                                                    </div>
                                                </div>

                                                <!-- Bottom Footer -->
                                                <div class="mt-5 flex items-center justify-between px-2 pb-1">
                                                    <div class="flex flex-col">
                                                        <span class="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Marital Status</span>
                                                        <span class="text-sm font-black text-gray-700 dark:text-gray-200">{{ $member['MaritalStatus'] ?? 'N/A' }}</span>
                                                    </div>
                                                    <div class="flex flex-col text-right">
                                                        <span class="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Total Income</span>
                                                        <span class="text-base font-black text-emerald-600 dark:text-emerald-400">₹{{ number_format((float)($member['TotalIncome'] ?? 0)) }}</span>
                                                    </div>
                                                </div>

                                            </div>
                                        @endforeach
                                    </div>
                                </div>
                            </div>
                        @else
                            <div class="bg-gray-50 dark:bg-gray-950 p-6 rounded-xl border border-gray-200 dark:border-gray-800 font-mono text-sm overflow-x-auto whitespace-pre-wrap leading-relaxed text-gray-800 dark:text-gray-200 shadow-inner">
                                {!! nl2br(e($familyData)) !!}
                            </div>
                        @endif
                    @endif
                </x-filament::section>
            </div>
        @endif

        <!-- Recent History Section (Always Visible for reference) -->
        <div class="no-print">
            <x-filament::section collapsible collapsed>
                <x-slot name="heading">
                    <div class="flex items-center gap-2">
                        <x-filament::icon icon="heroicon-o-clock" class="w-5 h-5 text-gray-400" />
                        <span>Recent History</span>
                    </div>
                </x-slot>

                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    @forelse($this->history as $record)
                        <div class="p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm flex items-center justify-between">
                            <div>
                                <p class="text-xs font-bold text-gray-500 uppercase">Family ID</p>
                                <p class="text-sm font-black text-primary-600">{{ $record->input_data['family_id'] ?? 'N/A' }}</p>
                            </div>
                            <div class="flex gap-2">
                                <x-filament::link wire:click="viewRecord({{ $record->id }})" class="cursor-pointer text-xs font-bold">
                                    Download
                                </x-filament::link>
                            </div>
                        </div>
                    @empty
                        <p class="text-xs text-gray-400 col-span-full">No history found.</p>
                    @endforelse
                </div>
            </x-filament::section>
        </div>
    </div>
</x-filament-panels::page>
