<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Vehicle Details - {{ $data['regNo'] }}</title>
    <style>
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            color: #333;
            margin: 0;
            padding: 20px;
            font-size: 14px;
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #2563eb;
            padding-bottom: 15px;
            margin-bottom: 25px;
        }
        .header h1 {
            margin: 0;
            color: #1e40af;
            font-size: 24px;
            text-transform: uppercase;
        }
        .header p {
            margin: 5px 0 0;
            color: #64748b;
            font-size: 12px;
        }
        .section-title {
            background-color: #f1f5f9;
            color: #0f172a;
            padding: 8px 12px;
            font-weight: bold;
            font-size: 16px;
            border-left: 4px solid #3b82f6;
            margin-bottom: 15px;
            margin-top: 25px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        th, td {
            padding: 10px;
            border-bottom: 1px solid #e2e8f0;
            text-align: left;
        }
        th {
            width: 30%;
            color: #475569;
            font-weight: 600;
            font-size: 13px;
        }
        td {
            width: 70%;
            color: #1e293b;
            font-weight: bold;
        }
        .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 11px;
            color: #94a3b8;
            border-top: 1px solid #e2e8f0;
            padding-top: 15px;
        }
    </style>
</head>
<body>

    <div class="header">
        <h1>Vehicle Registration Details</h1>
        <p>Registration Number: <strong>{{ $data['regNo'] ?? 'N/A' }}</strong></p>
        <p>Generated on: {{ now()->format('d M Y, h:i A') }}</p>
    </div>

    <div class="section-title">Owner Information</div>
    <table>
        <tr>
            <th>Owner Name</th>
            <td>{{ $data['owner'] ?? 'N/A' }}</td>
        </tr>
        <tr>
            <th>Owner Count</th>
            <td>{{ $data['ownerCount'] ?? 'N/A' }}</td>
        </tr>
        <tr>
            <th>Financer (Hypothecation)</th>
            <td>{{ $data['rcFinancer'] ?? 'N/A' }}</td>
        </tr>
        <tr>
            <th>Address</th>
            <td>{{ $data['presentAddress'] ?? 'N/A' }}</td>
        </tr>
    </table>

    <div class="section-title">Vehicle Information</div>
    <table>
        <tr>
            <th>Registration Authority</th>
            <td>{{ $data['regAuthority'] ?? 'N/A' }}</td>
        </tr>
        <tr>
            <th>Registration Date</th>
            <td>{{ $data['regDate'] ?? 'N/A' }}</td>
        </tr>
        <tr>
            <th>Vehicle Class</th>
            <td>{{ $data['vehicleClass'] ?? 'N/A' }}</td>
        </tr>
        <tr>
            <th>Manufacturer</th>
            <td>{{ $data['vehicleManufacturerName'] ?? 'N/A' }}</td>
        </tr>
        <tr>
            <th>Model</th>
            <td>{{ $data['model'] ?? 'N/A' }}</td>
        </tr>
        <tr>
            <th>Chassis Number</th>
            <td>{{ $data['chassis'] ?? 'N/A' }}</td>
        </tr>
        <tr>
            <th>Engine Number</th>
            <td>{{ $data['engine'] ?? 'N/A' }}</td>
        </tr>
        <tr>
            <th>Fuel Type</th>
            <td>{{ $data['type'] ?? 'N/A' }}</td>
        </tr>
        <tr>
            <th>Color</th>
            <td>{{ $data['vehicleColour'] ?? 'N/A' }}</td>
        </tr>
        <tr>
            <th>Cubic Capacity (CC)</th>
            <td>{{ $data['vehicleCubicCapacity'] ?? 'N/A' }}</td>
        </tr>
        <tr>
            <th>Seating Capacity</th>
            <td>{{ $data['vehicleSeatCapacity'] ?? 'N/A' }}</td>
        </tr>
        <tr>
            <th>Norms Type</th>
            <td>{{ $data['normsType'] ?? 'N/A' }}</td>
        </tr>
    </table>

    <div class="section-title">Validity & Insurance</div>
    <table>
        <tr>
            <th>RC Status</th>
            <td style="color: {{ ($data['status'] ?? '') == 'ACTIVE' ? '#16a34a' : '#dc2626' }}">{{ $data['status'] ?? 'N/A' }}</td>
        </tr>
        <tr>
            <th>RC Valid Upto</th>
            <td>{{ $data['rcExpiryDate'] ?? 'N/A' }}</td>
        </tr>
        <tr>
            <th>Tax Valid Upto</th>
            <td>{{ $data['vehicleTaxUpto'] ?? 'N/A' }}</td>
        </tr>
        <tr>
            <th>PUCC Valid Upto</th>
            <td>{{ $data['puccUpto'] ?? 'N/A' }}</td>
        </tr>
        <tr>
            <th>Insurance Company</th>
            <td>{{ $data['vehicleInsuranceCompanyName'] ?? 'N/A' }}</td>
        </tr>
        <tr>
            <th>Insurance Valid Upto</th>
            <td>{{ $data['vehicleInsuranceUpto'] ?? 'N/A' }}</td>
        </tr>
        <tr>
            <th>Policy Number</th>
            <td>{{ $data['vehicleInsurancePolicyNumber'] ?? 'N/A' }}</td>
        </tr>
    </table>

    <div class="footer">
        <p>This is a computer generated document based on available public records.</p>
        <p>Provided by CSP Jaankari Portal</p>
    </div>

</body>
</html>
