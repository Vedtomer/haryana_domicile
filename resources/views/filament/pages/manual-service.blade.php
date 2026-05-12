<x-filament-panels::page>
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Request Section -->
        <div class="lg:col-span-1">
            <x-filament::section>
                <x-slot name="heading">
                    <div class="flex items-center gap-2">
                        <x-filament::icon icon="{{ $config['icon'] }}" class="w-5 h-5 text-primary-500" />
                        <span>{{ $config['name'] }}</span>
                    </div>
                </x-slot>

                <form wire:submit="submit" class="space-y-4">
                    {{ $this->form }}

                    <x-filament::button type="submit" class="w-full" wire:loading.attr="disabled" wire:target="submit">
                        <span wire:loading.remove wire:target="submit">Submit Request ({{ $config['cost'] }} Coins)</span>
                        <span wire:loading wire:target="submit">
                            <i class="fa-solid fa-spinner fa-spin mr-2"></i>Processing...
                        </span>
                    </x-filament::button>
                </form>
                
                <div class="mt-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-800">
                    <p class="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed italic">
                        * This service is processed manually by the admin team.
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
                        <span>History for {{ $config['name'] }}</span>
                    </div>
                </x-slot>

                <div class="space-y-4">
                    @forelse($this->history as $record)
                        <div class="p-4 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm">
                            <div class="flex justify-between items-start mb-3">
                                <div>
                                    <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{{ $config['label'] }}</p>
                                    <p class="text-md font-black text-primary-600 tracking-tight">{{ $record->input_data['query'] ?? 'N/A' }}</p>
                                </div>
                                <div class="flex flex-col items-end gap-2">
                                    <span class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{{ $record->created_at->format('d M, Y h:i A') }}</span>
                                    <x-filament::badge :color="$record->status === 'completed' ? 'success' : ($record->status === 'rejected' ? 'danger' : 'warning')">
                                        {{ ucfirst($record->status) }}
                                    </x-filament::badge>
                                </div>
                            </div>

                            @if($record->admin_response)
                                <div class="mt-3 p-3 bg-primary-50 dark:bg-primary-900/10 border-l-4 border-primary-500 rounded-r-lg">
                                    <p class="text-[10px] font-bold text-primary-600 uppercase tracking-widest mb-1">Result / Info</p>
                                    <p class="text-sm font-medium text-gray-800 dark:text-gray-200 whitespace-pre-line">{{ $record->admin_response }}</p>
                                </div>
                            @endif

                            @if($record->attachment)
                                <div class="mt-3">
                                    <x-filament::link :href="Storage::url($record->attachment)" target="_blank" icon="heroicon-m-paper-clip" class="text-xs font-bold">
                                        Download Attachment
                                    </x-filament::link>
                                </div>
                            @endif
                        </div>
                    @empty
                        <div class="text-center py-12 text-gray-400">
                            <x-filament::icon icon="heroicon-o-chat-bubble-left" class="w-12 h-12 mx-auto mb-3 opacity-20" />
                            <p class="text-sm">No requests found yet.</p>
                        </div>
                    @endforelse
                </div>
            </x-filament::section>
        </div>
    </div>
</x-filament-panels::page>
