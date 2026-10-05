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
        $isStaff = $this->isStaff();

        $baseQuery = ServiceRequest::visibleTo($user);

        // Aggregate statistics for quick overview
        $stats = [
            'all'         => (clone $baseQuery)->count(),
            'pending'     => (clone $baseQuery)->where('status', ServiceRequest::STATUS_PENDING)->count(),
            'in_progress' => (clone $baseQuery)->where('status', ServiceRequest::STATUS_IN_PROGRESS)->count(),
            'completed'   => (clone $baseQuery)->whereIn('status', [ServiceRequest::STATUS_COMPLETED, ServiceRequest::STATUS_ACCEPTED])->count(),
            'rejected'    => (clone $baseQuery)->where('status', ServiceRequest::STATUS_REJECTED)->count(),
            'today'       => (clone $baseQuery)->whereDate('created_at', today())->count(),
            'total_coins' => (clone $baseQuery)->sum('coins_charged'),
        ];

        $requests = ServiceRequest::with(['user:id,name,phone,email', 'service:id,name,icon,slug'])
            ->visibleTo($user)
            ->when($request->filled('search'), function ($q) use ($request) {
                $search = trim($request->search);
                $q->where(function ($sub) use ($search) {
                    $sub->where('id', $search)
                        ->orWhere('service_name', 'like', "%{$search}%")
                        ->orWhere('input_data', 'like', "%{$search}%")
                        ->orWhereHas('user', function ($uq) use ($search) {
                            $uq->where('name', 'like', "%{$search}%")
                                ->orWhere('phone', 'like', "%{$search}%")
                                ->orWhere('email', 'like', "%{$search}%");
                        });
                });
            })
            ->when($request->filled('user_id'), function ($q) use ($request) {
                $q->where('user_id', $request->user_id);
            })
            ->when($request->filled('service_id'), function ($q) use ($request) {
                $q->where('service_id', $request->service_id);
            })
            ->when($request->filled('service_slug'), function ($q) use ($request) {
                $slug = trim($request->service_slug);
                $q->where(function ($sq) use ($slug) {
                    $sq->whereHas('service', fn ($sub) => $sub->where('slug', $slug))
                       ->orWhere('service_name', 'like', '%' . str_replace('-', ' ', $slug) . '%');
                });
            })
            ->when($request->filled('service_name'), function ($q) use ($request) {
                $q->where('service_name', 'like', '%' . trim($request->service_name) . '%');
            })
            ->when($request->filled('status'), function ($q) use ($request) {
                $status = $request->status;
                if ($status === 'completed') {
                    return $q->whereIn('status', ['completed', 'accepted']);
                }
                return $q->where('status', $status);
            })
            ->latest()
            ->paginate($request->integer('per_page', 20))
            ->withQueryString();

        $servicesList = Service::select('id', 'name')->orderBy('name')->get();

        return Inertia::render('Admin/ServiceRequests/Index', [
            'requests'     => $requests,
            'isAdmin'      => $isStaff,
            'statuses'     => ServiceRequest::STATUSES,
            'stats'        => $stats,
            'servicesList' => $servicesList,
            'filters'      => [
                'status'     => $request->status ?? '',
                'search'     => $request->search ?? '',
                'user_id'    => $request->user_id ?? '',
                'service_id' => $request->service_id ?? '',
                'per_page'   => $request->per_page ?? 20,
            ],
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

    /**
     * Get recent work history for a specific service (for quick list drawer / top button).
     */
    public function workHistory(Request $request)
    {
        $user = auth()->user();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Unauthenticated'], 401);
        }

        $isStaff = $this->isStaff();
        $serviceId = $request->query('service_id');
        $serviceSlug = trim($request->query('service_slug', ''));
        $serviceName = trim($request->query('service_name', ''));
        $moduleKey = trim($request->query('module_key', ''));
        $search = trim($request->query('search', ''));
        $limit = min(50, max(1, (int) $request->query('limit', 25)));

        // 1. If module key is provided or mapped
        if ($moduleKey && isset(Service::MODULES[$moduleKey])) {
            $moduleConfig = Service::MODULES[$moduleKey];
            $modelClass = $moduleConfig['model'] ?? null;
            if ($modelClass && class_exists($modelClass)) {
                try {
                    $mQuery = $modelClass::query();
                    if (!$isStaff) {
                        $mQuery->where('user_id', $user->id);
                    }
                    if (!empty($search)) {
                        $mQuery->where(function ($sq) use ($search) {
                            $sq->where('id', $search);
                            foreach (['name', 'aadhar', 'mobile', 'pan', 'child_name', 'ration_card_no', 'father_name'] as $col) {
                                try {
                                    if (\Illuminate\Support\Facades\Schema::hasColumn($sq->getModel()->getTable(), $col)) {
                                        $sq->orWhere($col, 'like', "%{$search}%");
                                    }
                                } catch (\Throwable $e) {}
                            }
                        });
                    }
                    $totalCount = (clone $mQuery)->count();
                    $records = $mQuery->latest()->take($limit)->get()->map(function ($item) use ($moduleConfig) {
                        $inputData = [];
                        foreach (['name' => 'Name', 'aadhar' => 'Aadhaar', 'mobile' => 'Mobile', 'pan' => 'PAN', 'father_name' => 'Father', 'district' => 'District'] as $f => $lbl) {
                            if (!empty($item->$f)) {
                                $inputData[$lbl] = $item->$f;
                            }
                        }
                        return [
                            'id'            => $item->id,
                            'service_name'  => $moduleConfig['label'] ?? 'Module Record',
                            'input_data'    => !empty($inputData) ? $inputData : ['Record #' => $item->id],
                            'status'        => 'completed',
                            'status_label'  => 'Completed',
                            'coins_charged' => 0,
                            'admin_response'=> null,
                            'attachment'    => null,
                            'view_url'      => isset($moduleConfig['index']) ? $moduleConfig['index'] . '/' . $item->id . '/edit' : null,
                            'print_url'     => isset($moduleConfig['index']) ? $moduleConfig['index'] . '/' . $item->id . '/print' : null,
                            'created_at'    => $item->created_at ? $item->created_at->format('d M Y, h:i A') : '',
                            'created_ago'   => $item->created_at ? $item->created_at->diffForHumans() : '',
                        ];
                    });

                    return response()->json([
                        'success'     => true,
                        'service_id'  => null,
                        'service_name'=> $moduleConfig['label'] ?? 'Module Records',
                        'is_module'   => true,
                        'total_count' => $totalCount,
                        'records'     => $records,
                        'full_url'    => $moduleConfig['index'] ?? '/dashboard',
                    ]);
                } catch (\Throwable $me) {
                    // Fall back to ServiceRequest query below
                }
            }
        }

        // 2. Query ServiceRequest
        $service = null;
        if ($serviceId) {
            $service = Service::find($serviceId);
        } elseif ($serviceSlug) {
            $service = Service::where('slug', $serviceSlug)->first();
        }

        if ($service) {
            $serviceId = $service->id;
            if (empty($serviceName)) {
                $serviceName = $service->name;
            }
        }

        $query = ServiceRequest::visibleTo($user);
        if (!$isStaff) {
            $query->where('user_id', $user->id);
        }

        // Filter by service
        $query->where(function ($q) use ($serviceId, $serviceName, $serviceSlug) {
            $hasFilter = false;
            if ($serviceId) {
                $q->where('service_id', $serviceId);
                $hasFilter = true;
            }
            if ($serviceName) {
                if ($hasFilter) {
                    $q->orWhere('service_name', $serviceName)
                      ->orWhere('service_name', 'like', "%{$serviceName}%");
                } else {
                    $q->where('service_name', $serviceName)
                      ->orWhere('service_name', 'like', "%{$serviceName}%");
                    $hasFilter = true;
                }
            }
            if ($serviceSlug) {
                $cleanSlug = str_replace('-', ' ', $serviceSlug);
                if ($hasFilter) {
                    $q->orWhere('service_name', 'like', "%{$cleanSlug}%");
                } else {
                    $q->where('service_name', 'like', "%{$cleanSlug}%");
                }
            }
        });

        if (!empty($search)) {
            $query->where(function ($sq) use ($search) {
                $sq->where('id', $search)
                   ->orWhere('input_data', 'like', "%{$search}%")
                   ->orWhere('admin_response', 'like', "%{$search}%");
            });
        }

        $totalCount = (clone $query)->count();
        $records = $query->latest()->take($limit)->get()->map(function ($req) {
            return [
                'id'            => $req->id,
                'service_name'  => $req->service_name,
                'input_data'    => $req->input_data,
                'status'        => $req->status,
                'status_label'  => ServiceRequest::STATUSES[$req->status] ?? ucfirst($req->status),
                'coins_charged' => $req->coins_charged,
                'admin_response'=> $req->admin_response,
                'attachment'    => $req->attachment,
                'created_at'    => $req->created_at ? $req->created_at->format('d M Y, h:i A') : '',
                'created_ago'   => $req->created_at ? $req->created_at->diffForHumans() : '',
            ];
        });

        $fullUrl = '/admin/service-requests';
        if ($serviceId) {
            $fullUrl .= '?service_id=' . $serviceId;
        } elseif ($serviceSlug) {
            $fullUrl .= '?service_slug=' . urlencode($serviceSlug);
        } elseif ($serviceName) {
            $fullUrl .= '?search=' . urlencode($serviceName);
        }

        return response()->json([
            'success'     => true,
            'service_id'  => $serviceId,
            'service_name'=> $serviceName ?: ($serviceSlug ?: 'Service'),
            'is_module'   => false,
            'total_count' => $totalCount,
            'records'     => $records,
            'full_url'    => $fullUrl,
        ]);
    }
}
