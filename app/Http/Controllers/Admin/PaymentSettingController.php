<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PaymentSettingController extends Controller
{
    public function edit()
    {
        // Only admin (type=admin) can access
        if (auth()->user()->type !== 'admin') {
            abort(403);
        }

        return Inertia::render('Admin/PaymentSettings/Edit', [
            'settings' => [
                'upi_id'   => Setting::get('upi_id',   'cspjaankari@upi'),
                'upi_name' => Setting::get('upi_name', 'CSP Jaankari'),
            ],
        ]);
    }

    public function update(Request $request)
    {
        if (auth()->user()->type !== 'admin') {
            abort(403);
        }

        $data = $request->validate([
            'upi_id'   => 'required|string|max:100',
            'upi_name' => 'required|string|max:100',
        ]);

        Setting::set('upi_id',   $data['upi_id']);
        Setting::set('upi_name', $data['upi_name']);

        return back()->with('success', '✅ Payment settings updated successfully.');
    }
}
