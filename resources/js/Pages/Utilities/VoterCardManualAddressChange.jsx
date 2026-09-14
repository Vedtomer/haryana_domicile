import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import axios from 'axios';

export default function VoterCardManualAddressChange() {
    const [formData, setFormData] = useState({
        epic_no: 'TKN1234567',
        name_en: 'SUNITA DEVI',
        name_hi: 'सुनीता देवी',
        relation_type: 'Husband',
        relation_name_en: 'SURENDER KUMAR',
        relation_name_hi: 'सुरेंद्र कुमार',
        gender: 'Female',
        dob: '20/04/1988',
        old_address: 'H.No. 12, Old Ward 2, Panipat, Haryana - 132103',
        new_house_no: 'Flat No. 302, Royal Residency',
        new_street_area: 'Sector 12, Urban Estate',
        new_village_town: 'Karnal',
        new_post_office: 'Karnal GPO',
        new_pincode: '132001',
        new_district: 'Karnal',
        new_state: 'Haryana',
        new_ac_no_name: 'Karnal (AC 21)',
        new_part_no: '52 - Community Hall',
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
            const response = await axios.post('/utilities/voter-card-manual-address-change/generate', formData);
            if (response.data.success) {
                setResult(response.data);
            } else {
                setError(response.data.message || 'Failed to generate updated Voter Card.');
            }
        } catch (err) {
            console.error('Voter Address Change Error:', err);
            setError(err.response?.data?.message || 'Error occurred while generating card.');
        } finally {
            setLoading(false);
        }
    };

    const fullNewAddress = `${formData.new_house_no}, ${formData.new_street_area}, ${formData.new_village_town}, PO: ${formData.new_post_office}, Distt: ${formData.new_district}, ${formData.new_state} - ${formData.new_pincode}`;

    return (
        <AdminLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 text-xs font-extrabold uppercase tracking-wider rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                                Address Modification
                            </span>
                            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                Active
                            </span>
                        </div>
                        <h1 className="text-xl sm:text-2xl font-black text-gray-800 dark:text-white leading-tight mt-1">
                            Voter Card Manual For Address Change
                        </h1>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 mt-0.5">
                            Update assembly, residence address, and print shifted/corrected Voter Card (EPIC)
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => window.print()}
                        className="px-4 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-md transition-all cursor-pointer shrink-0"
                    >
                        <span className="material-symbols-outlined text-lg">print</span>
                        Print Updated Card & Slip
                    </button>
                </div>
            }
        >
            <Head title="Voter Card Manual For Address Change" />

            <div className="max-w-6xl mx-auto mt-6 px-4 pb-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Form: 7 cols */}
                    <div className="lg:col-span-7 space-y-6">
                        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-800 p-6 sm:p-7">
                            <div className="flex items-center gap-3 pb-4 mb-5 border-b border-slate-100 dark:border-slate-800">
                                <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-2xl">edit_location_alt</span>
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-slate-800 dark:text-white">Address Modification Details</h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Shift or correct address on voter card</p>
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
                                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl font-mono font-bold text-base uppercase text-amber-700 dark:text-amber-300"
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
                                            <option value="Husband">Husband / पति</option>
                                            <option value="Father">Father / पिता</option>
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
                                            Gender
                                        </label>
                                        <select
                                            name="gender"
                                            value={formData.gender}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold dark:text-white"
                                        >
                                            <option value="Female">Female / महिला</option>
                                            <option value="Male">Male / पुरुष</option>
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

                                {/* Previous Address for Shifting Context */}
                                <div className="bg-amber-50/60 dark:bg-amber-950/20 p-3 rounded-xl border border-amber-200 dark:border-amber-800/40">
                                    <label className="block font-bold text-amber-800 dark:text-amber-300 uppercase mb-1">
                                        Previous / Old Address (Before Change)
                                    </label>
                                    <input
                                        type="text"
                                        name="old_address"
                                        value={formData.old_address}
                                        onChange={handleChange}
                                        placeholder="Enter previous address on card"
                                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800 rounded-lg font-medium dark:text-white"
                                    />
                                </div>

                                {/* New Updated Address Form */}
                                <div className="space-y-3 pt-1">
                                    <h4 className="font-black text-slate-800 dark:text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                                        <span className="material-symbols-outlined text-sm text-amber-600">home</span>
                                        New Address Details (To be printed on card)
                                    </h4>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div>
                                            <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                                                New House / Flat / Door No *
                                            </label>
                                            <input
                                                type="text"
                                                name="new_house_no"
                                                value={formData.new_house_no}
                                                onChange={handleChange}
                                                required
                                                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold dark:text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                                                Street / Area / Locality
                                            </label>
                                            <input
                                                type="text"
                                                name="new_street_area"
                                                value={formData.new_street_area}
                                                onChange={handleChange}
                                                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold dark:text-white"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        <div>
                                            <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                                                Village / Town / City
                                            </label>
                                            <input
                                                type="text"
                                                name="new_village_town"
                                                value={formData.new_village_town}
                                                onChange={handleChange}
                                                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold dark:text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                                                Post Office
                                            </label>
                                            <input
                                                type="text"
                                                name="new_post_office"
                                                value={formData.new_post_office}
                                                onChange={handleChange}
                                                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold dark:text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                                                Pin Code *
                                            </label>
                                            <input
                                                type="text"
                                                name="new_pincode"
                                                value={formData.new_pincode}
                                                onChange={handleChange}
                                                required
                                                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold dark:text-white"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div>
                                            <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                                                District *
                                            </label>
                                            <input
                                                type="text"
                                                name="new_district"
                                                value={formData.new_district}
                                                onChange={handleChange}
                                                required
                                                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold dark:text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                                                State *
                                            </label>
                                            <input
                                                type="text"
                                                name="new_state"
                                                value={formData.new_state}
                                                onChange={handleChange}
                                                required
                                                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold dark:text-white"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div>
                                            <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                                                New Assembly (AC Name / No)
                                            </label>
                                            <input
                                                type="text"
                                                name="new_ac_no_name"
                                                value={formData.new_ac_no_name}
                                                onChange={handleChange}
                                                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold dark:text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                                                New Polling Station / Part
                                            </label>
                                            <input
                                                type="text"
                                                name="new_part_no"
                                                value={formData.new_part_no}
                                                onChange={handleChange}
                                                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold dark:text-white"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Photo & Signature */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                                    <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                                        <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                                            Voter Photo
                                        </label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handlePhotoChange}
                                            className="text-[11px] text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-amber-100 file:text-amber-700 hover:file:bg-amber-200"
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
                                            className="text-[11px] text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-amber-100 file:text-amber-700 hover:file:bg-amber-200"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3.5 px-5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-black text-sm rounded-xl shadow-lg shadow-amber-600/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mt-4"
                                >
                                    {loading ? 'Processing Address Update...' : 'Save & Generate Address Changed Card'}
                                </button>
                            </form>

                            {error && (
                                <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300 text-xs">
                                    {error}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: Live Preview: 5 cols */}
                    <div className="lg:col-span-5 space-y-6">
                        <div className="sticky top-6 space-y-5">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider">
                                    Updated Card Preview
                                </h3>
                                <span className="text-[11px] font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded-full flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                                    Address Shifted
                                </span>
                            </div>

                            {/* FRONT CARD */}
                            <div className="w-full max-w-[380px] mx-auto bg-gradient-to-b from-amber-50 via-white to-amber-50/80 rounded-2xl border-2 border-slate-300 dark:border-slate-700 shadow-xl overflow-hidden text-slate-900 text-[10px] leading-tight p-3 relative select-none">
                                <div className="text-center border-b border-slate-300 pb-1.5 mb-2">
                                    <div className="text-[9px] font-extrabold text-red-700 tracking-wider">
                                        भारत निर्वाचन आयोग
                                    </div>
                                    <div className="text-[9px] font-black tracking-widest text-slate-800 uppercase">
                                        ELECTION COMMISSION OF INDIA
                                    </div>
                                </div>

                                <div className="text-center bg-slate-900 text-white py-1 px-2 rounded-md font-mono font-black text-xs tracking-widest mb-2.5 flex items-center justify-between px-3">
                                    <span>{formData.epic_no || 'EPIC NUMBER'}</span>
                                    <span className="text-[9px] font-sans font-bold bg-amber-500 text-slate-950 px-1.5 py-0.2 rounded">
                                        MODIFIED
                                    </span>
                                </div>

                                <div className="flex gap-2.5 items-start">
                                    <div className="w-20 h-24 bg-slate-200 border border-slate-400 rounded-md overflow-hidden shrink-0 flex items-center justify-center">
                                        {photoPreview ? (
                                            <img src={photoPreview} alt="Voter" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="material-symbols-outlined text-4xl text-slate-400">person</span>
                                        )}
                                    </div>

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

                            {/* BACK CARD WITH UPDATED ADDRESS */}
                            <div className="w-full max-w-[380px] mx-auto bg-gradient-to-b from-amber-50 via-white to-amber-50/80 rounded-2xl border-2 border-slate-300 dark:border-slate-700 shadow-xl overflow-hidden text-slate-900 text-[10px] leading-tight p-3 relative select-none">
                                <div className="flex gap-2 items-start mb-2">
                                    <div className="w-16 h-16 bg-slate-900 p-1 rounded-md shrink-0 flex items-center justify-center">
                                        <div className="w-full h-full bg-white flex items-center justify-center p-0.5">
                                            <span className="material-symbols-outlined text-3xl text-slate-900">qr_code_2</span>
                                        </div>
                                    </div>

                                    <div className="flex-1 space-y-0.5">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[8px] text-slate-500 font-bold block">नया पता / New Address</span>
                                            <span className="text-[8px] font-bold text-emerald-600 bg-emerald-50 px-1 rounded">
                                                Verified Shift
                                            </span>
                                        </div>
                                        <div className="font-bold text-[9px] text-slate-900 leading-snug">
                                            {fullNewAddress}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-1 border-t border-slate-200 pt-1.5 text-[9px]">
                                    <div>
                                        <span className="text-slate-500 font-bold">नया निर्वाचन क्षेत्र / Assembly: </span>
                                        <span className="font-bold text-amber-900">{formData.new_ac_no_name}</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-500 font-bold">नया भाग / New Part: </span>
                                        <span className="font-bold">{formData.new_part_no}</span>
                                    </div>
                                </div>

                                <div className="mt-3 pt-1 border-t border-slate-300 flex justify-between items-end text-[8px] text-slate-500">
                                    <span>Date of Shift: {new Date().toLocaleDateString('en-GB')}</span>
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
