<x-filament-panels::page>
    <x-filament-panels::form wire:submit="generatePdf">
        {{ $this->form }}

        <div class="flex justify-end gap-x-3">
            <x-filament::button type="submit">
                Generate & Download PDF
            </x-filament::button>
        </div>
    </x-filament-panels::form>
</x-filament-panels::page>
