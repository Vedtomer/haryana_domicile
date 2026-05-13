<div>
    <button wire:click="openModal" style="background-color: #0f766e; color: white; border: 1px solid #0f766e;" class="flex items-center gap-1.5 px-3 py-1.5 hover:opacity-90 rounded-lg font-bold transition-colors shadow-sm text-xs uppercase tracking-wider">
        <i class="fa-solid fa-plus-circle text-white"></i>
        <span class="text-white">Add Coins</span>
    </button>

    @if($isOpen)
    <div class="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" wire:click="closeModal"></div>
        <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden z-10">
            <div class="p-5 border-b border-gray-100 flex justify-between items-center bg-white">
                <h3 class="font-bold text-xl flex items-center text-slate-800 tracking-tight"><i class="fa-solid fa-shield-halved mr-2" style="color: #3b82f6;"></i> Add Coins to Wallet</h3>
                <button type="button" wire:click="closeModal" class="text-gray-400 hover:text-gray-600 transition-colors"><i class="fa-solid fa-xmark text-xl"></i></button>
            </div>
            
            <form wire:submit.prevent="submitRequest" class="p-6">
                <div class="mb-4">
                    <p class="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Select Coin Package (1 Coin = 1 ₹)</p>
                    <select wire:model.live="package_amount" required class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none text-sm font-bold text-gray-700">
                        <option value="">-- Choose Package --</option>
                        @foreach($packages as $value => $label)
                            <option value="{{ $value }}">{{ $label }}</option>
                        @endforeach
                    </select>
                    @error('package_amount') <span class="text-red-500 text-xs mt-1 block">{{ $message }}</span> @enderror
                </div>

                @if($package_amount)
                <div class="mb-5 bg-blue-50/50 p-4 rounded-xl border border-blue-100/50 text-center shadow-sm">
                    <p class="text-xs text-blue-800 font-semibold mb-3 tracking-wide uppercase">Scan QR to pay ₹{{ $package_amount }}</p>
                    <div class="bg-white p-2 rounded-xl border border-blue-100 inline-block shadow-sm">
                        <img src="{{ asset('images/QR.jpeg') }}" class="w-32 h-32 rounded-lg" alt="Secure Payment QR">
                    </div>
                    <p class="text-[10px] text-blue-600/70 mt-3 flex items-center justify-center gap-1"><i class="fa-solid fa-lock"></i> 100% Secure Transaction</p>
                </div>
                


                <div class="mb-6">
                    <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Payment Screenshot</label>
                    <input type="file" wire:model="payment_screenshot" required accept="image/*" class="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none text-sm text-slate-700 transition-all file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer">
                    @error('payment_screenshot') <span class="text-red-500 text-xs mt-1.5 block font-medium">{{ $message }}</span> @enderror
                    <div wire:loading wire:target="payment_screenshot" class="text-xs text-blue-600 mt-2 font-medium flex items-center gap-2"><i class="fa-solid fa-spinner fa-spin"></i> Uploading securely...</div>
                </div>
                @endif

                <div class="flex gap-3 pt-2">
                    <button type="button" wire:click="closeModal" class="flex-1 px-4 py-3 border border-slate-200 text-slate-600 font-semibold rounded-xl hover:bg-slate-50 transition-all text-sm">Cancel</button>
                    <button type="submit" style="background-color: #2563eb; color: white;" class="flex-[2] px-4 py-3 hover:opacity-90 font-bold rounded-xl shadow-md shadow-blue-500/20 transition-all text-sm flex justify-center items-center gap-2">
                        <span wire:loading.remove wire:target="submitRequest" class="text-white">Submit Request</span>
                        <span wire:loading wire:target="submitRequest" class="text-white"><i class="fa-solid fa-spinner fa-spin"></i> Processing...</span>
                    </button>
                </div>
            </form>
            

        </div>
    </div>
    @endif
</div>
