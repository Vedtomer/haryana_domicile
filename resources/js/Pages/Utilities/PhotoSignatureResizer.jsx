import React, { useState, useRef, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';

const PRESETS = [
    {
        id: 'ssc_photo',
        category: 'photo',
        title: 'SSC / HSSC / Police Photo',
        desc: '3.5 x 4.5 cm (20 KB - 50 KB)',
        width: 350,
        height: 450,
        minKb: 20,
        maxKb: 50,
        aspectRatio: 350 / 450,
        allowNameDate: true,
    },
    {
        id: 'ssc_sign',
        category: 'sign',
        title: 'SSC / HSSC / Police Signature',
        desc: '4.0 x 2.0 cm (10 KB - 20 KB)',
        width: 400,
        height: 200,
        minKb: 10,
        maxKb: 20,
        aspectRatio: 400 / 200,
        cleanPaperDefault: true,
    },
    {
        id: 'upsc_photo',
        category: 'photo',
        title: 'UPSC / NDA / CDS Photo',
        desc: '350 x 350 px (20 KB - 100 KB)',
        width: 350,
        height: 350,
        minKb: 20,
        maxKb: 100,
        aspectRatio: 1,
        allowNameDate: true,
    },
    {
        id: 'upsc_sign',
        category: 'sign',
        title: 'UPSC Signature',
        desc: '350 x 350 px (20 KB - 100 KB)',
        width: 350,
        height: 350,
        minKb: 20,
        maxKb: 100,
        aspectRatio: 1,
        cleanPaperDefault: true,
    },
    {
        id: 'nta_photo',
        category: 'photo',
        title: 'NTA NEET / JEE Photo',
        desc: '3.5 x 4.5 cm (10 KB - 200 KB)',
        width: 350,
        height: 450,
        minKb: 10,
        maxKb: 200,
        aspectRatio: 350 / 450,
        allowNameDate: true,
    },
    {
        id: 'nta_sign',
        category: 'sign',
        title: 'NTA NEET / JEE Signature',
        desc: '4.0 x 2.0 cm (4 KB - 30 KB)',
        width: 400,
        height: 200,
        minKb: 4,
        maxKb: 30,
        aspectRatio: 400 / 200,
        cleanPaperDefault: true,
    },
    {
        id: 'pan_photo',
        category: 'photo',
        title: 'PAN Card Photo (NSDL / UTI)',
        desc: '213 x 213 px (under 30 KB)',
        width: 213,
        height: 213,
        minKb: 10,
        maxKb: 30,
        aspectRatio: 1,
    },
    {
        id: 'pan_sign',
        category: 'sign',
        title: 'PAN Card Signature',
        desc: '400 x 200 px (under 30 KB)',
        width: 400,
        height: 200,
        minKb: 10,
        maxKb: 30,
        aspectRatio: 2,
        cleanPaperDefault: true,
    },
    {
        id: 'passport_std',
        category: 'photo',
        title: 'Passport Size Photo (Standard)',
        desc: '3.5 x 4.5 cm (413 x 531 px, 30-100 KB)',
        width: 413,
        height: 531,
        minKb: 30,
        maxKb: 100,
        aspectRatio: 413 / 531,
        allowNameDate: true,
    },
    {
        id: 'custom',
        category: 'custom',
        title: 'Custom Dimensions & Size',
        desc: 'अपनी पसंद के अनुसार साइज सेट करें',
        width: 350,
        height: 450,
        minKb: 10,
        maxKb: 100,
        aspectRatio: 350 / 450,
    }
];

export default function PhotoSignatureResizer() {
    const [selectedTab, setSelectedTab] = useState('photo'); // 'photo' | 'sign' | 'custom'
    const [selectedPresetId, setSelectedPresetId] = useState('ssc_photo');

    // Canvas & Image State
    const [imageSrc, setImageSrc] = useState(null);
    const [originalDimensions, setOriginalDimensions] = useState({ width: 0, height: 0 });
    const [originalSizeKb, setOriginalSizeKb] = useState(0);

    // Edit controls
    const [targetWidth, setTargetWidth] = useState(350);
    const [targetHeight, setTargetHeight] = useState(450);
    const [minKb, setMinKb] = useState(20);
    const [maxKb, setMaxKb] = useState(50);
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [brightness, setBrightness] = useState(100);
    const [contrast, setContrast] = useState(100);
    const [cleanWhitePaper, setCleanWhitePaper] = useState(false);
    const [cleanThreshold, setCleanThreshold] = useState(180);

    // Name & Date on Photo
    const [addNameDate, setAddNameDate] = useState(false);
    const [candidateName, setCandidateName] = useState('');
    const [photoDate, setPhotoDate] = useState(() => {
        const today = new Date();
        return `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
    });

    // Processed Output
    const [outputUrl, setOutputUrl] = useState(null);
    const [outputBlob, setOutputBlob] = useState(null);
    const [outputKb, setOutputKb] = useState(0);
    const [isProcessing, setIsProcessing] = useState(false);

    // Drag-to-pan in preview
    const isDraggingRef = useRef(false);
    const dragStartRef = useRef({ x: 0, y: 0 });
    const panStartRef = useRef({ x: 0, y: 0 });

    const fileInputRef = useRef(null);
    const canvasRef = useRef(null);

    // Apply preset
    const applyPreset = (preset) => {
        setSelectedPresetId(preset.id);
        setTargetWidth(preset.width);
        setTargetHeight(preset.height);
        setMinKb(preset.minKb);
        setMaxKb(preset.maxKb);
        if (preset.cleanPaperDefault) {
            setCleanWhitePaper(true);
        } else if (preset.category === 'photo') {
            setCleanWhitePaper(false);
        }
    };

    // Handle Tab Change
    const handleTabChange = (tab) => {
        setSelectedTab(tab);
        const match = PRESETS.find(p => p.category === tab);
        if (match) {
            applyPreset(match);
        }
    };

    // Handle File Input
    const handleFile = (file) => {
        if (!file || !file.type.startsWith('image/')) {
            alert('कृपया केवल इमेज (JPG, PNG) फाइल चुनें!');
            return;
        }

        setOriginalSizeKb(Math.round(file.size / 1024));
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                setOriginalDimensions({ width: img.naturalWidth, height: img.naturalHeight });
                setImageSrc(e.target.result);
                // Reset zoom and pan
                setZoom(1);
                setPan({ x: 0, y: 0 });
                setRotation(0);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    };

    // Paste from clipboard support
    useEffect(() => {
        const handlePaste = (e) => {
            const items = e.clipboardData?.items;
            if (!items) return;
            for (let i = 0; i < items.length; i++) {
                if (items[i].type.indexOf('image') !== -1) {
                    const blob = items[i].getAsFile();
                    handleFile(blob);
                    break;
                }
            }
        };
        window.addEventListener('paste', handlePaste);
        return () => window.removeEventListener('paste', handlePaste);
    }, []);

    // Render & Compress Canvas to Target KB
    useEffect(() => {
        if (!imageSrc) return;

        let active = true;
        setIsProcessing(true);

        const timer = setTimeout(() => {
            processImage();
        }, 150);

        return () => {
            active = false;
            clearTimeout(timer);
        };
    }, [
        imageSrc,
        targetWidth,
        targetHeight,
        minKb,
        maxKb,
        zoom,
        rotation,
        pan,
        brightness,
        contrast,
        cleanWhitePaper,
        cleanThreshold,
        addNameDate,
        candidateName,
        photoDate,
    ]);

    const processImage = () => {
        const canvas = canvasRef.current || document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');

        // Fill background white
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, targetWidth, targetHeight);

        const img = new Image();
        img.onload = () => {
            ctx.save();
            // Center transformation
            ctx.translate(targetWidth / 2 + pan.x, targetHeight / 2 + pan.y);
            ctx.rotate((rotation * Math.PI) / 180);
            ctx.scale(zoom, zoom);

            // Filters
            ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;

            // Draw image centered
            const drawW = img.naturalWidth;
            const drawH = img.naturalHeight;
            // Fit aspect ratio base
            const scale = Math.max(targetWidth / drawW, targetHeight / drawH);
            const w = drawW * scale;
            const h = drawH * scale;

            ctx.drawImage(img, -w / 2, -h / 2, w, h);
            ctx.restore();

            // Paper cleaner / White background filter for signatures
            if (cleanWhitePaper) {
                const imgData = ctx.getImageData(0, 0, targetWidth, targetHeight);
                const data = imgData.data;
                const threshold = cleanThreshold;
                for (let i = 0; i < data.length; i += 4) {
                    const r = data[i];
                    const g = data[i + 1];
                    const b = data[i + 2];
                    // Grayscale luminance
                    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
                    if (lum > threshold) {
                        // Whiten background
                        data[i] = 255;
                        data[i + 1] = 255;
                        data[i + 2] = 255;
                    } else {
                        // Darken ink
                        const factor = lum / threshold;
                        data[i] = Math.round(r * factor * 0.7);
                        data[i + 1] = Math.round(g * factor * 0.7);
                        data[i + 2] = Math.round(b * factor * 0.7);
                    }
                }
                ctx.putImageData(imgData, 0, 0);
            }

            // Name and Date strip at bottom if enabled
            if (addNameDate && (candidateName.trim() || photoDate.trim())) {
                const stripHeight = Math.max(48, Math.round(targetHeight * 0.18));
                const stripY = targetHeight - stripHeight;

                // White bar
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(0, stripY, targetWidth, stripHeight);
                // Top border line
                ctx.strokeStyle = '#000000';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(0, stripY);
                ctx.lineTo(targetWidth, stripY);
                ctx.stroke();

                // Candidate Name
                ctx.fillStyle = '#000000';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                const fontSize = Math.max(12, Math.round(stripHeight * 0.34));
                ctx.font = `bold ${fontSize}px sans-serif`;

                if (candidateName.trim() && photoDate.trim()) {
                    ctx.fillText(candidateName.toUpperCase(), targetWidth / 2, stripY + stripHeight * 0.32);
                    ctx.font = `600 ${Math.max(10, fontSize - 2)}px sans-serif`;
                    ctx.fillText(`DOB / DOP: ${photoDate}`, targetWidth / 2, stripY + stripHeight * 0.72);
                } else {
                    const singleText = candidateName.trim() ? candidateName.toUpperCase() : `DOP: ${photoDate}`;
                    ctx.fillText(singleText, targetWidth / 2, stripY + stripHeight * 0.5);
                }
            }

            // Binary search / compress to target KB
            compressToTarget(canvas, minKb, maxKb);
        };
        img.src = imageSrc;
    };

    const compressToTarget = (canvas, minK, maxK) => {
        let low = 0.05;
        let high = 0.98;
        let bestBlob = null;
        let bestQuality = 0.85;

        // Try standard quality first
        canvas.toBlob((initialBlob) => {
            if (!initialBlob) {
                setIsProcessing(false);
                return;
            }

            const initialKb = initialBlob.size / 1024;
            if (initialKb <= maxK && initialKb >= minK) {
                applyBlob(initialBlob);
                return;
            }

            // Binary search 6 iterations for best fit
            const runSearch = (iterationsRemaining, qLow, qHigh) => {
                if (iterationsRemaining <= 0) {
                    applyBlob(bestBlob || initialBlob);
                    return;
                }

                const mid = (qLow + qHigh) / 2;
                canvas.toBlob((blob) => {
                    if (!blob) {
                        applyBlob(bestBlob || initialBlob);
                        return;
                    }

                    const kb = blob.size / 1024;
                    bestBlob = blob;

                    if (kb > maxK) {
                        runSearch(iterationsRemaining - 1, qLow, mid);
                    } else if (kb < minK) {
                        runSearch(iterationsRemaining - 1, mid, qHigh);
                    } else {
                        // Perfect match inside range
                        applyBlob(blob);
                    }
                }, 'image/jpeg', mid);
            };

            runSearch(6, low, high);
        }, 'image/jpeg', 0.85);
    };

    const applyBlob = (blob) => {
        if (!blob) {
            setIsProcessing(false);
            return;
        }
        if (outputUrl) {
            URL.revokeObjectURL(outputUrl);
        }
        const url = URL.createObjectURL(blob);
        setOutputBlob(blob);
        setOutputUrl(url);
        setOutputKb(Math.round((blob.size / 1024) * 10) / 10);
        setIsProcessing(false);
    };

    // Mouse Drag on Preview to Pan
    const handleMouseDown = (e) => {
        isDraggingRef.current = true;
        dragStartRef.current = { x: e.clientX, y: e.clientY };
        panStartRef.current = { ...pan };
    };

    const handleMouseMove = (e) => {
        if (!isDraggingRef.current) return;
        const dx = e.clientX - dragStartRef.current.x;
        const dy = e.clientY - dragStartRef.current.y;
        setPan({
            x: panStartRef.current.x + dx,
            y: panStartRef.current.y + dy,
        });
    };

    const handleMouseUp = () => {
        isDraggingRef.current = false;
    };

    // Download action
    const handleDownload = () => {
        if (!outputUrl) return;
        const a = document.createElement('a');
        a.href = outputUrl;
        const safeName = candidateName.trim() ? candidateName.toLowerCase().replace(/\s+/g, '_') : 'sarkari';
        a.download = `${selectedPresetId}_${safeName}_${Math.round(outputKb)}kb.jpg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    return (
        <AdminLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-blue-600 text-2xl">crop</span>
                            <h1 className="text-xl font-black text-slate-800 dark:text-white leading-tight">
                                Sarkari Photo & Signature Resizer
                            </h1>
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                                100% Free & Accurate
                            </span>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                            SSC, HSSC, UPSC, NTA, Railway और सभी सरकारी फॉर्म्स के लिए सटीक साइज़ और KB में फोटो/साइन बनाएं
                        </p>
                    </div>

                    {outputUrl && (
                        <button
                            onClick={handleDownload}
                            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 text-sm transition-all transform active:scale-95 cursor-pointer"
                        >
                            <span className="material-symbols-outlined text-xl">download</span>
                            Download Image ({outputKb} KB)
                        </button>
                    )}
                </div>
            }
        >
            <Head title="Sarkari Photo & Signature Resizer" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
                {/* Category Selection Tabs */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-2 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap gap-2">
                    <button
                        type="button"
                        onClick={() => handleTabChange('photo')}
                        className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all cursor-pointer ${
                            selectedTab === 'photo'
                                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                    >
                        <span className="material-symbols-outlined text-xl">account_box</span>
                        Photo Resizer (फोटो)
                    </button>
                    <button
                        type="button"
                        onClick={() => handleTabChange('sign')}
                        className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all cursor-pointer ${
                            selectedTab === 'sign'
                                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                    >
                        <span className="material-symbols-outlined text-xl">draw</span>
                        Signature Resizer (हस्ताक्षर)
                    </button>
                    <button
                        type="button"
                        onClick={() => handleTabChange('custom')}
                        className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all cursor-pointer ${
                            selectedTab === 'custom'
                                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                    >
                        <span className="material-symbols-outlined text-xl">tune</span>
                        Custom Dimensions (कस्टम)
                    </button>
                </div>

                {/* Presets Row */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                    {PRESETS.filter(p => selectedTab === 'custom' ? true : p.category === selectedTab).map((preset) => {
                        const isSelected = selectedPresetId === preset.id;
                        return (
                            <button
                                key={preset.id}
                                type="button"
                                onClick={() => applyPreset(preset)}
                                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                                    isSelected
                                        ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-500 ring-2 ring-blue-500/30 text-blue-900 dark:text-blue-100 shadow-sm'
                                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-700 dark:text-slate-300'
                                }`}
                            >
                                <div className="font-bold text-xs sm:text-sm truncate">{preset.title}</div>
                                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{preset.desc}</div>
                                {isSelected && (
                                    <span className="material-symbols-outlined text-blue-600 text-base absolute top-2 right-2">
                                        check_circle
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Main Workspace: Left Controls + Right Live Canvas */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left: Controls & Upload */}
                    <div className="lg:col-span-6 space-y-6">
                        {/* File Upload Box */}
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => {
                                e.preventDefault();
                                if (e.dataTransfer.files?.[0]) {
                                    handleFile(e.dataTransfer.files[0]);
                                }
                            }}
                            className="bg-white dark:bg-slate-900 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 rounded-2xl p-6 text-center cursor-pointer transition-colors group"
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => handleFile(e.target.files?.[0])}
                            />
                            <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform mb-3">
                                <span className="material-symbols-outlined text-3xl">add_photo_alternate</span>
                            </div>
                            <h3 className="font-bold text-slate-800 dark:text-white text-base">
                                फोटो या साइन चुनें / Drag & Drop करें
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                या स्क्रीनशॉट लेकर यहाँ <strong>Ctrl + V</strong> दबाएं
                            </p>

                            {originalDimensions.width > 0 && (
                                <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-xs font-semibold text-slate-600 dark:text-slate-300">
                                    <span>Original: {originalDimensions.width} x {originalDimensions.height} px</span>
                                    <span>•</span>
                                    <span>{originalSizeKb} KB</span>
                                </div>
                            )}
                        </div>

                        {/* Adjustments & Fine Tuning */}
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-5">
                            <h3 className="font-bold text-slate-800 dark:text-white text-sm flex items-center gap-2">
                                <span className="material-symbols-outlined text-blue-600 text-lg">tune</span>
                                इमेज साइज व क्वालिटी एडजस्टमेंट
                            </h3>

                            {/* Dimensions & KB Setting */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                                <div>
                                    <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                                        चौड़ाई (Width px)
                                    </label>
                                    <input
                                        type="number"
                                        value={targetWidth}
                                        onChange={(e) => setTargetWidth(Number(e.target.value))}
                                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-bold"
                                    />
                                </div>
                                <div>
                                    <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                                        ऊंचाई (Height px)
                                    </label>
                                    <input
                                        type="number"
                                        value={targetHeight}
                                        onChange={(e) => setTargetHeight(Number(e.target.value))}
                                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-bold"
                                    />
                                </div>
                                <div>
                                    <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                                        Min KB
                                    </label>
                                    <input
                                        type="number"
                                        value={minKb}
                                        onChange={(e) => setMinKb(Number(e.target.value))}
                                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-bold"
                                    />
                                </div>
                                <div>
                                    <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                                        Max KB
                                    </label>
                                    <input
                                        type="number"
                                        value={maxKb}
                                        onChange={(e) => setMaxKb(Number(e.target.value))}
                                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-bold"
                                    />
                                </div>
                            </div>

                            {/* Zoom & Rotation */}
                            <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                                <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                                    <span>Zoom ({Math.round(zoom * 100)}%)</span>
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setRotation((r) => (r - 90) % 360)}
                                            className="px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-300 flex items-center gap-1 cursor-pointer"
                                            title="Rotate Left 90°"
                                        >
                                            <span className="material-symbols-outlined text-sm">rotate_left</span>
                                            -90°
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setRotation((r) => (r + 90) % 360)}
                                            className="px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-300 flex items-center gap-1 cursor-pointer"
                                            title="Rotate Right 90°"
                                        >
                                            <span className="material-symbols-outlined text-sm">rotate_right</span>
                                            +90°
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setZoom(1);
                                                setPan({ x: 0, y: 0 });
                                                setRotation(0);
                                            }}
                                            className="px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-300 flex items-center gap-1 cursor-pointer"
                                        >
                                            <span className="material-symbols-outlined text-sm">restart_alt</span>
                                            Reset
                                        </button>
                                    </div>
                                </div>
                                <input
                                    type="range"
                                    min="0.4"
                                    max="3.0"
                                    step="0.05"
                                    value={zoom}
                                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                                    className="w-full accent-blue-600 cursor-pointer"
                                />
                                <p className="text-[11px] text-slate-400">
                                    💡 <em>दाएं तरफ फोटो को पकड़कर ड्रैग (Drag) करके बीच में सेट कर सकते हैं।</em>
                                </p>
                            </div>

                            {/* White Background & Paper Cleaner for Signature */}
                            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
                                <label className="flex items-center justify-between cursor-pointer">
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-amber-500">auto_fix_high</span>
                                        <div>
                                            <span className="text-xs font-bold text-slate-800 dark:text-white">
                                                White Paper & Dark Ink Booster (कागज़ साफ करें)
                                            </span>
                                            <p className="text-[11px] text-slate-500">
                                                हस्ताक्षर के पीछे की पीली/धुंधली छाया हटाकर साफ सफेद बैकग्राउंड बनाता है
                                            </p>
                                        </div>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={cleanWhitePaper}
                                        onChange={(e) => setCleanWhitePaper(e.target.checked)}
                                        className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                                    />
                                </label>

                                {cleanWhitePaper && (
                                    <div className="pl-6 space-y-2">
                                        <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                                            <span>सफेदी थ्रेशोल्ड (Threshold): {cleanThreshold}</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="100"
                                            max="240"
                                            value={cleanThreshold}
                                            onChange={(e) => setCleanThreshold(Number(e.target.value))}
                                            className="w-full accent-amber-500 cursor-pointer"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Candidate Name & Date Strip (Only on Photo Mode) */}
                            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
                                <label className="flex items-center justify-between cursor-pointer">
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-indigo-500">badge</span>
                                        <div>
                                            <span className="text-xs font-bold text-slate-800 dark:text-white">
                                                Add Name & Date on Photo (नाम व तारीख पट्टी)
                                            </span>
                                            <p className="text-[11px] text-slate-500">
                                                SSC और सरकारी फॉर्म नियमों के अनुसार फोटो के नीचे उम्मीदवार का नाम व तारीख लिखें
                                            </p>
                                        </div>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={addNameDate}
                                        onChange={(e) => setAddNameDate(e.target.checked)}
                                        className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                    />
                                </label>

                                {addNameDate && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-6">
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                                                उम्मीदवार का नाम (Candidate Name)
                                            </label>
                                            <input
                                                type="text"
                                                value={candidateName}
                                                onChange={(e) => setCandidateName(e.target.value)}
                                                placeholder="e.g. AMIT KUMAR"
                                                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                                                फोटो की तारीख (Date of Photo)
                                            </label>
                                            <input
                                                type="text"
                                                value={photoDate}
                                                onChange={(e) => setPhotoDate(e.target.value)}
                                                placeholder="DD/MM/YYYY"
                                                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right: Live Interactive Canvas & Download */}
                    <div className="lg:col-span-6 space-y-4">
                        <div className="bg-slate-100 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col items-center justify-center min-h-[460px] relative overflow-hidden">
                            {/* Target size badge */}
                            <div className="absolute top-4 left-4 z-10 flex flex-wrap gap-2">
                                <span className="px-3 py-1 bg-white/90 dark:bg-slate-800/90 backdrop-blur rounded-full text-xs font-bold text-slate-700 dark:text-slate-200 shadow-sm border border-slate-200/50 dark:border-slate-700/50">
                                    Target: {targetWidth} × {targetHeight} px
                                </span>
                                <span className="px-3 py-1 bg-white/90 dark:bg-slate-800/90 backdrop-blur rounded-full text-xs font-bold text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200/50 dark:border-slate-700/50">
                                    Limit: {minKb} - {maxKb} KB
                                </span>
                            </div>

                            {/* Live Result Size Badge */}
                            {outputKb > 0 && (
                                <div className="absolute top-4 right-4 z-10">
                                    <span className={`px-3 py-1 rounded-full text-xs font-black shadow-sm flex items-center gap-1 ${
                                        outputKb <= maxKb && outputKb >= minKb
                                            ? 'bg-emerald-500 text-white'
                                            : 'bg-amber-500 text-white'
                                    }`}>
                                        <span className="material-symbols-outlined text-sm">
                                            {outputKb <= maxKb && outputKb >= minKb ? 'check_circle' : 'warning'}
                                        </span>
                                        Size: {outputKb} KB
                                    </span>
                                </div>
                            )}

                            {imageSrc ? (
                                <div
                                    className="relative cursor-move select-none shadow-2xl rounded-lg overflow-hidden border-2 border-white dark:border-slate-700 max-w-full max-h-[400px] flex items-center justify-center bg-white"
                                    onMouseDown={handleMouseDown}
                                    onMouseMove={handleMouseMove}
                                    onMouseUp={handleMouseUp}
                                    onMouseLeave={handleMouseUp}
                                    style={{
                                        aspectRatio: `${targetWidth} / ${targetHeight}`,
                                        width: targetWidth > targetHeight ? '90%' : 'auto',
                                        height: targetHeight >= targetWidth ? '380px' : 'auto',
                                    }}
                                >
                                    {outputUrl ? (
                                        <img
                                            src={outputUrl}
                                            alt="Processed preview"
                                            className="w-full h-full object-contain pointer-events-none"
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center text-slate-400 text-xs">
                                            Processing...
                                        </div>
                                    )}

                                    {isProcessing && (
                                        <div className="absolute inset-0 bg-white/40 dark:bg-slate-900/40 backdrop-blur-[1px] flex items-center justify-center">
                                            <span className="material-symbols-outlined animate-spin text-blue-600 text-3xl">
                                                progress_activity
                                            </span>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-12 px-4 space-y-3">
                                    <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800 mx-auto flex items-center justify-center text-slate-400">
                                        <span className="material-symbols-outlined text-3xl">image</span>
                                    </div>
                                    <p className="font-bold text-slate-600 dark:text-slate-300 text-sm">
                                        यहाँ कोई इमेज अपलोड नहीं है
                                    </p>
                                    <p className="text-xs text-slate-400 max-w-xs">
                                        बाईं ओर से फोटो या हस्ताक्षर अपलोड करें, तुरंत लाइव प्रिव्यू और सटीक साइज़ दिखेगा।
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Action Buttons */}
                        {outputUrl && (
                            <div className="flex flex-col sm:flex-row gap-3">
                                <button
                                    type="button"
                                    onClick={handleDownload}
                                    className="flex-1 py-3.5 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow-lg shadow-emerald-600/20 text-center transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
                                >
                                    <span className="material-symbols-outlined text-xl">download</span>
                                    JPG डाउनलोड करें ({outputKb} KB)
                                </button>
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="py-3.5 px-5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-center text-sm cursor-pointer"
                                >
                                    नई फोटो चुनें
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
