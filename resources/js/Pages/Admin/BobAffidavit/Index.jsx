import React from 'react';
import AdminLayout from '../../../Layouts/AdminLayout';
import ResourceIndex from '../../../Components/ResourceIndex';

const AFFIDAVIT_TYPE_LABELS = {
    name_correction: 'Name Correction',
    mobile_update: 'Mobile Update',
    passbook_lost: 'Lost Passbook',
    dormant_activation: 'Dormant Activation',
    signature_change: 'Signature Change',
    general: 'General Affidavit',
};

export default function Index({ records }) {
    return (
        <AdminLayout>
            <ResourceIndex
                title="Bank of Baroda (BOB) Affidavits"
                items={records}
                columns={[
                    { 
                        label: 'Date', 
                        render: (r) => new Date(r.created_at).toLocaleDateString('en-IN') 
                    },
                    { 
                        label: 'Account Holder Name', 
                        render: (r) => (
                            <div className="font-bold text-slate-800">
                                {r.name}
                            </div>
                        ) 
                    },
                    { 
                        label: 'Father/Husband Name', 
                        render: (r) => r.father_name 
                    },
                    { 
                        label: 'BOB Account No.', 
                        render: (r) => (
                            <span className="font-mono font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 text-xs">
                                {r.account_no}
                            </span>
                        ) 
                    },
                    { 
                        label: 'Mobile', 
                        render: (r) => r.mobile 
                    },
                    { 
                        label: 'Affidavit Type', 
                        render: (r) => (
                            <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-50 text-orange-700 border border-orange-200">
                                {AFFIDAVIT_TYPE_LABELS[r.affidavit_type] || r.affidavit_type}
                            </span>
                        ) 
                    },
                ]}
                createHref="/admin/bob-affidavit/create"
                editHref={(r) => `/admin/bob-affidavit/${r.id}/edit`}
                printHref={(r) => `/admin/bob-affidavit/${r.id}/print`}
                deleteHref={(r) => `/admin/bob-affidavit/${r.id}`}
                emptyLabel="No BOB Affidavit records found. Click '+ Create' to generate a new affidavit."
            />
        </AdminLayout>
    );
}
