import React, { useState, useRef, useEffect } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import axios from 'axios';

export default function Kundli({ service, coinCost, userCoins, isAdmin }) {
    const { auth } = usePage().props;
    const currentBalance = auth?.user?.coins ?? userCoins ?? 0;
    const cost = coinCost || 20;

    const [form, setForm] = useState({
        name: '',
        gender: 'male',
        day: 1,
        month: 1,
        year: 2000,
        hour: 12,
        min: 0,
        sec: 0,
        lang: '2', // 2 = Hindi, 1 = English
        place: '',
        tzone: 5.5,
        lat: 28.6139,
        lon: 77.2090,
    });

    const [cityQuery, setCityQuery] = useState('');
    const [citySuggestions, setCitySuggestions] = useState([]);
    const [searchingCities, setSearchingCities] = useState(false);
    const [showCityDropdown, setShowCityDropdown] = useState(false);
    const [selectedCityLabel, setSelectedCityLabel] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [result, setResult] = useState(null);

    const iframeRef = useRef(null);
    const searchTimeoutRef = useRef(null);

    // Debounced city search
    useEffect(() => {
        if (!cityQuery || cityQuery.length < 2 || selectedCityLabel === cityQuery) {
            setCitySuggestions([]);
            setShowCityDropdown(false);
            return;
        }

        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        searchTimeoutRef.current = setTimeout(async () => {
            setSearchingCities(true);
            try {
                const res = await axios.get(`/utilities/kundli/cities?query=${encodeURIComponent(cityQuery)}`);
                setCitySuggestions(res.data.data || []);
                setShowCityDropdown(true);
            } catch (err) {
                console.error('City search failed', err);
            } finally {
                setSearchingCities(false);
            }
        }, 350);

        return () => clearTimeout(searchTimeoutRef.current);
    }, [cityQuery]);

    const handleSelectCity = (city) => {
        setSelectedCityLabel(city.label);
        setCityQuery(city.label);
        setForm(prev => ({
            ...prev,
            place: city.label,
            lat: city.latitude,
            lon: city.longitude,
            tzone: city.timezoneOffset || 5.5,
        }));
        setShowCityDropdown(false);
    };

    const handleGenerate = async (e) => {
        e.preventDefault();
        setError(null);
        setResult(null);

        if (!form.name.trim()) {
            setError('Please enter your full name.');
            return;
        }

        if (!form.place.trim()) {
            setError('Please select a birth place / city from the suggestions.');
            return;
        }

        if (!isAdmin && currentBalance < cost) {
            setError(`Insufficient coins. You need ${cost} coins to generate Kundli. (Your balance: ${currentBalance} coins)`);
            return;
        }

        if (!confirm(`Generate Janam Kundli for ${form.name}? ${!isAdmin ? cost + ' coins will be deducted.' : 'Free for Staff'}`)) {
            return;
        }

        setLoading(true);

        try {
            const res = await axios.post('/utilities/kundli/generate', form);
            if (res.data.success) {
                setResult(res.data);
                if (!isAdmin && auth?.user && res.data.userCoins !== undefined) {
                    auth.user.coins = res.data.userCoins;
                }
            } else {
                setError(res.data.message || 'Failed to generate Kundli.');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Server error while generating Kundli. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        if (!iframeRef.current) return;
        try {
            const cw = iframeRef.current.contentWindow;
            if (cw) {
                cw.postMessage('print', '*');
                setTimeout(() => {
                    try {
                        cw.print();
                    } catch (e) {}
                }, 300);
            }
        } catch (e) {
            window.print();
        }
    };

    const handleDirectDownload = async () => {
        if (!result?.html_url) return;
        const filename = `Kundli_${form.name.replace(/[^a-zA-Z0-9_-]/g, '_') || 'Customer'}.html`;
        const proxyUrl = `/utilities/kundli/download?url=${encodeURIComponent(result.html_url)}&filename=${encodeURIComponent(filename)}`;

        try {
            const res = await fetch(proxyUrl);
            if (res.ok) {
                const blob = await res.blob();
                const blobUrl = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = blobUrl;
                link.download = filename;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                setTimeout(() => window.URL.revokeObjectURL(blobUrl), 2000);
                return;
            }
        } catch (e) {}

        const link = document.createElement('a');
        link.href = proxyUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const months = [
        'January (1)', 'February (2)', 'March (3)', 'April (4)', 'May (5)', 'June (6)',
        'July (7)', 'August (8)', 'September (9)', 'October (10)', 'November (11)', 'December (12)'
    ];

    const currentYear = new Date().getFullYear();
    const years = [];
    for (let y = currentYear; y >= 1930; y--) {
        years.push(y);
    }

    return (
        <AdminLayout
            header={
                <div className="flex flex-col">
                    <h1 className="text-xl font-bold text-gray-800 dark:text-white leading-tight flex items-center gap-2">
                        <span>🪐</span> Kundli Generator (Janam Kundli)
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">
                        Generate complete Vedic Janam Kundli with charts, planetary positions &amp; dashas instantly.
                    </p>
                </div>
            }
        >
            <Head title="Kundli Generator (Janam Kundli)" />

            <div className="max-w-5xl mx-auto py-6 px-4 sm:px-6 space-y-6">
                {/* Balance & Pricing Banner */}
                <div className="bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-indigo-500/10 border border-amber-300 dark:border-amber-700/60 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center text-2xl shadow-md">
                            🪐
                        </div>
                        <div>
                            <h2 className="font-bold text-slate-800 dark:text-white text-base">
                                Instant Vedic Janam Kundli
                            </h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Detailed birth chart with Lagna, Navamsha, Graha Spashta, and Vimshottari Dasha.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                        <div className="text-right">
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Charge</span>
                            <span className="text-sm font-extrabold text-amber-600 dark:text-amber-400">
                                🪙 {cost} Coins
                            </span>
                        </div>
                        <div className="h-8 w-px bg-slate-200 dark:bg-slate-700"></div>
                        <div className="text-right">
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Your Coins</span>
                            <span className={`text-sm font-extrabold ${currentBalance < cost && !isAdmin ? 'text-red-500' : 'text-emerald-600 dark:text-emerald-400'}`}>
                                🪙 {currentBalance}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Error Banner */}
                {error && (
                    <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-xl flex items-start gap-3 animate-in fade-in duration-200">
                        <span className="material-symbols-outlined text-xl shrink-0 mt-0.5">error</span>
                        <div className="flex-1 text-sm font-medium">{error}</div>
                    </div>
                )}

                {/* Result Preview Section */}
                {result && result.html_url && (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
                        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-2.5">
                                <span className="material-symbols-outlined text-emerald-500 text-2xl">check_circle</span>
                                <div>
                                    <h3 className="text-base font-bold text-slate-800 dark:text-white">
                                        Janam Kundli Generated ({form.name})
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        Print directly or download print-ready HTML sheet.
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2.5 w-full sm:w-auto">
                                <button
                                    type="button"
                                    onClick={handlePrint}
                                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
                                >
                                    <span className="material-symbols-outlined text-[18px]">print</span>
                                    Print Kundli
                                </button>
                                <button
                                    type="button"
                                    onClick={handleDirectDownload}
                                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
                                >
                                    <span className="material-symbols-outlined text-[18px]">download</span>
                                    Download File
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setResult(null)}
                                    className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-700 transition-all cursor-pointer"
                                    title="Make another Kundli"
                                >
                                    <span className="material-symbols-outlined text-[18px]">refresh</span>
                                </button>
                            </div>
                        </div>

                        {/* Interactive Frame */}
                        <div className="p-3 sm:p-5 bg-slate-100 dark:bg-slate-950 flex justify-center">
                            <div className="w-full max-w-4xl bg-white shadow-2xl rounded-xl overflow-hidden border border-slate-300">
                                <iframe
                                    ref={iframeRef}
                                    src={result.html_url}
                                    title="Kundli Preview"
                                    className="w-full min-h-[850px] border-none"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Form Card */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                    <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                            <span className="material-symbols-outlined text-amber-500">auto_awesome</span>
                            Enter Birth Details for Kundli
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            Accurate date, time, and birth city are required to calculate astronomical planetary charts.
                        </p>
                    </div>

                    <form onSubmit={handleGenerate} className="p-5 sm:p-6 space-y-5">
                        {/* Name & Gender */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                                    Full Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Enter Person's Name"
                                    value={form.name}
                                    onChange={e => setForm({ ...form, name: e.target.value })}
                                    className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-white placeholder:text-slate-400 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                                    Gender <span className="text-red-500">*</span>
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setForm({ ...form, gender: 'male' })}
                                        className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-1.5 cursor-pointer ${
                                            form.gender === 'male'
                                                ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                                                : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                                        }`}
                                    >
                                        <span>👨</span> Male
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setForm({ ...form, gender: 'female' })}
                                        className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-1.5 cursor-pointer ${
                                            form.gender === 'female'
                                                ? 'bg-pink-600 border-pink-600 text-white shadow-sm'
                                                : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                                        }`}
                                    >
                                        <span>👩</span> Female
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Date of Birth */}
                        <div>
                            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                                Date of Birth <span className="text-red-500">*</span>
                            </label>
                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <span className="text-[11px] text-slate-400 block mb-1">Day</span>
                                    <select
                                        value={form.day}
                                        onChange={e => setForm({ ...form, day: parseInt(e.target.value) })}
                                        className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-800 dark:text-white outline-none focus:border-amber-500"
                                    >
                                        {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
                                            <option key={d} value={d}>{d}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <span className="text-[11px] text-slate-400 block mb-1">Month</span>
                                    <select
                                        value={form.month}
                                        onChange={e => setForm({ ...form, month: parseInt(e.target.value) })}
                                        className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-800 dark:text-white outline-none focus:border-amber-500"
                                    >
                                        {months.map((m, idx) => (
                                            <option key={idx + 1} value={idx + 1}>{m}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <span className="text-[11px] text-slate-400 block mb-1">Year</span>
                                    <select
                                        value={form.year}
                                        onChange={e => setForm({ ...form, year: parseInt(e.target.value) })}
                                        className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-800 dark:text-white outline-none focus:border-amber-500"
                                    >
                                        {years.map(y => (
                                            <option key={y} value={y}>{y}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Time of Birth */}
                        <div>
                            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                                Time of Birth (24-Hour Format) <span className="text-red-500">*</span>
                            </label>
                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <span className="text-[11px] text-slate-400 block mb-1">Hour (00 - 23)</span>
                                    <select
                                        value={form.hour}
                                        onChange={e => setForm({ ...form, hour: parseInt(e.target.value) })}
                                        className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-800 dark:text-white outline-none focus:border-amber-500"
                                    >
                                        {Array.from({ length: 24 }, (_, i) => i).map(h => (
                                            <option key={h} value={h}>{String(h).padStart(2, '0')}:00</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <span className="text-[11px] text-slate-400 block mb-1">Minute (00 - 59)</span>
                                    <select
                                        value={form.min}
                                        onChange={e => setForm({ ...form, min: parseInt(e.target.value) })}
                                        className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-800 dark:text-white outline-none focus:border-amber-500"
                                    >
                                        {Array.from({ length: 60 }, (_, i) => i).map(m => (
                                            <option key={m} value={m}>{String(m).padStart(2, '0')}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <span className="text-[11px] text-slate-400 block mb-1">Second (00 - 59)</span>
                                    <select
                                        value={form.sec}
                                        onChange={e => setForm({ ...form, sec: parseInt(e.target.value) })}
                                        className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-800 dark:text-white outline-none focus:border-amber-500"
                                    >
                                        {Array.from({ length: 60 }, (_, i) => i).map(s => (
                                            <option key={s} value={s}>{String(s).padStart(2, '0')}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Birth City Autocomplete & Language */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="sm:col-span-2 relative">
                                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                                    Birth Place / City <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-lg">
                                        location_on
                                    </span>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Type city name (e.g. Delhi, Jaipur, Mumbai)..."
                                        value={cityQuery}
                                        onChange={e => {
                                            setCityQuery(e.target.value);
                                            setShowCityDropdown(true);
                                        }}
                                        onFocus={() => {
                                            if (citySuggestions.length > 0) setShowCityDropdown(true);
                                        }}
                                        className="w-full pl-9 pr-9 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-white placeholder:text-slate-400 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition"
                                    />
                                    {searchingCities && (
                                        <div className="absolute right-3 top-2.5">
                                            <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                                        </div>
                                    )}
                                </div>

                                {/* Autocomplete Suggestions Dropdown */}
                                {showCityDropdown && citySuggestions.length > 0 && (
                                    <div className="absolute z-20 left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl max-h-56 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700/60">
                                        {citySuggestions.map((item, idx) => (
                                            <div
                                                key={idx}
                                                onClick={() => handleSelectCity(item)}
                                                className="p-2.5 hover:bg-amber-50 dark:hover:bg-amber-950/40 cursor-pointer text-xs transition-colors flex items-center justify-between"
                                            >
                                                <div className="font-semibold text-slate-800 dark:text-white">
                                                    {item.label}
                                                </div>
                                                <span className="text-[10px] text-slate-400 font-mono">
                                                    {item.latitude?.toFixed(2)}°, {item.longitude?.toFixed(2)}°
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {form.place && (
                                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[13px]">check_circle</span>
                                        Selected: <strong>{form.place}</strong> (Lat: {form.lat}, Lon: {form.lon})
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                                    Kundli Language <span className="text-red-500">*</span>
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setForm({ ...form, lang: '2' })}
                                        className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-1.5 cursor-pointer ${
                                            form.lang === '2'
                                                ? 'bg-amber-500 border-amber-500 text-white shadow-sm'
                                                : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                                        }`}
                                    >
                                        🇮🇳 Hindi
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setForm({ ...form, lang: '1' })}
                                        className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-1.5 cursor-pointer ${
                                            form.lang === '1'
                                                ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                                                : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                                        }`}
                                    >
                                        🌐 English
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3.5 px-6 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-700 text-white font-extrabold text-sm sm:text-base rounded-xl shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>Calculating Planetary Charts &amp; Generating Kundli...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>🪐</span>
                                        <span>Generate Janam Kundli ({cost} Coins)</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
}
