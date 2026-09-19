import React, { useState, useEffect } from 'react';
import { getStoredTheme, applyTheme, toggleTheme } from '../theme';

export default function ThemeToggle({ variant = 'icon', className = '' }) {
    const [theme, setTheme] = useState('light');

    useEffect(() => {
        setTheme(getStoredTheme());
        const handleThemeChanged = (e) => {
            if (e.detail?.theme) {
                setTheme(e.detail.theme);
            }
        };
        window.addEventListener('theme-changed', handleThemeChanged);
        return () => window.removeEventListener('theme-changed', handleThemeChanged);
    }, []);

    const handleToggle = () => {
        const next = toggleTheme();
        setTheme(next);
    };

    if (variant === 'icon') {
        const isDark = theme === 'dark';
        return (
            <button
                type="button"
                onClick={handleToggle}
                className={`relative inline-flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-amber-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all shadow-2xs cursor-pointer select-none ${className}`}
                title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                aria-label="Toggle Theme"
            >
                {isDark ? (
                    <span className="material-symbols-outlined text-[20px] text-amber-400 transition-transform duration-300 hover:rotate-45" style={{ fontVariationSettings: "'FILL' 1" }}>
                        light_mode
                    </span>
                ) : (
                    <span className="material-symbols-outlined text-[20px] text-slate-700 dark:text-slate-200 transition-transform duration-300 hover:-rotate-12" style={{ fontVariationSettings: "'FILL' 1" }}>
                        dark_mode
                    </span>
                )}
            </button>
        );
    }

    // Segmented / Pill style
    return (
        <div className={`inline-flex rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 p-1 ${className}`}>
            <button
                type="button"
                onClick={() => { applyTheme('light'); setTheme('light'); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    theme === 'light'
                        ? 'bg-white text-blue-600 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                }`}
            >
                <span className="material-symbols-outlined text-[15px]">light_mode</span>
                <span>Light</span>
            </button>
            <button
                type="button"
                onClick={() => { applyTheme('dark'); setTheme('dark'); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    theme === 'dark'
                        ? 'bg-slate-700 text-amber-300 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                }`}
            >
                <span className="material-symbols-outlined text-[15px]">dark_mode</span>
                <span>Dark</span>
            </button>
        </div>
    );
}

