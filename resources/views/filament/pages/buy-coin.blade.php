<x-filament-panels::page>
    <div class="space-y-6">
        {{-- Coin Purchase Form --}}
        <x-filament::section>
            <x-slot name="heading">
                Purchase Coins
            </x-slot>
            <x-slot name="description">
                Make a UPI payment and submit your UTR number to add coins to your account
            </x-slot>

            <form wire:submit="submit">
                {{ $this->form }}

                <div class="mt-6">
                    <x-filament::button type="submit" size="lg">
                        Submit Request
                    </x-filament::button>
                </div>
            </form>
        </x-filament::section>

        {{-- Request History --}}
        <x-filament::section>
            <x-slot name="heading">
                Request History
            </x-slot>

            {{ $this->table }}
        </x-filament::section>
    </div>
</x-filament-panels::page>
