<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>Aadhaar Verification Card - {{ $primary['aadhar'] ?? 'Aadhaar Info' }}</title>
    <style>
        @page {
            margin: 5mm 8mm 5mm 8mm;
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
            font-size: 7.5pt;
            line-height: 1.2;
            background: #ffffff;
        }

        /* Top Page Header */
        .page-header {
            text-align: center;
            margin-bottom: 3.5mm;
            padding-bottom: 2mm;
            border-bottom: 1.5px solid #1e3a8a;
        }
        .page-header h1 {
            margin: 0;
            font-size: 11pt;
            font-weight: bold;
            color: #1e3a8a;
            text-transform: uppercase;
            letter-spacing: 0.6px;
        }
        .page-header .subtitle {
            margin: 1.5px 0 0 0;
            font-size: 6.8pt;
            color: #64748b;
        }

        /* Center Card Container */
        .cards-wrapper {
            width: 85.6mm;
            margin: 0 auto 3mm auto;
            text-align: left;
        }

        .side-label {
            font-size: 6.2pt;
            font-weight: bold;
            color: #475569;
            margin-bottom: 1mm;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            text-align: center;
        }

        /* CR80 Standard Dimensions: 85.6mm x 54.0mm */
        .card-box {
            width: 85.6mm;
            height: 54.0mm;
            max-height: 54.0mm;
            border: 0.9px solid #1e293b;
            border-radius: 3.2mm;
            overflow: hidden;
            background: #ffffff;
            position: relative;
            box-sizing: border-box;
        }

        /* Top Header Bar */
        .header-bar-front {
            background-color: #0c2b5e;
            padding: 1.2mm 2.5mm 1mm 2.5mm;
            height: 11mm;
            box-sizing: border-box;
            color: #ffffff;
        }
        .header-bar-back {
            background-color: #0c2b5e;
            padding: 1.2mm 2.5mm 1mm 2.5mm;
            height: 9mm;
            box-sizing: border-box;
            color: #ffffff;
        }

        /* Tricolor strip */
        .tricolor-bar {
            width: 100%;
            height: 1.5px;
            border-collapse: collapse;
        }

        /* Badges */
        .badge-verified {
            display: inline-block;
            padding: 0.6mm 1.8mm;
            border-radius: 1.5mm;
            background-color: #059669;
            color: #ffffff;
            font-size: 4.8pt;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.3px;
        }

        .badge-circle {
            display: inline-block;
            padding: 0.4mm 1.8mm;
            border-radius: 1.2mm;
            background-color: #0284c7;
            color: #ffffff;
            font-size: 5.2pt;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.2px;
        }

        /* Smart Chip */
        .chip {
            width: 8.5mm;
            height: 6.5mm;
            background: #facc15;
            border: 0.6px solid #b45309;
            border-radius: 1.2mm;
            position: relative;
            display: inline-block;
        }
        .chip-line-h1 {
            position: absolute;
            top: 2.1mm;
            left: 0;
            right: 0;
            height: 0.4px;
            background: #92400e;
        }
        .chip-line-h2 {
            position: absolute;
            top: 4.2mm;
            left: 0;
            right: 0;
            height: 0.4px;
            background: #92400e;
        }
        .chip-line-v {
            position: absolute;
            left: 4.2mm;
            top: 0;
            bottom: 0;
            width: 0.4px;
            background: #92400e;
        }

        /* Typography */
        .t-lbl {
            font-size: 4.2pt;
            color: #64748b;
            line-height: 1.0;
            margin: 0;
            padding: 0;
            text-transform: uppercase;
            font-weight: 600;
        }
        .t-val {
            font-size: 5.6pt;
            font-weight: bold;
            color: #0f172a;
            line-height: 1.15;
            margin: 0.2mm 0 0.8mm 0;
            padding: 0;
        }

        /* Divider & Guide */
        .cut-guide-container {
            margin: 2.2mm 0 2.2mm 0;
            text-align: center;
        }
        .cut-line {
            border-top: 1px dashed #94a3b8;
            position: relative;
            margin: 1.2mm 0;
        }
        .cut-badge {
            display: inline-block;
            background: #ffffff;
            color: #475569;
            font-size: 5.6pt;
            font-weight: bold;
            padding: 0 3.5mm;
            margin-top: -2.6mm;
            position: relative;
        }

        /* Card Bottom Strip */
        .card-strip {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 3.8mm;
            background-color: #f8fafc;
            border-top: 0.6px solid #cbd5e1;
            text-align: center;
            line-height: 3.8mm;
            font-size: 4.2pt;
            color: #475569;
            font-weight: bold;
        }

        /* Barcode container */
        .barcode-box {
            text-align: center;
            letter-spacing: 1.5px;
            font-family: monospace;
            font-size: 8pt;
            color: #1e293b;
            font-weight: bold;
            line-height: 1.0;
        }

        /* Verification Particulars Table */
        .summary-header {
            background: #f1f5f9;
            border-left: 3px solid #1e3a8a;
            padding: 1.2mm 2.5mm;
            font-size: 6.8pt;
            font-weight: bold;
            color: #0f172a;
            margin: 2.5mm 0 1.2mm 0;
            text-transform: uppercase;
        }
        .details-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 6.0pt;
            margin-bottom: 2mm;
        }
        .details-table th, .details-table td {
            border: 0.5px solid #cbd5e1;
            padding: 1.1mm 1.5mm;
            text-align: left;
        }
        .details-table th {
            background-color: #f8fafc;
            color: #334155;
            font-weight: bold;
        }
        .details-table td {
            color: #0f172a;
            font-weight: 500;
        }

        .official-footer {
            border-top: 0.8px solid #cbd5e1;
            padding-top: 1.2mm;
            margin-top: 1.2mm;
            font-size: 5.0pt;
            color: #64748b;
            text-align: center;
        }
    </style>
