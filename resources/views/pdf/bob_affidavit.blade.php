<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Bank of Baroda Affidavit - {{ $record->name }}</title>
    <style>
        @page {
            margin: 28px 36px;
        }
        body {
            font-family: 'DejaVu Sans', 'Helvetica', Arial, sans-serif;
            font-size: 12px;
            line-height: 1.45;
            color: #111827;
            margin: 0;
            padding: 0;
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #ea580c;
            padding-bottom: 10px;
            margin-bottom: 16px;
        }
        .bank-title {
            font-size: 20px;
            font-weight: bold;
            color: #ea580c; /* Bank of Baroda Brand Orange */
            letter-spacing: 0.5px;
            margin: 0 0 3px 0;
            text-transform: uppercase;
        }
        .doc-title {
            font-size: 14px;
            font-weight: bold;
            color: #1e293b;
            text-decoration: underline;
            margin: 4px 0 2px 0;
            text-transform: uppercase;
        }
        .doc-subtitle {
            font-size: 10px;
            color: #4b5563;
            font-weight: normal;
        }
        .deponent-intro {
            font-size: 12px;
            text-align: justify;
            margin-bottom: 12px;
            line-height: 1.5;
        }
        .account-table {
            width: 100%;
            border-collapse: collapse;
            margin: 10px 0 14px 0;
            font-size: 11px;
        }
        .account-table th, .account-table td {
            border: 1px solid #cbd5e1;
            padding: 5px 8px;
            text-align: left;
        }
        .account-table th {
            background-color: #f8fafc;
            color: #334155;
            font-weight: bold;
            width: 32%;
        }
        .account-table td {
            color: #0f172a;
            font-weight: 500;
        }
        ol.clauses {
            margin: 0 0 16px 0;
            padding-left: 22px;
        }
        ol.clauses li {
            text-align: justify;
            margin-bottom: 7px;
            line-height: 1.45;
        }
        .verification-box {
            border: 1px dashed #94a3b8;
            background-color: #f8fafc;
            padding: 10px 14px;
            margin-top: 14px;
            border-radius: 4px;
        }
        .verification-title {
            font-weight: bold;
            text-align: center;
            text-decoration: underline;
            margin-bottom: 6px;
            font-size: 12px;
            text-transform: uppercase;
        }
        .signatures {
            margin-top: 36px;
            width: 100%;
        }
        .sig-col {
            width: 48%;
            display: inline-block;
            vertical-align: top;
        }
        .sig-right {
            text-align: right;
            float: right;
        }
        .sig-left {
            text-align: left;
            float: left;
        }
        .sig-line {
            display: inline-block;
            width: 170px;
            border-top: 1px solid #1e293b;
            margin-top: 32px;
            text-align: center;
            padding-top: 3px;
            font-weight: bold;
            font-size: 11px;
        }
        .clear {
            clear: both;
        }
        .badge {
            display: inline-block;
            background-color: #ffedd5;
            color: #c2410c;
            padding: 1px 6px;
            border-radius: 3px;
            font-size: 10px;
            font-weight: bold;
        }
    </style>
