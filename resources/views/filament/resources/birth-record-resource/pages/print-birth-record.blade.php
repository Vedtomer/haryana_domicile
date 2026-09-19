<!DOCTYPE html>
<html lang="hi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Birth Record Declaration - {{ $record->child_name }}</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;500;600;700;800&display=swap');

        :root {
            --primary-header-color: #1e3a8a;
            --underline-color: #1e3a8a;
            --ink-fill-color: #003399;
            --ink-fill-border: #93c5fd;
            --table-header-bg: #1e40af;
            --table-header-text: #ffffff;
            --table-border-color: #64748b;
            --border-style-color: #1e3a8a;
            --text-main-color: #0f172a;
        }

        /* Black & White Theme */
        body.theme-bw {
            --primary-header-color: #000000;
            --underline-color: #000000;
            --ink-fill-color: #000000;
            --ink-fill-border: #000000;
            --table-header-bg: #f1f5f9;
            --table-header-text: #000000;
            --table-border-color: #000000;
            --border-style-color: #000000;
            --text-main-color: #000000;
        }

        /* Blue Ink / Color Theme */
        body.theme-blue {
            --primary-header-color: #1e3a8a;
            --underline-color: #2563eb;
            --ink-fill-color: #003399;
            --ink-fill-border: #93c5fd;
            --table-header-bg: #1e40af;
            --table-header-text: #ffffff;
            --table-border-color: #94a3b8;
            --border-style-color: #1e3a8a;
            --text-main-color: #0f172a;
        }

        /* Government Green Theme */
        body.theme-green {
            --primary-header-color: #14532d;
            --underline-color: #16a34a;
            --ink-fill-color: #003399;
            --ink-fill-border: #86efac;
            --table-header-bg: #166534;
            --table-header-text: #ffffff;
            --table-border-color: #86efac;
            --border-style-color: #14532d;
            --text-main-color: #0f172a;
        }

        * {
            box-sizing: border-box;
        }

        body {
            font-family: 'Noto Sans Devanagari', sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f1f5f9;
            color: var(--text-main-color);
            font-size: 15.5px;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
        }

        /* Top Action Toolbar */
        .control-panel {
            background: #ffffff;
            border-bottom: 1px solid #e2e8f0;
            padding: 12px 20px;
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            position: sticky;
            top: 0;
            z-index: 100;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }

        .panel-group {
            display: flex;
            align-items: center;
            gap: 8px;
            flex-wrap: wrap;
        }

        .btn {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 8px 16px;
            font-size: 13.5px;
            font-weight: 600;
            border-radius: 8px;
            cursor: pointer;
            border: 1px solid transparent;
            text-decoration: none;
            transition: all 0.15s ease;
        }

        .btn-print {
            background: linear-gradient(135deg, #16a34a, #15803d);
            color: #ffffff;
            box-shadow: 0 2px 6px rgba(22, 163, 74, 0.3);
        }
        .btn-print:hover {
            background: linear-gradient(135deg, #15803d, #166534);
        }

        .btn-crs {
            background: #eff6ff;
            color: #1d4ed8;
            border-color: #bfdbfe;
        }
        .btn-crs:hover {
            background: #dbeafe;
            color: #1e40af;
        }

        .btn-back {
            background: #f8fafc;
            color: #475569;
            border-color: #cbd5e1;
        }
        .btn-back:hover {
            background: #e2e8f0;
            color: #1e293b;
        }

        .color-selector {
            display: inline-flex;
            background: #f1f5f9;
            padding: 3px;
            border-radius: 8px;
            gap: 2px;
            border: 1px solid #cbd5e1;
        }

        .color-option {
            padding: 6px 12px;
            font-size: 12.5px;
            font-weight: 600;
            border-radius: 6px;
            cursor: pointer;
            border: none;
            background: transparent;
            color: #475569;
            display: inline-flex;
            align-items: center;
            gap: 5px;
            transition: all 0.15s ease;
        }

        .color-option.active {
            background: #ffffff;
            color: #0f172a;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .border-toggle {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            font-size: 13px;
            color: #334155;
            font-weight: 500;
            cursor: pointer;
            user-select: none;
            padding: 6px 10px;
            border-radius: 6px;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
        }

        /* Printable A4 Container */
        .container-wrapper {
            padding: 20px 0 40px 0;
            display: flex;
            justify-content: center;
        }

        .container {
            width: 210mm;
            min-height: 297mm;
            background-color: #ffffff;
            margin: 0 auto;
            padding: 16mm 20mm;
            box-sizing: border-box;
            position: relative;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
            border: 1px solid #e2e8f0;
            transition: border 0.2s ease;
        }

        body.show-border .container {
            border: 3px double var(--border-style-color);
        }

        .header {
            text-align: center;
            font-weight: 800;
            font-size: 21.5px;
            margin-bottom: 8px;
            color: var(--primary-header-color);
            letter-spacing: -0.3px;
        }

        .header-underline {
            border-bottom: 2.5px solid var(--underline-color);
            width: 82%;
            margin: 0 auto 26px auto;
        }

        .content {
            text-align: justify;
            line-height: 1.85;
            color: var(--text-main-color);
        }

        /* Highlighted Ink / Fill Data */
        .fill-blank {
            border-bottom: 1.5px dotted var(--ink-fill-border);
            padding: 0 6px;
            display: inline-block;
            min-width: 50px;
            text-align: center;
            font-weight: 700;
            line-height: 1.25;
            color: var(--ink-fill-color);
            font-size: 1.02em;
        }

        .paragraph {
            margin-bottom: 14px;
            text-indent: 0;
        }

        .list-section {
            counter-reset: item;
            list-style-type: none;
            padding: 0;
            margin: 0;
        }

        .list-section .list-item {
            display: flex;
            margin-bottom: 13px;
        }

        .list-section .list-item:before {
            content: counter(item) " ";
            counter-increment: item;
            font-weight: 700;
            width: 26px;
            flex-shrink: 0;
            color: var(--primary-header-color);
        }

        .table-section {
            width: 96%;
            border-collapse: collapse;
            margin: 10px auto 6px auto;
        }

        .table-section th {
            background-color: var(--table-header-bg);
            color: var(--table-header-text);
            border: 1px solid var(--table-border-color);
            padding: 6px 8px;
            text-align: center;
            font-size: 13.5px;
            font-weight: 700;
        }

        .table-section td {
            border: 1px solid var(--table-border-color);
            padding: 5px 8px;
            text-align: center;
            font-size: 13.5px;
            color: var(--text-main-color);
        }

        .table-section td .table-val {
            color: var(--ink-fill-color);
            font-weight: 600;
        }

        .footer {
            margin-top: 40px;
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
        }

        .signature-block {
            width: 42%;
        }

        .signature-line {
            margin-bottom: 12px;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
        }

        .signature-label {
            flex-shrink: 0;
            font-weight: 600;
            font-size: 14px;
            color: var(--text-main-color);
        }

        .signature-dots {
            flex-grow: 1;
            border-bottom: 1px dotted var(--ink-fill-border);
            margin-left: 6px;
            position: relative;
            min-height: 18px;
        }

        .signature-value {
            position: absolute;
            left: 5px;
            bottom: 2px;
            font-weight: 700;
            color: var(--ink-fill-color);
            font-size: 14px;
        }

        .crs-footer-note {
            margin-top: 30px;
            padding-top: 8px;
            border-top: 1px dashed #cbd5e1;
            display: flex;
            justify-content: space-between;
            font-size: 11px;
            color: #64748b;
        }

        @media print {
            body {
                background: #ffffff !important;
                margin: 0 !important;
                padding: 0 !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
            }
            .control-panel {
                display: none !important;
            }
            .container-wrapper {
                padding: 0 !important;
                margin: 0 !important;
            }
            .container {
                width: 100% !important;
                min-height: 100% !important;
                margin: 0 !important;
                padding: 15mm 20mm !important;
                box-shadow: none !important;
                border: none !important;
            }
            body.show-border .container {
                border: 2.5px double var(--border-style-color) !important;
            }
            .crs-footer-note {
                display: flex !important;
            }
            @page {
                size: A4 portrait;
                margin: 0;
            }
        }
    </style>
</head>
<body class="theme-blue show-border">

    <!-- Top Action Toolbar -->
    <div class="control-panel">
        <div class="panel-group">
            <a href="/admin/birth-records" class="btn btn-back">
                &larr; Back
            </a>

            <!-- Color Options -->
            <div class="color-selector">
                <button type="button" class="color-option active" id="btn-blue" onclick="setTheme('theme-blue')">
                    <span style="display:inline-block;width:12px;height:12px;border-radius:50%;background:#1d4ed8;"></span>
                    Color (रंगीन / Blue Ink)
                </button>
                <button type="button" class="color-option" id="btn-green" onclick="setTheme('theme-green')">
                    <span style="display:inline-block;width:12px;height:12px;border-radius:50%;background:#16a34a;"></span>
                    Green (सरकारी प्रारूप)
                </button>
                <button type="button" class="color-option" id="btn-bw" onclick="setTheme('theme-bw')">
                    <span style="display:inline-block;width:12px;height:12px;border-radius:50%;background:#000000;"></span>
                    B&W (सादा)
                </button>
            </div>

            <!-- Double Border Toggle -->
            <label class="border-toggle">
                <input type="checkbox" id="border-check" checked onchange="toggleBorder(this.checked)">
                Border (बॉर्डर)
            </label>
        </div>

        <div class="panel-group">
            <!-- Print Button -->
            <button onclick="window.print()" class="btn btn-print">
                🖨️ Print / Save PDF
            </button>
        </div>
    </div>

    <!-- Printable Area -->
    <div class="container-wrapper">
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
                            <span class="signature-label">ID जारी संस्था</span>
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
                            <span class="signature-label">ID जारी संस्था</span>
                            <div class="signature-dots"></div>
                        </div>
                    </div>
                </div>

                <div class="crs-footer-note">
                    <span>* जन्म प्रमाण पत्र नाम जुड़वाने का स्वयं सत्यापित घोषणा पत्र</span>
                    <span>प्रारूप: जन्म एवं मृत्यु रजिस्ट्रीकरण</span>
                </div>
            </div>
        </div>
    </div>

    <script>
        function setTheme(theme) {
            document.body.classList.remove('theme-blue', 'theme-green', 'theme-bw');
            document.body.classList.add(theme);

            document.querySelectorAll('.color-option').forEach(btn => btn.classList.remove('active'));
            if (theme === 'theme-blue') document.getElementById('btn-blue').classList.add('active');
            if (theme === 'theme-green') document.getElementById('btn-green').classList.add('active');
            if (theme === 'theme-bw') document.getElementById('btn-bw').classList.add('active');

            try {
                localStorage.setItem('birth_cert_color_theme', theme);
            } catch(e) {}
        }

        function toggleBorder(show) {
            if (show) {
                document.body.classList.add('show-border');
            } else {
                document.body.classList.remove('show-border');
            }
            try {
                localStorage.setItem('birth_cert_show_border', show ? '1' : '0');
            } catch(e) {}
        }

        // Initialize from URL query or localStorage
        (function() {
            const urlParams = new URLSearchParams(window.location.search);
            const colorParam = urlParams.get('color') || urlParams.get('theme');

            let savedTheme = 'theme-blue';
            if (colorParam === 'bw' || colorParam === 'black') {
                savedTheme = 'theme-bw';
            } else if (colorParam === 'green') {
                savedTheme = 'theme-green';
            } else if (colorParam === 'blue' || colorParam === 'color' || colorParam === '1') {
                savedTheme = 'theme-blue';
            } else {
                try {
                    const local = localStorage.getItem('birth_cert_color_theme');
                    if (local) savedTheme = local;
                } catch(e) {}
            }
            setTheme(savedTheme);

            try {
                const borderPref = localStorage.getItem('birth_cert_show_border');
                if (borderPref !== null) {
                    const shouldShow = borderPref === '1';
                    document.getElementById('border-check').checked = shouldShow;
                    toggleBorder(shouldShow);
                }
            } catch(e) {}

            if (urlParams.get('auto') === '1' || urlParams.get('print') === '1') {
                setTimeout(function() { window.print(); }, 400);
            }
        })();
    </script>
</body>
</html>
