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
                'upi_id'             => Setting::get('upi_id',   'cspjaankari@upi'),
                'upi_name'           => Setting::get('upi_name', 'CSP Jaankari'),
                'whatsapp_number'    => Setting::get('whatsapp_number', '380630323112'),
                'paycorex_enabled'   => Setting::get('paycorex_enabled', '1'),
                'paycorex_username'  => Setting::get('paycorex_username', '7494945476'),
                'paycorex_api_key'   => Setting::get('paycorex_api_key', '2d7bcd6c2467d343d9f1110ebd59da51'),
                'paycorex_base_url'  => Setting::get('paycorex_base_url', 'https://paycorex.in/api/v1'),
            ],
        ]);
    }

    public function update(Request $request)
    {
        if (auth()->user()->type !== 'admin') {
            abort(403);
        }

        $data = $request->validate([
            'upi_id'             => 'required|string|max:100',
            'upi_name'           => 'required|string|max:100',
            'whatsapp_number'    => 'nullable|string|max:30',
            'paycorex_enabled'   => 'nullable',
            'paycorex_username'  => 'nullable|string|max:100',
            'paycorex_api_key'   => 'nullable|string|max:200',
            'paycorex_base_url'  => 'nullable|string|max:200',
        ]);

        Setting::set('upi_id',   $data['upi_id']);
        Setting::set('upi_name', $data['upi_name']);
        if (!empty($data['whatsapp_number'])) {
            Setting::set('whatsapp_number', preg_replace('/[^0-9]/', '', $data['whatsapp_number']));
        }

        Setting::set('paycorex_enabled', !empty($data['paycorex_enabled']) ? '1' : '0');
        if (isset($data['paycorex_username'])) {
            Setting::set('paycorex_username', trim($data['paycorex_username']));
        }
        if (isset($data['paycorex_api_key'])) {
            Setting::set('paycorex_api_key', trim($data['paycorex_api_key']));
        }
        if (isset($data['paycorex_base_url'])) {
            Setting::set('paycorex_base_url', rtrim(trim($data['paycorex_base_url']), '/'));
        }

        return back()->with('success', '✅ Payment & Gateway settings updated successfully.');
    }
}
