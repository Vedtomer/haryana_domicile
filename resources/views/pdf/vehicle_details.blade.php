<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>RC Smart Card - {{ $data['regNo'] ?? 'Vehicle Details' }}</title>
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
            color: #1e293b;
            margin: 0;
            padding: 0;
            font-size: 8pt;
            line-height: 1.25;
            background: #ffffff;
        }

        /* Top Page Header */
        .page-header {
            text-align: center;
            margin-bottom: 6mm;
            padding-bottom: 3mm;
            border-bottom: 1.5px solid #0284c7;
        }
        .page-header h1 {
            margin: 0;
            font-size: 13pt;
            font-weight: bold;
            color: #0c4a6e;
            text-transform: uppercase;
            letter-spacing: 0.8px;
        }
        .page-header .subtitle {
            margin: 2px 0 0 0;
            font-size: 7.5pt;
            color: #475569;
            font-weight: 500;
        }

        /* PVC Cards Layout Table */
        .pvc-table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 6mm 0;
            margin-bottom: 3.5mm;
        }
        .pvc-col {
            width: 50%;
            vertical-align: top;
            text-align: center;
        }
        .card-label {
            font-size: 6.8pt;
            font-weight: bold;
            color: #475569;
            margin-bottom: 1.5mm;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        /* CR80 PVC Card Dimensions: 85.6mm x 54.0mm */
        .card-cut-wrapper {
            display: inline-block;
            padding: 1.2mm;
            border: 0.8px dashed #94a3b8;
            border-radius: 4.2mm;
            background: #fafafa;
        }
        .pvc-card {
            width: 85.6mm;
            height: 54.0mm;
            max-height: 54.0mm;
            margin: 0 auto;
            border: 1.4px solid #0f3d68;
            border-radius: 3.2mm;
            overflow: hidden;
            background: #ffffff;
            position: relative;
            text-align: left;
        }

        /* Watermark */
        .card-watermark {
            position: absolute;
            top: 17mm;
            left: 0;
            width: 100%;
            text-align: center;
            font-size: 24pt;
            font-weight: 900;
            color: #0284c7;
            opacity: 0.05;
            letter-spacing: 6px;
            text-transform: uppercase;
            z-index: 1;
        }

        /* Tricolor Ribbon */
        .tricolor-bar {
            width: 100%;
            height: 2.2px;
            font-size: 0;
            line-height: 0;
        }
        .tricolor-orange { display: inline-block; width: 33.33%; height: 2.2px; background-color: #FF9933; }
        .tricolor-white  { display: inline-block; width: 33.34%; height: 2.2px; background-color: #FFFFFF; }
        .tricolor-green  { display: inline-block; width: 33.33%; height: 2.2px; background-color: #138808; }

        /* Card Header */
        .card-header {
            background-color: #0f2d4a;
            color: #ffffff;
            padding: 1.2mm 2mm;
            text-align: center;
            border-bottom: 0.8px solid #f59e0b;
        }
        .card-header .title-gov {
            font-size: 6.8pt;
            font-weight: bold;
            color: #fef08a;
            letter-spacing: 0.6px;
            text-transform: uppercase;
            margin: 0;
            line-height: 1.15;
        }
        .card-header .title-sub {
            font-size: 4.6pt;
            color: #e0f2fe;
            text-transform: uppercase;
            letter-spacing: 0.3px;
            margin: 0.5px 0 0 0;
            line-height: 1.1;
        }

        /* Reg Number Badge */
        .reg-badge {
            background: #f8fafc;
            border: 1px solid #0284c7;
            border-radius: 1.5mm;
            padding: 0.8mm 1.5mm;
            text-align: center;
        }
        .reg-number {
            font-size: 9.8pt;
            font-weight: 900;
            color: #0c4a6e;
            letter-spacing: 1.2px;
            font-family: 'DejaVu Sans', monospace;
            line-height: 1.1;
        }
        .status-badge {
            display: inline-block;
            background: #16a34a;
            color: #ffffff;
            font-size: 4pt;
            font-weight: bold;
            padding: 0.2mm 1mm;
            border-radius: 0.8mm;
            text-transform: uppercase;
            vertical-align: middle;
            margin-left: 1mm;
        }

        /* Mini Data Tables */
        .card-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 5pt;
            line-height: 1.18;
        }
        .card-table td {
            padding: 0.3mm 0.5mm;
            vertical-align: top;
        }
        .lbl {
            color: #475569;
            font-weight: normal;
        }
        .val {
            color: #0f172a;
            font-weight: bold;
        }

        /* Card Footer */
        .card-footer {
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            background: #f8fafc;
            border-top: 0.6px solid #cbd5e1;
            padding: 0.7mm 1.5mm;
            text-align: center;
            font-size: 4pt;
            color: #64748b;
            line-height: 1.1;
        }

        /* Scissor Cut Line */
        .cut-guide-container {
            margin: 2mm 0 3mm 0;
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
            color: #64748b;
            font-size: 6.5pt;
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
            font-size: 6.2pt;
            color: #0369a1;
            line-height: 1.25;
            text-align: center;
            margin: 1mm 0 2.5mm 0;
        }

        /* Full Particulars Table */
        .summary-header {
            background: #f1f5f9;
            border-left: 3.5px solid #0284c7;
            padding: 1.2mm 2.5mm;
            font-size: 7.5pt;
            font-weight: bold;
            color: #0f172a;
            margin: 2mm 0 1.2mm 0;
            text-transform: uppercase;
        }
        .details-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 6.5pt;
            margin-bottom: 2mm;
        }
        .details-table th, .details-table td {
            border: 0.6px solid #e2e8f0;
            padding: 1.1mm 1.8mm;
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

        /* Official Footer */
        .official-footer {
            border-top: 0.8px solid #cbd5e1;
            padding-top: 1.5mm;
            margin-top: 1.5mm;
            font-size: 5.5pt;
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
            Smart Card RC Format &bull; Standard CR80 PVC Printable Sheet (85.60 mm &times; 53.98 mm)
        </div>
    </div>

    <!-- PVC Smart Cards (Front & Back Side-by-Side) -->
    <table class="pvc-table">
        <tr>
            <!-- FRONT SIDE -->
            <td class="pvc-col">
                <div class="card-label">&#9986; FRONT SIDE &bull; CR80 PVC (85.6 mm &times; 54.0 mm)</div>
                <div class="card-cut-wrapper">
                    <div class="pvc-card">
                        <!-- Subtle Watermark -->
                        <div class="card-watermark">INDIA</div>

                        <!-- Tricolor Ribbon -->
                        <div class="tricolor-bar">
                            <span class="tricolor-orange"></span><span class="tricolor-white"></span><span class="tricolor-green"></span>
                        </div>

                        <!-- Header -->
                        <div class="card-header">
                            <div class="title-gov">GOVERNMENT OF {{ $data['stateName'] ?? 'INDIA' }}</div>
                            <div class="title-sub">TRANSPORT DEPARTMENT &bull; FORM 23 &bull; CERTIFICATE OF REGISTRATION</div>
                        </div>

                        <!-- Card Body -->
                        <div style="padding: 1.2mm 1.8mm 0 1.8mm; position: relative; z-index: 2;">
                            <!-- Microchip & Reg Number Row -->
                            <table style="width: 100%; border-collapse: collapse; margin-bottom: 1mm;">
                                <tr>
                                    <td style="width: 17mm; vertical-align: middle; padding: 0;">
                                        <!-- Realistic Base64 SVG Smart Card Chip -->
                                        <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjgiIGhlaWdodD0iNTAiIHZpZXdCb3g9IjAgMCA2OCA1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB4PSIxIiB5PSIxIiB3aWR0aD0iNjYiIGhlaWdodD0iNDgiIHJ4PSI2IiByeT0iNiIgZmlsbD0iI2ZhY2MxNSIgc3Ryb2tlPSIjOTI0MDBlIiBzdHJva2Utd2lkdGg9IjIiIC8+PGxpbmUgeDE9IjEiIHkxPSIxNyIgeDI9IjI0IiB5Mj0iMTciIHN0cm9rZT0iIzkyNDAwZSIgc3Ryb2tlLXdpZHRoPSIxLjUiIC8+PGxpbmUgeDE9IjEiIHkxPSIzMyIgeDI9IjI0IiB5Mj0iMzMiIHN0cm9rZT0iIzkyNDAwZSIgc3Ryb2tlLXdpZHRoPSIxLjUiIC8+PGxpbmUgeDE9IjQ0IiB5MT0iMTciIHgyPSI2NyIgeTI9IjE3IiBzdHJva2U9IiM5MjQwMGUiIHN0cm9rZS13aWR0aD0iMS41IiAvPjxsaW5lIHgxPSI0NCIgeTE9IjMzIiB4Mj0iNjciIHkyPSIzMyIgc3Ryb2tlPSIjOTI0MDBlIiBzdHJva2Utd2lkdGg9IjEuNSIgLz48bGluZSB4MT0iMjQiIHkxPSIxIiB4Mj0iMjQiIHkyPSI0OSIgc3Ryb2tlPSIjOTI0MDBlIiBzdHJva2Utd2lkdGg9IjEuNSIgLz48bGluZSB4MT0iNDQiIHkxPSIxIiB4Mj0iNDQiIHkyPSI0OSIgc3Ryb2tlPSIjOTI0MDBlIiBzdHJva2Utd2lkdGg9IjEuNSIgLz48cmVjdCB4PSIyNyIgeTE9IjE3IiB3aWR0aD0iMTQiIGhlaWdodD0iMTYiIHJ4PSIyIiByeT0iMiIgZmlsbD0iI2ZlZjA4YSIgc3Ryb2tlPSIjOTI0MDBlIiBzdHJva2Utd2lkdGg9IjEuNSIgLz48L3N2Zz4=" width="54" height="38" style="display: block; border-radius: 1.5mm;" />
                                    </td>
                                    <td style="vertical-align: middle; padding-left: 1.8mm;">
                                        <div class="reg-badge">
                                            <div style="font-size: 4.2pt; color: #475569; font-weight: bold; text-transform: uppercase; margin-bottom: 0.3px;">
                                                REGISTRATION NO.
                                                <span class="status-badge">{{ $data['status'] ?? 'ACTIVE' }}</span>
                                            </div>
                                            <div class="reg-number">{{ $data['regNo'] ?? 'N/A' }}</div>
                                        </div>
                                    </td>
                                </tr>
                            </table>

                            <!-- Owner & Vehicle Info in 2 mini columns -->
                            <table style="width: 100%; border-collapse: collapse; font-size: 4.9pt; line-height: 1.15;">
                                <tr>
                                    <!-- Left Sub-Column: Owner particulars -->
                                    <td style="width: 53%; vertical-align: top; padding: 0 1mm 0 0;">
                                        <div><span class="lbl">Owner:</span> <span class="val" style="font-size: 5.4pt; color: #0c4a6e;">{{ Str::limit($data['owner'] ?? 'N/A', 23) }}</span></div>
                                        <div style="margin-top: 0.3mm;"><span class="lbl">S/W/D of:</span> <span class="val">{{ Str::limit($data['ownerFatherName'] ?? 'N/A', 22) }}</span></div>
                                        <div style="margin-top: 0.3mm;"><span class="lbl">Owner Serial:</span> <span class="val">{{ $data['ownerCount'] ?? '1' }}</span> &bull; <span class="lbl">Fuel:</span> <span class="val">{{ $data['type'] ?? 'N/A' }}</span></div>
                                        <div style="margin-top: 0.3mm;"><span class="lbl">Address:</span> <span class="val" style="font-size: 4.5pt;">{{ Str::limit($data['presentAddress'] ?? 'N/A', 56) }}</span></div>
                                    </td>
                                    <!-- Right Sub-Column: Vehicle specs -->
                                    <td style="width: 47%; vertical-align: top; padding: 0 0 0 1mm; border-left: 0.5px solid #e2e8f0;">
                                        <div><span class="lbl">Class:</span> <span class="val">{{ Str::limit($data['vehicleClass'] ?? 'N/A', 19) }}</span></div>
                                        <div style="margin-top: 0.3mm;"><span class="lbl">Maker/Model:</span> <span class="val">{{ Str::limit(($data['vehicleManufacturerName'] ?? '') . ' ' . ($data['model'] ?? ''), 21) }}</span></div>
                                        <div style="margin-top: 0.3mm;"><span class="lbl">Reg Date:</span> <span class="val">{{ $data['regDate'] ?? 'N/A' }}</span></div>
                                        <div style="margin-top: 0.3mm;"><span class="lbl">RC Valid:</span> <span class="val" style="color: #15803d;">{{ $data['rcExpiryDate'] ?? 'N/A' }}</span></div>
                                        <div style="margin-top: 0.3mm;"><span class="lbl">Chassis:</span> <span class="val" style="font-family: monospace; font-size: 4.7pt;">{{ Str::limit($data['chassis'] ?? 'N/A', 17) }}</span></div>
                                        <div style="margin-top: 0.3mm;"><span class="lbl">Engine:</span> <span class="val" style="font-family: monospace; font-size: 4.7pt;">{{ Str::limit($data['engine'] ?? 'N/A', 15) }}</span></div>
                                    </td>
                                </tr>
                            </table>
                        </div>

                        <!-- Footer -->
                        <div class="card-footer">
                            Certificate of Registration &bull; Motor Vehicles Act 1988 &bull; Rule 48
                        </div>
                    </div>
                </div>
            </td>

            <!-- BACK SIDE -->
            <td class="pvc-col">
                <div class="card-label">&#9986; BACK SIDE &bull; CR80 PVC (85.6 mm &times; 54.0 mm)</div>
                <div class="card-cut-wrapper">
                    <div class="pvc-card">
                        <!-- Subtle Watermark -->
                        <div class="card-watermark">INDIA</div>

                        <!-- Tricolor Ribbon -->
                        <div class="tricolor-bar">
                            <span class="tricolor-orange"></span><span class="tricolor-white"></span><span class="tricolor-green"></span>
                        </div>

                        <!-- Header -->
                        <div class="card-header">
                            <table style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td style="text-align: left; padding: 0;">
                                        <div class="title-gov" style="font-size: 6.2pt;">VEHICLE TECHNICAL PARTICULARS</div>
                                    </td>
                                    <td style="text-align: right; padding: 0;">
                                        <div style="font-size: 5.5pt; font-weight: bold; color: #fde047;">{{ $data['regNo'] ?? '' }}</div>
                                    </td>
                                </tr>
                            </table>
                        </div>

                        <!-- Card Body -->
                        <div style="padding: 1.1mm 1.8mm 0 1.8mm; position: relative; z-index: 2;">
                            <table style="width: 100%; border-collapse: collapse; font-size: 4.9pt; line-height: 1.15;">
                                <tr>
                                    <!-- Left Column: Technical Specifications -->
                                    <td style="width: 50%; vertical-align: top; padding-right: 1mm;">
                                        <div><span class="lbl">Seating Cap:</span> <span class="val">{{ $data['vehicleSeatCapacity'] ?? 'N/A' }}</span></div>
                                        <div style="margin-top: 0.3mm;"><span class="lbl">Cubic Cap:</span> <span class="val">{{ $data['vehicleCubicCapacity'] ?? 'N/A' }} CC</span></div>
                                        <div style="margin-top: 0.3mm;"><span class="lbl">Unladen Wt:</span> <span class="val">{{ $data['unladenWeight'] ?? 'N/A' }}</span></div>
                                        <div style="margin-top: 0.3mm;"><span class="lbl">Gross Wt:</span> <span class="val">{{ $data['grossVehicleWeight'] ?? 'N/A' }}</span></div>
                                        <div style="margin-top: 0.3mm;"><span class="lbl">Wheelbase:</span> <span class="val">{{ $data['wheelbase'] ?? 'N/A' }}</span></div>
                                        <div style="margin-top: 0.3mm;"><span class="lbl">Norms:</span> <span class="val">{{ Str::limit($data['normsType'] ?? 'N/A', 14) }}</span></div>
                                        <div style="margin-top: 0.3mm;"><span class="lbl">Color:</span> <span class="val">{{ Str::limit($data['vehicleColour'] ?? 'N/A', 14) }}</span></div>
                                        <div style="margin-top: 0.3mm;"><span class="lbl">Tax Valid:</span> <span class="val">{{ $data['vehicleTaxUpto'] ?? 'N/A' }}</span></div>
                                        <div style="margin-top: 0.3mm;"><span class="lbl">PUCC Valid:</span> <span class="val">{{ $data['puccUpto'] ?? 'N/A' }}</span></div>
                                    </td>

                                    <!-- Right Column: Financier, Insurance & QR / Authority -->
                                    <td style="width: 50%; vertical-align: top; padding-left: 1mm; border-left: 0.5px solid #e2e8f0;">
                                        <div><span class="lbl">HPA (Financier):</span> <span class="val">{{ Str::limit($data['rcFinancer'] ?? 'NONE', 18) }}</span></div>
                                        <div style="margin-top: 0.3mm;"><span class="lbl">Insurance Co:</span> <span class="val">{{ Str::limit($data['vehicleInsuranceCompanyName'] ?? 'N/A', 18) }}</span></div>
                                        <div style="margin-top: 0.3mm;"><span class="lbl">Policy No:</span> <span class="val">{{ Str::limit($data['vehicleInsurancePolicyNumber'] ?? 'N/A', 18) }}</span></div>
                                        <div style="margin-top: 0.3mm;"><span class="lbl">Ins. Valid:</span> <span class="val">{{ $data['vehicleInsuranceUpto'] ?? 'N/A' }}</span></div>

                                        <!-- QR Code & Issuing Authority Box -->
                                        <table style="width: 100%; border-collapse: collapse; margin-top: 0.6mm;">
                                            <tr>
                                                <td style="width: 16mm; vertical-align: top; padding: 0;">
                                                    @if(!empty($data['qrCodeSvg']))
                                                        <img src="{{ $data['qrCodeSvg'] }}" width="48" height="48" style="border: 0.5px solid #cbd5e1; border-radius: 1mm; display: block;" />
                                                    @else
                                                        <div style="width: 48px; height: 48px; border: 0.5px solid #cbd5e1; text-align: center; font-size: 4pt; color: #94a3b8; padding-top: 15px;">QR CODE</div>
                                                    @endif
                                                </td>
                                                <td style="vertical-align: top; padding-left: 1.2mm;">
                                                    <div style="font-size: 4.3pt; color: #475569;"><span class="lbl">RTO:</span> <span class="val">{{ Str::limit($data['regAuthority'] ?? 'N/A', 22) }}</span></div>
                                                    <div style="margin-top: 1mm; border: 0.6px dashed #1e40af; border-radius: 1mm; padding: 0.6mm; text-align: center; background: #eff6ff;">
                                                        <div style="font-size: 3.6pt; font-weight: bold; color: #1e40af; text-transform: uppercase;">REGISTERING AUTHORITY</div>
                                                        <div style="font-size: 3.2pt; color: #16a34a; font-weight: bold;">DIGITALLY VERIFIED</div>
                                                    </div>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </div>

                        <!-- Footer -->
                        <div class="card-footer">
                            Keep this Smart Card in the vehicle. If found, please return to nearest RTO.
                        </div>
                    </div>
                </div>
            </td>
        </tr>
    </table>

    <!-- Scissors / Cutting Guide -->
    <div class="cut-guide-container">
        <div class="cut-line"></div>
        <div class="cut-badge">&#9986; CUT HERE FOR PVC SMART CARD PRINTING (85.6 mm &times; 54.0 mm) &#9986;</div>
    </div>

    <!-- PVC Print Instruction Box -->
    <div class="instruction-box">
        <strong>PVC Print Instructions:</strong> Set printer scaling to <strong>100% (Actual Size / Do Not Fit)</strong>. Cut along the card borders for standard CR80 thermal PVC card printer, PVC card tray (Epson/Canon), or laminating pouches.
    </div>

    <!-- Official Vehicle Registration Particulars Sheet (Full Record) -->
    <div class="summary-header">
        Vehicle Registration Details &bull; Official Record Summary
    </div>

    <table class="details-table">
        <tr>
            <th>Registration Number</th>
            <td><strong style="color: #0c4a6e; font-size: 7.5pt;">{{ $data['regNo'] ?? 'N/A' }}</strong></td>
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

    <!-- Official Portal Footer -->
    <div class="official-footer">
        Generated on: {{ now()->format('d M Y, h:i A') }} &bull; This is a computer generated document based on official Parivahan/State Transport Department records &bull; Provided by CSP Jaankari Portal
    </div>

</body>
</html>

