<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>RC Smart Card - {{ $data['regNo'] ?? 'Vehicle Details' }}</title>
    <style>
        @page {
            margin: 6mm 8mm 6mm 8mm;
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
            border-bottom: 1px solid #0284c7;
        }
        .page-header h1 {
            margin: 0;
            font-size: 11pt;
            font-weight: bold;
            color: #0c4a6e;
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
            color: #64748b;
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
            border: 0.8px solid #64748b;
            border-radius: 3.2mm;
            overflow: hidden;
            background: #ffffff;
            position: relative;
            box-sizing: border-box;
        }

        /* Top Header Bar */
        .header-bar-front {
            background-color: #dbeafe;
            border-bottom: 0.8px solid #93c5fd;
            padding: 0.8mm 2mm;
            height: 9.2mm;
            box-sizing: border-box;
        }
        .header-bar-back {
            background-color: #dbeafe;
            border-bottom: 0.8px solid #93c5fd;
            padding: 0.8mm 2mm;
            height: 6.5mm;
            box-sizing: border-box;
        }

        /* Badges */
        .badge-nt {
            display: inline-block;
            width: 12px;
            height: 12px;
            line-height: 12px;
            text-align: center;
            border-radius: 50%;
            background-color: #38bdf8;
            border: 0.6px solid #0284c7;
            color: #082f49;
            font-size: 4.5pt;
            font-weight: 900;
        }
        .badge-st {
            display: inline-block;
            width: 12px;
            height: 12px;
            line-height: 12px;
            text-align: center;
            border-radius: 50%;
            background-color: #f97316;
            border: 0.6px solid #c2410c;
            color: #ffffff;
            font-size: 4.5pt;
            font-weight: 900;
            margin-left: 1.5px;
        }

        .circled-serial {
            display: inline-block;
            width: 11px;
            height: 11px;
            line-height: 11px;
            text-align: center;
            border-radius: 50%;
            border: 0.8px solid #0f172a;
            font-weight: bold;
            font-size: 4.8pt;
        }

        /* Typography */
        .t-lbl {
            font-size: 3.9pt;
            color: #475569;
            line-height: 1.0;
            margin: 0;
            padding: 0;
        }
        .t-val {
            font-size: 4.9pt;
            font-weight: bold;
            color: #0f172a;
            line-height: 1.1;
            margin: 0 0 0.25mm 0;
            padding: 0;
        }

        /* Rotated Vertical Text */
        .rot-text {
            position: absolute;
            left: 83.6mm;
            top: 15.5mm;
            transform: rotate(90deg);
            -webkit-transform: rotate(90deg);
            transform-origin: 0 0;
            font-size: 4.1pt;
            color: #64748b;
            letter-spacing: 0.2px;
            white-space: nowrap;
        }
        .rot-text-back {
            position: absolute;
            left: 83.6mm;
            top: 20mm;
            transform: rotate(90deg);
            -webkit-transform: rotate(90deg);
            transform-origin: 0 0;
            font-size: 4.4pt;
            font-weight: bold;
            color: #64748b;
            letter-spacing: 0.4px;
            white-space: nowrap;
        }

        /* Divider & Guide */
        .cut-guide-container {
            margin: 2mm 0 2.5mm 0;
            text-align: center;
        }
        .cut-line {
            border-top: 1.2px dashed #94a3b8;
            position: relative;
            margin: 1.5mm 0;
        }
        .cut-badge {
            display: inline-block;
            background: #ffffff;
            color: #475569;
            font-size: 6.2pt;
            font-weight: bold;
            padding: 0 4mm;
            margin-top: -2.8mm;
            position: relative;
        }
        .instruction-box {
            background: #f0f9ff;
            border: 0.8px solid #bae6fd;
            border-radius: 1.5mm;
            padding: 1.2mm 2.5mm;
            font-size: 5.8pt;
            color: #0369a1;
            line-height: 1.25;
            text-align: center;
            margin: 1mm auto 2.5mm auto;
            width: 90%;
        }

        /* Official Particulars Sheet (Bottom of page) */
        .summary-header {
            background: #f1f5f9;
            border-left: 3px solid #0284c7;
            padding: 1mm 2mm;
            font-size: 7.2pt;
            font-weight: bold;
            color: #0f172a;
            margin: 1.5mm 0 1mm 0;
            text-transform: uppercase;
        }
        .details-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 6.2pt;
            margin-bottom: 1.5mm;
        }
        .details-table th, .details-table td {
            border: 0.5px solid #cbd5e1;
            padding: 1mm 1.6mm;
            text-align: left;
        }
        .details-table th {
            background-color: #f8fafc;
            color: #475569;
            font-weight: 600;
            width: 22%;
        }
        .details-table td {
            color: #0f172a;
            font-weight: 500;
            width: 28%;
        }

        .official-footer {
            border-top: 0.8px solid #cbd5e1;
            padding-top: 1.2mm;
            margin-top: 1mm;
            font-size: 5.2pt;
            color: #94a3b8;
            text-align: center;
        }
    </style>
