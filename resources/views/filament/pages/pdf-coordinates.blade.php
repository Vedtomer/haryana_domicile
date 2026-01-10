<x-filament-panels::page>
    <style>
        .coordinate-picker { display: grid; grid-template-columns: 1fr 400px; gap: 30px; margin-bottom: 30px; }
        .image-container { position: relative; border: 2px solid #ddd; border-radius: 8px; overflow: hidden; background: #f9f9f9; }
        .image-container img { width: 100%; height: auto; display: block; cursor: crosshair; }
        .overlay-canvas { position: absolute; top: 0; left: 0; pointer-events: none; }
        .controls { background: white; padding: 20px; border-radius: 8px; border: 1px solid #ddd; }
        .field-selector { margin-bottom: 20px; }
        .field-selector select { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px; }
        .coord-display { background: #f0f0f0; padding: 15px; border-radius: 4px; margin-bottom: 15px; }
        .coord-display div { margin: 5px 0; font-family: monospace; }
        .sample-data { background: #e3f2fd; padding: 10px; border-radius: 4px; margin-top: 10px; font-size: 12px; }
        .field-group { display: grid; grid-template-columns: 200px 100px 100px 100px; gap: 10px; margin-bottom: 10px; align-items: center; padding: 10px; background: #f9f9f9; border-radius: 4px; font-size: 13px; }
        .field-group.with-spacing { grid-template-columns: 200px 100px 100px 100px 100px; }
        .field-group label { font-weight: bold; color: #555; }
        .field-group input { padding: 6px; border: 1px solid #ddd; border-radius: 4px; font-size: 13px; }
        .btn { background: #4CAF50; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; font-size: 14px; margin: 5px; }
        .btn:hover { background: #45a049; }
        .btn-test { background: #2196F3; }
        .btn-test:hover { background: #0b7dda; }
        .success { color: #4CAF50; margin-top: 10px; font-weight: bold; }
        .instructions { background: #fff3cd; padding: 15px; border-radius: 4px; margin-bottom: 20px; border-left: 4px solid #ffc107; }
    </style>

    <div class="instructions">
        <strong>📍 How to use:</strong> Select a page and field, then click on the image where you want that text to appear. Sample data will show in real-time!
    </div>

    <div class="coordinate-picker">
        <div class="image-container">
            <img id="templateImage" src="/FILE/1.jpg" alt="Template">
            <canvas id="overlayCanvas" class="overlay-canvas"></canvas>
        </div>
        
        <div class="controls">
            <div class="field-selector">
                <label><strong>Select Page:</strong></label>
                <select id="pageSelect" onchange="switchPage()">
                    <option value="1">Page 1</option>
                    <option value="2">Page 2</option>
                    <option value="3">Page 3</option>
                    <option value="4">Page 4</option>
                </select>
            </div>
            
            <div class="field-selector">
                <label><strong>Select Field:</strong></label>
                <select id="fieldSelect">
                    <option value="tehsil_top">Tehsil (Top)</option>
                    <option value="district_top">District (Top)</option>
                    <option value="mobile_start">Mobile Number Start</option>
                    <option value="aadhar_start">Aadhar Number Start</option>
                    <option value="name">Name</option>
                    <option value="father_name">Father Name</option>
                    <option value="village">Village</option>
                    <option value="ward_no">Ward Number</option>
                    <option value="age">Age</option>
                    <option value="tehsil">Tehsil</option>
                    <option value="district">District</option>
                    <option value="child_name">Child Name</option>
                    <option value="doc_applicant_name">Doc: Applicant Name (मैं)</option>
                    <option value="doc_father_name">Doc: Father Name (श्री)</option>
                    <option value="doc_village">Doc: Village (गांव)</option>
                    <option value="doc_ward">Doc: Ward No (वार्ड नं)</option>
                    <option value="doc_tehsil">Doc: Tehsil (तहसील)</option>
                    <option value="doc_district">Doc: District (जिला)</option>
                </select>
            </div>
            
            <div class="coord-display">
                <div><strong>Current Coordinates:</strong></div>
                <div>X: <span id="currentX">-</span></div>
                <div>Y: <span id="currentY">-</span></div>
                <div>Font Size: <span id="currentFont">-</span></div>
            </div>
            
            <div class="sample-data">
                <strong>Sample Data:</strong><br>
                Tehsil: Panipat<br>
                District: Panipat<br>
                Name: Rajesh Kumar<br>
                Father: Suresh Kumar<br>
                Village: Siwah<br>
                Ward: 9, Age: 34<br>
                Mobile: 9802244899<br>
                Aadhar: 232312345675
            </div>
            
            <button class="btn" onclick="saveAllCoordinates()">💾 Save All</button>
            <button class="btn btn-test" onclick="window.open('/admin/haryana-domiciles/2/print', '_blank')">🔍 Test PDF</button>
            <div id="message"></div>
        </div>
    </div>

    <h3 style="margin-top: 30px;">All Coordinates</h3>
    <form id="coordForm">
        @csrf
        
        {{-- Mobile Start with Spacing --}}
        <div class="field-group with-spacing">
            <label>Mobile Start</label>
            <input type="number" name="mobile_start_x" id="mobile_start_x" value="{{ $coords['mobile_start']['x'] ?? 0 }}" placeholder="X">
            <input type="number" name="mobile_start_y" id="mobile_start_y" value="{{ $coords['mobile_start']['y'] ?? 0 }}" placeholder="Y">
            <input type="number" name="mobile_start_fontSize" id="mobile_start_fontSize" value="{{ $coords['mobile_start']['fontSize'] ?? 18 }}" placeholder="Size">
            <input type="number" name="mobile_start_spacing" id="mobile_start_spacing" value="{{ $coords['mobile_start']['spacing'] ?? 32 }}" placeholder="Spacing">
        </div>
        
        {{-- Aadhar Start with Spacing --}}
        <div class="field-group with-spacing">
            <label>Aadhar Start</label>
            <input type="number" name="aadhar_start_x" id="aadhar_start_x" value="{{ $coords['aadhar_start']['x'] ?? 0 }}" placeholder="X">
            <input type="number" name="aadhar_start_y" id="aadhar_start_y" value="{{ $coords['aadhar_start']['y'] ?? 0 }}" placeholder="Y">
            <input type="number" name="aadhar_start_fontSize" id="aadhar_start_fontSize" value="{{ $coords['aadhar_start']['fontSize'] ?? 18 }}" placeholder="Size">
            <input type="number" name="aadhar_start_spacing" id="aadhar_start_spacing" value="{{ $coords['aadhar_start']['spacing'] ?? 32 }}" placeholder="Spacing">
        </div>
        
        @foreach([
            'tehsil_top' => 'Tehsil (Top)',
            'district_top' => 'District (Top)',
            'name' => 'Name',
            'father_name' => 'Father Name',
            'village' => 'Village',
            'ward_no' => 'Ward No',
            'age' => 'Age',
            'tehsil' => 'Tehsil',
            'district' => 'District',
            'child_name' => 'Child Name',
            'doc_applicant_name' => 'Doc: Applicant Name (मैं)',
            'doc_father_name' => 'Doc: Father Name (श्री)',
            'doc_village' => 'Doc: Village (गांव)',
            'doc_ward' => 'Doc: Ward No (वार्ड नं)',
            'doc_tehsil' => 'Doc: Tehsil (तहसील)',
            'doc_district' => 'Doc: District (जिला)'
        ] as $key => $label)
        <div class="field-group">
            <label>{{ $label }}</label>
            <input type="number" name="{{ $key }}_x" id="{{ $key }}_x" value="{{ $coords[$key]['x'] ?? 0 }}" placeholder="X">
            <input type="number" name="{{ $key }}_y" id="{{ $key }}_y" value="{{ $coords[$key]['y'] ?? 0 }}" placeholder="Y">
            <input type="number" name="{{ $key }}_fontSize" id="{{ $key }}_fontSize" value="{{ $coords[$key]['fontSize'] ?? 20 }}" placeholder="Size">
        </div>
        @endforeach
    </form>
    
    <script>
        const sampleData = {
            tehsil_top: 'Panipat',
            district_top: 'Panipat',
            mobile_start: '9802244899',
            aadhar_start: '232312345675',
            name: 'Rajesh Kumar',
            father_name: 'Suresh Kumar',
            village: 'Siwah',
            ward_no: '9',
            age: '34',
            tehsil: 'Panipat',
            district: 'Panipat',
            child_name: 'Amit Kumar',
            doc_applicant_name: 'Rajesh Kumar',
            doc_father_name: 'Suresh Kumar',
            doc_village: 'Siwah',
            doc_ward: '9',
            doc_tehsil: 'Panipat',
            doc_district: 'Panipat'
        };
        
        const img = document.getElementById('templateImage');
        const canvas = document.getElementById('overlayCanvas');
        const ctx = canvas.getContext('2d');
        const fieldSelect = document.getElementById('fieldSelect');
        
        img.onload = function() {
            canvas.width = img.width;
            canvas.height = img.height;
            drawAllCoordinates();
        };
        
        img.addEventListener('click', function(e) {
            const rect = img.getBoundingClientRect();
            const scaleX = img.naturalWidth / img.width;
            const scaleY = img.naturalHeight / img.height;
            const x = Math.round((e.clientX - rect.left) * scaleX);
            const y = Math.round((e.clientY - rect.top) * scaleY);
            
            const field = fieldSelect.value;
            document.getElementById(field + '_x').value = x;
            document.getElementById(field + '_y').value = y;
            
            updateCurrentDisplay(field);
            drawAllCoordinates();
        });
        
        fieldSelect.addEventListener('change', function() {
            updateCurrentDisplay(this.value);
        });
        
        function updateCurrentDisplay(field) {
            document.getElementById('currentX').textContent = document.getElementById(field + '_x').value;
            document.getElementById('currentY').textContent = document.getElementById(field + '_y').value;
            document.getElementById('currentFont').textContent = document.getElementById(field + '_fontSize').value;
        }
        
        function drawAllCoordinates() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            const scaleX = img.width / img.naturalWidth;
            const scaleY = img.height / img.naturalHeight;
            
            Object.keys(sampleData).forEach(field => {
                const x = parseInt(document.getElementById(field + '_x').value) || 0;
                const y = parseInt(document.getElementById(field + '_y').value) || 0;
                const fontSize = parseInt(document.getElementById(field + '_fontSize').value) || 20;
                
                if (x > 0 && y > 0) {
                    ctx.font = `${fontSize * scaleY}px Arial`;
                    ctx.fillStyle = 'rgba(255, 0, 0, 0.7)';
                    ctx.fillText(sampleData[field], x * scaleX, y * scaleY);
                    
                    // Draw crosshair
                    ctx.strokeStyle = 'red';
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(x * scaleX - 10, y * scaleY);
                    ctx.lineTo(x * scaleX + 10, y * scaleY);
                    ctx.moveTo(x * scaleX, y * scaleY - 10);
                    ctx.lineTo(x * scaleX, y * scaleY + 10);
                    ctx.stroke();
                }
            });
        }
        
        // Redraw when inputs change
        document.querySelectorAll('input[type="number"]').forEach(input => {
            input.addEventListener('input', drawAllCoordinates);
        });
        
        function switchPage() {
            const pageNum = document.getElementById('pageSelect').value;
            // Change the template image
            document.getElementById('templateImage').src = `/FILE/${pageNum}.jpg`;
            // Redraw coordinates for new page
            setTimeout(() => drawAllCoordinates(), 100);
        }
        
        async function saveAllCoordinates() {
            const formData = new FormData(document.getElementById('coordForm'));
            const data = Object.fromEntries(formData);
            
            // Organize data by pages
            const pageData = {
                page1: {},
                page2: {},
                page3: {},
                page4: {}
            };
            
            // Group coordinates by field
            const fields = {};
            for (const [key, value] of Object.entries(data)) {
                const parts = key.split('_');
                const property = parts.pop(); // x, y, fontSize, or spacing
                const fieldName = parts.join('_');
                
                if (!fields[fieldName]) {
                    fields[fieldName] = {};
                }
                fields[fieldName][property] = parseInt(value);
            }
            
            // For now, save all fields to page1 (you can extend this to support multiple pages)
            pageData.page1 = fields;
            
            try {
                const csrfToken = '{{ csrf_token() }}';
                const response = await fetch('/api/save-coordinates', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': csrfToken
                    },
                    body: JSON.stringify(pageData)
                });
                
                if (response.ok) {
                    document.getElementById('message').innerHTML = '<p class="success">✓ Saved!</p>';
                    setTimeout(() => document.getElementById('message').innerHTML = '', 2000);
                } else {
                    document.getElementById('message').innerHTML = '<p style="color:red">✗ Error</p>';
                }
            } catch (error) {
                document.getElementById('message').innerHTML = '<p style="color:red">✗ ' + error.message + '</p>';
            }
        }
        
        // Initialize
        updateCurrentDisplay(fieldSelect.value);
    </script>
</x-filament-panels::page>
