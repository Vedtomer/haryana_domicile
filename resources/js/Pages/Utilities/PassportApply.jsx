import React, { useState, useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import axios from 'axios';

const INDIAN_STATES = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 
    'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 
    'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 
    'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 
    'Uttarakhand', 'West Bengal', 'Andaman and Nicobar Islands', 'Chandigarh', 
    'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Jammu and Kashmir', 
    'Ladakh', 'Lakshadweep', 'Puducherry'
];

export default function PassportApply({ service, userCoins = 0, recentRequests = [] }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        father_name: '',
        mother_name: '',
        wife_name: '',
        dob: '',
        mobile_number: '',
        emergency_contact_number: '',
        email: '',
        address: '',
        pincode: '',
        state: '',
        city: '',
        thana: '',
        document_type: '10th_marksheet', // '10th_marksheet' (2750) or 'pan_card' (2950)
        aadhar_file: null,
        qualifying_file: null,
        voter_file: null,
    });

    const [pincodeLoading, setPincodeLoading] = useState(false);
    const [thanaOptions, setThanaOptions] = useState([]);
    const [isCustomThana, setIsCustomThana] = useState(false);

    const currentFee = data.document_type === '10th_marksheet' ? 2750 : 2950;
    const hasEnoughCoins = userCoins >= currentFee;

    const handlePincodeChange = async (val) => {
        const clean = val.replace(/\D/g, '').slice(0, 6);
        setData('pincode', clean);

        if (clean.length === 6) {
            setPincodeLoading(true);
            try {
                const res = await axios.get(`/utilities/passport-apply/pincode/${clean}`);
                if (res.data.success) {
                    const defaultThana = (res.data.thanas && res.data.thanas.length > 0) ? res.data.thanas[0] : data.thana;
                    setData(prev => ({
                        ...prev,
                        pincode: clean,
                        state: res.data.state || prev.state,
                        city: res.data.city || prev.city,
                        thana: defaultThana,
                    }));
                    if (res.data.thanas && res.data.thanas.length > 0) {
                        setThanaOptions(res.data.thanas);
                        setIsCustomThana(false);
                    }
                }
            } catch (err) {
                // fallback
            } finally {
                setPincodeLoading(false);
            }
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!hasEnoughCoins) {
            alert(`Apke wallet me paryapt coins nahi hain. Required: ${currentFee} Coins, Available: ${userCoins} Coins.`);
            return;
        }

        post('/utilities/passport-apply', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                reset('aadhar_file', 'qualifying_file', 'voter_file');
            },
        });
    };

    return (
        <AdminLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                        <h1 className="text-xl font-black text-slate-800 dark:text-white leading-tight flex items-center gap-2">
                            <span>🛂</span> Passport Apply
                        </h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            Online Passport Application Form &amp; Document Submission
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500 dark:text-slate-400">Balance:</span>
                        <span className="font-extrabold text-sm text-amber-600 dark:text-amber-400 px-3 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800">
                            🪙 {userCoins} Coins
                        </span>
                    </div>
                </div>
            }
        >
            <Head title="Passport Apply - CSP Jaankari" />

            <div className="max-w-5xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
                
                {/* Hero Price & Info Banner */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 sm:p-8 shadow-xl border border-blue-800/50">
                    <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <div className="space-y-2">
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold uppercase tracking-wider">
                                <span>🛂</span> Indian Passport Application
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                                Passport Apply Portal
                            </h2>
                            <p className="text-xs sm:text-sm text-blue-200/90 leading-relaxed max-w-2xl">
                                Naya passport banwane ke liye form bharein aur documents upload karein. Pincode daalte hi city aur thana automatic fill ho jayenge.
                            </p>
                        </div>

                        {/* Fee Badge Card */}
                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 shrink-0 w-full md:w-auto text-center md:text-right">
                            <span className="text-[11px] font-bold text-blue-200 uppercase tracking-wider block">
                                Selected Service Fee
                            </span>
                            <span className="text-3xl font-black text-amber-400 tracking-tight block mt-0.5">
                                🪙 {currentFee} Coins
                            </span>
                            <span className="text-[11px] text-blue-200/80 block mt-1">
                                {data.document_type === '10th_marksheet' ? '10th Marksheet: 2750 Coins' : 'PAN Card: 2950 Coins'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Coin Shortage Warning */}
                {!hasEnoughCoins && (
                    <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-red-800 dark:text-red-300">
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-2xl text-red-500">error</span>
                            <div>
                                <h4 className="font-bold text-sm">Insufficient Coins</h4>
                                <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">
                                    Is service ke liye <strong>{currentFee} Coins</strong> chahiye, jabki aapke paas <strong>{userCoins} Coins</strong> hain.
                                </p>
                            </div>
                        </div>
                        <Link
                            href="/admin/coin-requests"
                            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md shrink-0 transition-colors"
                        >
                            Recharge Coins Now →
                        </Link>
                    </div>
                )}

                {/* Main Application Form */}
                <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8 space-y-8">
                    
                    {/* STEP 1: Document Selection */}
                    <div>
                        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                            <span className="w-7 h-7 rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-black text-xs flex items-center justify-center">1</span>
                            <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                                Select Document Proof &amp; Fee Structure
                            </h3>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 mb-4">
                            Aadhaar Card aur Voter Card ke alawa aap kaunsa document proof dena chahte hain?
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* 10th Marksheet Option */}
                            <label
                                onClick={() => setData('document_type', '10th_marksheet')}
                                className={`relative p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                                    data.document_type === '10th_marksheet'
                                        ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/30 ring-2 ring-blue-500/20'
                                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                                }`}
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xl shrink-0">
                                            🎓
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                                                10th Marksheet
                                            </h4>
                                            <span className="text-xs text-slate-500 dark:text-slate-400">
                                                Non-ECR Category Eligible
                                            </span>
                                        </div>
                                    </div>
                                    <span className="font-mono text-base font-black text-blue-700 dark:text-blue-400">
                                        🪙 2,750
                                    </span>
                                </div>
                                <div className="mt-4 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200/60 dark:border-slate-800">
                                    <span>Fee: <strong>2,750 Coins</strong></span>
                                    <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                        data.document_type === '10th_marksheet' ? 'border-blue-600 bg-blue-600' : 'border-slate-300'
                                    }`}>
                                        {data.document_type === '10th_marksheet' && <span className="w-1.5 h-1.5 rounded-full bg-white"></span>}
                                    </span>
                                </div>
                            </label>

                            {/* PAN Card Option */}
                            <label
                                onClick={() => setData('document_type', 'pan_card')}
                                className={`relative p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                                    data.document_type === 'pan_card'
                                        ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/30 ring-2 ring-blue-500/20'
                                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                                }`}
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 flex items-center justify-center text-xl shrink-0">
                                            💳
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                                                PAN Card
                                            </h4>
                                            <span className="text-xs text-slate-500 dark:text-slate-400">
                                                Income Tax Identity Proof
                                            </span>
                                        </div>
                                    </div>
                                    <span className="font-mono text-base font-black text-purple-700 dark:text-purple-400">
                                        🪙 2,950
                                    </span>
                                </div>
                                <div className="mt-4 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200/60 dark:border-slate-800">
                                    <span>Fee: <strong>2,950 Coins</strong></span>
                                    <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                        data.document_type === 'pan_card' ? 'border-blue-600 bg-blue-600' : 'border-slate-300'
                                    }`}>
                                        {data.document_type === 'pan_card' && <span className="w-1.5 h-1.5 rounded-full bg-white"></span>}
                                    </span>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* STEP 2: Personal & Family Information */}
                    <div>
                        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                            <span className="w-7 h-7 rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-black text-xs flex items-center justify-center">2</span>
                            <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                                Applicant &amp; Family Details
                            </h3>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-5">
                            {/* Applicant Name */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                                    Applicant Full Name *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="Enter full name as per Aadhaar"
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                                />
                                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                            </div>

                            {/* Father Name */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                                    Father's Name *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={data.father_name}
                                    onChange={(e) => setData('father_name', e.target.value)}
                                    placeholder="Enter father's name"
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                                />
                                {errors.father_name && <p className="text-red-500 text-xs mt-1">{errors.father_name}</p>}
                            </div>

                            {/* Mother Name */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                                    Mother's Name *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={data.mother_name}
                                    onChange={(e) => setData('mother_name', e.target.value)}
                                    placeholder="Enter mother's name"
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                                />
                                {errors.mother_name && <p className="text-red-500 text-xs mt-1">{errors.mother_name}</p>}
                            </div>

                            {/* Wife / Spouse Name */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                                    Wife / Spouse Name (Optional)
                                </label>
                                <input
                                    type="text"
                                    value={data.wife_name}
                                    onChange={(e) => setData('wife_name', e.target.value)}
                                    placeholder="Enter spouse name if married"
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                                />
                                {errors.wife_name && <p className="text-red-500 text-xs mt-1">{errors.wife_name}</p>}
                            </div>

                            {/* DOB */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                                    Date of Birth (DOB) *
                                </label>
                                <input
                                    type="date"
                                    required
                                    value={data.dob}
                                    onChange={(e) => setData('dob', e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                                />
                                {errors.dob && <p className="text-red-500 text-xs mt-1">{errors.dob}</p>}
                            </div>
                        </div>
                    </div>

                    {/* STEP 3: Contact Details */}
                    <div>
                        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                            <span className="w-7 h-7 rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-black text-xs flex items-center justify-center">3</span>
                            <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                                Contact Information
                            </h3>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-5">
                            {/* Mobile Number */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                                    Mobile Number *
                                </label>
                                <input
                                    type="tel"
                                    required
                                    maxLength={10}
                                    value={data.mobile_number}
                                    onChange={(e) => setData('mobile_number', e.target.value.replace(/\D/g, '').slice(0, 10))}
                                    placeholder="10-digit Mobile Number"
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                                />
                                {errors.mobile_number && <p className="text-red-500 text-xs mt-1">{errors.mobile_number}</p>}
                            </div>

                            {/* Emergency Contact Number */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                                    Emergency Contact Number *
                                </label>
                                <input
                                    type="tel"
                                    required
                                    maxLength={10}
                                    value={data.emergency_contact_number}
                                    onChange={(e) => setData('emergency_contact_number', e.target.value.replace(/\D/g, '').slice(0, 10))}
                                    placeholder="Alternate / Emergency Mobile"
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                                />
                                {errors.emergency_contact_number && <p className="text-red-500 text-xs mt-1">{errors.emergency_contact_number}</p>}
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                                    Email Address *
                                </label>
                                <input
                                    type="email"
                                    required
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="name@example.com"
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                                />
                                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                            </div>
                        </div>
                    </div>

                    {/* STEP 4: Address & Real-time Pincode/Thana Lookup */}
                    <div>
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-2">
                                <span className="w-7 h-7 rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-black text-xs flex items-center justify-center">4</span>
                                <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                                    Residential Address &amp; Police Station
                                </h3>
                            </div>
                            <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
                                ⚡ Automatic Pincode Auto-Fill
                            </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-5">
                            {/* Pin Code with Real-time lookup */}
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                        Pin Code *
                                    </label>
                                    {pincodeLoading && (
                                        <span className="text-[11px] text-blue-600 font-bold animate-pulse flex items-center gap-1">
                                            <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping"></span>
                                            Fetching...
                                        </span>
                                    )}
                                </div>
                                <input
                                    type="text"
                                    required
                                    maxLength={6}
                                    value={data.pincode}
                                    onChange={(e) => handlePincodeChange(e.target.value)}
                                    placeholder="Enter 6-digit Pincode"
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-mono font-bold focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                                />
                                {errors.pincode && <p className="text-red-500 text-xs mt-1">{errors.pincode}</p>}
                            </div>

                            {/* State (Auto-filled) */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                                    State *
                                </label>
                                <select
                                    required
                                    value={data.state}
                                    onChange={(e) => setData('state', e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                                >
                                    <option value="">Select State</option>
                                    {INDIAN_STATES.map((st) => (
                                        <option key={st} value={st}>{st}</option>
                                    ))}
                                </select>
                                {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
                            </div>

                            {/* City / District (Auto-filled) */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                                    City / District *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={data.city}
                                    onChange={(e) => setData('city', e.target.value)}
                                    placeholder="Auto-filled from pincode"
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                                />
                                {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                            </div>

                            {/* Police Station / Thana (Auto-suggested from Pincode) */}
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                        Police Station (Thana) *
                                    </label>
                                    {thanaOptions.length > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => setIsCustomThana(!isCustomThana)}
                                            className="text-[10px] text-blue-600 hover:underline cursor-pointer"
                                        >
                                            {isCustomThana ? 'Choose from list' : 'Type other'}
                                        </button>
                                    )}
                                </div>

                                {thanaOptions.length > 0 && !isCustomThana ? (
                                    <select
                                        required
                                        value={data.thana}
                                        onChange={(e) => {
                                            if (e.target.value === '__custom__') {
                                                setIsCustomThana(true);
                                                setData('thana', '');
                                            } else {
                                                setData('thana', e.target.value);
                                            }
                                        }}
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                                    >
                                        <option value="">Select Thana / Area</option>
                                        {thanaOptions.map((th) => (
                                            <option key={th} value={th}>{th}</option>
                                        ))}
                                        <option value="__custom__">+ Enter Custom Thana</option>
                                    </select>
                                ) : (
                                    <input
                                        type="text"
                                        required
                                        value={data.thana}
                                        onChange={(e) => setData('thana', e.target.value)}
                                        placeholder="Enter Police Station Name"
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                                    />
                                )}
                                {errors.thana && <p className="text-red-500 text-xs mt-1">{errors.thana}</p>}
                            </div>
                        </div>

                        {/* Full Address */}
                        <div className="mt-4">
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                                Complete Residential Address (House / Street / Locality) *
                            </label>
                            <textarea
                                required
                                rows={2}
                                value={data.address}
                                onChange={(e) => setData('address', e.target.value)}
                                placeholder="Enter complete address as mentioned in identity proof"
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                            />
                            {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                        </div>
                    </div>

                    {/* STEP 5: Required Document Uploads */}
                    <div>
                        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                            <span className="w-7 h-7 rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-black text-xs flex items-center justify-center">5</span>
                            <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                                Upload Required Documents
                            </h3>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 mb-4">
                            PDF, JPG ya PNG format me clear scanned copy upload karein (Max 10MB per file).
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                            {/* Document 1: Aadhaar Card */}
                            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-4 bg-slate-50/50 dark:bg-slate-800/40">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-lg">🆔</span>
                                    <label className="font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-white">
                                        Aadhaar Card *
                                    </label>
                                </div>
                                <input
                                    type="file"
                                    required
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    onChange={(e) => setData('aadhar_file', e.target.files[0])}
                                    className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3.5 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 file:cursor-pointer"
                                />
                                {data.aadhar_file && (
                                    <p className="text-[11px] text-emerald-600 font-semibold mt-2 truncate">
                                        ✓ {data.aadhar_file.name} ({(data.aadhar_file.size / 1024).toFixed(0)} KB)
                                    </p>
                                )}
                                {errors.aadhar_file && <p className="text-red-500 text-xs mt-1">{errors.aadhar_file}</p>}
                            </div>

                            {/* Document 2: 10th Marksheet or PAN Card */}
                            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-4 bg-slate-50/50 dark:bg-slate-800/40">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-lg">{data.document_type === '10th_marksheet' ? '🎓' : '💳'}</span>
                                    <label className="font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-white">
                                        {data.document_type === '10th_marksheet' ? '10th Marksheet *' : 'PAN Card *'}
                                    </label>
                                </div>
                                <input
                                    type="file"
                                    required
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    onChange={(e) => setData('qualifying_file', e.target.files[0])}
                                    className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3.5 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 file:cursor-pointer"
                                />
                                {data.qualifying_file && (
                                    <p className="text-[11px] text-emerald-600 font-semibold mt-2 truncate">
                                        ✓ {data.qualifying_file.name} ({(data.qualifying_file.size / 1024).toFixed(0)} KB)
                                    </p>
                                )}
                                {errors.qualifying_file && <p className="text-red-500 text-xs mt-1">{errors.qualifying_file}</p>}
                            </div>

                            {/* Document 3: Voter Card */}
                            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-4 bg-slate-50/50 dark:bg-slate-800/40">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-lg">🗳️</span>
                                    <label className="font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-white">
                                        Voter Card *
                                    </label>
                                </div>
                                <input
                                    type="file"
                                    required
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    onChange={(e) => setData('voter_file', e.target.files[0])}
                                    className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3.5 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 file:cursor-pointer"
                                />
                                {data.voter_file && (
                                    <p className="text-[11px] text-emerald-600 font-semibold mt-2 truncate">
                                        ✓ {data.voter_file.name} ({(data.voter_file.size / 1024).toFixed(0)} KB)
                                    </p>
                                )}
                                {errors.voter_file && <p className="text-red-500 text-xs mt-1">{errors.voter_file}</p>}
                            </div>
                        </div>
                    </div>

                    {/* STEP 6: Fee Summary & Submission */}
                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div>
                            <span className="text-xs text-slate-500 dark:text-slate-400 block">Total Deduction:</span>
                            <span className="text-2xl font-black text-amber-600 dark:text-amber-400">
                                🪙 {currentFee} Coins
                            </span>
                            <span className="text-xs text-slate-400 block mt-0.5">
                                {data.document_type === '10th_marksheet' ? 'Applied with 10th Marksheet' : 'Applied with PAN Card'}
                            </span>
                        </div>

                        <button
                            type="submit"
                            disabled={processing || !hasEnoughCoins}
                            className={`w-full sm:w-auto px-8 py-3.5 rounded-2xl font-extrabold text-sm text-white shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                                hasEnoughCoins && !processing
                                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-blue-600/30 hover:-translate-y-0.5'
                                    : 'bg-slate-400 cursor-not-allowed opacity-60'
                            }`}
                        >
                            {processing ? (
                                <span>Submitting Application...</span>
                            ) : (
                                <>
                                    <span>Submit Passport Application</span>
                                    <span className="material-symbols-outlined text-base">send</span>
                                </>
                            )}
                        </button>
                    </div>

                </form>

                {/* Recent Passport Applications History */}
                {recentRequests && recentRequests.length > 0 && (
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
                        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <h3 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-2">
                                <span>📋</span> My Submitted Passport Applications
                            </h3>
                            <Link
                                href="/admin/service-requests"
                                className="text-xs font-bold text-blue-600 hover:underline"
                            >
                                View All Requests →
                            </Link>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
                                <thead className="bg-slate-50 dark:bg-slate-800/60 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800">
                                    <tr>
                                        <th className="px-6 py-3.5">Request ID</th>
                                        <th className="px-6 py-3.5">Applicant Name</th>
                                        <th className="px-6 py-3.5">Document Proof</th>
                                        <th className="px-6 py-3.5">Coins</th>
                                        <th className="px-6 py-3.5">Submitted On</th>
                                        <th className="px-6 py-3.5 text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {recentRequests.map((req) => (
                                        <tr key={req.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                            <td className="px-6 py-4 font-mono font-bold text-slate-900 dark:text-white">
                                                #{req.id}
                                            </td>
                                            <td className="px-6 py-4 font-semibold text-slate-800 dark:text-slate-200">
                                                {req.input_data?.['Applicant Name'] || '—'}
                                            </td>
                                            <td className="px-6 py-4 text-xs font-mono text-purple-600 dark:text-purple-400">
                                                {req.input_data?.['Selected Document Proof'] || '—'}
                                            </td>
                                            <td className="px-6 py-4 font-bold text-amber-600 dark:text-amber-400">
                                                🪙 {req.coins_charged}
                                            </td>
                                            <td className="px-6 py-4 text-xs text-slate-500">
                                                {req.created_at}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                                    req.status === 'completed'
                                                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                                        : req.status === 'rejected'
                                                        ? 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300'
                                                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                                                }`}>
                                                    {req.status_label || req.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

            </div>
        </AdminLayout>
    );
}
