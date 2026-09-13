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
                    { label: 'Form Date', render: (f) => f.application_date ? new Date(f.application_date).toLocaleDateString('en-GB') : new Date(f.created_at).toLocaleDateString('en-GB') },
                    { label: 'ID', render: (f) => `#${f.id}` },
                    { label: 'Groom / Boy', render: (f) => f.groom_name },
                    { label: 'Bride / Girl', render: (f) => f.bride_name },
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
