<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: 'DejaVu Sans', sans-serif;
        }
        
        .a4-page {
            width: 210mm;
            min-height: 297mm;
            padding: 15mm 20mm;
            position: relative;
            box-sizing: border-box;
            background: white;
            color: black;
            page-break-after: always;
        }
        
        .a4-page:last-child {
            page-break-after: auto;
        }
        
        .header { display: flex; justify-content: space-between; font-weight: bold; }
        .photo-box { border: 1px solid #000; width: 100px; height: 125px; position: absolute; right: 20mm; top: 45px; text-align: center; font-size: 12px; padding-top: 35px; }
        .subject { text-align: center; font-weight: bold; font-size: 16px; margin: 25px 0; text-decoration: underline; }
        .content { line-height: 2.3; text-align: justify; font-size: 15px; }
        .fill-text { border-bottom: 1px dotted #000; font-weight: bold; color: #000; padding: 0 4px; font-size: 1.1em; } 
        
        .box-row { display: inline-flex; border: 1px solid #000; margin-left: 5px; vertical-align: middle; }
        .box-cell { border-right: 1px solid #000; width: 22px; height: 25px; text-align: center; line-height: 25px; font-weight: bold; }
        .box-cell:last-child { border-right: none; }

        .footer { margin-top: 30px; display: flex; justify-content: space-between; align-items: flex-end; }
        .doc-border { border: 1px solid #000; padding: 8px; margin-top: 15px; font-size: 12px; line-height: 1.5; }
    </style>
</head>
<body>
    <!-- Page 1 -->
    <div class="a4-page">
        <div class="header"><span>सेवा में,</span><span>पृष्ठ 1 / 4</span></div>
        <p><strong>श्रीमान् तहसीलदार महोदय / नायब तहसीलदार महोदय,</strong><br>
        तहसील <span class="fill-text">{{ $record->tehsil }}</span> जिला <span class="fill-text">{{ $record->district }}</span></p>
    
        <div class="photo-box">फोटो गोंद से<br>चिपकाएं</div>
        <div class="subject">विषय: हरियाणा निवास / आवासीय प्रमाण-पत्र बनवाने हेतू।</div>
    
        <p>मोबाईल नं. <span id="mob-row" class="box-row" data-val="{{ $record->mobile }}"></span></p>
        <p>आधार नं. <span id="adh-row" class="box-row" data-val="{{ $record->aadhar }}"></span></p>
    
        <div class="content">
            <strong>श्रीमान् जी,</strong><br>
            निवेदन यह है कि:<br>
            1. मैं <span class="fill-text">{{ $record->name }}</span> सुपुत्र/सुपुत्री/धर्मपत्नी श्री <span class="fill-text">{{ $record->father_name }}</span> गाँव/शहर <span class="fill-text">{{ $record->village }}</span> वार्ड नं. <span class="fill-text">{{ $record->ward_no ?? '....' }}</span> उम्र <span class="fill-text">{{ $record->age }}</span> वर्ष तहसील <span class="fill-text">{{ $record->tehsil }}</span> जिला <span class="fill-text">{{ $record->district }}</span> (हरियाणा) का/की जन्म / 15 वर्षों से ज्यादा से स्थायी निवासी हूँ।<br>
            2. मैं भारत का/की नागरिक हूँ।<br>
            3. मैंने भारत में किसी भी अन्य जगह से निवास प्रमाण-पत्र नहीं बनवाया है।<br>
            4. मुझे स्वयं या सुपुत्र/सुपुत्री <span class="fill-text">{{ $record->child_name ?? '................' }}</span> के लिए इस प्रमाण-पत्र की आवश्यकता है।<br>
            5. मेरा सुपुत्र/मेरी सुपुत्री अविवाहित है तथा मेरे साथ जन्म से रहता/रहती है।<br>
            6. अतः हरियाणा निवास/आवासीय प्रमाण-पत्र प्रदान करने की कृपा करें।
        </div>
    
        <div class="footer">
            <div>दिनांक: {{ date('d/m/Y') }}</div>
            <div style="text-align:center"><strong>हस्ताक्षर प्रार्थी</strong><br><br>नाम: <span class="fill-text">{{ $record->name }}</span></div>
        </div>
    
        <div class="doc-border">
            <strong>संलग्न दस्तावेज:</strong> 1. राशन कार्ड 2. जन्मतिथि प्रमाण 3. वोटर/आधार कार्ड/पासपोर्ट।
        </div>
    </div>
    
    <!-- Page 2 -->
    <div class="a4-page">
        <div class="header"><span></span><span>पृष्ठ 2 / 4</span></div>
        <div class="subject">स्वयं घोषणा (Self Declaration)</div>
        <div class="content">
            मैं <span class="fill-text">{{ $record->name }}</span> सुपुत्र श्री <span class="fill-text">{{ $record->father_name }}</span> उम्र <span class="fill-text">{{ $record->age }}</span> वर्ष, जाति <span class="fill-text">{{ $record->caste }}</span> निवासी <span class="fill-text">{{ $record->village }}</span> वार्ड नं. <span class="fill-text">{{ $record->ward_no ?? '....' }}</span> तहसील <span class="fill-text">{{ $record->tehsil }}</span> जिला <span class="fill-text">{{ $record->district }}</span> शपथपूर्वक घोषणा करता हूँ कि मेरे द्वारा दी गई जानकारी सही है।
        </div>
        <div class="footer"><div></div><div style="text-align:center"><strong>हस्ताक्षर घोषणाकर्ता</strong></div></div>
    </div>
    
    <!-- Page 3 -->
    <div class="a4-page">
        <div class="header"><span></span><span>पृष्ठ 3 / 4</span></div>
        <div class="doc-border" style="padding:20px; font-size:14px;">
            <center><strong>पटवारी हल्का / सरपंच / पार्षद रिपोर्ट</strong></center><br>
            प्रमाणित किया जाता है कि प्रार्थी <span class="fill-text">{{ $record->name }}</span> सुपुत्र श्री <span class="fill-text">{{ $record->father_name }}</span> निवासी <span class="fill-text">{{ $record->village }}</span> तहसील <span class="fill-text">{{ $record->tehsil }}</span> को मैं व्यक्तिगत रूप से जानता हूँ। ये यहाँ के स्थायी निवासी हैं।
        </div>
    </div>
    
    <!-- Page 4 -->
    <div class="a4-page">
        <div class="header"><span></span><span>पृष्ठ 4 / 4</span></div>
        <div class="content">
            प्रार्थी <span class="fill-text">{{ $record->name }}</span> के आवेदन की जाँच की गई। सरकार की हिदायतानुसार प्रमाण-पत्र जारी किया जाना उचित है।
            <br><br><br><br>
            <strong>तहसीलदार / नायब तहसीलदार</strong><br>(मोहर सहित)
        </div>
    </div>

    <script>
        function setupGrids() {
            populateGrid('mob-row', 10);
            populateGrid('adh-row', 12);
        }
    
        function populateGrid(id, len) {
            const row = document.getElementById(id);
            if (!row) return;
            const val = row.getAttribute('data-val') || '';
            const chars = val.split('');
            
            row.innerHTML = '';
            for(let i=0; i<len; i++) {
                const cell = document.createElement('div');
                cell.className = 'box-cell';
                cell.innerText = chars[i] || '';
                row.appendChild(cell);
            }
        }
        
        setupGrids();
    </script>
</body>
</html>
