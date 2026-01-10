<x-filament-panels::page>
    <style>
        /* Maximize workspace */
        .fi-sidebar { display: none !important; }
        .fi-main { margin-left: 0 !important; max-width: 100% !important; padding: 10px !important; }
        .fi-topbar { display: none !important; } /* Optional: Hide topbar for full focus? maybe keep it for navigation back */
        
        .coordinate-picker { display: grid; grid-template-columns: 1fr 350px; gap: 20px; margin-bottom: 20px; height: 90vh; }
        .image-wrapper { width: 100%; height: 100%; overflow: auto; border: 2px solid #ddd; border-radius: 8px; background: #f0f0f0; position: relative; }
        .image-container { position: relative; transform-origin: top left; transition: transform 0.2s ease; width: fit-content; }
        .image-container img { display: block; cursor: crosshair; }
        .overlay-canvas { position: absolute; top: 0; left: 0; pointer-events: none; }
        .controls { background: white; padding: 15px; border-radius: 8px; border: 1px solid #ddd; position: sticky; top: 0; height: 100%; overflow-y: auto; }
        
        .field-selector { margin-bottom: 15px; }
        .field-selector select { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px; }
        .coord-display { background: #f0f0f0; padding: 10px; border-radius: 4px; margin-bottom: 10px; font-size: 13px; }
        .coord-display div { margin: 3px 0; font-family: monospace; }
        .sample-data { background: #e3f2fd; padding: 8px; border-radius: 4px; margin-top: 10px; font-size: 11px; }
        .field-group { display: grid; grid-template-columns: 1fr 60px 60px 60px; gap: 5px; margin-bottom: 5px; align-items: center; padding: 5px; background: #f9f9f9; border-radius: 4px; font-size: 12px; }
        .field-group.hidden { display: none; }
        .field-group.with-spacing { grid-template-columns: 1fr 60px 60px 60px 60px; }
        .field-group label { font-weight: bold; color: #555; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .field-group input { padding: 4px; border: 1px solid #ddd; border-radius: 3px; font-size: 12px; width: 100%; }
        
        .btn { background: #4CAF50; color: white; padding: 8px 15px; border: none; border-radius: 4px; cursor: pointer; font-size: 14px; margin: 3px; width: 100%; }
        .btn:hover { background: #45a049; }
        .btn-test { background: #2196F3; }
        .btn-test:hover { background: #0b7dda; }
        .btn-zoom { background: #607d8b; padding: 5px 15px; font-size: 18px; font-weight: bold; width: auto; }
        .btn-zoom:hover { background: #455a64; }
        .zoom-controls { margin-bottom: 10px; display: flex; align-items: center; gap: 10px; justify-content: center; background: #eee; padding: 5px; border-radius: 4px; }
        .success { color: #4CAF50; margin-top: 5px; font-weight: bold; text-align: center; }
        .instructions { background: #fff3cd; padding: 10px; border-radius: 4px; margin-bottom: 10px; border-left: 4px solid #ffc107; font-size: 13px; }
    </style>

    <div class="instructions">
        <strong>📍 How to use:</strong> Select a page and field, then click on the image. Coordinates update automatically. <br>
        <strong>🔍 Zoom:</strong> Use the buttons to zoom in/out for precise placement. Scroll to pan around.
    </div>

    <div class="coordinate-picker">
        <div class="image-wrapper">
            <div id="imageContainer" class="image-container">
                <img id="templateImage" src="/FILE/1.jpg" alt="Template">
                <canvas id="overlayCanvas" class="overlay-canvas"></canvas>
            </div>
        </div>
        
        <div class="controls">
            <div class="zoom-controls">
                <strong>Zoom:</strong>
                <button class="btn btn-zoom" onclick="changeZoom(-0.2)">-</button>
                <span id="zoomLevel">100%</span>
                <button class="btn btn-zoom" onclick="changeZoom(0.2)">+</button>
            </div>

            <div class="field-selector" style="background: #e8f5e9; padding: 10px; border-radius: 4px; border: 1px solid #c8e6c9;">
                <label><strong>Global Font Size:</strong></label>
                <div style="display: flex; gap: 5px;">
                    <input type="number" id="globalFontSize" value="20" style="padding: 8px; border: 1px solid #ddd; border-radius: 4px; width: 80px;">
                    <button class="btn" onclick="applyGlobalFontSize()" style="margin: 0; padding: 5px 10px;">Apply to All</button>
                </div>
            </div>

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
                <label><strong>Select Field to Edit:</strong></label>
                <select id="fieldSelect">
                    <!-- Populated by JS -->
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
                Tehsil: Panipat, District: Panipat<br>
                Name: Rajesh Kumar<br>
                Father: Suresh Kumar<br>
                Village: Siwah, Ward: 9<br>
                Age: 34, Caste: General<br>
                Religion: Hindu<br>
                Mobile: 9802244899<br>
                Aadhar: 232312345675
            </div>
            
            <button class="btn" onclick="saveAllCoordinates()">💾 Save All Pages</button>
            <button class="btn btn-test" onclick="window.open('/admin/haryana-domiciles/2/print', '_blank')">🔍 Test PDF</button>
            <div id="message"></div>
        </div>
    </div>

    <h3 style="margin-top: 30px;">All Coordinates (<span id="pageTitle">Page 1</span>)</h3>
    <form id="coordForm">
        @csrf
        
        {{-- Mobile Start with Spacing --}}
        <div class="field-group with-spacing" data-field-group="mobile_start">
            <label>Mobile Start</label>
            <input type="number" data-field="mobile_start" data-prop="x" id="mobile_start_x" placeholder="X">
            <input type="number" data-field="mobile_start" data-prop="y" id="mobile_start_y" placeholder="Y">
            <input type="number" data-field="mobile_start" data-prop="fontSize" id="mobile_start_fontSize" placeholder="Size">
            <input type="number" data-field="mobile_start" data-prop="spacing" id="mobile_start_spacing" placeholder="Spacing">
        </div>
        
        {{-- Aadhar Start with Spacing --}}
        <div class="field-group with-spacing" data-field-group="aadhar_start">
            <label>Aadhar Start</label>
            <input type="number" data-field="aadhar_start" data-prop="x" id="aadhar_start_x" placeholder="X">
            <input type="number" data-field="aadhar_start" data-prop="y" id="aadhar_start_y" placeholder="Y">
            <input type="number" data-field="aadhar_start" data-prop="fontSize" id="aadhar_start_fontSize" placeholder="Size">
            <input type="number" data-field="aadhar_start" data-prop="spacing" id="aadhar_start_spacing" placeholder="Spacing">
        </div>
        
        @foreach([
            'tehsil_top' => 'Tehsil (Top)',
            'district_top' => 'District (Top)',
            'name' => 'Name',
            'father_name' => 'Father Name',
            'address' => 'Address',
            'ward_no' => 'Ward No',
            'age' => 'Age',
            'caste' => 'Caste',
            'religion' => 'Religion',
            'tehsil' => 'Tehsil',
            'district' => 'District',
            'child_name' => 'Child Name',
            'doc_applicant_name' => 'Doc: Applicant Name (मैं)',
            'doc_father_name' => 'Doc: Father Name (श्री)',
            'doc_address' => 'Doc: Address (गांव)',
            'doc_ward' => 'Doc: Ward No (वार्ड नं)',
            'doc_tehsil' => 'Doc: Tehsil (तहसील)',
            'doc_district' => 'Doc: District (जिला)',
            'ration_card_no' => 'Ration Card No',
            'aadhar_2' => 'Aadhar No (Page 2)',
            'age_2' => 'Age (Page 2 Second)'
        ] as $key => $label)
        <div class="field-group" data-field-group="{{ $key }}">
            <label>{{ $label }}</label>
            <input type="number" data-field="{{ $key }}" data-prop="x" id="{{ $key }}_x" placeholder="X">
            <input type="number" data-field="{{ $key }}" data-prop="y" id="{{ $key }}_y" placeholder="Y">
            <input type="number" data-field="{{ $key }}" data-prop="fontSize" id="{{ $key }}_fontSize" placeholder="Size">
        </div>
        @endforeach
    </form>
    
    <script>
        // Use Blade to inject initial data
        let allCoords = @json($allCoords);
        let currentPage = 1;
        let currentZoom = 1;

        // Configuration: which fields belong to which page
        const pageConfig = {
            1: [
                { key: 'tehsil_top', label: 'Tehsil (Top)' },
                { key: 'district_top', label: 'District (Top)' },
                { key: 'mobile_start', label: 'Mobile Number Start' },
                { key: 'aadhar_start', label: 'Aadhar Number Start' },
                { key: 'name', label: 'Name' },
                { key: 'father_name', label: 'Father Name' },
                { key: 'address', label: 'Address' },
                { key: 'ward_no', label: 'Ward No' },
                { key: 'age', label: 'Age' },
                { key: 'tehsil', label: 'Tehsil' },
                { key: 'district', label: 'District' },
                { key: 'child_name', label: 'Child Name' },
                { key: 'doc_applicant_name', label: 'Doc: Applicant Name' },
                { key: 'doc_father_name', label: 'Doc: Father Name' },
                { key: 'doc_address', label: 'Doc: Address' },
                { key: 'doc_ward', label: 'Doc: Ward No' },
                { key: 'doc_tehsil', label: 'Doc: Tehsil' },
                { key: 'doc_district', label: 'Doc: District' }
            ],
            2: [
                { key: 'name', label: '1. Name (First Name)' },
                { key: 'father_name', label: '2. Relation Name (Father)' },
                { key: 'age', label: '3. Age' },
                { key: 'caste', label: '4. Caste' },
                { key: 'religion', label: '5. Religion (Dharam)' },
                { key: 'address', label: '6. Address' },
                { key: 'ward_no', label: '7. Ward' },
                { key: 'tehsil', label: '8. Tehsil' },
                { key: 'district', label: '9. District' },
                { key: 'ration_card_no', label: '10. Ration Card Number' },
                { key: 'aadhar_2', label: '11. Aadhar Number' },
                { key: 'age_2', label: '12. Age (Second Mention)' }
            ],
            3: [
                { key: 'name', label: '1. Name' },
                { key: 'father_name', label: '2. Relation Name' },
                { key: 'age', label: '3. Age' },
                { key: 'address', label: '4. Address' },
                { key: 'ward_no', label: '5. Ward' },
                { key: 'tehsil', label: '6. Tehsil' },
                { key: 'district', label: '7. District' },
                { key: 'child_name', label: '8. Child Name' }
            ],
            4: [
                 // Add fields for Page 4 if needed
            ]
        };

        const sampleData = {
            tehsil_top: 'Panipat',
            district_top: 'Panipat',
            mobile_start: '9802244899',
            aadhar_start: '232312345675',
            name: 'Rajesh Kumar',
            father_name: 'Suresh Kumar',
            address: 'Siwah',
            ward_no: '9',
            age: '34',
            caste: 'General',
            religion: 'Hindu',
            tehsil: 'Panipat',
            district: 'Panipat',
            child_name: 'Amit Kumar',
            doc_applicant_name: 'Rajesh Kumar',
            doc_father_name: 'Suresh Kumar',
            doc_address: 'Siwah',
            doc_ward: '9',
            doc_tehsil: 'Panipat',
            doc_district: 'Panipat',
            ration_card_no: '066010398807',
            aadhar_2: '2323 1234 5675',
            age_2: '34'
        };
        
        const img = document.getElementById('templateImage');
        const canvas = document.getElementById('overlayCanvas');
        const ctx = canvas.getContext('2d');
        const fieldSelect = document.getElementById('fieldSelect');
        const container = document.getElementById('imageContainer');
        
        img.onload = function() {
            // Set canvas resolution to match raw image resolution
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            // Ensure canvas CSS width matches image CSS width (responsive)
            canvas.style.width = '100%';
            canvas.style.height = 'auto';
            drawAllCoordinates();
        };
        
        // Initial load
        switchPage();

        function changeZoom(delta) {
            currentZoom += delta;
            currentZoom = Math.min(Math.max(currentZoom, 0.2), 3);
            currentZoom = Math.round(currentZoom * 10) / 10;
            updateZoomDisplay();
        }

        function updateZoomDisplay() {
            document.getElementById('zoomLevel').textContent = Math.round(currentZoom * 100) + '%';
            
            // Apply width to image - canvas will follow via CSS width: 100%
            img.style.width = (100 * currentZoom) + '%';
            // We don't need to set canvas.style.width if it's 100% of container, but container is fitting content
            // So we explicitly match the canvas style to image style?
            // Actually, if canvas is absolute top:0 left:0 of container, and image is static...
            // setting img width expands container. canvas width: 100% should match container.
            
            // Force redraw not strictly needed if resolution is fixed, but good for safety
            setTimeout(drawAllCoordinates, 50);
        }

        function loadPageData(pageNum) {
            currentPage = pageNum;
            document.getElementById('pageTitle').textContent = 'Page ' + pageNum;
            const pageKey = 'page' + pageNum;
            // ... (rest is same, skipping to keep succinct if possible, but replace needs context)
            const coords = allCoords[pageKey] || {};

            // 1. Update Dropdown Options
            const fields = pageConfig[pageNum] || [];
            fieldSelect.innerHTML = '';
            fields.forEach(f => {
                const option = document.createElement('option');
                option.value = f.key;
                option.textContent = f.label;
                fieldSelect.appendChild(option);
            });

            // 2. Show/Hide Input Groups
            document.querySelectorAll('.field-group').forEach(group => {
                group.classList.add('hidden');
            });
            
            fields.forEach(f => {
                const group = document.querySelector(`.field-group[data-field-group="${f.key}"]`);
                if (group) group.classList.remove('hidden');
            });

            // 3. Populate Inputs
            document.querySelectorAll('input[data-field]').forEach(input => {
                input.value = ''; 
            });

            Object.keys(coords).forEach(fieldName => {
                const fieldData = coords[fieldName];
                if (fieldData) {
                    if (document.getElementById(fieldName + '_x')) document.getElementById(fieldName + '_x').value = fieldData.x;
                    if (document.getElementById(fieldName + '_y')) document.getElementById(fieldName + '_y').value = fieldData.y;
                    if (document.getElementById(fieldName + '_fontSize')) document.getElementById(fieldName + '_fontSize').value = fieldData.fontSize;
                    if (fieldData.spacing && document.getElementById(fieldName + '_spacing')) {
                        document.getElementById(fieldName + '_spacing').value = fieldData.spacing;
                    }
                }
            });

            updateCurrentDisplay(fieldSelect.value);
            setTimeout(drawAllCoordinates, 100); 
        }

        img.addEventListener('click', function(e) {
            const rect = img.getBoundingClientRect();
            const scaleX = img.naturalWidth / rect.width;
            const scaleY = img.naturalHeight / rect.height;
            const x = Math.round((e.clientX - rect.left) * scaleX);
            const y = Math.round((e.clientY - rect.top) * scaleY);
            
            const field = fieldSelect.value;
            // Update inputs
            const xInput = document.getElementById(field + '_x');
            const yInput = document.getElementById(field + '_y');
            
            if (xInput && yInput) {
                xInput.value = x;
                yInput.value = y;
                
                // Trigger input event to update state
                xInput.dispatchEvent(new Event('input'));
            }
            
            updateCurrentDisplay(field);
            drawAllCoordinates();
        });
        
        fieldSelect.addEventListener('change', function() {
            updateCurrentDisplay(this.value);
        });
        
        function updateCurrentDisplay(field) {
            const xInput = document.getElementById(field + '_x');
            const yInput = document.getElementById(field + '_y');
            const fontInput = document.getElementById(field + '_fontSize');

            document.getElementById('currentX').textContent = xInput ? xInput.value : '-';
            document.getElementById('currentY').textContent = yInput ? yInput.value : '-';
            document.getElementById('currentFont').textContent = fontInput ? fontInput.value : '-';
        }
        
        function drawAllCoordinates() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Since we are using natural resolution canvas, we map 1:1 to image coordinates
            // CSS handles visual scaling of both image and canvas together
            
            // Only draw visible fields for current page
            const visibleFields = pageConfig[currentPage] || [];
            
            visibleFields.forEach(f => {
                const field = f.key;
                const xInput = document.getElementById(field + '_x');
                const yInput = document.getElementById(field + '_y');
                const fontInput = document.getElementById(field + '_fontSize');
                
                if (!xInput || !yInput) return;

                const x = parseInt(xInput.value) || 0;
                const y = parseInt(yInput.value) || 0;
                const fontSize = parseInt(fontInput ? fontInput.value : 20) || 20;
                
                if (x > 0 && y > 0) {
                    ctx.font = `${fontSize}px Arial`;
                    ctx.fillStyle = 'rgba(255, 0, 0, 0.7)';
                    ctx.fillText(sampleData[field], x, y);
                    
                    // Draw crosshair
                    ctx.strokeStyle = 'red';
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.moveTo(x - 20, y);
                    ctx.lineTo(x + 20, y);
                    ctx.moveTo(x, y - 20);
                    ctx.lineTo(x, y + 20);
                    ctx.stroke();
                }
            });
        }
        
        // Listen to input changes to update local state and redraw
        document.querySelectorAll('input[type="number"]').forEach(input => {
            input.addEventListener('input', function() {
                const field = this.getAttribute('data-field');
                const prop = this.getAttribute('data-prop');
                const pageKey = 'page' + currentPage;
                
                // Debug logging
                console.log(`Input Changed: Field=${field}, Prop=${prop}, PageKey=${pageKey}, Value=${this.value}`);
                
                if (!allCoords[pageKey]) allCoords[pageKey] = {};
                if (!allCoords[pageKey][field]) allCoords[pageKey][field] = {};
                
                allCoords[pageKey][field][prop] = parseInt(this.value) || 0;
                
                // Debug: check if it updated
                console.log('Updated allCoords:', allCoords[pageKey][field]);
                
                drawAllCoordinates();
            });
        });
        
        function switchPage() {
            const pageNum = document.getElementById('pageSelect').value;
            // Force currentPage to integer if needed, or keeping as string from value? 
            // pageConfig uses integer keys 1, 2. allCoords keys are 'page1'.
            currentPage = parseInt(pageNum); 
            document.getElementById('templateImage').src = `/FILE/${pageNum}.jpg`;
            loadPageData(pageNum);
        }
        
        function applyGlobalFontSize() {
            const size = parseInt(document.getElementById('globalFontSize').value) || 20;
            if (!confirm(`Are you sure you want to set font size to ${size} for ALL fields on ALL pages?`)) return;
            
            // 1. Update allCoords data model
            Object.keys(allCoords).forEach(pageKey => {
                Object.keys(allCoords[pageKey]).forEach(field => {
                    if (allCoords[pageKey][field]) {
                        allCoords[pageKey][field].fontSize = size;
                    }
                });
            });
            
            // 2. Update visible inputs on current page
            document.querySelectorAll('input[data-prop="fontSize"]').forEach(input => {
                input.value = size;
            });
            
            // 3. Update current display if selected
            const currentField = document.getElementById('fieldSelect').value;
            updateCurrentDisplay(currentField);
            
            // 4. Redraw canvas
            drawAllCoordinates();
            
            alert(`✅ Font size set to ${size} for all fields! Click "Save All" to make it permanent.`);
        }
        
        async function saveAllCoordinates() {
            // Force sync from DOM to ensure latest values are grabbed
            // We only need to sync the CURRENT page's inputs because other pages are already in allCoords
            // (since inputs are shared/reused, we only see current page values)
            
            const pageKey = 'page' + currentPage;
            if (!allCoords[pageKey]) allCoords[pageKey] = {};
            
            document.querySelectorAll('input[data-field]').forEach(input => {
                // Only capture inputs that are relevant (though hidden ones kept their values? No, inputs are reused/shared logic... wait)
                // The Inputs have IDs like tehsil_top_x. They are NOT reused per page? 
                // NO! The HTML loop creates inputs for EVERY field (page 1, page 2, etc).
                // They are just hidden/shown via CSS.
                // So we can iterate ALL inputs and update ALL coords.
                
                const field = input.getAttribute('data-field');
                const prop = input.getAttribute('data-prop');
                
                // We need to know which page this field belongs to.
                // We can find it by searching pageConfig.
                // Or we can rely on existing allCoords structure?
                // Better: Reverse lookup page from field.
                
                let fieldPage = null;
                for (const [pNum, fields] of Object.entries(pageConfig)) {
                   if (fields.find(f => f.key === field)) {
                       fieldPage = pNum;
                       break;
                   }
                }
                
                if (fieldPage) {
                    const pKey = 'page' + fieldPage;
                     if (!allCoords[pKey]) allCoords[pKey] = {};
                     if (!allCoords[pKey][field]) allCoords[pKey][field] = {};
                     
                     // Only update if value is present (to avoid overwriting with empty if not loaded?)
                     // Actually, inputs are populated on load. If we haven't switched to that page, inputs might be empty?
                     // Verify: loadPageData *clears* inputs.
                     // The inputs for OTHER pages are hidden.
                     // IMPORTANT: Inputs for ALL fields exist in the DOM.
                     // BUT `loadPageData` clears `document.querySelectorAll('input[data-field]')` at start!
                     // This means it wipes inputs for hidden fields too!
                     // So we can ONLY safely read inputs for the CURRENT page (visible ones).
                     // For other pages, we must trust `allCoords` history.
                }
            });

            // OK, so the strategy is:
            // 1. Inputs for CURRENT page are the source of truth.
            // 2. Inputs for OTHER pages are cleared/irrelevant in DOM.
            // 3. Update allCoords from DOM for CURRENT PAGE only.
            
            const visibleFields = pageConfig[currentPage] || [];
            visibleFields.forEach(f => {
                const field = f.key;
                const pKey = 'page' + currentPage;
                
                const xInput = document.getElementById(field + '_x');
                const yInput = document.getElementById(field + '_y');
                const fontInput = document.getElementById(field + '_fontSize');
                const spacingInput = document.getElementById(field + '_spacing');
                
                if (!allCoords[pKey][field]) allCoords[pKey][field] = {};
                
                if (xInput) allCoords[pKey][field].x = parseInt(xInput.value) || 0;
                if (yInput) allCoords[pKey][field].y = parseInt(yInput.value) || 0;
                if (fontInput) allCoords[pKey][field].fontSize = parseInt(fontInput.value) || 20;
                if (spacingInput) allCoords[pKey][field].spacing = parseInt(spacingInput.value) || null;
            });
            
            console.log('Saving allCoords (Synced from DOM):', allCoords);

            try {
                const csrfToken = '{{ csrf_token() }}';
                const response = await fetch('/api/save-coordinates', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': csrfToken
                    },
                    body: JSON.stringify(allCoords)
                });
                
                if (response.ok) {
                    document.getElementById('message').innerHTML = '<p class="success">✓ Saved all pages!</p>';
                    setTimeout(() => document.getElementById('message').innerHTML = '', 2000);
                } else {
                    document.getElementById('message').innerHTML = '<p style="color:red">✗ Error</p>';
                }
            } catch (error) {
                document.getElementById('message').innerHTML = '<p style="color:red">✗ ' + error.message + '</p>';
            }
        }
    </script>
</x-filament-panels::page>
