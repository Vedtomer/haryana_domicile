<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class BobAffidavitController extends Controller
{
    public function index()
    {
        return redirect()->route('admin.rent-agreement.index');
    }

    public function create()
    {
        return redirect()->route('admin.rent-agreement.create');
    }

    public function store(Request $request)
    {
        return app(RentAgreementController::class)->store($request);
    }

    public function show($id)
    {
        return redirect()->route('admin.rent-agreement.index');
    }

    public function edit($id)
    {
        return redirect()->route('admin.rent-agreement.edit', $id);
    }

    public function update(Request $request, $id)
    {
        return redirect()->route('admin.rent-agreement.index');
    }

    public function destroy($id)
    {
        return redirect()->route('admin.rent-agreement.index');
    }

    public function print($id)
    {
        return redirect()->route('admin.rent-agreement.print', $id);
    }
}
