import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';

export default function Index({ users }) {
    const [addingCoinsTo, setAddingCoinsTo] = useState(null);
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');

    const handleAddCoins = (e) => {
        e.preventDefault();
        router.post(`/admin/users/${addingCoinsTo}/add-coins`, { amount, description }, {
            onSuccess: () => {
                setAddingCoinsTo(null);
                setAmount('');
                setDescription('');
            }
        });
    };

    return (
        <AdminLayout>
            <Head title="User Management" />
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Users</h2>
                <Link href="/admin/users/create" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">
                    + Create User
                </Link>
            </div>
            
            <div className="bg-white rounded-xl shadow overflow-hidden mb-6">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type / Role</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Coins</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {users.data.map((user) => (
                            <tr key={user.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                        user.type === 'super_admin' ? 'bg-purple-100 text-purple-800' :
                                        user.type === 'admin' ? 'bg-blue-100 text-blue-800' :
                                        'bg-gray-100 text-gray-800'
                                    }`}>
                                        {user.type?.replace('_', ' ').toUpperCase()}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {user.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600">{user.coins}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button onClick={() => setAddingCoinsTo(user.id)} className="text-green-600 hover:text-green-900 mr-4">+ Add Coins</button>
                                    <Link href={`/admin/users/${user.id}/edit`} className="text-blue-600 hover:text-blue-900 font-semibold">Edit</Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="mt-4 flex gap-2 mb-6">
                {users.links.map((link, i) => (
                    link.url ? (
                        <Link
                            key={i}
                            href={link.url}
                            className={`px-4 py-2 border rounded ${link.active ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-white hover:bg-gray-50 text-gray-600'}`}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ) : (
                        <span
                            key={i}
                            className="px-4 py-2 border rounded opacity-50 cursor-not-allowed bg-gray-50 text-gray-500"
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    )
                ))}
            </div>

            {addingCoinsTo && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <form onSubmit={handleAddCoins} className="bg-white rounded-xl p-6 shadow-xl w-full max-w-md">
                        <h3 className="text-xl font-bold mb-4">Add Coins</h3>
                        <div className="mb-4">
                            <label className="block text-sm mb-1">Amount</label>
                            <input type="number" required min="1" value={amount} onChange={e => setAmount(e.target.value)} className="w-full border-gray-300 rounded" />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm mb-1">Reason (Optional)</label>
                            <input type="text" value={description} onChange={e => setDescription(e.target.value)} className="w-full border-gray-300 rounded" />
                        </div>
                        <div className="flex justify-end gap-2">
                            <button type="button" onClick={() => setAddingCoinsTo(null)} className="px-4 py-2 text-gray-600">Cancel</button>
                            <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded">Add Coins</button>
                        </div>
                    </form>
                </div>
            )}
        </AdminLayout>
    );
}
