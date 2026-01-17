<x-filament-panels::page>
    <style>
        /* Modern & Clean Design */
        .fi-sidebar, .fi-topbar { display: none !important; }
        .fi-main { margin: 0 !important; max-width: 100% !important; padding: 0 20px 20px 20px !important; background: #f9fafb; }
        
        .main-layout {
            display: flex;
            gap: 24px;
            height: calc(100vh - 40px);
            align-items: flex-start;
        }

        /* Left: Form Area */
        .form-section {
            flex: 0 0 400px;
            background: white;
            border-radius: 12px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            display: flex;
            flex-direction: column;
            height: 100%;
            overflow: hidden;
            border: 1px solid #e5e7eb;
        }
        
        .form-header {
            padding: 16px;
            border-bottom: 1px solid #e5e7eb;
            background: #f8fafc;
        }
        
        .form-content {
            flex: 1;
            overflow-y: auto;
            padding: 16px;
        }

        /* Right: Image Preview */
        .preview-section {
            flex: 1;
            background: #e5e7eb;
            border-radius: 12px;
            border: 1px solid #d1d5db;
            height: 100%;
            overflow: auto; /* Enable scrolling */
            position: relative;
            padding: 20px;
        }
        
        .image-container {
            position: relative;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            width: fit-content;
            margin: 0 auto;
        }
        .image-container img { 
            display: block; 
            width: 100%; 
            height: auto; 
            cursor: crosshair; 
        }
        
        .overlay-canvas {
            position: absolute;
            top: 0;
            left: 0;
            pointer-events: none;
            width: 100% !important;
            height: 100% !important;
        }

        /* Form Elements */
        .field-group {
            display: grid;
            grid-template-columns: 1fr 70px 70px; /* Label | X | Y */
            gap: 8px;
            align-items: center;
            padding: 10px;
            border-bottom: 1px solid #f1f5f9;
            transition: background 0.15s;
        }
        .field-group:hover, .field-group.active { background: #eff6ff; }
        .field-group:last-child { border-bottom: none; }
        
        .field-group label { 
            font-size: 0.85rem; 
            font-weight: 600; 
            color: #374151; 
            white-space: nowrap; 
            overflow: hidden; 
            text-overflow: ellipsis; 
        }
        
        .input-wrap { position: relative; }
        .input-wrap input {
            width: 100%;
            padding: 6px 6px 6px 20px; /* Space for label */
            border: 1px solid #d1d5db;
            border-radius: 6px;
            font-size: 0.85rem;
            text-align: right;
            transition: border-color 0.15s;
        }
        .input-wrap input:focus { border-color: #3b82f6; outline: none; ring: 2px solid #bfdbfe; }
        .input-label {
            position: absolute;
            left: 6px;
            top: 50%;
            transform: translateY(-50%);
            font-size: 0.7rem;
            color: #9ca3af;
            font-weight: bold;
            pointer-events: none;
        }

        .section-title {
            font-size: 0.75rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: #6b7280;
            font-weight: 700;
            margin: 20px 0 10px;
            padding-bottom: 5px;
            border-bottom: 2px solid #f1f5f9;
        }

        .controls-bar {
            background: white;
            padding: 10px;
            border-top: 1px solid #e5e7eb;
            display: flex;
            gap: 10px;
            align-items: center;
            justify-content: space-between;
        }

        .btn {
            background: #0f172a; 
            color: white; 
            padding: 8px 16px; 
            border-radius: 8px; 
            font-weight: 500; 
            font-size: 0.875rem; 
            border: none; 
            cursor: pointer; 
            transition: all 0.2s;
        }
        .btn:hover { background: #1e293b; transform: translateY(-1px); }
        .btn-green { background: #10b981; }
        .btn-green:hover { background: #059669; }

        select {
            appearance: none;
            -webkit-appearance: none;
            -moz-appearance: none;
            width: 100%;
            padding: 10px 12px;
            padding-right: 30px; /* Space for arrow */
            border-radius: 8px;
            border: 1px solid #d1d5db;
            font-size: 0.875rem;
            background-color: white;
            background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
            background-position: right 0.5rem center;
            background-repeat: no-repeat;
            background-size: 1.5em 1.5em;
            margin-bottom: 12px;
            color: #1f2937;
            height: auto;
        }
        select:focus {
            border-color: #3b82f6;
            outline: none;
            box-shadow: 0 0 0 1px #3b82f6;
        }
        
        .floating-status {
            position: absolute;
            top: 20px;
            right: 20px;
            background: rgba(0,0,0,0.8);
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 12px;
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.3s;
            z-index: 10;
        }
    </style>

    <div class="main-layout">
        <!-- Sidebar Controls -->
        <div class="form-section">
            <div class="form-header">
                <select id="pageSelect" onchange="switchPage()">
                    <option value="1">Page 1: Personal Info</option>
                    <option value="2">Page 2: Declaration</option>
                    <option value="3">Page 3: Patwari Report</option>
                    <option value="4">Page 4: Tehsildar Report</option>
                </select>
                
                <div style="display:flex; gap:10px; align-items:center;">
                    <select id="fieldSelect" style="margin-bottom:0">
                        <!-- Populated by JS -->
                    </select>
                </div>
            </div>

            <div class="form-content">
                <form id="coordForm">
                @csrf
                
                <h4 class="section-title">Special Fields</h4>
                <div class="field-group" data-field-group="mobile_start">
                    <label>Mobile</label>
                    <div class="input-wrap"><span class="input-label">X</span><input type="number" data-field="mobile_start" data-prop="x" id="mobile_start_x"></div>
                    <div class="input-wrap"><span class="input-label">Y</span><input type="number" data-field="mobile_start" data-prop="y" id="mobile_start_y"></div>
                </div>
                <div class="field-group" data-field-group="aadhar_start">
                    <label>Aadhar</label>
                    <div class="input-wrap"><span class="input-label">X</span><input type="number" data-field="aadhar_start" data-prop="x" id="aadhar_start_x"></div>
                    <div class="input-wrap"><span class="input-label">Y</span><input type="number" data-field="aadhar_start" data-prop="y" id="aadhar_start_y"></div>
                </div>

                <h4 class="section-title">Standard Fields</h4>
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
                    'doc_applicant_name' => 'Doc: Applicant',
                    'doc_father_name' => 'Doc: Father',
                    'doc_address' => 'Doc: Address',
                    'doc_ward' => 'Doc: Ward',
                    'doc_tehsil' => 'Doc: Tehsil',
                    'doc_district' => 'Doc: District',
                    'ration_card_no' => 'Ration Card',
                    'aadhar_2' => 'Aadhar (Pg2)',
                    'age_2' => 'Age (Pg2)'
                ] as $key => $label)
                <div class="field-group" data-field-group="{{ $key }}">
                    <label>{{ $label }}</label>
                    <div class="input-wrap"><span class="input-label">X</span><input type="number" data-field="{{ $key }}" data-prop="x" id="{{ $key }}_x"></div>
                    <div class="input-wrap"><span class="input-label">Y</span><input type="number" data-field="{{ $key }}" data-prop="y" id="{{ $key }}_y"></div>
                </div>
                @endforeach
                </form>
            </div>

            <div class="controls-bar">
                <button class="btn btn-green" onclick="saveAllCoordinates()">💾 Save Changes</button>
            </div>
        </div>

        <!-- Preview Area -->
        <div class="preview-section">
            <div id="statusMessage" class="floating-status">Updated</div>
            <div id="imageContainer" class="image-container">
                <img id="templateImage" src="/FILE/1.jpg?t={{ time() }}" alt="Template">
                <canvas id="overlayCanvas" class="overlay-canvas"></canvas>
            </div>
        </div>
    </div>
    
    <script>
        // Use Blade to inject initial data
        let allCoords = @json($allCoords);
        let currentPage = 1;

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



        function loadPageData(pageNum) {
            currentPage = pageNum;
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
            const xInput = document.getElementById(field + '_x');
            const yInput = document.getElementById(field + '_y');
            
            if (xInput && yInput) {
                xInput.value = x;
                yInput.value = y;
                xInput.dispatchEvent(new Event('input'));
            }
            
            // Highlight the row
            document.querySelectorAll('.field-group').forEach(g => g.classList.remove('active'));
            const row = document.querySelector(`.field-group[data-field-group="${field}"]`);
            if (row) {
                row.classList.add('active');
                row.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            
            // Show status
            const status = document.getElementById('statusMessage');
            status.style.opacity = 1;
            status.innerText = `Updated ${field}`;
            setTimeout(() => status.style.opacity = 0, 1000);

            drawAllCoordinates();
        });
        
        fieldSelect.addEventListener('change', function() {
            // Highlight list item
            document.querySelectorAll('.field-group').forEach(g => g.classList.remove('active'));
             const row = document.querySelector(`.field-group[data-field-group="${this.value}"]`);
            if (row) {
                row.classList.add('active');
                row.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        });
        
        function updateCurrentDisplay(field) {
            // Deprecated - inputs are now live
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
                
                if (!xInput || !yInput) return;

                const x = parseInt(xInput.value) || 0;
                const y = parseInt(yInput.value) || 0;
                const fontSize = 40;
                
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
            document.getElementById('templateImage').src = `/FILE/${pageNum}.jpg?t=` + new Date().getTime();
            loadPageData(pageNum);
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
                
                if (!allCoords[pKey][field]) allCoords[pKey][field] = {};

                if (xInput) allCoords[pKey][field].x = parseInt(xInput.value) || 0;
                if (yInput) allCoords[pKey][field].y = parseInt(yInput.value) || 0;

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
                    alert('✅ Saved successfully!');
                } else {
                    alert('❌ Error saving');
                }
            } catch (error) {
                alert('❌ Error: ' + error.message);
            }
        }
    </script>
</x-filament-panels::page>
