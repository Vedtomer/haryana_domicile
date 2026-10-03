export const SERVICE_CATEGORIES = [
    {
        id: 'aadhar',
        name: 'Aadhaar Card Services',
        hindiName: 'आधार कार्ड सेवाएं',
        shortName: 'Aadhaar',
        description: 'Aadhaar manual maker, mobile update, DOB, name correction & UID info',
        color: 'from-amber-500 to-orange-600',
        border: 'border-orange-400 dark:border-orange-500',
        badgeBg: 'bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 border-orange-200/70 dark:border-orange-800/60',
        icon: 'fingerprint',
        iconType: 'material',
        avatarBg: 'bg-orange-100 dark:bg-orange-900/40 text-orange-600',
        headerBg: 'from-orange-500/15 via-amber-500/5 to-transparent border-l-4 border-orange-500',
        accentColor: 'text-orange-600 dark:text-orange-400',
    },
    {
        id: 'pan',
        name: 'PAN Card Services',
        hindiName: 'पैन कार्ड सेवाएं',
        shortName: 'PAN Card',
        description: 'Manual PAN card maker, PAN to Aadhaar, search unmasked & NSDL/UTI PVC',
        color: 'from-cyan-500 to-blue-600',
        border: 'border-cyan-400 dark:border-cyan-500',
        badgeBg: 'bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 border-cyan-200/70 dark:border-cyan-800/60',
        icon: 'credit_card',
        iconType: 'material',
        avatarBg: 'bg-cyan-100 dark:bg-cyan-900/40 text-cyan-600',
        headerBg: 'from-cyan-500/15 via-blue-500/5 to-transparent border-l-4 border-cyan-500',
        accentColor: 'text-cyan-600 dark:text-cyan-400',
    },
    {
        id: 'marriage',
        name: 'Marriage & Certificates',
        hindiName: 'विवाह एवं प्रमाण पत्र',
        shortName: 'Marriage & Cert.',
        description: 'Marriage certificate, domicile, birth certificate add/download & Saral',
        color: 'from-rose-500 to-pink-600',
        border: 'border-pink-400 dark:border-pink-500',
        badgeBg: 'bg-pink-50 dark:bg-pink-950/40 text-pink-700 dark:text-pink-300 border-pink-200/70 dark:border-pink-800/60',
        icon: 'history_edu',
        iconType: 'material',
        avatarBg: 'bg-pink-100 dark:bg-pink-900/40 text-pink-600',
        headerBg: 'from-pink-500/15 via-rose-500/5 to-transparent border-l-4 border-pink-500',
        accentColor: 'text-pink-600 dark:text-pink-400',
    },
    {
        id: 'ppp',
        name: 'Family ID / Parivar Pehchan Patra (PPP)',
        hindiName: 'परिवार पहचान पत्र (PPP)',
        shortName: 'Family ID (PPP)',
        description: 'PPP ID to Aadhaar, mobile, bank details, Aadhaar to PPP & Family ID PVC',
        color: 'from-amber-600 to-yellow-600',
        border: 'border-amber-400 dark:border-amber-500',
        badgeBg: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200/70 dark:border-amber-800/60',
        icon: 'family_restroom',
        iconType: 'material',
        avatarBg: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700',
        headerBg: 'from-amber-500/15 via-yellow-500/5 to-transparent border-l-4 border-amber-500',
        accentColor: 'text-amber-600 dark:text-amber-400',
    },
    {
        id: 'voter',
        name: 'Voter Card Services',
        hindiName: 'वोटर कार्ड सेवाएं',
        shortName: 'Voter Card',
        description: 'Voter card manual maker, address change, mobile update & S.I.R roll list',
        color: 'from-blue-600 to-indigo-600',
        border: 'border-blue-400 dark:border-blue-500',
        badgeBg: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200/70 dark:border-blue-800/60',
        icon: 'how_to_vote',
        iconType: 'material',
        avatarBg: 'bg-blue-100 dark:bg-blue-900/40 text-blue-600',
        headerBg: 'from-blue-500/15 via-indigo-500/5 to-transparent border-l-4 border-blue-500',
        accentColor: 'text-blue-600 dark:text-blue-400',
    },
    {
        id: 'vehicle',
        name: 'Vehicle & RTO Services',
        hindiName: 'वाहन एवं आरटीओ सेवाएं',
        shortName: 'Vehicle & DL',
        description: 'Vehicle RC details, mobile lookup, PUC download, Driving Licence cards',
        color: 'from-slate-700 to-slate-900',
        border: 'border-slate-500 dark:border-slate-600',
        badgeBg: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
        icon: 'directions_car',
        iconType: 'material',
        avatarBg: 'bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200',
        headerBg: 'from-slate-500/15 via-slate-600/5 to-transparent border-l-4 border-slate-600',
        accentColor: 'text-slate-700 dark:text-slate-300',
    },
    {
        id: 'courier',
        name: 'Courier & Parcel Services',
        hindiName: 'कूरियर एवं पार्सल सेवाएं',
        shortName: 'Courier & Dispatch',
        description: 'Print parcel address slips with Sender/Receiver info, barcode & dynamic QR',
        color: 'from-amber-600 to-orange-700',
        border: 'border-orange-500 dark:border-orange-600',
        badgeBg: 'bg-orange-50 dark:bg-orange-950/40 text-orange-800 dark:text-orange-200 border-orange-200 dark:border-orange-800',
        icon: 'local_shipping',
        iconType: 'material',
        avatarBg: 'bg-orange-100 dark:bg-orange-900/40 text-orange-700',
        headerBg: 'from-orange-600/15 via-amber-600/5 to-transparent border-l-4 border-orange-600',
        accentColor: 'text-orange-600 dark:text-orange-400',
    },
    {
        id: 'health',
        name: 'Ayushman & Health Services',
        hindiName: 'आयुष्मान एवं स्वास्थ्य सेवाएं',
        shortName: 'Ayushman & Health',
        description: 'Ayushman 3Lakh income card make, ABHA Health ID creation & PVC cards',
        color: 'from-emerald-600 to-teal-700',
        border: 'border-emerald-400 dark:border-emerald-500',
        badgeBg: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200/70 dark:border-emerald-800/60',
        icon: 'health_and_safety',
        iconType: 'material',
        avatarBg: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700',
        headerBg: 'from-emerald-500/15 via-teal-500/5 to-transparent border-l-4 border-emerald-500',
        accentColor: 'text-emerald-600 dark:text-emerald-400',
    },
    {
        id: 'bills',
        name: 'Electricity Bills & Govt Utility',
        hindiName: 'बिजली बिल एवं सरकारी सेवाएं',
        shortName: 'Bills & Govt',
        description: 'DHBVN/UHBVN Bijli bill PDF, Bihar Ration Card, Kundli, Passport maker & IFSC',
        color: 'from-indigo-600 to-blue-700',
        border: 'border-indigo-400 dark:border-indigo-500',
        badgeBg: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200/70 dark:border-indigo-800/60',
        icon: 'receipt_long',
        iconType: 'material',
        avatarBg: 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700',
        headerBg: 'from-indigo-500/15 via-blue-500/5 to-transparent border-l-4 border-indigo-500',
        accentColor: 'text-indigo-600 dark:text-indigo-400',
    },
    {
        id: 'utilities',
        name: 'Cyber Café Tools & Affidavits',
        hindiName: 'साइबर कैफे टूल्स एवं फॉर्म',
        shortName: 'Cyber Tools',
        description: 'Smart PVC card maker, WhatsApp sender, photo/sign resizer, khata & legal forms',
        color: 'from-purple-600 to-violet-700',
        border: 'border-purple-400 dark:border-purple-500',
        badgeBg: 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200/70 dark:border-purple-800/60',
        icon: 'handyman',
        iconType: 'material',
        avatarBg: 'bg-purple-100 dark:bg-purple-900/40 text-purple-700',
        headerBg: 'from-purple-500/15 via-violet-500/5 to-transparent border-l-4 border-purple-500',
        accentColor: 'text-purple-600 dark:text-purple-400',
    },
];

