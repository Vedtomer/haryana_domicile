<?php

namespace App\Http\Controllers;

use App\Models\CoinTransaction;
use App\Models\Service;
use App\Models\ServiceRequest;
use App\Notifications\SystemAlert;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class VehiclePucWithoutOtpController extends Controller
{
    /**
     * Render the PUC request form and history.
     */
    public function index(Request $request)
    {
        $user = auth()->user();
        $service = Service::where('slug', 'vehicle-puc-without-otp')->first();
        $coinCost = $service ? (int) $service->coin_cost : 20;

        $recentRequests = ServiceRequest::where('user_id', $user->id)
            ->where(function ($q) use ($service) {
                if ($service) {
                    $q->where('service_id', $service->id);
                }
                $q->orWhere('service_name', 'like', '%PUC%');
            })
            ->latest()
            ->take(10)
            ->get();

        return Inertia::render('Utilities/VehiclePucWithoutOtp', [
            'service' => $service,
            'coinCost' => $coinCost,
            'userCoins' => (int) $user->coins,
            'recentRequests' => $recentRequests,
        ]);
    }

    /**
     * Handle manual PUC request submission with vehicle number, number plate photo, and RC copy.
     */
    public function submit(Request $request)
    {
        $request->validate([
            'vehicle_number'    => 'required|string|min:4|max:16',
            'number_plate_file' => 'required|file|mimes:jpg,jpeg,png,webp,pdf|max:10240',
            'rc_file'           => 'required|file|mimes:jpg,jpeg,png,webp,pdf|max:10240',
            'mobile'            => 'nullable|string|max:15',
            'note'              => 'nullable|string|max:500',
        ], [
            'vehicle_number.required'    => 'गाड़ी का नंबर (Vehicle Number) डालना अनिवार्य है।',
            'number_plate_file.required' => 'गाड़ी की नंबर प्लेट की फोटो अपलोड करना अनिवार्य है।',
            'number_plate_file.mimes'    => 'नंबर प्लेट केवल JPG, PNG, WEBP या PDF फॉर्मेट में होनी चाहिए।',
            'number_plate_file.max'      => 'नंबर प्लेट फाइल का साइज़ 10MB से अधिक नहीं होना चाहिए।',
            'rc_file.required'           => 'गाड़ी की RC (Registration Certificate) की फोटो/PDF अपलोड करना अनिवार्य है।',
            'rc_file.mimes'              => 'RC केवल JPG, PNG, WEBP या PDF फॉर्मेट में होनी चाहिए।',
            'rc_file.max'                => 'RC फाइल का साइज़ 10MB से अधिक नहीं होना चाहिए।',
        ]);

        $vehicleNo = strtoupper(trim(preg_replace('/[^A-Za-z0-9]/', '', (string) $request->input('vehicle_number'))));
        if (strlen($vehicleNo) < 4) {
            return response()->json([
                'success' => false,
                'message' => 'कृपया एक वैध गाड़ी नंबर दर्ज करें। (Enter a valid vehicle number)'
            ], 422);
        }

        $service = Service::where('slug', 'vehicle-puc-without-otp')->first();
        $user = auth()->user();
        $isAdmin = (bool) ($user->isAdmin() || $user->hasRole('super_admin') || $user->type === 'admin' || $user->type === 'super_admin');
        $coinCost = $service ? (int) $service->coin_cost : 20;

        // Check user coins balance
        if (!$isAdmin && $user->coins < $coinCost) {
            return response()->json([
                'success' => false,
                'message' => "अपर्याप्त कॉइन्स! इस सर्विस के लिए {$coinCost} कॉइन्स आवश्यक हैं। आपके पास {$user->coins} कॉइन्स हैं।"
            ], 400);
        }

        try {
            // Store uploaded documents into public storage
            $plateFile = $request->file('number_plate_file');
            $platePath = $plateFile->store('puc_requests', 'public');
            $plateName = $plateFile->getClientOriginalName();

            $rcFile = $request->file('rc_file');
            $rcPath = $rcFile->store('puc_requests', 'public');
            $rcName = $rcFile->getClientOriginalName();

            $inputData = [
                'Vehicle Registration Number' => $vehicleNo,
                'Number Plate Photo' => [
                    'type' => 'file',
                    'path' => $platePath,
                    'name' => $plateName,
                ],
                'RC Copy (Registration Certificate)' => [
                    'type' => 'file',
                    'path' => $rcPath,
                    'name' => $rcName,
                ],
            ];

            if ($request->filled('mobile')) {
                $inputData['Customer Mobile'] = trim((string) $request->input('mobile'));
            }
            if ($request->filled('note')) {
                $inputData['Customer Note'] = trim((string) $request->input('note'));
            }

            $serviceRequest = DB::transaction(function () use ($user, $service, $vehicleNo, $inputData, $coinCost, $isAdmin) {
                // 1. Create Pending Service Request
                $req = ServiceRequest::create([
                    'user_id'       => $user->id,
                    'service_id'    => $service ? $service->id : null,
                    'service_name'  => $service ? $service->name : 'Vehicle PUC (Without OTP)',
                    'input_data'    => $inputData,
                    'coins_charged' => $isAdmin ? 0 : $coinCost,
                    'status'        => ServiceRequest::STATUS_PENDING,
                ]);

                // 2. Deduct coins from user if not admin
                if (!$isAdmin && $coinCost > 0) {
                    $user->deductCoins(
                        $coinCost,
                        CoinTransaction::TYPE_SERVICE_DEDUCTION,
                        "Vehicle PUC (Without OTP) Request: {$vehicleNo}",
                        'vehicle_puc_without_otp',
                        $req->id
                    );
                }

                // 3. Notify Admins
                try {
                    SystemAlert::toAdmins(
                        '🚗 New Vehicle PUC Request',
                        "{$user->name} ne Vehicle {$vehicleNo} ke liye PUC Request (#{$req->id}) submit ki hai. Kripya check karke approve/reject karein.",
                        '/admin/service-requests/' . $req->id,
                        'info'
                    );
                } catch (\Throwable $e) {
                    Log::error('PUC SystemAlert error: ' . $e->getMessage());
                }

                return $req;
            });

            return response()->json([
                'success' => true,
                'message' => '🎉 Vehicle PUC Request सफलतापूर्वक सबमिट हो गई है! Admin द्वारा जांच के बाद अप्रूव / रिजेक्ट की जाएगी।',
                'request_id' => $serviceRequest->id,
                'data' => $serviceRequest,
                'redirect_url' => '/admin/service-requests/' . $serviceRequest->id,
            ]);

        } catch (\Exception $e) {
            Log::error('VehiclePucWithoutOtpController submit error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'सर्विस रिक्वेस्ट सबमिट करते समय त्रुटि हुई: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Backward-compatible alias for search
     */
    public function search(Request $request)
    {
        return $this->submit($request);
    }
}
