<x-filament-panels::page>
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Request Section -->
        <div class="lg:col-span-1">
            <x-filament::section>
                <x-slot name="heading">
                    <div class="flex items-center gap-2">
                        <x-filament::icon icon="heroicon-o-truck" class="w-5 h-5 text-emerald-500" />
                        <span>Vehicle Search</span>
                    </div>
                </x-slot>

                <form wire:submit="submit" class="space-y-4">
                    {{ $this->form }}

                    <x-filament::button type="submit" color="success" class="w-full" wire:loading.attr="disabled" wire:target="submit">
                        <span wire:loading.remove wire:target="submit">Search Vehicle (20 Coins)</span>
                        <span wire:loading wire:target="submit">
                            <i class="fa-solid fa-spinner fa-spin mr-2"></i>Submitting...
                        </span>
                    </x-filament::button>
                </form>
                
                <div class="mt-4 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-800">
                    <p class="text-xs text-emerald-700 dark:text-emerald-400 leading-relaxed">
                        <i class="fa-solid fa-circle-info mr-1"></i> Enter the complete vehicle registration number to get RC details, owner name, and more.
                    </p>
                </div>
            </x-filament::section>
        </div>

        <!-- History Section -->
        <div class="lg:col-span-2">
            <x-filament::section>
                <x-slot name="heading">
                    <div class="flex items-center gap-2">
                        <x-filament::icon icon="heroicon-o-clock" class="w-5 h-5 text-gray-400" />
                        <span>Your Vehicle History</span>
                    </div>
                </x-slot>

                <div class="space-y-4">
                    @forelse($this->history as $record)
                        <div class="p-4 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm">
                            <div class="flex justify-between items-start mb-3">
                                <div>
                                    <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Vehicle Number</p>
                                    <p class="text-lg font-black text-emerald-600 tracking-tight uppercase">{{ $record->input_data['vehicle_number'] ?? 'N/A' }}</p>
                                </div>
                                <div class="flex flex-col items-end gap-2">
                                    <span class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{{ $record->created_at->format('d M, Y h:i A') }}</span>
                                    <x-filament::badge :color="$record->status === 'completed' ? 'success' : ($record->status === 'rejected' ? 'danger' : 'warning')">
                                        {{ ucfirst($record->status) }}
                                    </x-filament::badge>
                                </div>
                            </div>

                            @if($record->admin_response)
                                <div class="mt-4 p-3 bg-emerald-50 dark:bg-emerald-900/10 border-l-4 border-emerald-500 rounded-r-lg">
                                    <p class="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1">Vehicle Owner/Detail</p>
                                    <p class="text-sm font-bold text-gray-800 dark:text-gray-200 whitespace-pre-line">{{ $record->admin_response }}</p>
                                </div>
                            @endif

                            @if($record->attachment)
                                <div class="mt-3">
                                    <x-filament::link :href="Storage::url($record->attachment)" target="_blank" icon="heroicon-m-paper-clip" class="text-xs font-bold">
                                        Download RC Copy / PDF
                                    </x-filament::link>
                                </div>
                            @endif
                        </div>
                    @empty
                        <div class="text-center py-12 text-gray-400">
                            <x-filament::icon icon="heroicon-o-truck" class="w-12 h-12 mx-auto mb-3 opacity-20" />
                            <p class="text-sm">No vehicle requests found.</p>
                        </div>
                    @endforelse
                </div>
            </x-filament::section>
        </div>
    </div>
</x-filament-panels::page>
