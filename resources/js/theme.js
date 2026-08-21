const STORAGE_KEY = 'theme';

export function getStoredTheme() {
    return localStorage.getItem(STORAGE_KEY) || 'light';
}

export function applyTheme(theme) {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem(STORAGE_KEY, theme);
}

export function initTheme() {
    applyTheme(getStoredTheme());
}
