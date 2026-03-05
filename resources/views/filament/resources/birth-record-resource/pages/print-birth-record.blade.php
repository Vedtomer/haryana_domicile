<!DOCTYPE html>
<html lang="hi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Birth Record Declaration</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;700&display=swap');

        body {
            font-family: 'Noto Sans Devanagari', sans-serif;
            margin: 0;
            padding: 0;
            background-color: #fff;
            color: #000;
            font-size: 16px; /* Adjusted to approximate the look */
        }
        .container {
            width: 210mm;
            min-height: 297mm;
            margin: 0 auto;
            padding: 15mm 20mm; /* Standard A4 margins */
            box-sizing: border-box;
            position: relative;
        }
        .header {
            text-align: center;
            font-weight: bold;
            font-size: 22px;
            margin-bottom: 5px;
        }
        .header-underline {
            border-bottom: 2px solid #000;
            width: 80%;
            margin: 0 auto 30px auto;
        }
        .content {
            text-align: justify;
            line-height: 1.8; /* Looser line height for form look */
        }
        
        /* The "fill in the blank" style */
        .fill-blank {
            border-bottom: 1px dotted #000;
            padding: 0 5px;
            display: inline-block;
            min-width: 50px;
            text-align: center;
            font-weight: bold;
            line-height: 1.2;
        }

        .paragraph {
            margin-bottom: 15px;
            text-indent: 0;
        }
        
        .list-section {
            counter-reset: item;
            list-style-type: none;
            padding: 0;
        }
        .list-section .list-item {
            display: flex;
            margin-bottom: 15px;
        }
        .list-section .list-item:before {
            content: counter(item) " ";
            counter-increment: item;
            font-weight: bold;
            width: 25px;
            flex-shrink: 0;
        }
        
        .table-section {
            width: 90%;
            border-collapse: collapse;
            margin: 10px auto;
        }
        .table-section th, .table-section td {
            border: 1px solid #000; /* No visible border in image for table usually, but let's keep it clean or make it minimal? Image shows headers with clear spacing. Let's keep specific borders or just headers. Image actually shows a proper table. */
            padding: 5px;
            text-align: center;
            font-size: 14px;
        }

        .footer {
            margin-top: 50px;
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
        }
        .signature-block {
            width: 40%;
        }
        .signature-line {
            margin-bottom: 12px;
            display: flex;
            justify-content: space-between;
        }
        .signature-label {
            flex-shrink: 0;
        }
        .signature-dots {
            flex-grow: 1;
            border-bottom: 1px dotted #000;
            margin-left: 5px;
            position: relative;
        }
        .signature-value {
            position: absolute;
            left: 5px;
            bottom: 2px;
            font-weight: bold;
        }

        .print-btn-container {
            text-align: center;
            margin-bottom: 20px;
            padding-top: 20px;
        }
        .print-btn {
            background-color: #333;
            color: white;
            padding: 10px 20px;
            border: none;
            cursor: pointer;
            font-size: 14px;
            border-radius: 4px;
        }

        @media print {
            body { margin: 0; padding: 0; -webkit-print-color-adjust: exact; }
            .container { width: 100%; margin: 0; padding: 15mm 20mm; border: none; }
            .print-btn-container { display: none; }
            @page {
                size: A4;
                margin: 0;
            }
        }
    </style>
