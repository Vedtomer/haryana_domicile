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
                        <div class="bg-gray-50 dark:bg-gray-950 p-6 rounded-xl border border-gray-200 dark:border-gray-800 font-mono text-sm overflow-x-auto whitespace-pre-wrap leading-relaxed text-gray-800 dark:text-gray-200 shadow-inner">
                            {!! nl2br(e($familyData)) !!}
                        </div>
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
