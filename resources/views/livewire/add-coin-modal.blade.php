<div>
    <button wire:click="openModal" style="background-color: #0f766e; color: white; border: 1px solid #0f766e;" class="flex items-center gap-1.5 px-3 py-1.5 hover:opacity-90 rounded-lg font-bold transition-colors shadow-sm text-xs uppercase tracking-wider">
        <i class="fa-solid fa-plus-circle text-white"></i>
        <span class="text-white">Add Coins</span>
    </button>

    @if($isOpen)
    <div class="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" wire:click="closeModal"></div>
        <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden z-10">
            <div style="background: linear-gradient(to right, #f97316, #ea580c); color: white;" class="p-5 flex justify-between items-center">
                <h3 class="font-black text-lg flex items-center text-white"><i class="fa-solid fa-coins mr-2 text-white"></i> Add Coins to Wallet</h3>
                <button type="button" wire:click="closeModal" class="text-white/80 hover:text-white"><i class="fa-solid fa-xmark text-xl text-white"></i></button>
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
                <div class="mb-4 bg-orange-50 p-3 rounded-xl border border-orange-200 text-center">
                    <p class="text-xs text-orange-800 font-bold mb-2">Scan QR to pay ₹{{ $package_amount }}</p>
                    <img src="{{ asset('images/QR.jpeg') }}" class="w-32 h-32 mx-auto rounded-lg border border-orange-300" alt="Payment QR">
                </div>
                


                <div class="mb-6">
                    <label class="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Payment Screenshot</label>
                    <input type="file" wire:model="payment_screenshot" required accept="image/*" class="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none text-sm text-black">
                    @error('payment_screenshot') <span class="text-red-500 text-xs mt-1 block">{{ $message }}</span> @enderror
                    <div wire:loading wire:target="payment_screenshot" class="text-xs text-blue-500 mt-1"><i class="fa-solid fa-spinner fa-spin"></i> Uploading...</div>
                </div>
                @endif

                <div class="flex gap-3">
                    <button type="button" wire:click="closeModal" class="flex-1 px-4 py-3 border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition-all uppercase text-xs">Cancel</button>
                    <button type="submit" style="background-color: #f97316; color: white;" class="flex-[2] px-4 py-3 hover:opacity-90 font-black rounded-xl shadow-lg transition-all uppercase text-xs">
                        <span wire:loading.remove wire:target="submitRequest" class="text-white">Submit Request</span>
                        <span wire:loading wire:target="submitRequest" class="text-white"><i class="fa-solid fa-spinner fa-spin mr-2"></i> Submitting...</span>
                    </button>
                </div>
            </form>
            
            <div class="bg-gray-50 border-t border-gray-100 p-4 max-h-[150px] overflow-y-auto">
                <h4 class="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Recent Requests</h4>
                @php
                    $requests = \App\Models\CoinPurchaseRequest::where('user_id', auth()->id())->latest()->take(3)->get();
                @endphp
                @if($requests->isEmpty())
                    <p class="text-xs text-gray-400">No recent requests.</p>
                @else
                    <ul class="space-y-2">
                        @foreach($requests as $req)
                        <li class="flex justify-between items-center text-xs bg-white p-2 rounded border border-gray-100">
                            <span class="font-bold">₹{{ $req->package_amount }}</span>
                            <span class="font-mono text-gray-500">{{ $req->created_at->diffForHumans() }}</span>
                            <span class="font-bold px-2 py-0.5 rounded {{ $req->status === 'pending' ? 'bg-yellow-100 text-yellow-700' : ($req->status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700') }}">
                                {{ ucfirst($req->status) }}
                            </span>
                        </li>
                        @endforeach
                    </ul>
                @endif
            </div>
        </div>
    </div>
    @endif
</div>
