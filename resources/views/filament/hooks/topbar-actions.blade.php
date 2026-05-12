@if(auth()->user()->type !== 'admin')
<div class="flex items-center">
    <div class="flex items-center gap-2 px-3 py-1 bg-amber-500 rounded-full cursor-default select-none">
        <i class="fa-solid fa-coins text-white text-sm"></i>
        <div class="flex flex-col leading-none">
            <span class="text-sm font-bold text-white leading-none">
                {{ number_format(auth()->user()->coins ?? 0) }}
            </span>
        </div>
    </div>
</div>
@endif
