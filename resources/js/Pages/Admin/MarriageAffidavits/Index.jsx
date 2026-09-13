import React from 'react';
import AdminLayout from '../../../Layouts/AdminLayout';
import ResourceIndex from '../../../Components/ResourceIndex';

export default function Index({ affidavits }) {
    return (
        <AdminLayout>
            <ResourceIndex
                title="New Marriage Certificate"
                items={affidavits}
                columns={[
                    { label: 'Form Date', render: (f) => f.application_date ? new Date(f.application_date).toLocaleDateString('en-GB') : new Date(f.created_at).toLocaleDateString('en-GB') },
                    { label: 'ID', render: (f) => `#${f.id}` },
                    { label: 'Groom / Boy', render: (f) => f.groom_name },
                    { label: 'Bride / Girl', render: (f) => f.bride_name },
                    { label: 'Marriage Date', render: (f) => f.marriage_date },
                ]}
                createHref="/admin/marriage-affidavits/create"
                editHref={(f) => `/admin/marriage-affidavits/${f.id}/edit`}
                printHref={(f) => `/admin/marriage-affidavits/${f.id}/print`}
                deleteHref={(f) => `/admin/marriage-affidavits/${f.id}`}
                emptyLabel="No marriage affidavits found."
            />
        </AdminLayout>
    );
}
