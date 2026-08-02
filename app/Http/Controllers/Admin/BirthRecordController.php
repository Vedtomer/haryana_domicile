<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\BirthRecord;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;

class BirthRecordController extends Controller
{
    public function index()
    {
        $query = BirthRecord::query();
        
        if (!auth()->user()->hasRole('super_admin') && !auth()->user()->isAdmin()) {
            $query->where('user_id', auth()->id());
        }
        
        $records = $query->latest()->paginate(10);
        
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
        $data = $request->validate([
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
        ]);

        $data['user_id'] = auth()->id();
        BirthRecord::create($data);

        return redirect()->route('admin.birth-records.index')->with('success', 'Birth Record created successfully.');
    }
}
