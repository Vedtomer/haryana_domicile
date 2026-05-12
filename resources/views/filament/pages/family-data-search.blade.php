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

    <div class="space-y-6">
        <!-- Top Section: Search & History -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 no-print">
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

                <div class="space-y-2 max-h-[160px] overflow-y-auto pr-2">
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
                        </div>
                    @empty
                        <div class="text-center py-4 text-gray-400">
                            <p class="text-xs">No history found</p>
                        </div>
                    @endforelse
                </div>
            </x-filament::section>
        </div>

    </div>

</x-filament-panels::page>
