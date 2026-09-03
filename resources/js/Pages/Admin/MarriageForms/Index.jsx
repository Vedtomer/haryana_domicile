import React from 'react';
import AdminLayout from '../../../Layouts/AdminLayout';
import ResourceIndex from '../../../Components/ResourceIndex';

export default function Index({ forms }) {
    return (
        <AdminLayout>
            <ResourceIndex
                title="Marriage Forms"
                items={forms}
                columns={[
                    { label: 'Requested', render: (f) => new Date(f.created_at).toLocaleDateString() },
                    { label: 'ID', render: (f) => `#${f.id}` },
                    { label: 'Groom Name', render: (f) => f.groom_name },
                    { label: 'Bride Name', render: (f) => f.bride_name },
                    { label: 'Marriage Date', render: (f) => f.marriage_date },
                ]}
                createHref="/admin/marriage-forms/create"
                editHref={(f) => `/admin/marriage-forms/${f.id}/edit`}
                printHref={(f) => `/admin/marriage-forms/${f.id}/print`}
                deleteHref={(f) => `/admin/marriage-forms/${f.id}`}
                emptyLabel="No marriage forms found."
            />
        </AdminLayout>
    );
}
