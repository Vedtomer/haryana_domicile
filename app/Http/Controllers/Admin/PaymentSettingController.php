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
                'upi_id'                 => Setting::get('upi_id',   'cspjaankari@upi'),
                'upi_name'               => Setting::get('upi_name', 'CSP Jaankari'),
                'whatsapp_number'        => Setting::get('whatsapp_number', '380630323112'),
                'phonepe_enabled'        => Setting::get('phonepe_enabled', '0') === '1',
                'phonepe_mode'           => Setting::get('phonepe_mode', 'sandbox'),
                'phonepe_version'        => Setting::get('phonepe_version', 'v2'),
                'phonepe_client_id'      => Setting::get('phonepe_client_id', ''),
                'phonepe_client_secret'  => Setting::get('phonepe_client_secret', ''),
                'phonepe_client_version' => Setting::get('phonepe_client_version', '1'),
                'phonepe_merchant_id'    => Setting::get('phonepe_merchant_id', ''),
                'phonepe_salt_key'       => Setting::get('phonepe_salt_key', ''),
                'phonepe_salt_index'     => Setting::get('phonepe_salt_index', '1'),
                'webhook_url'            => url('/api/phonepe/webhook'),
                'callback_url'           => url('/payment/phonepe/callback'),
            ],
        ]);
    }

    public function update(Request $request)
    {
        if (auth()->user()->type !== 'admin') {
            abort(403);
        }

        $data = $request->validate([
            'upi_id'                 => 'required|string|max:100',
            'upi_name'               => 'required|string|max:100',
            'whatsapp_number'        => 'nullable|string|max:30',
            'phonepe_enabled'        => 'nullable|boolean',
            'phonepe_mode'           => 'required|in:sandbox,production',
            'phonepe_version'        => 'required|in:v2,v1',
            'phonepe_client_id'      => 'nullable|string|max:255',
            'phonepe_client_secret'  => 'nullable|string|max:255',
            'phonepe_client_version' => 'nullable|string|max:50',
            'phonepe_merchant_id'    => 'nullable|string|max:255',
            'phonepe_salt_key'       => 'nullable|string|max:255',
            'phonepe_salt_index'     => 'nullable|string|max:20',
        ]);

        Setting::set('upi_id',   $data['upi_id']);
        Setting::set('upi_name', $data['upi_name']);
        if (!empty($data['whatsapp_number'])) {
            Setting::set('whatsapp_number', preg_replace('/[^0-9]/', '', $data['whatsapp_number']));
        }

        Setting::set('phonepe_enabled', !empty($data['phonepe_enabled']) ? '1' : '0');
        Setting::set('phonepe_mode', $data['phonepe_mode']);
        Setting::set('phonepe_version', $data['phonepe_version']);
        Setting::set('phonepe_client_id', trim((string) ($data['phonepe_client_id'] ?? '')));
        Setting::set('phonepe_client_secret', trim((string) ($data['phonepe_client_secret'] ?? '')));
        Setting::set('phonepe_client_version', trim((string) ($data['phonepe_client_version'] ?? '1')) ?: '1');
        Setting::set('phonepe_merchant_id', trim((string) ($data['phonepe_merchant_id'] ?? '')));
        Setting::set('phonepe_salt_key', trim((string) ($data['phonepe_salt_key'] ?? '')));
        Setting::set('phonepe_salt_index', trim((string) ($data['phonepe_salt_index'] ?? '1')) ?: '1');

        return back()->with('success', '✅ Payment settings and PhonePe configuration saved successfully.');
    }
}
