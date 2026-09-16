const STORAGE_KEY = 'theme';

export function getStoredTheme() {
    return 'light';
}

export function applyTheme(theme) {
    document.documentElement.classList.remove('dark');
    localStorage.setItem(STORAGE_KEY, 'light');
}

export function initTheme() {
    document.documentElement.classList.remove('dark');
    localStorage.setItem(STORAGE_KEY, 'light');
}
