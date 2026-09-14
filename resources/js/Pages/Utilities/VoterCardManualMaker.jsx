import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import axios from 'axios';

export default function VoterCardManualMaker() {
    const [formData, setFormData] = useState({
        epic_no: 'TKN1234567',
        name_en: 'RAHUL SHARMA',
        name_hi: 'राहुल शर्मा',
        relation_type: 'Father',
        relation_name_en: 'RAMESH SHARMA',
        relation_name_hi: 'रमेश शर्मा',
        gender: 'Male',
        dob: '15/08/1990',
        house_no_en: 'H.No. 42',
        house_no_hi: 'म.नं. 42',
        address_en: 'Ward No 5, Model Town, Karnal, Haryana - 132001',
        address_hi: 'वार्ड नं 5, मॉडल टाउन, करनाल, हरियाणा - 132001',
        ac_name_en: 'Karnal (AC 21)',
        part_name_en: '45 - Govt Senior Secondary School',
    });

    const [photoPreview, setPhotoPreview] = useState(null);
    const [signPreview, setSignPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setPhotoPreview(url);
        }
    };

    const handleSignChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setSignPreview(url);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const response = await axios.post('/utilities/voter-card-manual-maker/generate', formData);
            if (response.data.success) {
                setResult(response.data);
            } else {
                setError(response.data.message || 'Failed to generate Voter Card.');
            }
        } catch (err) {
            console.error('Voter Card Error:', err);
            setError(err.response?.data?.message || 'Error occurred while generating Voter Card.');
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
                                Voter Card
                            </span>
                            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                Active
                            </span>
                        </div>
                        <h1 className="text-xl sm:text-2xl font-black text-gray-800 dark:text-white leading-tight mt-1">
                            Voter Card Manual Maker
                        </h1>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 mt-0.5">
                            Create, customize, and print high-quality Voter ID (EPIC) PVC card layouts
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => window.print()}
                        className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-md transition-all cursor-pointer shrink-0"
                    >
                        <span className="material-symbols-outlined text-lg">print</span>
                        Print PVC Card
                    </button>
                </div>
            }
        >
            <Head title="Voter Card Manual Maker" />

            <div className="max-w-6xl mx-auto mt-6 px-4 pb-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Form: 7 cols */}
                    <div className="lg:col-span-7 space-y-6">
                        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-800 p-6 sm:p-7">
                            <div className="flex items-center gap-3 pb-4 mb-5 border-b border-slate-100 dark:border-slate-800">
                                <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-2xl">badge</span>
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-slate-800 dark:text-white">Card Details Entry</h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Fill in details to generate live card preview</p>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                                <div>
                                    <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                                        EPIC Number (Voter ID No) *
                                    </label>
                                    <input
                                        type="text"
                                        name="epic_no"
                                        value={formData.epic_no}
                                        onChange={handleChange}
                                        required
                                        placeholder="e.g. TKN1234567"
                                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl font-mono font-bold text-base uppercase text-purple-700 dark:text-purple-300"
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                                            Elector Name (English) *
                                        </label>
                                        <input
                                            type="text"
                                            name="name_en"
                                            value={formData.name_en}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                                            Elector Name (Hindi)
                                        </label>
                                        <input
                                            type="text"
                                            name="name_hi"
                                            value={formData.name_hi}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold dark:text-white"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <div>
                                        <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                                            Relation Type
                                        </label>
                                        <select
                                            name="relation_type"
                                            value={formData.relation_type}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold dark:text-white"
                                        >
                                            <option value="Father">Father / पिता</option>
                                            <option value="Husband">Husband / पति</option>
                                            <option value="Mother">Mother / माता</option>
                                            <option value="Other">Other / अन्य</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                                            Relative Name (Eng) *
                                        </label>
                                        <input
                                            type="text"
                                            name="relation_name_en"
                                            value={formData.relation_name_en}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                                            Relative Name (Hindi)
                                        </label>
                                        <input
                                            type="text"
                                            name="relation_name_hi"
                                            value={formData.relation_name_hi}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold dark:text-white"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                                            Gender *
                                        </label>
                                        <select
                                            name="gender"
                                            value={formData.gender}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold dark:text-white"
                                        >
                                            <option value="Male">Male / पुरुष</option>
                                            <option value="Female">Female / महिला</option>
                                            <option value="Third Gender">Third Gender</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                                            Date of Birth / Age *
                                        </label>
                                        <input
                                            type="text"
                                            name="dob"
                                            value={formData.dob}
                                            onChange={handleChange}
                                            placeholder="DD/MM/YYYY"
                                            required
                                            className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold dark:text-white"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                                            House No (English)
                                        </label>
                                        <input
                                            type="text"
                                            name="house_no_en"
                                            value={formData.house_no_en}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                                            House No (Hindi)
                                        </label>
                                        <input
                                            type="text"
                                            name="house_no_hi"
                                            value={formData.house_no_hi}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold dark:text-white"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                                        Full Address (English)
                                    </label>
                                    <input
                                        type="text"
                                        name="address_en"
                                        value={formData.address_en}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold dark:text-white"
                                    />
                                </div>

                                <div>
                                    <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                                        Full Address (Hindi)
                                    </label>
                                    <input
                                        type="text"
                                        name="address_hi"
                                        value={formData.address_hi}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold dark:text-white"
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                                            Assembly Constituency
                                        </label>
                                        <input
                                            type="text"
                                            name="ac_name_en"
                                            value={formData.ac_name_en}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                                            Part No & Polling Station
                                        </label>
                                        <input
                                            type="text"
                                            name="part_name_en"
                                            value={formData.part_name_en}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold dark:text-white"
                                        />
                                    </div>
                                </div>

                                {/* Photo & Signature Uploads */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                                    <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                                        <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                                            Voter Photo
                                        </label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handlePhotoChange}
                                            className="text-[11px] text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-purple-100 file:text-purple-700 hover:file:bg-purple-200"
                                        />
                                    </div>
                                    <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                                        <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                                            Signature
                                        </label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleSignChange}
                                            className="text-[11px] text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-purple-100 file:text-purple-700 hover:file:bg-purple-200"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3.5 px-5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-black text-sm rounded-xl shadow-lg shadow-purple-600/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mt-4"
                                >
                                    {loading ? 'Processing Card...' : 'Save & Generate Card'}
                                </button>
                            </form>

                            {error && (
                                <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300 text-xs">
                                    {error}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: Live PVC Card Preview: 5 cols */}
                    <div className="lg:col-span-5 space-y-6">
                        <div className="sticky top-6 space-y-5">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider">
                                    Live PVC Card Preview
                                </h3>
                                <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/50 px-2 py-0.5 rounded-full">
                                    Front & Back
                                </span>
                            </div>

                            {/* FRONT CARD */}
                            <div className="w-full max-w-[380px] mx-auto bg-gradient-to-b from-amber-50 via-white to-amber-50/80 rounded-2xl border-2 border-slate-300 dark:border-slate-700 shadow-xl overflow-hidden text-slate-900 text-[10px] leading-tight p-3 relative select-none">
                                {/* Header */}
                                <div className="text-center border-b border-slate-300 pb-1.5 mb-2">
                                    <div className="text-[9px] font-extrabold text-red-700 tracking-wider">
                                        भारत निर्वाचन आयोग
                                    </div>
                                    <div className="text-[9px] font-black tracking-widest text-slate-800 uppercase">
                                        ELECTION COMMISSION OF INDIA
                                    </div>
                                </div>

                                {/* EPIC Number */}
                                <div className="text-center bg-slate-900 text-white py-1 px-2 rounded-md font-mono font-black text-xs tracking-widest mb-2.5">
                                    {formData.epic_no || 'EPIC NUMBER'}
                                </div>

                                {/* Main Body: Photo + Details */}
                                <div className="flex gap-2.5 items-start">
                                    {/* Photo box */}
                                    <div className="w-20 h-24 bg-slate-200 border border-slate-400 rounded-md overflow-hidden shrink-0 flex items-center justify-center">
                                        {photoPreview ? (
                                            <img src={photoPreview} alt="Voter" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="material-symbols-outlined text-4xl text-slate-400">person</span>
                                        )}
                                    </div>

                                    {/* Text Info */}
                                    <div className="flex-1 space-y-1">
                                        <div>
                                            <span className="text-[8px] text-slate-500 font-bold block">नाम / Name</span>
                                            <div className="font-extrabold text-[11px]">{formData.name_hi || formData.name_en}</div>
                                            <div className="font-black text-[10px] uppercase text-slate-800">{formData.name_en}</div>
                                        </div>

                                        <div>
                                            <span className="text-[8px] text-slate-500 font-bold block">
                                                {formData.relation_type === 'Husband' ? 'पति का नाम / Husband\'s Name' : 'पिता का नाम / Father\'s Name'}
                                            </span>
                                            <div className="font-bold">{formData.relation_name_hi || formData.relation_name_en}</div>
                                            <div className="font-bold text-[9px] uppercase text-slate-700">{formData.relation_name_en}</div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-1 pt-0.5">
                                            <div>
                                                <span className="text-[8px] text-slate-500 font-bold block">लिंग / Gender</span>
                                                <span className="font-bold">{formData.gender}</span>
                                            </div>
                                            <div>
                                                <span className="text-[8px] text-slate-500 font-bold block">जन्म तिथि / DOB</span>
                                                <span className="font-bold">{formData.dob}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Signature bar */}
                                <div className="mt-2 pt-1 border-t border-slate-200 flex justify-end">
                                    <div className="w-24 h-6 border-b border-slate-400 flex items-center justify-center">
                                        {signPreview ? (
                                            <img src={signPreview} alt="Sign" className="max-h-full max-w-full object-contain" />
                                        ) : (
                                            <span className="text-[8px] text-slate-400 italic">Signature</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* BACK CARD */}
                            <div className="w-full max-w-[380px] mx-auto bg-gradient-to-b from-amber-50 via-white to-amber-50/80 rounded-2xl border-2 border-slate-300 dark:border-slate-700 shadow-xl overflow-hidden text-slate-900 text-[10px] leading-tight p-3 relative select-none">
                                <div className="flex gap-2 items-start mb-2">
                                    {/* Mock QR Code */}
                                    <div className="w-16 h-16 bg-slate-900 p-1 rounded-md shrink-0 flex items-center justify-center">
                                        <div className="w-full h-full bg-white flex items-center justify-center p-0.5">
                                            <span className="material-symbols-outlined text-3xl text-slate-900">qr_code_2</span>
                                        </div>
                                    </div>

                                    {/* Address Info */}
                                    <div className="flex-1 space-y-0.5">
                                        <span className="text-[8px] text-slate-500 font-bold block">पता / Address</span>
                                        <div className="font-bold text-[9px]">{formData.address_hi || formData.address_en}</div>
                                        <div className="font-medium text-[9px] text-slate-700">{formData.address_en}</div>
                                    </div>
                                </div>

                                <div className="space-y-1 border-t border-slate-200 pt-1.5 text-[9px]">
                                    <div>
                                        <span className="text-slate-500 font-bold">निर्वाचन क्षेत्र / Assembly: </span>
                                        <span className="font-bold">{formData.ac_name_en}</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-500 font-bold">भाग संख्या / Part: </span>
                                        <span className="font-bold">{formData.part_name_en}</span>
                                    </div>
                                </div>

                                <div className="mt-3 pt-1 border-t border-slate-300 flex justify-between items-end text-[8px] text-slate-500">
                                    <span>Date of Issue: {new Date().toLocaleDateString('en-GB')}</span>
                                    <span className="font-bold text-slate-700">निर्वाचक रजिस्ट्रीकरण अधिकारी</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
