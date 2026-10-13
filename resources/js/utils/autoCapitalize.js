/**
 * Auto-Capitalize Utility for All Services & Forms
 * 
 * Automatically formats input text as the user types:
 * - Standard text fields (Names, Father/Husband names, Addresses, Villages, Tehsils, Districts, Descriptions, etc.):
 *   Title Case (First letter of each word is BIG/Capitalized, rest lowercase, whether CapsLock is ON or OFF).
 * - Identifier fields (PAN, Voter EPIC, Vehicle RC, Driving Licence, IFSC, or elements with "uppercase" class):
 *   UPPERCASE (All letters capital).
 * - Excludes: Password, Email, Numeric/Tel/Aadhaar fields, Date, File, and Web URLs.
 */

let nativeInputSetter = null;
let nativeTextareaSetter = null;

try {
    if (typeof window !== 'undefined') {
        nativeInputSetter = Object.getOwnPropertyDescriptor(
            window.HTMLInputElement.prototype,
            'value'
        )?.set;
        nativeTextareaSetter = Object.getOwnPropertyDescriptor(
            window.HTMLTextAreaElement.prototype,
            'value'
        )?.set;
    }
} catch (e) {
    console.error('Error getting native input prototype setters', e);
}

/**
 * Converts English words to Title Case (first letter capitalized, following letters lowercase).
 * Non-English characters, digits, and punctuation are preserved.
 */
export function formatTitleCase(str) {
    if (!str || typeof str !== 'string') return str;

    // Do not transform emails or web URLs
    if (str.includes('@') || str.startsWith('http://') || str.startsWith('https://') || str.startsWith('www.')) {
        return str;
    }

    return str.replace(/([a-zA-Z])([a-zA-Z]*)/g, (_match, first, rest) => {
        return first.toUpperCase() + rest.toLowerCase();
    });
}

/**
 * Checks if an input element should be formatted in all UPPERCASE (like PAN, Voter EPIC, RC, DL, IFSC).
 */
export function isUppercaseField(target) {
    if (!target) return false;

    const className = (target.className || '').toString().toLowerCase();
    if (className.includes('uppercase')) return true;

    if (target.dataset && (target.dataset.uppercase === 'true' || target.dataset.allCaps === 'true')) {
        return true;
    }

    const name = (target.name || '').toLowerCase();
    const id = (target.id || '').toLowerCase();
    const placeholder = (target.placeholder || '').toLowerCase();

    // Exact matches
    if (['pan', 'pan_no', 'epic', 'epic_no', 'rc', 'rc_no', 'dl', 'dl_no', 'ifsc', 'ifsc_code'].includes(name)) {
        return true;
    }

    // Keyword matches
    const patterns = [
        'pan', 'epic', 'voter_id', 'voterid', 'rc_', 'rcno', 'reg_no', 'regno',
        'vehicle', 'vechil', 'dl_', 'licence', 'license', 'ifsc',
        'saral', 'appl_num', 'application_no', 'ppp', 'family_id'
    ];

    return patterns.some(p => name.includes(p) || id.includes(p) || placeholder.includes(p));
}

/**
 * Checks if an input element should be ignored (e.g. Password, Email, Numbers, Dates).
 */
export function shouldIgnoreElement(target) {
    if (!target) return true;
    const tagName = target.tagName;
    if (tagName !== 'INPUT' && tagName !== 'TEXTAREA') return true;

    // Readonly or disabled inputs
    if (target.readOnly || target.disabled) return true;

    const type = (target.type || 'text').toLowerCase();

    // Non-text input types to strictly ignore
    const ignoredTypes = [
        'password', 'email', 'number', 'date', 'datetime-local',
        'time', 'month', 'week', 'file', 'checkbox', 'radio',
        'range', 'color', 'hidden', 'tel'
    ];
    if (ignoredTypes.includes(type)) return true;

    // Explicit opt-out attribute
    if (target.dataset && (target.dataset.noCapitalize === 'true' || target.dataset.noAutoCase === 'true')) {
        return true;
    }

    const name = (target.name || '').toLowerCase();
    const id = (target.id || '').toLowerCase();
    const autocomplete = (target.autocomplete || '').toLowerCase();

    // Passwords & Emails
    if (name.includes('email') || id.includes('email') || autocomplete.includes('email')) return true;
    if (name.includes('password') || id.includes('password')) return true;

    // Numeric / identification numbers (Phone, Aadhaar, Pincode, OTP, Balance, Cost)
    if (
        name.includes('mobile') || name.includes('phone') || name.includes('whatsapp') ||
        name.includes('aadhar') || name.includes('aadhaar') || name.includes('uid') ||
        name.includes('pincode') || name.includes('pin_code') || name === 'pin' ||
        name.includes('otp') || name.includes('amount') || name.includes('coins') ||
        name.includes('balance') || name.includes('cost') || name.includes('fee')
    ) {
        return true;
    }

    return false;
}

/**
 * Safely updates input value while preserving selection/cursor position and triggering React 18/19 state tracker.
 */
export function setNativeValue(element, newValue) {
    const isTextarea = element instanceof HTMLTextAreaElement;
    const setter = isTextarea ? nativeTextareaSetter : nativeInputSetter;

    let start = null;
    let end = null;
    try {
        start = element.selectionStart;
        end = element.selectionEnd;
    } catch (_) {}

    if (setter) {
        setter.call(element, newValue);
    } else {
        element.value = newValue;
    }

    if (typeof start === 'number' && typeof end === 'number') {
        try {
            element.setSelectionRange(start, end);
        } catch (_) {}
    }
}

/**
 * Formats a target input or textarea element on typing.
 */
export function applyAutoCapitalize(target) {
    if (shouldIgnoreElement(target)) return;

    const originalValue = target.value;
    if (!originalValue || typeof originalValue !== 'string') return;

    let formattedValue;
    if (isUppercaseField(target)) {
        formattedValue = originalValue.toUpperCase();
    } else {
        formattedValue = formatTitleCase(originalValue);
    }

    if (formattedValue !== originalValue) {
        setNativeValue(target, formattedValue);
    }
}

let isInitialized = false;

/**
 * Initializes global event listener for all forms and services across the entire website.
 */
export function initAutoCapitalize() {
    if (typeof window === 'undefined' || isInitialized) return;
    isInitialized = true;

    const handleEvent = (e) => {
        const target = e.target;
        if (!target) return;
        applyAutoCapitalize(target);
    };

    // Use Capture phase (true) so the value is capitalized BEFORE React event handlers process it
    window.addEventListener('input', handleEvent, true);
    window.addEventListener('change', handleEvent, true);
}
