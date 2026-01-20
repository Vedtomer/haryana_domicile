<?php

namespace App\Http\Controllers;

use App\Models\BirthRecord;
use Illuminate\Http\Request;

class PrintBirthRecordController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(BirthRecord $record)
    {
        return view('filament.resources.birth-record-resource.pages.print-birth-record', [
            'record' => $record,
        ]);
    }
}
