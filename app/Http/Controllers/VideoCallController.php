<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\VideoCallSession;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VideoCallController extends Controller
{
    /**
     * Admin initiates a video call request to a specific user.
     */
    public function startCall(Request $request, User $user): JsonResponse
    {
        $admin = auth()->user();
        if (!in_array($admin->type, ['admin', 'super_admin'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'offer' => 'nullable|string',
        ]);

        // Terminate any stale active sessions between this admin & user
        VideoCallSession::where('admin_id', $admin->id)
            ->where('user_id', $user->id)
            ->whereIn('status', ['calling', 'accepted'])
            ->update([
                'status' => 'ended',
                'ended_at' => now(),
            ]);

        $session = VideoCallSession::create([
            'admin_id'         => $admin->id,
            'user_id'          => $user->id,
            'status'           => 'calling',
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
     * User Layout checks for active incoming calls directed to them.
     */
    public function checkIncoming(Request $request): JsonResponse
    {
        $user = auth()->user();
        if (!$user) {
            return response()->json(['session' => null], 401);
        }

        // Only look for recent calling sessions (created in the last 45 seconds)
        $session = VideoCallSession::where('user_id', $user->id)
            ->where('status', 'calling')
            ->where('created_at', '>=', now()->subSeconds(45))
            ->with('admin:id,name,email')
            ->latest()
            ->first();

        return response()->json([
            'session' => $session,
        ]);
    }

    /**
     * User accepts incoming call and submits SDP answer.
     */
    public function acceptCall(Request $request, VideoCallSession $session): JsonResponse
    {
        $user = auth()->user();
        if ($session->user_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($session->status !== 'calling') {
            return response()->json(['message' => 'Call is no longer active'], 400);
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
     * User rejects the incoming call.
     */
    public function rejectCall(Request $request, VideoCallSession $session): JsonResponse
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
     * Admin polls call session status, user's answer and ICE candidates.
     */
    public function pollAdmin(Request $request, VideoCallSession $session): JsonResponse
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
     * User polls call session status and admin ICE candidates.
     */
    public function pollUser(Request $request, VideoCallSession $session): JsonResponse
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
    public function sendCandidate(Request $request, VideoCallSession $session): JsonResponse
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
     * Either Admin or User ends the call.
     */
    public function endCall(Request $request, VideoCallSession $session): JsonResponse
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