/**
 * Returns the exact category object that a service belongs to.
 * Checks categories in strict priority order to prevent cross-contamination.
 */
export function getServiceCategory(service) {
    if (!service) return SERVICE_CATEGORIES.find(c => c.id === 'utilities');

    const slug = (service.slug || '').toLowerCase();
    const name = (service.name || '').toLowerCase();
    const moduleKey = (service.module_key || '').toLowerCase();
    const text = `${slug} ${name} ${moduleKey}`;

    // 1. Courier & Parcel Slip Maker
    if (text.includes('courier') || text.includes('parcel')) {
        return SERVICE_CATEGORIES.find(c => c.id === 'courier');
    }

    // 2. Marriage, Domicile, Birth records & Saral Certificates
    if (
        text.includes('marriage') ||
        text.includes('shadi') ||
        slug.includes('domicile') ||
        name.includes('domicile') ||
        slug.includes('birth') ||
        name.includes('birth') ||
        slug.includes('saral') ||
        name.includes('saral')
    ) {
        return SERVICE_CATEGORIES.find(c => c.id === 'marriage');
    }

    // 3. Parivar Pehchan Patra (Family ID / PPP)
    // Matches PPP and Family ID lookups without leaking into Aadhaar or Marriage
    if (
        text.includes('ppp') ||
        text.includes('familyid') ||
        text.includes('family-id') ||
        text.includes('family_id') ||
        text.includes('parivar') ||
        (text.includes('family') && !text.includes('marriage'))
    ) {
        return SERVICE_CATEGORIES.find(c => c.id === 'ppp');
    }

    // 4. PAN Card Services
    // Captures all PAN lookups, manual PAN makers, and NSDL/UTI PVC cards
    if (
        (text.includes('pan') && !text.includes('company')) ||
        slug.includes('pan')
    ) {
        return SERVICE_CATEGORIES.find(c => c.id === 'pan');
    }

    // 5. Aadhaar Services
    // Captures Aadhaar manual maker, updates, DOB change, name change, info
    if (
        text.includes('aadhar') ||
        text.includes('aadhaar') ||
        text.includes('uid')
    ) {
        return SERVICE_CATEGORIES.find(c => c.id === 'aadhar');
    }

    // 6. Voter Card Services
    if (
        text.includes('voter') ||
        text.includes('epic') ||
        text.includes('sir_voter') ||
        text.includes('sir-voter')
    ) {
        return SERVICE_CATEGORIES.find(c => c.id === 'voter');
    }

    // 7. Vehicle & Driving Licence Services
    if (
        text.includes('vehicle') ||
        text.includes('vahan') ||
        text.includes('puc') ||
        text.includes('rc ') ||
        text.includes('rc-') ||
        text.includes('rc_') ||
        text.includes('rc-pdf') ||
        text.includes('licence') ||
        text.includes('license') ||
        text.includes('driving')
    ) {
        return SERVICE_CATEGORIES.find(c => c.id === 'vehicle');
    }

    // 8. Ayushman & Health Services
    if (
        text.includes('ayushman') ||
        text.includes('chirayu') ||
        text.includes('health') ||
        text.includes('abha')
    ) {
        return SERVICE_CATEGORIES.find(c => c.id === 'health');
    }

    // 9. Electricity Bills & Govt Utilities
    if (
        text.includes('dhbvn') ||
        text.includes('uhbvn') ||
        text.includes('electricity') ||
        text.includes('bijli') ||
        text.includes('bill') ||
        text.includes('ration') ||
        text.includes('rasan') ||
        text.includes('airtel') ||
        text.includes('ifsc') ||
        text.includes('kundli') ||
        text.includes('passport') ||
        text.includes('farmer') ||
        text.includes('kisan') ||
        text.includes('fasal')
    ) {
        return SERVICE_CATEGORIES.find(c => c.id === 'bills');
    }

    // 10. Default / Cyber Cafe Tools & Affidavits
    return SERVICE_CATEGORIES.find(c => c.id === 'utilities');
}

/**
 * Groups an array of services by their category.
 * Returns only groups that contain at least one service.
 */
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
