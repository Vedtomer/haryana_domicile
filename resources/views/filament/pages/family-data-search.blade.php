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
                                    
                                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                        @foreach($parsedData['PppMemberDetails'] ?? [] as $member)
                                            <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                                                <div class="flex justify-between items-start mb-4 pb-4 border-b border-gray-100 dark:border-gray-800">
                                                    <div class="flex items-center gap-3">
                                                        <div class="w-10 h-10 rounded-full {{ ($member['Gender'] ?? '') === 'F' ? 'bg-pink-100 text-pink-600' : 'bg-blue-100 text-blue-600' }} flex items-center justify-center text-lg shadow-sm border {{ ($member['Gender'] ?? '') === 'F' ? 'border-pink-200' : 'border-blue-200' }}">
                                                            <i class="fa-solid {{ ($member['Gender'] ?? '') === 'F' ? 'fa-person-dress' : 'fa-person' }}"></i>
                                                        </div>
                                                        <div>
                                                            <h4 class="text-base font-black text-gray-900 dark:text-white uppercase">
                                                                {{ $member['FirstName'] ?? '' }} {{ $member['LastName'] ?? '' }}
                                                            </h4>
                                                            <p class="text-xs font-bold text-primary-600 bg-primary-50 dark:bg-primary-900/50 px-2 py-0.5 rounded inline-block mt-1">
                                                                {{ $member['IsHouseHoldOrMember'] ?? 'MEMBER' }}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div class="text-right">
                                                        <span class="text-xl font-black text-gray-800 dark:text-gray-200">{{ $member['Age'] ?? '--' }}</span>
                                                        <span class="text-xs text-gray-500 uppercase font-bold block">Years</span>
                                                    </div>
                                                </div>
                                                
                                                <div class="grid grid-cols-2 gap-y-4 gap-x-2 text-sm">
                                                    <div>
                                                        <p class="text-[10px] font-bold text-gray-400 uppercase">Aadhar Number</p>
                                                        <p class="font-bold text-gray-700 dark:text-gray-300">{{ $member['AadhaarNo'] ?? 'N/A' }}</p>
                                                    </div>
                                                    <div>
                                                        <p class="text-[10px] font-bold text-gray-400 uppercase">Mobile Number</p>
                                                        <p class="font-bold text-gray-700 dark:text-gray-300">{{ $member['MobileNo'] ?? 'N/A' }}</p>
                                                    </div>
                                                    <div>
                                                        <p class="text-[10px] font-bold text-gray-400 uppercase">Father's Name</p>
                                                        <p class="font-semibold text-gray-700 dark:text-gray-300">{{ $member['FatherFirstName'] ?? '' }} {{ $member['FatherLastName'] ?? '' }}</p>
                                                    </div>
                                                    <div>
                                                        <p class="text-[10px] font-bold text-gray-400 uppercase">Mother's Name</p>
                                                        <p class="font-semibold text-gray-700 dark:text-gray-300">{{ $member['MotherFirstName'] ?? '' }} {{ $member['MotherLastName'] ?? '' }}</p>
                                                    </div>
                                                    <div>
                                                        <p class="text-[10px] font-bold text-gray-400 uppercase">Bank Account</p>
                                                        <p class="font-semibold text-gray-700 dark:text-gray-300">{{ $member['bankAccountNumber'] ?: 'Not Available' }}</p>
                                                    </div>
                                                    <div>
                                                        <p class="text-[10px] font-bold text-gray-400 uppercase">IFSC Code</p>
                                                        <p class="font-semibold text-gray-700 dark:text-gray-300">{{ $member['ifscCode'] ?: 'Not Available' }}</p>
                                                    </div>
                                                    <div>
                                                        <p class="text-[10px] font-bold text-gray-400 uppercase">Marital Status</p>
                                                        <p class="font-semibold text-gray-700 dark:text-gray-300">{{ $member['MaritalStatus'] ?? 'N/A' }}</p>
                                                    </div>
                                                    <div>
                                                        <p class="text-[10px] font-bold text-gray-400 uppercase">Total Income</p>
                                                        <p class="font-semibold text-gray-700 dark:text-gray-300">₹{{ number_format((float)($member['TotalIncome'] ?? 0)) }}</p>
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
