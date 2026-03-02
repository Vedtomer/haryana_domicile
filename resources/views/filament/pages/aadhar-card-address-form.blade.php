<x-filament-panels::page>
    <x-filament-panels::form wire:submit="generatePdf">
        {{ $this->form }}

        <x-filament::button type="submit" size="lg" icon="heroicon-o-document-arrow-down">
            Generate Aadhar Update Form PDF
        </x-filament::button>
    </x-filament-panels::form>
</x-filament-panels::page>
