<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\BroadcastNotice;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BroadcastNoticeController extends Controller
{
    public function index()
    {
        if (!in_array(auth()->user()->type, ['admin', 'super_admin'])) {
            abort(403);
        }

        $notices = BroadcastNotice::with('creator:id,name,phone')
            ->latest()
            ->paginate(15);

        return Inertia::render('Admin/Notices/Index', [
            'notices' => $notices
        ]);
    }

    public function store(Request $request)
    {
        if (!in_array(auth()->user()->type, ['admin', 'super_admin'])) {
            abort(403);
        }

        $data = $request->validate([
            'title'         => 'required|string|max:255',
            'content'       => 'required|string',
            'type'          => 'required|in:info,warning,success,danger,offer',
            'is_active'     => 'boolean',
            'show_as_popup' => 'boolean',
            'button_text'   => 'nullable|string|max:100',
            'button_link'   => 'nullable|string|max:255',
            'expires_at'    => 'nullable|date',
        ]);

        $data['created_by'] = auth()->id();
        $data['is_active'] = $request->boolean('is_active', true);
        $data['show_as_popup'] = $request->boolean('show_as_popup', false);

        BroadcastNotice::create($data);

        return back()->with('success', 'Notice broadcasted successfully!');
    }

    public function update(Request $request, BroadcastNotice $notice)
    {
        if (!in_array(auth()->user()->type, ['admin', 'super_admin'])) {
            abort(403);
        }

        $data = $request->validate([
            'title'         => 'required|string|max:255',
            'content'       => 'required|string',
            'type'          => 'required|in:info,warning,success,danger,offer',
            'is_active'     => 'boolean',
            'show_as_popup' => 'boolean',
            'button_text'   => 'nullable|string|max:100',
            'button_link'   => 'nullable|string|max:255',
            'expires_at'    => 'nullable|date',
        ]);

        $data['is_active'] = $request->boolean('is_active', true);
        $data['show_as_popup'] = $request->boolean('show_as_popup', false);

        $notice->update($data);

        return back()->with('success', 'Notice updated successfully!');
    }

    public function toggleStatus(BroadcastNotice $notice)
    {
        if (!in_array(auth()->user()->type, ['admin', 'super_admin'])) {
            abort(403);
        }

        $notice->update(['is_active' => !$notice->is_active]);

        return back()->with('success', 'Notice status updated.');
    }

    public function destroy(BroadcastNotice $notice)
    {
        if (!in_array(auth()->user()->type, ['admin', 'super_admin'])) {
            abort(403);
        }

        $notice->delete();

        return back()->with('success', 'Notice deleted successfully.');
    }
}
