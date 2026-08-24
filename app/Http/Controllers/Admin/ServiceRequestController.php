<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CoinTransaction;
use App\Models\Service;
use App\Models\ServiceRequest;
use App\Notifications\SystemAlert;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

/**
 * Requests for services that have no built-in form. The user submits, coins are
 * held immediately, and an admin moves the request through the status flow.
 * Rejecting refunds the coins.
 */
class ServiceRequestController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();

        $requests = ServiceRequest::with(['user:id,name,phone,email', 'service:id,name,icon'])
            ->visibleTo($user)
            ->when($request->status, fn ($q, $status) => $q->where('status', $status))
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Admin/ServiceRequests/Index', [
            'requests' => $requests,
            'isAdmin' => $this->isStaff(),
            'statuses' => ServiceRequest::STATUSES,
            'filters' => ['status' => $request->status],
        ]);
    }

    public function create(Request $request)
    {
        $service = Service::active()
            ->when(!$this->isStaff(), fn ($q) => $q->visibleTo(auth()->user()))
            ->where('kind', Service::KIND_MANUAL)
            ->where('slug', $request->query('service'))
            ->firstOrFail();

        $service->logo_url = $service->logoUrl();

        return Inertia::render('Admin/ServiceRequests/Create', [
            'service' => $service,
            'userCoins' => auth()->user()->coins,
        ]);
    }

    public function store(Request $request)
    {
        $service = Service::active()
            ->when(!$this->isStaff(), fn ($q) => $q->visibleTo(auth()->user()))
            ->where('kind', Service::KIND_MANUAL)
            ->findOrFail($request->input('service_id'));

        if ($error = $this->serviceBlocker($service)) {
            return back()->withInput()->with('error', $error);
        }

        $rules = ['note' => 'nullable|string|max:2000'];
        foreach ($service->fields ?? [] as $i => $field) {
            $required = !empty($field['required']) ? 'required' : 'nullable';
            $label = $field['label'] ?? '';
            $maxLength = match (true) {
                stripos($label, 'aadha') !== false => 12,
                stripos($label, 'mobile') !== false, stripos($label, 'phone') !== false, stripos($label, 'whatsapp') !== false => 10,
                default => 500,
            };
            $rules["fields.{$i}"] = ($field['type'] ?? 'text') === 'file'
                ? "{$required}|file|mimes:pdf,jpg,jpeg,png|max:5120"
                : "{$required}|string|max:{$maxLength}";
        }
        $validated = $request->validate($rules);

        // Store the answers keyed by their label so the admin sees readable data.
        // Uploaded documents are saved to disk and recorded as {type, path, name}
        // so the admin review screen can tell them apart from plain text answers.
        $inputData = [];
        foreach ($service->fields ?? [] as $i => $field) {
            $answer = $validated['fields'][$i] ?? null;

            if (($field['type'] ?? 'text') === 'file' && $answer instanceof \Illuminate\Http\UploadedFile) {
                $path = $answer->store('service-documents', 'public');
                $inputData[$field['label']] = [
                    'type' => 'file',
                    'path' => $path,
                    'name' => $answer->getClientOriginalName(),
                ];
            } else {
                $inputData[$field['label']] = $answer;
            }
        }
        if (!empty($validated['note'])) {
            $inputData['Note'] = $validated['note'];
        }

        $cost = $this->isStaff() ? 0 : $service->coin_cost;

        $serviceRequest = DB::transaction(function () use ($service, $inputData, $cost) {
            $serviceRequest = ServiceRequest::create([
                'user_id' => auth()->id(),
                'service_id' => $service->id,
                'service_name' => $service->name,
                'input_data' => $inputData,
                'coins_charged' => $cost,
                'status' => ServiceRequest::STATUS_PENDING,
            ]);

            $this->chargeForService($service, $serviceRequest->id, "{$service->name} request #{$serviceRequest->id}");

            return $serviceRequest;
        });

        SystemAlert::toAdmins(
            'New service request',
            auth()->user()->name . " requested {$service->name} (#{$serviceRequest->id}).",
            '/admin/service-requests/' . $serviceRequest->id,
        );

        if ($request->boolean('save_and_create')) {
            return redirect()->route('admin.service-requests.create', ['service' => $service->slug])
                ->with('success', "Request submitted. We'll update you as soon as it's reviewed." . $this->chargeNote($service));
        }

        return redirect()->route('admin.service-requests.index')
            ->with('success', "Request submitted. We'll update you as soon as it's reviewed." . $this->chargeNote($service));
    }

    public function show(ServiceRequest $serviceRequest)
    {
        $this->authorizeOwner($serviceRequest);

        return Inertia::render('Admin/ServiceRequests/Show', [
            'request' => $serviceRequest->load(['user:id,name,phone,email', 'service:id,name,icon', 'completedBy:id,name']),
            'isAdmin' => $this->isStaff(),
            'statuses' => ServiceRequest::STATUSES,
        ]);
    }

    /**
     * Admin moves a request forward: accept, start work, complete, or reject
     * (which refunds the coins).
     */
    public function update(Request $request, ServiceRequest $serviceRequest)
    {
        $data = $request->validate([
            'status' => ['required', Rule::in(array_keys(ServiceRequest::STATUSES))],
            'admin_response' => 'nullable|string|max:2000',
            'estimated_time' => 'nullable|string|max:100',
        ]);

        // Re-submitting the form without changing anything must not re-notify the user.
        $unchanged = $serviceRequest->status === $data['status']
            && ($data['admin_response'] ?? '') === (string) $serviceRequest->admin_response
            && ($data['estimated_time'] ?? '') === (string) $serviceRequest->estimated_time;

        if ($unchanged) {
            return redirect()->route('admin.service-requests.index')
                ->with('success', 'Nothing changed — the user was not notified again.');
        }

        $refunded = false;

        DB::transaction(function () use ($serviceRequest, $data, &$refunded) {
            $isClosing = in_array($data['status'], [ServiceRequest::STATUS_COMPLETED, ServiceRequest::STATUS_REJECTED]);

            $serviceRequest->update([
                'status' => $data['status'],
                'admin_response' => $data['admin_response'] ?? $serviceRequest->admin_response,
                'estimated_time' => $data['estimated_time'] ?? $serviceRequest->estimated_time,
                'completed_by' => $isClosing ? auth()->id() : $serviceRequest->completed_by,
                'completed_at' => $isClosing ? now() : $serviceRequest->completed_at,
            ]);

            if ($data['status'] === ServiceRequest::STATUS_REJECTED && $serviceRequest->isRefundable()) {
                $serviceRequest->user->addCoins(
                    $serviceRequest->coins_charged,
                    CoinTransaction::TYPE_REFUND,
                    "Refund for rejected {$serviceRequest->service_name} request #{$serviceRequest->id}",
                );
                $serviceRequest->update(['refunded_at' => now()]);
                $refunded = true;
            }
        });

        $body = "Your {$serviceRequest->service_name} request #{$serviceRequest->id} is now "
            . strtolower($serviceRequest->statusLabel()) . '.';

        if ($serviceRequest->estimated_time && $data['status'] !== ServiceRequest::STATUS_REJECTED) {
            $body .= " Estimated time: {$serviceRequest->estimated_time}.";
        }
        if ($refunded) {
            $body .= " {$serviceRequest->coins_charged} coins have been refunded to your account.";
        }
        if (!empty($data['admin_response'])) {
            $body .= ' Note: ' . $data['admin_response'];
        }

        $serviceRequest->user->notify(new SystemAlert(
            'Request ' . $serviceRequest->statusLabel(),
            $body,
            '/admin/service-requests/' . $serviceRequest->id,
            match ($data['status']) {
                ServiceRequest::STATUS_REJECTED => 'error',
                ServiceRequest::STATUS_COMPLETED => 'success',
                default => 'info',
            },
        ));

        return redirect()->route('admin.service-requests.index')
            ->with('success', 'Status updated and the user has been notified.'
                . ($refunded ? " {$serviceRequest->coins_charged} coins refunded." : ''));
    }
}
