<?php

namespace App\Http\Controllers;

use App\Models\CyberCafeKhataRecord;
use App\Models\CyberCafeExpense;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CyberCafeKhataController extends Controller
{
    public function index(Request $request)
    {
        $userId = auth()->id();

        $khataQuery = CyberCafeKhataRecord::where('user_id', $userId)->latest();
        if ($request->search) {
            $khataQuery->where(function ($q) use ($request) {
                $q->where('customer_name', 'like', "%{$request->search}%")
                  ->orWhere('customer_phone', 'like', "%{$request->search}%")
                  ->orWhere('work_title', 'like', "%{$request->search}%");
            });
        }
        if ($request->status && $request->status !== 'all') {
            $khataQuery->where('status', $request->status);
        }
        $khataRecords = $khataQuery->paginate(20)->withQueryString();

        $expenses = CyberCafeExpense::where('user_id', $userId)
            ->whereDate('created_at', now()->today())
            ->latest()
            ->get();

        $totalDue = CyberCafeKhataRecord::where('user_id', $userId)->whereIn('status', ['due', 'partial'])->sum('due_amount');
        $totalPaid = CyberCafeKhataRecord::where('user_id', $userId)->sum('paid_amount');
        $todayExpenses = CyberCafeExpense::where('user_id', $userId)->whereDate('created_at', now()->today())->sum('amount');

        return Inertia::render('Utilities/CyberCafeKhataTracker', [
            'khataRecords'   => $khataRecords,
            'expenses'       => $expenses,
            'totalDue'       => (float) $totalDue,
            'totalPaid'      => (float) $totalPaid,
            'todayExpenses'  => (float) $todayExpenses,
            'filters'        => [
                'search' => $request->search ?? '',
                'status' => $request->status ?? 'all',
            ]
        ]);
    }

    public function storeKhata(Request $request)
    {
        $data = $request->validate([
            'customer_name'  => 'required|string|max:255',
            'customer_phone' => 'nullable|string|max:20',
            'work_title'     => 'required|string|max:255',
            'total_amount'   => 'required|numeric|min:0',
            'paid_amount'    => 'required|numeric|min:0',
            'notes'          => 'nullable|string|max:500',
        ]);

        $due = max(0, $data['total_amount'] - $data['paid_amount']);
        $status = $due <= 0 ? 'paid' : ($data['paid_amount'] > 0 ? 'partial' : 'due');

        CyberCafeKhataRecord::create([
            'user_id'        => auth()->id(),
            'customer_name'  => $data['customer_name'],
            'customer_phone' => $data['customer_phone'],
            'work_title'     => $data['work_title'],
            'total_amount'   => $data['total_amount'],
            'paid_amount'    => $data['paid_amount'],
            'due_amount'     => $due,
            'status'         => $status,
            'notes'          => $data['notes'] ?? null,
        ]);

        return back()->with('success', 'खाता प्रविष्टि सफलतापूर्वक दर्ज की गई!');
    }

    public function updateKhata(Request $request, CyberCafeKhataRecord $khata)
    {
        if ($khata->user_id !== auth()->id()) {
            abort(403);
        }

        $data = $request->validate([
            'add_payment' => 'nullable|numeric|min:0',
            'status'      => 'nullable|in:due,paid,partial',
            'notes'       => 'nullable|string|max:500',
        ]);

        if (isset($data['add_payment']) && $data['add_payment'] > 0) {
            $newPaid = $khata->paid_amount + $data['add_payment'];
            $newDue = max(0, $khata->total_amount - $newPaid);
            $newStatus = $newDue <= 0 ? 'paid' : 'partial';

            $khata->update([
                'paid_amount' => $newPaid,
                'due_amount'  => $newDue,
                'status'      => $newStatus,
                'notes'       => $data['notes'] ?? $khata->notes,
            ]);
        } elseif (isset($data['status'])) {
            if ($data['status'] === 'paid') {
                $khata->update([
                    'paid_amount' => $khata->total_amount,
                    'due_amount'  => 0,
                    'status'      => 'paid',
                ]);
            } else {
                $khata->update($data);
            }
        }

        return back()->with('success', 'खाता अपडेट हो गया!');
    }

    public function destroyKhata(CyberCafeKhataRecord $khata)
    {
        if ($khata->user_id !== auth()->id()) {
            abort(403);
        }

        $khata->delete();
        return back()->with('success', 'प्रविष्टि हटा दी गई।');
    }

    public function storeExpense(Request $request)
    {
        $data = $request->validate([
            'title'    => 'required|string|max:255',
            'amount'   => 'required|numeric|min:1',
            'category' => 'required|string|in:material,electricity,food,rent,other',
            'notes'    => 'nullable|string|max:255',
        ]);

        CyberCafeExpense::create([
            'user_id'  => auth()->id(),
            'title'    => $data['title'],
            'amount'   => $data['amount'],
            'category' => $data['category'],
            'notes'    => $data['notes'] ?? null,
        ]);

        return back()->with('success', 'खर्च दर्ज किया गया!');
    }

    public function destroyExpense(CyberCafeExpense $expense)
    {
        if ($expense->user_id !== auth()->id()) {
            abort(403);
        }

        $expense->delete();
        return back()->with('success', 'खर्च हटा दिया गया।');
    }
}
