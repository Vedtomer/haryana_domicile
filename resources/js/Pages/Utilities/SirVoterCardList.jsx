import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import axios from 'axios';

export default function SirVoterCardList({ officialUrl = 'https://voters.eci.gov.in/searchInSIR/S2UA4DPDF-JK4QWODSE' }) {
    const [activeTab, setActiveTab] = useState('search'); // 'search' or 'live_portal'
    const [searchType, setSearchType] = useState('epic'); // 'epic' or 'area'
    
    // Form fields
    const [epicNo, setEpicNo] = useState('');
    const [state, setState] = useState('Haryana');
    const [district, setDistrict] = useState('');
    const [acName, setAcName] = useState('');
    const [partNo, setPartNo] = useState('');
    const [sectionNo, setSectionNo] = useState('');
    const [voterName, setVoterName] = useState('');
    const [relativeName, setRelativeName] = useState('');

    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [copiedIndex, setCopiedIndex] = useState(null);
    const [urlCopied, setUrlCopied] = useState(false);
    const [iframeKey, setIframeKey] = useState(1);

    const handleCopy = (text, index) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    const handleCopyUrl = () => {
        navigator.clipboard.writeText(officialUrl);
        setUrlCopied(true);
        setTimeout(() => setUrlCopied(false), 2000);
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (searchType === 'epic' && !epicNo.trim()) {
            setError('Please enter an EPIC Number (Voter ID).');
            return;
        }
        if (searchType === 'area' && (!state.trim() || !district.trim())) {
            setError('Please select/enter State and District.');
            return;
        }

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const response = await axios.post('/utilities/sir-voter-card-list/search', {
                search_type: searchType,
                epic_no: epicNo.trim().toUpperCase(),
                state: state.trim(),
                district: district.trim(),
                ac_name: acName.trim(),
                part_no: partNo.trim(),
                section_no: sectionNo.trim(),
                voter_name: voterName.trim(),
                relative_name: relativeName.trim(),
            });

            if (response.data.success) {
                setResult(response.data);
            } else {
                setError(response.data.message || 'No voter records found matching your query.');
            }
        } catch (err) {
            console.error('Error fetching voter details:', err);
            setError(err.response?.data?.message || 'Error occurred while searching voter list.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AdminLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 text-xs font-extrabold uppercase tracking-wider rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300">
                                ECI SIR 2025
                            </span>
                            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                Active Service
                            </span>
                        </div>
                        <h1 className="text-xl sm:text-2xl font-black text-gray-800 dark:text-white leading-tight mt-1">
                            S.I.R Voter Card List
                        </h1>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 mt-0.5">
                            Special Intensive Revision (SIR) Electoral Roll & Voter Card Search Portal
                        </p>
                    </div>

                    {/* Direct ECI Link Button */}
                    <div className="flex items-center gap-2 shrink-0">
                        <a
                            href={officialUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-purple-500/20 hover:shadow-lg transition-all"
                        >
                            <span className="material-symbols-outlined text-lg">open_in_new</span>
                            Open Official ECI Portal
                        </a>
                    </div>
                </div>
            }
        >
            <Head title="S.I.R Voter Card List - Election Commission of India" />

            <div className="max-w-6xl mx-auto mt-6 px-4 pb-12">
                {/* Official ECI Link Card */}
                <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-7 text-white shadow-xl shadow-purple-950/20 border border-purple-700/30 mb-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
                    
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="max-w-2xl">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-bold text-purple-200 border border-white/10 mb-3">
                                <span className="material-symbols-outlined text-sm">verified</span>
                                Official Election Commission of India (ECI) SIR Portal
                            </div>
                            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                                Special Intensive Revision (SIR) Voter Search
                            </h2>
                            <p className="text-slate-300 text-xs sm:text-sm mt-1.5 leading-relaxed">
                                Voter card list search in Special Intensive Revision (SIR) / SSR electoral roll. Search directly below or open the official ECI portal.
                            </p>
                            <div className="mt-3 inline-flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-lg border border-white/10 text-xs font-mono text-purple-200">
                                <span className="text-slate-400">URL:</span>
                                <span className="truncate max-w-[280px] sm:max-w-md">{officialUrl}</span>
                                <button
                                    type="button"
                                    onClick={handleCopyUrl}
                                    className="hover:text-white transition-colors cursor-pointer ml-1"
                                    title="Copy official link"
                                >
                                    <span className="material-symbols-outlined text-sm">
                                        {urlCopied ? 'check' : 'content_copy'}
                                    </span>
                                </button>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0">
                            <a
                                href={officialUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-5 py-3 bg-white text-slate-900 hover:bg-purple-50 font-black text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <span className="material-symbols-outlined text-lg text-purple-700">launch</span>
                                Open in New Window
                            </a>
                            <button
                                type="button"
                                onClick={() => setActiveTab(activeTab === 'live_portal' ? 'search' : 'live_portal')}
                                className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/20 backdrop-blur-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                                <span className="material-symbols-outlined text-base">
                                    {activeTab === 'live_portal' ? 'search' : 'tab_unselected'}
                                </span>
                                {activeTab === 'live_portal' ? 'Switch to Search Form' : 'View Portal Inside Page'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Primary Mode Tabs */}
                <div className="flex items-center justify-center mb-6">
                    <div className="inline-flex p-1.5 bg-slate-200 dark:bg-slate-800 rounded-2xl shadow-inner border border-slate-300 dark:border-slate-700">
                        <button
                            type="button"
                            onClick={() => setActiveTab('search')}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black text-sm transition-all cursor-pointer ${
                                activeTab === 'search'
                                    ? 'bg-white dark:bg-slate-900 text-purple-700 dark:text-purple-300 shadow-md scale-100'
                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                            }`}
                        >
                            <span className="material-symbols-outlined text-lg">search</span>
                            Voter Search & Slip
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('live_portal')}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black text-sm transition-all cursor-pointer ${
                                activeTab === 'live_portal'
                                    ? 'bg-white dark:bg-slate-900 text-purple-700 dark:text-purple-300 shadow-md scale-100'
                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                            }`}
                        >
                            <span className="material-symbols-outlined text-lg">language</span>
                            Official ECI Web View
                        </button>
                    </div>
                </div>

                {/* VIEW 1: In-Portal Search Form */}
                {activeTab === 'search' && (
                    <div className="space-y-8 animate-fade-in">
                        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-800 overflow-hidden">
                            <div className="p-6 sm:p-8">
                                <div className="max-w-2xl mx-auto text-center">
                                    <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/30 dark:to-indigo-900/30 text-purple-600 dark:text-purple-400 rounded-2xl mb-4 mx-auto shadow-inner">
                                        <span className="material-symbols-outlined text-3xl">how_to_vote</span>
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-2 tracking-tight">
                                        S.I.R Voter List Search
                                    </h3>
                                    <p className="text-slate-500 dark:text-slate-400 mb-6 font-medium text-xs sm:text-sm">
                                        Find voter details, serial number, polling booth, and assembly records instantly.
                                    </p>

                                    {/* Search Type Selector */}
                                    <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl mb-6 border border-slate-200 dark:border-slate-700">
                                        <button
                                            type="button"
                                            onClick={() => { setSearchType('epic'); setError(null); }}
                                            className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                                                searchType === 'epic'
                                                    ? 'bg-white dark:bg-slate-900 text-purple-700 dark:text-purple-300 shadow-md'
                                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                                            }`}
                                        >
                                            Search by EPIC (Voter ID)
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => { setSearchType('area'); setError(null); }}
                                            className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                                                searchType === 'area'
                                                    ? 'bg-white dark:bg-slate-900 text-purple-700 dark:text-purple-300 shadow-md'
                                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                                            }`}
                                        >
                                            Search by Area / Constituency
                                        </button>
                                    </div>

                                    {/* Form */}
                                    <form onSubmit={handleSearch} className="space-y-4 text-left">
                                        {searchType === 'epic' ? (
                                            <div>
                                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-2">
                                                    EPIC Number (Voter ID Card Number) *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={epicNo}
                                                    onChange={(e) => setEpicNo(e.target.value.toUpperCase())}
                                                    placeholder="e.g. TKN1234567 or DL01234567"
                                                    required
                                                    className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800/60 border-2 border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 outline-none text-xl font-black transition-all text-center dark:text-white tracking-widest uppercase font-mono"
                                                />
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                                                        State *
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={state}
                                                        onChange={(e) => setState(e.target.value)}
                                                        placeholder="Haryana"
                                                        required
                                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl font-bold dark:text-white text-sm"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                                                        District *
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={district}
                                                        onChange={(e) => setDistrict(e.target.value)}
                                                        placeholder="e.g. Karnal, Panipat, Rohtak"
                                                        required
                                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl font-bold dark:text-white text-sm"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                                                        Assembly Constituency (AC Name / No)
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={acName}
                                                        onChange={(e) => setAcName(e.target.value)}
                                                        placeholder="e.g. Karnal (AC 21)"
                                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl font-bold dark:text-white text-sm"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                                                        Polling Station / Part No
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={partNo}
                                                        onChange={(e) => setPartNo(e.target.value)}
                                                        placeholder="e.g. 45"
                                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl font-bold dark:text-white text-sm"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                                                        Voter Name (Optional)
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={voterName}
                                                        onChange={(e) => setVoterName(e.target.value)}
                                                        placeholder="e.g. SURENDER"
                                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl font-bold dark:text-white text-sm"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                                                        Relative's Name (Father / Husband)
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={relativeName}
                                                        onChange={(e) => setRelativeName(e.target.value)}
                                                        placeholder="e.g. BALBIR SINGH"
                                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl font-bold dark:text-white text-sm"
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full py-4 px-6 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-black text-base rounded-2xl shadow-lg shadow-purple-600/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mt-4"
                                        >
                                            {loading ? (
                                                <>
                                                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    Searching S.I.R Electoral Roll...
                                                </>
                                            ) : (
                                                <>
                                                    <span className="material-symbols-outlined text-xl">search</span>
                                                    Search Voter List
                                                </>
                                            )}
                                        </button>
                                    </form>

                                    {error && (
                                        <div className="mt-5 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-2xl flex items-start gap-3 text-left">
                                            <span className="material-symbols-outlined text-red-600 text-lg shrink-0">error</span>
                                            <p className="text-red-700 dark:text-red-300 font-medium text-sm">{error}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Search Results */}
                        {result && (
                            <div className="space-y-6 animate-fade-in-up">
                                <div className="bg-gradient-to-r from-purple-600 to-indigo-700 rounded-3xl p-6 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                                    <div>
                                        <span className="text-xs font-bold uppercase tracking-widest text-purple-200">
                                            Election Commission Electoral Roll
                                        </span>
                                        <h3 className="text-2xl font-black mt-0.5">
                                            Voter Card Results
                                        </h3>
                                        <p className="text-purple-100 text-sm font-medium mt-1">
                                            Found Records: <span className="font-extrabold text-white text-base">{result.total_found || result.voters?.length || 0}</span>
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <a
                                            href={officialUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-4 py-2.5 bg-white/15 hover:bg-white/25 backdrop-blur-sm border border-white/30 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
                                        >
                                            <span className="material-symbols-outlined text-base">verified</span>
                                            Verify on ECI Portal
                                        </a>
                                        <button
                                            type="button"
                                            onClick={() => window.print()}
                                            className="px-4 py-2.5 bg-white text-purple-900 hover:bg-purple-50 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
                                        >
                                            <span className="material-symbols-outlined text-base">print</span>
                                            Print Voter Slip
                                        </button>
                                    </div>
                                </div>

                                {/* Voter Records Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    {result.voters?.map((voter, idx) => (
                                        <div
                                            key={idx}
                                            className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-lg transition-all hover:border-purple-400 dark:hover:border-purple-600 flex flex-col justify-between"
                                        >
                                            <div>
                                                <div className="flex items-start justify-between gap-2 mb-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                                                    <div>
                                                        <h4 className="font-black text-xl text-slate-800 dark:text-white">
                                                            {voter.name}
                                                        </h4>
                                                        {voter.relation_name && (
                                                            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                                                                {voter.relation_type || 'Relative'}: {voter.relation_name}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <span className="px-3 py-1 bg-purple-50 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 rounded-full text-xs font-black shrink-0">
                                                        SN #{voter.serial_no || (idx + 1)}
                                                    </span>
                                                </div>

                                                <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                                                    <div>
                                                        <span className="text-[11px] font-bold text-slate-400 uppercase">Gender / Age</span>
                                                        <p className="font-bold text-slate-800 dark:text-white">{voter.gender || 'N/A'} • {voter.age} Yrs</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-[11px] font-bold text-slate-400 uppercase">House / Ward</span>
                                                        <p className="font-bold text-slate-800 dark:text-white">{voter.house_no || 'N/A'}</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-[11px] font-bold text-slate-400 uppercase">Part No</span>
                                                        <p className="font-bold text-slate-800 dark:text-white font-mono">{voter.part_no || 'N/A'}</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-[11px] font-bold text-slate-400 uppercase">Assembly</span>
                                                        <p className="font-bold text-slate-800 dark:text-white">{voter.ac_name || 'N/A'}</p>
                                                    </div>
                                                </div>

                                                {voter.polling_station && (
                                                    <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs mb-4">
                                                        <span className="font-bold text-slate-400 uppercase block mb-0.5">Polling Station</span>
                                                        <p className="font-bold text-slate-700 dark:text-slate-200">{voter.polling_station}</p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* EPIC Box */}
                                            <div className="pt-2">
                                                <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                                                    EPIC (Voter ID Number)
                                                </p>
                                                <div className="flex items-center justify-between bg-purple-50 dark:bg-purple-950/40 p-3 rounded-xl border border-purple-200 dark:border-purple-800/60">
                                                    <span className="font-mono text-lg font-black text-purple-800 dark:text-purple-300 tracking-wider select-all">
                                                        {voter.epic_no || voter.epic}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleCopy(voter.epic_no || voter.epic, idx)}
                                                        className="p-1.5 text-purple-600 hover:text-purple-800 dark:text-purple-400 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/60 transition-colors cursor-pointer"
                                                        title="Copy EPIC Number"
                                                    >
                                                        <span className="material-symbols-outlined text-lg">
                                                            {copiedIndex === idx ? 'check' : 'content_copy'}
                                                        </span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* VIEW 2: Official ECI SIR Portal Web View */}
                {activeTab === 'live_portal' && (
                    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-fade-in">
                        {/* Webview Header Bar */}
                        <div className="p-4 bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1.5">
                                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                                    <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                                    <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                                </div>
                                <div className="px-3 py-1 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-700 dark:text-slate-300 flex items-center gap-2 max-w-sm sm:max-w-md truncate">
                                    <span className="material-symbols-outlined text-sm text-emerald-600">lock</span>
                                    <span className="truncate">{officialUrl}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setIframeKey(prev => prev + 1)}
                                    className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                                    title="Reload Portal"
                                >
                                    <span className="material-symbols-outlined text-lg">refresh</span>
                                </button>
                                <a
                                    href={officialUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm transition-all"
                                >
                                    <span className="material-symbols-outlined text-sm">open_in_new</span>
                                    Open Full Window
                                </a>
                            </div>
                        </div>

                        {/* Informational Notification */}
                        <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-lg shrink-0">info</span>
                                <span>
                                    Yeh Election Commission of India (ECI) ka direct official portal view hai. Agar security header ki wajah se frame block ho, toh <strong>"Open Full Window"</strong> button par click karein.
                                </span>
                            </div>
                            <a
                                href={officialUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="underline font-bold shrink-0 hover:text-amber-950 dark:hover:text-white"
                            >
                                Direct Link ↗
                            </a>
                        </div>

                        {/* Iframe */}
                        <div className="w-full h-[750px] bg-slate-50 dark:bg-slate-950 relative">
                            <iframe
                                key={iframeKey}
                                src={officialUrl}
                                title="ECI SIR Voter Portal"
                                className="w-full h-full border-none"
                                sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-downloads"
                            />
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
