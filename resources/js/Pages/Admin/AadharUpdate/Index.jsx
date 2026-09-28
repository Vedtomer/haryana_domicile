import React from 'react';
import AdminLayout from '../../../Layouts/AdminLayout';
import ResourceIndex from '../../../Components/ResourceIndex';

export default function Index({ records }) {
    return (
        <AdminLayout>
            <ResourceIndex
                title="Aadhar Card Form Records"
                items={records}
                columns={[
                    { label: 'Aadhaar Number', render: (r) => r.aadhar_number },
                    { label: 'Name', render: (r) => r.name },
                    { label: 'Village / City', render: (r) => `${r.village_town || ''}${r.district ? ', ' + r.district : ''}` },
                    { label: 'Date', render: (r) => r.date || (r.created_at ? new Date(r.created_at).toLocaleDateString() : '') },
                ]}
                createHref="/admin/aadhar-update/create"
                editHref={(r) => `/admin/aadhar-update/${r.id}/edit`}
                printHref={(r) => `/admin/aadhar-update/${r.id}/print`}
                deleteHref={(r) => `/admin/aadhar-update/${r.id}`}
                emptyLabel="No Aadhar Card form records found. Click 'Create New' to generate a new form."
            />
        </AdminLayout>
    );
}
