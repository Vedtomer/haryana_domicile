<div>
    <button wire:click="openModal" style="background: linear-gradient(135deg,#059669,#0d9488); color:white; border:1px solid #059669;" class="flex items-center gap-1.5 px-3 py-1.5 hover:opacity-90 rounded-lg font-bold transition-all shadow-sm text-xs uppercase tracking-wider">
        <i class="fa-solid fa-wallet"></i>
        <span>Add Coins</span>
    </button>

    @if($isOpen)
    <div class="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-slate-800/50 backdrop-blur-[2px]" wire:click="closeModal"></div>

        {{-- Modal Card --}}
        <div class="relative z-10 w-full max-w-sm bg-slate-50 rounded-2xl overflow-hidden" style="box-shadow: 0 20px 60px -10px rgba(15,23,42,0.25), 0 0 0 1px rgba(148,163,184,0.2);">

            {{-- Header --}}
            <div class="px-5 py-4 bg-white border-b border-slate-100 flex items-center justify-between">
                <div class="flex items-center gap-2.5">
                    <div class="w-8 h-8 rounded-lg flex items-center justify-center" style="background:#eff6ff; color:#3b82f6; border:1px solid #bfdbfe;">
                        <i class="fa-solid fa-shield-halved text-sm"></i>
                    </div>
                    <div>
                        <p class="text-sm font-extrabold text-slate-800 leading-tight">Add Coins to Wallet</p>
                        <p class="text-[10px] font-bold text-emerald-600 uppercase tracking-widest leading-tight"><i class="fa-solid fa-lock mr-0.5"></i> Secure Payment</p>
                    </div>
                </div>
                <button type="button" wire:click="closeModal" class="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
                    <i class="fa-solid fa-xmark text-sm"></i>
                </button>
            </div>

            {{-- Body --}}
            <form wire:submit.prevent="submitRequest" class="px-5 py-4 space-y-4">

                {{-- Package Select --}}
                <div>
                    <div class="flex justify-between items-center mb-1.5">
                        <label class="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Select Package</label>
                        <span class="text-[10px] font-bold text-blue-600" style="background:#eff6ff; border:1px solid #bfdbfe; padding:1px 6px; border-radius:6px;">1 Coin = ₹1</span>
                    </div>
                    <select wire:model.live="package_amount" required
                        class="w-full px-3 py-2.5 text-sm font-bold text-slate-800 rounded-xl transition-all cursor-pointer"
                        style="background:#f8fafc; border:1px solid #cbd5e1; outline:none; box-shadow:0 1px 3px rgba(0,0,0,0.06);">
                        <option value="">-- Choose Package --</option>
                        @foreach($packages as $value => $label)
                            <option value="{{ $value }}">{{ $label }}</option>
                        @endforeach
                    </select>
                    @error('package_amount') <span class="text-red-500 text-xs mt-1 block font-medium"><i class="fa-solid fa-circle-exclamation mr-1"></i>{{ $message }}</span> @enderror
                </div>

                @if($package_amount)
                {{-- QR Code --}}
                <div class="rounded-xl overflow-hidden text-center" style="background:#f0f9ff; border:1px solid #bae6fd; box-shadow:inset 0 1px 3px rgba(0,0,0,0.04);">
                    <div class="h-0.5 w-full" style="background: linear-gradient(90deg,#38bdf8,#818cf8);"></div>
                    <div class="p-4">
                        <p class="text-[10px] font-extrabold text-sky-700 uppercase tracking-widest mb-3"><i class="fa-solid fa-qrcode mr-1"></i>Scan & Pay ₹{{ number_format($package_amount) }}</p>
                        <div class="inline-block bg-white p-2 rounded-xl" style="border:1px solid #e2e8f0; box-shadow:0 2px 8px rgba(0,0,0,0.08);">
                            <img src="{{ asset('images/QR.jpeg') }}" class="w-28 h-28 rounded-lg" alt="Payment QR">
                        </div>
                        <p class="text-[10px] text-slate-400 font-bold mt-2.5 uppercase tracking-wider"><i class="fa-solid fa-lock mr-1 text-emerald-400"></i>100% Secure</p>
                    </div>
                </div>

                {{-- File Upload --}}
                <div>
                    <label class="text-[11px] font-bold text-slate-500 uppercase tracking-widest block mb-1.5">Upload Receipt</label>
                    <div class="relative group">
                        <input type="file" wire:model="payment_screenshot" id="payment_screenshot" required accept="image/*"
                            class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10">
                        <div class="w-full py-4 rounded-xl text-center transition-all flex flex-col items-center justify-center gap-1.5"
                            style="background:#f8fafc; border:2px dashed #cbd5e1;">
                            <div wire:loading.remove wire:target="payment_screenshot">
                                @if($payment_screenshot)
                                    <div class="w-9 h-9 rounded-full flex items-center justify-center mx-auto mb-1" style="background:#d1fae5; color:#059669;">
                                        <i class="fa-solid fa-check"></i>
                                    </div>
                                    <span class="text-xs font-bold text-emerald-700">Receipt Ready!</span>
                                @else
                                    <div class="w-9 h-9 rounded-full flex items-center justify-center mx-auto mb-1" style="background:#f1f5f9; color:#94a3b8; border:1px solid #e2e8f0;">
                                        <i class="fa-solid fa-cloud-arrow-up"></i>
                                    </div>
                                    <span class="text-xs font-bold text-slate-600">Tap to upload screenshot</span>
                                    <span class="text-[10px] text-slate-400 font-medium">PNG, JPG up to 5MB</span>
                                @endif
                            </div>
                            <div wire:loading wire:target="payment_screenshot" class="text-sky-600 font-bold text-xs flex items-center gap-2">
                                <i class="fa-solid fa-circle-notch fa-spin"></i> Uploading...
                            </div>
                        </div>
                    </div>
                    @error('payment_screenshot') <span class="text-red-500 text-xs mt-1 block font-medium"><i class="fa-solid fa-circle-exclamation mr-1"></i>{{ $message }}</span> @enderror
                </div>
                @endif

                {{-- Actions --}}
                <div class="space-y-2 pt-1">
                    <button type="submit"
                        class="w-full py-2.5 text-white font-bold rounded-xl text-sm transition-all flex justify-center items-center gap-2"
                        style="background: linear-gradient(135deg,#2563eb,#4f46e5); border:1px solid #3730a3; box-shadow: 0 4px 14px rgba(37,99,235,0.3);">
                        <span wire:loading.remove wire:target="submitRequest"><i class="fa-solid fa-paper-plane mr-1.5"></i>Confirm Payment</span>
                        <span wire:loading wire:target="submitRequest"><i class="fa-solid fa-circle-notch fa-spin mr-1.5"></i>Processing...</span>
                    </button>
                    <button type="button" wire:click="closeModal"
                        class="w-full py-2 text-slate-500 font-semibold rounded-xl text-xs uppercase tracking-wider hover:bg-slate-100 transition-colors">
                        Cancel
                    </button>
                </div>

            </form>
        </div>
    </div>
    @endif
</div>
