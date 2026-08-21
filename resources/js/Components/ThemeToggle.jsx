import React, { useState } from 'react';
import { getStoredTheme, applyTheme } from '../theme';

export default function ThemeToggle() {
    const [theme, setTheme] = useState(getStoredTheme());

    const choose = (value) => {
        applyTheme(value);
        setTheme(value);
    };

    const OPTIONS = [
        { value: 'light', label: 'Light', icon: '☀️' },
        { value: 'dark', label: 'Dark', icon: '🌙' },
    ];

    return (
        <div className="inline-flex rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 p-1">
            {OPTIONS.map((opt) => (
                <button
                    key={opt.value}
                    type="button"
                    onClick={() => choose(opt.value)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-colors ${
                        theme === opt.value
                            ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                            : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200'
                    }`}
                >
                    <span>{opt.icon}</span>
                    {opt.label}
                </button>
            ))}
        </div>
    );
}
