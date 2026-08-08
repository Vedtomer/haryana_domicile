<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\MarriageForm;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;

class MarriageFormController extends Controller
{
    public function index()
    {
        $forms = MarriageForm::query()->visibleTo(auth()->user())->latest()->paginate(10);

        return Inertia::render('Admin/MarriageForms/Index', [
            'forms' => $forms
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/MarriageForms/Create');
    }

    public function store(Request $request)
    {
        $service = $this->moduleService('marriage_form');

        if ($error = $this->serviceBlocker($service)) {
            return back()->withInput()->with('error', $error);
        }

        $data = $this->validated($request);
        $data['user_id'] = auth()->id();
        $form = MarriageForm::create($data);

        $this->chargeForService($service, $form->id, "Marriage Certificate #{$form->id}");

        return redirect()->route('admin.marriage-forms.index')
            ->with('success', 'Marriage Form created successfully.' . $this->chargeNote($service));
    }

    public function edit(MarriageForm $marriageForm)
    {
        $this->authorizeOwner($marriageForm);

        return Inertia::render('Admin/MarriageForms/Edit', ['form' => $marriageForm]);
    }

    public function update(Request $request, MarriageForm $marriageForm)
    {
        $this->authorizeOwner($marriageForm);
        $marriageForm->update($this->validated($request));

        return redirect()->route('admin.marriage-forms.index')->with('success', 'Marriage Form updated successfully.');
    }

    public function destroy(MarriageForm $marriageForm)
    {
        $this->authorizeOwner($marriageForm);
        $marriageForm->delete();

        return redirect()->route('admin.marriage-forms.index')->with('success', 'Marriage Form deleted successfully.');
    }

    public function print(MarriageForm $marriageForm)
    {
        $this->authorizeOwner($marriageForm);

        $pdf = Pdf::loadView('pdf.marriage_form', ['record' => $marriageForm]);
        $pdf->setPaper('A4', 'portrait');

        return $pdf->stream('Marriage_Form_' . $marriageForm->id . '.pdf');
    }

    private function validated(Request $request): array
    {
        $data = $request->validate([
            'marriage_date' => 'required|date',
            'marriage_venue' => 'required|string',
            'district' => 'required|string',
            'religion' => 'nullable|string',
            'nationality' => 'nullable|string',
            'groom_affidavit_by' => 'required|in:father,mother',
            'groom_name' => 'required|string',
            'groom_father_name' => 'required|string',
            'groom_father_father_name' => 'nullable|string',
            'groom_mother_name' => 'required|string',
            'groom_dob' => 'required|date',
            'groom_address' => 'required|string',
            'groom_father_address' => 'nullable|string',
            'bride_affidavit_by' => 'required|in:father,mother',
            'bride_name' => 'required|string',
            'bride_father_name' => 'required|string',
            'bride_father_father_name' => 'nullable|string',
            'bride_mother_name' => 'required|string',
            'bride_dob' => 'required|date',
            'bride_address' => 'required|string',
            'bride_father_address' => 'nullable|string',
            'groom_witness_name' => 'required|string',
            'groom_witness_father_name' => 'required|string',
            'groom_witness_address' => 'required|string',
            'bride_witness_name' => 'required|string',
            'bride_witness_father_name' => 'required|string',
            'bride_witness_address' => 'required|string',
            'pandit_name' => 'required|string',
            'pandit_father_name' => 'required|string',
            'pandit_address' => 'required|string',
        ]);

        // Age is "in complete years, as on the date of marriage" — always derive it
        // server-side from DOB rather than trusting a client-computed value.
        $data['groom_age'] = (int) \Carbon\Carbon::parse($data['groom_dob'])->diffInYears($data['marriage_date']);
        $data['bride_age'] = (int) \Carbon\Carbon::parse($data['bride_dob'])->diffInYears($data['marriage_date']);

        return $data;
    }
}
