<?php

namespace App\Http\Controllers;

use App\Models\CoinTransaction;
use App\Models\Service;
use App\Models\ServiceRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class VideoInvitationMakerController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();
        $isAdmin = $this->isStaff();

        $service = Service::where('slug', 'video-invitation-maker')
            ->orWhere('module_key', 'video_invitation_maker')
            ->first();

        $coinCost = $service ? $service->coin_cost : 399;

        // Fetch recent video requests created by this user
        $recentVideos = ServiceRequest::where('user_id', $user->id)
            ->where(function ($q) use ($service) {
                if ($service) {
                    $q->where('service_id', $service->id)
                      ->orWhere('service_name', 'like', '%Video Invitation%');
                } else {
                    $q->where('service_name', 'like', '%Video Invitation%');
                }
            })
            ->latest()
            ->take(10)
            ->get()
            ->map(function ($req) {
                return [
                    'id' => $req->id,
                    'created_at' => $req->created_at->format('d M Y, h:i A'),
                    'status' => $req->status,
                    'category' => $req->input_data['Category'] ?? 'Invitation Video',
                    'title' => $req->input_data['Title'] ?? 'Custom Invite',
                    'names' => $req->input_data['Names'] ?? '',
                    'date' => $req->input_data['Date'] ?? '',
                    'venue' => $req->input_data['Venue'] ?? '',
                    'template' => $req->input_data['Template'] ?? 'royal_gold',
                ];
            });

        return Inertia::render('Utilities/VideoInvitationMaker', [
            'coinCost' => $coinCost,
            'userCoins' => (int) $user->coins,
            'isAdmin' => $isAdmin,
            'recentVideos' => $recentVideos,
            'service' => $service ? [
                'id' => $service->id,
                'name' => $service->name,
                'description' => $service->description,
                'coin_cost' => $service->coin_cost,
            ] : [
                'name' => 'Digital Video Invitation Maker',
                'description' => 'Create HD animated Video Invitations for Wedding, Baby Birth, Ring Ceremony & Birthday. Auto-Approved Instant Download.',
                'coin_cost' => 399,
            ],
        ]);
    }

    public function generate(Request $request)
    {
        $request->validate([
            'category' => 'required|string',
            'template_id' => 'required|string',
            'title' => 'nullable|string|max:150',
            'person_name' => 'required|string|max:150',
            'partner_name' => 'nullable|string|max:150',
            'parents_name' => 'nullable|string|max:250',
            'event_date' => 'required|string|max:100',
            'event_time' => 'nullable|string|max:100',
            'venue' => 'required|string|max:300',
            'rsvp' => 'nullable|string|max:200',
            'message' => 'nullable|string|max:300',
        ]);

        $service = Service::where('slug', 'video-invitation-maker')
            ->orWhere('module_key', 'video_invitation_maker')
            ->first();

        $user = auth()->user();
        $coinCost = $service ? $service->coin_cost : 399;

        if ($user->coins < $coinCost && !$user->isAdmin() && !$user->hasRole('super_admin')) {
            return response()->json([
                'success' => false,
                'message' => "Insufficient coins. This service requires {$coinCost} coins (₹{$coinCost}). Your current balance is {$user->coins} coins. Please recharge your wallet."
            ], 422);
        }

        try {
            $category = $request->input('category');
            $personName = $request->input('person_name');
            $partnerName = $request->input('partner_name');
            $displayTitle = $partnerName ? "{$personName} & {$partnerName}" : $personName;

            // 1. Deduct 399 coins
            if (!$user->isAdmin() && !$user->hasRole('super_admin') && $coinCost > 0) {
                $user->deductCoins(
                    $coinCost,
                    CoinTransaction::TYPE_SERVICE_DEDUCTION,
                    "Video Invitation: {$category} - {$displayTitle}"
                );
            }

            // 2. Auto-Approved Service Request (status = completed)
            $serviceRequest = ServiceRequest::create([
                'user_id' => $user->id,
                'service_id' => $service ? $service->id : null,
                'service_name' => $service ? $service->name : 'Digital Video Invitation Maker',
                'status' => ServiceRequest::STATUS_COMPLETED, // Auto-Approved!
                'input_data' => [
                    'Category' => $category,
                    'Template' => $request->input('template_id'),
                    'Title' => $request->input('title', 'Invitation Video'),
                    'Names' => $displayTitle,
                    'Date' => $request->input('event_date') . ($request->input('event_time') ? ' at ' . $request->input('event_time') : ''),
                    'Venue' => $request->input('venue'),
                    'Parents / Family' => $request->input('parents_name', ''),
                    'RSVP / Contact' => $request->input('rsvp', ''),
                    'Special Message' => $request->input('message', ''),
                    'Auto Approved' => 'Yes (Instant Generation)',
                    'Coins Charged' => $coinCost,
                ],
                'notes' => 'Generated automatically with Instant Video Invitation Engine.',
            ]);

            return response()->json([
                'success' => true,
                'request_id' => $serviceRequest->id,
                'remaining_coins' => (int) $user->fresh()->coins,
                'message' => "Video Invitation generated and auto-approved successfully! {$coinCost} coins deducted.",
            ]);

        } catch (\Throwable $e) {
            Log::error('VideoInvitationMakerController error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage(),
            ], 500);
        }
    }
}
