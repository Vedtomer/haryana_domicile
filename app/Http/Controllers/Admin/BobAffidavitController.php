<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\BobAffidavit;
use App\Notifications\SystemAlert;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BobAffidavitController extends Controller
{
    public function index()
    {
        $records = BobAffidavit::query()->visibleTo(auth()->user())->latest()->paginate(10);

        return Inertia::render('Admin/BobAffidavit/Index', [
            'records' => $records,
        ]);
    }

    public function create()
    {
        $service = $this->moduleService('bob_affidavit');
        if ($error = $this->serviceBlocker($service)) {
            return redirect()->route('dashboard')->with('error', $error);
        }

        return Inertia::render('Admin/BobAffidavit/Create', [
            'coinCost' => $service?->coin_cost ?? 149,
        ]);
    }

    public function store(Request $request)
    {
        $service = $this->moduleService('bob_affidavit');

        if ($error = $this->serviceBlocker($service)) {
            return back()->withInput()->with('error', $error);
        }

        $data = $this->validated($request);
        $data['user_id'] = auth()->id();
        $record = BobAffidavit::create($data);

        $this->chargeForService($service, $record->id, "BOB Affidavit #{$record->id}");

        SystemAlert::toAdmins(
            'New BOB Affidavit Created',
            auth()->user()->name . " created a Bank of Baroda Affidavit (#{$record->id}).",
            '/admin/bob-affidavit'
        );

        if ($request->boolean('save_and_create')) {
            return redirect()->route('bob-affidavit.create')
                ->with('success', 'BOB Affidavit created successfully.' . $this->chargeNote($service));
        }

        return redirect()->route('bob-affidavit.index')
            ->with('success', 'BOB Affidavit created successfully.' . $this->chargeNote($service));
    }

    public function edit(BobAffidavit $bobAffidavit)
    {
        $this->authorizeOwner($bobAffidavit);

        return Inertia::render('Admin/BobAffidavit/Edit', [
            'record' => $bobAffidavit,
        ]);
    }

    public function update(Request $request, BobAffidavit $bobAffidavit)
    {
        $this->authorizeOwner($bobAffidavit);

        $bobAffidavit->update($this->validated($request));

        return redirect()->route('bob-affidavit.index')
            ->with('success', 'BOB Affidavit record updated successfully.');
    }

    public function destroy(BobAffidavit $bobAffidavit)
    {
        $this->authorizeOwner($bobAffidavit);

        $bobAffidavit->delete();

        return redirect()->route('bob-affidavit.index')
            ->with('success', 'BOB Affidavit record deleted successfully.');
    }

    public function print(BobAffidavit $bobAffidavit)
    {
        $this->authorizeOwner($bobAffidavit);

        $pdf = Pdf::loadView('pdf.bob_affidavit', ['record' => $bobAffidavit]);
        $pdf->setPaper('A4', 'portrait');

        $filename = 'BOB_Affidavit_' . ($bobAffidavit->account_no ?: $bobAffidavit->id) . '.pdf';

        return $pdf->stream($filename);
    }

    private function validated(Request $request): array
    {
        return $request->validate([
            'name' => 'required|string|max:255',
            'father_name' => 'required|string|max:255',
            'gender' => 'required|string|in:Male,Female,Other',
            'age' => 'nullable|integer|min:1|max:120',
            'dob' => 'nullable|date',
            'mobile' => 'required|string|size:10',
            'aadhar' => 'nullable|string|size:12',
            'pan_no' => 'nullable|string|max:10',
            'village' => 'required|string|max:500',
            'tehsil' => 'required|string|max:255',
            'district' => 'required|string|max:255',
            'state' => 'required|string|max:255',
            'pincode' => 'nullable|string|size:6',
            'account_no' => 'required|string|max:50',
            'cif_no' => 'nullable|string|max:50',
            'branch_name' => 'required|string|max:255',
            'ifsc_code' => 'nullable|string|max:25',
            'affidavit_type' => 'required|string|max:100',
            'reason' => 'required|string|max:2000',
            'notes' => 'nullable|string|max:1000',
        ]);
    }
}
