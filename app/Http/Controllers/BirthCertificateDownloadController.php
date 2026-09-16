<?php

namespace App\Http\Controllers;

use App\Models\BirthRecord;
use App\Models\Service;
use App\Models\ServiceRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BirthCertificateDownloadController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();
        $recentRecords = BirthRecord::query()
            ->visibleTo($user)
            ->latest()
            ->take(10)
            ->get();

        return Inertia::render('Utilities/BirthCertificateDownload', [
            'recentRecords' => $recentRecords,
            'defaultRegNo' => $request->query('reg_no', ''),
        ]);
    }

    public function search(Request $request)
    {
        $request->validate([
            'registration_no' => 'required|string',
        ]);

        $regNo = trim($request->input('registration_no'));
        $color = $request->input('color', 'blue');
        $border = $request->boolean('border', true) ? '1' : '0';

        $user = auth()->user();

        // 1. Search locally in BirthRecords table
        $record = BirthRecord::query()
            ->visibleTo($user)
            ->where(function ($q) use ($regNo) {
                $q->where('registration_no', $regNo)
                  ->orWhere('registration_no', 'like', "%{$regNo}%")
                  ->orWhere('id', $regNo);
            })
            ->latest()
            ->first();

        // Also check if admin or if record exists anywhere
        if (!$record && ($user->isAdmin() || $user->hasRole('super_admin'))) {
            $record = BirthRecord::where('registration_no', $regNo)
                ->orWhere('registration_no', 'like', "%{$regNo}%")
                ->latest()
                ->first();
        }

        if ($record) {
            $service = Service::where('slug', 'birth-certificate')->first();

            ServiceRequest::create([
                'user_id' => $user->id,
                'service_id' => $service ? $service->id : null,
                'service_name' => 'Birth Certificate Download',
                'input_data' => [
                    'Registration Number' => $record->registration_no,
                    'Child Name' => $record->child_name,
                    'Color' => $color,
                ],
                'coins_charged' => 0,
                'status' => ServiceRequest::STATUS_COMPLETED,
                'completed_at' => now(),
            ]);

            $printUrl = route('birth-records.print', [
                'record' => $record->id,
                'color' => $color,
                'border' => $border,
                'auto' => 1,
            ]);

            return response()->json([
                'success' => true,
                'record' => $record,
                'print_url' => $printUrl,
                'message' => 'Birth Certificate record found successfully!',
            ]);
        }

        return response()->json([
            'success' => false,
            'not_found' => true,
            'message' => "सर्टिफिकेट/रजिस्ट्रेशन नंबर \"{$regNo}\" का रिकॉर्ड नहीं मिला। नीचे दिए गए विवरण भरकर तुरंत 1 क्लिक में PDF जनरेट करें।",
        ]);
    }

    public function quickGenerate(Request $request)
    {
        $validated = $request->validate([
            'registration_no' => 'required|string',
            'child_name' => 'required|string',
            'gender' => 'required|string',
            'dob' => 'required|date',
            'father_name' => 'required|string',
            'mother_name' => 'required|string',
            'district' => 'required|string',
            'permanent_address' => 'required|string',
            'issuing_authority' => 'nullable|string',
            'record_year' => 'nullable|string',
            'date_of_registration' => 'nullable|date',
            'color' => 'nullable|string',
            'border' => 'nullable|boolean',
        ]);

        $user = auth()->user();

        $validated['user_id'] = $user->id;
        $validated['issuing_authority'] = $validated['issuing_authority'] ?: 'जिला रजिस्ट्रार / नगर निगम';
        $validated['record_year'] = $validated['record_year'] ?: date('Y', strtotime($validated['dob']));
        $validated['date_of_registration'] = $validated['date_of_registration'] ?: $validated['dob'];
        $validated['address_parents_birth'] = $validated['permanent_address'];
        $validated['record_father_name'] = $validated['father_name'];
        $validated['record_mother_name'] = $validated['mother_name'];

        $color = $request->input('color', 'blue');
        $border = $request->boolean('border', true) ? '1' : '0';

        $record = BirthRecord::create($validated);

        $service = Service::where('slug', 'birth-certificate')->first();

        ServiceRequest::create([
            'user_id' => $user->id,
            'service_id' => $service ? $service->id : null,
            'service_name' => 'Birth Certificate Name Add',
            'input_data' => [
                'Registration Number' => $record->registration_no,
                'Child Name' => $record->child_name,
                'Color' => $color,
            ],
            'coins_charged' => 0,
            'status' => ServiceRequest::STATUS_COMPLETED,
            'completed_at' => now(),
        ]);

        $printUrl = route('birth-records.print', [
            'record' => $record->id,
            'color' => $color,
            'border' => $border,
            'auto' => 1,
        ]);

        return response()->json([
            'success' => true,
            'record' => $record,
            'print_url' => $printUrl,
            'message' => 'Birth Certificate declaration generated successfully!',
        ]);
    }
}
