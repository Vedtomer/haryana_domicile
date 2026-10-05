/**
 * WhatsApp Helper for formatting and sharing service request updates
 */

export function extractPhoneNumber(item = {}, user = null) {
    let rawPhone = '';

    // Check user phone
    if (user && user.phone) {
        rawPhone = user.phone;
    } else if (item.user && item.user.phone) {
        rawPhone = item.user.phone;
    }

    // If not found, look in input_data
    if (!rawPhone && item.input_data && typeof item.input_data === 'object') {
        const phoneKeys = ['mobile', 'phone', 'whatsapp', 'contact', 'aadhaar_mobile', 'mobile_no', 'customer_mobile', 'phone_number'];
        for (const [k, v] of Object.entries(item.input_data)) {
            if (typeof v === 'string' || typeof v === 'number') {
                const lowerK = k.toLowerCase();
                if (phoneKeys.some(pk => lowerK.includes(pk))) {
                    const digits = String(v).replace(/\D/g, '');
                    if (digits.length >= 10) {
                        rawPhone = digits;
                        break;
                    }
                }
            }
        }
    }

    if (!rawPhone) return '';

    const clean = String(rawPhone).replace(/\D/g, '');
    if (clean.length === 10) {
        return `91${clean}`;
    }
    if (clean.length === 12 && clean.startsWith('91')) {
        return clean;
    }
    return clean;
}

export function formatServiceWhatsAppMessage(item = {}, user = null, adminResponse = null) {
    const userName = (user?.name || item.user?.name || 'ग्राहक').trim();
    const serviceName = (item.service_name || item.service?.name || 'सर्विस').trim();
    const reqId = item.id || '—';
    const isCompleted = item.status === 'completed' || item.status === 'accepted';
    const statusTitle = isCompleted ? 'सर्विस कार्य संपन्न ✅' : `सर्विस स्थिति: ${item.status || 'Updated'}`;

    const dateStr = item.created_at
        ? new Date(item.created_at).toLocaleDateString('en-IN', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
          })
        : new Date().toLocaleDateString('en-IN', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
          });

    let msg = `*CSP Jaankari - ${statusTitle}*\n\n`;
    msg += `नमस्ते *${userName}* जी,\n`;
    if (isCompleted) {
        msg += `आपकी सर्विस रिक्वेस्ट का कार्य सफलतापूर्वक पूरा कर दिया गया है।\n\n`;
    } else {
        msg += `आपकी सर्विस रिक्वेस्ट का विवरण निम्नानुसार है:\n\n`;
    }

    msg += `📌 *सर्विस:* ${serviceName}\n`;
    msg += `🆔 *रिक्वेस्ट ID:* #${reqId}\n`;
    msg += `📅 *दिनांक:* ${dateStr}\n`;

    // Add input details
    if (item.input_data && typeof item.input_data === 'object') {
        const entries = Object.entries(item.input_data)
            .filter(([_, v]) => v && typeof v !== 'object')
            .slice(0, 4);

        if (entries.length > 0) {
            msg += `\n📋 *विवरण:*\n`;
            for (const [k, v] of entries) {
                const label = k.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                msg += `• ${label}: ${v}\n`;
            }
        }
    }

    const responseText = adminResponse !== undefined && adminResponse !== null ? adminResponse : item.admin_response;
    if (responseText && String(responseText).trim()) {
        msg += `\n📝 *रिमार्क्स:* ${String(responseText).trim()}\n`;
    }

    msg += `\nपोर्टल पर लॉगिन करके अपना स्टेटस या दस्तावेज देख सकते हैं।\n`;
    msg += `धन्यवाद! 🙏\n*CSP Jaankari Portal*`;

    return msg;
}

export function buildWhatsAppLink(phone, message) {
    const encoded = encodeURIComponent(message || '');
    if (phone) {
        const clean = String(phone).replace(/\D/g, '');
        const target = clean.length === 10 ? `91${clean}` : clean;
        return `https://api.whatsapp.com/send?phone=${target}&text=${encoded}`;
    }
    return `https://api.whatsapp.com/send?text=${encoded}`;
}
