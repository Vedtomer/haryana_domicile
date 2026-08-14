<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Marriage Affidavit - {{ $record->groom_name }} & {{ $record->bride_name }}</title>
    <style>
        body {
            font-family: 'DejaVu Sans Mono', monospace;
            font-size: 13px;
            line-height: 1.35;
            margin: 10px;
        }
        p { margin: 0 0 6px 0; }
        h2 {
            text-align: center;
            text-decoration: underline;
            margin-bottom: 16px;
        }
        h4 { margin: 10px 0 4px 0; }
        .page-break { page-break-after: always; }
        .signature-block { margin-top: 40px; width: 100%; }
        .signature-right { float: right; width: 50%; text-align: right; }
        .clear { clear: both; }
        ol { padding-left: 20px; margin-top: 0; }
        ol li { margin-bottom: 6px; }
    </style>
</head>
<body>
@php
    $marriageDate = $record->marriage_date ? \Carbon\Carbon::parse($record->marriage_date)->format('d-m-Y') : '';
    $religion = $record->religion ?: 'Hindu';
@endphp

{{-- ============================= PAGE 1: JOINT AFFIDAVIT ============================= --}}
<h2>AFFIDAVIT (Joint Groom &amp; Bride)</h2>
<p>We are {{ $record->groom_name }} S/o Sh. {{ $record->groom_father_name }}, R/o {{ $record->groom_address }} &amp; {{ $record->bride_name }} D/o Sh. {{ $record->bride_father_name }}, R/o {{ $record->bride_address }} do hereby solemnly affirm and declare as under:</p>
<ol>
    <li>That we are permanent resident of above said address.</li>
    <li>That we are permanent citizen of India by birth.</li>
    <li>That our parents &amp; relatives are present at the time of marriage.</li>
    <li>That we got married on {{ $marriageDate }} at {{ $record->marriage_venue }}, according to {{ $religion }} marriage Rite with the consent of our parents.</li>
    <li>That our age at the time of marriage is {{ $record->groom_age }} Yrs &amp; {{ $record->bride_age }} Yrs.</li>
    <li>Court of Law in abroad in this regards.</li>
    <li>That we are residing together after marriage.</li>
    <li>That we &amp; our parents have not registered anywhere, i.e. Marriage Registration Office, Tehsil, Municipal Corporation, Municipal Council, Municipal Committee, in India and abroad.</li>
    <li>That we and our parents were not aware of the fact that the Registration of Marriage has been made compulsory.</li>
    <li>That now we have come to know that Registration of Marriage has become compulsory, so we are going to get the marriage registered now.</li>
    <li>That our parents have no objection in this regard.</li>
    <li>That we could not get our marriage registered due to lack of awareness.</li>
</ol>
@include('pdf.partials.verification', ['pronoun' => 'our', 'deponentLabel' => 'Deponents'])

<div class="page-break"></div>

{{-- ============================= PAGE 2: BRIDE'S AFFIDAVIT ============================= --}}
<h2>Affidavit (Bride)</h2>
<p>I, {{ $record->bride_name }}, D/o Sh. {{ $record->bride_father_name }}, R/o {{ $record->bride_address }}, do hereby solemnly affirm and declare as follows:</p>
<ol>
    <li>That I am a citizen of India.</li>
    <li>That my marriage with {{ $record->groom_name }}, S/o Sh. {{ $record->groom_father_name }}, R/o {{ $record->groom_address }}, was solemnized on {{ $marriageDate }} in accordance with {{ $religion }} rites and customs at {{ $record->marriage_venue }}, without any dowry.</li>
    <li>That at the time of the marriage, I was approximately {{ $record->bride_age }} years of age.</li>
    <li>That I am happy with the aforementioned marriage.</li>
    <li>That my marriage was solemnized with the consent of my parents and both families.</li>
    <li>That I have no objection to this marriage being registered.</li>
</ol>
@include('pdf.partials.verification', ['pronoun' => 'my', 'deponentLabel' => 'Deponent'])

<div class="page-break"></div>

{{-- ============================= PAGE 3: GROOM'S AFFIDAVIT ============================= --}}
<h2>Affidavit (Groom)</h2>
<p>I, {{ $record->groom_name }}, S/o Sh. {{ $record->groom_father_name }}, R/o {{ $record->groom_address }}, do hereby solemnly affirm and declare as follows:</p>
<ol>
    <li>That I am a citizen of India.</li>
    <li>That my marriage with {{ $record->bride_name }}, D/o Sh. {{ $record->bride_father_name }}, R/o {{ $record->bride_address }}, was solemnized on {{ $marriageDate }} in accordance with {{ $religion }} rites and customs at {{ $record->marriage_venue }}, without any dowry.</li>
    <li>That at the time of the marriage, I was approximately {{ $record->groom_age }} years of age.</li>
    <li>That I am happy with the aforementioned marriage.</li>
    <li>That my marriage was solemnized with the consent of my parents and both families.</li>
    <li>That I have no objection to this marriage being registered.</li>
</ol>
@include('pdf.partials.verification', ['pronoun' => 'my', 'deponentLabel' => 'Deponent'])
</body>
</html>
