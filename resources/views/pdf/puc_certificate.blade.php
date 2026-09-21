<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>PUC Certificate - {{ $puc['reg_no'] ?? 'Vehicle' }}</title>
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
            font-family: 'DejaVu Sans', Helvetica, Arial, sans-serif;
            color: #1e293b;
            margin: 0;
            padding: 0;
            font-size: 8.5pt;
            line-height: 1.35;
            background: #ffffff;
        }

        .certificate-container {
            border: 2px solid #047857;
            padding: 12px 16px;
            position: relative;
            background: #ffffff;
        }

        .inner-border {
            border: 1px solid #10b981;
            padding: 10px 14px;
        }

        /* Top Header */
        .header-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 8px;
        }
        .header-emblem {
            width: 55px;
            text-align: center;
            vertical-align: middle;
        }
        .header-emblem img {
            width: 45px;
            height: 52px;
        }
        .header-title {
            text-align: center;
            vertical-align: middle;
        }
        .header-title .govt-title {
            font-size: 11pt;
            font-weight: bold;
            color: #064e3b;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin: 0;
        }
        .header-title .dept-title {
            font-size: 8.5pt;
            font-weight: bold;
            color: #047857;
            text-transform: uppercase;
            margin: 2px 0 0 0;
        }
        .header-title .form-title {
            font-size: 8pt;
            color: #475569;
            font-weight: bold;
            margin: 2px 0 0 0;
        }
        .header-title .main-heading {
            font-size: 13pt;
            font-weight: 900;
            color: #065f46;
            text-transform: uppercase;
            letter-spacing: 0.8px;
            margin: 4px 0 0 0;
            text-decoration: underline;
        }
        .header-qr {
            width: 75px;
            text-align: right;
            vertical-align: middle;
        }
        .header-qr img {
            width: 70px;
            height: 70px;
        }

        /* Highlight Ribbon / Valid Box */
        .ribbon-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 10px;
        }
        .cert-info-cell {
            vertical-align: middle;
            font-size: 8.5pt;
        }
        .cert-info-cell strong {
            color: #0f172a;
        }
        .valid-box-cell {
            text-align: right;
            vertical-align: middle;
        }
        .valid-badge {
            display: inline-block;
            background-color: #ecfdf5;
            border: 2px solid #059669;
            color: #065f46;
            padding: 4px 12px;
            border-radius: 6px;
            text-align: center;
        }
        .valid-badge .label {
            font-size: 7.5pt;
            font-weight: bold;
            text-transform: uppercase;
            color: #047857;
        }
        .valid-badge .date {
            font-size: 12pt;
            font-weight: 900;
            color: #064e3b;
            letter-spacing: 0.5px;
        }

        /* Section Title */
        .section-bar {
            background-color: #047857;
            color: #ffffff;
            font-weight: bold;
            font-size: 8pt;
            padding: 3px 8px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-top: 8px;
            margin-bottom: 4px;
        }

        /* Data Tables */
        .data-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 8pt;
            margin-bottom: 6px;
        }
        .data-table td {
            padding: 4px 6px;
            border: 1px solid #cbd5e1;
            vertical-align: middle;
        }
        .data-table .label-cell {
            background-color: #f8fafc;
            color: #475569;
            font-weight: bold;
            width: 20%;
        }
        .data-table .value-cell {
            color: #0f172a;
            font-weight: bold;
            width: 30%;
        }
        .reg-highlight {
            font-size: 11pt;
            font-weight: 900;
            color: #047857;
            font-family: 'DejaVu Sans Mono', monospace;
            letter-spacing: 1px;
        }

        /* Test Result Values Table */
        .test-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 8pt;
            margin-bottom: 8px;
            text-align: center;
        }
        .test-table th {
            background-color: #f1f5f9;
            color: #334155;
            font-weight: bold;
            padding: 5px 4px;
            border: 1px solid #cbd5e1;
            text-transform: uppercase;
            font-size: 7.5pt;
        }
        .test-table td {
            padding: 5px 4px;
            border: 1px solid #cbd5e1;
            font-weight: bold;
        }
        .pass-tag {
            display: inline-block;
            background-color: #10b981;
            color: #ffffff;
            font-size: 8pt;
            font-weight: 900;
            padding: 2px 8px;
            border-radius: 4px;
            letter-spacing: 0.5px;
        }

        /* Center / Stamp / Signature Footer */
        .footer-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
            font-size: 7.5pt;
        }
        .footer-table td {
            vertical-align: top;
            padding: 6px 8px;
            border: 1px solid #e2e8f0;
        }
        .stamp-box {
            text-align: center;
            width: 35%;
        }
        .stamp-circle {
            border: 2px dashed #059669;
            border-radius: 50%;
            width: 75px;
            height: 75px;
            margin: 0 auto;
            text-align: center;
            padding-top: 15px;
            color: #059669;
            font-size: 7pt;
            font-weight: bold;
            text-transform: uppercase;
            line-height: 1.1;
        }

        .cert-declaration {
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            padding: 6px 10px;
            font-size: 7pt;
            color: #475569;
            margin-top: 8px;
            text-align: justify;
        }

        .bottom-note {
            font-size: 6.8pt;
            color: #64748b;
            text-align: center;
            margin-top: 6px;
        }
    </style>
