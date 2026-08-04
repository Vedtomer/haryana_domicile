<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Marriage Form - {{ $record->groom_name }} & {{ $record->bride_name }}</title>
    <style>
        body {
            font-family: 'DejaVu Sans Mono', monospace;
            font-size: 11px;
            line-height: 1.4;
            margin: 15px;
        }
        p { margin: 0 0 8px 0; }
        h2 {
            text-align: center;
            text-decoration: underline;
            margin-bottom: 16px;
        }
        h4 { margin: 10px 0 4px 0; }
        .page-break { page-break-after: always; }
        .center { text-align: center; }
        .underline { text-decoration: underline; }
        table.app-table { width: 100%; border-collapse: collapse; margin: 10px 0; }
        table.app-table th, table.app-table td {
            border: 1px solid #000;
            padding: 4px 7px;
            vertical-align: top;
            text-align: left;
        }
        table.proof-table { width: 100%; border-collapse: collapse; margin: 6px 0; }
        table.proof-table td { vertical-align: top; padding: 1px 6px; }
        hr.rule { border: none; border-top: 1px solid #000; margin: 6px 0; }
        .signature-block { margin-top: 40px; width: 100%; }
        .signature-left { float: left; width: 50%; }
        .signature-right { float: right; width: 50%; text-align: right; }
        .clear { clear: both; }
        ol { padding-left: 20px; margin-top: 0; }
        ol li { margin-bottom: 6px; }
    </style>
</head>
<body>
@php
    $groomDob = $record->groom_dob ? \Carbon\Carbon::parse($record->groom_dob)->format('d-m-Y') : '';
    $brideDob = $record->bride_dob ? \Carbon\Carbon::parse($record->bride_dob)->format('d-m-Y') : '';
    $marriageDate = $record->marriage_date ? \Carbon\Carbon::parse($record->marriage_date)->format('d-m-Y') : '';
    $district = $record->district ?: '____________';
    $religion = $record->religion ?: 'Hindu';
    $nationality = $record->nationality ?: 'Indian';
@endphp

{{-- ============================= PAGE 1: APPLICATION ============================= --}}
<p>See rule 3-(3) (a) and 4-(a)</p>
<p><strong>Application for Registration of Marriage under the Haryana Compulsory Registration of Marriage Act, 2008 (6 of 2008)</strong></p>
<p>To</p>
<p style="margin-left: 40px;">The Registrar of Marriages, {{ $district }}.</p>
<p>Please register our marriage, the particulars of which are given below:-</p>

<table class="app-table">
    <tr>
        <th style="width: 6%;">S. No.</th>
        <th style="width: 30%;">Particulars</th>
        <th style="width: 32%;">Details of Husband</th>
        <th style="width: 32%;">Details of Wife</th>
    </tr>
    <tr>
        <td>1</td>
        <td>Full Name (in Capital letters)</td>
        <td>{{ strtoupper($record->groom_name) }}</td>
        <td>{{ strtoupper($record->bride_name) }}</td>
    </tr>
    <tr>
        <td>2</td>
        <td>Father's Name</td>
        <td>Sh. {{ $record->groom_father_name }}</td>
        <td>Sh. {{ $record->bride_father_name }}</td>
    </tr>
    <tr>
        <td>3</td>
        <td>Mother's Name</td>
        <td>Smt. {{ $record->groom_mother_name }}</td>
        <td>Smt. {{ $record->bride_mother_name }}</td>
    </tr>
    <tr>
        <td>4</td>
        <td>Nationality</td>
        <td>{{ $nationality }}</td>
        <td>{{ $nationality }}</td>
    </tr>
    <tr>
        <td>5</td>
        <td>Religion</td>
        <td>{{ $religion }}</td>
        <td>{{ $religion }}</td>
    </tr>
    <tr>
        <td>6</td>
        <td>Complete Postal Address (with Proof)</td>
        <td>{{ $record->groom_address }}</td>
        <td>{{ $record->bride_address }}</td>
    </tr>
    <tr>
        <td>7</td>
        <td>Date of Birth (proof in the form of Birth Certificate or School Certificate or Medical Certificate indicating age)</td>
        <td>{{ $groomDob }}</td>
        <td>{{ $brideDob }}</td>
    </tr>
    <tr>
        <td>8</td>
        <td>Age (in complete years, as on the date of marriage)</td>
        <td>{{ $record->groom_age }} Years</td>
        <td>{{ $record->bride_age }} Years</td>
    </tr>
</table>

<p>Date of Marriage:- {{ $marriageDate }}.</p>
<p>Place of Marriage:- {{ $record->marriage_venue }}.</p>
<p>(Complete details)</p>

<div class="page-break"></div>

{{-- ============================= PAGE 2: APPLICATION (cont'd) ============================= --}}
<p>Proof of Marriage-(attached any one)-</p>
<p>(1) At least two wedding photos</p>
<p>(2) Certificate from religious institution or priest who solemnized the wedding.</p>
<p>(3) Nikah Nama (4) Certificate from Gurudwara.</p>

<p>Certified that all information provided in the form is true to the best knowledge and belief and nothing has been concealed therein. It is also certified that this marriage has not been registered earlier any where in India/ abroad. We shall be liable for action as per the law, if we have violated any provision of any law of the land.</p>

<br><br>
<div style="width: 100%;">
    <div style="float: left; width: 33%;">Date</div>
    <div style="float: left; width: 33%;">Signature of Husband</div>
    <div style="float: left; width: 33%;">Signature of Wife</div>
</div>
<div class="clear"></div>

<p style="margin-top: 20px;">Note: Please ensure that the following have been attached (tick documents attached)</p>
<ol>
    <li>Three joint photos of husband and wife (3"x2") (One will be placed in the Marriage Register and two will be affixed to the two copies of Marriage Registration Certificate that the Registrar will issue.</li>
    <li>Proof of residence of both spouses (Any one)</li>
</ol>

<hr class="rule">
<table class="proof-table">
    <tr><td style="width: 50%;"><strong>For Husband</strong></td><td><strong>For Wife</strong></td></tr>
</table>
<hr class="rule">
<table class="proof-table">
    <tr><td style="width: 50%;">(a) Ration Card</td><td>(a) Ration Card</td></tr>
    <tr><td>(b) BPL Card</td><td>(b) BPL Card</td></tr>
    <tr><td>(c) Election Commission Voters Id-Card</td><td>(c) Election Commission Voters Id-Card</td></tr>
    <tr><td>(d) Passport</td><td>(d) Passport</td></tr>
    <tr><td>(e) Driving License</td><td>(e) Driving License</td></tr>
    <tr><td>(f) Domicile Certificate</td><td>(f) Domicile Certificate</td></tr>
</table>
<hr class="rule">
<table class="proof-table">
    <tr><td style="width: 50%;"><strong>3. For Husband (only in case (a) &amp; (b) not available)</strong></td><td><strong>For Wife (only in case (a) &amp; (b) not available)</strong></td></tr>
    <tr><td>(a) Birth Certificate</td><td>(a) Birth Certificate</td></tr>
    <tr><td>(b) School Certificate</td><td>(b) School Certificate</td></tr>
    <tr><td>(c) Medical certificate indicating age</td><td>(c) Medical certificate indicating age</td></tr>
    <tr><td>(d) Self affidavit Regarding age</td><td>(d) Self affidavit Regarding age</td></tr>
</table>
<hr class="rule">
<p><strong>4. Proof of Marriage (any one)</strong></p>
<p>(a) At least two wedding photos</p>
<p>(b) Certificate from religious institution or priest who solemnized the wedding.</p>
<p>(c) Nikah Nama (d) Certificate from Gurudwara</p>

<div class="page-break"></div>

{{-- ============================= PAGES 3-4: JOINT AFFIDAVIT ============================= --}}
<h2 class="underline">AFFIDAVIT (Joint Groom & Bride)</h2>
<p>We are {{ $record->groom_name }} S/o Sh. {{ $record->groom_father_name }} R/o {{ $record->groom_address }} &amp; {{ $record->bride_name }} D/o Sh. {{ $record->bride_father_name }} R/o {{ $record->bride_address }} do hereby solemnly affirm and declare as under:-</p>
<ol>
    <li>That we are permanent residents of the above said addresses.</li>
    <li>That we are permanent citizens of India by birth.</li>
    <li>That our parents &amp; relatives were present at the time of marriage.</li>
    <li>That we got married on {{ $marriageDate }} at {{ $record->marriage_venue }}, according to {{ $religion }} rites with the consent of our parents.</li>
    <li>That our age at the time of marriage was {{ $record->groom_age }} Yrs &amp; {{ $record->bride_age }} Yrs.</li>
    <li>That this marriage has not been registered in any Court of Law in India or abroad.</li>
    <li>That we are residing together after marriage.</li>
    <li>That we &amp; our parents have not got this marriage registered anywhere i.e. Marriage Registration office, Tehsil, Municipal Corporation, Municipal Council, Municipal Committee, in India or abroad.</li>
    <li>That we and our parents were not aware of the fact that Registration of Marriage has been made compulsory.</li>
    <li>That now we have come to know that Registration of the marriage has become compulsory so we are going to get the marriage registered now.</li>
    <li>That our parents have no objection in this regard.</li>
</ol>
@include('pdf.partials.verification', ['pronoun' => 'our', 'deponentLabel' => 'Deponents'])

<div class="page-break"></div>

<p>Statement of {{ $record->groom_name }} S/o Sh. {{ $record->groom_father_name }} R/o {{ $record->groom_address }} &amp; {{ $record->bride_name }} D/o Sh. {{ $record->bride_father_name }} R/o {{ $record->bride_address }}. We state that our marriage was solemnized on {{ $marriageDate }} in accordance with {{ $religion }} rites and customs at {{ $record->marriage_venue }} without any dowry. This marriage took place of our own free will and with the consent of our parents and both families. We have no objection to the marriage being registered.</p>
@include('pdf.partials.registrar_statement')

<div class="page-break"></div>

{{-- ============================= PAGES 5-6: BRIDE'S AFFIDAVIT ============================= --}}
<h2 class="underline">Affidavit (Bride)</h2>
<p>I {{ $record->bride_name }} D/o Sh. {{ $record->bride_father_name }} R/o {{ $record->bride_address }} do hereby solemnly affirm and declare as follows:</p>
<ol>
    <li>That I am a citizen of India.</li>
    <li>That my marriage with {{ $record->groom_name }} S/o Sh. {{ $record->groom_father_name }} R/o {{ $record->groom_address }} was solemnized on {{ $marriageDate }} in accordance with {{ $religion }} rites and customs at {{ $record->marriage_venue }} without any dowry.</li>
    <li>That at the time of the marriage, I was approximately {{ $record->bride_age }} years of age.</li>
    <li>That I am happy with the aforementioned marriage.</li>
    <li>That my marriage was solemnized with the consent of my parents and both families.</li>
    <li>That I have no objection to this marriage being registered.</li>
</ol>
@include('pdf.partials.verification', ['pronoun' => 'my', 'deponentLabel' => 'Deponent'])

<div class="page-break"></div>

<p>Statement of Smt. {{ $record->bride_name }} D/o Sh. {{ $record->bride_father_name }} R/o {{ $record->bride_address }}. I state that my marriage to {{ $record->groom_name }} S/o Sh. {{ $record->groom_father_name }} R/o {{ $record->groom_address }} was solemnized on {{ $marriageDate }} in accordance with {{ $religion }} rites and customs at {{ $record->marriage_venue }} without any dowry. This marriage took place of my own free will and with the consent of my parents and both families. I have no objection to the marriage being registered.</p>
@include('pdf.partials.registrar_statement')

<div class="page-break"></div>

{{-- ============================= PAGES 7-8: FATHER OF THE BRIDE ============================= --}}
<h2 class="underline">Affidavit (Father of the Bride)</h2>
<p>I {{ $record->bride_father_name }} R/o {{ $record->bride_address }} do hereby solemnly affirm and declare as follows:</p>
<ol>
    <li>That I am a citizen of India.</li>
    <li>That the marriage of my daughter {{ $record->bride_name }} with {{ $record->groom_name }} S/o Sh. {{ $record->groom_father_name }} R/o {{ $record->groom_address }} was solemnized on {{ $marriageDate }} in accordance with {{ $religion }} rites and customs at {{ $record->marriage_venue }}, without any dowry.</li>
    <li>That at the time of the marriage, my daughter's age was approximately {{ $record->bride_age }} years.</li>
    <li>That I am happy with the aforementioned marriage.</li>
    <li>That this marriage was solemnized with the consent of the bride, the groom, and both families.</li>
    <li>That I have no objection to this marriage being registered.</li>
</ol>
@include('pdf.partials.verification', ['pronoun' => 'our', 'deponentLabel' => 'Deponent'])

<div class="page-break"></div>

<p>{{ $record->bride_father_name }} R/o {{ $record->bride_address }} has stated that the marriage of his daughter {{ $record->bride_name }} with {{ $record->groom_name }} S/o Sh. {{ $record->groom_father_name }} R/o {{ $record->groom_address }} was solemnized on {{ $marriageDate }} in accordance with {{ $religion }} rites and customs at {{ $record->marriage_venue }}, without any dowry. The marriage took place with the mutual consent of the bride, the groom, and both families. He has no objection to the marriage being registered.</p>
@include('pdf.partials.registrar_statement')

<div class="page-break"></div>

{{-- ============================= PAGES 9-10: FATHER OF THE GROOM ============================= --}}
<h2 class="underline">Affidavit (Father of the Groom)</h2>
<p>I {{ $record->groom_father_name }} R/o {{ $record->groom_address }} do hereby solemnly affirm and declare as follows:</p>
<ol>
    <li>That I am a citizen of India.</li>
    <li>That the marriage of my son {{ $record->groom_name }} with {{ $record->bride_name }} D/o Sh. {{ $record->bride_father_name }} R/o {{ $record->bride_address }} was solemnized on {{ $marriageDate }} in accordance with {{ $religion }} rites and customs at {{ $record->marriage_venue }}, without any dowry.</li>
    <li>That at the time of the marriage, his age was approximately {{ $record->groom_age }} years.</li>
    <li>That I am happy with the above marriage.</li>
    <li>That this marriage was solemnized with the consent of the boy and the girl and both families.</li>
    <li>That I have no objection to this marriage being registered.</li>
</ol>
@include('pdf.partials.verification', ['pronoun' => 'our', 'deponentLabel' => 'Deponent'])

<div class="page-break"></div>

<p>{{ $record->groom_father_name }} R/o {{ $record->groom_address }} has stated that the marriage of his son {{ $record->groom_name }} with {{ $record->bride_name }} D/o Sh. {{ $record->bride_father_name }} R/o {{ $record->bride_address }} was solemnized on {{ $marriageDate }} at {{ $record->marriage_venue }}, in accordance with {{ $religion }} rites and customs and without any dowry. The marriage took place with the mutual consent of the bride, the groom, and both families. He has no objection to the marriage being registered.</p>
@include('pdf.partials.registrar_statement')

<div class="page-break"></div>

{{-- ============================= PAGES 11-12: GROOM'S WITNESS ============================= --}}
<h2 class="underline">Affidavit (Witness on behalf of the Groom)</h2>
<p>I {{ $record->groom_witness_name }} S/o {{ $record->groom_witness_father_name }} R/o {{ $record->groom_witness_address }} do hereby solemnly affirm and state as follows:</p>
<ol>
    <li>That I am a citizen of India.</li>
    <li>That the marriage of {{ $record->groom_name }} with {{ $record->bride_name }} D/o Sh. {{ $record->bride_father_name }} R/o {{ $record->bride_address }} was solemnized on {{ $marriageDate }} in accordance with {{ $religion }} rites and customs at {{ $record->marriage_venue }}, without any dowry.</li>
    <li>That at the time of the marriage, the couple was approximately {{ $record->groom_age }} and {{ $record->bride_age }} years old.</li>
    <li>That I was present at the aforementioned marriage and know both parties.</li>
    <li>That this marriage was solemnized with the consent of the bride, the groom, and both families.</li>
    <li>That no one has any objection to the marriage being registered.</li>
</ol>
@include('pdf.partials.verification', ['pronoun' => 'my', 'deponentLabel' => 'Deponent'])

<div class="page-break"></div>

<p>Statement of {{ $record->groom_witness_name }} S/o {{ $record->groom_witness_father_name }} R/o {{ $record->groom_witness_address }}. It is stated that the marriage of {{ $record->groom_name }} with {{ $record->bride_name }} D/o Sh. {{ $record->bride_father_name }} R/o {{ $record->bride_address }} was solemnized on {{ $marriageDate }} in accordance with {{ $religion }} rites and customs at {{ $record->marriage_venue }}, without any dowry. The marriage took place with the consent of the bride, the groom, and both families. I was present at the wedding and know both parties. No one has any objection to the marriage being registered.</p>
@include('pdf.partials.registrar_statement')

<div class="page-break"></div>

{{-- ============================= PAGES 13-14: BRIDE'S WITNESS ============================= --}}
<h2 class="underline">Affidavit (Witness on behalf of the Bride)</h2>
<p>I {{ $record->bride_witness_name }} S/o {{ $record->bride_witness_father_name }} R/o {{ $record->bride_witness_address }} do hereby solemnly affirm and state as follows:</p>
<ol>
    <li>That I am a citizen of India.</li>
    <li>That the marriage of {{ $record->bride_name }} with {{ $record->groom_name }} S/o Sh. {{ $record->groom_father_name }} R/o {{ $record->groom_address }} was solemnized on {{ $marriageDate }} in {{ $record->marriage_venue }}, in accordance with {{ $religion }} rites and customs, without any dowry.</li>
    <li>That at the time of the marriage, the bride was approximately {{ $record->bride_age }} years of age.</li>
    <li>That I was present at the aforementioned wedding and know both parties.</li>
    <li>That this wedding was solemnized with the consent of the bride, the groom, and both families.</li>
    <li>That no one has any objection to the wedding being registered.</li>
</ol>
@include('pdf.partials.verification', ['pronoun' => 'my', 'deponentLabel' => 'Deponent'])

<div class="page-break"></div>

<p>Statement of {{ $record->bride_witness_name }} S/o {{ $record->bride_witness_father_name }} R/o {{ $record->bride_witness_address }}. It is stated that the marriage of {{ $record->bride_name }} with {{ $record->groom_name }} S/o Sh. {{ $record->groom_father_name }} R/o {{ $record->groom_address }} was solemnized on {{ $marriageDate }} in accordance with {{ $religion }} rites and customs at {{ $record->marriage_venue }}, without any dowry. This marriage took place with the consent of the bride, the groom, and both families. I was present at the wedding and know both parties. No one has any objection to the marriage being registered.</p>
@include('pdf.partials.registrar_statement')

<div class="page-break"></div>

{{-- ============================= PAGES 15-16: PANDIT ============================= --}}
<h2 class="underline">Affidavit (Pandit)</h2>
<p>I {{ $record->pandit_name }} S/o {{ $record->pandit_father_name }} R/o {{ $record->pandit_address }} do hereby solemnly affirm and state as follows:</p>
<ol>
    <li>That I am a citizen of India.</li>
    <li>That the marriage of {{ $record->bride_name }} D/o Sh. {{ $record->bride_father_name }} R/o {{ $record->bride_address }} with {{ $record->groom_name }} S/o Sh. {{ $record->groom_father_name }} R/o {{ $record->groom_address }} was solemnized on {{ $marriageDate }} at {{ $record->marriage_venue }}, in accordance with {{ $religion }} rites and customs and without any dowry, and the Phere (wedding circumambulation) ceremony of the bride and groom was conducted by me.</li>
    <li>I am happy with the aforementioned marriage, and I was present at the said wedding.</li>
    <li>The marriage was solemnized with the consent of both families.</li>
    <li>I have no objection to this marriage being registered.</li>
</ol>
@include('pdf.partials.verification', ['pronoun' => 'my', 'deponentLabel' => 'Deponent'])

<div class="page-break"></div>

<p>Statement of {{ $record->pandit_name }} S/o {{ $record->pandit_father_name }} R/o {{ $record->pandit_address }}. He stated that the marriage of {{ $record->bride_name }} D/o Sh. {{ $record->bride_father_name }} R/o {{ $record->bride_address }} with {{ $record->groom_name }} S/o Sh. {{ $record->groom_father_name }} R/o {{ $record->groom_address }} took place on {{ $marriageDate }} in accordance with {{ $religion }} rites and customs at {{ $record->marriage_venue }}. It was solemnized without dowry, and he performed the wedding rituals for the bride and groom. The marriage was solemnized with the consent of both parents and their families. He was present at the wedding. He has no objection to the marriage being registered.</p>
@include('pdf.partials.registrar_statement')

</body>
</html>
