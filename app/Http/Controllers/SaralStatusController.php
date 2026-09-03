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

        $userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36';

        // 1. Fetch the page to get the viewstate and cookies
        $response = Http::withHeaders([
            'User-Agent' => $userAgent,
            'Accept' => 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
            'Accept-Language' => 'en-US,en;q=0.9',
        ])->get('https://edisha.gov.in/eForms/Status');
        
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
            'Cookie' => $cookies,
            'User-Agent' => $userAgent,
            'Accept' => 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
            'Accept-Language' => 'en-US,en;q=0.9',
            'Referer' => 'https://edisha.gov.in/eForms/Status',
            'Origin' => 'https://edisha.gov.in',
            'Content-Type' => 'application/x-www-form-urlencoded'
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
        
        // Safely parse HTML using DOMDocument to handle nested tables/divs
        $dom = new \DOMDocument();
        libxml_use_internal_errors(true); // Suppress HTML structure errors
        @$dom->loadHTML('<?xml encoding="utf-8" ?>' . $postHtml);
        libxml_clear_errors();
        
        $xpath = new \DOMXPath($dom);
        
        // 1. e-Disha's new layout uses <div id="idstatus">
        $statusPanel = $xpath->query('//div[@id="idstatus"]');
        if ($statusPanel->length > 0) {
            $rawStatus = $dom->saveHTML($statusPanel->item(0));
            // Convert Bootstrap classes to Tailwind for seamless UI integration
            $rawStatus = str_replace('class="panel panel-primary"', 'class="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm"', $rawStatus);
            $rawStatus = str_replace('class="panel-heading"', 'class="bg-slate-50 border-b border-slate-200 px-4 py-3 text-lg font-bold text-slate-800"', $rawStatus);
            $rawStatus = preg_replace('/class="form-group[^"]*"/', 'class="flex flex-col sm:flex-row sm:items-center px-4 py-3 border-b border-slate-100 last:border-0"', $rawStatus);
            $rawStatus = preg_replace('/class="col-sm-3 control-label[^"]*"/', 'class="sm:w-1/3 text-sm font-bold text-slate-500 uppercase tracking-wide"', $rawStatus);
            $rawStatus = str_replace('class="col-sm-3"', 'class="sm:w-2/3 text-sm font-semibold text-slate-900 mt-1 sm:mt-0"', $rawStatus);
            $rawStatus = str_replace('class="col-sm-4 text-danger"', 'class="sm:w-2/3 text-sm font-bold text-blue-600 mt-1 sm:mt-0"', $rawStatus);
            $rawStatus = str_replace('class="col-sm-4"', 'class="sm:w-2/3 text-sm font-semibold text-slate-900 mt-1 sm:mt-0"', $rawStatus);
            $rawStatus = str_replace('class="col-sm-6"', 'class="sm:w-2/3 text-sm font-semibold text-slate-900 mt-1 sm:mt-0"', $rawStatus);
            $rawStatus = str_replace('style="', 'data-old-style="', $rawStatus); // strip inline styles

            $extractedHtml .= $rawStatus;
        }
        
        // 2. If it's still using grids (older services), try to find a table with id starting with grd_
        if (empty($extractedHtml)) {
            $gridTables = $xpath->query('//table[starts-with(@id, "grd_")]');
            if ($gridTables->length > 0) {
                foreach ($gridTables as $table) {
                    $extractedHtml .= $dom->saveHTML($table) . '<br/><br/>';
                }
            } else {
                // 3. Fallback: search for any tables with keywords
                $tables = $xpath->query('//table');
                foreach ($tables as $table) {
                    $tableHtml = $dom->saveHTML($table);
                    if (stripos($tableHtml, 'Header1_lblUserName') === false) {
                        if (stripos($tableHtml, 'Status') !== false || stripos($tableHtml, 'Applicant') !== false || stripos($tableHtml, 'Remark') !== false || stripos($tableHtml, 'Action') !== false) {
                            $extractedHtml .= $tableHtml . '<br/><br/>';
                        }
                    }
                }
            }
        }

        if (empty($extractedHtml)) {
             // Debug: save the raw html to a file to understand what e-Disha is returning
             @file_put_contents(storage_path('logs/edisha_debug.html'), $postHtml);
             
             return response()->json([
                'success' => false,
                'message' => 'Could not extract status details. The ID might be invalid or the portal layout changed.',
             ]);
        }
        
        // Clean up the extracted HTML a bit (e.g., remove specific inline styles that break our UI)
        $extractedHtml = preg_replace('/data-old-style=".*?"/i', '', $extractedHtml);
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
