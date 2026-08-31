import React, { useEffect, useRef, useState } from 'react';
import AdminLayout from '../../../Layouts/AdminLayout';

const PAGE_CONFIG = {
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
        { key: 'doc_district', label: 'Doc: District' },
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
        { key: 'age_2', label: '12. Age (Second Mention)' },
    ],
    3: [
        { key: 'name', label: '1. Name' },
        { key: 'father_name', label: '2. Relation Name' },
        { key: 'age', label: '3. Age' },
        { key: 'address', label: '4. Address' },
        { key: 'ward_no', label: '5. Ward' },
        { key: 'tehsil', label: '6. Tehsil' },
        { key: 'district', label: '7. District' },
        { key: 'child_name', label: '8. Child Name' },
    ],
    4: [],
    5: [
        { key: 'pan_number', label: 'PAN Number' },
        { key: 'name', label: 'Name' },
        { key: 'father_name', label: 'Father Name' },
        { key: 'dob', label: 'Date of Birth' },
        { key: 'photo', label: 'Photo (Image)' },
        { key: 'signature', label: 'Signature (Image)' },
    ],
};

const PAGE_TITLES = {
    1: 'Page 1: Personal Info',
    2: 'Page 2: Declaration',
    3: 'Page 3: Patwari Report',
    4: 'Page 4: Tehsildar Report',
    5: 'Page 5: Manual PAN Card',
};

const SAMPLE_DATA = {
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
    age_2: '34',
};

export default function PdfCoordinatesEdit({ allCoords: initialCoords }) {
    const [allCoords, setAllCoords] = useState(initialCoords);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedField, setSelectedField] = useState(PAGE_CONFIG[1][0]?.key ?? '');
    const [status, setStatus] = useState('');
    const [saving, setSaving] = useState(false);

    const imgRef = useRef(null);
    const canvasRef = useRef(null);

    const pageKey = `page${currentPage}`;
    const fields = PAGE_CONFIG[currentPage] || [];

    useEffect(() => {
        setSelectedField(fields[0]?.key ?? '');
    }, [currentPage]);

    const drawOverlay = () => {
        const canvas = canvasRef.current;
        const img = imgRef.current;
        if (!canvas || !img || !img.naturalWidth) return;

        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        fields.forEach((f) => {
            const c = allCoords[pageKey]?.[f.key];
            const x = c?.x ?? 0;
            const y = c?.y ?? 0;
            if (x > 0 && y > 0) {
                ctx.font = '40px Arial';
                ctx.fillStyle = 'rgba(255, 0, 0, 0.7)';
                ctx.fillText(SAMPLE_DATA[f.key] ?? '', x, y);

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
    };

    useEffect(() => {
        drawOverlay();
    }, [allCoords, currentPage]);

    const handleImageLoad = () => {
        const canvas = canvasRef.current;
        const img = imgRef.current;
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        drawOverlay();
    };

    const updateCoord = (fieldKey, prop, value) => {
        setAllCoords((prev) => {
            const page = { ...(prev[pageKey] || {}) };
            page[fieldKey] = { ...(page[fieldKey] || {}), [prop]: value };
            return { ...prev, [pageKey]: page };
        });
    };

    const handleImageClick = (e) => {
        if (!selectedField) return;
        const img = imgRef.current;
        const rect = img.getBoundingClientRect();
        const scaleX = img.naturalWidth / rect.width;
        const scaleY = img.naturalHeight / rect.height;
        const x = Math.round((e.clientX - rect.left) * scaleX);
        const y = Math.round((e.clientY - rect.top) * scaleY);

        updateCoord(selectedField, 'x', x);
        updateCoord(selectedField, 'y', y);

        setStatus(`Updated ${selectedField}`);
        setTimeout(() => setStatus(''), 1000);
    };

    const handleSave = () => {
        setSaving(true);
        setStatus('');
        window.axios.post('/admin/pdf-coordinates', allCoords)
            .then(() => setStatus('✅ Saved successfully!'))
            .catch(() => setStatus('❌ Error saving'))
            .finally(() => setSaving(false));
    };

    return (
        <AdminLayout>
            <div className="flex gap-6" style={{ height: 'calc(100vh - 160px)' }}>
                {/* Left: form controls */}
                <div className="flex-none w-[400px] bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-gray-200 bg-gray-50 space-y-3">
                        <select
                            value={currentPage}
                            onChange={(e) => setCurrentPage(Number(e.target.value))}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
                        >
                            {[1, 2, 3, 4, 5].map((p) => (
                                <option key={p} value={p}>{PAGE_TITLES[p]}</option>
                            ))}
                        </select>

                        {fields.length > 0 && (
                            <select
                                value={selectedField}
                                onChange={(e) => setSelectedField(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
                            >
                                {fields.map((f) => (
                                    <option key={f.key} value={f.key}>{f.label}</option>
                                ))}
                            </select>
                        )}
                        <p className="text-xs text-gray-500">Click the image on the right to place the selected field. Or edit X/Y directly below.</p>
                    </div>

                    <div className="flex-1 overflow-y-auto p-2">
                        {fields.length === 0 && (
                            <p className="text-sm text-gray-400 italic p-4">No dynamic fields on this page.</p>
                        )}
                        {fields.map((f) => {
                            const c = allCoords[pageKey]?.[f.key] || {};
                            const active = f.key === selectedField;
                            return (
                                <div
                                    key={f.key}
                                    onClick={() => setSelectedField(f.key)}
                                    className={`grid grid-cols-[1fr_70px_70px] gap-2 items-center px-3 py-2 rounded-lg cursor-pointer ${active ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                                >
                                    <label className="text-sm font-semibold text-gray-700 truncate">{f.label}</label>
                                    <input
                                        type="number"
                                        value={c.x ?? ''}
                                        onChange={(e) => updateCoord(f.key, 'x', parseInt(e.target.value, 10) || 0)}
                                        placeholder="X"
                                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm text-right"
                                    />
                                    <input
                                        type="number"
                                        value={c.y ?? ''}
                                        onChange={(e) => updateCoord(f.key, 'y', parseInt(e.target.value, 10) || 0)}
                                        placeholder="Y"
                                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm text-right"
                                    />
                                </div>
                            );
                        })}
                    </div>

                    <div className="p-3 border-t border-gray-200 flex items-center justify-between">
                        <span className="text-sm text-gray-500">{status}</span>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                        >
                            {saving ? 'Saving…' : '💾 Save Changes'}
                        </button>
                    </div>
                </div>

                {/* Right: image preview */}
                <div className="flex-1 bg-gray-200 rounded-xl border border-gray-300 overflow-auto p-5 relative">
                    <div className="relative w-fit mx-auto shadow-lg">
                        <img
                            ref={imgRef}
                            src={`/FILE/${currentPage}.jpg`}
                            alt={`Template page ${currentPage}`}
                            onLoad={handleImageLoad}
                            onClick={handleImageClick}
                            className="block w-full h-auto cursor-crosshair"
                        />
                        <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full pointer-events-none" />
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
