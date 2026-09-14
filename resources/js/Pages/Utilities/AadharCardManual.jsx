import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import axios from 'axios';

export default function AadharCardManual() {
    const [formData, setFormData] = useState({
        aadhar_no: '2345 6789 0123',
        name_en: 'AMIT KUMAR',
        name_local: 'अमित कुमार',
        dob: '12/05/1992',
        gender: 'Male',
        care_of_type: 'S/O',
        care_of_name_en: 'SURESH KUMAR',
        care_of_name_local: 'सुरेश कुमार',
        address_en: 'House No 123, Street No 4, Sector 14, Urban Estate, Karnal, Haryana, 132001',
        address_local: 'मकान नं 123, गली नं 4, सेक्टर 14, अर्बन एस्टेट, करनाल, हरियाणा, 132001',
        pincode: '132001',
    });

    const [photoPreview, setPhotoPreview] = useState(null);
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const response = await axios.post('/utilities/aadhar-card-manual/generate', formData);
            if (response.data.success) {
                setResult(response.data);
            } else {
                setError(response.data.message || 'Failed to generate Aadhaar Card.');
            }
        } catch (err) {
            console.error('Aadhaar Card Error:', err);
            setError(err.response?.data?.message || 'Error occurred while generating Aadhaar Card.');
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
                            <span className="px-2.5 py-0.5 text-xs font-extrabold uppercase tracking-wider rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
                                UIDAI Service
                            </span>
                            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                Active
                            </span>
                        </div>
                        <h1 className="text-xl sm:text-2xl font-black text-gray-800 dark:text-white leading-tight mt-1">
                            Aadhar Card Manual
                        </h1>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 mt-0.5">
                            Create, customize, and print high-quality Aadhaar PVC card layout with photo & QR code
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => window.print()}
                        className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-md transition-all cursor-pointer shrink-0"
                    >
                        <span className="material-symbols-outlined text-lg">print</span>
                        Print PVC Card
                    </button>
                </div>
            }
        >
            <Head title="Aadhar Card Manual" />

            <div className="max-w-6xl mx-auto mt-6 px-4 pb-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Form: 7 cols */}
                    <div className="lg:col-span-7 space-y-6">
                        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-800 p-6 sm:p-7">
                            <div className="flex items-center gap-3 pb-4 mb-5 border-b border-slate-100 dark:border-slate-800">
                                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-2xl">fingerprint</span>
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-slate-800 dark:text-white">Aadhaar Card Entry</h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Fill details for live card generation</p>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                                <div>
                                    <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                                        Aadhaar Number (12 Digits) *
                                    </label>
                                    <input
                                        type="text"
                                        name="aadhar_no"
                                        value={formData.aadhar_no}
                                        onChange={handleChange}
                                        required
                                        placeholder="XXXX XXXX XXXX"
                                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl font-mono font-black text-lg tracking-widest text-blue-700 dark:text-blue-300 text-center"
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                                            Full Name (English) *
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
                                            Full Name (Hindi / Local)
                                        </label>
                                        <input
                                            type="text"
                                            name="name_local"
                                            value={formData.name_local}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold dark:text-white"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                                            Date of Birth (DOB) *
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
                                            <option value="Male">MALE / पुरुष</option>
                                            <option value="Female">FEMALE / महिला</option>
                                            <option value="Transgender">TRANSGENDER</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <div>
                                        <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                                            Care Of Type
                                        </label>
                                        <select
                                            name="care_of_type"
                                            value={formData.care_of_type}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold dark:text-white"
                                        >
                                            <option value="S/O">S/O (Son of)</option>
                                            <option value="D/O">D/O (Daughter of)</option>
                                            <option value="W/O">W/O (Wife of)</option>
                                            <option value="C/O">C/O (Care of)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                                            Care Of Name (English)
                                        </label>
                                        <input
                                            type="text"
                                            name="care_of_name_en"
                                            value={formData.care_of_name_en}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                                            Care Of Name (Hindi)
                                        </label>
                                        <input
                                            type="text"
                                            name="care_of_name_local"
                                            value={formData.care_of_name_local}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold dark:text-white"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                                        Address (English) *
                                    </label>
                                    <textarea
                                        rows="2"
                                        name="address_en"
                                        value={formData.address_en}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold dark:text-white"
                                    ></textarea>
                                </div>

                                <div>
                                    <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                                        Address (Hindi / Local)
                                    </label>
                                    <textarea
                                        rows="2"
                                        name="address_local"
                                        value={formData.address_local}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold dark:text-white"
                                    ></textarea>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                                            Pincode
                                        </label>
                                        <input
                                            type="text"
                                            name="pincode"
                                            value={formData.pincode}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold dark:text-white"
                                        />
                                    </div>
                                    <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                                        <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                                            Aadhaar Photo
                                        </label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handlePhotoChange}
                                            className="text-[11px] text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3.5 px-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-sm rounded-xl shadow-lg shadow-blue-600/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mt-4"
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

                    {/* Right: Live Aadhaar Card Preview: 5 cols */}
                    <div className="lg:col-span-5 space-y-6">
                        <div className="sticky top-6 space-y-5">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider">
                                    Live Aadhaar PVC Preview
                                </h3>
                                <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded-full">
                                    Front & Back
                                </span>
                            </div>

                            {/* FRONT CARD */}
                            <div className="w-full max-w-[380px] mx-auto bg-white rounded-2xl border-2 border-slate-300 dark:border-slate-700 shadow-xl overflow-hidden text-slate-900 text-[10px] leading-tight relative select-none">
                                {/* Emblem and Top Bar */}
                                <div className="p-2.5 pb-1 border-b border-slate-100 flex items-center justify-between">
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-5 h-7 flex items-center justify-center">
                                            <span className="material-symbols-outlined text-amber-700 text-xl">account_balance</span>
                                        </div>
                                        <div>
                                            <div className="text-[9px] font-bold text-slate-800">भारत सरकार</div>
                                            <div className="text-[9px] font-black text-slate-900">GOVERNMENT OF INDIA</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[8px] font-bold text-red-600">मेरा आधार, मेरी पहचान</div>
                                    </div>
                                </div>

                                {/* Body */}
                                <div className="p-3 pt-2 flex gap-3 items-start">
                                    {/* Photo */}
                                    <div className="w-20 h-24 bg-slate-100 border border-slate-300 rounded-md overflow-hidden shrink-0 flex items-center justify-center">
                                        {photoPreview ? (
                                            <img src={photoPreview} alt="Aadhaar" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="material-symbols-outlined text-4xl text-slate-400">person</span>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 space-y-1">
                                        <div>
                                            <div className="font-extrabold text-[12px] text-slate-900">{formData.name_local}</div>
                                            <div className="font-black text-[11px] text-slate-800 uppercase">{formData.name_en}</div>
                                        </div>

                                        <div className="pt-1">
                                            <span className="text-[8px] text-slate-500 font-bold block">जन्म तिथि / DOB</span>
                                            <span className="font-bold text-[10px]">{formData.dob}</span>
                                        </div>

                                        <div>
                                            <span className="text-[8px] text-slate-500 font-bold block">लिंग / Gender</span>
                                            <span className="font-bold text-[10px] uppercase">{formData.gender}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Aadhaar Number Bar */}
                                <div className="p-2 pt-1 text-center">
                                    <div className="font-mono font-black text-base tracking-widest text-slate-900 border-b border-slate-200 pb-1">
                                        {formData.aadhar_no || 'XXXX XXXX XXXX'}
                                    </div>
                                </div>

                                {/* Red Bottom Strip */}
                                <div className="bg-red-700 text-white text-center py-1 font-bold text-[9px] tracking-wider">
                                    आधार - आम आदमी का अधिकार
                                </div>
                            </div>

                            {/* BACK CARD */}
                            <div className="w-full max-w-[380px] mx-auto bg-white rounded-2xl border-2 border-slate-300 dark:border-slate-700 shadow-xl overflow-hidden text-slate-900 text-[10px] leading-tight relative select-none">
                                {/* Top Header */}
                                <div className="p-2 border-b border-slate-100 flex items-center justify-between text-[9px] font-bold text-slate-700">
                                    <span>भारतीय विशिष्ट पहचान प्राधिकरण</span>
                                    <span>UIDAI</span>
                                </div>

                                {/* Body with Address & QR */}
                                <div className="p-3 flex gap-3 items-start">
                                    {/* Address text */}
                                    <div className="flex-1 space-y-1 text-[9px]">
                                        <div>
                                            <span className="font-bold text-slate-500 block text-[8px]">पता:</span>
                                            <div className="font-semibold text-slate-900 leading-snug">
                                                {formData.care_of_name_local && `${formData.care_of_type}: ${formData.care_of_name_local}, `}
                                                {formData.address_local}
                                            </div>
                                        </div>

                                        <div className="pt-1">
                                            <span className="font-bold text-slate-500 block text-[8px]">Address:</span>
                                            <div className="font-semibold text-slate-800 leading-snug">
                                                {formData.care_of_name_en && `${formData.care_of_type}: ${formData.care_of_name_en}, `}
                                                {formData.address_en}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Large QR Code representation */}
                                    <div className="w-20 h-20 bg-slate-900 p-1 rounded-md shrink-0 flex items-center justify-center">
                                        <div className="w-full h-full bg-white flex items-center justify-center">
                                            <span className="material-symbols-outlined text-5xl text-slate-900">qr_code_2</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Aadhaar Number */}
                                <div className="p-2 pt-0 text-center">
                                    <div className="font-mono font-black text-sm tracking-widest text-slate-900 border-b border-slate-200 pb-1">
                                        {formData.aadhar_no || 'XXXX XXXX XXXX'}
                                    </div>
                                </div>

                                {/* Helpline Footer */}
                                <div className="bg-slate-100 text-slate-600 text-center py-1 font-bold text-[8px] flex items-center justify-center gap-4">
                                    <span>📞 1947</span>
                                    <span>✉ help@uidai.gov.in</span>
                                    <span>🌐 www.uidai.gov.in</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
