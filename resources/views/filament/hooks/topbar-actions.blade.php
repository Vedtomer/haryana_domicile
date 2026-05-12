<div class="flex items-center gap-4 px-4 py-2">
    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    
    <style>
        .cyber-badge {
            background: linear-gradient(135deg, #fbbf24 0%, #d97706 100%);
            box-shadow: 0 0 15px rgba(251, 191, 36, 0.3), inset 0 0 10px rgba(255, 255, 255, 0.2);
            border: 1px solid rgba(251, 191, 36, 0.5);
            transition: all 0.3s ease;
        }
        .cyber-badge:hover {
            transform: scale(1.05);
            box-shadow: 0 0 20px rgba(251, 191, 36, 0.5);
        }
    </style>

    <!-- Coin Balance Badge -->
    <div class="cyber-badge flex items-center gap-2 px-4 py-1.5 rounded-full cursor-default select-none">
        <div class="flex items-center justify-center w-6 h-6 bg-white/20 rounded-full">
            <i class="fa-solid fa-coins text-white text-xs animate-pulse"></i>
        </div>
        <div class="flex flex-col leading-none">
            <span class="text-[11px] font-black text-white tracking-tight">
                {{ number_format(auth()->user()->coins ?? 0) }}
            </span>
            <span class="text-[7px] font-bold text-amber-100 uppercase tracking-widest">Coins</span>
        </div>
    </div>
</div>
