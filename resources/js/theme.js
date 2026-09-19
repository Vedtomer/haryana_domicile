const STORAGE_KEY = 'theme';

export function getStoredTheme() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored === 'dark' || stored === 'light') {
            return stored;
        }
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
    } catch (e) {
        console.error('Error reading theme from storage', e);
    }
    return 'light';
}

export function applyTheme(theme) {
    try {
        const targetTheme = theme === 'dark' ? 'dark' : 'light';
        if (targetTheme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem(STORAGE_KEY, targetTheme);
        window.dispatchEvent(new CustomEvent('theme-changed', { detail: { theme: targetTheme } }));
    } catch (e) {
        console.error('Error applying theme', e);
    }
}

export function toggleTheme() {
    const current = getStoredTheme();
    const next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    return next;
}

export function initTheme() {
    const theme = getStoredTheme();
    applyTheme(theme);
}

