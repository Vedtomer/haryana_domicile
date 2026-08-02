<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\HaryanaDomicile;
use Illuminate\Http\Request;
use Inertia\Inertia;

class HaryanaDomicileController extends Controller
{
    public function index()
    {
        $query = HaryanaDomicile::query();
        
        if (!auth()->user()->hasRole('super_admin') && !auth()->user()->isAdmin()) {
            $query->where('user_id', auth()->id());
        }
        
        $records = $query->latest()->paginate(10);
        
        return Inertia::render('Admin/HaryanaDomicile/Index', [
            'records' => $records
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/HaryanaDomicile/Create');
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'pincode' => 'nullable|string|max:6',
            'tehsil' => 'required|string|max:255',
            'district' => 'required|string|max:255',
            'name' => 'required|string|max:255',
            'father_name' => 'required|string',
            'village' => 'required|string|max:255',
            'ward_no' => 'nullable|string|max:255',
            'age' => 'nullable|numeric',
            'mobile' => 'required|string|max:10',
            'aadhar' => 'required|string|max:12',
            'ration_card_no' => 'nullable|string|max:255',
            'caste' => 'required|string|max:255',
            'religion' => 'nullable|string',
            'child_name' => 'nullable|string|max:255',
        ]);

        $data['user_id'] = auth()->id();
        HaryanaDomicile::create($data);

        return redirect()->route('admin.haryana-domicile.index')->with('success', 'Haryana Domicile record created successfully.');
    }
}
