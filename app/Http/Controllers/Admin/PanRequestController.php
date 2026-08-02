<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PanRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class PanRequestController extends Controller
{
    public function index()
    {
        $query = PanRequest::with('user');
        
        if (!auth()->user()->hasRole('super_admin') && !auth()->user()->isAdmin()) {
            $query->where('user_id', auth()->id());
        }
        
        $requests = $query->latest()->paginate(10);
        
        return Inertia::render('Admin/PanRequests/Index', [
            'requests' => $requests,
            'isAdmin' => auth()->user()->isAdmin() || auth()->user()->hasRole('super_admin')
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/PanRequests/Create');
    }

    public function store(Request $request)
    {
        // Standard user creation route
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'aadhar_number' => 'required|string|max:12',
            'mobile' => 'required|string|max:10',
            'utr_number' => 'required|string|max:255',
            'photo' => 'required|image|max:2048',
            'signature' => 'required|image|max:2048',
            'aadhar_card_doc' => 'required|mimes:pdf,jpg,jpeg,png|max:2048',
            'additional_document' => 'nullable|mimes:pdf,jpg,jpeg,png|max:2048',
        ]);

        $data['user_id'] = auth()->id();
        $data['status'] = 'pending';

        if ($request->hasFile('photo')) {
            $data['photo'] = $request->file('photo')->store('pan-documents', 'public');
        }
        if ($request->hasFile('signature')) {
            $data['signature'] = $request->file('signature')->store('pan-documents', 'public');
        }
        if ($request->hasFile('aadhar_card_doc')) {
            $data['aadhar_card_doc'] = $request->file('aadhar_card_doc')->store('pan-documents', 'public');
        }
        if ($request->hasFile('additional_document')) {
            $data['additional_document'] = $request->file('additional_document')->store('pan-documents', 'public');
        }

        PanRequest::create($data);

        return redirect()->route('admin.pan-requests.index')->with('success', 'PAN Request submitted successfully.');
    }

    public function edit(PanRequest $panRequest)
    {
        if (!auth()->user()->hasRole('super_admin') && !auth()->user()->isAdmin() && $panRequest->user_id !== auth()->id()) {
            abort(403);
        }

        return Inertia::render('Admin/PanRequests/Edit', [
            'panRequest' => $panRequest,
            'isAdmin' => auth()->user()->isAdmin() || auth()->user()->hasRole('super_admin')
        ]);
    }

    public function update(Request $request, PanRequest $panRequest)
    {
        $isAdmin = auth()->user()->isAdmin() || auth()->user()->hasRole('super_admin');
        
        if (!$isAdmin) {
            abort(403, 'Only admins can update PAN requests.');
        }

        $data = $request->validate([
            'status' => 'required|in:pending,accepted,rejected',
            'admin_notes' => 'nullable|string',
            'slip_document' => 'nullable|mimes:pdf,jpg,jpeg,png|max:5120',
            'final_pdf' => 'nullable|mimes:pdf|max:5120',
        ]);

        if ($request->hasFile('slip_document')) {
            $data['slip_document'] = $request->file('slip_document')->store('pan-slips', 'public');
        }
        if ($request->hasFile('final_pdf')) {
            $data['final_pdf'] = $request->file('final_pdf')->store('pan-final-pdfs', 'public');
        }

        $panRequest->update($data);

        return redirect()->route('admin.pan-requests.index')->with('success', 'PAN Request updated successfully.');
    }
}
