<x-filament-panels::page>
    <div class="space-y-6">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div class="mb-4">
                <h3 class="text-lg font-medium text-gray-900 dark:text-white">
                    Contact Support
                </h3>
                <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Need help? Send us a message and we'll get back to you as soon as possible.
                </p>
            </div>

            <form wire:submit="submit">
                {{ $this->form }}

                <div class="mt-6">
                    <x-filament::button type="submit" size="lg">
                        <x-heroicon-o-paper-airplane class="w-5 h-5 mr-2" />
                        Send Message
                    </x-filament::button>
                </div>
            </form>
        </div>

        <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <div class="flex">
                <div class="flex-shrink-0">
                    <x-heroicon-o-information-circle class="h-5 w-5 text-blue-400" />
                </div>
                <div class="ml-3">
                    <h3 class="text-sm font-medium text-blue-800 dark:text-blue-200">
                        Support Information
                    </h3>
                    <div class="mt-2 text-sm text-blue-700 dark:text-blue-300">
                        <p>Our support team typically responds within 24 hours during business days.</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</x-filament-panels::page>
