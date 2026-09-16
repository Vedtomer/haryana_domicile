import React from 'react';
import AdminLayout from '../../../Layouts/AdminLayout';
import ResourceIndex from '../../../Components/ResourceIndex';

export default function Index({ records }) {
    return (
        <AdminLayout>
            {/* Official CRS Portal Integration Banner */}
            <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50/80 dark:from-blue-950/40 dark:via-indigo-950/30 dark:to-blue-950/40 border border-blue-200/80 dark:border-blue-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex flex-col items-center justify-center shadow-md shadow-blue-500/20 flex-shrink-0">
                        <span className="text-[10px] font-bold tracking-wider uppercase opacity-80 leading-none">GOI</span>
                        <span className="text-xs font-black tracking-tight leading-none mt-0.5">CRS</span>
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="font-bold text-slate-900 dark:text-white text-base">
                                Civil Registration System (CRS) Portal
                            </h3>
                            <span className="text-[10px] bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-bold px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
                                Official Link
                            </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                            जन्म प्रमाण पत्र में नाम जुड़वाने व रिकॉर्ड अपडेट करने हेतु भारत सरकार का आधिकारिक पोर्टल (dc.crsorgi.gov.in)
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                    <a
                        href="https://dc.crsorgi.gov.in/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full md:w-auto inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm hover:shadow transition-all"
                    >
                        <span>Open CRS Portal</span>
                        <span className="material-symbols-outlined text-sm">open_in_new</span>
                    </a>
                </div>
            </div>

            <ResourceIndex
                title="Birth Certificate Name Add (जन्म प्रमाण पत्र नाम जुड़वाएं)"
                pageTitle="Birth Certificate Name Add"
                items={records}
                columns={[
                    { label: 'Date', render: (r) => new Date(r.created_at).toLocaleDateString() },
                    { label: 'Child Name', render: (r) => r.child_name },
                    { label: 'Father Name', render: (r) => r.father_name },
                    { label: 'DOB', render: (r) => r.dob?.slice(0, 10) },
                    { label: 'Reg. No', render: (r) => r.registration_no },
                ]}
                createHref="/admin/birth-records/create"
                editHref={(r) => `/admin/birth-records/${r.id}/edit`}
                printHref={(r) => `/birth-records/${r.id}/print`}
                deleteHref={(r) => `/admin/birth-records/${r.id}`}
                emptyLabel="No birth records found."
            />
        </AdminLayout>
    );
}
