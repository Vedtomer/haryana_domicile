<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Marriage Form - {{ $record->groom_name }} & {{ $record->bride_name }}</title>
    <style>
        body {
            font-family: 'DejaVu Sans', sans-serif;
            font-size: 14px;
            line-height: 1.6;
            margin: 20px;
        }
        h2 {
            text-align: center;
            text-decoration: underline;
            margin-bottom: 20px;
        }
        .page-break {
            page-break-after: always;
        }
        .signature-block {
            margin-top: 50px;
            width: 100%;
        }
        .signature-left {
            float: left;
            width: 50%;
        }
        .signature-right {
            float: right;
            width: 50%;
            text-align: right;
        }
        .clear {
            clear: both;
        }
    </style>
</head>
<body>

    <!-- PAGE 1: JOINT STATEMENT -->
    <h2>Joint Statement</h2>
    <p>We state that the marriage of <strong>{{ $record->bride_name }}</strong> D/o <strong>{{ $record->bride_father_name }}</strong> R/o <strong>{{ $record->bride_address }}</strong> to <strong>{{ $record->groom_name }}</strong> S/o <strong>{{ $record->groom_father_name }}</strong> R/o <strong>{{ $record->groom_address }}</strong> was solemnized on <strong>{{ \Carbon\Carbon::parse($record->marriage_date)->format('d-m-Y') }}</strong> in accordance with Hindu rites and customs at <strong>{{ $record->marriage_venue }}</strong> without any dowry.</p>
    <p>This marriage took place of our own free will and with the consent of our parents and both families. We have no objection to the marriage being registered.</p>
    
    <div class="signature-block">
        <div class="signature-left">R. O. & A.C.</div>
        <div class="signature-right">Registrar of Marriages</div>
    </div>
    <div class="clear"></div>

    <div class="page-break"></div>

    <!-- PAGE 2: BRIDE'S FATHER -->
    <h2>Affidavit (Father of the Bride)</h2>
    <p>I <strong>{{ $record->bride_father_name }}</strong> R/o <strong>{{ $record->bride_address }}</strong> do hereby solemnly affirm and declare as follows:</p>
    <ol>
        <li>That I am a citizen of India.</li>
        <li>That the marriage of my daughter <strong>{{ $record->bride_name }}</strong> with <strong>{{ $record->groom_name }}</strong> S/o <strong>{{ $record->groom_father_name }}</strong> R/o <strong>{{ $record->groom_address }}</strong> was solemnized on <strong>{{ \Carbon\Carbon::parse($record->marriage_date)->format('d-m-Y') }}</strong> in accordance with Hindu rites and customs at <strong>{{ $record->marriage_venue }}</strong>, without any dowry.</li>
        <li>That at the time of the marriage, the age was approximately <strong>{{ $record->bride_age }}</strong> years.</li>
        <li>That I am happy with the aforementioned marriage.</li>
        <li>That this marriage was solemnized with the consent of the bride, the groom, and both families.</li>
        <li>That I have no objection to this marriage being registered.</li>
    </ol>
    
    <h4>Verification</h4>
    <p>It is verified that the statements made in our declaration are true and correct to the best of our knowledge and belief. Nothing has been concealed therein.</p>
    <p>Date: ____________</p>
    
    <div class="signature-block">
        <div class="signature-right">Deponent</div>
    </div>
    <div class="clear"></div>

    <div class="page-break"></div>

    <!-- PAGE 3: GROOM'S FATHER -->
    <h2>Affidavit (Father of the Groom)</h2>
    <p>I Shri <strong>{{ $record->groom_father_name }}</strong> R/o <strong>{{ $record->groom_address }}</strong> do hereby solemnly affirm and declare as follows:</p>
    <ol>
        <li>That I am a citizen of India.</li>
        <li>That the marriage of my Son <strong>{{ $record->groom_name }}</strong> with <strong>{{ $record->bride_name }}</strong> D/o <strong>{{ $record->bride_father_name }}</strong> R/o <strong>{{ $record->bride_address }}</strong> was solemnized on <strong>{{ \Carbon\Carbon::parse($record->marriage_date)->format('d-m-Y') }}</strong> in accordance with Hindu rites and customs at <strong>{{ $record->marriage_venue }}</strong>, without any dowry.</li>
        <li>That at the time of the marriage, his age was approximately <strong>{{ $record->groom_age }}</strong> years.</li>
        <li>That I am happy with the above marriage.</li>
        <li>That this marriage was solemnized with the consent of the boy and the girl and both the families.</li>
        <li>That I have no objection to this marriage being registered.</li>
    </ol>
    
    <h4>Verification</h4>
    <p>It is verified that the statements made in our declaration are true and correct to the best of our knowledge and belief. Nothing has been concealed therein.</p>
    <p>Date: ____________</p>
    
    <div class="signature-block">
        <div class="signature-right">Deponent</div>
    </div>
    <div class="clear"></div>

    <div class="page-break"></div>

    <!-- PAGE 4: GROOM WITNESS -->
    <h2>Affidavit (Witness on behalf of the Groom)</h2>
    <p>I Shri <strong>{{ $record->groom_witness_name }}</strong> S/O <strong>{{ $record->groom_witness_father_name }}</strong> R/o <strong>{{ $record->groom_witness_address }}</strong> do hereby solemnly affirm and state as follows:</p>
    <ol>
        <li>That I am a citizen of India.</li>
        <li>That the marriage of <strong>{{ $record->groom_name }}</strong> with <strong>{{ $record->bride_name }}</strong> D/o <strong>{{ $record->bride_father_name }}</strong> R/o <strong>{{ $record->bride_address }}</strong> was solemnized on <strong>{{ \Carbon\Carbon::parse($record->marriage_date)->format('d-m-Y') }}</strong> in accordance with Hindu rites and customs at <strong>{{ $record->marriage_venue }}</strong>, without any dowry.</li>
        <li>That I was present at the aforementioned marriage and know both parties.</li>
        <li>That this marriage was solemnized with the consent of the bride, the groom, and both families.</li>
        <li>That no one has any objection to the marriage being registered.</li>
    </ol>
    
    <h4>Verification</h4>
    <p>It is verified that the statements made herein are true and correct to the best of my knowledge and belief. Nothing has been concealed.</p>
    <p>Date: ____________</p>
    
    <div class="signature-block">
        <div class="signature-right">Deponent</div>
    </div>
    <div class="clear"></div>

    <div class="page-break"></div>

    <!-- PAGE 5: BRIDE WITNESS -->
    <h2>Affidavit (Witness on behalf of the bride)</h2>
    <p>I Shri <strong>{{ $record->bride_witness_name }}</strong> S/o Shri <strong>{{ $record->bride_witness_father_name }}</strong> R/O <strong>{{ $record->bride_witness_address }}</strong> do hereby solemnly affirm and state as follows:</p>
    <ol>
        <li>That I am a citizen of India.</li>
        <li>That the marriage of <strong>{{ $record->bride_name }}</strong> with <strong>{{ $record->groom_name }}</strong> S/o <strong>{{ $record->groom_father_name }}</strong> R/O <strong>{{ $record->groom_address }}</strong> was solemnized on <strong>{{ \Carbon\Carbon::parse($record->marriage_date)->format('d-m-Y') }}</strong> in <strong>{{ $record->marriage_venue }}</strong>, in accordance with Hindu rites and customs, without any dowry.</li>
        <li>That I was present at the aforementioned wedding and know both parties.</li>
        <li>That this wedding was solemnized with the consent of the bride, the groom, and both families.</li>
        <li>That no one has any objection to the wedding being registered.</li>
    </ol>
    
    <h4>Verification</h4>
    <p>It is verified that the statements made herein are true and correct to the best of my knowledge and belief. Nothing has been concealed.</p>
    <p>Date: ____________</p>
    
    <div class="signature-block">
        <div class="signature-right">Deponent</div>
    </div>
    <div class="clear"></div>

    <div class="page-break"></div>

    <!-- PAGE 6: PANDIT -->
    <h2>Affidavit (Pandit)</h2>
    <p>I Shri <strong>{{ $record->pandit_name }}</strong> S/O <strong>{{ $record->pandit_father_name }}</strong> R/O <strong>{{ $record->pandit_address }}</strong> do hereby solemnly affirm and state as follows:</p>
    <ol>
        <li>That I am a citizen of India.</li>
        <li>That the marriage of <strong>{{ $record->bride_name }}</strong> D/o <strong>{{ $record->bride_father_name }}</strong> R/o <strong>{{ $record->bride_address }}</strong> with <strong>{{ $record->groom_name }}</strong> S/o <strong>{{ $record->groom_father_name }}</strong> R/O <strong>{{ $record->groom_address }}</strong> was solemnized on <strong>{{ \Carbon\Carbon::parse($record->marriage_date)->format('d-m-Y') }}</strong> in <strong>{{ $record->marriage_venue }}</strong>, in accordance with Hindu rites and customs and without any dowry and the Phere ceremony of the bride and groom was conducted by me.</li>
        <li>I am happy with the aforementioned marriage, and I was present at the said wedding.</li>
        <li>The marriage was solemnized with the consent of both families.</li>
        <li>I have no objection to this marriage being registered.</li>
    </ol>
    
    <h4>Verification</h4>
    <p>It is verified that the statements made herein are true and correct to the best of my knowledge and belief. Nothing has been concealed.</p>
    <p>Date: ____________</p>
    
    <div class="signature-block">
        <div class="signature-right">Deponent</div>
    </div>

</body>
</html>
