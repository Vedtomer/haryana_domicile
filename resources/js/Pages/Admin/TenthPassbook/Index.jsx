import React from 'react';
import AdminLayout from '../../../Layouts/AdminLayout';
import ResourceIndex from '../../../Components/ResourceIndex';

export default function Index({ records }) {
    return (
        <AdminLayout>
            <ResourceIndex
                title="10th Passbook Records"
                items={records}
                columns={[
                    { label: 'Name', render: (r) => r.name },
                    { label: 'Father Name', render: (r) => r.father_name },
                    { label: 'Mother Name', render: (r) => r.mother_name },
                    { label: 'DOB', render: (r) => r.dob },
                ]}
                createHref="/admin/tenth-passbook/create"
                editHref={(r) => `/admin/tenth-passbook/${r.id}/edit`}
                printHref={(r) => `/admin/tenth-passbook/${r.id}/print`}
                deleteHref={(r) => `/admin/tenth-passbook/${r.id}`}
                emptyLabel="No records found."
            />
        </AdminLayout>
    );
}
