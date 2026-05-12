<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class FasalService
{
    protected $baseUrl = 'https://fasal.haryana.gov.in';

    public function initSession()
    {
        $response = Http::withoutVerifying()
            ->withHeaders([
                'Host' => 'fasal.haryana.gov.in',
                'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:150.0) Gecko/20100101 Firefox/150.0',
                'Accept' => 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language' => 'en-US,en;q=0.9',
                'Connection' => 'keep-alive',
                'Upgrade-Insecure-Requests' => '1',
            ])
            ->withCookies([
                '_ga_2MLFLNJ7PY' => 'GS2.1.s1778588831$o18$g0$t1778588831$j60$l0$h0',
                '_ga' => 'GA1.1.244193634.1773492724',
                '_ga_MGQ7MJM17H' => 'GS2.3.s1778582634$o16$g1$t1778582929$j60$l0$h0',
                '_gid' => 'GA1.3.1162409138.1778582634',
            ], 'fasal.haryana.gov.in')
            ->get("{$this->baseUrl}/home/login");

        return $response->successful();
    }

    public function generateCaptcha()
    {
        $response = Http::withoutVerifying()
            ->withHeaders([
                'Host' => 'fasal.haryana.gov.in',
                'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:150.0) Gecko/20100101 Firefox/150.0',
                'Accept' => '*/*',
                'Accept-Language' => 'en-US,en;q=0.9',
                'X-Requested-With' => 'XMLHttpRequest',
                'Origin' => 'https://fasal.haryana.gov.in',
                'Referer' => 'https://fasal.haryana.gov.in/home/login',
                'Sec-Fetch-Dest' => 'empty',
                'Sec-Fetch-Mode' => 'cors',
                'Sec-Fetch-Site' => 'same-origin',
                'Connection' => 'keep-alive',
            ])
            ->withCookies([
                '_ga_2MLFLNJ7PY' => 'GS2.1.s1778588831$o18$g0$t1778588831$j60$l0$h0',
                '_ga' => 'GA1.1.244193634.1773492724',
                '_ga_MGQ7MJM17H' => 'GS2.3.s1778582634$o16$g1$t1778582929$j60$l0$h0',
                '_gid' => 'GA1.3.1162409138.1778582634',
                'ASP.NET_SessionId' => '5s5pph5id1ps5yadxqsf3ld0',
                'BIGipServerMFMB_80_fasal' => '!HSJqW8WPYr0kgP4SIP2SvHzGXFPW1lUTSPOr2KP+ui91ALYS8VZFVAecjNg88GAa3GO3JpkcSjDxUjgIuvapQNFEgqKtUCu7N42Dmtg=',
            ], 'fasal.haryana.gov.in')
            ->post("{$this->baseUrl}/Officers/GenerateCaptcha");

        if ($response->successful()) {
            return $response->body(); // This should be the captcha data (binary or base64)
        }

        Log::error('Fasal Captcha API failed', [
            'status' => $response->status(),
            'body' => $response->body(),
        ]);

        return null;
    }

    public function searchByAadhar($aadharNumber)
    {
        // TODO: Implement actual search endpoint once identified
        // This will likely be a POST request to a search endpoint with Aadhar and Captcha
        
        /*
        $response = Http::withoutVerifying()
            ->withHeaders([...])
            ->withCookies([...])
            ->asForm()
            ->post("{$this->baseUrl}/Path/To/Search", [
                'Aadhar' => $aadharNumber,
                'Captcha' => $captcha,
            ]);
        */

        return null;
    }
}
