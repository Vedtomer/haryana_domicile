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
        $query = MarriageForm::query();
        
        if (!auth()->user()->hasRole('super_admin') && !auth()->user()->isAdmin()) {
            $query->where('user_id', auth()->id());
        }
        
        $forms = $query->latest()->paginate(10);
        
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
        $data = $request->validate([
            'marriage_date' => 'required|date',
            'marriage_venue' => 'required|string',
            'groom_name' => 'required|string',
            'groom_father_name' => 'required|string',
            'groom_age' => 'required|numeric',
            'groom_address' => 'required|string',
            'bride_name' => 'required|string',
            'bride_father_name' => 'required|string',
            'bride_age' => 'required|numeric',
            'bride_address' => 'required|string',
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

        $data['user_id'] = auth()->id();
        MarriageForm::create($data);

        return redirect()->route('admin.marriage-forms.index')->with('success', 'Marriage Form created successfully.');
    }

    public function print(MarriageForm $marriageForm)
    {
        // Check permissions
        if (!auth()->user()->hasRole('super_admin') && !auth()->user()->isAdmin() && $marriageForm->user_id !== auth()->id()) {
            abort(403);
        }

        $pdf = Pdf::loadView('pdf.marriage_form', ['record' => $marriageForm]);
        $pdf->setPaper('A4', 'portrait');
        
        return response()->streamDownload(function () use ($pdf) {
            echo $pdf->output();
        }, 'Marriage_Form_' . $marriageForm->id . '.pdf');
    }
}