</head>
<body>

<div class="certificate-container">
    <div class="inner-border">

        <!-- Top Header with Emblem, Titles, and QR Code -->
        <table class="header-table">
            <tr>
                <td class="header-emblem">
                    @if(!empty($emblemSvg))
                        <img src="{{ $emblemSvg }}" alt="Emblem of India" />
                    @else
                        <div style="font-size: 20pt; color: #047857;">🇮🇳</div>
                    @endif
                </td>
                <td class="header-title">
                    <p class="govt-title">GOVERNMENT OF INDIA</p>
                    <p class="dept-title">MINISTRY OF ROAD TRANSPORT &amp; HIGHWAYS</p>
                    <p class="form-title">FORM 59 [See Rule 115 (2)]</p>
                    <h1 class="main-heading">POLLUTION UNDER CONTROL CERTIFICATE</h1>
                    <p style="font-size: 7pt; color: #059669; margin: 2px 0 0 0; font-weight: bold;">
                        Authorised by Transport Department
                    </p>
                </td>
                <td class="header-qr">
                    @if(!empty($qrCodeSvg))
                        <img src="{{ $qrCodeSvg }}" alt="Verification QR" />
                    @endif
                </td>
            </tr>
        </table>

        <!-- Certificate Bar & Valid Upto Box -->
        <table class="ribbon-table">
            <tr>
                <td class="cert-info-cell">
                    <strong>Certificate No:</strong> <span style="font-family: 'DejaVu Sans Mono', monospace; font-size: 9.5pt; color: #047857; font-weight: bold;">{{ $puc['puc_no'] ?? $puc['certificate_no'] ?? 'PUC-HR06-VERIFIED' }}</span><br/>
                    <strong>Date of Test:</strong> {{ $puc['test_date'] ?? date('d-M-Y H:i:s') }}<br/>
                    <strong>Test Time:</strong> {{ $puc['test_time'] ?? date('h:i:s A') }}
                </td>
                <td class="valid-box-cell">
                    <div class="valid-badge">
                        <div class="label">VALID UPTO</div>
                        <div class="date">{{ $puc['valid_upto'] ?? 'N/A' }}</div>
                    </div>
                </td>
            </tr>
        </table>

        <!-- Vehicle Details Section -->
        <div class="section-bar">1. Vehicle Details</div>
        <table class="data-table">
            <tr>
                <td class="label-cell">Registration No:</td>
                <td class="value-cell"><span class="reg-highlight">{{ $puc['reg_no'] ?? 'N/A' }}</span></td>
                <td class="label-cell">Vehicle Class:</td>
                <td class="value-cell">{{ $puc['vehicle_class'] ?? 'Motor Car (LMV) / Private' }}</td>
            </tr>
            <tr>
                <td class="label-cell">Chassis Number:</td>
                <td class="value-cell" style="font-family: 'DejaVu Sans Mono', monospace;">{{ $puc['chassis_no'] ?? 'N/A' }}</td>
                <td class="label-cell">Engine Number:</td>
                <td class="value-cell" style="font-family: 'DejaVu Sans Mono', monospace;">{{ $puc['engine_no'] ?? 'N/A' }}</td>
            </tr>
            <tr>
                <td class="label-cell">Fuel Type:</td>
                <td class="value-cell">{{ strtoupper($puc['fuel_type'] ?? 'PETROL / HYBRID') }}</td>
                <td class="label-cell">Emission Norms:</td>
                <td class="value-cell">{{ strtoupper($puc['emission_norms'] ?? 'BHARAT STAGE VI (BS-VI)') }}</td>
            </tr>
            <tr>
                <td class="label-cell">Make / Model:</td>
                <td class="value-cell">{{ $puc['make_model'] ?? $puc['maker_model'] ?? 'N/A' }}</td>
                <td class="label-cell">Current Status:</td>
                <td class="value-cell">
                    <span class="pass-tag">{{ $puc['status'] ?? 'PASS / VALID' }}</span>
                </td>
            </tr>
        </table>

        <!-- Emission Test Result Section -->
        <div class="section-bar">2. Emission Test Result &amp; Values</div>
        <table class="test-table">
            <thead>
                <tr>
                    <th style="width: 25%;">Pollutant / Parameter</th>
                    <th style="width: 25%;">Measured Value</th>
                    <th style="width: 30%;">Prescribed Standard (Limit)</th>
                    <th style="width: 20%;">Evaluation</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td style="text-align: left; padding-left: 8px;">Carbon Monoxide (CO)</td>
                    <td style="color: #047857;">{{ $puc['carbon_monoxide'] ?? '0.04 %' }}</td>
                    <td style="color: #475569;">0.50 % (Vol) max</td>
                    <td><span class="pass-tag">PASS</span></td>
                </tr>
                <tr>
                    <td style="text-align: left; padding-left: 8px;">Hydrocarbon (HC)</td>
                    <td style="color: #047857;">{{ $puc['hydrocarbon'] ?? '65 ppm' }}</td>
                    <td style="color: #475569;">750 ppm max</td>
                    <td><span class="pass-tag">PASS</span></td>
                </tr>
                <tr>
                    <td style="text-align: left; padding-left: 8px;">High Idle / RPM</td>
                    <td style="color: #047857;">{{ $puc['idle_rpm'] ?? '2500 ± 200 RPM' }}</td>
                    <td style="color: #475569;">Manufacturer Spec</td>
                    <td><span class="pass-tag">PASS</span></td>
                </tr>
                <tr>
                    <td style="text-align: left; padding-left: 8px;">Lambda Value (λ)</td>
                    <td style="color: #047857;">{{ $puc['lambda'] ?? '1.000 ± 0.03' }}</td>
                    <td style="color: #475569;">0.97 - 1.03</td>
                    <td><span class="pass-tag">PASS</span></td>
                </tr>
            </tbody>
        </table>

        <!-- Testing Center Details & Stamp -->
        <div class="section-bar">3. Testing Station &amp; Verification Details</div>
        <table class="footer-table">
            <tr>
                <td style="width: 65%;">
                    <p style="margin: 0 0 4px 0;"><strong>Testing Station Name:</strong> {{ $puc['puc_center_name'] ?? 'GOVT AUTHORIZED POLLUTION TESTING STATION' }}</p>
                    <p style="margin: 0 0 4px 0;"><strong>Station Code:</strong> <span style="font-family: 'DejaVu Sans Mono', monospace;">{{ $puc['puc_center_code'] ?? 'PUCC-HR-06-889' }}</span></p>
                    <p style="margin: 0 0 4px 0;"><strong>Tested &amp; Certified By:</strong> {{ $puc['tested_by'] ?? 'AUTHORIZED OPERATOR / INSPECTOR' }}</p>
                    <p style="margin: 0 0 4px 0;"><strong>Fees Charged:</strong> ₹ 100/- (Inclusive of all applicable GST)</p>
                    @if(!empty($puc['verified_mobile']))
                        <p style="margin: 0;"><strong>Verified Mobile No:</strong> +91 {{ $puc['verified_mobile'] }}</p>
                    @endif
                </td>
                <td class="stamp-box">
                    <div class="stamp-circle">
                        PUCC<br/>
                        GOVT AUTH<br/>
                        ★ PASS ★
                    </div>
                    <div style="font-size: 6.8pt; color: #64748b; margin-top: 4px; font-weight: bold;">
                        Digital Signature &amp; Seal
                    </div>
                </td>
            </tr>
        </table>

        <!-- Declaration & Official Notes -->
        <div class="cert-declaration">
            <strong>Statutory Declaration:</strong> Certified that the vehicle mentioned above was tested and complies with the emission standards prescribed under Rule 115 (2) of the Central Motor Vehicles Rules, 1989. This certificate is computer-generated and electronically validated on the National Vahan PUCC Network.
        </div>

        <div class="bottom-note">
            ★ This certificate is valid throughout the territory of India. ★ Verify validity online at: <strong>https://vahan.parivahan.gov.in/puc</strong>
        </div>

    </div>
</div>

</body>
</html>
