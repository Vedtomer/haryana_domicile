<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\RentAgreement;
use App\Notifications\SystemAlert;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RentAgreementController extends Controller
{
    public function index()
    {
        $records = RentAgreement::query()
            ->visibleTo(auth()->user())
            ->latest()
            ->paginate(10);

        return Inertia::render('Admin/RentAgreement/Index', [
            'records' => $records,
        ]);
    }

    public function create()
    {
        $service = $this->moduleService('rent_agreement') ?? $this->moduleService('bob_affidavit');
        if ($error = $this->serviceBlocker($service)) {
            return redirect()->route('dashboard')->with('error', $error);
        }

        return Inertia::render('Admin/RentAgreement/Create', [
            'coinCost' => $service?->coin_cost ?? 149,
        ]);
    }

    public function store(Request $request)
    {
        $service = $this->moduleService('rent_agreement') ?? $this->moduleService('bob_affidavit');

        if ($error = $this->serviceBlocker($service)) {
            return back()->withInput()->with('error', $error);
        }

        $data = $this->validated($request);
        $data['user_id'] = auth()->id();
        $record = RentAgreement::create($data);

        $this->chargeForService($service, $record->id, "Rent Agreement #{$record->id}");

        SystemAlert::toAdmins(
            'New Rent Agreement Created',
            auth()->user()->name . " created a Rent Agreement (#{$record->id}) for {$record->first_party_name}.",
            '/admin/rent-agreement'
        );

        if ($request->boolean('save_and_create')) {
            return redirect()->route('admin.rent-agreement.create')
                ->with('success', 'Rent Agreement created successfully.' . $this->chargeNote($service));
        }

        return redirect()->route('admin.rent-agreement.index')
            ->with('success', 'Rent Agreement created successfully. File is ready!' . $this->chargeNote($service))
            ->with('print_id', $record->id);
    }

    public function edit(RentAgreement $rentAgreement)
    {
        $this->authorizeOwner($rentAgreement);

        return Inertia::render('Admin/RentAgreement/Edit', [
            'record' => $rentAgreement,
        ]);
    }

    public function update(Request $request, RentAgreement $rentAgreement)
    {
        $this->authorizeOwner($rentAgreement);

        $rentAgreement->update($this->validated($request));

        return redirect()->route('admin.rent-agreement.index')
            ->with('success', 'Rent Agreement record updated successfully.')
            ->with('print_id', $rentAgreement->id);
    }

    public function destroy(RentAgreement $rentAgreement)
    {
        $this->authorizeOwner($rentAgreement);

        $rentAgreement->delete();

        return redirect()->route('admin.rent-agreement.index')
            ->with('success', 'Rent Agreement record deleted successfully.');
    }

    public function print(RentAgreement $rentAgreement)
    {
        $this->authorizeOwner($rentAgreement);

        $pdf = Pdf::loadView('pdf.rent_agreement', ['record' => $rentAgreement]);
        $pdf->setPaper('A4', 'portrait');

        $cleanName = preg_replace('/[^A-Za-z0-9_\-]/', '_', $rentAgreement->first_party_name);
        $filename = 'Rent_Agreement_' . ($cleanName ?: $rentAgreement->id) . '.pdf';

        return $pdf->stream($filename);
    }

    private function validated(Request $request): array
    {
        return $request->validate([
            'first_party_name' => 'required|string|max:255',
            'first_party_aadhar' => 'nullable|string|max:50',
            'first_party_father_name' => 'required|string|max:255',
            'first_party_address' => 'required|string|max:1000',
            'second_party_name' => 'required|string|max:255',
            'second_party_father_name' => 'required|string|max:255',
            'second_party_address' => 'required|string|max:1000',
            'property_owner_title' => 'nullable|string|max:100',
            'property_type' => 'nullable|string|max:100',
            'property_area' => 'required|string|max:100',
            'property_location' => 'required|string|max:1000',
            'property_city' => 'required|string|max:100',
            'tenancy_months' => 'required|integer|min:1|max:120',
            'from_date' => 'required|string|max:50',
            'to_date' => 'required|string|max:50',
            'monthly_rent' => 'required|string|max:50',
            'monthly_rent_words' => 'required|string|max:255',
            'agreement_date' => 'required|string|max:50',
        ]);
    }
}
