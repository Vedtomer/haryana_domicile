import React, { useState, useRef } from 'react';
import { Link, useForm } from '@inertiajs/react';

const ACCENT_COLORS = [
    { label: 'Navy Blue', value: '#1e3a8a' },
    { label: 'Charcoal', value: '#1f2937' },
    { label: 'Emerald', value: '#047857' },
    { label: 'Maroon', value: '#881337' },
    { label: 'Royal Purple', value: '#581c87' },
];

const TEMPLATE_STYLES = [
    { id: 'modern', label: 'Modern Professional (Sidebar Layout)', desc: 'Side column for photo & contact, clean content layout' },
    { id: 'classic', label: 'Classic Corporate (Header Layout)', desc: 'Traditional corporate resume with top header & divider lines' },
    { id: 'executive', label: 'Clean Executive (Minimalist)', desc: 'Contemporary high-contrast typography, great for all jobs' },
];

export default function ResumeBuilderForm({ resume = null, coinCost = 20, isEdit = false }) {
    const isNew = !isEdit;
    const photoInputRef = useRef(null);

    // Initial values
    const [photoPreview, setPhotoPreview] = useState(resume?.photo_url || null);

    const todayDate = () => {
        const d = new Date();
        return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
    };

    const initialValues = {
        title: resume?.title || 'Professional Resume',
        full_name: resume?.full_name || (isNew ? 'Rahul Kumar' : ''),
        father_name: resume?.father_name || (isNew ? 'Shri Ramesh Kumar' : ''),
        mother_name: resume?.mother_name || '',
        dob: resume?.dob || (isNew ? '15/08/1998' : ''),
        gender: resume?.gender || 'Male',
        marital_status: resume?.marital_status || 'Single',
        nationality: resume?.nationality || 'Indian',
        email: resume?.email || (isNew ? 'rahul.kumar@gmail.com' : ''),
        phone: resume?.phone || (isNew ? '9876543210' : ''),
        address: resume?.address || (isNew ? 'VPO - Bass, Tehsil - Hansi, District - Hisar, Haryana - 125042' : ''),
        photo: null,
        remove_photo: false,
        career_objective: resume?.career_objective || (isNew ? 'Seeking a challenging position in a reputable organization to expand my learning, knowledge, and skills while contributing to the organizational growth.' : ''),
        education: resume?.education || (isNew ? [
            { degree: 'Graduation (B.A)', school_college: 'Govt. College Hisar', board_university: 'KUK University', passing_year: '2020', percentage_cgpa: '68%' },
            { degree: '12th (Senior Secondary)', school_college: 'Govt. Sr. Sec. School', board_university: 'HBSE Board', passing_year: '2017', percentage_cgpa: '74%' },
            { degree: '10th (Matriculation)', school_college: 'Govt. High School', board_university: 'HBSE Board', passing_year: '2015', percentage_cgpa: '78%' }
        ] : []),
        experience: resume?.experience || (isNew ? [
            { designation: 'Computer Operator / Office Assistant', company: 'Digital Seva Kendra, Hisar', duration: '2021 - Present', description: 'Handling online citizen services, documentation, Excel reporting, and customer correspondence.' }
        ] : []),
        skills: resume?.skills || (isNew ? ['Basic Computer (MS Office, Word, Excel)', 'Internet & Online Form Applications', 'Hindi & English Typing', 'Customer Communication', 'Documentation & Filing'] : []),
        languages: resume?.languages || (isNew ? ['Hindi', 'English'] : ['Hindi', 'English']),
        hobbies: resume?.hobbies || (isNew ? ['Reading', 'Playing Cricket', 'Learning New Tech'] : []),
        declaration: resume?.declaration || 'I hereby declare that all the information provided above is true and correct to the best of my knowledge and belief.',
        place: resume?.place || (isNew ? 'Hisar' : ''),
        date: resume?.date || todayDate(),
        template_style: resume?.template_style || 'modern',
        accent_color: resume?.accent_color || '#1e3a8a',
    };

    const { data, setData, post, processing, errors } = useForm(initialValues);

    const handlePhotoChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setData('photo', file);
        setData('remove_photo', false);
        setPhotoPreview(URL.createObjectURL(file));
    };

    const handleRemovePhoto = () => {
        setData('photo', null);
        setData('remove_photo', true);
        setPhotoPreview(null);
        if (photoInputRef.current) photoInputRef.current.value = '';
    };

    // Education handlers
    const addEducation = () => {
        setData('education', [
            ...data.education,
            { degree: '', school_college: '', board_university: '', passing_year: '', percentage_cgpa: '' },
        ]);
    };

    const updateEducation = (idx, key, val) => {
        const updated = [...data.education];
        updated[idx][key] = val;
        setData('education', updated);
    };

    const removeEducation = (idx) => {
        setData('education', data.education.filter((_, i) => i !== idx));
    };

    // Experience handlers
    const addExperience = () => {
        setData('experience', [
            ...data.experience,
            { designation: '', company: '', duration: '', description: '' },
        ]);
    };

    const updateExperience = (idx, key, val) => {
        const updated = [...data.experience];
        updated[idx][key] = val;
        setData('experience', updated);
    };

    const removeExperience = (idx) => {
        setData('experience', data.experience.filter((_, i) => i !== idx));
    };

    // Skills, Languages, Hobbies handlers
    const [skillInput, setSkillInput] = useState('');
    const addSkill = () => {
        if (!skillInput.trim()) return;
        setData('skills', [...data.skills, skillInput.trim()]);
        setSkillInput('');
    };

    const removeSkill = (idx) => {
        setData('skills', data.skills.filter((_, i) => i !== idx));
    };

    const [langInput, setLangInput] = useState('');
    const addLanguage = () => {
        if (!langInput.trim()) return;
        setData('languages', [...data.languages, langInput.trim()]);
        setLangInput('');
    };

    const removeLanguage = (idx) => {
        setData('languages', data.languages.filter((_, i) => i !== idx));
    };

    const [hobbyInput, setHobbyInput] = useState('');
    const addHobby = () => {
        if (!hobbyInput.trim()) return;
        setData('hobbies', [...data.hobbies, hobbyInput.trim()]);
        setHobbyInput('');
    };

    const removeHobby = (idx) => {
        setData('hobbies', data.hobbies.filter((_, i) => i !== idx));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isEdit) {
            post(`/admin/resume-maker/${resume.id}`, { forceFormData: true });
        } else {
            post('/admin/resume-maker', { forceFormData: true });
        }
    };

    const inputClass = "w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all";
    const labelClass = "block text-xs font-bold text-slate-700 mb-1";

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Top Toolbar: Style & Color Picker */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    <div>
                        <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1">
                            Template Style
                        </label>
                        <select
                            value={data.template_style}
                            onChange={(e) => setData('template_style', e.target.value)}
                            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {TEMPLATE_STYLES.map((t) => (
                                <option key={t.id} value={t.id}>{t.label}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1">
                            Theme Accent Color
                        </label>
                        <div className="flex items-center gap-1.5">
                            {ACCENT_COLORS.map((c) => (
                                <button
                                    key={c.value}
                                    type="button"
                                    onClick={() => setData('accent_color', c.value)}
                                    className={`w-7 h-7 rounded-full transition-transform flex items-center justify-center ${
                                        data.accent_color === c.value ? 'scale-110 ring-2 ring-offset-2 ring-slate-900' : 'hover:scale-105'
                                    }`}
                                    style={{ backgroundColor: c.value }}
                                    title={c.label}
                                >
                                    {data.accent_color === c.value && (
                                        <span className="material-symbols-outlined text-white text-xs">check</span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                    <Link
                        href="/admin/resume-maker"
                        className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                    >
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        disabled={processing}
                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50"
                    >
                        <span className="material-symbols-outlined text-base">print</span>
                        {processing ? 'Saving...' : isEdit ? 'Save Changes' : `Save & Print (${coinCost} Coins)`}
                    </button>
                </div>
            </div>

            {/* Split Screen Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Side: Form Inputs (7 cols) */}
                <div className="lg:col-span-7 space-y-6">
                    {/* 1. Personal Information */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                            <span className="material-symbols-outlined text-blue-600 text-xl">person</span>
                            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                                1. Personal Information
                            </h2>
                        </div>

                        {/* Photo Upload & Preview */}
                        <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl border border-slate-200">
                            <div className="w-20 h-24 rounded-lg bg-white border-2 border-dashed border-slate-300 overflow-hidden flex items-center justify-center flex-shrink-0 relative group">
                                {photoPreview ? (
                                    <img src={photoPreview} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="text-center p-1 text-slate-400">
                                        <span className="material-symbols-outlined text-3xl">photo_camera</span>
                                        <p className="text-[10px] leading-tight mt-0.5">Passport Photo</p>
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-col gap-2">
                                <input
                                    ref={photoInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handlePhotoChange}
                                />
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => photoInputRef.current?.click()}
                                        className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors"
                                    >
                                        {photoPreview ? 'Change Photo' : 'Upload Photo'}
                                    </button>
                                    {photoPreview && (
                                        <button
                                            type="button"
                                            onClick={handleRemovePhoto}
                                            className="px-3 py-1.5 bg-rose-50 text-rose-600 rounded-lg text-xs font-bold hover:bg-rose-100 transition-colors"
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>
                                <p className="text-[11px] text-slate-400">Passport photo (Optional). High resolution JPG or PNG.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                            <div>
                                <label className={labelClass}>Full Name *</label>
                                <input
                                    type="text"
                                    required
                                    className={inputClass}
                                    value={data.full_name}
                                    onChange={(e) => setData('full_name', e.target.value)}
                                    placeholder="e.g. Rahul Kumar"
                                />
                                {errors.full_name && <p className="text-xs text-rose-600 mt-1">{errors.full_name}</p>}
                            </div>

                            <div>
                                <label className={labelClass}>Father's Name</label>
                                <input
                                    type="text"
                                    className={inputClass}
                                    value={data.father_name}
                                    onChange={(e) => setData('father_name', e.target.value)}
                                    placeholder="e.g. Shri Ramesh Kumar"
                                />
                            </div>

                            <div>
                                <label className={labelClass}>Mobile Number *</label>
                                <input
                                    type="text"
                                    required
                                    className={inputClass}
                                    value={data.phone}
                                    onChange={(e) => setData('phone', e.target.value)}
                                    placeholder="e.g. 9876543210"
                                />
                                {errors.phone && <p className="text-xs text-rose-600 mt-1">{errors.phone}</p>}
                            </div>

                            <div>
                                <label className={labelClass}>Email Address</label>
                                <input
                                    type="email"
                                    className={inputClass}
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="e.g. rahul.kumar@gmail.com"
                                />
                            </div>

                            <div>
                                <label className={labelClass}>Date of Birth (DOB)</label>
                                <input
                                    type="text"
                                    className={inputClass}
                                    value={data.dob}
                                    onChange={(e) => setData('dob', e.target.value)}
                                    placeholder="DD/MM/YYYY"
                                />
                            </div>

                            <div>
                                <label className={labelClass}>Gender</label>
                                <select
                                    className={inputClass}
                                    value={data.gender}
                                    onChange={(e) => setData('gender', e.target.value)}
                                >
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <div>
                                <label className={labelClass}>Marital Status</label>
                                <select
                                    className={inputClass}
                                    value={data.marital_status}
                                    onChange={(e) => setData('marital_status', e.target.value)}
                                >
                                    <option value="Single">Single (अविवाहित)</option>
                                    <option value="Married">Married (विवाहित)</option>
                                </select>
                            </div>

                            <div>
                                <label className={labelClass}>Nationality</label>
                                <input
                                    type="text"
                                    className={inputClass}
                                    value={data.nationality}
                                    onChange={(e) => setData('nationality', e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label className={labelClass}>Full Permanent Address</label>
                            <textarea
                                rows={2}
                                className={inputClass}
                                value={data.address}
                                onChange={(e) => setData('address', e.target.value)}
                                placeholder="House No, Village/Ward, Tehsil, District, State, PIN"
                            />
                        </div>
                    </div>

                    {/* 2. Career Objective */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                            <span className="material-symbols-outlined text-blue-600 text-xl">flag</span>
                            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                                2. Career Objective / Profile Summary
                            </h2>
                        </div>
                        <textarea
                            rows={3}
                            className={inputClass}
                            value={data.career_objective}
                            onChange={(e) => setData('career_objective', e.target.value)}
                            placeholder="Write brief career objective..."
                        />
                    </div>

                    {/* 3. Education Qualifications */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-blue-600 text-xl">school</span>
                                <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                                    3. Education Qualifications
                                </h2>
                            </div>
                            <button
                                type="button"
                                onClick={addEducation}
                                className="px-3 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-xs font-bold inline-flex items-center gap-1 transition-colors"
                            >
                                <span className="material-symbols-outlined text-sm">add</span>
                                Add Qualification
                            </button>
                        </div>

                        <div className="space-y-3">
                            {data.education.map((edu, idx) => (
                                <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 relative">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[11px] font-bold text-slate-500 uppercase">
                                            Qualification #{idx + 1}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => removeEducation(idx)}
                                            className="text-rose-500 hover:text-rose-700 text-xs font-bold inline-flex items-center gap-0.5"
                                        >
                                            <span className="material-symbols-outlined text-sm">close</span>
                                            Remove
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        <input
                                            type="text"
                                            className={inputClass}
                                            placeholder="Degree / Course (e.g. 10th / B.A)"
                                            value={edu.degree}
                                            onChange={(e) => updateEducation(idx, 'degree', e.target.value)}
                                        />
                                        <input
                                            type="text"
                                            className={inputClass}
                                            placeholder="School / College / Institute"
                                            value={edu.school_college}
                                            onChange={(e) => updateEducation(idx, 'school_college', e.target.value)}
                                        />
                                        <input
                                            type="text"
                                            className={inputClass}
                                            placeholder="Board / University (e.g. HBSE / CBSE / KUK)"
                                            value={edu.board_university}
                                            onChange={(e) => updateEducation(idx, 'board_university', e.target.value)}
                                        />
                                        <div className="grid grid-cols-2 gap-2">
                                            <input
                                                type="text"
                                                className={inputClass}
                                                placeholder="Passing Year"
                                                value={edu.passing_year}
                                                onChange={(e) => updateEducation(idx, 'passing_year', e.target.value)}
                                            />
                                            <input
                                                type="text"
                                                className={inputClass}
                                                placeholder="% or CGPA"
                                                value={edu.percentage_cgpa}
                                                onChange={(e) => updateEducation(idx, 'percentage_cgpa', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 4. Work Experience */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-blue-600 text-xl">work</span>
                                <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                                    4. Work Experience (Optional / Fresher)
                                </h2>
                            </div>
                            <button
                                type="button"
                                onClick={addExperience}
                                className="px-3 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-xs font-bold inline-flex items-center gap-1 transition-colors"
                            >
                                <span className="material-symbols-outlined text-sm">add</span>
                                Add Experience
                            </button>
                        </div>

                        {data.experience.length === 0 ? (
                            <p className="text-xs text-slate-400 italic">No experience added (Fresher).</p>
                        ) : (
                            <div className="space-y-3">
                                {data.experience.map((exp, idx) => (
                                    <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[11px] font-bold text-slate-500 uppercase">
                                                Experience #{idx + 1}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => removeExperience(idx)}
                                                className="text-rose-500 hover:text-rose-700 text-xs font-bold inline-flex items-center gap-0.5"
                                            >
                                                <span className="material-symbols-outlined text-sm">close</span>
                                                Remove
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                            <input
                                                type="text"
                                                className={inputClass}
                                                placeholder="Job Title / Role (e.g. Sales Executive)"
                                                value={exp.designation}
                                                onChange={(e) => updateExperience(idx, 'designation', e.target.value)}
                                            />
                                            <input
                                                type="text"
                                                className={inputClass}
                                                placeholder="Company / Organization Name"
                                                value={exp.company}
                                                onChange={(e) => updateExperience(idx, 'company', e.target.value)}
                                            />
                                        </div>
                                        <input
                                            type="text"
                                            className={inputClass}
                                            placeholder="Duration (e.g. 2021 - 2023 or 2 Years)"
                                            value={exp.duration}
                                            onChange={(e) => updateExperience(idx, 'duration', e.target.value)}
                                        />
                                        <textarea
                                            rows={2}
                                            className={inputClass}
                                            placeholder="Brief Job Responsibilities / Key Achievements"
                                            value={exp.description}
                                            onChange={(e) => updateExperience(idx, 'description', e.target.value)}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* 5. Key Skills, Languages & Hobbies */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                            <span className="material-symbols-outlined text-blue-600 text-xl">psychology</span>
                            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                                5. Skills, Languages & Hobbies
                            </h2>
                        </div>

                        {/* Skills */}
                        <div>
                            <label className={labelClass}>Key Skills</label>
                            <div className="flex gap-2 mb-2">
                                <input
                                    type="text"
                                    className={inputClass}
                                    placeholder="Type skill & press Add (e.g. MS Excel)"
                                    value={skillInput}
                                    onChange={(e) => setSkillInput(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
                                />
                                <button
                                    type="button"
                                    onClick={addSkill}
                                    className="px-3 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-900"
                                >
                                    Add
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                                {data.skills.map((s, idx) => (
                                    <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold border border-slate-200">
                                        {s}
                                        <button type="button" onClick={() => removeSkill(idx)} className="text-slate-400 hover:text-rose-600">×</button>
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Languages */}
                        <div>
                            <label className={labelClass}>Languages Known</label>
                            <div className="flex gap-2 mb-2">
                                <input
                                    type="text"
                                    className={inputClass}
                                    placeholder="Type language & press Add (e.g. Hindi, English)"
                                    value={langInput}
                                    onChange={(e) => setLangInput(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addLanguage(); } }}
                                />
                                <button
                                    type="button"
                                    onClick={addLanguage}
                                    className="px-3 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-900"
                                >
                                    Add
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                                {data.languages.map((l, idx) => (
                                    <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold border border-indigo-200">
                                        {l}
                                        <button type="button" onClick={() => removeLanguage(idx)} className="text-indigo-400 hover:text-rose-600">×</button>
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Hobbies */}
                        <div>
                            <label className={labelClass}>Hobbies & Interests</label>
                            <div className="flex gap-2 mb-2">
                                <input
                                    type="text"
                                    className={inputClass}
                                    placeholder="Type hobby & press Add (e.g. Reading, Cricket)"
                                    value={hobbyInput}
                                    onChange={(e) => setHobbyInput(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addHobby(); } }}
                                />
                                <button
                                    type="button"
                                    onClick={addHobby}
                                    className="px-3 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-900"
                                >
                                    Add
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                                {data.hobbies.map((h, idx) => (
                                    <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-700 rounded-lg text-xs font-bold border border-amber-200">
                                        {h}
                                        <button type="button" onClick={() => removeHobby(idx)} className="text-amber-400 hover:text-rose-600">×</button>
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* 6. Declaration, Place & Date */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                            <span className="material-symbols-outlined text-blue-600 text-xl">verified</span>
                            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                                6. Declaration & Signature
                            </h2>
                        </div>
                        <div>
                            <label className={labelClass}>Declaration Statement</label>
                            <textarea
                                rows={2}
                                className={inputClass}
                                value={data.declaration}
                                onChange={(e) => setData('declaration', e.target.value)}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3.5">
                            <div>
                                <label className={labelClass}>Place</label>
                                <input
                                    type="text"
                                    className={inputClass}
                                    value={data.place}
                                    onChange={(e) => setData('place', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className={labelClass}>Date</label>
                                <input
                                    type="text"
                                    className={inputClass}
                                    value={data.date}
                                    onChange={(e) => setData('date', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side: Real-time Live A4 Preview (5 cols) */}
                <div className="lg:col-span-5">
                    <div className="sticky top-6">
                        <div className="bg-slate-900 text-white px-4 py-2.5 rounded-t-2xl flex items-center justify-between text-xs font-bold">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-sm text-emerald-400">preview</span>
                                Real-Time A4 Print Preview
                            </div>
                            <span className="text-[11px] text-slate-400">Auto-updates live</span>
                        </div>

                        {/* Resume Paper Container (Scaled down for live preview) */}
                        <div className="bg-slate-200 p-2 sm:p-4 rounded-b-2xl border border-slate-300 max-h-[85vh] overflow-y-auto shadow-inner">
                            <div
                                className="bg-white mx-auto shadow-xl text-slate-900 text-[10px] leading-tight select-none pointer-events-none origin-top transition-all"
                                style={{
                                    width: '100%',
                                    maxWidth: '210mm',
                                    minHeight: '280mm',
                                    padding: data.template_style === 'modern' ? '0' : '15mm',
                                    fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
                                }}
                            >
                                {data.template_style === 'modern' ? (
                                    /* Modern Layout with Sidebar */
                                    <div className="grid grid-cols-12 min-h-[280mm]">
                                        {/* Left Col (4 cols) */}
                                        <div
                                            className="col-span-4 p-4 text-white space-y-4"
                                            style={{ backgroundColor: data.accent_color }}
                                        >
                                            {/* Photo */}
                                            {photoPreview && (
                                                <div className="w-24 h-28 mx-auto rounded-lg overflow-hidden border-2 border-white/60 shadow">
                                                    <img src={photoPreview} alt="" className="w-full h-full object-cover" />
                                                </div>
                                            )}

                                            <div>
                                                <h1 className="text-base font-black tracking-tight">{data.full_name || 'Your Name'}</h1>
                                                <p className="text-[9px] text-white/80">{data.title || 'Professional Resume'}</p>
                                            </div>

                                            {/* Contact */}
                                            <div className="space-y-1.5 pt-2 border-t border-white/20">
                                                <p className="font-bold uppercase tracking-wider text-[8px] text-white/70">Contact</p>
                                                {data.phone && <p>📞 {data.phone}</p>}
                                                {data.email && <p className="break-all">✉️ {data.email}</p>}
                                                {data.address && <p>📍 {data.address}</p>}
                                            </div>

                                            {/* Personal Details */}
                                            <div className="space-y-1.5 pt-2 border-t border-white/20">
                                                <p className="font-bold uppercase tracking-wider text-[8px] text-white/70">Personal</p>
                                                {data.father_name && <p>Father: {data.father_name}</p>}
                                                {data.dob && <p>DOB: {data.dob}</p>}
                                                {data.gender && <p>Gender: {data.gender}</p>}
                                                {data.marital_status && <p>Status: {data.marital_status}</p>}
                                                {data.nationality && <p>Nationality: {data.nationality}</p>}
                                            </div>

                                            {/* Skills */}
                                            {data.skills?.length > 0 && (
                                                <div className="space-y-1 pt-2 border-t border-white/20">
                                                    <p className="font-bold uppercase tracking-wider text-[8px] text-white/70">Skills</p>
                                                    <ul className="list-disc list-inside space-y-0.5">
                                                        {data.skills.map((s, i) => (
                                                            <li key={i}>{s}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}

                                            {/* Languages */}
                                            {data.languages?.length > 0 && (
                                                <div className="space-y-1 pt-2 border-t border-white/20">
                                                    <p className="font-bold uppercase tracking-wider text-[8px] text-white/70">Languages</p>
                                                    <p>{data.languages.join(', ')}</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Right Main Col (8 cols) */}
                                        <div className="col-span-8 p-5 space-y-4">
                                            {/* Career Objective */}
                                            {data.career_objective && (
                                                <div>
                                                    <h3
                                                        className="font-black text-xs uppercase tracking-wider pb-1 border-b mb-1.5"
                                                        style={{ color: data.accent_color, borderColor: data.accent_color }}
                                                    >
                                                        Career Objective
                                                    </h3>
                                                    <p className="text-slate-700 leading-relaxed text-[9.5px]">
                                                        {data.career_objective}
                                                    </p>
                                                </div>
                                            )}

                                            {/* Education */}
                                            {data.education?.length > 0 && (
                                                <div>
                                                    <h3
                                                        className="font-black text-xs uppercase tracking-wider pb-1 border-b mb-2"
                                                        style={{ color: data.accent_color, borderColor: data.accent_color }}
                                                    >
                                                        Educational Qualifications
                                                    </h3>
                                                    <table className="w-full text-left border-collapse border border-slate-300 text-[9px]">
                                                        <thead>
                                                            <tr className="bg-slate-100 text-slate-700">
                                                                <th className="border border-slate-300 p-1">Degree</th>
                                                                <th className="border border-slate-300 p-1">Institute/School</th>
                                                                <th className="border border-slate-300 p-1">Board/Univ</th>
                                                                <th className="border border-slate-300 p-1">Year</th>
                                                                <th className="border border-slate-300 p-1">%</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {data.education.map((e, idx) => (
                                                                <tr key={idx}>
                                                                    <td className="border border-slate-300 p-1 font-bold">{e.degree}</td>
                                                                    <td className="border border-slate-300 p-1">{e.school_college}</td>
                                                                    <td className="border border-slate-300 p-1">{e.board_university}</td>
                                                                    <td className="border border-slate-300 p-1">{e.passing_year}</td>
                                                                    <td className="border border-slate-300 p-1 font-bold">{e.percentage_cgpa}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            )}

                                            {/* Experience */}
                                            {data.experience?.length > 0 && (
                                                <div>
                                                    <h3
                                                        className="font-black text-xs uppercase tracking-wider pb-1 border-b mb-2"
                                                        style={{ color: data.accent_color, borderColor: data.accent_color }}
                                                    >
                                                        Work Experience
                                                    </h3>
                                                    <div className="space-y-2">
                                                        {data.experience.map((exp, idx) => (
                                                            <div key={idx}>
                                                                <div className="flex justify-between font-bold text-slate-800 text-[9.5px]">
                                                                    <span>{exp.designation}</span>
                                                                    <span className="text-slate-500 font-normal">{exp.duration}</span>
                                                                </div>
                                                                <p className="text-[9px] text-slate-600 font-medium">{exp.company}</p>
                                                                {exp.description && (
                                                                    <p className="text-[8.5px] text-slate-600 mt-0.5">{exp.description}</p>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Declaration */}
                                            {data.declaration && (
                                                <div className="pt-3 border-t border-slate-200 mt-6">
                                                    <h3
                                                        className="font-black text-[10px] uppercase tracking-wider mb-1"
                                                        style={{ color: data.accent_color }}
                                                    >
                                                        Declaration
                                                    </h3>
                                                    <p className="text-[8.5px] text-slate-600">{data.declaration}</p>
                                                    <div className="flex justify-between items-end mt-6 text-[9px]">
                                                        <div>
                                                            <p><b>Place:</b> {data.place}</p>
                                                            <p><b>Date:</b> {data.date}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="font-bold">({data.full_name})</p>
                                                            <p className="text-[8px] text-slate-400">Signature</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    /* Classic / Executive Top Header Layout */
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between pb-3 border-b-2" style={{ borderColor: data.accent_color }}>
                                            <div>
                                                <h1 className="text-xl font-black uppercase tracking-tight" style={{ color: data.accent_color }}>
                                                    {data.full_name || 'Your Name'}
                                                </h1>
                                                <p className="text-slate-600 text-[10px] mt-0.5">
                                                    {data.phone} • {data.email}
                                                </p>
                                                <p className="text-slate-500 text-[9px] mt-0.5">{data.address}</p>
                                            </div>
                                            {photoPreview && (
                                                <div className="w-20 h-24 rounded border overflow-hidden flex-shrink-0">
                                                    <img src={photoPreview} alt="" className="w-full h-full object-cover" />
                                                </div>
                                            )}
                                        </div>

                                        {data.career_objective && (
                                            <div>
                                                <h3 className="font-black text-[11px] uppercase tracking-wider pb-0.5 border-b" style={{ color: data.accent_color }}>
                                                    Career Objective
                                                </h3>
                                                <p className="text-slate-700 leading-relaxed text-[9.5px] mt-1">
                                                    {data.career_objective}
                                                </p>
                                            </div>
                                        )}

                                        {data.education?.length > 0 && (
                                            <div>
                                                <h3 className="font-black text-[11px] uppercase tracking-wider pb-0.5 border-b" style={{ color: data.accent_color }}>
                                                    Academic Record
                                                </h3>
                                                <table className="w-full text-left border-collapse border border-slate-300 text-[9px] mt-1.5">
                                                    <thead>
                                                        <tr className="bg-slate-100 text-slate-700">
                                                            <th className="border border-slate-300 p-1">Degree</th>
                                                            <th className="border border-slate-300 p-1">Institute/School</th>
                                                            <th className="border border-slate-300 p-1">Board/Univ</th>
                                                            <th className="border border-slate-300 p-1">Year</th>
                                                            <th className="border border-slate-300 p-1">%</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {data.education.map((e, idx) => (
                                                            <tr key={idx}>
                                                                <td className="border border-slate-300 p-1 font-bold">{e.degree}</td>
                                                                <td className="border border-slate-300 p-1">{e.school_college}</td>
                                                                <td className="border border-slate-300 p-1">{e.board_university}</td>
                                                                <td className="border border-slate-300 p-1">{e.passing_year}</td>
                                                                <td className="border border-slate-300 p-1 font-bold">{e.percentage_cgpa}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}

                                        {data.experience?.length > 0 && (
                                            <div>
                                                <h3 className="font-black text-[11px] uppercase tracking-wider pb-0.5 border-b" style={{ color: data.accent_color }}>
                                                    Work Experience
                                                </h3>
                                                <div className="space-y-1.5 mt-1">
                                                    {data.experience.map((exp, idx) => (
                                                        <div key={idx}>
                                                            <div className="flex justify-between font-bold text-slate-800 text-[9.5px]">
                                                                <span>{exp.designation} — {exp.company}</span>
                                                                <span className="text-slate-500 font-normal">{exp.duration}</span>
                                                            </div>
                                                            {exp.description && (
                                                                <p className="text-[9px] text-slate-600">{exp.description}</p>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Personal Bio-Data Details */}
                                        <div>
                                            <h3 className="font-black text-[11px] uppercase tracking-wider pb-0.5 border-b" style={{ color: data.accent_color }}>
                                                Personal Details
                                            </h3>
                                            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[9px] mt-1.5">
                                                {data.father_name && <p><b>Father's Name:</b> {data.father_name}</p>}
                                                {data.dob && <p><b>Date of Birth:</b> {data.dob}</p>}
                                                {data.gender && <p><b>Gender:</b> {data.gender}</p>}
                                                {data.marital_status && <p><b>Marital Status:</b> {data.marital_status}</p>}
                                                {data.nationality && <p><b>Nationality:</b> {data.nationality}</p>}
                                                {data.languages?.length > 0 && <p><b>Languages Known:</b> {data.languages.join(', ')}</p>}
                                            </div>
                                        </div>

                                        {data.declaration && (
                                            <div className="pt-2 border-t border-slate-200 mt-4">
                                                <p className="text-[8.5px] text-slate-600">{data.declaration}</p>
                                                <div className="flex justify-between items-end mt-6 text-[9px]">
                                                    <div>
                                                        <p><b>Place:</b> {data.place}</p>
                                                        <p><b>Date:</b> {data.date}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-bold">({data.full_name})</p>
                                                        <p className="text-[8px] text-slate-400">Signature</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    );
}
