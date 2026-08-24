<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\MarriageAffidavit;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;

class MarriageAffidavitController extends Controller
{
    public function index()
    {
        $affidavits = MarriageAffidavit::query()->visibleTo(auth()->user())->latest()->paginate(10);

        return Inertia::render('Admin/MarriageAffidavits/Index', [
            'affidavits' => $affidavits
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/MarriageAffidavits/Create');
    }

    public function store(Request $request)
    {
        $service = $this->moduleService('marriage_affidavit');

        if ($error = $this->serviceBlocker($service)) {
            return back()->withInput()->with('error', $error);
        }

        $data = $this->validated($request);
        $data['user_id'] = auth()->id();
        $affidavit = MarriageAffidavit::create($data);

        $this->chargeForService($service, $affidavit->id, "New Marriage Certificate #{$affidavit->id}");

        if ($request->boolean('save_and_create')) {
            return redirect()->route('admin.marriage-affidavits.create')
            ->with('success', 'Marriage Affidavit created successfully.' . $this->chargeNote($service));
        }

        return redirect()->route('admin.marriage-affidavits.index')
            ->with('success', 'Marriage Affidavit created successfully.' . $this->chargeNote($service));
    }

    public function edit(MarriageAffidavit $marriageAffidavit)
    {
        $this->authorizeOwner($marriageAffidavit);

        return Inertia::render('Admin/MarriageAffidavits/Edit', ['affidavit' => $marriageAffidavit]);
    }

    public function update(Request $request, MarriageAffidavit $marriageAffidavit)
    {
        $this->authorizeOwner($marriageAffidavit);
        $marriageAffidavit->update($this->validated($request));

        return redirect()->route('admin.marriage-affidavits.index')->with('success', 'Marriage Affidavit updated successfully.');
    }

    public function destroy(MarriageAffidavit $marriageAffidavit)
    {
        $this->authorizeOwner($marriageAffidavit);
        $marriageAffidavit->delete();

        return redirect()->route('admin.marriage-affidavits.index')->with('success', 'Marriage Affidavit deleted successfully.');
    }

    public function print(MarriageAffidavit $marriageAffidavit)
    {
        $this->authorizeOwner($marriageAffidavit);

        $pdf = Pdf::loadView('pdf.marriage_affidavit', ['record' => $marriageAffidavit]);
        $pdf->setPaper('A4', 'portrait');

        return $pdf->stream('Marriage_Affidavit_' . $marriageAffidavit->id . '.pdf');
    }

    private function validated(Request $request): array
    {
        $data = $request->validate([
            'marriage_date' => 'required|date',
            'marriage_venue' => 'required|string',
            'religion' => 'nullable|string',
            'groom_name' => 'required|string',
            'groom_father_name' => 'required|string',
            'groom_address' => 'required|string',
            'groom_dob' => 'required|date',
            'bride_name' => 'required|string',
            'bride_father_name' => 'required|string',
            'bride_address' => 'required|string',
            'bride_dob' => 'required|date',
        ]);

        // Age is "at the time of marriage" — always derive it server-side from DOB
        // rather than trusting a client-computed value.
        $data['groom_age'] = (int) \Carbon\Carbon::parse($data['groom_dob'])->diffInYears($data['marriage_date']);
        $data['bride_age'] = (int) \Carbon\Carbon::parse($data['bride_dob'])->diffInYears($data['marriage_date']);

        return $data;
    }
}
