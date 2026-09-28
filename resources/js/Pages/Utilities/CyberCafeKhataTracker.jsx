import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';

export default function CyberCafeKhataTracker({
    khataRecords,
    expenses,
    totalDue,
    totalPaid,
    todayExpenses,
    filters,
}) {
    const [activeTab, setActiveTab] = useState('khata'); // 'khata' | 'expenses'
    const [search, setSearch] = useState(filters?.search || '');
    const [statusFilter, setStatusFilter] = useState(filters?.status || 'all');

    // Add Khata Modal
    const [isAddKhataOpen, setIsAddKhataOpen] = useState(false);
    const [khataForm, setKhataForm] = useState({
        customer_name: '',
        customer_phone: '',
        work_title: '',
        total_amount: '',
        paid_amount: '0',
        notes: '',
    });
    const [khataSubmitting, setKhataSubmitting] = useState(false);

    // Payment Record Modal
    const [payModalRecord, setPayModalRecord] = useState(null);
    const [paymentAmount, setPaymentAmount] = useState('');
    const [paySubmitting, setPaySubmitting] = useState(false);

    // Add Expense Modal
    const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
    const [expenseForm, setExpenseForm] = useState({
        title: '',
        amount: '',
        category: 'material',
        notes: '',
    });
    const [expenseSubmitting, setExpenseSubmitting] = useState(false);

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(
            '/utilities/khata-tracker',
            { search, status: statusFilter },
            { preserveState: true, replace: true }
        );
    };

    const handleStatusFilterChange = (status) => {
        setStatusFilter(status);
        router.get(
            '/utilities/khata-tracker',
            { search, status },
            { preserveState: true, replace: true }
        );
    };

    const submitKhata = (e) => {
        e.preventDefault();
        setKhataSubmitting(true);
        router.post('/utilities/khata-tracker/khata', khataForm, {
            onSuccess: () => {
                setIsAddKhataOpen(false);
                setKhataForm({
                    customer_name: '',
                    customer_phone: '',
                    work_title: '',
                    total_amount: '',
                    paid_amount: '0',
                    notes: '',
                });
                setKhataSubmitting(false);
            },
            onError: () => setKhataSubmitting(false),
        });
    };

    const submitAddPayment = (e) => {
        e.preventDefault();
        if (!payModalRecord) return;
        setPaySubmitting(true);
        router.put(
            `/utilities/khata-tracker/khata/${payModalRecord.id}`,
            { add_payment: paymentAmount },
            {
                onSuccess: () => {
                    setPayModalRecord(null);
                    setPaymentAmount('');
                    setPaySubmitting(false);
                },
                onError: () => setPaySubmitting(false),
            }
        );
    };

    const handleMarkAsPaid = (record) => {
        if (!confirm(`क्या आप ${record.customer_name} का पूरा बकाया चुकता (Paid) मार्क करना चाहते हैं?`)) return;
        router.put(`/utilities/khata-tracker/khata/${record.id}`, { status: 'paid' }, { preserveScroll: true });
    };

    const handleDeleteKhata = (id) => {
        if (!confirm('क्या आप वाकई इस खाता रिकॉर्ड को हटाना चाहते हैं?')) return;
        router.delete(`/utilities/khata-tracker/khata/${id}`, { preserveScroll: true });
    };

    const submitExpense = (e) => {
        e.preventDefault();
        setExpenseSubmitting(true);
        router.post('/utilities/khata-tracker/expense', expenseForm, {
            onSuccess: () => {
                setIsAddExpenseOpen(false);
                setExpenseForm({ title: '', amount: '', category: 'material', notes: '' });
                setExpenseSubmitting(false);
            },
            onError: () => setExpenseSubmitting(false),
        });
    };

    const handleDeleteExpense = (id) => {
        if (!confirm('क्या आप इस खर्च को हटाना चाहते हैं?')) return;
        router.delete(`/utilities/khata-tracker/expense/${id}`, { preserveScroll: true });
    };

    const sendWhatsAppReminder = (record) => {
        const cleanPhone = (record.customer_phone || '').replace(/[^0-9]/g, '');
        if (cleanPhone.length < 10) {
            alert('इस ग्राहक का वैध 10-अंकों का मोबाइल नंबर दर्ज नहीं है!');
            return;
        }

        const validPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
        const msg = `🙏 नमस्ते *${record.customer_name}* जी,\n\nसाइबर कैफे से आपके काम (*${record.work_title}*) का कुल बिल ₹${record.total_amount} था, जिसमें से *₹${record.due_amount}* का भुगतान बकाया (Due) है।\n\nकृपया सुविधानुसार UPI या नकद द्वारा बकाया राशि का भुगतान करने का कष्ट करें।\n\nधन्यवाद! 🙏`;

        window.open(`https://wa.me/${validPhone}?text=${encodeURIComponent(msg)}`, '_blank');
    };

    return (
        <AdminLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-amber-600 text-2xl">menu_book</span>
                            <h1 className="text-xl font-black text-slate-800 dark:text-white leading-tight">
                                Cyber Café Daily Earning & Khata Tracker
                            </h1>
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                                दुकान बहीखाता
                            </span>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                            ग्राहक उधारी, दैनिक आय, और खर्च का आसान डिजिटल बहीखाता (WhatsApp रिमाइंडर सहित)
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        {activeTab === 'khata' ? (
                            <button
                                type="button"
                                onClick={() => setIsAddKhataOpen(true)}
                                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-blue-600/20 cursor-pointer"
                            >
                                <span className="material-symbols-outlined text-base">person_add</span>
                                + नया ग्राहक खाता
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={() => setIsAddExpenseOpen(true)}
                                className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-rose-600/20 cursor-pointer"
                            >
                                <span className="material-symbols-outlined text-base">add_circle</span>
                                + आज का खर्च जोड़ें
                            </button>
                        )}
                    </div>
                </div>
            }
        >
            <Head title="Cyber Café Khata & Earning Tracker" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
                {/* Stats Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Total Due */}
                    <div className="bg-gradient-to-br from-rose-50 to-red-100/60 dark:from-rose-950/40 dark:to-red-900/20 border border-rose-200 dark:border-rose-900/60 rounded-3xl p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-rose-700 dark:text-rose-300 uppercase tracking-wider">
                                कुल बाकी उधारी (Total Due)
                            </span>
                            <div className="w-10 h-10 rounded-2xl bg-rose-500 text-white flex items-center justify-center shadow-md shadow-rose-500/30">
                                <span className="material-symbols-outlined text-xl">pending_actions</span>
                            </div>
                        </div>
                        <p className="text-3xl font-black text-rose-600 dark:text-rose-400 mt-2">
                            ₹{Number(totalDue).toLocaleString('en-IN')}
                        </p>
                        <p className="text-[11px] text-rose-500 mt-1">ग्राहकों से लेना बाकी है</p>
                    </div>

                    {/* Total Recovered */}
                    <div className="bg-gradient-to-br from-emerald-50 to-teal-100/60 dark:from-emerald-950/40 dark:to-teal-900/20 border border-emerald-200 dark:border-emerald-900/60 rounded-3xl p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">
                                कुल प्राप्त राशि (Total Paid)
                            </span>
                            <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/30">
                                <span className="material-symbols-outlined text-xl">payments</span>
                            </div>
                        </div>
                        <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
                            ₹{Number(totalPaid).toLocaleString('en-IN')}
                        </p>
                        <p className="text-[11px] text-emerald-500 mt-1">सफलतापूर्वक वसूल हो चुका है</p>
                    </div>

                    {/* Today Expenses */}
                    <div className="bg-gradient-to-br from-amber-50 to-orange-100/60 dark:from-amber-950/40 dark:to-orange-900/20 border border-amber-200 dark:border-amber-900/60 rounded-3xl p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wider">
                                आज का कुल खर्च (Today Expense)
                            </span>
                            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/30">
                                <span className="material-symbols-outlined text-xl">shopping_cart</span>
                            </div>
                        </div>
                        <p className="text-3xl font-black text-amber-600 dark:text-amber-400 mt-2">
                            ₹{Number(todayExpenses).toLocaleString('en-IN')}
                        </p>
                        <p className="text-[11px] text-amber-500 mt-1">कागज, रिम, चाय, आदि</p>
                    </div>
                </div>

                {/* Tabs Switcher */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-2 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap gap-2">
                    <button
                        type="button"
                        onClick={() => setActiveTab('khata')}
                        className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                            activeTab === 'khata'
                                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                    >
                        <span className="material-symbols-outlined text-lg">receipt_long</span>
                        ग्राहक उधारी बहीखाता (Customer Udhaar)
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('expenses')}
                        className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                            activeTab === 'expenses'
                                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                    >
                        <span className="material-symbols-outlined text-lg">currency_rupee</span>
                        दैनिक दुकान खर्च (Daily Expenses)
                    </button>
                </div>

                {/* TAB 1: KHATA / UDHAAR LIST */}
                {activeTab === 'khata' && (
                    <div className="space-y-4">
                        {/* Filters Row */}
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 flex flex-wrap items-center justify-between gap-3 shadow-sm">
                            <form onSubmit={handleSearch} className="flex-1 min-w-[240px] max-w-md relative">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
                                    search
                                </span>
                                <input
                                    type="text"
                                    placeholder="ग्राहक नाम, फोन, या काम से खोजें..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold"
                                />
                            </form>

                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-slate-500">स्थिति:</span>
                                {['all', 'due', 'partial', 'paid'].map((st) => (
                                    <button
                                        key={st}
                                        type="button"
                                        onClick={() => handleStatusFilterChange(st)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                            statusFilter === st
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                                        }`}
                                    >
                                        {st === 'all' ? 'सभी' : st === 'due' ? 'बाकी' : st === 'partial' ? 'आंशिक' : 'चुकता'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Khata Table */}
                        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs">
                                    <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider">
                                        <tr>
                                            <th className="py-3 px-4">ग्राहक (Customer)</th>
                                            <th className="py-3 px-4">काम का विवरण (Work)</th>
                                            <th className="py-3 px-4">कुल राशि (Total)</th>
                                            <th className="py-3 px-4">जमा (Paid)</th>
                                            <th className="py-3 px-4">बकाया (Due ₹)</th>
                                            <th className="py-3 px-4">स्थिति</th>
                                            <th className="py-3 px-4 text-right">एक्शन</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {khataRecords.data && khataRecords.data.length > 0 ? (
                                            khataRecords.data.map((r) => (
                                                <tr key={r.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                                                    <td className="py-3 px-4">
                                                        <div className="font-bold text-slate-800 dark:text-white">
                                                            {r.customer_name}
                                                        </div>
                                                        {r.customer_phone && (
                                                            <div className="text-[11px] text-slate-400">
                                                                +91 {r.customer_phone}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <span className="font-semibold text-slate-700 dark:text-slate-200">
                                                            {r.work_title}
                                                        </span>
                                                        {r.notes && (
                                                            <div className="text-[10px] text-slate-400 truncate max-w-xs">
                                                                {r.notes}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="py-3 px-4 font-bold text-slate-700 dark:text-slate-300">
                                                        ₹{Number(r.total_amount).toFixed(0)}
                                                    </td>
                                                    <td className="py-3 px-4 font-bold text-emerald-600">
                                                        ₹{Number(r.paid_amount).toFixed(0)}
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <span className={`font-black text-sm ${Number(r.due_amount) > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                                                            ₹{Number(r.due_amount).toFixed(0)}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                                            r.status === 'paid'
                                                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                                                : r.status === 'partial'
                                                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                                                                : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                                                        }`}>
                                                            {r.status === 'paid' ? 'चुकता (Paid)' : r.status === 'partial' ? 'आंशिक (Partial)' : 'बाकी (Due)'}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-4 text-right">
                                                        <div className="inline-flex items-center gap-1.5">
                                                            {Number(r.due_amount) > 0 && r.customer_phone && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => sendWhatsAppReminder(r)}
                                                                    title="Send WhatsApp Reminder"
                                                                    className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 hover:bg-emerald-100 cursor-pointer"
                                                                >
                                                                    <span className="material-symbols-outlined text-base">chat</span>
                                                                </button>
                                                            )}
                                                            {Number(r.due_amount) > 0 && (
                                                                <>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            setPayModalRecord(r);
                                                                            setPaymentAmount(r.due_amount);
                                                                        }}
                                                                        title="Add Payment"
                                                                        className="px-2 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 hover:bg-blue-100 font-bold text-[11px] cursor-pointer"
                                                                    >
                                                                        +रुपए जमा
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleMarkAsPaid(r)}
                                                                        title="Mark Full Paid"
                                                                        className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 hover:bg-emerald-100 cursor-pointer"
                                                                    >
                                                                        <span className="material-symbols-outlined text-base">check</span>
                                                                    </button>
                                                                </>
                                                            )}
                                                            <button
                                                                type="button"
                                                                onClick={() => handleDeleteKhata(r.id)}
                                                                title="Delete"
                                                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                                                            >
                                                                <span className="material-symbols-outlined text-base">delete</span>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="7" className="py-12 text-center text-slate-400">
                                                    कोई खाता प्रविष्टि नहीं मिली। "+ नया ग्राहक खाता" बटन दबाकर एंट्री जोड़ें।
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB 2: DAILY EXPENSE LOG */}
                {activeTab === 'expenses' && (
                    <div className="space-y-4">
                        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
                            <h3 className="font-extrabold text-sm text-slate-800 dark:text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-rose-600">receipt</span>
                                आज के दुकान खर्च (Today's Expenses)
                            </h3>

                            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                {expenses && expenses.length > 0 ? (
                                    expenses.map((exp) => (
                                        <div key={exp.id} className="py-3 flex items-center justify-between text-xs">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center font-bold">
                                                    ₹
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-800 dark:text-white">{exp.title}</p>
                                                    <span className="text-[10px] text-slate-400 uppercase tracking-wider">
                                                        {exp.category} {exp.notes ? `• ${exp.notes}` : ''}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <span className="font-black text-rose-600 text-sm">
                                                    -₹{Number(exp.amount).toFixed(0)}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteExpense(exp.id)}
                                                    className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                                                >
                                                    <span className="material-symbols-outlined text-base">delete</span>
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-8 text-center text-slate-400 text-xs">
                                        आज कोई खर्च दर्ज नहीं है।
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal 1: Add New Khata Record */}
            {isAddKhataOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95">
                        <div className="bg-blue-600 p-4 text-white flex items-center justify-between">
                            <h3 className="font-bold text-sm flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-lg">person_add</span>
                                नया ग्राहक खाता एंट्री
                            </h3>
                            <button
                                type="button"
                                onClick={() => setIsAddKhataOpen(false)}
                                className="text-white/80 hover:text-white"
                            >
                                <span className="material-symbols-outlined text-lg">close</span>
                            </button>
                        </div>
                        <form onSubmit={submitKhata} className="p-5 space-y-3 text-xs">
                            <div>
                                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    ग्राहक का नाम *
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. सोहन लाल"
                                    value={khataForm.customer_name}
                                    onChange={(e) => setKhataForm({ ...khataForm, customer_name: e.target.value })}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold"
                                />
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    मोबाइल नंबर (WhatsApp के लिए)
                                </label>
                                <input
                                    type="tel"
                                    maxLength="10"
                                    placeholder="9876543210"
                                    value={khataForm.customer_phone}
                                    onChange={(e) => setKhataForm({ ...khataForm, customer_phone: e.target.value.replace(/[^0-9]/g, '') })}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold"
                                />
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    काम का विवरण (Work Title) *
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. डोमिसाइल + 4 फोटो + लेमिनेशन"
                                    value={khataForm.work_title}
                                    onChange={(e) => setKhataForm({ ...khataForm, work_title: e.target.value })}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        कुल बिल राशि (₹) *
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        placeholder="150"
                                        value={khataForm.total_amount}
                                        onChange={(e) => setKhataForm({ ...khataForm, total_amount: e.target.value })}
                                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold"
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        जमा / एडवांस (₹)
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        placeholder="50"
                                        value={khataForm.paid_amount}
                                        onChange={(e) => setKhataForm({ ...khataForm, paid_amount: e.target.value })}
                                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold text-emerald-600"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    नोट (वैकल्पिक)
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. शाम को बाकी 100 देगा"
                                    value={khataForm.notes}
                                    onChange={(e) => setKhataForm({ ...khataForm, notes: e.target.value })}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                                />
                            </div>

                            <div className="pt-2 flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setIsAddKhataOpen(false)}
                                    className="px-4 py-2 rounded-xl border border-slate-300 text-slate-600"
                                >
                                    रद्द करें
                                </button>
                                <button
                                    type="submit"
                                    disabled={khataSubmitting}
                                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer"
                                >
                                    {khataSubmitting ? 'सहेज रहे हैं...' : 'खाता दर्ज करें'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal 2: Add Payment */}
            {payModalRecord && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden border border-slate-200 dark:border-slate-800">
                        <div className="bg-emerald-600 p-4 text-white flex items-center justify-between">
                            <h3 className="font-bold text-sm">भुगतान प्राप्त दर्ज करें</h3>
                            <button onClick={() => setPayModalRecord(null)} className="text-white/80 hover:text-white">
                                <span className="material-symbols-outlined text-lg">close</span>
                            </button>
                        </div>
                        <form onSubmit={submitAddPayment} className="p-5 space-y-3 text-xs">
                            <p className="text-slate-600 dark:text-slate-300">
                                ग्राहक: <strong>{payModalRecord.customer_name}</strong>
                                <br />
                                वर्तमान बकाया: <strong className="text-rose-600">₹{payModalRecord.due_amount}</strong>
                            </p>
                            <div>
                                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    जमा राशि (₹)
                                </label>
                                <input
                                    type="number"
                                    required
                                    min="1"
                                    max={payModalRecord.due_amount}
                                    value={paymentAmount}
                                    onChange={(e) => setPaymentAmount(e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-black text-emerald-600 text-base"
                                />
                            </div>
                            <div className="pt-2 flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setPayModalRecord(null)}
                                    className="px-4 py-2 rounded-xl border border-slate-300 text-slate-600"
                                >
                                    रद्द करें
                                </button>
                                <button
                                    type="submit"
                                    disabled={paySubmitting}
                                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
                                >
                                    {paySubmitting ? 'अपडेट हो रहा...' : 'जमा करें'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal 3: Add Expense */}
            {isAddExpenseOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden border border-slate-200 dark:border-slate-800">
                        <div className="bg-rose-600 p-4 text-white flex items-center justify-between">
                            <h3 className="font-bold text-sm">आज का खर्च जोड़ें</h3>
                            <button onClick={() => setIsAddExpenseOpen(false)} className="text-white/80 hover:text-white">
                                <span className="material-symbols-outlined text-lg">close</span>
                            </button>
                        </div>
                        <form onSubmit={submitExpense} className="p-5 space-y-3 text-xs">
                            <div>
                                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    खर्च का नाम *
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. A4 पेपर रिम, प्रिंटर टोनर, चाय"
                                    value={expenseForm.title}
                                    onChange={(e) => setExpenseForm({ ...expenseForm, title: e.target.value })}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        राशि (₹) *
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        placeholder="280"
                                        value={expenseForm.amount}
                                        onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold text-rose-600"
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        श्रेणी (Category)
                                    </label>
                                    <select
                                        value={expenseForm.category}
                                        onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold"
                                    >
                                        <option value="material">दुकान सामान / रिम</option>
                                        <option value="electricity">बिजली / नेट बिल</option>
                                        <option value="food">चाय / नाश्ता</option>
                                        <option value="rent">किराया (Rent)</option>
                                        <option value="other">अन्य</option>
                                    </select>
                                </div>
                            </div>
                            <div className="pt-2 flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setIsAddExpenseOpen(false)}
                                    className="px-4 py-2 rounded-xl border border-slate-300 text-slate-600"
                                >
                                    रद्द करें
                                </button>
                                <button
                                    type="submit"
                                    disabled={expenseSubmitting}
                                    className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold cursor-pointer"
                                >
                                    {expenseSubmitting ? 'जोड़ रहे हैं...' : 'खर्च दर्ज करें'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
