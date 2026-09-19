// Cache for transliteration results to avoid duplicate network calls
const cache = new Map();

// Basic phonetic dictionary for common Indian names, relations, and words
const COMMON_WORDS = {
    'shri': 'श्री',
    'shree': 'श्री',
    'smt': 'श्रीमती',
    'shrimati': 'श्रीमती',
    'kumar': 'कुमार',
    'singh': 'सिंह',
    'devi': 'देवी',
    'ram': 'राम',
    'ramesh': 'रमेश',
    'suresh': 'सुरेश',
    'mahesh': 'महेश',
    'dinesh': 'दिनेश',
    'naresh': 'नरेश',
    'rajesh': 'राजेश',
    'mukesh': 'मुकेश',
    'anil': 'अनिल',
    'sunil': 'सुनील',
    'amit': 'अमित',
    'sumit': 'सुमित',
    'rohit': 'रोहित',
    'mohit': 'मोहित',
    'vikas': 'विकास',
    'vikram': 'विक्रम',
    'rahul': 'राहुल',
    'vijay': 'विजय',
    'ajay': 'अजय',
    'sanjay': 'संजय',
    'deepak': 'दीपक',
    'pawan': 'पवन',
    'manoj': 'मनोज',
    'vinod': 'विनोद',
    'pradeep': 'प्रदीप',
    'kuldeep': 'कुलदीप',
    'sandeep': 'संदीप',
    'jaideep': 'जयदीप',
    'praveen': 'प्रवीण',
    'naveen': 'नवीन',
    'ashok': 'अशोक',
    'satish': 'सतीश',
    'jagdish': 'जगदीश',
    'harish': 'हरीश',
    'sunita': 'सुनीता',
    'anita': 'अनीता',
    'kavita': 'कविता',
    'geeta': 'गीता',
    'seema': 'सीमा',
    'reena': 'रीना',
    'meena': 'मीना',
    'pooja': 'पूजा',
    'aarti': 'आरती',
    'rekha': 'रेखा',
    'santosh': 'संतोष',
    'kamlesh': 'कमलेश',
    'saroj': 'सरोज',
    'pushpa': 'पुष्पा',
    'manju': 'मंजू',
    'anjali': 'अंजलि',
    'priya': 'प्रिया',
    'neha': 'नेहा',
    'sonia': 'सोनिया',
    'monika': 'मोनिका',
    'kanta': 'कांता',
    'shanti': 'शांति',
    'maya': 'माया',
    'radha': 'राधा',
    'krishna': 'कृष्णा',
    'sharma': 'शर्मा',
    'verma': 'वर्मा',
    'gupta': 'गुप्ता',
    'yadav': 'यादव',
    'saini': 'सैनी',
    'jangra': 'जांगड़ा',
    'kamboj': 'कंबोज',
    'rana': 'राणा',
    'malik': 'मलिक',
    'dalal': 'दलाल',
    'hooda': 'हुड्डा',
    'chahal': 'चहल',
    'panwar': 'पंवार',
    'tanwar': 'तंवर',
    'rawat': 'रावत',
    'chaudhary': 'चौधरी',
    'jaat': 'जाट',
    'jat': 'जाट',
    'brahman': 'ब्राह्मण',
    'pandit': 'पंडित',
    'khatri': 'खत्री',
    'arora': 'अरोड़ा',
    'bhatia': 'भाटिया',
    'vpo': 'वी.पी.ओ.',
    'vill': 'गाँव',
    'village': 'गाँव',
    'post': 'डाकघर',
    'tehsil': 'तहसील',
    'distt': 'जिला',
    'district': 'जिला',
    'haryana': 'हरियाणा',
    'karnal': 'करनाल',
    'panipat': 'पानीपत',
    'kurukshetra': 'कुरुक्षेत्र',
    'ambala': 'अंबाला',
    'yamunanagar': 'यमुनानगर',
    'kaithal': 'कैथल',
    'rohtak': 'रोहतक',
    'sonipat': 'सोनीपत',
    'hisar': 'हिसार',
    'bhiwani': 'भिवानी',
    'sirsa': 'सिरसा',
    'fatehabad': 'फतेहाबाद',
    'jind': 'जींद',
    'jhajjar': 'झज्जर',
    'gurugram': 'गुरुग्राम',
    'gurgaon': 'गुड़गांव',
    'faridabad': 'फरीदाबाद',
    'rewari': 'रेवाड़ी',
    'narnaul': 'नारनौल',
    'mahendragarh': 'महेंद्रगढ़',
    'palwal': 'पलवल',
    'nuh': 'नूंह',
    'panchkula': 'पंचकूला',
    'charkhi': 'चरखी',
    'dadri': 'दादरी',
};

/**
 * Quick client-side phonetic fallback for instant UI response while API loads.
 */
export function quickPhoneticHindi(text) {
    if (!text) return '';
    
    // Check if already contains devanagari
    if (/[\u0900-\u097F]/.test(text)) {
        return text;
    }

    const words = text.split(/(\s+|[.,/\\#-]+)/);
    const converted = words.map(w => {
        const lower = w.toLowerCase().trim();
        if (COMMON_WORDS[lower]) {
            return COMMON_WORDS[lower];
        }
        return w;
    });

    return converted.join('');
}

/**
 * Transliterate text to Hindi using the backend API route with caching.
 */
export async function transliterateToHindi(text) {
    const trimmed = (text || '').trim();
    if (!trimmed) return '';

    // If pure devanagari, return as is
    if (/^[\u0900-\u097F\s,.-]+$/.test(trimmed)) {
        return trimmed;
    }

    const cacheKey = trimmed.toLowerCase();
    if (cache.has(cacheKey)) {
        return cache.get(cacheKey);
    }

    try {
        const response = await fetch(`/api/transliterate-hindi?text=${encodeURIComponent(trimmed)}`);
        if (response.ok) {
            const data = await response.json();
            if (data && data.success && data.result) {
                cache.set(cacheKey, data.result);
                return data.result;
            }
        }
    } catch (e) {
        console.warn('Transliteration API failed, using fallback:', e);
    }

    // Fallback to quick dictionary
    const fallback = quickPhoneticHindi(trimmed);
    cache.set(cacheKey, fallback);
    return fallback;
}
