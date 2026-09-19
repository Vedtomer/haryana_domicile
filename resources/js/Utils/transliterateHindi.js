// Cache for transliteration results to avoid duplicate network calls
const cache = new Map();

// Comprehensive dictionary for Indian names, relations, places, and common administrative terms
const COMMON_WORDS = {
    // Honorifics & Relations
    'shri': 'श्री',
    'shree': 'श्री',
    'smt': 'श्रीमती',
    'shrimati': 'श्रीमती',
    'kumar': 'कुमार',
    'singh': 'सिंह',
    'devi': 'देवी',
    'kaur': 'कौर',
    'kumari': 'कुमारी',
    'bai': 'बाई',
    'rani': 'रानी',
    'lal': 'लाल',
    'chand': 'चंद',
    'ram': 'राम',
    'das': 'दास',
    'nath': 'नाथ',
    'pal': 'पाल',
    'dayal': 'दयाल',
    'prasad': 'प्रसाद',
    'prakash': 'प्रकाश',
    'swarup': 'स्वरूप',
    'narayan': 'नारायण',
    'bhushan': 'भूषण',
    'mohan': 'मोहन',
    'chandra': 'चंद्र',
    'swami': 'स्वामी',
    'father': 'पिता',
    'mother': 'माता',
    'son': 'पुत्र',
    'daughter': 'पुत्री',
    'wife': 'पत्नी',
    'husband': 'पति',
    'child': 'बच्चा',
    'children': 'बच्चे',

    // Male First Names
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
    'kapil': 'कपिल',
    'sonu': 'सोनू',
    'monu': 'मोनू',
    'aarav': 'आरव',
    'aryan': 'आर्यन',
    'advik': 'अद्विक',
    'reyansh': 'रेयांश',
    'vihaan': 'विहान',
    'krishna': 'कृष्णा',
    'krishan': 'कृष्ण',
    'shivam': 'शिवम',
    'prince': 'प्रिंस',
    'lucky': 'लकी',
    'sahil': 'साहिल',
    'aman': 'अमन',
    'nitin': 'नितिन',
    'rakesh': 'राकेश',
    'manish': 'मनीष',
    'ravinder': 'रविंद्र',
    'surender': 'सुरेंद्र',
    'devender': 'देवेंद्र',
    'virender': 'वीरेंद्र',
    'joginder': 'जोगिंदर',
    'balwinder': 'बलविंदर',
    'kulwinder': 'कुलविंदर',
    'harwinder': 'हरविंदर',
    'jaswinder': 'जसविंदर',
    'gurmeet': 'गुरमीत',
    'baljeet': 'बलजीत',
    'paramjeet': 'परमजीत',
    'manjeet': 'मनजीत',
    'surjeet': 'सुरजीत',
    'harjeet': 'हरजीत',
    'sukhwinder': 'सुखविंदर',
    'gurpreet': 'गुरप्रीत',
    'harpreet': 'हरप्रीत',
    'manpreet': 'मनप्रीत',
    'jaspreet': 'जसpreet',
    'amandeep': 'अमनदीप',
    'hardeep': 'हरदीप',
    'navdeep': 'नवदीप',
    'gurdeep': 'गुरदीप',
    'mandeep': 'मनदीप',
    'rajinder': 'राजिंदर',
    'satinder': 'सतिंदर',
    'surinder': 'सुरिंदर',
    'jatinder': 'जतिंदर',
    'varinder': 'वरिंदर',
    'narinder': 'नरिंदर',
    'davinder': 'दविंदर',
    'birender': 'बीरेंद्र',
    'dharamvir': 'धर्मवीर',
    'mahavir': 'महावीर',
    'karamvir': 'कर्मवीर',
    'raghuvir': 'रघुवीर',
    'sukhvir': 'सुखवीर',
    'jaivir': 'जयवीर',
    'randhir': 'रणधीर',
    'ranbir': 'रणबीर',
    'balbir': 'बलबीर',
    'rajbir': 'राजबीर',
    'jasbir': 'जसबीर',
    'kulbir': 'कुलबीर',
    'dalbir': 'दलबीर',
    'shamsher': 'शमशेर',
    'dilbagh': 'दिलबाग',
    'rajkumar': 'राजकुमार',
    'sompal': 'सोमपाल',
    'ramkumar': 'रामकुमार',
    'ramniwas': 'रामनिवास',
    'ramphal': 'रामफल',
    'rampal': 'रामपाल',
    'rammehar': 'राममेहर',
    'ishwar': 'ईश्वर',
    'jai': 'जय',
    'dharam': 'धर्म',
    'rohtash': 'रोहताश',
    'omprakash': 'ओमप्रकाश',
    'satpal': 'सतपाल',
    'subhash': 'सुभाष',
    'vedpal': 'वेदपाल',
    'gian': 'ज्ञान',
    'rajender': 'राजेंद्र',
    'vijender': 'विजेंद्र',
    'satyender': 'सत्येंद्र',
    'brijender': 'बृजेंद्र',
    'gajender': 'गजेंद्र',
    'jitender': 'जितेंद्र',
    'hitender': 'हितेंद्र',
    'yogender': 'योगेंद्र',
    'pushpender': 'पुष्पेंद्र',
    'harendra': 'हरेंद्र',
    'devendra': 'देवेंद्र',
    'narendra': 'नरेंद्र',
    'dharmendra': 'धर्मेंद्र',
    'ankit': 'अंकित',
    'pankaj': 'पंकज',
    'gaurav': 'गौरव',
    'saurabh': 'सौरभ',
    'tarun': 'तरुण',
    'varun': 'वरुण',
    'kunal': 'कुणाल',
    'hemant': 'हेमंत',
    'bharat': 'भारत',
    'alok': 'आलोक',
    'anand': 'आनंद',
    'shashi': 'शशि',
    'roshan': 'रोशन',
    'karan': 'करण',
    'arjun': 'अर्जुन',
    'shubham': 'शुभम',
    'ayush': 'आयुष',
    'chandan': 'चंदन',
    'chetan': 'चेतन',
    'chirag': 'चिराग',
    'daksh': 'दक्ष',
    'dhruv': 'ध्रुव',
    'harsh': 'हर्ष',
    'ishaan': 'ईशान',
    'madhav': 'माधव',
    'mayank': 'मयंक',
    'nakul': 'नकुल',
    'naman': 'नमन',
    'parth': 'पार्थ',
    'raghav': 'राघव',
    'rudra': 'रुद्र',
    'samar': 'समर',
    'shaurya': 'शौर्य',
    'tanmay': 'तन्मय',
    'utkarsh': 'उत्कर्ष',
    'yash': 'यश',

    // Female First Names
    'sunita': 'सुनीता',
    'anita': 'अनीता',
    'kavita': 'कविता',
    'geeta': 'गीता',
    'seema': 'सीमा',
    'reena': 'रीना',
    'meena': 'मीना',
    'pooja': 'पूजा',
    'puja': 'पूजा',
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
    'soniya': 'सोनिया',
    'monika': 'मोनिका',
    'kanta': 'कांता',
    'shanti': 'शांति',
    'maya': 'माया',
    'radha': 'राधा',
    'ritu': 'रितु',
    'meenu': 'मीनू',
    'pinki': 'पिंकी',
    'pinky': 'पिंकी',
    'rinki': 'रिंकी',
    'poonam': 'पूनम',
    'babita': 'बबिता',
    'urmila': 'उर्मिला',
    'sushila': 'सुशीला',
    'shakuntala': 'शकुंतला',
    'bala': 'बाला',
    'vimla': 'विमला',
    'kamla': 'कमला',
    'usha': 'उषा',
    'sarita': 'सरिता',
    'mamta': 'ममता',
    'neelam': 'नीलम',
    'suman': 'सुमन',
    'kiran': 'किरण',
    'renu': 'रेणु',
    'alka': 'अलका',
    'annu': 'अन्नू',
    'jyoti': 'ज्योति',
    'anju': 'अंजू',
    'shalu': 'शालू',
    'sweety': 'स्वीटी',
    'preeti': 'प्रीति',
    'payal': 'पायल',
    'komal': 'कोमल',
    'kajal': 'काजल',
    'nisha': 'निशा',
    'simran': 'सिमरन',
    'muskan': 'मुस्कान',
    'khushi': 'खुशी',
    'tannu': 'तन्नू',
    'mannu': 'मन्नू',
    'divya': 'दिव्या',
    'rashi': 'राशि',
    'shivani': 'शिवानी',
    'sneha': 'स्नेहा',
    'shruti': 'श्रुति',
    'swati': 'स्वाति',
    'tanvi': 'तन्वी',
    'mansi': 'मानसी',
    'sakshi': 'साक्षी',
    'drishti': 'दृष्टि',
    'sheetal': 'शीतल',
    'archana': 'अर्चना',
    'deepa': 'दीपा',
    'bharti': 'भारती',
    'bhavna': 'भावना',
    'gunjan': 'गुंजन',
    'chhavi': 'छवि',
    'diksha': 'दीक्षा',
    'garima': 'गरिमा',
    'heena': 'हीना',
    'ishita': 'इशिता',
    'kanchan': 'कंचन',
    'manisha': 'मनीषा',
    'mona': 'मोना',
    'nandini': 'नंदिनी',
    'palak': 'पलक',
    'prerna': 'प्रेरणा',
    'priyanka': 'प्रियंका',
    'richa': 'ऋचा',
    'sapna': 'सपना',
    'shikha': 'शिखा',
    'shweta': 'श्वेता',
    'tanya': 'तान्या',
    'vidhi': 'विधि',

    // Surnames & Communities
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
    'chaudhri': 'चौधरी',
    'choudhary': 'चौधरी',
    'jaat': 'जाट',
    'jat': 'जाट',
    'brahman': 'ब्राह्मण',
    'pandit': 'पंडित',
    'khatri': 'खत्री',
    'arora': 'अरोड़ा',
    'bhatia': 'भाटिया',
    'dahiya': 'दहिया',
    'mor': 'मोर',
    'ahlawat': 'अहलावत',
    'mann': 'मान',
    'maan': 'मान',
    'dhull': 'ढुल',
    'kadyan': 'कादियान',
    'boora': 'बूरा',
    'phogat': 'फोगाट',
    'sangwan': 'सांगवान',
    'punia': 'पूनिया',
    'gill': 'गिल',
    'sidhu': 'सिद्धू',
    'sandhu': 'संधू',
    'dhillon': 'ढिल्लों',
    'grewal': 'ग्रेवाल',
    'brar': 'बराड़',
    'virk': 'विर्क',
    'bajwa': 'बाजवा',
    'sethi': 'सेठी',
    'grover': 'ग्रोवर',
    'bajaj': 'बजाज',
    'juneja': 'जुनेजा',
    'batra': 'बत्रा',
    'ahuja': 'आहूजा',
    'narang': 'नारंग',
    'chawla': 'चावला',
    'taneja': 'तनेजा',
    'wadhwa': 'वाधवा',
    'aggarwal': 'अग्रवाल',
    'agarwal': 'अग्रवाल',
    'mittal': 'मित्तल',
    'bansal': 'बंसल',
    'goyal': 'गोयल',
    'goel': 'गोयल',
    'garg': 'गर्ग',
    'singhal': 'सिंघल',
    'jindal': 'जिंदल',
    'kansal': 'कंसल',
    'tayal': 'तायल',
    'mangla': 'मंगला',
    'bindal': 'बिंदल',
    'tiwari': 'तिवारी',
    'mishra': 'मिश्रा',
    'pandey': 'पांडेय',
    'dubey': 'दुबे',
    'shukla': 'शुक्ला',
    'joshi': 'जोशी',
    'bhatt': 'भट्ट',
    'tripathi': 'त्रिपाठी',
    'pathak': 'पाठक',
    'upadhyay': 'उपाध्याय',

    // Administrative & Address Terms
    'vpo': 'वी.पी.ओ.',
    'vill': 'गाँव',
    'village': 'गाँव',
    'post': 'डाकघर',
    'po': 'डाकघर',
    'tehsil': 'तहसील',
    'teh': 'तहसील',
    'distt': 'जिला',
    'district': 'जिला',
    'house': 'मकान',
    'ward': 'वार्ड',
    'mohalla': 'मोहल्ला',
    'gali': 'गली',
    'street': 'गली',
    'colony': 'कॉलोनी',
    'nagar': 'नगर',
    'kalan': 'कलां',
    'khurd': 'खुर्द',
    'majra': 'माजरा',
    'patti': 'पत्ती',
    'enclave': 'एन्क्लेव',
    'extension': 'एक्सटेंशन',
    'near': 'नजदीक',
    'opp': 'सामने',
    'opposite': 'सामने',
    'railway': 'रेलवे',
    'station': 'स्टेशन',
    'road': 'रोड',
    'marg': 'मार्ग',
    'chowk': 'चौक',
    'mandi': 'मंडी',
    'gaon': 'गाँव',
    'shehar': 'शहर',
    'thana': 'थाना',
    'block': 'ब्लॉक',
    'office': 'कार्यालय',
    'city': 'शहर',
    'delhi': 'दिल्ली',
    'chandigarh': 'चंडीगढ़',
    'punjab': 'पंजाब',
    'rajasthan': 'राजस्थान',
    'uttar': 'उत्तर',
    'pradesh': 'प्रदेश',
    'india': 'भारत',

    // Haryana Districts & Towns
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
    'assandh': 'असंध',
    'gharaunda': 'घरौंडा',
    'indri': 'इन्द्री',
    'nilokheri': 'नीलोखेड़ी',
    'taraori': 'तरावड़ी',
    'ladwa': 'लाडवा',
    'pehowa': 'पिहोवा',
    'thanesar': 'थानेसर',
    'shahabad': 'शाहबाद',
    'babain': 'बाबैन',
    'ismailabad': 'इस्माइलाबाद',
    'cheeka': 'चीका',
    'kalayat': 'कलायत',
    'samalkha': 'समालखा',
    'israna': 'इसराना',
    'gohana': 'गोहाना',
    'ganaur': 'गन्नौर',
    'kharkhoda': 'खरखौदा',
    'rai': 'राई',
    'bahadurgarh': 'बहादुरगढ़',
    'beri': 'बेरी',
    'badli': 'बादली',
    'meham': 'महम',
    'kalanaur': 'कलानौर',
    'sampla': 'सांपला',
    'hansi': 'हांसी',
    'barwala': 'बरवाला',
    'narnaund': 'नारनौंद',
    'adampur': 'आदमपुर',
    'uklana': 'उकलाना',
    'tohana': 'टोहाना',
    'bhuna': 'भूना',
    'ratia': 'रतिया',
    'dabwali': 'डबवाली',
    'ellenabad': 'ऐलनाबाद',
    'kalanwali': 'कालांवाली',
    'ranian': 'रानियां',
    'tosham': 'तोशाम',
    'siwani': 'सिवानी',
    'loharu': 'लोहारू',
    'bawani': 'बवानी',
    'khera': 'खेड़ा',
    'narwana': 'नरवाना',
    'safidon': 'सफीदों',
    'julana': 'जुलाना',
    'uchana': 'उचाना',
    'hathin': 'हथीन',
    'hodal': 'होडल',
    'taoru': 'तावडू',
    'punhana': 'पुन्हाना',
    'ferozepur': 'फिरोजपुर',
    'jhirka': 'झिरका',
    'bawal': 'बावल',
    'khol': 'खोल',
    'ateli': 'अटेली',
    'kanina': 'कनीना',
    'nangal': 'नांगल',
    'sohna': 'सोहना',
    'pataudi': 'पटौदी',
    'manesar': 'मानेसर',
    'farrukhnagar': 'फर्रुखनगर',
    'ballabgarh': 'बल्लभगढ़',
    'badkhal': 'बड़खल',
    'tigaon': 'तिगांव',
    'kalka': 'कालका',
    'pinjore': 'पिंजौर',
    'raipur': 'रायपुर',
    'barara': 'बराड़ा',
    'naraingarh': 'नारायणगढ़',
    'saha': 'साहा',
    'bilaspur': 'बिलासपुर',
    'chachhrauli': 'छछरौली',
    'radaur': 'रादौर',
    'jagadhri': 'जगाधरी',
};

