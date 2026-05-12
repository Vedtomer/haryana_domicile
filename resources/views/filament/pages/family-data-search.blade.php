<x-filament-panels::page>
    <style>
        .data-container {
            transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .animate-in {
            animation: slideIn 0.5s ease-out forwards;
        }
        @keyframes slideIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .history-item:hover {
            background: rgba(59, 130, 246, 0.05);
            border-left: 4px solid #3b82f6;
        }
        @media print {
            .no-print { display: none !important; }
            .print-only { display: block !important; }
            .fi-main { padding: 0 !important; }
            .fi-content { padding: 0 !important; }
        }
    </style>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <!-- Left Sidebar: Search & History -->
        <div class="lg:col-span-4 space-y-6 no-print">
            <x-filament::section>
                <x-slot name="heading">
                    <div class="flex items-center gap-2">
                        <x-filament::icon icon="heroicon-o-magnifying-glass" class="w-5 h-5 text-primary-500" />
                        <span>Search Family Data</span>
                    </div>
                </x-slot>

                <form wire:submit="search" class="space-y-4">
                    {{ $this->form }}

                    <x-filament::button type="submit" class="w-full" wire:loading.attr="disabled" wire:target="search">
                        <span wire:loading.remove wire:target="search">Search Data (20 Coins)</span>
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

                <div class="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                    @forelse($this->history as $record)
                        <div 
                            wire:click="viewRecord({{ $record->id }})"
                            class="history-item p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl cursor-pointer transition-all duration-200"
                        >
                            <div class="flex justify-between items-center mb-1">
                                <span class="text-xs font-bold text-primary-600">
                                    {{ $record->input_data['aadhar_number'] ?? 'N/A' }}
                                </span>
                                <span class="text-[10px] text-gray-400">
                                    {{ $record->created_at->diffForHumans() }}
                                </span>
                            </div>
                            <div class="text-[10px] text-gray-500 truncate">
                                <i class="fa-solid fa-file-invoice mr-1"></i>
                                {{ basename($record->attachment) }}
                            </div>
                        </div>
                    @empty
                        <div class="text-center py-8 text-gray-400">
                            <x-filament::icon icon="heroicon-o-folder-open" class="w-10 h-10 mx-auto mb-2 opacity-20" />
                            <p class="text-xs">No history found</p>
                        </div>
                    @endforelse
                </div>
            </x-filament::section>
        </div>

        <!-- Main Panel: Data View -->
        <div class="lg:col-span-8">
            <x-filament::section class="min-h-[800px] data-container">
                <x-slot name="heading">
                    <div class="flex items-center justify-between w-full">
                        <div class="flex items-center gap-2">
                            <x-filament::icon icon="heroicon-o-document-text" class="w-5 h-5 text-primary-500" />
                            <span>Resulting Data</span>
                        </div>
                        
                        @if($familyData)
                            <div class="flex items-center gap-2 no-print">
                                <x-filament::button 
                                    color="gray" 
                                    icon="heroicon-o-printer"
                                    size="sm"
                                    onclick="window.print()"
                                >
                                    Print
                                </x-filament::button>
                                
                                @php
                                    $extension = str_starts_with($familyData, 'JVBERi') ? 'pdf' : (str_starts_with($familyData, 'iVBORw0') ? 'png' : 'txt');
                                    $mime = $extension === 'pdf' ? 'application/pdf' : ($extension === 'png' ? 'image/png' : 'text/plain');
                                @endphp
                                
                                <x-filament::button 
                                    tag="a"
                                    href="data:{{ $mime }};base64,{{ $familyData }}"
                                    download="FamilyData_{{ time() }}.{{ $extension }}"
                                    color="success" 
                                    icon="heroicon-o-arrow-down-tray"
                                    size="sm"
                                >
                                    Download
                                </x-filament::button>

                                <x-filament::button 
                                    wire:click="clear"
                                    color="danger" 
                                    variant="ghost"
                                    size="sm"
                                >
                                    Clear
                                </x-filament::button>
                            </div>
                        @endif
                    </div>
                </x-slot>

                <div class="relative w-full h-full flex flex-col items-center justify-center min-h-[700px] rounded-xl overflow-hidden border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-black/20">
                    @if($familyData)
                        <div class="w-full h-full animate-in">
                            @if(str_starts_with($familyData, 'JVBERi')) {{-- PDF --}}
                                <iframe 
                                    src="data:application/pdf;base64,{{ $familyData }}#toolbar=0&navpanes=0&scrollbar=0" 
                                    class="w-full min-h-[1000px] border-none rounded-lg"
                                ></iframe>
                            @elseif(str_starts_with($familyData, 'iVBORw0') || str_starts_with($familyData, '/9j/')) {{-- PNG or JPG --}}
                                <div class="p-4 flex justify-center bg-white dark:bg-gray-900 rounded-lg shadow-inner">
                                    <img src="data:image/png;base64,{{ $familyData }}" class="max-w-full h-auto shadow-2xl rounded-lg">
                                </div>
                            @else {{-- RAW TEXT --}}
                                <div class="w-full min-h-[1000px] p-12 bg-gray-950 text-emerald-400 font-mono text-lg leading-relaxed selection:bg-emerald-500/30 overflow-auto whitespace-pre-wrap">
                                    {{ $familyData }}
                                </div>
                            @endif
                        </div>
                    @else
                        <div class="text-center p-12" wire:loading.remove wire:target="search, viewRecord">
                            <div class="w-24 h-24 bg-primary-50 dark:bg-primary-950 rounded-full flex items-center justify-center mx-auto mb-6">
                                <x-filament::icon icon="heroicon-o-document-magnifying-glass" class="w-12 h-12 text-primary-400" />
                            </div>
                            <h3 class="text-xl font-bold text-gray-600 dark:text-gray-300 mb-2">No Data Selected</h3>
                            <p class="text-gray-400 max-w-xs mx-auto">Enter an Aadhar number and click search to fetch family data from the portal.</p>
                        </div>

                        <div wire:loading wire:target="search, viewRecord" class="text-center p-12">
                            <div class="relative w-24 h-24 mx-auto mb-6">
                                <div class="absolute inset-0 border-4 border-primary-200 rounded-full"></div>
                                <div class="absolute inset-0 border-4 border-primary-600 rounded-full border-t-transparent animate-spin"></div>
                                <div class="absolute inset-0 flex items-center justify-center">
                                    <x-filament::icon icon="heroicon-o-cpu-chip" class="w-10 h-10 text-primary-500 animate-pulse" />
                                </div>
                            </div>
                            <h3 class="text-xl font-bold text-primary-600 mb-2">Fetching Family Data...</h3>
                            <p class="text-gray-400 animate-pulse">This may take a few seconds while we connect to the portal.</p>
                        </div>
                    @endif
                </div>
            </x-filament::section>
        </div>
    </div>
</x-filament-panels::page>
