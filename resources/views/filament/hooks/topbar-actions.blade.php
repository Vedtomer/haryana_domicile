<div class="flex items-center gap-4 px-4 py-2">
    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    
    <!-- Wallet Balance Badge -->
    <div class="transition hover:scale-105 hidden md:block">
        <div class="flex items-center gap-3 bg-gradient-to-r from-yellow-400 to-amber-600 px-4 py-1.5 rounded-xl shadow-md border border-amber-200/30 backdrop-blur-sm">
            <div class="bg-white/20 p-1.5 rounded-lg">
                <i class="fa-solid fa-coins text-white text-base animate-pulse"></i>
            </div>
            <div class="flex flex-col">
                <span class="text-[8px] font-bold text-amber-900/80 uppercase tracking-widest leading-none">Wallet Balance</span>
                <div class="flex items-baseline gap-1">
                    <span class="text-lg font-black text-white leading-none">
                        {{ number_format(auth()->user()->coins ?? 0) }}
                    </span>
                    <span class="text-[8px] font-bold text-white uppercase opacity-80">Coins</span>
                </div>
            </div>
        </div>
    </div>

    <!-- Mobile Wallet Balance (Icon only or smaller) -->
    <div class="md:hidden bg-amber-500 px-3 py-1 rounded-lg flex items-center gap-2 border border-amber-400">
        <i class="fa-solid fa-coins text-white text-xs"></i>
        <span class="text-white font-black text-sm">{{ number_format(auth()->user()->coins ?? 0) }}</span>
    </div>

    <!-- Logout Button -->
    <form id="topbar-logout-form" action="{{ route('filament.admin.auth.logout') }}" method="POST" class="h-full">
        @csrf
        <button type="submit" class="group flex items-center gap-2 bg-red-50 hover:bg-red-500 px-4 py-1.5 rounded-xl border border-red-200 hover:border-red-600 shadow-sm transition-all duration-300">
            <div class="bg-red-100 group-hover:bg-white/20 p-1.5 rounded-lg transition-colors">
                <i class="fa-solid fa-right-from-bracket text-red-600 group-hover:text-white text-base"></i>
            </div>
            <span class="text-xs font-black text-red-600 group-hover:text-white uppercase tracking-tight hidden sm:inline">LOGOUT</span>
        </button>
    </form>
</div>