// Devanagari Vowels & Matras
const VOWELS_START = {
    'aa': 'आ', 'a': 'अ', 'ai': 'ऐ', 'au': 'औ', 'ee': 'ई', 'oo': 'ऊ',
    'e': 'ए', 'i': 'इ', 'o': 'ओ', 'u': 'उ', 'ri': 'ऋ'
};

const VOWEL_MATRAS = {
    'aa': 'ा', 'ai': 'ै', 'au': 'ौ', 'ee': 'ी', 'oo': 'ू',
    'e': 'े', 'i': 'ि', 'o': 'ो', 'u': 'ु', 'ri': 'ृ'
};

// Consonant phonetic mappings ordered by greedy match
const CONSONANTS = [
    ['ksh', 'क्ष'], ['gy', 'ज्ञ'], ['tr', 'त्र'], ['shr', 'श्र'],
    ['chh', 'छ'], ['shh', 'ष'], ['kh', 'ख'], ['gh', 'घ'],
    ['ch', 'च'], ['jh', 'झ'], ['th', 'थ'], ['dh', 'ध'],
    ['ph', 'फ'], ['bh', 'भ'], ['sh', 'श'], ['rh', 'ढ़'],
    ['k', 'क'], ['g', 'ग'], ['c', 'क'], ['j', 'ज'],
    ['z', 'ज़'], ['t', 'त'], ['d', 'द'], ['n', 'न'],
    ['p', 'प'], ['f', 'फ'], ['b', 'ब'], ['m', 'म'],
    ['y', 'य'], ['r', 'र'], ['l', 'ल'], ['v', 'व'],
    ['w', 'व'], ['s', 'स'], ['h', 'ह'], ['q', 'क'], ['x', 'क्स']
];

