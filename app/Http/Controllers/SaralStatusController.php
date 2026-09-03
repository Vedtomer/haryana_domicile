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
            'saral_id' => 'nullable|string|max:50',
            'mobile_no' => 'nullable|string|max:15',
        ]);

        $saralId = $request->input('saral_id') ?? '';
        $mobileNo = $request->input('mobile_no') ?? '';

        if (empty($saralId) && empty($mobileNo)) {
            return response()->json([
                'success' => false,
                'message' => 'Please provide either a Saral ID or Mobile Number.'
            ]);
        }

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
            'txtMobile' => $mobileNo,
            'btnSearch' => 'Search'
        ]);

        $postHtml = $postResponse->body();

        // 3. Parse the result
        if (strpos($postHtml, "alert('TransactionID or SaralID does not exists')") !== false || strpos($postHtml, "alert('Mobile Number does not exists')") !== false) {
            return response()->json([
                'success' => false,
                'message' => 'The provided TransactionID, SaralID, or Mobile Number does not exist.'
            ]);
        }

        if (strpos($postHtml, "No Record Found") !== false) {
             return response()->json([
                'success' => false,
                'message' => 'No Record Found for this ID.'
            ]);
        }

        // Check for specific error message span
        preg_match('/<span id="lblErrMsg"[^>]*>(.*?)<\/span>/is', $postHtml, $errMsgMatch);
        $errMsg = !empty($errMsgMatch[1]) ? trim(strip_tags($errMsgMatch[1])) : '';
        if (!empty($errMsg)) {
            return response()->json([
                'success' => false,
                'message' => 'Portal Error: ' . $errMsg
            ]);
        }

        $extractedHtml = '';
        
        // Match any gridviews (standard ASP.NET)
        preg_match_all('/<table[^>]*?id="grd_[^>]*?>.*?<\/table>/is', $postHtml, $gridMatches);
        if (!empty($gridMatches[0])) {
            $extractedHtml = implode('<br/><br/>', $gridMatches[0]);
        } else {
            // Broaden search: any table that contains common status keywords but is NOT the header layout
            preg_match_all('/<table[^>]*>.*?<\/table>/is', $postHtml, $allTables);
            if (!empty($allTables[0])) {
                foreach ($allTables[0] as $tableHtml) {
                    // Check if it looks like a data table and not the page header
                    if (stripos($tableHtml, 'Header1_lblUserName') === false && 
                       (stripos($tableHtml, 'Status') !== false || stripos($tableHtml, 'Applicant') !== false || stripos($tableHtml, 'Remark') !== false || stripos($tableHtml, 'Action') !== false)) {
                        $extractedHtml .= $tableHtml . '<br/><br/>';
                    }
                }
            }
        }

        if (empty($extractedHtml)) {
             // If we still can't find a table, try to extract the main content panel if it exists
             preg_match('/<div class="panel-body">(.*?)<\/div>\s*<(div|form)/is', $postHtml, $panelMatch);
             
             return response()->json([
                'success' => false,
                'message' => 'Could not extract status details. The ID might be invalid or the portal layout changed.',
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