</head>
<body>

    <div class="header">
        <div class="bank-title">बैंक ऑफ़ बड़ौदा / BANK OF BARODA</div>
        <div class="doc-title">शपथ पत्र / AFFIDAVIT - DECLARATION</div>
        <div class="doc-subtitle">(For Bank Account Operations, KYC, Correction &amp; Services)</div>
    </div>

    @php
        $affidavitTypeLabels = [
            'name_correction' => 'Name / Spelling Correction in Bank Account',
            'mobile_update' => 'Mobile Number Update / Registration',
            'passbook_lost' => 'Loss of Original Passbook / Issue Duplicate Passbook',
            'dormant_activation' => 'Reactivation of Inoperative / Dormant Account',
            'signature_change' => 'Specimen Signature Update / Change',
            'general' => 'General Banking Declaration / KYC Purpose',
        ];
        $affidavitTitle = $affidavitTypeLabels[$record->affidavit_type] ?? $record->affidavit_type;
        $createdDate = \Carbon\Carbon::parse($record->created_at)->format('d/m/Y');
    @endphp

    <div class="deponent-intro">
        I, <strong>{{ strtoupper($record->name) }}</strong>, 
        {{ $record->gender === 'Female' ? 'Daughter/Wife' : 'Son' }} of Sh. <strong>{{ strtoupper($record->father_name) }}</strong>, 
        aged about <strong>{{ $record->age ?? '___' }}</strong> years, 
        Resident of <strong>{{ $record->village }}</strong>, 
        Tehsil: <strong>{{ $record->tehsil }}</strong>, 
        District: <strong>{{ $record->district }}</strong>, 
        State: <strong>{{ $record->state }}</strong>@if($record->pincode) - <strong>{{ $record->pincode }}</strong>@endif, 
        Mobile No.: <strong>{{ $record->mobile }}</strong>@if($record->aadhar), 
        Aadhaar No.: <strong>{{ $record->aadhar }}</strong>@endif@if($record->pan_no), 
        PAN: <strong>{{ strtoupper($record->pan_no) }}</strong>@endif, 
        do hereby solemnly affirm and state on oath as follows:
    </div>

    {{-- Account Summary Table --}}
    <table class="account-table">
        <tr>
            <th>Bank &amp; Branch Name:</th>
            <td>BANK OF BARODA, {{ strtoupper($record->branch_name) }}</td>
            <th>IFSC Code:</th>
            <td>{{ strtoupper($record->ifsc_code ?: 'BARB0_____') }}</td>
        </tr>
        <tr>
            <th>BOB Account Number:</th>
            <td><strong>{{ $record->account_no }}</strong></td>
            <th>CIF / Customer ID:</th>
            <td>{{ $record->cif_no ?: 'N/A' }}</td>
        </tr>
        <tr>
            <th>Subject / Purpose:</th>
            <td colspan="3"><span class="badge">{{ $affidavitTitle }}</span></td>
        </tr>
    </table>

    <ol class="clauses">
        <li>
            That I am a bona fide citizen and permanent resident of India residing at the aforementioned residential address.
        </li>
        <li>
            That I am an existing account holder maintaining Savings / Current Bank Account with <strong>Bank of Baroda</strong>, Branch: <strong>{{ $record->branch_name }}</strong>, bearing Account No.: <strong>{{ $record->account_no }}</strong>@if($record->cif_no) (CIF ID: {{ $record->cif_no }})@endif.
        </li>

        {{-- Dynamic Clause based on purpose --}}
        @if($record->affidavit_type === 'name_correction')
            <li>
                That my correct and legal name is <strong>{{ strtoupper($record->name) }}</strong> as recorded in my official Government identity proofs (Aadhaar / PAN). In the bank's records, there is a minor spelling discrepancy. I confirm that both names represent one and the same person, i.e., myself, and I request Bank of Baroda to record my name as <strong>{{ strtoupper($record->name) }}</strong>.
            </li>
        @elseif($record->affidavit_type === 'mobile_update')
            <li>
                That my active, personal, and valid mobile number is <strong>{{ $record->mobile }}</strong>. I request Bank of Baroda to link/update this mobile number with my aforesaid Account No. <strong>{{ $record->account_no }}</strong> for all SMS alerts, OTP authentications, and transaction notifications.
            </li>
        @elseif($record->affidavit_type === 'passbook_lost')
            <li>
                That the original passbook of my aforesaid Bank of Baroda Account No. <strong>{{ $record->account_no }}</strong> was inadvertently lost / misplaced. Despite best search, it cannot be traced. The passbook has not been pledged or assigned to any person or institution. I request the Bank to kindly issue a fresh duplicate passbook. I undertake to surrender the original passbook immediately if found in the future.
            </li>
        @elseif($record->affidavit_type === 'dormant_activation')
            <li>
                That my aforesaid Bank of Baroda Account No. <strong>{{ $record->account_no }}</strong> has remained inoperative/dormant due to non-operation. I am submitting fresh self-attested KYC documents (Aadhaar &amp; PAN) and request the Branch Manager to kindly reactivate my account for normal transactions.
            </li>
        @elseif($record->affidavit_type === 'signature_change')
            <li>
                That due to passage of time, my physical signature has changed from the original specimen recorded with the bank. I request the Bank to record and verify my updated specimen signature appended below for all future banking operations.
            </li>
        @endif

        <li>
            That the detailed reason/declaration for this request is as follows: 
            <strong>{{ $record->reason }}</strong>
        </li>

        @if($record->notes)
        <li>
            Additional Statement: {{ $record->notes }}
        </li>
        @endif

        <li>
            That all identity proof and address proof documents submitted by me to Bank of Baroda (Aadhaar Card, PAN Card, Photo) are genuine, valid, authentic, and unaltered.
        </li>
        <li>
            That I shall indemnify and keep indemnified Bank of Baroda, its officials, employees, and agents against all actions, claims, damages, liabilities, and losses that may arise on account of acting upon this solemn declaration.
        </li>
        <li>
            That whatever is stated in paragraphs 1 to 7 above is true and correct to the best of my personal knowledge, belief, and information, and nothing material has been concealed or falsely stated.
        </li>
    </ol>

    <div class="signatures">
        <div class="sig-col sig-left">
            <p style="margin: 0;">Date: <strong>{{ $createdDate }}</strong></p>
            <p style="margin: 3px 0 0 0;">Place: <strong>{{ $record->district }}</strong></p>
        </div>
        <div class="sig-col sig-right">
            <div class="sig-line">
                (DEPONENT / शपथी)<br>
                {{ strtoupper($record->name) }}
            </div>
        </div>
        <div class="clear"></div>
    </div>

    {{-- Verification Box --}}
    <div class="verification-box">
        <div class="verification-title">सत्यापन / VERIFICATION</div>
        <p style="margin: 0; text-align: justify; font-size: 11px;">
            Verified at <strong>{{ $record->district }}</strong> on this <strong>{{ $createdDate }}</strong> that the contents of the above affidavit from paragraph 1 to paragraph 7 are true and correct to the best of my knowledge, information, and belief. No part of it is false and nothing material has been concealed therefrom.
        </p>
        <div class="signatures" style="margin-top: 24px;">
            <div class="sig-col sig-left">
                <div class="sig-line" style="margin-top: 15px; border-top: 1px dashed #64748b;">
                    Bank Official / Notary Seal
                </div>
            </div>
            <div class="sig-col sig-right">
                <div class="sig-line" style="margin-top: 15px;">
                    (DEPONENT / शपथी)<br>
                    Signature of Account Holder
                </div>
            </div>
            <div class="clear"></div>
        </div>
    </div>

</body>
</html>
