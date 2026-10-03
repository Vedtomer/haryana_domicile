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
        $services = Service::withCount('requests')
            ->ordered()
            ->get()
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
        $data['visibility'] = $request->input('visibility', Service::VISIBILITY_PUBLIC);

        $data = $this->handleLogo($request, $data);

        $service = Service::create($data);

        if ($request->has('user_ids') && is_array($request->input('user_ids'))) {
            $service->users()->sync($request->input('user_ids'));
        }

        try {
            \Illuminate\Support\Facades\Cache::flush();
            \Illuminate\Support\Facades\Artisan::call('cache:clear');
            if (function_exists('opcache_reset')) {
                @opcache_reset();
            }
        } catch (\Throwable $e) {}

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
        if ($request->has('visibility')) {
            $data['visibility'] = $request->input('visibility');
        }

        $data = $this->handleLogo($request, $data, $service);

        $service->update($data);

        if ($request->has('user_ids') && is_array($request->input('user_ids'))) {
            $service->users()->sync($request->input('user_ids'));
        }

        try {
            \Illuminate\Support\Facades\Cache::flush();
            \Illuminate\Support\Facades\Artisan::call('cache:clear');
            if (function_exists('opcache_reset')) {
                @opcache_reset();
            }
        } catch (\Throwable $e) {}

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
        $name = $service->name;

        if ($service->logo) {
            Storage::disk('public')->delete($service->logo);
        }

        $service->users()->detach();

        // Nullify foreign references in requests so deletion succeeds cleanly
        \App\Models\ServiceRequest::where('service_id', $service->id)->update(['service_id' => null]);

        // Permanently delete so it cannot be revived by queries or migrations
        $service->forceDelete();

        try {
            \Illuminate\Support\Facades\Cache::flush();
            \Illuminate\Support\Facades\Artisan::call('cache:clear');
            if (function_exists('opcache_reset')) {
                @opcache_reset();
            }
        } catch (\Throwable $e) {}

        return back()->with('success', "Service '{$name}' has been removed successfully.");
    }

    public function toggleActive(Service $service)
    {
        $service->is_active = !$service->is_active;
        $service->save();

        try {
            \Illuminate\Support\Facades\Cache::flush();
            \Illuminate\Support\Facades\Artisan::call('cache:clear');
            if (function_exists('opcache_reset')) {
                @opcache_reset();
            }
        } catch (\Throwable $e) {}

        $statusText = $service->is_active ? 'Visible (Unhidden / दिख रहा है)' : 'Hidden (Hide / छुपा दिया गया)';

        return back()->with('success', "Service '{$service->name}' is now {$statusText}.");
    }

    private function validated(Request $request, ?Service $service = null): array
    {
        // Explicitly cast is_active to real boolean (handles string "false"/"true", 0, 1 from FormData)
        $request->merge([
            'is_active' => $request->boolean('is_active'),
        ]);

        $data = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'icon' => 'nullable|string|max:16',
            'logo' => 'nullable|image|max:2048',
            'remove_logo' => 'nullable|boolean',
            'coin_cost' => 'required|integer|min:0|max:100000',
            'is_active' => 'required|boolean',
            'visibility' => ['nullable', 'string', Rule::in([Service::VISIBILITY_PUBLIC, Service::VISIBILITY_PRIVATE])],
            'sort_order' => 'nullable|integer|min:0|max:9999',
            'user_ids' => 'nullable|array',
            'user_ids.*' => 'integer|exists:users,id',
            'fields' => 'nullable|array',
            'fields.*.label' => 'required|string|max:120',
            'fields.*.type' => ['required', Rule::in(['text', 'number', 'date', 'textarea', 'file'])],
            'fields.*.required' => 'boolean',
        ]);

        $data['sort_order'] = $data['sort_order'] ?? 0;
        unset($data['user_ids']);

        // Built-in modules keep their wiring; price, active status, name, icon, and visibility are editable.
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
