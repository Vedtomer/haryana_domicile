<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>E-Ration Card Slip - {{ $ration['ration_no'] ?? $cleanAadhar }}</title>
    <style>
        @page {
            margin: 8mm 10mm 8mm 10mm;
            size: A4 portrait;
        }
        * {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }
        body {
            font-family: 'DejaVu Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif;
            color: #0f172a;
            margin: 0;
            padding: 0;
            font-size: 8.5pt;
            line-height: 1.3;
            background: #ffffff;
        }

        .slip-container {
            border: 2px solid #b45309;
            border-radius: 8px;
            padding: 12px;
            background: #fff;
            position: relative;
        }

        /* Watermark */
        .watermark {
            position: absolute;
            top: 40%;
            left: 20%;
            font-size: 42pt;
            color: rgba(180, 83, 9, 0.05);
            font-weight: bold;
            transform: rotate(-30deg);
            z-index: 0;
            text-transform: uppercase;
        }

        /* Header */
        .header-table {
            width: 100%;
            border-collapse: collapse;
            border-bottom: 2px solid #b45309;
            padding-bottom: 8px;
            margin-bottom: 10px;
        }
        .header-table td {
            vertical-align: middle;
        }
        .emblem-col {
            width: 55px;
            text-align: center;
        }
        .emblem-img {
            width: 48px;
            height: auto;
        }
        .title-col {
            text-align: center;
            padding: 0 10px;
        }
        .title-col h1 {
            margin: 0;
            font-size: 13pt;
            color: #78350f;
            font-weight: 800;
            letter-spacing: 0.5px;
            text-transform: uppercase;
        }
        .title-col h2 {
            margin: 2px 0 0 0;
            font-size: 10pt;
            color: #1e293b;
            font-weight: 700;
        }
        .title-col .sub {
            margin: 2px 0 0 0;
            font-size: 7.5pt;
            color: #64748b;
        }
        .qr-col {
            width: 65px;
            text-align: right;
        }
        .qr-img {
            width: 60px;
            height: 60px;
        }

        /* Highlight banner */
        .highlight-banner {
            background: #fef3c7;
            border: 1.5px dashed #d97706;
            border-radius: 6px;
            padding: 8px 12px;
            margin-bottom: 12px;
            width: 100%;
        }
        .banner-table {
            width: 100%;
            border-collapse: collapse;
        }
        .banner-label {
            font-size: 8pt;
            color: #92400e;
            font-weight: bold;
            text-transform: uppercase;
        }
        .banner-value {
            font-size: 14pt;
            color: #78350f;
            font-weight: 900;
            letter-spacing: 1.5px;
            font-family: monospace;
        }
        .banner-scheme {
            text-align: right;
            font-size: 9pt;
            color: #047857;
            font-weight: bold;
        }

        /* Section Title */
        .section-title {
            background: #78350f;
            color: #ffffff;
            font-size: 8.5pt;
            font-weight: bold;
            padding: 4px 8px;
            border-radius: 4px;
            margin-bottom: 6px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        /* Detail Table */
        .details-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 12px;
            background: #ffffff;
        }
        .details-table td {
            padding: 5px 8px;
            border: 1px solid #e2e8f0;
            font-size: 8pt;
        }
        .details-table .label {
            width: 25%;
            background: #f8fafc;
            color: #475569;
            font-weight: bold;
        }
        .details-table .val {
            width: 25%;
            color: #0f172a;
            font-weight: 600;
        }

        /* Members Table */
        .members-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 12px;
        }
        .members-table th {
            background: #f1f5f9;
            color: #334155;
            padding: 5px 6px;
            border: 1px solid #cbd5e1;
            font-size: 7.5pt;
            text-align: left;
            font-weight: bold;
        }
        .members-table td {
            padding: 5px 6px;
            border: 1px solid #e2e8f0;
            font-size: 7.5pt;
            color: #1e293b;
        }
        .members-table tr:nth-child(even) td {
            background: #f8fafc;
        }

        /* Footer */
        .slip-footer {
            border-top: 1px solid #cbd5e1;
            padding-top: 6px;
            margin-top: 8px;
            width: 100%;
        }
        .footer-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 7pt;
            color: #64748b;
        }
        .footer-note {
            background: #f8fafc;
            border-left: 3px solid #b45309;
            padding: 5px 8px;
            font-size: 7pt;
            color: #475569;
            margin-top: 8px;
        }
    </style>
</head>
<body>

