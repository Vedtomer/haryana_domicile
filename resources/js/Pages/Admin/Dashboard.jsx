import React from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';

export default function Dashboard() {
    return (
        <AdminLayout>
            <Head title="Dashboard" />
            <div className="bg-white rounded-xl shadow p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Welcome to your Dashboard</h2>
                <p className="text-gray-600">
                    You have successfully logged into the new React Admin Portal.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                    <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
                        <h3 className="font-bold text-blue-800">Total Services</h3>
                        <p className="text-3xl font-extrabold text-blue-600 mt-2">12</p>
                    </div>
                    <div className="bg-green-50 p-6 rounded-lg border border-green-100">
                        <h3 className="font-bold text-green-800">Completed Forms</h3>
                        <p className="text-3xl font-extrabold text-green-600 mt-2">143</p>
                    </div>
                    <div className="bg-purple-50 p-6 rounded-lg border border-purple-100">
                        <h3 className="font-bold text-purple-800">Pending Approvals</h3>
                        <p className="text-3xl font-extrabold text-purple-600 mt-2">5</p>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
