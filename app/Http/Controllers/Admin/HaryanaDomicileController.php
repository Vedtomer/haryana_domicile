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
        $records = HaryanaDomicile::query()->visibleTo(auth()->user())->latest()->paginate(10);

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
        $data = $this->validated($request);
        $data['user_id'] = auth()->id();
        HaryanaDomicile::create($data);

        return redirect()->route('admin.haryana-domicile.index')->with('success', 'Haryana Domicile record created successfully.');
    }

    public function edit(HaryanaDomicile $haryanaDomicile)
    {
        $this->authorizeOwner($haryanaDomicile);

        return Inertia::render('Admin/HaryanaDomicile/Edit', ['record' => $haryanaDomicile]);
    }

    public function update(Request $request, HaryanaDomicile $haryanaDomicile)
    {
        $this->authorizeOwner($haryanaDomicile);
        $haryanaDomicile->update($this->validated($request));

        return redirect()->route('admin.haryana-domicile.index')->with('success', 'Haryana Domicile record updated successfully.');
    }

    public function destroy(HaryanaDomicile $haryanaDomicile)
    {
        $this->authorizeOwner($haryanaDomicile);
        $haryanaDomicile->delete();

        return redirect()->route('admin.haryana-domicile.index')->with('success', 'Haryana Domicile record deleted successfully.');
    }

    private function validated(Request $request): array
    {
        return $request->validate([
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
    }
}