/**
 * Algorithmic syllabic phonetic transliteration for single words
 */
function phoneticWord(word) {
    const w = word.toLowerCase().trim();
    if (!w) return '';

    // Check dictionary first
    if (COMMON_WORDS[w]) {
        return COMMON_WORDS[w];
    }

    let res = '';
    let i = 0;
    const n = w.length;

    while (i < n) {
        const prevChar = i > 0 ? w[i - 1] : null;
        const isStartOrVowelBefore = (i === 0) || ('aeiou'.includes(prevChar));

        // 1. Initial or Post-Vowel Independent Vowel
        if (isStartOrVowelBefore) {
            let matchedVowel = null;
            let matchedLen = 0;
            for (const v of ['aa', 'ai', 'au', 'ee', 'oo', 'ri', 'a', 'e', 'i', 'o', 'u']) {
                if (w.startsWith(v, i)) {
                    matchedVowel = VOWELS_START[v];
                    matchedLen = v.length;
                    break;
                }
            }
            if (matchedVowel) {
                res += matchedVowel;
                i += matchedLen;
                continue;
            }
        }

        // 2. Anusvara check: 'n' or 'm' followed by consonant
        if ((w[i] === 'n' || w[i] === 'm') && i > 0 && i < n - 1) {
            const nextChar = w[i + 1];
            if (!'aeiou'.includes(nextChar) && nextChar !== 'n' && nextChar !== 'm') {
                res += 'ं';
                i++;
                continue;
            }
        }

        // 3. Match consonant
        let matchedC = null;
        let cLen = 0;
        for (const [cStr, cDev] of CONSONANTS) {
            if (w.startsWith(cStr, i)) {
                matchedC = cDev;
                cLen = cStr.length;
                break;
            }
        }

        if (matchedC) {
            res += matchedC;
            i += cLen;

            if (i >= n) {
                break;
            }

            // Check what follows the consonant
            let matchedMatra = null;
            let mLen = 0;

            for (const v of ['aa', 'ai', 'au', 'ee', 'oo', 'ri', 'e', 'i', 'o', 'u']) {
                if (w.startsWith(v, i)) {
                    matchedMatra = VOWEL_MATRAS[v];
                    mLen = v.length;
                    break;
                }
            }

            if (matchedMatra) {
                res += matchedMatra;
                i += mLen;
            } else if (w.startsWith('a', i)) {
                // If trailing 'a' at end of word (like sharma, sunita, pooja, priya, neha) -> matra 'ा'
                if (i === n - 1 || w.startsWith('aa', i)) {
                    res += 'ा';
                    i += w.startsWith('aa', i) ? 2 : 1;
                } else {
                    // Inherent schwa 'a'
                    i++;
                }
            } else {
                // Another consonant follows -> insert virama (्) for conjuncts
                let nextIsConsonant = false;
                for (const [cStr] of CONSONANTS) {
                    if (w.startsWith(cStr, i)) {
                        nextIsConsonant = true;
                        break;
                    }
                }
                if (nextIsConsonant) {
                    res += '्';
                }
            }
            continue;
        }

        // Fallback for numbers, symbols, etc.
        res += w[i];
        i++;
    }

    return res;
}

