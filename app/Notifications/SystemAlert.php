<?php

namespace App\Notifications;

use App\Models\User;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\Notification as NotificationFacade;

/**
 * Single in-app notification type used across the portal (coin events,
 * service request status changes, new requests for admins).
 */
class SystemAlert extends Notification
{
    public function __construct(
        public string $title,
        public string $body,
        public ?string $url = null,
        public string $level = 'info', // info | success | warning | error
    ) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toDatabase(object $notifiable): array
    {
        return [
            'title' => $this->title,
            'body' => $this->body,
            'url' => $this->url,
            'level' => $this->level,
        ];
    }

    /**
     * Send the same alert to every admin account.
     */
    public static function toAdmins(string $title, string $body, ?string $url = null, string $level = 'info'): void
    {
        $admins = User::where('type', 'admin')->orWhere('type', 'super_admin')->get();

        if ($admins->isNotEmpty()) {
            NotificationFacade::send($admins, new self($title, $body, $url, $level));
        }
    }
}
