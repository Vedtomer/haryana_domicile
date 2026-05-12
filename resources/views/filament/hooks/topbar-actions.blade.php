@if(auth()->user()->type !== 'admin')
<div class="flex items-center pr-4">
    <x-filament::badge color="warning" icon="heroicon-s-circle-stack" size="lg">
        {{ number_format(auth()->user()->coins ?? 0) }} Coins
    </x-filament::badge>
</div>
@endif
