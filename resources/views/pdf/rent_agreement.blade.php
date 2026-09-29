<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Rent Agreement - {{ $record->first_party_name }}</title>
<style>
    @page {
        size: A4 portrait;
        margin: 10mm 24mm 10mm 24mm;
    }
    body {
        font-family: 'DejaVu Sans', 'Helvetica', 'Arial', sans-serif;
        font-size: 10.2pt;
        line-height: 1.34;
        color: #000;
        margin: 0;
        padding: 0;
    }
    .page-break {
        page-break-after: always;
        clear: both;
    }
    h1.title {
        text-align: center;
        font-size: 13.5pt;
        font-weight: bold;
        text-decoration: underline;
        margin: 0 0 10px 0;
        padding: 0;
    }
    p {
        margin: 0 0 6px 0;
        text-align: justify;
        text-justify: inter-word;
    }
    .center-amp {
        text-align: center;
        font-weight: normal;
        margin: 4px 0;
        font-size: 11pt;
    }
    .terms-list {
        margin-top: 6px;
        padding-left: 20px;
    }
    .term-item {
        display: table;
        width: 100%;
        margin-bottom: 3.5px;
        text-align: justify;
    }
    .term-num {
        display: table-cell;
        width: 25px;
        vertical-align: top;
        font-weight: normal;
    }
    .term-text {
        display: table-cell;
        vertical-align: top;
        text-align: justify;
        text-justify: inter-word;
    }
    .spacer {
        height: 6px;
    }
    .closing-text {
        margin-top: 14px;
        margin-bottom: 25px;
        text-align: justify;
    }
    .sig-table {
        width: 100%;
        margin-top: 25px;
        border-collapse: collapse;
    }
    .sig-table td {
        text-align: center;
        font-size: 10.5pt;
        padding: 3px;
        vertical-align: bottom;
    }
    .date-row {
        margin-top: 45px;
        font-size: 10.5pt;
    }
    b {
        font-weight: bold;
    }
</style>
</head>
<body>

<!-- PAGE 1 -->
<div class="page-1">
    <h1 class="title">Rent Agreement</h1>

    <p>
        We, <b>{{ $record->first_party_name }} (Aadhaar Number {{ $record->first_party_aadhar }}), son of Shri {{ $record->first_party_father_name }}, resident of {{ $record->first_party_address }}</b>—the First Party, i.e., the Tenant.
    </p>

    <div class="center-amp">&amp;</div>

    <p>
        Shri <b>{{ $record->second_party_name }}@if(!empty($record->second_party_aadhar)) (Aadhaar Number {{ $record->second_party_aadhar }})@endif, son of Shri {{ $record->second_party_father_name }}, resident of {{ $record->second_party_address }}</b>—hereinafter referred to as the &quot;Second Party&quot; (or the &quot;{{ $record->property_owner_title ?? 'Warehouse Owner' }}&quot;)—hereby declares that he owns a {{ $record->property_type ?? 'warehouse' }} (measuring <b>{{ $record->property_area }}) {{ $record->property_location }}</b>, within the limits of the Municipal Corporation, {{ $record->property_city ?? 'Panipat' }}, which includes a constructed building. This property is free from all legal encumbrances. The First Party has taken this property on rent from the Second Party for a period of {{ $record->tenancy_months ?? 11 }} months, specifically from {{ $record->from_date }} to {{ $record->to_date }}, subject to the following terms and conditions.
    </p>

    <div class="terms-list">
        <div class="term-item">
            <span class="term-num">1.</span>
            <div class="term-text">
                That the Second Party has handed over possession of the aforementioned house premises to the First Party as a tenant for the period from <b>{{ $record->from_date }} to {{ $record->to_date }}</b>, and the First Party has taken over possession.
            </div>
        </div>

        <div class="term-item">
            <span class="term-num">2.</span>
            <div class="term-text">
                That the First Party shall pay the agreed monthly rent of Rs. <b>{{ $record->monthly_rent }}</b>/- ({{ $record->monthly_rent_words }}) in advance, and shall be bound to make such payment between the 1st and the 10th day of the English calendar month.
            </div>
        </div>

        <div class="term-item">
            <span class="term-num">3.</span>
            <div class="term-text">
                That the First Party shall use the aforementioned house for the duration of the tenancy; shall not sublet it to anyone else; nor shall they take anyone on as a partner.
            </div>
        </div>

        <div class="term-item">
            <span class="term-num">4.</span>
            <div class="term-text">
                The First Party shall not carry out any demolition, alteration, or addition during the tenancy period; if done, it shall be with the consent of the Second Party.
            </div>
        </div>

        <div class="term-item">
            <span class="term-num">5.</span>
            <div class="term-text">
                That the First Party has taken the said factory premises on rent based on market rates; therefore, no claim regarding a 'fair rate' shall be entertained.
            </div>
        </div>

        <div class="term-item">
            <span class="term-num">6.</span>
            <div class="term-text">
                The First Party shall not engage in any anti-social or anti-national activity during the tenancy period.
            </div>
        </div>

        <div class="term-item">
            <span class="term-num">7.</span>
            <div class="term-text">
                The Second Party may inspect the said house at any time, and the First Party shall have no objection to the same.
            </div>
        </div>

        <div class="spacer"></div>

        <div class="term-item">
            <span class="term-num">8.</span>
            <div class="term-text">
                The First Party shall not consume alcohol, eggs, meat, etc., on the said premises.
            </div>
        </div>
    </div>
