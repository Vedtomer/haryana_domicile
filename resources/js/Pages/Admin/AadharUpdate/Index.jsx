import React from 'react';
import AdminLayout from '../../../Layouts/AdminLayout';
import ResourceIndex from '../../../Components/ResourceIndex';

export default function Index({ records }) {
    return (
        <AdminLayout>
            <ResourceIndex
                title="Aadhar Update Records"
                items={records}
                columns={[
                    { label: 'Aadhar Number', render: (r) => r.aadhar_number },
                    { label: 'Name', render: (r) => r.name },
                    { label: 'Date', render: (r) => new Date(r.created_at).toLocaleDateString() },
                ]}
                createHref="/admin/aadhar-update/create"
                editHref={(r) => `/admin/aadhar-update/${r.id}/edit`}
                printHref={(r) => `/admin/aadhar-update/${r.id}/print`}
                deleteHref={(r) => `/admin/aadhar-update/${r.id}`}
                emptyLabel="No records found."
            />
        </AdminLayout>
    );
}
