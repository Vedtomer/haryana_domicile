import React, { useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';

export default function Print({ resume }) {
    const isDirect = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('direct') === '1';

    useEffect(() => {
        if (isDirect) {
            // Give layout a small tick to render completely
            setTimeout(() => {
                window.focus();
                window.print();
            }, 300);
        }
    }, [isDirect]);

    const handlePrint = () => {
        window.print();
    };

    const accentColor = resume.accent_color || '#1e3a8a';
    const isModern = (resume.template_style || 'modern') === 'modern';

    return (
        <div className="bg-slate-100 min-h-screen print:bg-white print:min-h-0">
            <Head title={`Resume - ${resume.full_name}`} />

            {/* Print Styling */}
            <style>{`
                @page {
                    size: A4 portrait;
                    margin: 0;
                }
                @media print {
                    html, body {
                        width: 210mm;
                        height: 297mm;
                        margin: 0 !important;
                        padding: 0 !important;
                        background: #ffffff !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    .no-print {
                        display: none !important;
                    }
                    .resume-a4-sheet {
                        width: 210mm !important;
                        min-height: 297mm !important;
                        max-height: 297mm !important;
                        margin: 0 !important;
                        box-shadow: none !important;
                        border: none !important;
                        page-break-after: avoid !important;
                        page-break-inside: avoid !important;
                        overflow: hidden !important;
                    }
                }
            `}</style>

            {/* Top Toolbar (Hidden when printing) */}
            {!isDirect && (
                <div className="no-print bg-slate-900 text-white px-4 py-3 sticky top-0 z-50 shadow-md">
                    <div className="max-w-4xl mx-auto flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Link
                                href="/admin/resume-maker"
                                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 transition-colors"
                            >
                                <span className="material-symbols-outlined text-sm">arrow_back</span>
                                Back to Resumes
                            </Link>
                            <span className="font-bold text-sm hidden sm:inline">{resume.full_name} — 1-Page A4 Resume</span>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={handlePrint}
                                className="px-5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1.5 shadow transition-all"
                            >
                                <span className="material-symbols-outlined text-sm">print</span>
                                Print Resume
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* A4 Resume Sheet */}
            <div className="py-6 print:py-0">
                <div
                    className="resume-a4-sheet bg-white mx-auto shadow-2xl text-slate-900 overflow-hidden"
                    style={{
                        width: '210mm',
                        minHeight: '297mm',
                        fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
                    }}
                >
                    {isModern ? (
                        /* Modern Professional Sidebar Layout */
                        <div className="grid grid-cols-12 min-h-[297mm]">
                            {/* Left Column (4 cols) */}
                            <div
                                className="col-span-4 p-6 text-white space-y-5"
                                style={{ backgroundColor: accentColor }}
                            >
                                {/* Photo */}
                                {resume.photo_url && (
                                    <div className="w-28 h-32 mx-auto rounded-xl overflow-hidden border-2 border-white/80 shadow-md">
                                        <img src={resume.photo_url} alt="" className="w-full h-full object-cover" />
                                    </div>
                                )}

                                <div>
                                    <h1 className="text-xl font-black tracking-tight leading-tight">{resume.full_name}</h1>
                                    <p className="text-xs text-white/80 mt-1 font-medium">{resume.title || 'Professional Resume'}</p>
                                </div>

                                {/* Contact Details */}
                                <div className="space-y-2 pt-3 border-t border-white/20 text-[11px] leading-relaxed">
                                    <p className="font-black uppercase tracking-wider text-[9px] text-white/70">Contact Info</p>
                                    <p className="flex items-start gap-1.5">
                                        <span className="opacity-80">📞</span>
                                        <span className="font-semibold">{resume.phone}</span>
                                    </p>
                                    {resume.email && (
                                        <p className="flex items-start gap-1.5 break-all">
                                            <span className="opacity-80">✉️</span>
                                            <span>{resume.email}</span>
                                        </p>
                                    )}
                                    {resume.address && (
                                        <p className="flex items-start gap-1.5">
                                            <span className="opacity-80">📍</span>
                                            <span>{resume.address}</span>
                                        </p>
                                    )}
                                </div>

                                {/* Personal Details */}
                                <div className="space-y-1.5 pt-3 border-t border-white/20 text-[11px] leading-relaxed">
                                    <p className="font-black uppercase tracking-wider text-[9px] text-white/70">Personal Details</p>
                                    {resume.father_name && <p><span className="opacity-75">Father:</span> {resume.father_name}</p>}
                                    {resume.dob && <p><span className="opacity-75">DOB:</span> {resume.dob}</p>}
                                    {resume.gender && <p><span className="opacity-75">Gender:</span> {resume.gender}</p>}
                                    {resume.marital_status && <p><span className="opacity-75">Status:</span> {resume.marital_status}</p>}
                                    {resume.nationality && <p><span className="opacity-75">Nationality:</span> {resume.nationality}</p>}
                                </div>

                                {/* Key Skills */}
                                {resume.skills?.length > 0 && (
                                    <div className="space-y-1.5 pt-3 border-t border-white/20 text-[11px]">
                                        <p className="font-black uppercase tracking-wider text-[9px] text-white/70">Key Skills</p>
                                        <ul className="list-disc list-inside space-y-1">
                                            {resume.skills.map((s, idx) => (
                                                <li key={idx} className="leading-snug">{s}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Languages */}
                                {resume.languages?.length > 0 && (
                                    <div className="space-y-1 pt-3 border-t border-white/20 text-[11px]">
                                        <p className="font-black uppercase tracking-wider text-[9px] text-white/70">Languages</p>
                                        <p>{resume.languages.join(', ')}</p>
                                    </div>
                                )}

                                {/* Hobbies */}
                                {resume.hobbies?.length > 0 && (
                                    <div className="space-y-1 pt-3 border-t border-white/20 text-[11px]">
                                        <p className="font-black uppercase tracking-wider text-[9px] text-white/70">Hobbies</p>
                                        <p>{resume.hobbies.join(', ')}</p>
                                    </div>
                                )}
                            </div>

                            {/* Right Main Column (8 cols) */}
                            <div className="col-span-8 p-7 space-y-6">
                                {/* Career Objective */}
                                {resume.career_objective && (
                                    <div>
                                        <h2
                                            className="font-black text-sm uppercase tracking-wider pb-1.5 border-b-2 mb-2"
                                            style={{ color: accentColor, borderColor: accentColor }}
                                        >
                                            Career Objective
                                        </h2>
                                        <p className="text-slate-700 text-xs leading-relaxed text-justify">
                                            {resume.career_objective}
                                        </p>
                                    </div>
                                )}

                                {/* Education */}
                                {resume.education?.length > 0 && (
                                    <div>
                                        <h2
                                            className="font-black text-sm uppercase tracking-wider pb-1.5 border-b-2 mb-2.5"
                                            style={{ color: accentColor, borderColor: accentColor }}
                                        >
                                            Educational Qualifications
                                        </h2>
                                        <table className="w-full text-left border-collapse border border-slate-300 text-[11px]">
                                            <thead>
                                                <tr className="bg-slate-100 text-slate-800 font-bold">
                                                    <th className="border border-slate-300 p-1.5">Degree / Course</th>
                                                    <th className="border border-slate-300 p-1.5">School / College</th>
                                                    <th className="border border-slate-300 p-1.5">Board / University</th>
                                                    <th className="border border-slate-300 p-1.5 text-center">Year</th>
                                                    <th className="border border-slate-300 p-1.5 text-center">% / CGPA</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {resume.education.map((e, idx) => (
                                                    <tr key={idx} className={idx % 2 === 1 ? 'bg-slate-50/60' : ''}>
                                                        <td className="border border-slate-300 p-1.5 font-bold text-slate-900">{e.degree}</td>
                                                        <td className="border border-slate-300 p-1.5 text-slate-700">{e.school_college}</td>
                                                        <td className="border border-slate-300 p-1.5 text-slate-700">{e.board_university}</td>
                                                        <td className="border border-slate-300 p-1.5 text-center text-slate-700">{e.passing_year}</td>
                                                        <td className="border border-slate-300 p-1.5 text-center font-bold text-slate-900">{e.percentage_cgpa}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}

                                {/* Work Experience */}
                                {resume.experience?.length > 0 && (
                                    <div>
                                        <h2
                                            className="font-black text-sm uppercase tracking-wider pb-1.5 border-b-2 mb-2.5"
                                            style={{ color: accentColor, borderColor: accentColor }}
                                        >
                                            Work Experience
                                        </h2>
                                        <div className="space-y-3">
                                            {resume.experience.map((exp, idx) => (
                                                <div key={idx} className="border-l-2 pl-3" style={{ borderColor: accentColor }}>
                                                    <div className="flex justify-between items-baseline">
                                                        <h3 className="font-bold text-slate-900 text-xs">{exp.designation}</h3>
                                                        <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                                                            {exp.duration}
                                                        </span>
                                                    </div>
                                                    <p className="text-[11px] font-medium text-slate-600 mt-0.5">{exp.company}</p>
                                                    {exp.description && (
                                                        <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">{exp.description}</p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Declaration */}
                                {resume.declaration && (
                                    <div className="pt-4 border-t border-slate-200 mt-6">
                                        <h2
                                            className="font-black text-xs uppercase tracking-wider mb-1.5"
                                            style={{ color: accentColor }}
                                        >
                                            Declaration
                                        </h2>
                                        <p className="text-[10.5px] text-slate-600 leading-relaxed">
                                            {resume.declaration}
                                        </p>
                                        <div className="flex justify-between items-end mt-8 text-xs">
                                            <div>
                                                <p><b>Place:</b> {resume.place}</p>
                                                <p className="mt-1"><b>Date:</b> {resume.date}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-slate-900">({resume.full_name})</p>
                                                <p className="text-[10px] text-slate-400 mt-0.5">Signature</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        /* Classic / Executive Layout */
                        <div className="p-10 space-y-6">
                            {/* Header */}
                            <div className="flex items-center justify-between pb-4 border-b-2" style={{ borderColor: accentColor }}>
                                <div>
                                    <h1 className="text-2xl font-black uppercase tracking-tight" style={{ color: accentColor }}>
                                        {resume.full_name}
                                    </h1>
                                    <p className="text-slate-700 text-xs font-semibold mt-1">
                                        {resume.phone} {resume.email ? `• ${resume.email}` : ''}
                                    </p>
                                    <p className="text-slate-500 text-[11px] mt-0.5 max-w-lg leading-snug">{resume.address}</p>
                                </div>
                                {resume.photo_url && (
                                    <div className="w-24 h-28 rounded-lg border-2 border-slate-300 overflow-hidden flex-shrink-0 shadow-sm">
                                        <img src={resume.photo_url} alt="" className="w-full h-full object-cover" />
                                    </div>
                                )}
                            </div>

                            {/* Career Objective */}
                            {resume.career_objective && (
                                <div>
                                    <h2
                                        className="font-black text-xs uppercase tracking-wider pb-1 border-b"
                                        style={{ color: accentColor, borderColor: accentColor }}
                                    >
                                        Career Objective
                                    </h2>
                                    <p className="text-slate-700 text-xs leading-relaxed mt-1.5 text-justify">
                                        {resume.career_objective}
                                    </p>
                                </div>
                            )}

                            {/* Academic Qualifications */}
                            {resume.education?.length > 0 && (
                                <div>
                                    <h2
                                        className="font-black text-xs uppercase tracking-wider pb-1 border-b"
                                        style={{ color: accentColor, borderColor: accentColor }}
                                    >
                                        Academic Qualifications
                                    </h2>
                                    <table className="w-full text-left border-collapse border border-slate-300 text-[11px] mt-2">
                                        <thead>
                                            <tr className="bg-slate-100 text-slate-800 font-bold">
                                                <th className="border border-slate-300 p-1.5">Examination / Degree</th>
                                                <th className="border border-slate-300 p-1.5">School / College</th>
                                                <th className="border border-slate-300 p-1.5">Board / University</th>
                                                <th className="border border-slate-300 p-1.5 text-center">Year</th>
                                                <th className="border border-slate-300 p-1.5 text-center">Percentage</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {resume.education.map((e, idx) => (
                                                <tr key={idx} className={idx % 2 === 1 ? 'bg-slate-50/60' : ''}>
                                                    <td className="border border-slate-300 p-1.5 font-bold">{e.degree}</td>
                                                    <td className="border border-slate-300 p-1.5">{e.school_college}</td>
                                                    <td className="border border-slate-300 p-1.5">{e.board_university}</td>
                                                    <td className="border border-slate-300 p-1.5 text-center">{e.passing_year}</td>
                                                    <td className="border border-slate-300 p-1.5 text-center font-bold">{e.percentage_cgpa}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* Work Experience */}
                            {resume.experience?.length > 0 && (
                                <div>
                                    <h2
                                        className="font-black text-xs uppercase tracking-wider pb-1 border-b"
                                        style={{ color: accentColor, borderColor: accentColor }}
                                    >
                                        Work Experience
                                    </h2>
                                    <div className="space-y-2 mt-2">
                                        {resume.experience.map((exp, idx) => (
                                            <div key={idx}>
                                                <div className="flex justify-between items-baseline font-bold text-xs text-slate-800">
                                                    <span>{exp.designation} — {exp.company}</span>
                                                    <span className="text-slate-500 font-normal text-[11px]">{exp.duration}</span>
                                                </div>
                                                {exp.description && (
                                                    <p className="text-[11px] text-slate-600 mt-0.5">{exp.description}</p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Technical Skills & Languages */}
                            <div className="grid grid-cols-2 gap-6">
                                {resume.skills?.length > 0 && (
                                    <div>
                                        <h2
                                            className="font-black text-xs uppercase tracking-wider pb-1 border-b"
                                            style={{ color: accentColor, borderColor: accentColor }}
                                        >
                                            Technical / Professional Skills
                                        </h2>
                                        <ul className="list-disc list-inside text-xs space-y-1 text-slate-700 mt-1.5">
                                            {resume.skills.map((s, idx) => (
                                                <li key={idx}>{s}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                <div>
                                    <h2
                                        className="font-black text-xs uppercase tracking-wider pb-1 border-b"
                                        style={{ color: accentColor, borderColor: accentColor }}
                                    >
                                        Personal Bio-Data
                                    </h2>
                                    <div className="text-xs space-y-1 text-slate-700 mt-1.5">
                                        {resume.father_name && <p><b>Father's Name:</b> {resume.father_name}</p>}
                                        {resume.dob && <p><b>Date of Birth:</b> {resume.dob}</p>}
                                        {resume.gender && <p><b>Gender:</b> {resume.gender}</p>}
                                        {resume.marital_status && <p><b>Marital Status:</b> {resume.marital_status}</p>}
                                        {resume.nationality && <p><b>Nationality:</b> {resume.nationality}</p>}
                                        {resume.languages?.length > 0 && <p><b>Languages:</b> {resume.languages.join(', ')}</p>}
                                    </div>
                                </div>
                            </div>

                            {/* Declaration */}
                            {resume.declaration && (
                                <div className="pt-4 border-t border-slate-200 mt-6">
                                    <p className="text-xs text-slate-600 leading-relaxed">
                                        {resume.declaration}
                                    </p>
                                    <div className="flex justify-between items-end mt-8 text-xs">
                                        <div>
                                            <p><b>Place:</b> {resume.place}</p>
                                            <p className="mt-1"><b>Date:</b> {resume.date}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-slate-900">({resume.full_name})</p>
                                            <p className="text-[10px] text-slate-400 mt-0.5">Signature</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
