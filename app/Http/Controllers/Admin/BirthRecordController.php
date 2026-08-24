<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\BirthRecord;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BirthRecordController extends Controller
{
    public function index()
    {
        $records = BirthRecord::query()->visibleTo(auth()->user())->latest()->paginate(10);

        return Inertia::render('Admin/BirthRecords/Index', [
            'records' => $records
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/BirthRecords/Create');
    }

    public function store(Request $request)
    {
        $service = $this->moduleService('birth_record');

        if ($error = $this->serviceBlocker($service)) {
            return back()->withInput()->with('error', $error);
        }

        $data = $this->validated($request);
        $data['user_id'] = auth()->id();

        if ($request->hasFile('father_signature')) {
            $data['father_signature'] = $request->file('father_signature')->store('birth_records/signatures', 'public');
        } else {
            unset($data['father_signature']);
        }

        if ($request->hasFile('mother_signature')) {
            $data['mother_signature'] = $request->file('mother_signature')->store('birth_records/signatures', 'public');
        } else {
            unset($data['mother_signature']);
        }

        $record = BirthRecord::create($data);

        $this->chargeForService($service, $record->id, "Birth Certificate #{$record->id}");

        if ($request->boolean('save_and_create')) {
            return redirect()->route('admin.birth-records.create')
            ->with('success', 'Birth Record created successfully.' . $this->chargeNote($service));
        }

        return redirect()->route('admin.birth-records.index')
            ->with('success', 'Birth Record created successfully.' . $this->chargeNote($service));
    }

    public function edit(BirthRecord $birthRecord)
    {
        $this->authorizeOwner($birthRecord);

        return Inertia::render('Admin/BirthRecords/Edit', ['record' => $birthRecord]);
    }

    public function update(Request $request, BirthRecord $birthRecord)
    {
        $this->authorizeOwner($birthRecord);
        $data = $this->validated($request);

        if ($request->hasFile('father_signature')) {
            $data['father_signature'] = $request->file('father_signature')->store('birth_records/signatures', 'public');
        } else {
            unset($data['father_signature']); // Prevent updating with string if it fails validation or is not sent
        }

        if ($request->hasFile('mother_signature')) {
            $data['mother_signature'] = $request->file('mother_signature')->store('birth_records/signatures', 'public');
        } else {
            unset($data['mother_signature']);
        }

        $birthRecord->update($data);

        return redirect()->route('admin.birth-records.index')->with('success', 'Birth Record updated successfully.');
    }

    public function destroy(BirthRecord $birthRecord)
    {
        $this->authorizeOwner($birthRecord);
        $birthRecord->delete();

        return redirect()->route('admin.birth-records.index')->with('success', 'Birth Record deleted successfully.');
    }

    private function validated(Request $request): array
    {
        return $request->validate([
            'district' => 'required|string',
            'father_name' => 'required|string',
            'mother_name' => 'required|string',
            'permanent_address' => 'required|string',
            'issuing_authority' => 'required|string',
            'record_year' => 'required|string',
            'registration_no' => 'required|string',
            'date_of_registration' => 'required|date',
            'record_father_name' => 'nullable|string',
            'record_mother_name' => 'nullable|string',
            'child_name' => 'required|string',
            'gender' => 'required|string',
            'dob' => 'required|date',
            'address_parents_birth' => 'required|string',
            'school_child_name' => 'nullable|string',
            'school_dob' => 'nullable|date',
            'school_father_name' => 'nullable|string',
            'school_mother_name' => 'nullable|string',
            'other_children' => 'nullable|array',
            'other_children.*.name' => 'required|string',
            'other_children.*.dob' => 'required|date',
            'other_children.*.birth_place' => 'nullable|string',
            'other_children.*.is_recorded' => 'required|string',
            'father_signature' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:5120',
            'mother_signature' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:5120',
        ]);
    }
}
