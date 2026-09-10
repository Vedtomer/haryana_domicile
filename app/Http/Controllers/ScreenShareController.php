<?php

namespace App\Http\Controllers;

use App\Models\ScreenShareSession;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ScreenShareController extends Controller
{
    /**
     * Admin initiates a screen share request to view the user's display.
     */
    public function startSession(Request $request, User $user): JsonResponse
    {
        $admin = auth()->user();
        if (!in_array($admin->type, ['admin', 'super_admin'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'offer' => 'nullable|string',
        ]);

        // Terminate any stale active sessions between this admin & user
        ScreenShareSession::where('admin_id', $admin->id)
            ->where('user_id', $user->id)
            ->whereIn('status', ['requesting', 'accepted'])
            ->update([
                'status' => 'ended',
                'ended_at' => now(),
            ]);

        $session = ScreenShareSession::create([
            'admin_id'         => $admin->id,
            'user_id'          => $user->id,
            'status'           => 'requesting',
            'offer'            => $validated['offer'] ?? null,
            'answer'           => null,
            'admin_candidates' => [],
            'user_candidates'  => [],
        ]);

        return response()->json([
            'status'  => 'success',
            'session' => $session->load(['user', 'admin']),
        ]);
    }

    /**
     * User layout polls to check for incoming screen share requests.
     */
    public function checkIncoming(Request $request): JsonResponse
    {
        $user = auth()->user();
        if (!$user) {
            return response()->json(['session' => null], 401);
        }

        $session = ScreenShareSession::where('user_id', $user->id)
            ->where('status', 'requesting')
            ->where('created_at', '>=', now()->subSeconds(45))
            ->with('admin:id,name,email')
            ->latest()
            ->first();

        return response()->json([
            'session' => $session,
        ]);
    }

    /**
     * User accepts incoming screen share request and submits SDP answer.
     */
    public function acceptSession(Request $request, ScreenShareSession $session): JsonResponse
    {
        $user = auth()->user();
        if ($session->user_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($session->status !== 'requesting') {
            return response()->json(['message' => 'Session is no longer active'], 400);
        }

        $validated = $request->validate([
            'answer' => 'required|string',
        ]);

        $session->update([
            'status' => 'accepted',
            'answer' => $validated['answer'],
        ]);

        return response()->json([
            'status'  => 'success',
            'session' => $session,
        ]);
    }

    /**
     * User declines screen share request.
     */
    public function rejectSession(Request $request, ScreenShareSession $session): JsonResponse
    {
        $user = auth()->user();
        if ($session->user_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $session->update([
            'status'   => 'rejected',
            'ended_at' => now(),
        ]);

        return response()->json(['status' => 'rejected']);
    }

    /**
     * Admin polls session for user's answer, status, and ICE candidates.
     */
    public function pollAdmin(Request $request, ScreenShareSession $session): JsonResponse
    {
        $admin = auth()->user();
        if ($session->admin_id !== $admin->id && !in_array($admin->type, ['admin', 'super_admin'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json([
            'session' => $session,
        ]);
    }

    /**
     * User polls session status and admin ICE candidates.
     */
    public function pollUser(Request $request, ScreenShareSession $session): JsonResponse
    {
        $user = auth()->user();
        if ($session->user_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json([
            'session' => $session,
        ]);
    }

    /**
     * Exchange ICE candidates between peers.
     */
    public function sendCandidate(Request $request, ScreenShareSession $session): JsonResponse
    {
        $user = auth()->user();
        $validated = $request->validate([
            'candidate' => 'required|array',
        ]);

        $newCandidate = $validated['candidate'];

        if ($session->admin_id === $user->id) {
            $candidates = $session->admin_candidates ?? [];
            $candidates[] = $newCandidate;
            $session->update(['admin_candidates' => $candidates]);
        } elseif ($session->user_id === $user->id) {
            $candidates = $session->user_candidates ?? [];
            $candidates[] = $newCandidate;
            $session->update(['user_candidates' => $candidates]);
        } else {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json(['status' => 'candidate_added']);
    }

    /**
     * Either party ends the screen sharing session.
     */
    public function endSession(Request $request, ScreenShareSession $session): JsonResponse
    {
        $user = auth()->user();
        if ($session->admin_id !== $user->id && $session->user_id !== $user->id && !in_array($user->type, ['admin', 'super_admin'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $session->update([
            'status'   => 'ended',
            'ended_at' => now(),
        ]);

        return response()->json(['status' => 'ended']);
    }
}
