<x-filament-panels::page>
    <div class="space-y-6">

        {{-- ── IDCard.Store ─────────────────────────────────────────────── --}}
        <x-filament::section>
            <x-slot name="heading">
                <div class="flex items-center gap-2">
                    <x-heroicon-o-credit-card class="w-5 h-5 text-blue-500" />
                    <span>IDCard.Store API</span>
                    <span class="text-xs font-normal text-gray-400">(PVC Card Maker)</span>
                </div>
            </x-slot>
            <div class="grid grid-cols-1 gap-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        API Key
                        @if($idcard_store_api_key)
                            <span class="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">✓ Configured</span>
                        @else
                            <span class="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">✗ Not Set</span>
                        @endif
                    </label>
                    <div class="relative">
                        <input
                            type="password"
                            wire:model="idcard_store_api_key"
                            placeholder="Enter IDCard.Store API Key..."
                            class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 pr-10"
                            x-data="{ show: false }"
                            :type="show ? 'text' : 'password'"
                        />
                        <button
                            type="button"
                            class="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-gray-600"
                            x-data="{ show: false }"
                            @click="show = !show; $el.closest('.relative').querySelector('input').type = show ? 'text' : 'password'"
                        >
                            <x-heroicon-o-eye class="w-4 h-4" />
                        </button>
                    </div>
                    <p class="mt-1 text-xs text-gray-500">Source: <a href="https://idcard.store" target="_blank" class="text-blue-500 hover:underline">idcard.store</a></p>
                </div>
            </div>
        </x-filament::section>

        {{-- ── Nexus API ────────────────────────────────────────────────── --}}
        <x-filament::section>
            <x-slot name="heading">
                <div class="flex items-center gap-2">
                    <x-heroicon-o-identification class="w-5 h-5 text-purple-500" />
                    <span>Nexus API</span>
                    <span class="text-xs font-normal text-gray-400">(Aadhar Info, PAN, Vehicle Details)</span>
                </div>
            </x-slot>
            <div class="grid grid-cols-1 gap-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        API Key
                        @if($nexus_api_key)
                            <span class="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">✓ Configured</span>
                        @else
                            <span class="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">✗ Not Set</span>
                        @endif
                    </label>
                    <input
                        type="password"
                        wire:model="nexus_api_key"
                        placeholder="Enter Nexus API Key..."
                        class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 shadow-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                        x-data="{ show: false }"
                        :type="show ? 'text' : 'password'"
                    />
                    <p class="mt-1 text-xs text-gray-500">Source: <a href="https://nexus-dashboard.space" target="_blank" class="text-blue-500 hover:underline">nexus-dashboard.space</a></p>
                </div>
            </div>
        </x-filament::section>

        {{-- ── CallMeBot WhatsApp ───────────────────────────────────────── --}}
        <x-filament::section>
            <x-slot name="heading">
                <div class="flex items-center gap-2">
                    <x-heroicon-o-chat-bubble-left-ellipsis class="w-5 h-5 text-green-500" />
                    <span>CallMeBot WhatsApp Notifications</span>
                </div>
            </x-slot>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        WhatsApp Phone Number
                        @if($callmebot_phone)
                            <span class="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">✓ Set</span>
                        @endif
                    </label>
                    <input
                        type="text"
                        wire:model="callmebot_phone"
                        placeholder="+91XXXXXXXXXX"
                        class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 shadow-sm focus:border-green-500 focus:ring-1 focus:ring-green-500"
                    />
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        API Key
                        @if($callmebot_api_key)
                            <span class="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">✓ Configured</span>
                        @else
                            <span class="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">✗ Not Set</span>
                        @endif
                    </label>
                    <input
                        type="password"
                        wire:model="callmebot_api_key"
                        placeholder="Enter CallMeBot API Key..."
                        class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 shadow-sm focus:border-green-500 focus:ring-1 focus:ring-green-500"
                        x-data="{ show: false }"
                        :type="show ? 'text' : 'password'"
                    />
                </div>
            </div>
            <p class="mt-2 text-xs text-gray-500">Admin ko coin purchase/request pe WhatsApp notification milegi. Source: <a href="https://www.callmebot.com/" target="_blank" class="text-blue-500 hover:underline">callmebot.com</a></p>
        </x-filament::section>

        {{-- ── PPP API ──────────────────────────────────────────────────── --}}
        <x-filament::section collapsible collapsed>
            <x-slot name="heading">
                <div class="flex items-center gap-2">
                    <x-heroicon-o-home class="w-5 h-5 text-orange-500" />
                    <span>PPP API</span>
                    <span class="text-xs font-normal text-gray-400">(Parivar Pehchan Patra)</span>
                    @if($ppp_api_key)
                        <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">✓ Configured</span>
                    @else
                        <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">⚠ Not Set</span>
                    @endif
                </div>
            </x-slot>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="sm:col-span-2">
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">API Key</label>
                    <input type="password" wire:model="ppp_api_key" placeholder="Enter PPP API Key..."
                        class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm shadow-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500" />
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Aadhar → PPP URL</label>
                    <input type="text" wire:model="ppp_aadhar_to_ppp_url" placeholder="https://..."
                        class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm shadow-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500" />
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">PPP → Aadhar URL</label>
                    <input type="text" wire:model="ppp_to_aadhar_url" placeholder="https://..."
                        class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm shadow-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500" />
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">PPP → Mobile URL</label>
                    <input type="text" wire:model="ppp_to_mobile_url" placeholder="https://..."
                        class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm shadow-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500" />
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">PPP → Bank URL</label>
                    <input type="text" wire:model="ppp_to_bank_url" placeholder="https://..."
                        class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm shadow-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500" />
                </div>
            </div>
        </x-filament::section>

        {{-- ── Vahan API ────────────────────────────────────────────────── --}}
        <x-filament::section collapsible collapsed>
            <x-slot name="heading">
                <div class="flex items-center gap-2">
                    <x-heroicon-o-truck class="w-5 h-5 text-blue-600" />
                    <span>Vahan API</span>
                    <span class="text-xs font-normal text-gray-400">(Vehicle PUC)</span>
                    @if($vahan_api_key)
                        <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">✓ Configured</span>
                    @else
                        <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">⚠ Not Set</span>
                    @endif
                </div>
            </x-slot>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="sm:col-span-2">
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">API Key</label>
                    <input type="password" wire:model="vahan_api_key" placeholder="Enter Vahan API Key..."
                        class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm shadow-sm focus:border-blue-600 focus:ring-1 focus:ring-blue-600" />
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">PUC Without OTP URL</label>
                    <input type="text" wire:model="vahan_puc_without_otp_url" placeholder="https://..."
                        class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm shadow-sm focus:border-blue-600 focus:ring-1 focus:ring-blue-600" />
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">PUC Send OTP URL</label>
                    <input type="text" wire:model="vahan_puc_send_otp_url" placeholder="https://..."
                        class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm shadow-sm focus:border-blue-600 focus:ring-1 focus:ring-blue-600" />
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">PUC Verify OTP URL</label>
                    <input type="text" wire:model="vahan_puc_verify_otp_url" placeholder="https://..."
                        class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm shadow-sm focus:border-blue-600 focus:ring-1 focus:ring-blue-600" />
                </div>
            </div>
        </x-filament::section>

        {{-- ── Voter API ────────────────────────────────────────────────── --}}
        <x-filament::section collapsible collapsed>
            <x-slot name="heading">
                <div class="flex items-center gap-2">
                    <x-heroicon-o-clipboard-document-list class="w-5 h-5 text-indigo-500" />
                    <span>Voter API</span>
                    <span class="text-xs font-normal text-gray-400">(Voter Card / SIR List)</span>
                    @if($voter_api_key)
                        <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">✓ Configured</span>
                    @else
                        <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">⚠ Not Set</span>
                    @endif
                </div>
            </x-slot>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">API Key</label>
                    <input type="password" wire:model="voter_api_key" placeholder="Enter Voter API Key..."
                        class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">SIR Voter List URL</label>
                    <input type="text" wire:model="voter_sir_voter_list_url" placeholder="https://..."
                        class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
                </div>
            </div>
        </x-filament::section>

        {{-- ── PDF Editor API ───────────────────────────────────────────── --}}
        <x-filament::section collapsible collapsed>
            <x-slot name="heading">
                <div class="flex items-center gap-2">
                    <x-heroicon-o-document-text class="w-5 h-5 text-rose-500" />
                    <span>PDF Editor API</span>
                    @if($pdf_api_key)
                        <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">✓ Configured</span>
                    @else
                        <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">⚠ Not Set</span>
                    @endif
                </div>
            </x-slot>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">API Key</label>
                    <input type="password" wire:model="pdf_api_key" placeholder="Enter PDF API Key..."
                        class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm shadow-sm focus:border-rose-500 focus:ring-1 focus:ring-rose-500" />
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">PDF Editor API URL</label>
                    <input type="text" wire:model="pdf_editor_api_url" placeholder="https://..."
                        class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm shadow-sm focus:border-rose-500 focus:ring-1 focus:ring-rose-500" />
                </div>
            </div>
        </x-filament::section>

        {{-- ── Card Maker API ───────────────────────────────────────────── --}}
        <x-filament::section collapsible collapsed>
            <x-slot name="heading">
                <div class="flex items-center gap-2">
                    <x-heroicon-o-rectangle-stack class="w-5 h-5 text-teal-500" />
                    <span>Card Maker API</span>
                    <span class="text-xs font-normal text-gray-400">(Voter Card, Aadhar Card Manual)</span>
                    @if($card_maker_api_key)
                        <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">✓ Configured</span>
                    @else
                        <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">⚠ Not Set</span>
                    @endif
                </div>
            </x-slot>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="sm:col-span-2">
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">API Key</label>
                    <input type="password" wire:model="card_maker_api_key" placeholder="Enter Card Maker API Key..."
                        class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm shadow-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500" />
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Voter Card Maker URL</label>
                    <input type="text" wire:model="card_maker_voter_card_url" placeholder="https://..."
                        class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm shadow-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500" />
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Aadhar Card (Manual) URL</label>
                    <input type="text" wire:model="card_maker_aadhar_card_url" placeholder="https://..."
                        class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm shadow-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500" />
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Voter Address Change URL</label>
                    <input type="text" wire:model="card_maker_voter_address_change_url" placeholder="https://..."
                        class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm shadow-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500" />
                </div>
            </div>
        </x-filament::section>

        {{-- ── Aadhar Update API ────────────────────────────────────────── --}}
        <x-filament::section collapsible collapsed>
            <x-slot name="heading">
                <div class="flex items-center gap-2">
                    <x-heroicon-o-finger-print class="w-5 h-5 text-amber-500" />
                    <span>Aadhar Update API</span>
                    <span class="text-xs font-normal text-gray-400">(DOB Change, Name Change, Mobile Update)</span>
                    @if($aadhar_update_api_key)
                        <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">✓ Configured</span>
                    @else
                        <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">⚠ Not Set</span>
                    @endif
                </div>
            </x-slot>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="sm:col-span-2">
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">API Key</label>
                    <input type="password" wire:model="aadhar_update_api_key" placeholder="Enter Aadhar Update API Key..."
                        class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm shadow-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500" />
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mobile Update URL</label>
                    <input type="text" wire:model="aadhar_update_mobile_update_url" placeholder="https://..."
                        class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm shadow-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500" />
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">DOB Change URL</label>
                    <input type="text" wire:model="aadhar_update_dob_change_url" placeholder="https://..."
                        class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm shadow-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500" />
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Surname Change URL</label>
                    <input type="text" wire:model="aadhar_update_surname_change_url" placeholder="https://..."
                        class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm shadow-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500" />
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name Change URL</label>
                    <input type="text" wire:model="aadhar_update_full_name_change_url" placeholder="https://..."
                        class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm shadow-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500" />
                </div>
            </div>
        </x-filament::section>

        {{-- ── Save Button ──────────────────────────────────────────────── --}}
        <div class="flex items-center justify-end gap-3 pt-2">
            <p class="text-sm text-gray-500 dark:text-gray-400">
                <x-heroicon-o-information-circle class="w-4 h-4 inline mr-1" />
                Settings database mein save hoti hain aur .env file ko override karti hain.
            </p>
            <button
                wire:click="saveAll"
                wire:loading.attr="disabled"
                class="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-500 text-white font-semibold rounded-lg shadow transition-colors disabled:opacity-60"
            >
                <span wire:loading.remove wire:target="saveAll">
                    <x-heroicon-o-check class="w-4 h-4 inline" />
                    Save All API Settings
                </span>
                <span wire:loading wire:target="saveAll">
                    <svg class="animate-spin w-4 h-4 inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                    </svg>
                    Saving...
                </span>
            </button>
        </div>

    </div>
</x-filament-panels::page>
