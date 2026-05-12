<x-filament-panels::page>
    <style>
        .captcha-container {
            background: #f8fafc;
            border: 2px dashed #e2e8f0;
            padding: 10px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
        }
        .captcha-refresh {
            position: absolute;
            right: 10px;
            cursor: pointer;
            transition: all 0.3s;
        }
        .captcha-refresh:hover {
            transform: rotate(180deg);
            color: #3b82f6;
        }
        .history-item:hover {
            background: rgba(59, 130, 246, 0.05);
            border-left: 4px solid #3b82f6;
        }
    </style>

    <div class="space-y-6">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Search Section -->
            <div class="lg:col-span-1 space-y-6">
                <x-filament::section>
                    <x-slot name="heading">
                        <div class="flex items-center gap-2">
                            <x-filament::icon icon="heroicon-o-document-magnifying-glass" class="w-5 h-5 text-primary-500" />
                            <span>Fasal Aadhar Search</span>
                        </div>
                    </x-slot>

                    <form wire:submit="search" class="space-y-4">
                        {{ $this->form }}

                        <x-filament::button type="submit" class="w-full" wire:loading.attr="disabled" wire:target="search">
                            <span wire:loading.remove wire:target="search">Search Data (10 Coins)</span>
                            <span wire:loading wire:target="search">
                                <i class="fa-solid fa-spinner fa-spin mr-2"></i>Searching...
                            </span>
                        </x-filament::button>
                    </form>
                </x-filament::section>

                <x-filament::section>
                    <x-slot name="heading">
                        <div class="flex items-center gap-2">
                            <x-filament::icon icon="heroicon-o-clock" class="w-5 h-5 text-gray-400" />
                            <span>Recent Searches</span>
                        </div>
                    </x-slot>

                    <div class="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                        @forelse($this->history as $record)
                            <div class="history-item p-1.5 bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm border border-gray-100 dark:border-gray-800 rounded-lg transition-all duration-300 hover:bg-primary-50 dark:hover:bg-primary-900/10">
                                <div class="flex justify-between items-center mb-0.5">
                                    <span class="text-sm font-bold text-primary-600 tracking-tight">
                                        {{ $record->input_data['aadhar_number'] ?? 'N/A' }}
                                    </span>
                                    <span class="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
                                        {{ $record->created_at->diffForHumans() }}
                                    </span>
                                </div>
                                <div class="text-[9px] text-gray-500">
                                    Status: {{ ucfirst($record->status) }}
                                </div>
                            </div>
                        @empty
                            <div class="text-center py-4 text-gray-400">
                                <p class="text-xs">No search history</p>
                            </div>
                        @endforelse
                    </div>
                </x-filament::section>
            </div>

            <!-- Result Preview Section -->
            <div class="lg:col-span-2">
                @if($searchResult)
                    <x-filament::section class="h-full">
                        <x-slot name="heading">
                            <div class="flex items-center justify-between">
                                <div class="flex items-center gap-2">
                                    <x-filament::icon icon="heroicon-o-identification" class="w-5 h-5 text-emerald-500" />
                                    <span>Farmer Information</span>
                                </div>
                                <x-filament::button color="gray" size="xs" icon="heroicon-m-x-mark" wire:click="$set('searchResult', null)">
                                    Clear
                                </x-filament::button>
                            </div>
                        </x-slot>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in">
                            <!-- Detailed Info Cards -->
                            <div class="space-y-4">
                                <div class="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-2xl">
                                    <p class="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1">Family ID</p>
                                    <p class="text-xl font-black text-emerald-950 dark:text-emerald-100">{{ $searchResult['family_id'] ?? 'N/A' }}</p>
                                </div>

                                <div class="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-2xl">
                                    <p class="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-1">Full Name</p>
                                    <p class="text-xl font-black text-blue-950 dark:text-blue-100">{{ $searchResult['name'] ?? 'N/A' }}</p>
                                </div>

                                <div class="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800 rounded-2xl">
                                    <p class="text-[10px] font-bold text-purple-600 uppercase tracking-widest mb-1">Date of Birth</p>
                                    <p class="text-xl font-black text-purple-950 dark:text-purple-100">{{ $searchResult['dob'] ?? 'N/A' }}</p>
                                </div>
                            </div>

                            <div class="space-y-4">
                                <div class="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-2xl">
                                    <p class="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-1">Mobile Number</p>
                                    <p class="text-xl font-black text-amber-950 dark:text-amber-100">{{ $searchResult['mobile'] ?? 'N/A' }}</p>
                                </div>

                                <div class="p-4 bg-slate-50 dark:bg-slate-900/20 border border-slate-100 dark:border-slate-800 rounded-2xl h-full">
                                    <p class="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-1">Permanent Address</p>
                                    <p class="text-sm font-medium text-slate-950 dark:text-slate-100 leading-relaxed">{{ $searchResult['address'] ?? 'N/A' }}</p>
                                </div>
                            </div>
                        </div>
                    </x-filament::section>
                @else
                    <div class="h-full flex flex-col items-center justify-center p-12 bg-gray-50/50 dark:bg-gray-900/50 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-3xl">
                        <x-filament::icon icon="heroicon-o-magnifying-glass-circle" class="w-16 h-16 text-gray-300 mb-4" />
                        <h3 class="text-lg font-bold text-gray-400">Ready to Search</h3>
                        <p class="text-sm text-gray-400 text-center mt-2">Enter an Aadhar number to see the farmer's detailed information here.</p>
                    </div>
                @endif
            </div>
        </div>
    </div>
</x-filament-panels::page>
