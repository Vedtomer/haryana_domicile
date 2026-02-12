<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PAN Card</title>
    <style>
        @page {
            margin: 0;
            padding: 0;
            size: A4;
        }
        body {
            margin: 0;
            padding: 0;
            font-family: Arial, sans-serif;
            font-size: 10pt;
            width: 210mm;
            height: 297mm;
        }
        .container {
            width: 100%;
            height: 100%;
            position: relative;
        }
        /* Front Side */
        .card-front {
            position: absolute;
            top: 20mm;
            left: 20mm;
            width: 86mm; /* Standard ID card width */
            height: 54mm; /* Standard ID card height */
            background-image: url("{{ public_path('ad_front.jpg') }}");
            background-size: 100% 100%;
            background-repeat: no-repeat;
            border-radius: 4px;
        }
        /* Back Side */
        .card-back {
            position: absolute;
            top: 80mm;
            left: 20mm;
            width: 86mm;
            height: 54mm;
            background-image: url("{{ public_path('pan_back.png') }}");
            background-size: 100% 100%;
            background-repeat: no-repeat;
            border-radius: 4px;
        }

        .text-overlay {
            position: absolute;
            font-weight: bold;
            font-size: 10px; /* Adjust based on reference */
            color: #000;
            text-transform: uppercase;
        }

        /* Front Fields Positioning - ESTIMATED, needs tuning */
        /* Name */
        .name {
            top: 36%;
            left: 8%;
            font-size: 8px;
        }
        /* Father's Name */
        .father-name {
            top: 48%;
            left: 8%;
            font-size: 8px;
        }
        /* DOB */
        .dob {
            top: 60%;
            left: 8%;
            font-size: 8px;
        }
        /* PAN Number */
        .pan-number {
            top: 70%;
            left: 30%; /* Centeredish? check ref */
            font-size: 10px;
            font-weight: 800;
        }
        
        /* Photo */
        .photo-box {
            position: absolute;
            top: 28%;
            right: 8%;
            width: 20mm;
            height: 24mm;
            background-color: #ddd; /* placeholder color if image missing */
        }
        .photo-box img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        /* Signature */
        .signature-box {
            position: absolute;
            top: 65%; /* Adjusted */
            right: 35%; /* Mid-right? */
            width: 30mm;
            height: 8mm;
            background: transparent;
        }
        .signature-box img {
            width: 100%;
            height: 100%;
            object-fit: contain;
        }
        
        /* QR Code Placeholder if needed? */
        .qr-code {
            position: absolute;
            top: 28%;
            left: 65%;
            width: 16mm;
            height: 16mm;
        }

    </style>
</head>
<body>
    <div class="container">
        <!-- Front Side -->
        <div class="card-front">
            <!-- Fields -->
            
            <!-- Adjust percentages based on visual inspection of AD FRANT.jpg -->
            <!-- Sample values, will likely need tweaking after first render -->

            <!-- Name: Usually below the header on the left -->
            <div class="text-overlay name" style="top: 19mm; left: 6mm;">
                {{ $data['name'] ?? 'ASAD KHAN' }}
            </div>

            <!-- Father's Name: Below Name -->
            <div class="text-overlay father-name" style="top: 26mm; left: 6mm;">
                {{ $data['father_name'] ?? 'LIYAKAT ALI' }}
            </div>

            <!-- DOB: Below Father's Name -->
            <div class="text-overlay dob" style="top: 33mm; left: 6mm;">
                {{ isset($data['dob']) ? \Carbon\Carbon::parse($data['dob'])->format('d/m/Y') : '01/01/1980' }}
            </div>

            <!-- PAN Number: Prominent in middle/bottom -->
            <div class="text-overlay pan-number" style="top: 38mm; left: 8mm; /* Adjust for centering */ font-size: 12px; font-family: sans-serif;">
                {{ $data['pan_number'] ?? 'ABCDE1234F' }}
            </div>

            <!-- Photo: Right side -->
            <div class="photo-box" style="top: 15mm; right: 5mm; height: 18mm; width: 15mm;">
                @if(isset($data['photo']))
                    <img src="{{ public_path('storage/' . $data['photo']) }}" alt="Photo">
                @endif
            </div>

            <!-- Signature: Usually horizontally centered or below photo overlaid on white strip -->
            <div class="signature-box" style="top: 37mm; right: 28mm; width: 20mm; height: 6mm;">
                 @if(isset($data['signature']))
                    <img src="{{ public_path('storage/' . $data['signature']) }}" alt="Signature">
                @endif
            </div>
            
            <!-- QR Place holder - The background might have it or we generate one. 
                 Assuming background has it or not required for now unless requested. -->
        </div>

        <!-- Back Side -->
        <div class="card-back">
            <!-- Back usually has address, etc. if required, but user only asked for front/back images. 
                 The form doesn't have address. So maybe just the blank back is enough? 
                 The prompt says "iska ak back side ka page jiska path ye hai ... ye wo fill path hai iske jaisa bnana hai"
                 Wait, "pan ref.png" shows the FILLED details? 
                 If so, I should try to mimic "pan ref.png". 
            -->
        </div>
    </div>
</body>
</html>