</head>
<body>

    <!-- Page Header -->
    <div class="page-header">
        <h1>Indian Union Vehicle Registration Certificate</h1>
        <div class="subtitle">
            Parivahan e-RC Smart Card Format &bull; Standard CR80 PVC Printable Sheet (85.60 mm &times; 53.98 mm)
        </div>
    </div>

    <!-- CARDS CONTAINER (Stacked Front & Back exactly as in user image) -->
    <div class="cards-wrapper">

        <!-- FRONT SIDE -->
        <div class="side-label">&bull; FRONT SIDE &bull; (CR80 SMART CARD)</div>
        <div class="card-box">
            <!-- Header Bar -->
            <div class="header-bar-front">
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <!-- Ashoka Emblem -->
                        <td style="width: 7.5mm; vertical-align: middle; padding: 0;">
                            @if(!empty($data['emblemSvg']))
                                <img src="{{ $data['emblemSvg'] }}" height="26" style="display: block;" />
                            @else
                                <div style="font-size: 4pt; font-weight: bold;">INDIA</div>
                            @endif
                        </td>
                        <!-- Title -->
                        <td style="text-align: center; vertical-align: middle; padding: 0 1mm;">
                            <div style="font-size: 5.8pt; font-weight: 900; color: #0f172a; text-transform: uppercase; letter-spacing: 0.2px; line-height: 1.15;">
                                Issued by GOVERNMENT OF {{ $data['stateName'] ?? 'INDIA' }}
                            </div>
                        </td>
                        <!-- NT & State Badges -->
                        <td style="width: 10mm; text-align: right; vertical-align: middle; padding: 0;">
                            <span class="badge-nt">{{ $data['isTransport'] ?? 'NT' }}</span><span class="badge-st">{{ $data['stateCode'] ?? 'IND' }}</span>
                        </td>
                    </tr>
                </table>
            </div>

            <!-- Front Card Body -->
            <div style="padding: 0.8mm 3.2mm 0.4mm 2mm;">
                <!-- 4 Columns Header: Regn No, Date, Validity, Owner Serial -->
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 0.3mm;">
                    <tr>
                        <td style="width: 29%; vertical-align: top; padding: 0;">
                            <div class="t-lbl">Regn No</div>
                            <div class="t-val" style="font-size: 6.2pt; font-family: monospace; color: #000000;">{{ $data['regNo'] ?? 'N/A' }}</div>
                        </td>
                        <td style="width: 26%; vertical-align: top; padding: 0;">
                            <div class="t-lbl">Date of Regn.</div>
                            <div class="t-val">{{ $data['regDate'] ?? 'N/A' }}</div>
                        </td>
                        <td style="width: 27%; vertical-align: top; padding: 0;">
                            <div class="t-lbl">Regn. Validity</div>
                            <div class="t-val" style="color: #15803d;">{{ $data['rcExpiryDate'] ?? 'N/A' }}</div>
                        </td>
                        <td style="width: 18%; vertical-align: top; text-align: right; padding: 0 2.2mm 0 0;">
                            <div class="t-lbl" style="text-align: right;">Owner Serial</div>
                            <div style="text-align: right; margin-top: 0.2mm;"><span class="circled-serial">{{ $data['ownerCount'] ?? '1' }}</span></div>
                        </td>
                    </tr>
                </table>

                <!-- Chassis No -->
                <div class="t-lbl">Chassis No</div>
                <div class="t-val" style="font-family: monospace; font-size: 5.2pt;">{{ $data['chassis'] ?? 'N/A' }}</div>

                <!-- Engine/Motor No -->
                <div class="t-lbl">Engine/Motor No</div>
                <div class="t-val" style="font-family: monospace; font-size: 5.2pt;">{{ $data['engine'] ?? 'N/A' }}</div>

                <!-- Owner Name -->
                <div class="t-lbl">Owner Name</div>
                <div class="t-val" style="font-size: 5.4pt; color: #0c4a6e;">{{ Str::limit($data['owner'] ?? 'N/A', 36) }}</div>

                <!-- Son/Wife/Daughter of -->
                <div class="t-lbl">Son/Wife/Daughter of (In case of Individual Owner)</div>
                <div class="t-val">{{ Str::limit($data['ownerFatherName'] ?? 'N/A', 36) }}</div>

                <!-- Ownership -->
                <div class="t-lbl">Ownership</div>
                <div class="t-val">{{ $data['ownership'] ?? 'INDIVIDUAL' }}</div>

                <!-- Address -->
                <div class="t-lbl">Address</div>
                <div class="t-val" style="font-size: 4.4pt; line-height: 1.05; margin-bottom: 0.35mm;">{{ Str::limit($data['presentAddress'] ?? 'N/A', 75) }}</div>

                <!-- Fuel & Emission Norms -->
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="width: 35%; vertical-align: top; padding: 0;">
                            <div class="t-lbl">Fuel</div>
                            <div class="t-val" style="margin: 0;">{{ $data['type'] ?? 'N/A' }}</div>
                        </td>
                        <td style="vertical-align: top; padding: 0;">
                            <div class="t-lbl">Emission Norms</div>
                            <div class="t-val" style="margin: 0;">{{ $data['normsType'] ?? 'N/A' }}</div>
                        </td>
                    </tr>
                </table>
            </div>

            <!-- Rotated Card Issue Date on Right Edge -->
            <div class="rot-text">Card Issue Date {{ now()->format('d-m-Y') }}</div>
        </div>

        <!-- GAP / CUT GUIDE BETWEEN FRONT & BACK -->
        <div style="height: 3mm; line-height: 3mm; text-align: center; font-size: 4.8pt; color: #94a3b8;">
            - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
        </div>

        <!-- BACK SIDE -->
        <div class="side-label">&bull; BACK SIDE &bull; (CR80 SMART CARD)</div>
        <div class="card-box">
            <!-- Header Bar -->
            <div class="header-bar-back">
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <!-- Badges on Left -->
                        <td style="width: 10mm; vertical-align: middle; padding: 0;">
                            <span class="badge-nt">{{ $data['isTransport'] ?? 'NT' }}</span><span class="badge-st">{{ $data['stateCode'] ?? 'IND' }}</span>
                        </td>
                        <!-- Vehicle Class -->
                        <td style="text-align: center; vertical-align: middle; padding: 0 1mm;">
                            <div style="font-size: 5.4pt; font-weight: 900; color: #0f172a; text-transform: uppercase;">
                                Vehicle Class: {{ strtoupper($data['vehicleClass'] ?? 'MOTOR CAR (LMV)') }}
                            </div>
                        </td>
                        <td style="width: 10mm; padding: 0;"></td>
                    </tr>
                </table>
            </div>

            <!-- Back Card Body -->
            <div style="padding: 0.8mm 3.2mm 0.4mm 2mm;">
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <!-- LEFT COLUMN: Reg No, QR Code, Mfg Month-Year, Cylinders -->
                        <td style="width: 32%; vertical-align: top; padding: 0 1mm 0 0;">
                            <div class="t-lbl">Regn. Number</div>
                            <div class="t-val" style="font-family: monospace; font-size: 5.6pt; color: #000000; margin-bottom: 0.4mm;">{{ $data['regNo'] ?? 'N/A' }}</div>

                            <!-- Large Density QR Code -->
                            @if(!empty($data['qrCodeSvg']))
                                <img src="{{ $data['qrCodeSvg'] }}" width="48" height="48" style="display: block; border: 0.5px solid #cbd5e1; margin-bottom: 0.4mm;" />
                            @else
                                <div style="width: 48px; height: 48px; border: 0.5px solid #cbd5e1; text-align: center; font-size: 4pt; color: #94a3b8; padding-top: 16px;">QR CODE</div>
                            @endif

                            <div class="t-lbl">Month-Year of Mfg.</div>
                            <div class="t-val" style="margin-bottom: 0.3mm;">{{ $data['mfgMonthYear'] ?? '01-2021' }}</div>

                            <div class="t-lbl">No. of Cylinders &nbsp; <span style="font-weight: bold; color: #0f172a;">{{ $data['cylinders'] ?? '4' }}</span></div>
                        </td>

                        <!-- RIGHT COLUMN: Maker, Model, Colour, Seating, Weight, Engine specs, Financier, Signature -->
                        <td style="width: 68%; vertical-align: top; padding: 0 0 0 1.2mm; border-left: 0.5px solid #cbd5e1;">
                            <div class="t-lbl">Maker's Name:</div>
                            <div class="t-val">{{ Str::limit($data['vehicleManufacturerName'] ?? 'N/A', 32) }}</div>

                            <div class="t-lbl">Model Name:</div>
                            <div class="t-val">{{ Str::limit($data['model'] ?? 'N/A', 32) }}</div>

                            <!-- Colour & Body Type Row -->
                            <table style="width: 100%; border-collapse: collapse; margin-bottom: 0.25mm;">
                                <tr>
                                    <td style="width: 50%; vertical-align: top; padding: 0;">
                                        <div class="t-lbl">Colour:</div>
                                        <div class="t-val" style="margin: 0;">{{ Str::limit($data['vehicleColour'] ?? 'N/A', 15) }}</div>
                                    </td>
                                    <td style="width: 50%; vertical-align: top; padding: 0;">
                                        <div class="t-lbl">/ Body Type:</div>
                                        <div class="t-val" style="margin: 0;">/ {{ Str::limit($data['bodyType'] ?? 'N/A', 15) }}</div>
                                    </td>
                                </tr>
                            </table>

                            <div class="t-lbl">Seating(in all) Capacity</div>
                            <div class="t-val">{{ $data['vehicleSeatCapacity'] ?? '5' }}</div>

                            <div class="t-lbl">Unladen Weight (Kg)</div>
                            <div class="t-val">{{ $data['unladenWeight'] ?? 'N/A' }}</div>

                            <!-- Cubic Cap / Horse Power / Wheelbase -->
                            <div class="t-lbl">Cubic Cap. / Horse Power (BHP/Kw) / Wheel Base(mm)</div>
                            <div class="t-val">
                                {{ $data['vehicleCubicCapacity'] ?? 'N/A' }} &nbsp; / {{ $data['horsePower'] ?? 'N/A' }} &nbsp; / {{ $data['wheelbase'] ?? 'N/A' }}
                            </div>

                            <div class="t-lbl">Financier:</div>
                            <div class="t-val">{{ Str::limit($data['rcFinancer'] ?? 'NONE', 28) }}</div>

                            <!-- Authority Signature & Stamp -->
                            <table style="width: 100%; border-collapse: collapse; margin-top: 0.2mm;">
                                <tr>
                                    <td style="text-align: right; padding: 0;">
                                        <div style="display: inline-block; text-align: center;">
                                            <div style="font-family: cursive, sans-serif; font-size: 5pt; color: #1e3a8a; border-bottom: 0.6px solid #0f172a; padding: 0 3mm;">
                                                <em>Signature</em>
                                            </div>
                                            <div style="font-size: 3.6pt; color: #475569; margin-top: 0.1mm;">Registration Authority</div>
                                            <div style="font-size: 3.9pt; font-weight: bold; color: #0f172a;">{{ Str::limit($data['regAuthority'] ?? 'N/A', 40) }}</div>
                                        </div>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </div>

            <!-- Rotated Form 23A on Right Edge -->
            <div class="rot-text-back">Form 23A</div>
        </div>

    </div>

    <!-- Scissor Cut / Fold Guide -->
    <div class="cut-guide-container">
        <div class="cut-line"></div>
        <div class="cut-badge">&bull; &bull; &bull; CUT HERE FOR PVC SMART CARD (85.6 mm &times; 54.0 mm) &bull; FOLD IN MIDDLE &bull; &bull; &bull;</div>
    </div>

    <!-- Instructions Box -->
    <div class="instruction-box">
        <strong>PVC Print Instructions:</strong> Select <strong>100% Scale (Actual Size / Do Not Scale)</strong> in your printer settings. Cut along card borders for direct PVC card tray printing or fold back-to-back for thermal pouch lamination.
    </div>

    <!-- Official Record Summary Table (Bottom of A4 sheet) -->
    <div class="summary-header">
        Vehicle Registration Details &bull; Complete Public Record
    </div>

    <table class="details-table">
        <tr>
            <th>Registration Number</th>
            <td><strong style="color: #0c4a6e; font-size: 7pt;">{{ $data['regNo'] ?? 'N/A' }}</strong></td>
            <th>Registration Authority</th>
            <td>{{ $data['regAuthority'] ?? 'N/A' }}</td>
        </tr>
        <tr>
            <th>Registration Date</th>
            <td>{{ $data['regDate'] ?? 'N/A' }}</td>
            <th>RC / Fitness Valid Upto</th>
            <td><strong style="color: #15803d;">{{ $data['rcExpiryDate'] ?? 'N/A' }}</strong></td>
        </tr>
        <tr>
            <th>Owner Name</th>
            <td><strong>{{ $data['owner'] ?? 'N/A' }}</strong></td>
            <th>Father / Husband Name</th>
            <td>{{ $data['ownerFatherName'] ?? 'N/A' }}</td>
        </tr>
        <tr>
            <th>Owner Serial No.</th>
            <td>{{ $data['ownerCount'] ?? '1' }}</td>
            <th>RC Status</th>
            <td><span style="color: {{ ($data['status'] ?? '') === 'ACTIVE' ? '#16a34a' : '#dc2626' }}; font-weight: bold;">{{ $data['status'] ?? 'ACTIVE' }}</span></td>
        </tr>
        <tr>
            <th>Vehicle Class</th>
            <td>{{ $data['vehicleClass'] ?? 'N/A' }}</td>
            <th>Fuel Type / Norms</th>
            <td>{{ $data['type'] ?? 'N/A' }} ({{ $data['normsType'] ?? 'N/A' }})</td>
        </tr>
        <tr>
            <th>Maker & Model</th>
            <td colspan="3"><strong>{{ $data['vehicleManufacturerName'] ?? '' }} {{ $data['model'] ?? '' }}</strong></td>
        </tr>
        <tr>
            <th>Chassis Number</th>
            <td><span style="font-family: monospace; font-weight: bold;">{{ $data['chassis'] ?? 'N/A' }}</span></td>
            <th>Engine Number</th>
            <td><span style="font-family: monospace; font-weight: bold;">{{ $data['engine'] ?? 'N/A' }}</span></td>
        </tr>
        <tr>
            <th>Vehicle Color</th>
            <td>{{ $data['vehicleColour'] ?? 'N/A' }}</td>
            <th>Body Type / Wheelbase</th>
            <td>{{ $data['bodyType'] ?? 'N/A' }} / {{ $data['wheelbase'] ?? 'N/A' }}</td>
        </tr>
        <tr>
            <th>Cubic Capacity (CC)</th>
            <td>{{ $data['vehicleCubicCapacity'] ?? 'N/A' }} CC</td>
            <th>Seating Capacity</th>
            <td>{{ $data['vehicleSeatCapacity'] ?? 'N/A' }}</td>
        </tr>
        <tr>
            <th>Unladen / Gross Weight</th>
            <td>{{ $data['unladenWeight'] ?? 'N/A' }} / {{ $data['grossVehicleWeight'] ?? 'N/A' }}</td>
            <th>Tax Validity</th>
            <td>{{ $data['vehicleTaxUpto'] ?? 'N/A' }}</td>
        </tr>
        <tr>
            <th>PUCC Number</th>
            <td>{{ $data['puccNumber'] ?? 'N/A' }}</td>
            <th>PUCC Valid Upto</th>
            <td>{{ $data['puccUpto'] ?? 'N/A' }}</td>
        </tr>
        <tr>
            <th>Insurance Company</th>
            <td>{{ $data['vehicleInsuranceCompanyName'] ?? 'N/A' }}</td>
            <th>Policy Number</th>
            <td>{{ $data['vehicleInsurancePolicyNumber'] ?? 'N/A' }}</td>
        </tr>
        <tr>
            <th>Insurance Valid Upto</th>
            <td>{{ $data['vehicleInsuranceUpto'] ?? 'N/A' }}</td>
            <th>Financier (Hypothecation)</th>
            <td>{{ $data['rcFinancer'] ?? 'NONE' }}</td>
        </tr>
        <tr>
            <th>Registered Address</th>
            <td colspan="3">{{ $data['presentAddress'] ?? 'N/A' }}</td>
        </tr>
    </table>

    <div class="official-footer">
        Generated on: {{ now()->format('d M Y, h:i A') }} &bull; Official Computer Generated Parivahan e-RC Record &bull; Provided by CSP Jaankari Portal
    </div>
</body>
</html>

