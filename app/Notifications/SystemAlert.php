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

        // Send WhatsApp Alert via CallMeBot
        $phone = config('services.callmebot.phone');
        $apiKey = config('services.callmebot.api_key');

        \Illuminate\Support\Facades\Log::info("CallMeBot Attempt:", ['phone' => $phone, 'apiKey' => $apiKey]);

        if (!empty($phone) && !empty($apiKey)) {
            // Clean up the message to avoid issues with special characters (like ₹)
            $safeBody = str_replace('₹', 'Rs. ', $body);
            $message = "*" . $title . "*\n" . $safeBody;
            
            if ($url) {
                // Remove localhost if APP_URL is not set properly on live server
                $fullUrl = url($url);
                if (str_contains($fullUrl, 'localhost')) {
                    $fullUrl = $url; // Just send the relative path if APP_URL is broken
                }
                $message .= "\nLink: " . $fullUrl;
            }

            // Run the API call AFTER the HTTP response is sent to the user's browser.
            // This prevents 504 Gateway Timeouts if CallMeBot is slow.
            app()->terminating(function () use ($phone, $message, $apiKey) {
                try {
                    \Illuminate\Support\Facades\Log::info("Sending CallMeBot request...");
                    $response = \Illuminate\Support\Facades\Http::connectTimeout(5)
                        ->timeout(10)
                        ->withOptions(['verify' => false])
                        ->get('https://api.callmebot.com/whatsapp.php', [
                            'phone' => $phone,
                            'text' => $message,
                            'apikey' => $apiKey,
                        ]);
                    \Illuminate\Support\Facades\Log::info("CallMeBot Response:", ['status' => $response->status(), 'body' => $response->body()]);
                } catch (\Exception $e) {
                    \Illuminate\Support\Facades\Log::error('CallMeBot Error: ' . $e->getMessage());
                }
            });
        } else {
            \Illuminate\Support\Facades\Log::warning("CallMeBot phone or API key is empty in config!");
        }
    }
}
