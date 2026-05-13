@if(auth()->user()->type !== 'admin')
<div class="flex items-center gap-3 pr-4">
    <x-filament::badge color="warning" icon="heroicon-s-circle-stack" size="lg" class="cursor-default">
        {{ number_format(auth()->user()->coins ?? 0) }} Coins
    </x-filament::badge>
    @livewire('add-coin-modal')
</div>
@endif
