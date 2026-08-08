<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Service;
use Illuminate\Http\Request;
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
        $services = Service::withCount('requests')->ordered()->get();

        return Inertia::render('Admin/Services/Index', [
            'services' => $services,
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Services/Create');
    }

    public function store(Request $request)
    {
        $data = $this->validated($request);
        Service::create($data);

        return redirect()->route('admin.services.index')->with('success', 'Service added successfully.');
    }

    public function edit(Service $service)
    {
        return Inertia::render('Admin/Services/Edit', [
            'service' => $service,
        ]);
    }

    public function update(Request $request, Service $service)
    {
        $service->update($this->validated($request, $service));

        return redirect()->route('admin.services.index')->with('success', 'Service updated successfully.');
    }

    public function destroy(Service $service)
    {
        // Built-in modules are wired into real forms — hide them instead of deleting.
        if ($service->isModule()) {
            return back()->with('error', 'Built-in services cannot be deleted. Switch them off instead.');
        }

        $service->delete();

        return back()->with('success', 'Service deleted.');
    }

    private function validated(Request $request, ?Service $service = null): array
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'icon' => 'nullable|string|max:16',
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
