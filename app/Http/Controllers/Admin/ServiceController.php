<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Service;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

/**
 * Admin-only catalog management: add services, set their coin price
 * (0 = free), and choose which ones users can see.
 */
class ServiceController extends Controller
{
    public function index()
    {
        $services = Service::withCount('requests')->ordered()->get()
            ->map(fn (Service $service) => [...$service->toArray(), 'logo_url' => $service->logoUrl()]);

        return Inertia::render('Admin/Services/Index', [
            'services' => $services,
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Services/Create', [
            'users' => $this->userOptions(),
        ]);
    }

    public function store(Request $request)
    {
        $data = $this->validated($request);
        $data['visibility'] = Service::VISIBILITY_PUBLIC;

        $data = $this->handleLogo($request, $data);

        $service = Service::create($data);

        return redirect()->route('admin.services.index')->with('success', 'Service added successfully.');
    }

    public function edit(Service $service)
    {
        $service->load('users:id');

        return Inertia::render('Admin/Services/Edit', [
            'service' => [
                ...$service->toArray(),
                'logo_url' => $service->logoUrl(),
            ],
            'users' => $this->userOptions(),
        ]);
    }

    public function update(Request $request, Service $service)
    {
        $data = $this->validated($request, $service);
        $data['visibility'] = Service::VISIBILITY_PUBLIC;

        $data = $this->handleLogo($request, $data, $service);

        $service->update($data);

        return redirect()->route('admin.services.index')->with('success', 'Service updated successfully.');
    }

    /**
     * Store an uploaded logo (replacing any previous one) or clear it when
     * "remove_logo" was checked. Leaves $data untouched when neither happens,
     * so an update() call doesn't wipe out an existing logo.
     */
    private function handleLogo(Request $request, array $data, ?Service $service = null): array
    {
        // validate() includes 'logo' => null whenever the field was merely
        // present in the request (which the form always sends), not just
        // when a file was uploaded. Drop it so update() doesn't wipe an
        // existing logo on every unrelated field edit.
        unset($data['logo'], $data['remove_logo']);

        if ($request->hasFile('logo')) {
            if ($service?->logo) {
                Storage::disk('public')->delete($service->logo);
            }
            $data['logo'] = $request->file('logo')->store('service-logos', 'public');
        } elseif ($request->boolean('remove_logo') && $service?->logo) {
            Storage::disk('public')->delete($service->logo);
            $data['logo'] = null;
        }

        return $data;
    }

    /**
     * Regular users, for the private-visibility picker.
     */
    private function userOptions()
    {
        return User::where('type', 'user')
            ->orderBy('name')
            ->get(['id', 'name', 'email', 'phone']);
    }

    public function destroy(Service $service)
    {
        $service->delete();

        return back()->with('success', 'Service deleted.');
    }

    private function validated(Request $request, ?Service $service = null): array
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'icon' => 'nullable|string|max:16',
            'logo' => 'nullable|image|max:2048',
            'remove_logo' => 'nullable|boolean',
            'coin_cost' => 'required|integer|min:0|max:100000',
            'is_active' => 'required|boolean',
            'sort_order' => 'nullable|integer|min:0|max:9999',
            'fields' => 'nullable|array',
            'fields.*.label' => 'required|string|max:120',
            'fields.*.type' => ['required', Rule::in(['text', 'number', 'date', 'textarea', 'file'])],
            'fields.*.required' => 'boolean',
        ]);

        $data['sort_order'] = $data['sort_order'] ?? 0;

        // Built-in modules keep their wiring; only the price/visibility is editable.
        if ($service && $service->isModule()) {
            unset($data['fields']);

            return $data;
        }

        $data['kind'] = Service::KIND_MANUAL;
        $data['slug'] = $service?->slug ?? $this->uniqueSlug($data['name']);

        return $data;
    }

    private function uniqueSlug(string $name): string
    {
        $base = Str::slug($name) ?: 'service';
        $slug = $base;
        $i = 2;

        while (Service::where('slug', $slug)->exists()) {
            $slug = $base . '-' . $i++;
        }

        return $slug;
    }
}
