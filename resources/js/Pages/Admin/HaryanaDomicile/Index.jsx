import React from 'react';
import AdminLayout from '../../../Layouts/AdminLayout';
import ResourceIndex from '../../../Components/ResourceIndex';

export default function Index({ records }) {
    return (
        <AdminLayout>
            <ResourceIndex
                title="Haryana Domicile Records"
                items={records}
                columns={[
                    { label: 'Name', render: (r) => r.name },
                    { label: 'Father/Husband Name', render: (r) => r.father_name },
                    { label: 'Mobile', render: (r) => r.mobile },
                    { label: 'District', render: (r) => r.district },
                ]}
                createHref="/admin/haryana-domicile/create"
                editHref={(r) => `/admin/haryana-domicile/${r.id}/edit`}
                printHref={(r) => `/admin/haryana-domicile/${r.id}/print`}
                deleteHref={(r) => `/admin/haryana-domicile/${r.id}`}
                emptyLabel="No records found."
            />
        </AdminLayout>
    );
}
