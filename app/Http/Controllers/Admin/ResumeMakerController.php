<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Resume;
use App\Notifications\SystemAlert;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ResumeMakerController extends Controller
{
    public function index()
    {
        $service = $this->moduleService('resume_maker');

        $records = Resume::query()
            ->visibleTo(auth()->user())
            ->latest()
            ->paginate(12)
            ->through(function (Resume $r) {
                return [
                    'id' => $r->id,
                    'title' => $r->title ?: 'Resume',
                    'full_name' => $r->full_name,
                    'email' => $r->email,
                    'phone' => $r->phone,
                    'photo_url' => $r->fullPhotoUrl(),
                    'template_style' => $r->template_style,
                    'accent_color' => $r->accent_color,
                    'created_at' => $r->created_at->format('d M Y, h:i A'),
                    'user_name' => $r->user?->name,
                ];
            });

        return Inertia::render('Admin/ResumeMaker/Index', [
            'records' => $records,
            'coinCost' => $service?->coin_cost ?? 20,
        ]);
    }

    public function create()
    {
        $service = $this->moduleService('resume_maker');
        if ($error = $this->serviceBlocker($service)) {
            return redirect()->route('dashboard')->with('error', $error);
        }

        return Inertia::render('Admin/ResumeMaker/Create', [
            'coinCost' => $service?->coin_cost ?? 20,
        ]);
    }

    public function store(Request $request)
    {
        $service = $this->moduleService('resume_maker');

        if ($error = $this->serviceBlocker($service)) {
            return back()->withInput()->with('error', $error);
        }

        $data = $this->validated($request);
        $data['user_id'] = auth()->id();

        if ($request->hasFile('photo')) {
            $path = $request->file('photo')->store('resumes', 'public');
            $data['photo_url'] = $path;
        }

        $record = Resume::create($data);

        $this->chargeForService($service, $record->id, "Resume / CV Maker #{$record->id} ({$record->full_name})");

        try {
            SystemAlert::toAdmins(
                'New Resume Created',
                auth()->user()->name . " created a Resume (#{$record->id}) for {$record->full_name}.",
                '/admin/resume-maker'
            );
        } catch (\Throwable $ne) {}

        return redirect()->route('admin.resume-maker.index')
            ->with('success', 'Resume created successfully.' . $this->chargeNote($service))
            ->with('print_resume_id', $record->id);
    }

    public function edit(Resume $resume)
    {
        $this->authorizeAccess($resume);

        return Inertia::render('Admin/ResumeMaker/Edit', [
            'resume' => [
                ...$resume->toArray(),
                'photo_url' => $resume->fullPhotoUrl(),
            ],
        ]);
    }

    public function update(Request $request, Resume $resume)
    {
        $this->authorizeAccess($resume);

        $data = $this->validated($request);

        if ($request->boolean('remove_photo')) {
            if ($resume->photo_url) {
                Storage::disk('public')->delete($resume->photo_url);
            }
            $data['photo_url'] = null;
        } elseif ($request->hasFile('photo')) {
            if ($resume->photo_url) {
                Storage::disk('public')->delete($resume->photo_url);
            }
            $data['photo_url'] = $request->file('photo')->store('resumes', 'public');
        }

        $resume->update($data);

        return redirect()->route('admin.resume-maker.index')
            ->with('success', 'Resume updated successfully.')
            ->with('print_resume_id', $resume->id);
    }

    public function destroy(Resume $resume)
    {
        $this->authorizeAccess($resume);

        if ($resume->photo_url) {
            Storage::disk('public')->delete($resume->photo_url);
        }

        $name = $resume->full_name;
        $resume->delete();

        return back()->with('success', "Resume for '{$name}' deleted successfully.");
    }

    public function printView(Resume $resume)
    {
        $this->authorizeAccess($resume);

        return Inertia::render('Admin/ResumeMaker/Print', [
            'resume' => [
                ...$resume->toArray(),
                'photo_url' => $resume->fullPhotoUrl(),
            ],
        ]);
    }

    private function authorizeAccess(Resume $resume): void
    {
        if ($this->isStaff()) {
            return;
        }

        if ($resume->user_id !== auth()->id()) {
            abort(403, 'Unauthorized access to this resume.');
        }
    }

    private function validated(Request $request): array
    {
        return $request->validate([
            'title' => 'nullable|string|max:100',
            'full_name' => 'required|string|max:120',
            'father_name' => 'nullable|string|max:120',
            'mother_name' => 'nullable|string|max:120',
            'dob' => 'nullable|string|max:30',
            'gender' => 'nullable|string|max:20',
            'marital_status' => 'nullable|string|max:30',
            'nationality' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:120',
            'phone' => 'required|string|max:30',
            'address' => 'nullable|string|max:500',
            'photo' => 'nullable|image|max:2048',
            'remove_photo' => 'nullable|boolean',
            'career_objective' => 'nullable|string|max:2000',
            'education' => 'nullable|array',
            'education.*.degree' => 'nullable|string|max:120',
            'education.*.school_college' => 'nullable|string|max:150',
            'education.*.board_university' => 'nullable|string|max:150',
            'education.*.passing_year' => 'nullable|string|max:20',
            'education.*.percentage_cgpa' => 'nullable|string|max:30',
            'experience' => 'nullable|array',
            'experience.*.designation' => 'nullable|string|max:120',
            'experience.*.company' => 'nullable|string|max:150',
            'experience.*.duration' => 'nullable|string|max:60',
            'experience.*.description' => 'nullable|string|max:500',
            'skills' => 'nullable|array',
            'skills.*' => 'nullable|string|max:60',
            'languages' => 'nullable|array',
            'languages.*' => 'nullable|string|max:60',
            'hobbies' => 'nullable|array',
            'hobbies.*' => 'nullable|string|max:60',
            'declaration' => 'nullable|string|max:1000',
            'place' => 'nullable|string|max:100',
            'date' => 'nullable|string|max:30',
            'template_style' => 'nullable|string|in:modern,classic,executive',
            'accent_color' => 'nullable|string|max:20',
        ]);
    }
}
