<x-filament-panels::page>
    <div class="flex justify-center items-center py-12">
        <div class="w-full max-w-lg">
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
                        <span wire:loading.remove wire:target="search">Search & Download (10 Coins)</span>
                        <span wire:loading wire:target="search">
                            <i class="fa-solid fa-spinner fa-spin mr-2"></i>Searching...
                        </span>
                    </x-filament::button>
                </form>
            </x-filament::section>
        </div>
    </div>
</x-filament-panels::page>