</head>
<body>

    <!-- Top Page Header -->
    <div class="page-header">
        <h1>Aadhaar Linked Information & Telecom Verification Card</h1>
        <div class="subtitle">
            CR80 PVC Smart Card Printable Format (85.60 mm &times; 53.98 mm) &bull; Official Digital Verification Record
        </div>
    </div>

    <!-- CARDS CONTAINER (Front & Back) -->
    <div class="cards-wrapper">

        <!-- FRONT SIDE -->
        <div class="side-label">&bull; FRONT SIDE &bull; (CR80 PVC SMART CARD)</div>
        <div class="card-box">
            <!-- Header Bar -->
            <div class="header-bar-front">
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <!-- Ashoka Emblem in white container -->
                        <td style="width: 8mm; vertical-align: middle; padding: 0;">
                            @if(!empty($emblemSvg))
                                <div style="background: #ffffff; border-radius: 2mm; padding: 1px; width: 7.2mm; height: 8.5mm; text-align: center;">
                                    <img src="{{ $emblemSvg }}" height="26" style="display: block; margin: 0 auto;" />
                                </div>
                            @else
                                <div style="font-size: 4pt; font-weight: bold; color: #fff;">GOI</div>
                            @endif
                        </td>
                        <!-- Title -->
                        <td style="text-align: center; vertical-align: middle; padding: 0 1mm;">
                            <div style="font-size: 5.2pt; font-weight: bold; color: #fde047; text-transform: uppercase; letter-spacing: 0.4px; line-height: 1.1;">
                                GOVERNMENT OF INDIA
                            </div>
                            <div style="font-size: 5.8pt; font-weight: 900; color: #ffffff; text-transform: uppercase; letter-spacing: 0.3px; line-height: 1.15; margin-top: 0.2mm;">
                                AADHAAR INFO & TELECOM CARD
                            </div>
                        </td>
                        <!-- Verified Badge -->
                        <td style="width: 14mm; text-align: right; vertical-align: middle; padding: 0;">
                            <span class="badge-verified">VERIFIED</span>
                        </td>
                    </tr>
                </table>
            </div>

            <!-- Tricolor Line -->
            <table class="tricolor-bar" style="margin: 0; padding: 0;">
                <tr>
                    <td style="width: 33.3%; background: #f97316; height: 1.5px; padding: 0;"></td>
                    <td style="width: 33.4%; background: #ffffff; height: 1.5px; padding: 0;"></td>
                    <td style="width: 33.3%; background: #16a34a; height: 1.5px; padding: 0;"></td>
                </tr>
            </table>

            <!-- Front Card Body -->
            <div style="padding: 1.6mm 2.5mm 0.5mm 2.5mm;">
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <!-- Left Details Column -->
                        <td style="width: 57mm; vertical-align: top; padding: 0 1.5mm 0 0;">
                            
                            <!-- Chip & Name Row -->
                            <table style="width: 100%; border-collapse: collapse; margin-bottom: 0.6mm;">
                                <tr>
                                    <td style="width: 9.5mm; vertical-align: top; padding: 0;">
                                        <div class="chip">
                                            <div class="chip-line-h1"></div>
                                            <div class="chip-line-h2"></div>
                                            <div class="chip-line-v"></div>
                                        </div>
                                    </td>
                                    <td style="vertical-align: middle; padding: 0 0 0 1.5mm;">
                                        <div class="t-lbl">Subscriber Name</div>
                                        <div class="t-val" style="font-size: 7.4pt; color: #0c2b5e; text-transform: uppercase; margin: 0; line-height: 1.1;">
                                            {{ $primary['name'] ?? 'N/A' }}
                                        </div>
                                    </td>
                                </tr>
                            </table>

                            <!-- Father Name -->
                            <div style="margin-top: 0.4mm;">
                                <div class="t-lbl">Father / Guardian</div>
                                <div class="t-val" style="font-size: 5.6pt;">
                                    {{ $primary['fname'] ?? 'N/A' }}
                                </div>
                            </div>

                            <!-- Aadhaar Number -->
                            <div>
                                <div class="t-lbl">Aadhaar Number</div>
                                <div class="t-val" style="font-size: 7.2pt; font-family: monospace; color: #000000; letter-spacing: 0.8px;">
                                    {{ $formattedAadhar ?? $primary['aadhar'] ?? 'N/A' }}
                                </div>
                            </div>

                            <!-- Primary Mobile & Operator -->
                            <table style="width: 100%; border-collapse: collapse; margin-top: 0.2mm;">
                                <tr>
                                    <td style="vertical-align: top; padding: 0;">
                                        <div class="t-lbl">Registered Mobile</div>
                                        <div class="t-val" style="font-size: 6.8pt; font-family: monospace; color: #047857; margin-bottom: 0;">
                                            +91 {{ $primary['num'] ?? 'N/A' }}
                                        </div>
                                    </td>
                                    @if(!empty($primary['circle']) && $primary['circle'] !== 'N/A')
                                    <td style="vertical-align: middle; text-align: right; padding: 0;">
                                        <span class="badge-circle">{{ $primary['circle'] }}</span>
                                    </td>
                                    @endif
                                </tr>
                            </table>

                            <!-- Alt Mobile & Status -->
                            <table style="width: 100%; border-collapse: collapse; margin-top: 0.5mm;">
                                <tr>
                                    <td style="vertical-align: top; padding: 0;">
                                        @if(!empty($primary['alt']))
                                            <span class="t-lbl">Alt: </span>
                                            <span style="font-size: 5.0pt; font-family: monospace; font-weight: bold; color: #334155;">{{ $primary['alt'] }}</span>
                                        @else
                                            <span class="t-lbl">Status: </span>
                                            <span style="font-size: 5.0pt; font-weight: bold; color: #059669;">ACTIVE &bull; 100% KYC OK</span>
                                        @endif
                                    </td>
                                    <td style="text-align: right; vertical-align: top; padding: 0;">
                                        <span style="font-size: 4.4pt; color: #64748b; font-family: monospace;">{{ $verificationId }}</span>
                                    </td>
                                </tr>
                            </table>
                        </td>

                        <!-- Right QR Column -->
                        <td style="width: 23.6mm; vertical-align: top; text-align: center; padding: 0;">
                            @if(!empty($qrCodeSvg))
                                <div style="width: 21mm; height: 21mm; margin: 0 auto; text-align: center; border: 0.6px solid #cbd5e1; padding: 0.5mm; border-radius: 1mm; background: #ffffff;">
                                    <img src="{{ $qrCodeSvg }}" width="72" height="72" style="display: block; margin: 0 auto;" />
                                </div>
                                <div style="font-size: 3.8pt; font-weight: bold; color: #059669; text-transform: uppercase; margin-top: 0.5mm; letter-spacing: 0.3px;">
                                    SECURE QR CODE
                                </div>
                                <div style="font-size: 3.6pt; color: #64748b; margin-top: 0.5mm;">
                                    SCAN TO VERIFY
                                </div>
                            @endif
                        </td>
                    </tr>
                </table>
            </div>

            <!-- Front Card Bottom Strip -->
            <div class="card-strip">
                Unique Identification &bull; Telecom KYC Verification Record &bull; Govt of India
            </div>
        </div>

        <!-- CUT GUIDE -->
        <div class="cut-guide-container">
            <div class="cut-line"></div>
            <div class="cut-badge">&bull; &bull; &bull; FOLD / CUT ALONG LINE FOR CR80 PVC PRINT &bull; &bull; &bull;</div>
        </div>

        <!-- BACK SIDE -->
        <div class="side-label">&bull; BACK SIDE &bull; (CR80 PVC SMART CARD)</div>
        <div class="card-box">
            <!-- Header Bar -->
            <div class="header-bar-back">
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="text-align: left; vertical-align: middle; padding: 0;">
                            <div style="font-size: 5.0pt; font-weight: bold; color: #fde047; text-transform: uppercase; letter-spacing: 0.3px;">
                                DEPARTMENT OF TELECOMMUNICATIONS &bull; GOI
                            </div>
                            <div style="font-size: 5.6pt; font-weight: 900; color: #ffffff; text-transform: uppercase; letter-spacing: 0.2px; margin-top: 0.2mm;">
                                REGISTERED ADDRESS & KYC DETAILS
                            </div>
                        </td>
                        <td style="text-align: right; vertical-align: middle; padding: 0;">
                            <span style="font-size: 4.4pt; color: #cbd5e1; font-family: monospace;">CR80-PVC</span>
                        </td>
                    </tr>
                </table>
            </div>

            <!-- Tricolor Line -->
            <table class="tricolor-bar" style="margin: 0; padding: 0;">
                <tr>
                    <td style="width: 33.3%; background: #f97316; height: 1.5px; padding: 0;"></td>
                    <td style="width: 33.4%; background: #ffffff; height: 1.5px; padding: 0;"></td>
                    <td style="width: 33.3%; background: #16a34a; height: 1.5px; padding: 0;"></td>
                </tr>
            </table>

            <!-- Back Card Body -->
            <div style="padding: 1.8mm 3mm 0.5mm 3mm;">
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="vertical-align: top; padding: 0;">
                            <div class="t-lbl">Registered Address:</div>
                            <div style="font-size: 5.6pt; color: #0f172a; line-height: 1.35; font-weight: 600; margin-top: 0.3mm; max-height: 16mm; overflow: hidden;">
                                {{ $primary['address'] ?? 'N/A' }}
                            </div>

                            <table style="width: 100%; border-collapse: collapse; margin-top: 1.2mm;">
                                <tr>
                                    <td style="width: 33%; vertical-align: top; padding: 0;">
                                        <div class="t-lbl">Telecom Circle</div>
                                        <div class="t-val" style="font-size: 5.4pt; color: #0c2b5e;">
                                            {{ $primary['circle'] ?? 'N/A' }}
                                        </div>
                                    </td>
                                    <td style="width: 33%; vertical-align: top; padding: 0;">
                                        <div class="t-lbl">Total Linked SIMs</div>
                                        <div class="t-val" style="font-size: 5.4pt; color: #047857;">
                                            {{ count($records) }} {{ count($records) === 1 ? 'Connection' : 'Connections' }}
                                        </div>
                                    </td>
                                    <td style="width: 34%; vertical-align: top; padding: 0;">
                                        <div class="t-lbl">Verification Date</div>
                                        <div class="t-val" style="font-size: 5.2pt; font-family: monospace; color: #334155;">
                                            {{ date('d-M-Y') }}
                                        </div>
                                    </td>
                                </tr>
                            </table>

                            <!-- Barcode Simulation -->
                            <div style="margin-top: 0.8mm; text-align: center;">
                                <div class="barcode-box">||| | |||| | || |||| | | |||| || | || |||| |</div>
                                <div style="font-size: 4.4pt; font-family: monospace; color: #475569; letter-spacing: 0.8px;">{{ $verificationId }}</div>
                            </div>
                        </td>
                    </tr>
                </table>
            </div>

            <!-- Back Card Bottom Strip -->
            <div class="card-strip">
                Help: UIDAI 1947 &bull; DoT: 1963 &bull; portal.uidai.gov.in &bull; sancharsaathi.gov.in
            </div>
        </div>

    </div>

    <!-- Official Particulars Sheet (Bottom of page) -->
    <div style="margin-top: 3.5mm;">
        <div class="summary-header">
            Official Verification Particulars & Linked Records (Total {{ count($records) }} {{ count($records) === 1 ? 'Record' : 'Records' }})
        </div>

        <table class="details-table">
            <thead>
                <tr>
                    <th style="width: 5%; text-align: center;">#</th>
                    <th style="width: 22%;">Subscriber Name</th>
                    <th style="width: 16%;">Mobile Number</th>
                    <th style="width: 14%;">Telecom Circle</th>
                    <th style="width: 18%;">Father / Guardian</th>
                    <th style="width: 25%;">Registered Address</th>
                </tr>
            </thead>
            <tbody>
                @foreach($records as $index => $rec)
                <tr style="{{ $index === 0 ? 'background-color: #f0fdf4;' : '' }}">
                    <td style="text-align: center; font-weight: bold;">{{ $index + 1 }}</td>
                    <td style="font-weight: bold; color: #0c2b5e;">{{ $rec['name'] ?? 'N/A' }}</td>
                    <td style="font-family: monospace; font-weight: bold; color: #047857;">
                        {{ $rec['num'] ?? 'N/A' }}
                        @if(!empty($rec['alt']))
                            <div style="font-size: 4.8pt; color: #64748b;">Alt: {{ $rec['alt'] }}</div>
                        @endif
                    </td>
                    <td>{{ $rec['circle'] ?? 'N/A' }}</td>
                    <td>{{ $rec['fname'] ?? 'N/A' }}</td>
                    <td style="font-size: 5.4pt;">{{ $rec['address'] ?? 'N/A' }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>

        <!-- Verification Metadata & Security Stamp -->
        <table style="width: 100%; border-collapse: collapse; margin-top: 1.5mm;">
            <tr>
                <td style="width: 68%; vertical-align: top; font-size: 5.8pt; color: #475569; line-height: 1.4;">
                    <div><strong>Aadhaar Number:</strong> {{ $formattedAadhar ?? $primary['aadhar'] ?? 'N/A' }}</div>
                    <div><strong>Verification Timestamp:</strong> {{ $verifiedAt }}</div>
                    <div><strong>Verification Reference:</strong> {{ $verificationId }}</div>
                    <div style="color: #64748b; font-size: 5.0pt; margin-top: 0.8mm;">
                        Notice: This document is a computer-generated summary of telecom KYC records verified through official electronic gateway services.
                    </div>
                </td>
                <td style="width: 32%; vertical-align: middle; text-align: right;">
                    <div style="display: inline-block; border: 1.5px solid #059669; padding: 2.2mm 3.5mm; border-radius: 2mm; text-align: center; background-color: #ecfdf5;">
                        <div style="font-size: 7.2pt; font-weight: 900; color: #059669; letter-spacing: 0.6px;">DIGITALLY VERIFIED</div>
                        <div style="font-size: 4.8pt; color: #047857; margin-top: 0.4mm; font-weight: bold;">GOVT. TELECOM RECORDS</div>
                        <div style="font-size: 4.4pt; color: #065f46; font-family: monospace; margin-top: 0.2mm;">{{ date('d-M-Y H:i') }}</div>
                    </div>
                </td>
            </tr>
        </table>

        <div class="official-footer">
            Page 1 of 1 &bull; Aadhaar Linked Information Verification System &bull; Generated electronically &bull; Valid without physical signature
        </div>
    </div>

</body>
</html>
