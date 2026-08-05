<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Marriage Form - {{ $record->groom_name }} & {{ $record->bride_name }}</title>
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
        .center { text-align: center; }
        .underline { text-decoration: underline; }
        table.app-table { width: 100%; border-collapse: collapse; margin: 10px 0; }
        table.app-table th, table.app-table td {
            border: 1px solid #000;
            padding: 3px 8px;
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
    $brideFatherName = $record->bride_father_father_name
        ? $record->bride_father_name . ' S/o Shri ' . $record->bride_father_father_name
        : $record->bride_father_name;
    $brideFatherAddress = $record->bride_father_address ?: $record->bride_address;
    $groomFatherName = $record->groom_father_father_name
        ? $record->groom_father_name . ' S/o Shri ' . $record->groom_father_father_name
        : $record->groom_father_name;
    $groomFatherAddress = $record->groom_father_address ?: $record->groom_address;
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
        <td>Full Name</td>
        <td>{{ strtoupper($record->groom_name) }}</td>
        <td>{{ strtoupper($record->bride_name) }}</td>
    </tr>
    <tr>
        <td>2</td>
        <td>(in Capital letters)</td>
        <td></td>
        <td></td>
    </tr>
    <tr>
        <td>3</td>
        <td>Father's Name</td>
        <td>Sh. {{ $record->groom_father_name }}</td>
        <td>Sh. {{ $record->bride_father_name }}</td>
    </tr>
    <tr>
        <td>4</td>
        <td>Mother's Name</td>
        <td>Smt. {{ $record->groom_mother_name }}</td>
        <td>Smt. {{ $record->bride_mother_name }}</td>
    </tr>
    <tr>
        <td>5</td>
        <td>Nationality</td>
        <td>{{ $nationality }}</td>
        <td>{{ $nationality }}</td>
    </tr>
    <tr>
        <td>6</td>
        <td>Religion</td>
        <td>{{ $religion }}</td>
        <td>{{ $religion }}</td>
    </tr>
    <tr>
        <td>7</td>
        <td>Complete Postal Address (with Proof)</td>
        <td>{{ $record->groom_address }}</td>
        <td>{{ $record->bride_address }}</td>
    </tr>
    <tr>
        <td>8</td>
        <td>Date of Birth (proof in the form of birth Certificate or School Certificate or medical Certificate indicating age)</td>
        <td>{{ $groomDob }}</td>
        <td>{{ $brideDob }}</td>
    </tr>
    <tr>
        <td>9</td>
        <td>Age (in complete years, as on the date of marriage)</td>
        <td>{{ $record->groom_age }} Years</td>
        <td>{{ $record->bride_age }} Years</td>
    </tr>
</table>

<p>Date of Marriage:- {{ $marriageDate }}.</p>
<p>Place of Marriage:- {{ $record->marriage_venue }}.</p>
<p>(Complete details)</p>

<p>Proof of Marriage-(attached any one)-</p>
<p>(1) At least two wedding photos</p>
<p>(2) Certificate from religious institution or priest who solemnized the wedding.</p>
<p>(3) Nikah Name (4) Certificate from.</p>

<div class="page-break"></div>

{{-- ============================= PAGE 2: APPLICATION (cont'd) ============================= --}}
<p>Certified that all information provided in the form is true to the best knowledge and belief and nothing has been concealed therein. It is also certified that this marriage has not been registered earlier any where in India/ abroad. We shall be liable for action as per the law, if we have violated any provision of any law of the land.</p>

<br><br>
<div style="width: 100%;">
    <div style="float: left; width: 33%;">Date</div>
    <div style="float: left; width: 33%;">Signature of Husband</div>
    <div style="float: left; width: 33%;">Signature of Wife</div>
</div>
<div class="clear"></div>
<p>Witness of the</p>

<p style="margin-top: 20px;">Note: Please ensure that the following have been attached (tick documents attached)</p>
<ol>
    <li>Three joint photos of husband and wife (3"x2") (One will be placed in the Marriage Register and two will be affixed to the two copies of Marriage Registration Certificate that the Registrar will issue.)</li>
    <li>Proof of residence of both spouses (Any one)</li>
</ol>

<hr class="rule">
<table class="proof-table">
    <tr><td style="width: 50%;"><strong>For Wife</strong></td><td><strong>For Husband</strong></td></tr>
</table>
<hr class="rule">
<table class="proof-table">
    <tr><td style="width: 50%;">(a) Ration Card</td><td>(a) Ration Card</td></tr>
    <tr><td>(b) BPL Card</td><td>(b) BPL Card</td></tr>
    <tr><td>(c) Election Commission Voter ID Card</td><td>(c) Election Commission Voter ID Card</td></tr>
    <tr><td>(d) Passport</td><td>(d) Passport</td></tr>
    <tr><td>(e) Driving License</td><td>(e) Driving License</td></tr>
    <tr><td>(f) Domicile Certificate</td><td>(f) Domicile Certificate</td></tr>
</table>
<hr class="rule">
<p><strong>3. Proof of Age</strong></p>
<table class="proof-table">
    <tr><td style="width: 50%;"><strong>For Wife</strong></td><td><strong>For Husband</strong></td></tr>
    <tr><td>(a) Birth Certificate</td><td>(a) Birth Certificate</td></tr>
    <tr><td>(b) School Certificate</td><td>(b) School Certificate</td></tr>
    <tr><td>(c) Medical Certificate</td><td>(c) Medical Certificate indicating age</td></tr>
    <tr><td>(d) Self Affidavit</td><td>(d) Self Affidavit regarding age</td></tr>
</table>
<p>Only in case (a) and (b) are not available.</p>
<hr class="rule">
<p><strong>4. Proof of Marriage (Any One)</strong></p>
<p>(a) At least two wedding photos</p>
<p>(b) Certificate from religious institution or priest who solemnized the wedding.</p>
<p>(c) Nikah Nama</p>
<p>(d) Certificate from Gurudwara</p>

<div class="page-break"></div>

{{-- ============================= PAGES 3-4: JOINT AFFIDAVIT ============================= --}}
<h2 class="underline">AFFIDAVIT (Joint Groom & Bride)</h2>
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
<h4>VERIFICATION</h4>
<p>Verified that the above contents of this affidavit are true and correct to the best of our knowledge and belief and nothing has been concealed therein.</p>
<p>Date : ___________________________</p>
<div class="signature-block">
    <div class="signature-right">DEPONENTS</div>
</div>
<div class="clear"></div>

<div class="page-break"></div>

<p>Statement of {{ $record->groom_name }} S/o Sh. {{ $record->groom_father_name }}, R/o {{ $record->groom_address }} &amp; {{ $record->bride_name }} D/o Sh. {{ $record->bride_father_name }}, R/o {{ $record->bride_address }}.</p>
<p>We state that our marriage was solemnized on {{ $marriageDate }} in accordance with {{ $religion }} rites and customs at {{ $record->marriage_venue }}, without any dowry.</p>
<p>This marriage took place of our own free will and with the consent of our parents and both families.</p>
<p>We have no objection to the marriage being registered.</p>
@include('pdf.partials.registrar_statement')

<div class="page-break"></div>

{{-- ============================= PAGES 5-6: BRIDE'S AFFIDAVIT ============================= --}}
<h2 class="underline">Affidavit (Bride)</h2>
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

<p>Statement of Smt. {{ $record->bride_name }}, D/o Sh. {{ $record->bride_father_name }}, R/o {{ $record->bride_address }}.</p>
<p>I state that my marriage to {{ $record->groom_name }}, S/o Sh. {{ $record->groom_father_name }}, R/o {{ $record->groom_address }}, was solemnized on {{ $marriageDate }} in accordance with {{ $religion }} rites and customs at {{ $record->marriage_venue }}, without any dowry.</p>
<p>This marriage took place of my own free will and with the consent of my parents and both families.</p>
<p>I have no objection to the marriage being registered.</p>
@include('pdf.partials.registrar_statement')

<div class="page-break"></div>

{{-- ============================= PAGES 7-8: FATHER OF THE BRIDE ============================= --}}
<h2 class="underline">Affidavit (Father of the Bride)</h2>
<p>I, {{ $brideFatherName }}, R/o {{ $brideFatherAddress }}, do hereby solemnly affirm and declare as follows:</p>
<ol>
    <li>That I am a citizen of India.</li>
    <li>That the marriage of my daughter, {{ $record->bride_name }}, with {{ $record->groom_name }} S/o Sh. {{ $record->groom_father_name }}, R/o {{ $record->groom_address }}, was solemnized on {{ $marriageDate }} in accordance with {{ $religion }} rites and customs at {{ $record->marriage_venue }}, without any dowry.</li>
    <li>That at the time of the marriage, the age was approximately {{ $record->bride_age }} years.</li>
    <li>That I am happy with the aforementioned marriage.</li>
    <li>That this marriage was solemnized with the consent of the bride, the groom, and both families.</li>
    <li>That I have no objection to this marriage being registered.</li>
</ol>
<h4>VERIFICATION</h4>
<p>It is verified that the statements made in this declaration are true and correct to the best of my knowledge and belief. Nothing has been concealed therein.</p>
<p>Date : _______________________</p>
<div class="signature-block">
    <div class="signature-right">DEPONENT</div>
</div>
<div class="clear"></div>

<div class="page-break"></div>

<p>Statement of Shri {{ $brideFatherName }}, R/o {{ $brideFatherAddress }}.</p>
<p>He has stated that the marriage of his daughter, {{ $record->bride_name }}, with {{ $record->groom_name }} S/o Sh. {{ $record->groom_father_name }}, R/o {{ $record->groom_address }}, was solemnized on {{ $marriageDate }} in accordance with {{ $religion }} rites and customs at {{ $record->marriage_venue }}, without any dowry.</p>
<p>The marriage took place with the mutual consent of the bride, the groom, and both families.</p>
<p>He has no objection to the marriage being registered.</p>
@include('pdf.partials.registrar_statement')

<div class="page-break"></div>

{{-- ============================= PAGES 9-10: FATHER OF THE GROOM ============================= --}}
<h2 class="underline">Affidavit (Father of the Groom)</h2>
<p>I, {{ $groomFatherName }}, R/o {{ $groomFatherAddress }}, do hereby solemnly affirm and declare as follows:</p>
<ol>
    <li>That I am a citizen of India.</li>
    <li>That the marriage of my son, {{ $record->groom_name }}, with {{ $record->bride_name }} D/o Sh. {{ $record->bride_father_name }}, R/o {{ $record->bride_address }}, was solemnized on {{ $marriageDate }} in accordance with {{ $religion }} rites and customs at {{ $record->marriage_venue }}, without any dowry.</li>
    <li>That at the time of the marriage, his age was approximately {{ $record->groom_age }} years.</li>
    <li>That I am happy with the above marriage.</li>
    <li>That this marriage was solemnized with the consent of the boy, the girl, and both families.</li>
    <li>That I have no objection to this marriage being registered.</li>
</ol>
<h4>VERIFICATION</h4>
<p>It is verified that the statements made in this declaration are true and correct to the best of my knowledge and belief. Nothing has been concealed therein.</p>
<p>Date : _______________________</p>
<div class="signature-block">
    <div class="signature-right">DEPONENT</div>
</div>
<div class="clear"></div>

<div class="page-break"></div>

<p>Statement of Shri {{ $groomFatherName }}, R/o {{ $groomFatherAddress }}.</p>
<p>He has stated that the marriage of his son, {{ $record->groom_name }}, with {{ $record->bride_name }} D/o Sh. {{ $record->bride_father_name }}, R/o {{ $record->bride_address }}, was solemnized on {{ $marriageDate }} at {{ $record->marriage_venue }}, in accordance with {{ $religion }} rites and customs and without any dowry.</p>
<p>The marriage took place with the mutual consent of the bride, the groom, and both families.</p>
<p>He has no objection to the marriage being registered.</p>
@include('pdf.partials.registrar_statement')

<div class="page-break"></div>

{{-- ============================= PAGES 11-12: GROOM'S WITNESS ============================= --}}
<h2 class="underline">Affidavit (Witness on behalf of the Groom)</h2>
<p>I, Shri {{ $record->groom_witness_name }}, S/o {{ $record->groom_witness_father_name }}, R/o {{ $record->groom_witness_address }}, do hereby solemnly affirm and state as follows:</p>
<ol>
    <li>That I am a citizen of India.</li>
    <li>That the marriage of {{ $record->groom_name }} with {{ $record->bride_name }}, D/o Sh. {{ $record->bride_father_name }}, R/o {{ $record->bride_address }}, was solemnized on {{ $marriageDate }} in accordance with {{ $religion }} rites and customs at {{ $record->marriage_venue }}, without any dowry.</li>
    <li>That at the time of the marriage, the person was approximately {{ $record->bride_age }} years old.</li>
    <li>That I was present at the aforementioned marriage and know both parties.</li>
    <li>That this marriage was solemnized with the consent of the bride, the groom, and both families.</li>
    <li>That no one has any objection to the marriage being registered.</li>
</ol>
<h4>VERIFICATION</h4>
<p>It is verified that the statements made herein are true and correct to the best of my knowledge and belief. Nothing has been concealed.</p>
<p>Date : _______________________</p>
<div class="signature-block">
    <div class="signature-right">DEPONENT</div>
</div>
<div class="clear"></div>

<div class="page-break"></div>

<p>Statement of Shri {{ $record->groom_witness_name }}, S/o {{ $record->groom_witness_father_name }}, R/o {{ $record->groom_witness_address }}.</p>
<p>It is stated that the marriage of {{ $record->groom_name }} with {{ $record->bride_name }}, D/o Sh. {{ $record->bride_father_name }}, R/o {{ $record->bride_address }}, was solemnized on {{ $marriageDate }} in accordance with {{ $religion }} rites and customs at {{ $record->marriage_venue }}, without any dowry.</p>
<p>This marriage took place with the consent of the bride, the groom, and both families.</p>
<p>I was present at the wedding and know both parties.</p>
<p>No one has any objection to the marriage being registered.</p>
@include('pdf.partials.registrar_statement')

<div class="page-break"></div>

{{-- ============================= PAGES 13-14: BRIDE'S WITNESS ============================= --}}
<h2 class="underline">Affidavit (Witness on behalf of the Bride)</h2>
<p>I, Shri {{ $record->bride_witness_name }}, S/o Shri {{ $record->bride_witness_father_name }}, R/o {{ $record->bride_witness_address }}, do hereby solemnly affirm and state as follows:</p>
<ol>
    <li>That I am a citizen of India.</li>
    <li>That the marriage of {{ $record->bride_name }} with {{ $record->groom_name }} S/o Sh. {{ $record->groom_father_name }}, R/o {{ $record->groom_address }}, was solemnized on {{ $marriageDate }} at {{ $record->marriage_venue }}, in accordance with {{ $religion }} rites and customs, without any dowry.</li>
    <li>That at the time of the marriage, she was approximately {{ $record->bride_age }} years of age.</li>
    <li>That I was present at the aforementioned wedding and know both parties.</li>
    <li>That this wedding was solemnized with the consent of the bride, the groom, and both families.</li>
    <li>That no one has any objection to the wedding being registered.</li>
</ol>
<h4>VERIFICATION</h4>
<p>It is verified that the statements made herein are true and correct to the best of my knowledge and belief. Nothing has been concealed.</p>
<p>Date : _______________________</p>
<div class="signature-block">
    <div class="signature-right">Deponent</div>
</div>
<div class="clear"></div>

<div class="page-break"></div>

<p>Statement of Shri {{ $record->bride_witness_name }}, S/o Shri {{ $record->bride_witness_father_name }}, R/o {{ $record->bride_witness_address }}.</p>
<p>It is stated that the marriage of {{ $record->bride_name }} with {{ $record->groom_name }} S/o Sh. {{ $record->groom_father_name }}, R/o {{ $record->groom_address }}, was solemnized on {{ $marriageDate }} in accordance with {{ $religion }} rites and customs at {{ $record->marriage_venue }}, without any dowry.</p>
<p>This marriage took place with the consent of the bride, the groom, and both families.</p>
<p>I was present at the wedding and know both parties.</p>
<p>No one has any objection to the marriage being registered.</p>
@include('pdf.partials.registrar_statement')

<div class="page-break"></div>

{{-- ============================= PAGES 15-16: PANDIT ============================= --}}
<h2 class="underline">Affidavit (Pandit)</h2>
<p>I, Shri {{ $record->pandit_name }}, S/o Shri {{ $record->pandit_father_name }}, R/o {{ $record->pandit_address }}, do hereby solemnly affirm and state as follows:</p>
<ol>
    <li>That I am a citizen of India.</li>
    <li>That the marriage of {{ $record->bride_name }}, D/o Sh. {{ $record->bride_father_name }}, R/o {{ $record->bride_address }}, with {{ $record->groom_name }}, S/o Sh. {{ $record->groom_father_name }}, R/o {{ $record->groom_address }}, was solemnized on {{ $marriageDate }} at {{ $record->marriage_venue }}, in accordance with {{ $religion }} rites and customs, without any dowry. The Phere (wedding circumambulation) ceremony of the bride and groom was conducted by me.</li>
    <li>I am happy with the aforementioned marriage, and I was present at the said wedding.</li>
    <li>The marriage was solemnized with the consent of both families.</li>
    <li>I have no objection to this marriage being registered.</li>
</ol>
<h4>VERIFICATION</h4>
<p>It is verified that the statements made herein are true and correct to the best of my knowledge and belief. Nothing has been concealed.</p>
<p>Date : _______________________</p>
<div class="signature-block">
    <div class="signature-right">Deponent</div>
</div>
<div class="clear"></div>

<div class="page-break"></div>

<p>Statement of Shri {{ $record->pandit_name }}, S/o {{ $record->pandit_father_name }}, R/o {{ $record->pandit_address }}.</p>
<p>He stated that the marriage of {{ $record->bride_name }}, D/o Sh. {{ $record->bride_father_name }}, R/o {{ $record->bride_address }}, with {{ $record->groom_name }}, S/o Sh. {{ $record->groom_father_name }}, R/o {{ $record->groom_address }}, took place on {{ $marriageDate }} in accordance with {{ $religion }} rites and customs at {{ $record->marriage_venue }}.</p>
<p>The marriage was solemnized without dowry, and I performed the wedding rituals for the bride and groom.</p>
<p>It is appropriate to register this marriage.</p>
<p>I am pleased with the marriage.</p>
<p>The marriage was solemnized with the consent of both parents and their families.</p>
<p>I was present at the wedding.</p>
<p>I have no objection to the marriage being registered.</p>
@include('pdf.partials.registrar_statement')

</body>
</html>
