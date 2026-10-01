export const SERVICE_CATEGORIES = [
    {
        id: 'aadhar',
        name: 'Aadhar Card Services',
        shortName: 'Aadhar',
        color: 'from-amber-500 to-orange-500',
        badgeBg: 'bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-300 border-orange-200/70 dark:border-orange-800/60',
        icon: 'fingerprint',
        iconType: 'material',
        avatarBg: 'bg-orange-100 dark:bg-orange-900/40 text-orange-600',
        match: (text) => text.includes('aadhar') || text.includes('aadhaar') || text.includes('uid'),
    },
    {
        id: 'voter',
        name: 'Voter Card Services',
        shortName: 'Voter',
        color: 'from-blue-500 to-indigo-500',
        badgeBg: 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-300 border-blue-200/70 dark:border-blue-800/60',
        icon: 'how_to_vote',
        iconType: 'material',
        avatarBg: 'bg-blue-100 dark:bg-blue-900/40 text-blue-600',
        match: (text) => text.includes('voter') || text.includes('epic') || text.includes('sir_voter'),
    },
    {
        id: 'pan',
        name: 'Pan Card Services',
        shortName: 'PAN',
        color: 'from-cyan-500 to-blue-600',
        badgeBg: 'bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-300 border-cyan-200/70 dark:border-cyan-800/60',
        icon: 'credit_card',
        iconType: 'material',
        avatarBg: 'bg-cyan-100 dark:bg-cyan-900/40 text-cyan-600',
        match: (text) => text.includes('pan') && !text.includes('company'),
    },
    {
        id: 'vehicle',
        name: 'Vehicle Card Services',
        shortName: 'Vehicle',
        color: 'from-slate-700 to-slate-900',
        badgeBg: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
        icon: 'directions_car',
        iconType: 'material',
        avatarBg: 'bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200',
        match: (text) => text.includes('vehicle') || text.includes('puc') || text.includes('rc ') || text.includes('rc-') || text.includes('rc_') || text.includes('rc-pdf') || text.includes('licence') || text.includes('license') || text.includes('driving'),
    },
    {
        id: 'rasan',
        name: 'Rasan Card Services',
        shortName: 'Rasan / PPP',
        color: 'from-amber-600 to-yellow-600',
        badgeBg: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200/70 dark:border-amber-800/60',
        icon: 'receipt_long',
        iconType: 'material',
        avatarBg: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700',
        match: (text) => text.includes('ration') || text.includes('rasan') || text.includes('ppp') || text.includes('family') || text.includes('parivar'),
    },
    {
        id: 'farmer',
        name: 'Farmer Card Services',
        shortName: 'Farmer & Bills',
        color: 'from-emerald-500 to-teal-600',
        badgeBg: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200/70 dark:border-emerald-800/60',
        icon: 'agriculture',
        iconType: 'material',
        avatarBg: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700',
        match: (text) => text.includes('farmer') || text.includes('fasal') || text.includes('kisan') || text.includes('dhbvn') || text.includes('uhbvn') || text.includes('electricity') || text.includes('bijli'),
    },
    {
        id: 'certificates',
        name: 'Certificates & Legal',
        shortName: 'Certificates',
        color: 'from-purple-600 to-indigo-600',
        badgeBg: 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200/70 dark:border-purple-800/60',
        icon: 'verified',
        iconType: 'material',
        avatarBg: 'bg-purple-100 dark:bg-purple-900/40 text-purple-700',
        match: (text) => text.includes('domicile') || text.includes('birth') || text.includes('marriage') || text.includes('affidavit') || text.includes('salary') || text.includes('resume') || text.includes('saral') || text.includes('rent') || text.includes('kundli') || text.includes('ayushman') || text.includes('health') || text.includes('abha') || text.includes('certificate'),
    },
    {
        id: 'utilities',
        name: 'Smart Utilities & Tools',
        shortName: 'Utilities',
        color: 'from-indigo-500 to-purple-600',
        badgeBg: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200/70 dark:border-indigo-800/60',
        icon: 'handyman',
        iconType: 'material',
        avatarBg: 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700',
        match: () => true, // default catch-all
    },
];

export function getServiceCategory(service) {
    if (!service) return SERVICE_CATEGORIES[SERVICE_CATEGORIES.length - 1];
    const text = `${service.slug || ''} ${service.name || ''} ${service.module_key || ''}`.toLowerCase();
    
    // Priority order checking
    for (const cat of SERVICE_CATEGORIES) {
        if (cat.id === 'utilities') continue;
        if (cat.match(text)) {
            return cat;
        }
    }
    return SERVICE_CATEGORIES.find(c => c.id === 'utilities');
}

export function groupServicesByCategory(services = []) {
    const grouped = {};
    SERVICE_CATEGORIES.forEach(cat => {
        grouped[cat.id] = {
            category: cat,
            services: [],
        };
    });

    (services || []).forEach(service => {
        const cat = getServiceCategory(service);
        if (grouped[cat.id]) {
            grouped[cat.id].services.push(service);
        } else {
            grouped['utilities'].services.push(service);
        }
    });

    return SERVICE_CATEGORIES.map(cat => grouped[cat.id]).filter(g => g.services.length > 0);
}
