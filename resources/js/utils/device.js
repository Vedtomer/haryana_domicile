/**
 * Persistent Device / Desktop Fingerprint Utility
 * Generates and stores a persistent desktop device token in localStorage and cookies (5-year expiry).
 * Ensures 1 License Key is strictly locked to 1 Desktop.
 */

export function getOrCreateDeviceId() {
    if (typeof window === 'undefined') return null;

    let deviceId = null;

    try {
        deviceId = localStorage.getItem('csp_device_token');
    } catch (e) {}

    if (!deviceId) {
        const match = document.cookie.match(/(?:^|;\s*)csp_device_token=([^;]+)/);
        if (match && match[1]) {
            deviceId = decodeURIComponent(match[1]);
        }
    }

    if (!deviceId) {
        const randomPart = Math.random().toString(36).substring(2, 8) + Math.random().toString(36).substring(2, 8);
        deviceId = 'PC-' + Date.now().toString(36).toUpperCase() + '-' + randomPart.toUpperCase();
    }

    try {
        localStorage.setItem('csp_device_token', deviceId);
    } catch (e) {}

    try {
        const expires = new Date(Date.now() + 5 * 365 * 24 * 60 * 60 * 1000).toUTCString();
        document.cookie = `csp_device_token=${encodeURIComponent(deviceId)}; expires=${expires}; path=/; SameSite=Lax`;
    } catch (e) {}

    return deviceId;
}

export function getDeviceName() {
    if (typeof window === 'undefined') return 'Desktop PC';

    const ua = navigator.userAgent;
    let os = 'Windows Desktop';
    if (ua.indexOf('Win') !== -1) os = 'Windows Desktop';
    else if (ua.indexOf('Mac') !== -1) os = 'Mac Desktop';
    else if (ua.indexOf('Linux') !== -1) os = 'Linux Desktop';
    else if (ua.indexOf('Android') !== -1) os = 'Android Mobile';
    else if (ua.indexOf('iPhone') !== -1 || ua.indexOf('iPad') !== -1) os = 'iOS Device';

    let browser = 'Browser';
    if (ua.indexOf('Edg') !== -1) browser = 'Edge';
    else if (ua.indexOf('Chrome') !== -1) browser = 'Chrome';
    else if (ua.indexOf('Firefox') !== -1) browser = 'Firefox';
    else if (ua.indexOf('Safari') !== -1 && ua.indexOf('Chrome') === -1) browser = 'Safari';

    return `${browser} on ${os}`;
}
