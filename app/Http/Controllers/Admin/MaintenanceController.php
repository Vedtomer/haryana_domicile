<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MaintenanceController extends Controller
{
    public function edit()
    {
        return Inertia::render('Admin/Maintenance', [
            'enabled' => Setting::get('maintenance_mode', '0') === '1',
            'message' => Setting::get('maintenance_message', 'Site par kaam chal raha hai. Thodi der mein wapas aayein.'),
        ]);
    }

    public function update(Request $request)
    {
        $data = $request->validate([
            'enabled' => 'required|boolean',
            'message' => 'nullable|string|max:500',
        ]);

        Setting::set('maintenance_mode', $data['enabled'] ? '1' : '0');
        Setting::set('maintenance_message', $data['message'] ?? 'Site par kaam chal raha hai. Thodi der mein wapas aayein.');

        $status = $data['enabled'] ? 'ON — Users ko maintenance page dikh raha hai.' : 'OFF — Site normal chal rahi hai.';

        return back()->with('success', 'Maintenance mode ' . $status);
    }

    /**
     * Quick toggle endpoint — called directly from dashboard toggle switch
     */
    public function toggle()
    {
        $current = Setting::get('maintenance_mode', '0');
        $new     = $current === '1' ? '0' : '1';
        Setting::set('maintenance_mode', $new);

        return back()->with('success', $new === '1'
            ? '🔴 Maintenance Mode ON — Users ko site band dikh rahi hai.'
            : '🟢 Maintenance Mode OFF — Site normal chal rahi hai.');
    }
}
