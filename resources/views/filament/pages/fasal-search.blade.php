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
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                <div class="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                    @forelse($this->history as $record)
                        <div class="history-item p-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border border-gray-100 dark:border-gray-800 rounded-2xl transition-all duration-300">
                            <div class="flex justify-between items-center mb-2">
                                <span class="text-lg font-black text-primary-500 tracking-tight">
                                    {{ $record->input_data['aadhar_number'] ?? 'N/A' }}
                                </span>
                                <span class="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
                                    {{ $record->created_at->diffForHumans() }}
                                </span>
                            </div>
                            <div class="text-[10px] text-gray-500">
                                Status: {{ ucfirst($record->status) }}
                            </div>
                        </div>
                    @empty
                        <div class="text-center py-8 text-gray-400">
                            <x-filament::icon icon="heroicon-o-inbox" class="w-12 h-12 mx-auto mb-2 opacity-20" />
                            <p class="text-sm">No search history found</p>
                        </div>
                    @endforelse
                </div>
            </x-filament::section>
        </div>
    </div>
</x-filament-panels::page>
