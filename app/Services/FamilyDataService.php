<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class FamilyDataService
{
    public function getFamilyData($aadharNumber)
    {
        $encodedAadhar = base64_encode($aadharNumber);
        
        $response = Http::withoutVerifying()
        ->withHeaders([
            'Host' => 'ppp-office.haryana.gov.in',
            'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:149.0) Gecko/20100101 Firefox/149.0',
            'Accept' => '*/*',
            'Accept-Language' => 'en-US,en;q=0.9',
            'Content-Type' => 'application/x-www-form-urlencoded; charset=UTF-8',
            'X-Requested-With' => 'XMLHttpRequest',
            'Origin' => 'https://ppp-office.haryana.gov.in',
            'Referer' => 'https://ppp-office.haryana.gov.in/AddNewFamily/FamilySearch',
            'Sec-Fetch-Dest' => 'empty',
            'Sec-Fetch-Mode' => 'cors',
            'Sec-Fetch-Site' => 'same-origin',
            'Priority' => 'u=0',
            'Te' => 'trailers',
            'Connection' => 'keep-alive',
        ])
        ->withCookies([
            '_ga_2MLFLNJ7PY' => 'GS2.1.s1778582598$o17$g1$t1778582762$j44$l0$h0',
            '_ga' => 'GA1.1.244193634.1773492724',
            '_ga_MGQ7MJM17H' => 'GS2.3.s1778582634$o16$g1$t1778582762$j60$l0$h0',
            'ASP.NET_SessionId' => 'y20imd0vkjg03n4jwznrjw1b',
            '__RequestVerificationToken' => 'CaoT8ItDi7DXWvkruR5HTk8aFceVgUKcI9u5Hl6rzBEXQ-zsLKJDCg_gvQ2Ecso90ra87_Q5yeSDjflY1tV_R4z--QO5sjv5hPgH90qaUjA1',
            'APSF' => '166786242',
            'Ck1' => 'Tc5kHScCNFpdvjVF6EEMYw==',
            'xyzAdminAuthorize' => 'PASTE_REAL_TOKEN_HERE',
            '_gid' => 'GA1.3.1162409138.1778582634',
            '_gat' => '1',
        ], 'ppp-office.haryana.gov.in')
        ->asForm()
        ->post('https://ppp-office.haryana.gov.in/AddNewFamily/GetResponse', [
            'Aadahr' => $encodedAadhar,
        ]);

        if ($response->successful()) {
            return $response->body();
        }

        Log::error('FamilyData API failed', [
            'status' => $response->status(),
            'body' => $response->body(),
        ]);

        return null;
    }
}