</div>

<div class="page-break"></div>

<!-- PAGE 2 -->
<div class="page-2" style="position: relative; min-height: 800px; padding-top: 10mm;">
    <div class="terms-list" style="margin-top: 0; padding-left: 20px;">
        <div class="term-item">
            <span class="term-num">9.</span>
            <div class="term-text">
                The First Party resides in the said house; should any proceedings related to GST arise, the First Party shall be solely responsible for them. The Second Party shall bear no responsibility in this regard.
            </div>
        </div>

        <div class="spacer"></div>

        <div class="term-item">
            <span class="term-num">10.</span>
            <div class="term-text">
                The tenancy is fixed for a period of {{ $record->tenancy_months ?? 11 }} months; upon the expiry of this term, the First Party shall vacate the said portion of the property and hand it over to the Second Party. Should the First Party wish to continue the tenancy, they may do so with the Second Party's consent, subject to a 10% increase in rent based on the market value.
            </div>
        </div>

        <div class="term-item">
            <span class="term-num">11.</span>
            <div class="term-text">
                During the tenancy period, whenever the Second Party requires the premises, or wishes to have them vacated due to the First Party's misconduct, they shall provide the First Party with two months' notice to vacate, and the tenant (First Party) shall be bound to vacate the premises. Conversely, if the tenant (First Party) wishes to vacate the premises, they shall be bound to provide two months' prior written notice to the Second Party.
            </div>
        </div>

        <div class="term-item">
            <span class="term-num">12.</span>
            <div class="term-text">
                During the tenancy period, the First Party shall not harass or disturb the adjoining tenants or the landlord.
            </div>
        </div>

        <div class="term-item">
            <span class="term-num">13.</span>
            <div class="term-text">
                In the event that the First Party breaches even a single one of the aforementioned conditions, the Second Party shall have the right to terminate the First Party's tenancy, affix their own lock to the premises, and recover all outstanding rent, costs, damages, and taxes of any kind from the First Party.
            </div>
        </div>

        <div class="term-item">
            <span class="term-num">14.</span>
            <div class="term-text">
                A sub-meter is installed in the said premises; the electricity and water bills shall be the responsibility of the First Party and are payable in addition to the rent. At present, the meter is in proper working condition. Should the First Party tamper with the electricity meter, cause any irregularity, or be found involved in electricity theft, the First Party shall bear full responsibility; furthermore, if the electricity meter sustains damage or burns out, the cost thereof shall be borne by the First Party (i.e., the tenant).
            </div>
        </div>
    </div>

    <p class="closing-text">
        Therefore, this rent agreement has been drawn up, and having heard and understood it, the parties have accepted it as correct so that it may serve as evidence and be useful when needed.
    </p>

    <table class="sig-table">
        <tr>
            <td style="width: 25%;">Witness</td>
            <td style="width: 25%;">First Party</td>
            <td style="width: 25%;">Second Party</td>
            <td style="width: 25%;">Witness</td>
        </tr>
    </table>

    <div class="date-row">
        <b>Date :- &nbsp;{{ $record->agreement_date }}</b>.
    </div>
</div>

</body>
</html>
