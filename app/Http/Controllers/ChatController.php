<?php

namespace App\Http\Controllers;

use App\Models\ChatMessage;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ChatController extends Controller
{
    /**
     * Heartbeat endpoint called every 45-60s to keep user online
     * and check for unread chat messages.
     */
    public function heartbeat(Request $request): JsonResponse
    {
        $user = auth()->user();
        if (!$user) {
            return response()->json(['status' => 'unauthenticated'], 401);
        }

        // Update last_seen_at
        $user->updateQuietly(['last_seen_at' => now()]);

        // Calculate unread chat messages
        $unreadCount = 0;
        if (in_array($user->type, ['admin', 'super_admin'])) {
            $unreadCount = ChatMessage::where('sender_type', 'user')
                ->where('is_read', false)
                ->count();
        } else {
            $unreadCount = ChatMessage::where('user_id', $user->id)
                ->where('sender_type', 'admin')
                ->where('is_read', false)
                ->count();
        }

        return response()->json([
            'status' => 'ok',
            'is_online' => true,
            'unread_chat_count' => $unreadCount,
        ]);
    }

    /**
     * Admin: Fetch conversation with specific user
     */
    public function getAdminChat(Request $request, User $user): JsonResponse
    {
        if (!in_array(auth()->user()->type, ['admin', 'super_admin'])) {
            abort(403);
        }

        // Mark incoming messages from this user as read
        ChatMessage::where('user_id', $user->id)
            ->where('sender_type', 'user')
            ->where('is_read', false)
            ->update(['is_read' => true]);

        $messages = ChatMessage::where('user_id', $user->id)
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name ?: ($user->email ?: $user->phone),
                'email' => $user->email,
                'phone' => $user->phone,
                'is_online' => $user->is_online,
                'last_seen_human' => $user->last_seen_human,
            ],
            'messages' => $messages,
        ]);
    }

    /**
     * Admin: Send message to specific user
     */
    public function sendAdminMessage(Request $request, User $user): JsonResponse
    {
        if (!in_array(auth()->user()->type, ['admin', 'super_admin'])) {
            abort(403);
        }

        $request->validate([
            'message' => 'required|string|max:3000',
        ]);

        $chatMessage = ChatMessage::create([
            'user_id'     => $user->id,
            'sender_id'   => auth()->id(),
            'sender_type' => 'admin',
            'message'     => trim($request->message),
            'is_read'     => false,
        ]);

        return response()->json([
            'status'  => 'ok',
            'message' => $chatMessage,
        ]);
    }

    /**
     * Regular User: Fetch own chat history with Admin/Support
     */
    public function getUserChat(Request $request): JsonResponse
    {
        $user = auth()->user();

        // Mark admin messages as read
        ChatMessage::where('user_id', $user->id)
            ->where('sender_type', 'admin')
            ->where('is_read', false)
            ->update(['is_read' => true]);

        $messages = ChatMessage::where('user_id', $user->id)
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json([
            'messages' => $messages,
            'unread_count' => 0,
        ]);
    }

    /**
     * Regular User: Send message to Admin
     */
    public function sendUserMessage(Request $request): JsonResponse
    {
        $user = auth()->user();

        $request->validate([
            'message' => 'required|string|max:3000',
        ]);

        $chatMessage = ChatMessage::create([
            'user_id'     => $user->id,
            'sender_id'   => $user->id,
            'sender_type' => 'user',
            'message'     => trim($request->message),
            'is_read'     => false,
        ]);

        return response()->json([
            'status'  => 'ok',
            'message' => $chatMessage,
        ]);
    }

    /**
     * Check unread count for current user
     */
    public function getUnreadCount(Request $request): JsonResponse
    {
        $user = auth()->user();
        if (!$user) {
            return response()->json(['unread_count' => 0]);
        }

        if (in_array($user->type, ['admin', 'super_admin'])) {
            $count = ChatMessage::where('sender_type', 'user')
                ->where('is_read', false)
                ->count();
        } else {
            $count = ChatMessage::where('user_id', $user->id)
                ->where('sender_type', 'admin')
                ->where('is_read', false)
                ->count();
        }

        return response()->json(['unread_count' => $count]);
    }
}
