<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use App\Models\Service;
use App\Models\ServiceRequest;
use App\Models\CoinTransaction;

class SaralStatusController extends Controller
{
    public function search(Request $request)
    {
        $request->validate([
            'saral_id' => 'required|string|max:50',
        ]);

        $saralId = $request->input('saral_id');
        $user = auth()->user();

        // 1. Fetch the page to get the viewstate and cookies
        $response = Http::get('https://edisha.gov.in/eForms/Status');
        
        if (!$response->successful()) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to connect to the Saral portal. Please try again later.'
            ]);
        }

        $html = $response->body();
        $cookies = $response->header('Set-Cookie');
        if (is_array($cookies)) {
            $cookies = implode('; ', $cookies);
        }

        preg_match('/id="__VIEWSTATE" value="(.*?)"/', $html, $viewstateMatch);
        preg_match('/id="__VIEWSTATEGENERATOR" value="(.*?)"/', $html, $generatorMatch);

        if (!$viewstateMatch || !$generatorMatch) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to initialize session with Saral portal.'
            ]);
        }

        // 2. Post the data
        $postResponse = Http::withHeaders([
            'Cookie' => $cookies
        ])->asForm()->post('https://edisha.gov.in/eForms/Status', [
            '__VIEWSTATE' => $viewstateMatch[1],
            '__VIEWSTATEGENERATOR' => $generatorMatch[1],
            'txtETranID' => $saralId,
            'txtMobile' => '',
            'btnSearch' => 'Search'
        ]);

        $postHtml = $postResponse->body();

        // 3. Parse the result
        if (strpos($postHtml, "alert('TransactionID or SaralID does not exists')") !== false) {
            return response()->json([
                'success' => false,
                'message' => 'TransactionID or SaralID does not exist.'
            ]);
        }

        if (strpos($postHtml, "No Record Found") !== false) {
             return response()->json([
                'success' => false,
                'message' => 'No Record Found for this ID.'
            ]);
        }

        // Search for grids or tables containing the status
        // Usually edisha puts it in grd_Action or grd_Docs or just a general table layout
        // We will extract everything inside the main panel-body that is not the form
        
        // Let's try to grab any table that doesn't have id="Header1_..." or the layout tables.
        // Actually, just looking for <table ... id="grd_... 
        
        $extractedHtml = '';
        
        // Match any gridviews (standard ASP.NET)
        preg_match_all('/<table[^>]*?id="grd_[^>]*?>.*?<\/table>/is', $postHtml, $gridMatches);
        if (!empty($gridMatches[0])) {
            $extractedHtml = implode('<br/><br/>', $gridMatches[0]);
        } else {
            // If no specific grid, maybe they render a raw HTML table under a specific div.
            // In ASP.NET, often results are in a div. Let's look for standard table if no grids found,
            // but exclude layout tables (which are width 100% with no borders usually).
            // This regex tries to find tables with borders or classes like table-bordered
            preg_match_all('/<table[^>]*?(class="[^"]*?table[^"]*?"|border="[1-9]").*?>.*?<\/table>/is', $postHtml, $tableMatches);
            if (!empty($tableMatches[0])) {
                $extractedHtml = implode('<br/>', $tableMatches[0]);
            }
        }

        if (empty($extractedHtml)) {
             return response()->json([
                'success' => false,
                'message' => 'Could not extract status details. The ID might be invalid or the portal layout changed.',
                // 'debug_html' => substr($postHtml, 5000, 2000) // Un-comment for debugging
            ]);
        }
        
        // Clean up the extracted HTML a bit (e.g., remove specific inline styles that break our UI)
        $extractedHtml = preg_replace('/style=".*?"/i', '', $extractedHtml);
        // Add Tailwind classes to tables
        $extractedHtml = str_replace('<table', '<table class="w-full text-sm text-left text-gray-500 border border-gray-200 rounded-lg overflow-hidden"', $extractedHtml);
        $extractedHtml = str_replace('<th', '<th class="px-4 py-3 bg-gray-50 text-gray-700 font-bold uppercase border-b border-gray-200"', $extractedHtml);
        $extractedHtml = str_replace('<td', '<td class="px-4 py-3 border-b border-gray-100"', $extractedHtml);

        // Record the request (Free service)
        $service = Service::where('slug', 'saral-status')->first();
        ServiceRequest::create([
            'user_id' => $user->id,
            'service_id' => $service ? $service->id : null,
            'service_name' => $service ? $service->name : 'Saral Certificate Status',
            'input_data' => ['Saral ID' => $saralId],
            'coins_charged' => 0,
            'status' => ServiceRequest::STATUS_COMPLETED,
            'completed_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'html' => $extractedHtml,
            'message' => 'Status found successfully.'
        ]);
    }
}
