<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\HaryanaDomicile;

class HaryanaDomicileController extends Controller
{


    public function print($id)
    {
        $data = HaryanaDomicile::findOrFail($id);
        return view('haryana_domicile.print', compact('data'));
    }
}
