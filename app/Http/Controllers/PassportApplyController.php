<?php

namespace App\Http\Controllers;

use App\Models\CoinTransaction;
use App\Models\Service;
use App\Models\ServiceRequest;
use App\Notifications\SystemAlert;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class PassportApplyController extends Controller
{
    /**
     * Display the Passport Apply form.
     */
    public function index()
    {
        $user = auth()->user();
        $service = Service::where('slug', 'passport-apply')
            ->orWhere('module_key', 'passport_apply')
            ->first();

        $recentRequests = ServiceRequest::where('user_id', $user->id)
            ->where('service_name', 'Passport Apply')
            ->latest('id')
            ->take(10)
            ->get()
            ->map(function ($req) {
                return [
                    'id'            => $req->id,
                    'status'        => $req->status,
                    'status_label'  => $req->statusLabel(),
                    'coins_charged' => $req->coins_charged,
                    'created_at'    => $req->created_at ? $req->created_at->format('d M Y, h:i A') : '',
                    'admin_response'=> $req->admin_response,
                    'input_data'    => $req->input_data,
                ];
            });

        return Inertia::render('Utilities/PassportApply', [
            'service'        => $service,
            'userCoins'      => $user->coins,
            'recentRequests' => $recentRequests,
        ]);
    }

    /**
     * Real-time Indian Pincode lookup API (returns City, State, and Police Station / Thana candidates).
     */
    public function pincodeLookup(string $pincode)
    {
        $cleanPincode = trim($pincode);
        if (!preg_match('/^[1-9][0-9]{5}$/', $cleanPincode)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid 6-digit pin code.',
            ], 422);
        }

        try {
            $response = Http::timeout(5)->get("https://api.postalpincode.in/pincode/{$cleanPincode}");

            if ($response->successful()) {
                $data = $response->json();
                if (!empty($data[0]) && ($data[0]['Status'] ?? '') === 'Success' && !empty($data[0]['PostOffice'])) {
                    $first = $data[0]['PostOffice'][0];
                    $state = $first['State'] ?? '';
                    $city = $first['District'] ?? ($first['Division'] ?? '');

                    // Extract unique Post Office / Area names for Thana selection
                    $thanas = [];
                    foreach ($data[0]['PostOffice'] as $po) {
                        $name = trim($po['Name'] ?? '');
                        if ($name && !in_array($name, $thanas)) {
                            $thanas[] = $name;
                        }
                    }

                    return response()->json([
                        'success' => true,
                        'state'   => $state,
                        'city'    => $city,
                        'thanas'  => $thanas,
                    ]);
                }
            }
        } catch (\Throwable $e) {
            // fallback
        }

        return response()->json([
            'success' => false,
            'message' => 'Pin code lookup could not find matching postal records. Please enter city, state, and thana manually.',
        ]);
    }

    /**
     * Submit passport application, upload documents, deduct coins, and create pending ServiceRequest.
     */
    public function store(Request $request)
    {
        $user = auth()->user();
        $isAdmin = $user->isAdmin() || $user->hasRole('super_admin');

        $validated = $request->validate([
            'name'                     => 'required|string|max:255',
            'father_name'              => 'required|string|max:255',
            'mother_name'              => 'required|string|max:255',
            'wife_name'                => 'nullable|string|max:255',
            'dob'                      => 'required|date',
            'address'                  => 'required|string|max:500',
            'state'                    => 'required|string|max:100',
            'city'                     => 'required|string|max:100',
            'pincode'                  => 'required|regex:/^[1-9][0-9]{5}$/',
            'mobile_number'            => 'required|regex:/^[6-9][0-9]{9}$/',
            'emergency_contact_number' => 'required|regex:/^[6-9][0-9]{9}$/',
            'email'                    => 'required|email|max:255',
            'thana'                    => 'required|string|max:150',
            'document_type'            => 'required|in:10th_marksheet,pan_card',
            'aadhar_file'              => 'required|file|mimes:pdf,jpg,jpeg,png|max:10240',
            'qualifying_file'          => 'required|file|mimes:pdf,jpg,jpeg,png|max:10240',
            'voter_file'               => 'required|file|mimes:pdf,jpg,jpeg,png|max:10240',
        ], [
            'pincode.regex'                  => 'Kripya sahi 6-digit Pin Code bharein.',
            'mobile_number.regex'            => 'Kripya sahi 10-digit Mobile Number bharein.',
            'emergency_contact_number.regex' => 'Kripya sahi 10-digit Emergency Contact Number bharein.',
            'document_type.required'         => 'Kripya 10th Marksheet ya PAN Card me se ek document chunein.',
            'aadhar_file.required'           => 'Aadhaar Card upload karna anivarya hai.',
            'qualifying_file.required'       => 'Chuna gaya document (10th Marksheet / PAN Card) upload karna anivarya hai.',
            'voter_file.required'            => 'Voter Card upload karna anivarya hai.',
            'aadhar_file.max'                => 'Aadhaar Card file ka size 10MB se kam hona chahiye.',
            'qualifying_file.max'            => 'File ka size 10MB se kam hona chahiye.',
            'voter_file.max'                 => 'Voter Card file ka size 10MB se kam hona chahiye.',
        ]);

        // Determine fee based on selected document
        $isMarksheet = $validated['document_type'] === '10th_marksheet';
        $fee = $isMarksheet ? 2750 : 2950;
        $docLabel = $isMarksheet ? '10th Marksheet' : 'PAN Card';

        // Check user coin balance
        if (!$isAdmin && $user->coins < $fee) {
            return back()->withErrors([
                'coins' => "Apke wallet me paryapt coins nahi hain. Is service ke liye {$fee} Coins chahiye, jabki aapke paas {$user->coins} Coins hain. Kripya pehle coins recharge karein.",
            ])->withInput();
        }

        $service = Service::where('slug', 'passport-apply')
            ->orWhere('module_key', 'passport_apply')
            ->first();

        // Store uploaded files in dedicated storage directory
        $storageDir = "passport-documents/{$user->id}";
        $aadharPath = $request->file('aadhar_file')->store($storageDir, 'public');
        $qualifyingPath = $request->file('qualifying_file')->store($storageDir, 'public');
        $voterPath = $request->file('voter_file')->store($storageDir, 'public');

        $inputData = [
            'Applicant Name'           => $validated['name'],
            'Father Name'              => $validated['father_name'],
            'Mother Name'              => $validated['mother_name'],
            'Wife / Spouse Name'       => !empty($validated['wife_name']) ? $validated['wife_name'] : 'N/A',
            'Date of Birth'            => $validated['dob'],
            'Mobile Number'            => $validated['mobile_number'],
            'Emergency Contact Number' => $validated['emergency_contact_number'],
            'Email Address'            => $validated['email'],
            'Full Address'             => $validated['address'],
            'Pin Code'                 => $validated['pincode'],
            'State'                    => $validated['state'],
            'City / District'          => $validated['city'],
            'Police Station (Thana)'   => $validated['thana'],
            'Selected Document Proof'  => $docLabel,
            'Fee Charged'              => ($isAdmin ? 0 : $fee) . ' Coins',
            'Aadhaar Card'             => [
                'type' => 'file',
                'path' => $aadharPath,
                'name' => $request->file('aadhar_file')->getClientOriginalName(),
            ],
            $docLabel                  => [
                'type' => 'file',
                'path' => $qualifyingPath,
                'name' => $request->file('qualifying_file')->getClientOriginalName(),
            ],
            'Voter Card'               => [
                'type' => 'file',
                'path' => $voterPath,
                'name' => $request->file('voter_file')->getClientOriginalName(),
            ],
        ];

        DB::transaction(function () use ($user, $service, $inputData, $fee, $isAdmin, $validated, $docLabel) {
            $serviceRequest = ServiceRequest::create([
                'user_id'       => $user->id,
                'service_id'    => $service ? $service->id : null,
                'service_name'  => 'Passport Apply',
                'input_data'    => $inputData,
                'coins_charged' => $isAdmin ? 0 : $fee,
                'status'        => ServiceRequest::STATUS_PENDING,
            ]);

            // Deduct coins from user
            if (!$isAdmin && $fee > 0) {
                $user->deductCoins(
                    $fee,
                    CoinTransaction::TYPE_SERVICE_DEDUCTION,
                    "Passport Apply: {$validated['name']} ({$docLabel})",
                    'passport_apply',
                    $serviceRequest->id
                );
            }

            // Alert Admins
            try {
                SystemAlert::toAdmins(
                    '🛂 New Passport Application',
                    "{$user->name} ne {$validated['name']} ke liye Passport Apply kiya (#{$serviceRequest->id}) - {$docLabel} ({$fee} Coins).",
                    '/admin/service-requests/' . $serviceRequest->id,
                    'info'
                );
            } catch (\Throwable $e) {}
        });

        return back()->with('success', "🎉 Passport Application successfully submit ho gaya hai! Documents verify karke hamari team jald aage process karegi. Fee deducted: {$fee} Coins.");
    }
}
