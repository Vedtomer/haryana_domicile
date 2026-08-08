<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Inertia\Inertia;

class NotificationController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Notifications/Index', [
            'notifications' => auth()->user()->notifications()->paginate(20),
        ]);
    }

    public function markRead(string $id)
    {
        auth()->user()->notifications()->where('id', $id)->update(['read_at' => now()]);

        return back();
    }

    public function markAllRead()
    {
        auth()->user()->unreadNotifications->markAsRead();

        return back()->with('success', 'All notifications marked as read.');
    }
}