/**
 * Synchronous instant client-side phonetic converter.
 * Converts every word via dictionary or algorithmic phonetic transliteration with 0ms latency.
 */
export function quickPhoneticHindi(text) {
    if (!text) return '';

    // Check if already pure devanagari
    if (/^[\u0900-\u097F\s,./\\#()\-]+$/.test(text)) {
        return text;
    }

    const tokens = text.split(/(\s+|[.,/\\#()\-]+)/);
    const converted = tokens.map(token => {
        if (!token || !token.trim()) return token;
        const lower = token.toLowerCase().trim();
        if (/^[0-9]+$/.test(lower)) return token; // Keep digits
        return phoneticWord(lower);
    });

    return converted.join('');
}

/**
 * Transliterate text to Hindi using multi-tier fallback:
 * 1. Cache hit (instant)
 * 2. Browser direct fetch to Google Input Tools API (with 2.5s timeout)
 * 3. Server-side proxy `/api/transliterate-hindi`
 * 4. Algorithmic Indic phonetic engine (guaranteed Devanagari result)
 */
export async function transliterateToHindi(text) {
    const trimmed = (text || '').trim();
    if (!trimmed) return '';

    // If pure devanagari, return as is
    if (/^[\u0900-\u097F\s,./\\#()\-]+$/.test(trimmed)) {
        return trimmed;
    }

    const cacheKey = trimmed.toLowerCase();
    if (cache.has(cacheKey)) {
        return cache.get(cacheKey);
    }

    // 1. Try Browser Direct Google Input Tools API (Client-side, bypasses hostinger restrictions)
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2500);

        const googleUrl = `https://inputtools.google.com/request?text=${encodeURIComponent(trimmed)}&itc=hi-t-i0-und&num=1`;
        const res = await fetch(googleUrl, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (res.ok) {
            const data = await res.json();
            if (data && data[0] === 'SUCCESS' && data[1] && data[1][0] && data[1][0][1] && data[1][0][1][0]) {
                const result = data[1][0][1][0];
                cache.set(cacheKey, result);
                return result;
            }
        }
    } catch (e) {
        // Direct browser fetch failed or timed out, proceed to server proxy
    }

    // 2. Try Server-side Proxy `/api/transliterate-hindi`
    try {
        const response = await fetch(`/api/transliterate-hindi?text=${encodeURIComponent(trimmed)}`);
        if (response.ok) {
            const data = await response.json();
            if (data && data.success && data.result && /[\u0900-\u097F]/.test(data.result)) {
                cache.set(cacheKey, data.result);
                return data.result;
            }
        }
    } catch (e) {
        // Server proxy failed, fallback to local algorithmic engine
    }

    // 3. Guaranteed Local Algorithmic + Dictionary Fallback (0 network dependency)
    const algorithmicResult = quickPhoneticHindi(trimmed);
    cache.set(cacheKey, algorithmicResult);
    return algorithmicResult;
}
