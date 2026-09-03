import React from 'react';
import AdminLayout from '../../../Layouts/AdminLayout';
import ResourceIndex from '../../../Components/ResourceIndex';

export default function Index({ records }) {
    return (
        <AdminLayout>
            <ResourceIndex
                title="Airtel Passbook Records"
                items={records}
                columns={[
                    { label: 'Date', render: (r) => new Date(r.created_at).toLocaleDateString() },
                    { label: 'Name', render: (r) => `${r.first_name} ${r.last_name || ''}`.trim() },
                    { label: 'Account Number', render: (r) => r.account_number },
                    { label: 'Reference Number', render: (r) => r.reference_number },
                    { label: 'City', render: (r) => r.city },
                ]}
                createHref="/admin/airtel-passbook/create"
                editHref={(r) => `/admin/airtel-passbook/${r.id}/edit`}
                printHref={(r) => `/admin/airtel-passbook/${r.id}/print`}
                deleteHref={(r) => `/admin/airtel-passbook/${r.id}`}
                emptyLabel="No Airtel passbook records found."
            />
        </AdminLayout>
    );
}
