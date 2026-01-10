<!DOCTYPE html>
<html>
<head>
    <title>PDF Coordinate Settings</title>
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        h1 { color: #333; margin-bottom: 30px; }
        .field-group { display: grid; grid-template-columns: 200px 100px 100px 100px 150px; gap: 15px; margin-bottom: 15px; align-items: center; padding: 15px; background: #f9f9f9; border-radius: 4px; }
        .field-group label { font-weight: bold; color: #555; }
        .field-group input { padding: 8px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px; }
        .field-group input:focus { outline: none; border-color: #4CAF50; }
        .header { display: grid; grid-template-columns: 200px 100px 100px 100px 150px; gap: 15px; margin-bottom: 10px; font-weight: bold; color: #666; }
        .btn { background: #4CAF50; color: white; padding: 12px 30px; border: none; border-radius: 4px; cursor: pointer; font-size: 16px; margin-top: 20px; }
        .btn:hover { background: #45a049; }
        .btn-test { background: #2196F3; margin-left: 10px; }
        .btn-test:hover { background: #0b7dda; }
        .success { color: #4CAF50; margin-top: 15px; font-weight: bold; }
        .error { color: #f44336; margin-top: 15px; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <h1>📐 PDF Coordinate Settings</h1>
        <p style="color: #666; margin-bottom: 30px;">Adjust X/Y coordinates for each field. Image size: 1414x2000 pixels</p>
        
        <form id="coordForm" method="POST" action="/api/save-coordinates">
            <div class="header">
                <div>Field Name</div>
                <div>X Position</div>
                <div>Y Position</div>
                <div>Font Size</div>
                <div></div>
            </div>
            
            <div class="field-group">
                <label>Tehsil (Top)</label>
                <input type="number" name="tehsil_top_x" value="{{ $coords['tehsil_top']['x'] ?? 320 }}" required>
                <input type="number" name="tehsil_top_y" value="{{ $coords['tehsil_top']['y'] ?? 145 }}" required>
                <input type="number" name="tehsil_top_fontSize" value="{{ $coords['tehsil_top']['fontSize'] ?? 20 }}" required>
                <span style="color: #999;">Header section</span>
            </div>
            
            <div class="field-group">
                <label>District (Top)</label>
                <input type="number" name="district_top_x" value="{{ $coords['district_top']['x'] ?? 550 }}" required>
                <input type="number" name="district_top_y" value="{{ $coords['district_top']['y'] ?? 145 }}" required>
                <input type="number" name="district_top_fontSize" value="{{ $coords['district_top']['fontSize'] ?? 20 }}" required>
                <span style="color: #999;">Header section</span>
            </div>
            
            <div class="field-group">
                <label>Mobile Number Start</label>
                <input type="number" name="mobile_start_x" value="{{ $coords['mobile_start']['x'] ?? 190 }}" required>
                <input type="number" name="mobile_start_y" value="{{ $coords['mobile_start']['y'] ?? 218 }}" required>
                <input type="number" name="mobile_start_fontSize" value="{{ $coords['mobile_start']['fontSize'] ?? 18 }}" required>
                <span style="color: #999;">First box position</span>
            </div>
            
            <div class="field-group">
                <label>Aadhar Number Start</label>
                <input type="number" name="aadhar_start_x" value="{{ $coords['aadhar_start']['x'] ?? 190 }}" required>
                <input type="number" name="aadhar_start_y" value="{{ $coords['aadhar_start']['y'] ?? 258 }}" required>
                <input type="number" name="aadhar_start_fontSize" value="{{ $coords['aadhar_start']['fontSize'] ?? 18 }}" required>
                <span style="color: #999;">First box position</span>
            </div>
            
            <div class="field-group">
                <label>Name</label>
                <input type="number" name="name_x" value="{{ $coords['name']['x'] ?? 80 }}" required>
                <input type="number" name="name_y" value="{{ $coords['name']['y'] ?? 365 }}" required>
                <input type="number" name="name_fontSize" value="{{ $coords['name']['fontSize'] ?? 20 }}" required>
                <span style="color: #999;">After "मैं"</span>
            </div>
            
            <div class="field-group">
                <label>Father Name</label>
                <input type="number" name="father_name_x" value="{{ $coords['father_name']['x'] ?? 600 }}" required>
                <input type="number" name="father_name_y" value="{{ $coords['father_name']['y'] ?? 365 }}" required>
                <input type="number" name="father_name_fontSize" value="{{ $coords['father_name']['fontSize'] ?? 20 }}" required>
                <span style="color: #999;">Same line</span>
            </div>
            
            <div class="field-group">
                <label>Village</label>
                <input type="number" name="village_x" value="{{ $coords['village']['x'] ?? 120 }}" required>
                <input type="number" name="village_y" value="{{ $coords['village']['y'] ?? 400 }}" required>
                <input type="number" name="village_fontSize" value="{{ $coords['village']['fontSize'] ?? 20 }}" required>
                <span style="color: #999;">After "गाँव/शहर"</span>
            </div>
            
            <div class="field-group">
                <label>Ward Number</label>
                <input type="number" name="ward_no_x" value="{{ $coords['ward_no']['x'] ?? 520 }}" required>
                <input type="number" name="ward_no_y" value="{{ $coords['ward_no']['y'] ?? 400 }}" required>
                <input type="number" name="ward_no_fontSize" value="{{ $coords['ward_no']['fontSize'] ?? 20 }}" required>
                <span style="color: #999;">After "वार्ड नं."</span>
            </div>
            
            <div class="field-group">
                <label>Age</label>
                <input type="number" name="age_x" value="{{ $coords['age']['x'] ?? 680 }}" required>
                <input type="number" name="age_y" value="{{ $coords['age']['y'] ?? 400 }}" required>
                <input type="number" name="age_fontSize" value="{{ $coords['age']['fontSize'] ?? 20 }}" required>
                <span style="color: #999;">After "उम्र"</span>
            </div>
            
            <div class="field-group">
                <label>Tehsil</label>
                <input type="number" name="tehsil_x" value="{{ $coords['tehsil']['x'] ?? 280 }}" required>
                <input type="number" name="tehsil_y" value="{{ $coords['tehsil']['y'] ?? 435 }}" required>
                <input type="number" name="tehsil_fontSize" value="{{ $coords['tehsil']['fontSize'] ?? 20 }}" required>
                <span style="color: #999;">After "तहसील"</span>
            </div>
            
            <div class="field-group">
                <label>District</label>
                <input type="number" name="district_x" value="{{ $coords['district']['x'] ?? 550 }}" required>
                <input type="number" name="district_y" value="{{ $coords['district']['y'] ?? 435 }}" required>
                <input type="number" name="district_fontSize" value="{{ $coords['district']['fontSize'] ?? 20 }}" required>
                <span style="color: #999;">After "जिला"</span>
            </div>
            
            <div class="field-group">
                <label>Child Name</label>
                <input type="number" name="child_name_x" value="{{ $coords['child_name']['x'] ?? 420 }}" required>
                <input type="number" name="child_name_y" value="{{ $coords['child_name']['y'] ?? 545 }}" required>
                <input type="number" name="child_name_fontSize" value="{{ $coords['child_name']['fontSize'] ?? 20 }}" required>
                <span style="color: #999;">Line 4</span>
            </div>
            
            <div class="field-group">
                <label>Date</label>
                <input type="number" name="date_x" value="{{ $coords['date']['x'] ?? 130 }}" required>
                <input type="number" name="date_y" value="{{ $coords['date']['y'] ?? 1750 }}" required>
                <input type="number" name="date_fontSize" value="{{ $coords['date']['fontSize'] ?? 20 }}" required>
                <span style="color: #999;">Bottom section</span>
            </div>
            
            <div class="field-group">
                <label>Signature</label>
                <input type="number" name="signature_x" value="{{ $coords['signature']['x'] ?? 950 }}" required>
                <input type="number" name="signature_y" value="{{ $coords['signature']['y'] ?? 1780 }}" required>
                <input type="number" name="signature_fontSize" value="{{ $coords['signature']['fontSize'] ?? 20 }}" required>
                <span style="color: #999;">Bottom right</span>
            </div>
            
            <div>
                <button type="submit" class="btn">💾 Save Coordinates</button>
                <button type="button" class="btn btn-test" onclick="testPDF()">🔍 Test PDF</button>
            </div>
            
            <div id="message"></div>
        </form>
    </div>
    
    <script>
        document.getElementById('coordForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            const formData = new FormData(this);
            const data = Object.fromEntries(formData);
            
            try {
                const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
                const response = await fetch('/api/save-coordinates', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': csrfToken
                    },
                    body: JSON.stringify(data)
                });
                
                if (response.ok) {
                    document.getElementById('message').innerHTML = '<p class="success">✓ Coordinates saved successfully!</p>';
                } else {
                    const errorText = await response.text();
                    document.getElementById('message').innerHTML = '<p class="error">✗ Error saving coordinates: ' + errorText + '</p>';
                }
            } catch (error) {
                document.getElementById('message').innerHTML = '<p class="error">✗ Error: ' + error.message + '</p>';
            }
        });
        
        function testPDF() {
            window.open('/admin/haryana-domiciles/2/print', '_blank');
        }
    </script>
</body>
</html>
