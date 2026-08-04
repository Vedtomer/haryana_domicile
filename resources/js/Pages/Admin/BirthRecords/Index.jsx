import React from 'react';
import AdminLayout from '../../../Layouts/AdminLayout';
import ResourceIndex from '../../../Components/ResourceIndex';

export default function Index({ records }) {
    return (
        <AdminLayout>
            <ResourceIndex
                title="Birth Name Addition Form"
                pageTitle="Birth Records"
                items={records}
                columns={[
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