</head>
<body>

    <div class="print-btn-container">
        <button onclick="window.print()" class="print-btn">Print Declaration</button>
    </div>

    <div class="container">
        <div class="header">
            जन्म रिकार्ड में नाम जुड़वाने हेतु स्वंय सत्यापित घोषणा पत्र
        </div>
        <div class="header-underline"></div>

        <div class="content">
            <div class="paragraph">
                हम श्री <span class="fill-blank" style="min-width: 150px;">{{ $record->father_name }}</span> (पिता का नाम) एवं श्रीमती <span class="fill-blank" style="min-width: 150px;">{{ $record->mother_name }}</span> (माता का नाम) निवासी <span class="fill-blank" style="min-width: 200px;">{{ $record->permanent_address }}</span> जिला <span class="fill-blank" style="min-width: 100px;">{{ $record->district }}</span> निम्न लिखित घोषणा करते हैं कि :-
            </div>

            <div class="list-section">
                <div class="list-item">
                    <div>
                        हमारा/हमारी लड़का/लड़की <span class="fill-blank" style="min-width: 120px;">{{ $record->child_name }}</span> (बच्चे का नाम) है। जो जिला रजिस्ट्रार/नगर निगम/नगर परिषद्/नगर पालिका/प्राथमिक/सामुदायिक स्वास्थ्य केन्द्र <span class="fill-blank" style="min-width: 150px;">{{ $record->issuing_authority }}</span> के रिकार्ड वर्ष <span class="fill-blank" style="min-width: 60px;">{{ $record->record_year }}</span> में रजिस्ट्रेशन संख्या <span class="fill-blank" style="min-width: 80px;">{{ $record->registration_no }}</span> रजि. दिनांक <span class="fill-blank" style="min-width: 100px;">{{ $record->date_of_registration?->format('d-m-Y') }}</span> पर दर्ज है। जिसमें माता और पिता के नाम क्रमशः <span class="fill-blank" style="min-width: 120px;">{{ $record->record_mother_name }}</span> और <span class="fill-blank" style="min-width: 120px;">{{ $record->record_father_name }}</span> दर्ज है। लेकिन बच्चे के नाम का कॉलम खाली है।
                    </div>
                </div>
                
                <div class="list-item">
                    <div>
                        हम अपने लड़के/लड़की का नाम जन्म रिकार्ड के खाली कॉलम में अब दर्ज करवाना चाहते है।
                    </div>
                </div>

                <div class="list-item">
                    <div>
                        हमने अपने लड़के/लड़की का मैट्रिक/मिडिल का प्रमाण पत्र संलग्न किया है। जिसमें उसका नाम <span class="fill-blank" style="min-width: 120px;">{{ $record->school_child_name }}</span> जन्म तिथि <span class="fill-blank" style="min-width: 100px;">{{ $record->school_dob?->format('d-m-Y') }}</span> माता/पिता का नाम क्रमशः <span class="fill-blank" style="min-width: 120px;">{{ $record->school_mother_name }}</span> और <span class="fill-blank" style="min-width: 120px;">{{ $record->school_father_name }}</span> है।
                    </div>
                </div>

                <div class="list-item">
                    <div>
                        हम अनुरोध करते हैं कि मेरे लड़के/लड़की का नाम रिकार्ड में <span class="fill-blank" style="min-width: 150px;">{{ $record->child_name }}</span> लिख दिया जाए।
                    </div>
                </div>

                <div class="list-item">
                    <div>
                        हम भविष्य में अपने लड़के/लड़की के नाम में कोई परिवर्तन नहीं करेंगे।
                    </div>
                </div>

                <div class="list-item">
                    <div style="width: 100%;">
                        हमारे निम्नलिखित और बच्चे हैं जिनके जन्म का विवरण निम्नप्रकार है–
                    
                        <table class="table-section">
                            <thead>
                                <tr>
                                    <th>क्र.सं.</th>
                                    <th>नाम</th>
                                    <th>जन्म तिथि</th>
                                    <th>जन्म स्थान</th>
                                    <th>दर्ज है या नहीं</th>
                                </tr>
                            </thead>
                            <tbody>
                                @if($record->other_children && count($record->other_children) > 0)
                                    @foreach($record->other_children as $index => $child)
                                        <tr>
                                            <td>{{ $index + 1 }}</td>
                                            <td>{{ $child['name'] ?? '' }}</td>
                                            <td>{{ $child['dob'] ?? '' }}</td>
                                            <td>{{ $child['birth_place'] ?? '' }}</td>
                                            <td>{{ $child['is_recorded'] ?? '' }}</td>
                                        </tr>
                                    @endforeach
                                @else
                                    <tr>
                                        <td>1.</td><td colspan="4"></td>
                                    </tr>
                                    <tr>
                                        <td>2.</td><td colspan="4"></td>
                                    </tr>
                                @endif
                            </tbody>
                        </table>
                    </div>
                </div>
                
                 <div class="list-item">
                     <div>
                         हमारे मेरे द्वारा दिया गया उपरोक्त घोषणा पत्र सही व दुरूस्त है इसमें कोई भी तथ्य छिपाया नहीं गया है। अगर भविष्य में मेरे द्वारा दिए गए कागजात अथवा दी गई जानकारी गलत पाई जाती है, तो उसकी पूर्ण जिम्मेदारी मेरी होगी तथा IPC की धारा 415, 420, 120 बी और 182 के अंतर्गत कार्यवाही/दण्ड का भागीदार रहूंगा/रहूंगी।
                     </div>
                 </div>
            </div>

            <div class="footer">
                <div class="signature-block">
                    <div class="signature-line">
                        <span class="signature-label">माता के हस्ताक्षर</span>
                        <div class="signature-dots"></div>
                    </div>
                    <div class="signature-line">
                        <span class="signature-label">माता का नाम</span>
                        <div class="signature-dots"><span class="signature-value">{{ $record->mother_name }}</span></div>
                    </div>
                    <div class="signature-line">
                        <span class="signature-label">पहचान पत्र सं0</span>
                        <div class="signature-dots"></div>
                    </div>
                    <div class="signature-line">
                        <span class="signature-label">ID जारी करने वाली संस्था</span>
                        <div class="signature-dots"></div>
                    </div>
                </div>

                <div class="signature-block">
                    <div class="signature-line">
                        <span class="signature-label">पिता के हस्ताक्षर</span>
                        <div class="signature-dots"></div>
                    </div>
                    <div class="signature-line">
                        <span class="signature-label">पिता का नाम</span>
                        <div class="signature-dots"><span class="signature-value">{{ $record->father_name }}</span></div>
                    </div>
                    <div class="signature-line">
                        <span class="signature-label">पहचान पत्र सं0</span>
                        <div class="signature-dots"></div>
                    </div>
                    <div class="signature-line">
                        <span class="signature-label">ID जारी करने वाली संस्था</span>
                        <div class="signature-dots"></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
