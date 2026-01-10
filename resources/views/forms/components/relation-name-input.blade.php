<x-dynamic-component :component="$getFieldWrapperView()" :field="$field">
    @php
        $statePath = $getStatePath();
    @endphp
    
    <div class="flex w-full rounded-lg shadow-sm overflow-hidden border border-gray-300 dark:border-gray-600 focus-within:border-primary-500 focus-within:ring-1 focus-within:ring-primary-500">
        <select
            wire:model="{{ $statePath }}.prefix"
            class="border-0 bg-transparent focus:ring-0 text-sm py-2 pl-3 pr-8 border-r border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            style="width: 85px;"
        >
            <option value="S/o">S/o</option>
            <option value="D/o">D/o</option>
            <option value="W/o">W/o</option>
            <option value="H/o">H/o</option>
            <option value="C/o">C/o</option>
        </select>
        
        <input
            wire:model="{{ $statePath }}.name"
            type="text"
            placeholder="Enter name"
            class="flex-1 border-0 bg-transparent focus:ring-0 text-sm py-2 px-3 dark:bg-gray-700 dark:text-white"
        />
    </div>
</x-dynamic-component>
