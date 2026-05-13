<div>
    <button wire:click="openModal" style="background: linear-gradient(135deg,#059669,#0d9488); color:white; border:1px solid #059669;" class="flex items-center gap-1.5 px-3 py-1.5 hover:opacity-90 rounded-lg font-bold transition-all shadow-sm text-xs uppercase tracking-wider">
        <i class="fa-solid fa-wallet"></i>
        <span>Add Coins</span>
    </button>

    @if($isOpen)
    {{-- Overlay: covers everything including Filament sidebar/topbar --}}
    <div style="position:fixed; inset:0; z-index:99999; display:flex; align-items:center; justify-content:center; padding:16px;">
        {{-- Backdrop --}}
        <div wire:click="closeModal" style="position:absolute; inset:0; background:rgba(15,23,42,0.65); backdrop-filter:blur(3px); z-index:0;"></div>

        {{-- Modal Card --}}
        <div style="position:relative; z-index:1; width:100%; max-width:360px; background:#f8fafc; border-radius:16px; overflow:hidden; box-shadow:0 25px 50px -8px rgba(15,23,42,0.35), 0 0 0 1px rgba(148,163,184,0.18);">

            {{-- Header --}}
            <div style="background:#ffffff; border-bottom:1px solid #e2e8f0; padding:14px 16px; display:flex; align-items:center; justify-content:space-between;">
                <div style="display:flex; align-items:center; gap:10px;">
                    <div style="width:32px; height:32px; border-radius:10px; background:#eff6ff; border:1px solid #bfdbfe; display:flex; align-items:center; justify-content:center; color:#3b82f6; font-size:14px; flex-shrink:0;">
                        <i class="fa-solid fa-shield-halved"></i>
                    </div>
                    <div>
                        <p style="font-size:14px; font-weight:800; color:#1e293b; line-height:1.2; margin:0;">Add Coins to Wallet</p>
                        <p style="font-size:10px; font-weight:700; color:#059669; text-transform:uppercase; letter-spacing:0.05em; margin:0;"><i class="fa-solid fa-lock" style="margin-right:2px;"></i>Secure Payment</p>
                    </div>
                </div>
                <button type="button" wire:click="closeModal" style="width:28px; height:28px; border-radius:50%; background:transparent; border:none; color:#94a3b8; cursor:pointer; display:flex; align-items:center; justify-content:center; font-size:14px; transition:background 0.15s;" onmouseover="this.style.background='#f1f5f9'" onmouseout="this.style.background='transparent'">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>

            {{-- Body --}}
            <form wire:submit.prevent="submitRequest" style="padding:14px 16px 16px;">

                {{-- Package Select --}}
                <div style="margin-bottom:12px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                        <label style="font-size:10px; font-weight:700; color:#64748b; text-transform:uppercase; letter-spacing:0.06em;">Select Package</label>
                        <span style="font-size:10px; font-weight:700; color:#2563eb; background:#eff6ff; border:1px solid #bfdbfe; padding:1px 7px; border-radius:6px;">1 Coin = ₹1</span>
                    </div>
                    <select wire:model.live="package_amount" required
                        style="width:100%; padding:9px 12px; font-size:13px; font-weight:700; color:#1e293b; background:#ffffff; border:1px solid #cbd5e1; border-radius:10px; outline:none; box-shadow:0 1px 3px rgba(0,0,0,0.06); cursor:pointer; appearance:auto;">
                        <option value="">-- Choose Package --</option>
                        @foreach($packages as $value => $label)
                            <option value="{{ $value }}">{{ $label }}</option>
                        @endforeach
                    </select>
                    @error('package_amount') <span style="color:#ef4444; font-size:11px; margin-top:4px; display:block;"><i class="fa-solid fa-circle-exclamation" style="margin-right:3px;"></i>{{ $message }}</span> @enderror
                </div>

                @if($package_amount)
                {{-- QR Code --}}
                <div style="margin-bottom:12px; background:#f0f9ff; border:1px solid #bae6fd; border-radius:12px; overflow:hidden; text-align:center;">
                    <div style="height:3px; background:linear-gradient(90deg,#38bdf8,#818cf8);"></div>
                    <div style="padding:12px 12px 10px;">
                        <p style="font-size:10px; font-weight:800; color:#0369a1; text-transform:uppercase; letter-spacing:0.07em; margin:0 0 8px;"><i class="fa-solid fa-qrcode" style="margin-right:3px;"></i>Scan & Pay ₹{{ number_format($package_amount) }}</p>
                        <div style="display:inline-block; background:#ffffff; padding:7px; border-radius:10px; border:1px solid #e2e8f0; box-shadow:0 2px 8px rgba(0,0,0,0.08);">
                            <img src="{{ asset('images/QR.jpeg') }}" style="width:100px; height:100px; border-radius:6px; display:block;" alt="Payment QR">
                        </div>
                        <p style="font-size:10px; color:#94a3b8; font-weight:700; margin:8px 0 0; text-transform:uppercase; letter-spacing:0.05em;"><i class="fa-solid fa-lock" style="color:#34d399; margin-right:3px;"></i>100% Secure</p>
                    </div>
                </div>

                {{-- File Upload --}}
                <div style="margin-bottom:14px;">
                    <label style="font-size:10px; font-weight:700; color:#64748b; text-transform:uppercase; letter-spacing:0.06em; display:block; margin-bottom:6px;">Upload Receipt</label>
                    <div style="position:relative;">
                        <input type="file" wire:model="payment_screenshot" id="payment_screenshot" required accept="image/*"
                            style="position:absolute; inset:0; width:100%; height:100%; opacity:0; cursor:pointer; z-index:1;">
                        <div style="width:100%; padding:14px; border-radius:10px; background:#f8fafc; border:2px dashed #cbd5e1; text-align:center;">
                            <div wire:loading.remove wire:target="payment_screenshot">
                                @if($payment_screenshot)
                                    <div style="width:32px; height:32px; border-radius:50%; background:#d1fae5; color:#059669; display:flex; align-items:center; justify-content:center; margin:0 auto 6px;">
                                        <i class="fa-solid fa-check"></i>
                                    </div>
                                    <span style="font-size:12px; font-weight:700; color:#059669;">Receipt Ready!</span>
                                @else
                                    <div style="width:32px; height:32px; border-radius:50%; background:#f1f5f9; color:#94a3b8; border:1px solid #e2e8f0; display:flex; align-items:center; justify-content:center; margin:0 auto 5px;">
                                        <i class="fa-solid fa-cloud-arrow-up" style="font-size:13px;"></i>
                                    </div>
                                    <span style="font-size:12px; font-weight:600; color:#475569; display:block;">Tap to upload screenshot</span>
                                    <span style="font-size:10px; color:#94a3b8; font-weight:600;">PNG, JPG up to 5MB</span>
                                @endif
                            </div>
                            <div wire:loading wire:target="payment_screenshot" style="color:#0284c7; font-size:12px; font-weight:700; display:flex; align-items:center; justify-content:center; gap:6px;">
                                <i class="fa-solid fa-circle-notch fa-spin"></i> Uploading...
                            </div>
                        </div>
                    </div>
                    @error('payment_screenshot') <span style="color:#ef4444; font-size:11px; margin-top:4px; display:block;"><i class="fa-solid fa-circle-exclamation" style="margin-right:3px;"></i>{{ $message }}</span> @enderror
                </div>
                @endif

                {{-- Buttons --}}
                <div style="display:flex; flex-direction:column; gap:6px;">
                    <button type="submit"
                        style="width:100%; padding:10px; color:white; font-weight:700; font-size:13px; border-radius:10px; border:1px solid #3730a3; background:linear-gradient(135deg,#2563eb,#4f46e5); box-shadow:0 4px 14px rgba(37,99,235,0.3); cursor:pointer; display:flex; align-items:center; justify-content:center; gap:6px; transition:opacity 0.15s;" onmouseover="this.style.opacity='0.9'" onmouseout="this.style.opacity='1'">
                        <span wire:loading.remove wire:target="submitRequest"><i class="fa-solid fa-paper-plane" style="margin-right:5px;"></i>Confirm Payment</span>
                        <span wire:loading wire:target="submitRequest"><i class="fa-solid fa-circle-notch fa-spin" style="margin-right:5px;"></i>Processing...</span>
                    </button>
                    <button type="button" wire:click="closeModal"
                        style="width:100%; padding:8px; color:#64748b; font-weight:600; font-size:11px; border-radius:10px; border:none; background:transparent; cursor:pointer; text-transform:uppercase; letter-spacing:0.05em; transition:background 0.15s;" onmouseover="this.style.background='#f1f5f9'" onmouseout="this.style.background='transparent'">
                        Cancel
                    </button>
                </div>

            </form>
        </div>
    </div>
    @endif
</div>