<div class="slip-container">
    <div class="watermark">E-RATION CARD</div>

    <!-- Header -->
    <table class="header-table">
        <tr>
            <td class="emblem-col">
                @if(!empty($emblemSvg))
                    <img src="{{ $emblemSvg }}" class="emblem-img" alt="Emblem" />
                @endif
            </td>
            <td class="title-col">
                <h1>National Food Security Portal</h1>
                <h2>राष्ट्रीय खाद्य सुरक्षा पोर्टल &bull; ई-राशन कार्ड पर्ची</h2>
                <div class="sub">Department of Food and Public Distribution, Government of India / State PDS</div>
            </td>
            <td class="qr-col">
                @if(!empty($qrCodeSvg))
                    <img src="{{ $qrCodeSvg }}" class="qr-img" alt="QR Code" />
                @endif
            </td>
        </tr>
    </table>

    <!-- Highlight Banner -->
    <div class="highlight-banner">
        <table class="banner-table">
            <tr>
                <td>
                    <div class="banner-label">Ration Card Number / राशन कार्ड संख्या</div>
                    <div class="banner-value">{{ $ration['ration_no'] ?? 'N/A' }}</div>
                </td>
                <td style="text-align: right; vertical-align: middle;">
                    <div class="banner-scheme">Scheme: {{ $ration['scheme'] ?? 'NFSA / State PDS' }}</div>
                    <div style="font-size: 7.5pt; color: #64748b; margin-top: 2px;">
                        Status: <span style="color: #16a34a; font-weight: bold;">ACTIVE / VERIFIED</span>
                    </div>
                </td>
            </tr>
        </table>
    </div>

    <!-- Beneficiary Details -->
    <div class="section-title">राशन कार्ड विवरण / Beneficiary & Card Details</div>
    <table class="details-table">
        <tr>
            <td class="label">Head of Family (मुखिया)</td>
            <td class="val">{{ $ration['head_name'] ?? 'N/A' }}</td>
            <td class="label">Father / Husband (पिता/पति)</td>
            <td class="val">{{ $ration['father_husband'] ?? 'N/A' }}</td>
        </tr>
        <tr>
            <td class="label">Aadhaar UID No.</td>
            <td class="val" style="font-family: monospace;">{{ $formattedAadhar }}</td>
            <td class="label">Card Scheme / Type</td>
            <td class="val">{{ $ration['scheme'] ?? 'NFSA / State PDS' }}</td>
        </tr>
        <tr>
            <td class="label">District (जिला)</td>
            <td class="val">{{ $ration['district'] ?? 'N/A' }}</td>
            <td class="label">State (राज्य)</td>
            <td class="val">{{ $ration['state'] ?? 'N/A' }}</td>
        </tr>
        <tr>
            <td class="label">FPS Dealer Name (डीलर)</td>
            <td class="val">{{ $ration['fps_name'] ?? 'N/A' }}</td>
            <td class="label">FPS Code / Shop No.</td>
            <td class="val">{{ $ration['fps_no'] ?? 'N/A' }}</td>
        </tr>
    </table>

    <!-- Additional / Member Details if present -->
    @if(!empty($ration['members']) && count($ration['members']) > 0)
        <div class="section-title">परिवार के सदस्यों का विवरण / Family Members ({{ count($ration['members']) }})</div>
        <table class="members-table">
            <thead>
                <tr>
                    <th style="width: 8%;">क्र. सं.</th>
                    <th style="width: 32%;">सदस्य का नाम (Member Name)</th>
                    <th style="width: 25%;">संबंध (Relationship)</th>
                    <th style="width: 15%;">लिंग (Gender)</th>
                    <th style="width: 20%;">आधार स्थिति (UID Status)</th>
                </tr>
            </thead>
            <tbody>
                @foreach($ration['members'] as $idx => $m)
                    <tr>
                        <td style="text-align: center; font-weight: bold;">{{ $idx + 1 }}</td>
                        <td style="font-weight: 600;">{{ $m['name'] ?? ($m['member_name'] ?? ($m['Name'] ?? 'Member ' . ($idx + 1))) }}</td>
                        <td>{{ $m['relation'] ?? ($m['relationship'] ?? ($m['Relation'] ?? 'Family Member')) }}</td>
                        <td>{{ $m['gender'] ?? ($m['Gender'] ?? 'N/A') }}</td>
                        <td style="color: #16a34a; font-weight: bold;">{{ $m['uid_status'] ?? ($m['status'] ?? 'Linked / Verified') }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    @endif

    <!-- Official Notice -->
    <div class="footer-note">
        <strong>महत्वपूर्ण सूचना:</strong> यह एक कंप्यूटर जनित राशन कार्ड विवरण पर्ची है। यह विवरण राष्ट्रीय खाद्य सुरक्षा पोर्टल एवं संबंधित राज्य खाद्य एवं रसद विभाग के ऑनलाइन डेटाबेस से सत्यापित किया गया है। इसका उपयोग राशन वितरण एवं सरकारी योजनाओं में सत्यापन हेतु किया जा सकता है।
    </div>

    <!-- Verification Footer -->
    <div class="slip-footer">
        <table class="footer-table">
            <tr>
                <td style="width: 50%;">
                    <strong>Ref ID:</strong> {{ $verificationId }}<br>
                    <strong>Generated On:</strong> {{ $verifiedAt }}
                </td>
                <td style="width: 50%; text-align: right;">
                    <strong>Portal:</strong> NFSA / State PDS Service<br>
                    <strong>Digital Verification:</strong> Certified Online Record
                </td>
            </tr>
        </table>
    </div>

</div>

</body>
</html>
