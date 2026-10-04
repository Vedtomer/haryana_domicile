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

    // Helper to format date in DD/MM/YYYY
    const getFormattedDate = (d = new Date()) => {
        return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
    };

    // Name & Date on Photo Controls (DOB, DOP, Name)
    const [addNameDate, setAddNameDate] = useState(false);
    // Mark checkboxes
    const [showName, setShowName] = useState(true);
    const [showDop, setShowDop] = useState(true); // Date of Photo
    const [showDob, setShowDob] = useState(false); // Date of Birth
    // Values
    const [candidateName, setCandidateName] = useState('');
    const [dopDate, setDopDate] = useState(() => getFormattedDate());
    const [dobDate, setDobDate] = useState('');
    // Formatting & layout
    const [showDopPrefix, setShowDopPrefix] = useState(true);
    const [showDobPrefix, setShowDobPrefix] = useState(true);
    const [stripTheme, setStripTheme] = useState('white'); // 'white' | 'black'
    const [combineDates, setCombineDates] = useState(false);

    // A4 Sheet Maker State
    const [a4Count, setA4Count] = useState(6);
    const [a4HasBorder, setA4HasBorder] = useState(true);
    const [a4Gap, setA4Gap] = useState(3); // mm
    const [a4PreviewUrl, setA4PreviewUrl] = useState(null);
    const [isGeneratingA4, setIsGeneratingA4] = useState(false);

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
        showName,
        showDop,
        showDob,
        candidateName,
        dopDate,
        dobDate,
        showDopPrefix,
        showDobPrefix,
        stripTheme,
        combineDates,
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

            // Name, DOB, DOP strip at bottom if enabled
            if (addNameDate) {
                const linesToPrint = [];

                if (showName && candidateName.trim()) {
                    linesToPrint.push({
                        text: candidateName.trim().toUpperCase(),
                        isName: true,
                    });
                }

                if (showDob && dobDate.trim() && showDop && dopDate.trim() && combineDates) {
                    const dobStr = showDobPrefix ? `DOB: ${dobDate.trim()}` : dobDate.trim();
                    const dopStr = showDopPrefix ? `DOP: ${dopDate.trim()}` : dopDate.trim();
                    linesToPrint.push({
                        text: `${dobStr}  |  ${dopStr}`,
                        isName: false,
                    });
                } else {
                    if (showDob && dobDate.trim()) {
                        const dobStr = showDobPrefix ? `DOB: ${dobDate.trim()}` : dobDate.trim();
                        linesToPrint.push({
                            text: dobStr,
                            isName: false,
                        });
                    }
                    if (showDop && dopDate.trim()) {
                        const dopStr = showDopPrefix ? `DOP: ${dopDate.trim()}` : dopDate.trim();
                        linesToPrint.push({
                            text: dopStr,
                            isName: false,
                        });
                    }
                }

                if (linesToPrint.length > 0) {
                    const lineCount = linesToPrint.length;
                    const heightMultiplier = lineCount === 1 ? 0.13 : (lineCount === 2 ? 0.18 : 0.24);
                    const stripHeight = Math.max(lineCount * 22 + 10, Math.round(targetHeight * heightMultiplier));
                    const stripY = targetHeight - stripHeight;

                    // Strip background (White or Black)
                    const isDark = stripTheme === 'black';
                    ctx.fillStyle = isDark ? '#000000' : '#FFFFFF';
                    ctx.fillRect(0, stripY, targetWidth, stripHeight);

                    // Top border line
                    ctx.strokeStyle = isDark ? '#FFFFFF' : '#000000';
                    ctx.lineWidth = Math.max(1.5, Math.round(targetHeight / 300));
                    ctx.beginPath();
                    ctx.moveTo(0, stripY);
                    ctx.lineTo(targetWidth, stripY);
                    ctx.stroke();

                    // Text styling
                    ctx.fillStyle = isDark ? '#FFFFFF' : '#000000';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';

                    const baseFontSize = Math.max(10, Math.round((stripHeight / (lineCount + 0.6)) * 0.72));

                    linesToPrint.forEach((line, idx) => {
                        const yPos = stripY + (stripHeight * (idx + 0.55)) / lineCount;
                        const fontSize = line.isName ? Math.round(baseFontSize * 1.05) : Math.round(baseFontSize * 0.9);
                        const fontWeight = line.isName ? 'bold' : '600';
                        ctx.font = `${fontWeight} ${fontSize}px sans-serif`;
                        ctx.fillText(line.text, targetWidth / 2, yPos);
                    });
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

    // Generate A4 Canvas (2480 x 3508 px at 300 DPI, 6 photos per row)
    const generateA4Canvas = (imageElement, count, options = {}) => {
        const {
            hasBorder = true,
            gapMm = 3,
            marginMm = 7,
        } = options;

        const canvas = document.createElement('canvas');
        const a4Width = 2480;
        const a4Height = 3508;
        canvas.width = a4Width;
        canvas.height = a4Height;

        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, a4Width, a4Height);

        if (!imageElement) return canvas;

        const cols = 6;
        const pxPerMm = 11.811;
        const marginX = Math.round(marginMm * pxPerMm);
        const gapX = Math.round(gapMm * pxPerMm);
        const gapY = Math.round((gapMm + 1.5) * pxPerMm);
        const marginY = Math.round(marginMm * pxPerMm);

        const availableWidth = a4Width - (2 * marginX) - ((cols - 1) * gapX);
        const photoWidth = Math.round(availableWidth / cols);

        const ratio = (targetHeight && targetWidth) ? (targetHeight / targetWidth) : (450 / 350);
        const photoHeight = Math.round(photoWidth * ratio);

        for (let i = 0; i < count; i++) {
            const col = i % cols;
            const row = Math.floor(i / cols);

            const x = marginX + col * (photoWidth + gapX);
            const y = marginY + row * (photoHeight + gapY);

            ctx.drawImage(imageElement, x, y, photoWidth, photoHeight);

            if (hasBorder) {
                ctx.strokeStyle = '#94A3B8';
                ctx.lineWidth = 1.5;
                ctx.strokeRect(x, y, photoWidth, photoHeight);
            }
        }

        return canvas;
    };

    // Live Generate A4 Sheet Preview
    useEffect(() => {
        if (!outputUrl) return;

        let active = true;
        setIsGeneratingA4(true);

        const img = new Image();
        img.onload = () => {
            if (!active) return;
            const canvas = generateA4Canvas(img, a4Count, {
                hasBorder: a4HasBorder,
                gapMm: a4Gap,
                marginMm: 7,
            });
            canvas.toBlob((blob) => {
                if (!active || !blob) return;
                const url = URL.createObjectURL(blob);
                setA4PreviewUrl((prev) => {
                    if (prev) URL.revokeObjectURL(prev);
                    return url;
                });
                setIsGeneratingA4(false);
            }, 'image/jpeg', 0.92);
        };
        img.src = outputUrl;

        return () => {
            active = false;
        };
    }, [a4Count, a4HasBorder, a4Gap, outputUrl, targetWidth, targetHeight]);

    // Download A4 Sheet Image
    const handleDownloadA4 = () => {
        if (!outputUrl) return;
        const img = new Image();
        img.onload = () => {
            const canvas = generateA4Canvas(img, a4Count, {
                hasBorder: a4HasBorder,
                gapMm: a4Gap,
                marginMm: 7,
            });
            const safeName = candidateName.trim() ? candidateName.toLowerCase().replace(/\s+/g, '_') : 'passport';
            const a = document.createElement('a');
            a.download = `A4_Sheet_${a4Count}_Photos_${safeName}.jpg`;
            a.href = canvas.toDataURL('image/jpeg', 0.95);
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        };
        img.src = outputUrl;
    };

    // Direct Print A4 Sheet
    const handlePrintA4 = () => {
        if (!a4PreviewUrl) return;
        window.print();
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
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => document.getElementById('a4-sheet-studio')?.scrollIntoView({ behavior: 'smooth' })}
                                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 text-xs sm:text-sm transition-all cursor-pointer"
                            >
                                <span className="material-symbols-outlined text-lg">print</span>
                                🖨️ A4 शीट (6 फोटो/लाइन)
                            </button>
                            <button
                                onClick={handleDownload}
                                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 text-sm transition-all transform active:scale-95 cursor-pointer"
                            >
                                <span className="material-symbols-outlined text-xl">download</span>
                                Single ({outputKb} KB)
                            </button>
                        </div>
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

                            {/* Candidate Name, DOB & DOP Strip (Only on Photo Mode) */}
                            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
                                <label className="flex items-center justify-between cursor-pointer">
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-indigo-500">badge</span>
                                        <div>
                                            <span className="text-xs font-bold text-slate-800 dark:text-white">
                                                Add Name, DOB & DOP on Photo (फोटो पर नाम, DOB या DOP पट्टी)
                                            </span>
                                            <p className="text-[11px] text-slate-500">
                                                SSC, HSSC, Police, Railway व सरकारी फॉर्म नियमों के अनुसार नाम, जन्म तिथि (DOB) या फोटो की तारीख (DOP) जोड़ें
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
                                    <div className="space-y-3.5 bg-slate-50/80 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/80">
                                        {/* Quick Preset Buttons */}
                                        <div>
                                            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                                                <span className="material-symbols-outlined text-xs text-amber-500">bolt</span>
                                                Quick Presets (एक-क्लिक में चुनें):
                                            </div>
                                            <div className="flex flex-wrap gap-1.5">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setShowName(true);
                                                        setShowDop(true);
                                                        setShowDob(false);
                                                        setShowDopPrefix(true);
                                                    }}
                                                    className={`px-2.5 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                                                        showName && showDop && !showDob
                                                            ? 'bg-indigo-600 text-white shadow-xs'
                                                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-indigo-400'
                                                    }`}
                                                >
                                                    <span>Name + DOP (SSC/Police)</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setShowName(true);
                                                        setShowDob(true);
                                                        setShowDop(false);
                                                        setShowDobPrefix(true);
                                                    }}
                                                    className={`px-2.5 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                                                        showName && showDob && !showDop
                                                            ? 'bg-indigo-600 text-white shadow-xs'
                                                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-indigo-400'
                                                    }`}
                                                >
                                                    <span>Name + DOB (State/Board)</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setShowName(false);
                                                        setShowDop(true);
                                                        setShowDob(false);
                                                        setShowDopPrefix(true);
                                                    }}
                                                    className={`px-2.5 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                                                        !showName && showDop && !showDob
                                                            ? 'bg-indigo-600 text-white shadow-xs'
                                                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-indigo-400'
                                                    }`}
                                                >
                                                    <span>Only DOP</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setShowName(false);
                                                        setShowDob(true);
                                                        setShowDop(false);
                                                        setShowDobPrefix(true);
                                                    }}
                                                    className={`px-2.5 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                                                        !showName && !showDop && showDob
                                                            ? 'bg-indigo-600 text-white shadow-xs'
                                                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-indigo-400'
                                                    }`}
                                                >
                                                    <span>Only DOB</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setShowName(true);
                                                        setShowDob(true);
                                                        setShowDop(true);
                                                        setShowDopPrefix(true);
                                                        setShowDobPrefix(true);
                                                    }}
                                                    className={`px-2.5 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                                                        showName && showDop && showDob
                                                            ? 'bg-indigo-600 text-white shadow-xs'
                                                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-indigo-400'
                                                    }`}
                                                >
                                                    <span>Name + DOB + DOP (All)</span>
                                                </button>
                                            </div>
                                        </div>

                                        {/* Checkbox Options ("mark krke jo jo krna hai") */}
                                        <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-700/80">
                                            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                                Select Details to Print (मार्क करें जो जो जोड़ना है):
                                            </div>

                                            {/* 1. Candidate Name */}
                                            <div className={`p-3 rounded-xl border transition ${
                                                showName
                                                    ? 'bg-white dark:bg-slate-800/90 border-indigo-300 dark:border-indigo-700 shadow-2xs'
                                                    : 'bg-slate-100/60 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-70'
                                            }`}>
                                                <label className="flex items-center gap-2 cursor-pointer font-bold text-xs text-slate-800 dark:text-white">
                                                    <input
                                                        type="checkbox"
                                                        checked={showName}
                                                        onChange={(e) => setShowName(e.target.checked)}
                                                        className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                                    />
                                                    <span>उम्मीदवार का नाम (Candidate Name)</span>
                                                    {showName && <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 font-bold">सक्रिय</span>}
                                                </label>
                                                {showName && (
                                                    <div className="mt-2 pl-6">
                                                        <input
                                                            type="text"
                                                            value={candidateName}
                                                            onChange={(e) => setCandidateName(e.target.value)}
                                                            placeholder="e.g. AMIT KUMAR"
                                                            className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold uppercase"
                                                        />
                                                    </div>
                                                )}
                                            </div>

                                            {/* 2. Date of Photo (DOP) */}
                                            <div className={`p-3 rounded-xl border transition ${
                                                showDop
                                                    ? 'bg-white dark:bg-slate-800/90 border-indigo-300 dark:border-indigo-700 shadow-2xs'
                                                    : 'bg-slate-100/60 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-70'
                                            }`}>
                                                <div className="flex items-center justify-between">
                                                    <label className="flex items-center gap-2 cursor-pointer font-bold text-xs text-slate-800 dark:text-white">
                                                        <input
                                                            type="checkbox"
                                                            checked={showDop}
                                                            onChange={(e) => setShowDop(e.target.checked)}
                                                            className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                                        />
                                                        <span>Date of Photo (DOP - फोटो खींचने की तारीख)</span>
                                                        {showDop && <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 font-bold">DOP</span>}
                                                    </label>
                                                    {showDop && (
                                                        <button
                                                            type="button"
                                                            onClick={() => setDopDate(getFormattedDate())}
                                                            className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5 cursor-pointer"
                                                            title="आज की तारीख सेट करें"
                                                        >
                                                            <span className="material-symbols-outlined text-xs">today</span>
                                                            Today (आज)
                                                        </button>
                                                    )}
                                                </div>
                                                {showDop && (
                                                    <div className="mt-2 pl-6 space-y-2">
                                                        <input
                                                            type="text"
                                                            value={dopDate}
                                                            onChange={(e) => setDopDate(e.target.value)}
                                                            placeholder="DD/MM/YYYY (e.g. 04/10/2026)"
                                                            className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold font-mono"
                                                        />
                                                        <label className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-400 cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                checked={showDopPrefix}
                                                                onChange={(e) => setShowDopPrefix(e.target.checked)}
                                                                className="w-3.5 h-3.5 rounded text-indigo-600 cursor-pointer"
                                                            />
                                                            <span>'DOP:' प्रिफिक्स लगाएं (जैसे: <strong>DOP: {dopDate || '04/10/2026'}</strong>)</span>
                                                        </label>
                                                    </div>
                                                )}
                                            </div>

                                            {/* 3. Date of Birth (DOB) */}
                                            <div className={`p-3 rounded-xl border transition ${
                                                showDob
                                                    ? 'bg-white dark:bg-slate-800/90 border-indigo-300 dark:border-indigo-700 shadow-2xs'
                                                    : 'bg-slate-100/60 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-70'
                                            }`}>
                                                <label className="flex items-center gap-2 cursor-pointer font-bold text-xs text-slate-800 dark:text-white">
                                                    <input
                                                        type="checkbox"
                                                        checked={showDob}
                                                        onChange={(e) => setShowDob(e.target.checked)}
                                                        className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                                    />
                                                    <span>Date of Birth (DOB - जन्म तिथि)</span>
                                                    {showDob && <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-50 dark:bg-amber-950/80 text-amber-600 font-bold">DOB</span>}
                                                </label>
                                                {showDob && (
                                                    <div className="mt-2 pl-6 space-y-2">
                                                        <input
                                                            type="text"
                                                            value={dobDate}
                                                            onChange={(e) => setDobDate(e.target.value)}
                                                            placeholder="DD/MM/YYYY (e.g. 15/08/2000)"
                                                            className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold font-mono"
                                                        />
                                                        <label className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-400 cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                checked={showDobPrefix}
                                                                onChange={(e) => setShowDobPrefix(e.target.checked)}
                                                                className="w-3.5 h-3.5 rounded text-indigo-600 cursor-pointer"
                                                            />
                                                            <span>'DOB:' प्रिफिक्स लगाएं (जैसे: <strong>DOB: {dobDate || '15/08/2000'}</strong>)</span>
                                                        </label>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Options when both DOB & DOP are enabled */}
                                            {showDob && showDop && (
                                                <div className="pl-2">
                                                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={combineDates}
                                                            onChange={(e) => setCombineDates(e.target.checked)}
                                                            className="w-4 h-4 rounded text-indigo-600 cursor-pointer"
                                                        />
                                                        <span>DOB और DOP दोनों को एक ही लाइन में रखें (DOB: ... | DOP: ...)</span>
                                                    </label>
                                                </div>
                                            )}

                                            {/* Strip Theme Selection */}
                                            <div className="pt-2 border-t border-slate-200 dark:border-slate-700/80 flex items-center justify-between text-xs">
                                                <span className="font-bold text-slate-700 dark:text-slate-300">पट्टी का रंग (Strip Theme):</span>
                                                <div className="flex gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => setStripTheme('white')}
                                                        className={`px-2.5 py-1 rounded-lg font-bold border transition cursor-pointer flex items-center gap-1.5 ${
                                                            stripTheme === 'white'
                                                                ? 'bg-white text-slate-900 border-indigo-600 ring-2 ring-indigo-500/20 shadow-xs'
                                                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700'
                                                        }`}
                                                    >
                                                        <span className="w-2.5 h-2.5 rounded-full bg-white border border-slate-400"></span>
                                                        सफेद पट्टी
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setStripTheme('black')}
                                                        className={`px-2.5 py-1 rounded-lg font-bold border transition cursor-pointer flex items-center gap-1.5 ${
                                                            stripTheme === 'black'
                                                                ? 'bg-slate-900 text-white border-indigo-500 ring-2 ring-indigo-500/20 shadow-xs'
                                                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700'
                                                        }`}
                                                    >
                                                        <span className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-600"></span>
                                                        काली पट्टी
                                                    </button>
                                                </div>
                                            </div>
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

                        {/* Action Buttons & Direct A4 Sheet Studio */}
                        {outputUrl && (
                            <div className="space-y-4">
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <button
                                        type="button"
                                        onClick={handleDownload}
                                        className="flex-1 py-3.5 px-5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow-lg shadow-emerald-600/20 text-center transition-all flex items-center justify-center gap-2 cursor-pointer text-xs sm:text-sm"
                                    >
                                        <span className="material-symbols-outlined text-xl">download</span>
                                        सिंगल फोटो डाउनलोड ({outputKb} KB)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="py-3.5 px-5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-center text-xs cursor-pointer transition flex items-center justify-center gap-1.5"
                                    >
                                        <span className="material-symbols-outlined text-lg">refresh</span>
                                        नई फोटो बदलें
                                    </button>
                                </div>

                                {/* Direct Outside 6-Line A4 Sheet Studio */}
                                <div id="a4-sheet-studio" className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-indigo-200 dark:border-indigo-900/60 p-4 sm:p-5 shadow-xl space-y-4">
                                    {/* Header */}
                                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/30">
                                                <span className="material-symbols-outlined text-xl">grid_view</span>
                                            </div>
                                            <div>
                                                <h3 className="font-black text-sm sm:text-base text-slate-900 dark:text-white leading-tight">
                                                    A4 पासपोर्ट फोटो शीट प्रिंटर (A4 Sheet Maker)
                                                </h3>
                                                <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
                                                    ऊपर 6 फोटो प्रति लाइन • सीधा प्रिंट निकालें या A4 शीट JPG डाउनलोड करें
                                                </p>
                                            </div>
                                        </div>
                                        <span className="px-2.5 py-1 rounded-full text-xs font-black bg-indigo-100 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 shrink-0">
                                            {a4Count} फोटो ({Math.ceil(a4Count / 6)} लाइन)
                                        </span>
                                    </div>

                                    {/* 6 Line Preset Buttons (1 Line to 6 Lines) */}
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                                                <span className="material-symbols-outlined text-base text-indigo-600">view_week</span>
                                                लाइन चुनें (Quick Line Presets):
                                            </span>
                                            <span className="text-[11px] font-semibold text-slate-400">
                                                1 लाइन = 6 फोटो
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 sm:gap-2">
                                            {[
                                                { count: 6, line: '1 लाइन', qty: '6 फोटो' },
                                                { count: 12, line: '2 लाइन', qty: '12 फोटो' },
                                                { count: 18, line: '3 लाइन', qty: '18 फोटो' },
                                                { count: 24, line: '4 लाइन', qty: '24 फोटो' },
                                                { count: 30, line: '5 लाइन', qty: '30 फोटो' },
                                                { count: 36, line: '6 लाइन', qty: '36 फोटो (फुल)' },
                                            ].map((p) => {
                                                const isSelected = a4Count === p.count;
                                                return (
                                                    <button
                                                        key={p.count}
                                                        type="button"
                                                        onClick={() => setA4Count(p.count)}
                                                        className={`p-2 rounded-xl text-center transition cursor-pointer border ${
                                                            isSelected
                                                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/30 ring-2 ring-indigo-500/30'
                                                                : 'bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-400'
                                                        }`}
                                                    >
                                                        <div className="font-black text-xs">{p.line}</div>
                                                        <div className={`text-[10px] ${isSelected ? 'text-indigo-100' : 'text-slate-500 dark:text-slate-400'}`}>
                                                            {p.qty}
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Quantity Counter + Cutting Border & Gap */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                                        {/* Fine-tune Counter */}
                                        <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-2">
                                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                                                कस्टम फोटो संख्या (1 से 36):
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => setA4Count((c) => Math.max(1, c - 1))}
                                                    className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-black text-base text-slate-700 dark:text-slate-200 hover:bg-slate-100 flex items-center justify-center cursor-pointer shadow-2xs"
                                                >
                                                    −
                                                </button>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max="36"
                                                    value={a4Count}
                                                    onChange={(e) => {
                                                        const val = parseInt(e.target.value) || 1;
                                                        setA4Count(Math.max(1, Math.min(36, val)));
                                                    }}
                                                    className="flex-1 py-1.5 text-center font-black text-lg bg-white dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setA4Count((c) => Math.min(36, c + 1))}
                                                    className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-black text-base text-slate-700 dark:text-slate-200 hover:bg-slate-100 flex items-center justify-center cursor-pointer shadow-2xs"
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>

                                        {/* Border & Gap */}
                                        <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-2">
                                            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800 dark:text-white">
                                                <input
                                                    type="checkbox"
                                                    checked={a4HasBorder}
                                                    onChange={(e) => setA4HasBorder(e.target.checked)}
                                                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                                />
                                                <span>कटिंग बॉर्डर लाइन (Cutting Border)</span>
                                            </label>
                                            <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200 dark:border-slate-700/80">
                                                <span className="font-semibold text-slate-600 dark:text-slate-400">दूरी (Gap):</span>
                                                <div className="flex gap-1">
                                                    {[
                                                        { gap: 2, label: '2mm' },
                                                        { gap: 3, label: '3mm' },
                                                        { gap: 4, label: '4mm' },
                                                    ].map((g) => (
                                                        <button
                                                            key={g.gap}
                                                            type="button"
                                                            onClick={() => setA4Gap(g.gap)}
                                                            className={`px-2 py-0.5 rounded-lg text-[11px] font-bold border transition cursor-pointer ${
                                                                a4Gap === g.gap
                                                                    ? 'bg-indigo-600 text-white border-indigo-600'
                                                                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                                                            }`}
                                                        >
                                                            {g.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Live A4 Sheet Preview & Direct Print / Download Buttons */}
                                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center bg-slate-100 dark:bg-slate-950/80 rounded-2xl p-4 border border-slate-200 dark:border-slate-800">
                                        {/* A4 Sheet Realistic Thumbnail */}
                                        <div className="sm:col-span-5 flex flex-col items-center justify-center">
                                            <div className="w-full max-w-[180px] sm:max-w-[190px] bg-white rounded-lg shadow-xl border border-slate-300 dark:border-slate-700 overflow-hidden relative" style={{ aspectRatio: '210 / 297' }}>
                                                {isGeneratingA4 ? (
                                                    <div className="absolute inset-0 bg-white/70 dark:bg-slate-900/70 backdrop-blur-[1px] flex items-center justify-center z-10">
                                                        <span className="material-symbols-outlined animate-spin text-indigo-600 text-2xl">
                                                            progress_activity
                                                        </span>
                                                    </div>
                                                ) : null}

                                                {a4PreviewUrl ? (
                                                    <img
                                                        src={a4PreviewUrl}
                                                        alt="A4 Sheet Preview"
                                                        className="w-full h-full object-contain pointer-events-none"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-slate-400 text-[10px]">
                                                        A4 शीट बन रही है...
                                                    </div>
                                                )}
                                            </div>
                                            <span className="text-[10px] text-slate-500 font-bold mt-1.5">
                                                A4 शीट लाइव प्रिव्यू ({a4Count} फोटो)
                                            </span>
                                        </div>

                                        {/* Paper Saver Tip & Direct Buttons */}
                                        <div className="sm:col-span-7 space-y-3">
                                            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl text-xs text-amber-800 dark:text-amber-300 space-y-1">
                                                <div className="font-bold flex items-center gap-1.5">
                                                    <span className="material-symbols-outlined text-base">lightbulb</span>
                                                    कागज़ बचत टिप (Paper Saver):
                                                </div>
                                                <p className="text-[11px] leading-relaxed opacity-90">
                                                    पहली 6 फोटो A4 पेपर के बिल्कुल ऊपर (Top Row) सेट होती हैं। प्रिंट करने के बाद कैंची से ऊपर की पट्टी काटकर बाकी बचे पूरे A4 पेपर को दोबारा प्रिंटर में इस्तेमाल कर सकते हैं!
                                                </p>
                                            </div>

                                            {/* Direct Action Buttons: Print & Download */}
                                            <div className="space-y-2 pt-1">
                                                <button
                                                    type="button"
                                                    onClick={handlePrintA4}
                                                    className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer transition text-xs sm:text-sm"
                                                >
                                                    <span className="material-symbols-outlined text-xl">print</span>
                                                    🖨️ A4 शीट प्रिंट करें (Print Sheet)
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={handleDownloadA4}
                                                    className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer transition text-xs"
                                                >
                                                    <span className="material-symbols-outlined text-lg">download</span>
                                                    📥 A4 शीट डाउनलोड करें (HD JPG)
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Printable Container for Native Browser Print */}
            <div id="a4-print-sheet" className="hidden print:block fixed inset-0 m-0 p-0 bg-white z-[9999999]">
                {a4PreviewUrl && (
                    <img
                        src={a4PreviewUrl}
                        alt="A4 Sheet Print"
                        className="w-full h-full object-contain"
                        style={{ width: '100%', height: '100%', margin: 0, padding: 0 }}
                    />
                )}
            </div>

            <style>{`
                @media print {
                    body {
                        visibility: hidden !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        background: #ffffff !important;
                    }
                    #a4-print-sheet, #a4-print-sheet * {
                        visibility: visible !important;
                    }
                    #a4-print-sheet {
                        position: fixed !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 100vw !important;
                        height: 100vh !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        background: #ffffff !important;
                        display: flex !important;
                        align-items: flex-start !important;
                        justify-content: center !important;
                    }
                    #a4-print-sheet img {
                        width: 100% !important;
                        height: auto !important;
                        max-height: 100vh !important;
                        object-fit: contain !important;
                    }
                    @page {
                        size: A4 portrait !important;
                        margin: 0mm !important;
                    }
                }
            `}</style>
        </AdminLayout>
    );
}
