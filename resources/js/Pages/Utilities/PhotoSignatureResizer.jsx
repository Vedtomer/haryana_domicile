import React, { useState, useRef, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';

// Standard Indian Passport Photo Dimensions (3.5 cm × 4.5 cm at 300 DPI)
const TARGET_WIDTH = 413;
const TARGET_HEIGHT = 531;

export default function PhotoSignatureResizer() {
    // Canvas & Candidate Photo State
    const [imageSrc, setImageSrc] = useState(null);
    const [originalDimensions, setOriginalDimensions] = useState({ width: 0, height: 0 });
    const [originalSizeKb, setOriginalSizeKb] = useState(0);

    // Image Adjustments
    const [rotation, setRotation] = useState(0);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [photoZoom, setPhotoZoom] = useState(1);
    const [brightness, setBrightness] = useState(100);
    const [contrast, setContrast] = useState(100);

    // Helper to format date in DD/MM/YYYY
    const getFormattedDate = (d = new Date()) => {
        return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
    };

    // Permanent Options on Photo (Name, DOP, DOB, Signature)
    const [showName, setShowName] = useState(false);
    const [candidateName, setCandidateName] = useState('');

    const [showDop, setShowDop] = useState(false);
    const [dopDate, setDopDate] = useState(() => getFormattedDate());
    const [showDopPrefix, setShowDopPrefix] = useState(true);

    const [showDob, setShowDob] = useState(false);
    const [dobDate, setDobDate] = useState('');
    const [showDobPrefix, setShowDobPrefix] = useState(true);

    const [combineDates, setCombineDates] = useState(false);
    const [stripTheme, setStripTheme] = useState('white'); // 'white' | 'black'

    // Signature Option
    const [showSignature, setShowSignature] = useState(false);
    const [signatureSrc, setSignatureSrc] = useState(null);
    const [signatureImgObj, setSignatureImgObj] = useState(null);
    const [signatureZoom, setSignatureZoom] = useState(1);

    // A4 Sheet Maker State (1 line = 6 photos, total 36 photos)
    const [a4Count, setA4Count] = useState(36);
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
    const sigInputRef = useRef(null);
    const canvasRef = useRef(null);

    // Handle Candidate Photo File Input
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
                setPan({ x: 0, y: 0 });
                setRotation(0);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    };

    // Handle Signature File Input
    const handleSignatureFile = (file) => {
        if (!file || !file.type.startsWith('image/')) {
            alert('कृपया हस्ताक्षर के लिए इमेज (JPG, PNG) फाइल चुनें!');
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                setSignatureImgObj(img);
                setSignatureSrc(e.target.result);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    };

    const handleRemoveSignature = () => {
        setSignatureSrc(null);
        setSignatureImgObj(null);
        setSignatureZoom(1);
        if (sigInputRef.current) sigInputRef.current.value = '';
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

    // Render Canvas whenever inputs change
    useEffect(() => {
        if (!imageSrc) return;

        let active = true;
        setIsProcessing(true);

        const timer = setTimeout(() => {
            processImage();
        }, 120);

        return () => {
            active = false;
            clearTimeout(timer);
        };
    }, [
        imageSrc,
        rotation,
        pan,
        photoZoom,
        brightness,
        contrast,
        showName,
        candidateName,
        showDop,
        dopDate,
        showDopPrefix,
        showDob,
        dobDate,
        showDobPrefix,
        stripTheme,
        combineDates,
        showSignature,
        signatureSrc,
        signatureImgObj,
        signatureZoom,
    ]);

    const processImage = () => {
        const canvas = canvasRef.current || document.createElement('canvas');
        canvas.width = TARGET_WIDTH;
        canvas.height = TARGET_HEIGHT;
        const ctx = canvas.getContext('2d');

        // Fill background white
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, TARGET_WIDTH, TARGET_HEIGHT);

        if (!imageSrc) {
            setIsProcessing(false);
            return;
        }

        const img = new Image();
        img.onload = () => {
            // 1. Signature box height (if enabled)
            const sigBoxHeight = showSignature ? 116 : 0;
            const sigBoxY = TARGET_HEIGHT - sigBoxHeight;

            // 2. Text lines for Name / DOP / DOB strip
            const textLines = [];
            if (showName && candidateName.trim()) {
                textLines.push({ text: candidateName.trim().toUpperCase(), isName: true });
            }
            if (showDob && dobDate.trim() && showDop && dopDate.trim() && combineDates) {
                const dobStr = showDobPrefix ? `DOB: ${dobDate.trim()}` : dobDate.trim();
                const dopStr = showDopPrefix ? `DOP: ${dopDate.trim()}` : dopDate.trim();
                textLines.push({ text: `${dobStr}  |  ${dopStr}`, isName: false });
            } else {
                if (showDob && dobDate.trim()) {
                    const dobStr = showDobPrefix ? `DOB: ${dobDate.trim()}` : dobDate.trim();
                    textLines.push({ text: dobStr, isName: false });
                }
                if (showDop && dopDate.trim()) {
                    const dopStr = showDopPrefix ? `DOP: ${dopDate.trim()}` : dopDate.trim();
                    textLines.push({ text: dopStr, isName: false });
                }
            }

            const lineCount = textLines.length;
            const stripHeight = lineCount > 0 ? Math.max(lineCount * 26 + 12, lineCount === 1 ? 52 : (lineCount === 2 ? 78 : 102)) : 0;
            const stripY = sigBoxY - stripHeight;

            // 3. Height available for candidate's photo
            const photoAreaHeight = Math.max(120, stripY);

            // Draw Photo inside clipped area
            ctx.save();
            ctx.beginPath();
            ctx.rect(0, 0, TARGET_WIDTH, photoAreaHeight);
            ctx.clip();

            ctx.translate(TARGET_WIDTH / 2 + pan.x, photoAreaHeight / 2 + pan.y);
            ctx.rotate((rotation * Math.PI) / 180);
            ctx.scale(photoZoom, photoZoom);
            ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;

            const drawW = img.naturalWidth;
            const drawH = img.naturalHeight;
            const scale = Math.max(TARGET_WIDTH / drawW, photoAreaHeight / drawH);
            const w = drawW * scale;
            const h = drawH * scale;

            ctx.drawImage(img, -w / 2, -h / 2, w, h);
            ctx.restore();

            // 4. Draw Name, DOP, DOB Strip (if enabled)
            if (lineCount > 0) {
                const isDark = stripTheme === 'black';
                ctx.fillStyle = isDark ? '#000000' : '#FFFFFF';
                ctx.fillRect(0, stripY, TARGET_WIDTH, stripHeight);

                // Strip border line
                ctx.strokeStyle = isDark ? '#334155' : '#000000';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.moveTo(0, stripY);
                ctx.lineTo(TARGET_WIDTH, stripY);
                ctx.stroke();

                // Strip text
                ctx.fillStyle = isDark ? '#FFFFFF' : '#000000';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                const baseFontSize = Math.max(12, Math.round((stripHeight / (lineCount + 0.5)) * 0.7));

                textLines.forEach((line, idx) => {
                    const yPos = stripY + (stripHeight * (idx + 0.55)) / lineCount;
                    const fontSize = line.isName ? Math.round(baseFontSize * 1.08) : Math.round(baseFontSize * 0.92);
                    const fontWeight = line.isName ? 'bold' : '600';
                    ctx.font = `${fontWeight} ${fontSize}px sans-serif`;
                    ctx.fillText(line.text, TARGET_WIDTH / 2, yPos);
                });
            }

            // 5. Draw Signature Box (if enabled)
            if (showSignature) {
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(0, sigBoxY, TARGET_WIDTH, sigBoxHeight);

                // Top divider line for signature box
                ctx.strokeStyle = '#000000';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.moveTo(0, sigBoxY);
                ctx.lineTo(TARGET_WIDTH, sigBoxY);
                ctx.stroke();

                if (signatureImgObj) {
                    // Draw uploaded signature centered with zoom
                    const padX = 20;
                    const padY = 8;
                    const maxSigW = TARGET_WIDTH - padX * 2;
                    const maxSigH = sigBoxHeight - padY * 2;
                    const baseScale = Math.min(maxSigW / signatureImgObj.naturalWidth, maxSigH / signatureImgObj.naturalHeight);
                    const sw = signatureImgObj.naturalWidth * baseScale * signatureZoom;
                    const sh = signatureImgObj.naturalHeight * baseScale * signatureZoom;
                    const sx = (TARGET_WIDTH - sw) / 2;
                    const sy = sigBoxY + (sigBoxHeight - sh) / 2;

                    ctx.save();
                    ctx.beginPath();
                    ctx.rect(0, sigBoxY, TARGET_WIDTH, sigBoxHeight);
                    ctx.clip();
                    ctx.filter = 'contrast(125%)';
                    ctx.drawImage(signatureImgObj, sx, sy, sw, sh);
                    ctx.restore();
                } else {
                    // Placeholder text when signature is not yet uploaded
                    ctx.fillStyle = '#94A3B8';
                    ctx.font = 'bold 13px sans-serif';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText('✍️ [ यहाँ हस्ताक्षर दिखेगा - नीचे से अपलोड करें ]', TARGET_WIDTH / 2, sigBoxY + sigBoxHeight / 2);
                }
            }

            // Export to high-quality JPEG
            canvas.toBlob((blob) => {
                if (!blob) {
                    setIsProcessing(false);
                    return;
                }
                applyBlob(blob);
            }, 'image/jpeg', 0.94);
        };
        img.src = imageSrc;
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

    // Download Single Photo Action
    const handleDownload = () => {
        if (!outputUrl) return;
        const a = document.createElement('a');
        a.href = outputUrl;
        const safeName = candidateName.trim() ? candidateName.toLowerCase().replace(/\s+/g, '_') : 'passport';
        a.download = `passport_photo_${safeName}.jpg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    // Generate A4 Canvas (2480 x 3508 px at 300 DPI, 6 photos per row starting at top)
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
        const ratio = TARGET_HEIGHT / TARGET_WIDTH; // 3.5 x 4.5 cm proportion
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
    }, [a4Count, a4HasBorder, a4Gap, outputUrl]);

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
            a.href = canvas.toDataURL('image/jpeg', 0.95);
            a.download = `passport_a4_sheet_${a4Count}photos_${safeName}.jpg`;
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
                            <span className="material-symbols-outlined text-blue-600 text-2xl">badge</span>
                            <h1 className="text-xl font-black text-slate-800 dark:text-white leading-tight">
                                Passport Photo Maker (पासपोर्ट फोटो मेकर)
                            </h1>
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                                3.5 × 4.5 cm Standard
                            </span>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                            ऑनलाइन पासपोर्ट साइज़ फोटो • नाम, DOP, DOB व हस्ताक्षर जोड़ें • 1 लाइन में 6 फोटो A4 शीट प्रिंट
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
                                सिंगल फोटो डाउनलोड
                            </button>
                        </div>
                    )}
                </div>
            }
        >
            <Head title="Passport Photo Maker" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
                {/* Main Workspace: Left Controls + Right Live Canvas */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left: Controls & Upload */}
                    <div className="lg:col-span-6 space-y-5">
                        {/* 1. File Upload Box */}
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => {
                                e.preventDefault();
                                if (e.dataTransfer.files?.[0]) {
                                    handleFile(e.dataTransfer.files[0]);
                                }
                            }}
                            className="bg-white dark:bg-slate-900 border-2 border-dashed border-blue-300 dark:border-blue-700/60 hover:border-blue-500 dark:hover:border-blue-400 rounded-3xl p-6 text-center cursor-pointer transition-colors group shadow-sm"
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => handleFile(e.target.files?.[0])}
                            />
                            <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform mb-3 shadow-xs">
                                <span className="material-symbols-outlined text-3xl">add_photo_alternate</span>
                            </div>
                            <h3 className="font-bold text-slate-800 dark:text-white text-base">
                                पासपोर्ट फोटो चुनें / Drag & Drop करें
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                या स्क्रीनशॉट कॉपी करके यहाँ <strong>Ctrl + V</strong> दबाएं
                            </p>

                            {originalDimensions.width > 0 && (
                                <div className="mt-4 inline-flex items-center gap-2 px-3.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-xs font-semibold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                    <span>Original: {originalDimensions.width} × {originalDimensions.height} px</span>
                                    <span>•</span>
                                    <span>{originalSizeKb} KB</span>
                                </div>
                            )}
                        </div>

                        {/* 2. Photo Rotation & Color Adjustments */}
                        {imageSrc && (
                            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm space-y-3">
                                <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                                    <span className="flex items-center gap-1.5">
                                        <span className="material-symbols-outlined text-blue-600 text-base">rotate_right</span>
                                        फोटो रोटेशन व अलाइनमेंट:
                                    </span>
                                    <div className="flex gap-1.5">
                                        <button
                                            type="button"
                                            onClick={() => setRotation((r) => (r - 90) % 360)}
                                            className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1 cursor-pointer transition"
                                            title="बाएँ घुमाएँ 90°"
                                        >
                                            <span className="material-symbols-outlined text-sm">rotate_left</span>
                                            -90°
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setRotation((r) => (r + 90) % 360)}
                                            className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1 cursor-pointer transition"
                                            title="दाएँ घुमाएँ 90°"
                                        >
                                            <span className="material-symbols-outlined text-sm">rotate_right</span>
                                            +90°
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setPan({ x: 0, y: 0 });
                                                setRotation(0);
                                                setPhotoZoom(1);
                                                setBrightness(100);
                                                setContrast(100);
                                            }}
                                            className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-slate-500 hover:text-slate-800 text-xs font-bold flex items-center gap-1 cursor-pointer transition"
                                        >
                                            <span className="material-symbols-outlined text-sm">restart_alt</span>
                                            रिसेट
                                        </button>
                                    </div>
                                </div>

                                {/* Photo Zoom In / Out Controls */}
                                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                                    <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                                        <span className="flex items-center gap-1.5">
                                            <span className="material-symbols-outlined text-blue-600 text-base">zoom_in</span>
                                            फोटो ज़ूम (Photo Zoom In / Out):
                                        </span>
                                        <span className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-[11px] font-black">
                                            {Math.round(photoZoom * 100)}%
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setPhotoZoom((z) => Math.max(0.5, Math.round((z - 0.05) * 100) / 100))}
                                            className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-black text-sm text-slate-700 dark:text-slate-200 flex items-center justify-center cursor-pointer transition shadow-2xs"
                                            title="Zoom Out (कम करें)"
                                        >
                                            −
                                        </button>
                                        <input
                                            type="range"
                                            min="0.5"
                                            max="2.5"
                                            step="0.05"
                                            value={photoZoom}
                                            onChange={(e) => setPhotoZoom(parseFloat(e.target.value))}
                                            className="flex-1 accent-blue-600 cursor-pointer"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setPhotoZoom((z) => Math.min(2.5, Math.round((z + 0.05) * 100) / 100))}
                                            className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-black text-sm text-slate-700 dark:text-slate-200 flex items-center justify-center cursor-pointer transition shadow-2xs"
                                            title="Zoom In (बढ़ाएं)"
                                        >
                                            +
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setPhotoZoom(1)}
                                            className="px-2.5 py-1 text-[11px] font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300 cursor-pointer"
                                        >
                                            100%
                                        </button>
                                    </div>
                                </div>

                                {/* Brightness & Contrast */}
                                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                                    <div>
                                        <div className="flex justify-between font-semibold text-slate-600 dark:text-slate-400 mb-1">
                                            <span>चमक (Brightness)</span>
                                            <span>{brightness}%</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="60"
                                            max="140"
                                            value={brightness}
                                            onChange={(e) => setBrightness(Number(e.target.value))}
                                            className="w-full accent-blue-600 cursor-pointer"
                                        />
                                    </div>
                                    <div>
                                        <div className="flex justify-between font-semibold text-slate-600 dark:text-slate-400 mb-1">
                                            <span>कंट्रास्ट (Contrast)</span>
                                            <span>{contrast}%</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="60"
                                            max="140"
                                            value={contrast}
                                            onChange={(e) => setContrast(Number(e.target.value))}
                                            className="w-full accent-blue-600 cursor-pointer"
                                        />
                                    </div>
                                </div>
                                <p className="text-[11px] text-slate-400 italic">
                                    💡 <em>दाईं तरफ फोटो को माउस से पकड़कर ड्रैग करके चेहरे को सेंटर में सेट करें।</em>
                                </p>
                            </div>
                        )}

                        {/* 3. PERMANENT OPTIONS ON PHOTO (Name, DOP, DOB, Signature) */}
                        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
                            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-indigo-600 text-xl">fact_check</span>
                                    <h3 className="font-black text-slate-800 dark:text-white text-sm sm:text-base">
                                        फोटो पर क्या-क्या जोड़ना है? (Photo Details)
                                    </h3>
                                </div>
                                <span className="text-[11px] font-bold text-slate-400">
                                    मार्क करें और विवरण भरें
                                </span>
                            </div>

                            {/* 4 Clear Options */}
                            <div className="space-y-3">
                                {/* Option 1: Name Add */}
                                <div className={`p-3.5 rounded-2xl border transition ${showName ? 'bg-indigo-50/60 dark:bg-indigo-950/30 border-indigo-300 dark:border-indigo-800' : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/80'}`}>
                                    <label className="flex items-center justify-between cursor-pointer">
                                        <div className="flex items-center gap-2.5">
                                            <input
                                                type="checkbox"
                                                checked={showName}
                                                onChange={(e) => setShowName(e.target.checked)}
                                                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                            />
                                            <span className="text-xs sm:text-sm font-black text-slate-800 dark:text-white">
                                                1. Name Add (उम्मीदवार का नाम जोड़ें)
                                            </span>
                                        </div>
                                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${showName ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>
                                            {showName ? 'चालू' : 'बंद'}
                                        </span>
                                    </label>

                                    {showName && (
                                        <div className="mt-2.5 pl-6">
                                            <input
                                                type="text"
                                                value={candidateName}
                                                onChange={(e) => setCandidateName(e.target.value)}
                                                placeholder="जैसे: RAHUL SHARMA (उम्मीदवार का नाम लिखें)"
                                                className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold uppercase tracking-wider"
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Option 2: DOP Add (Date of Photo) */}
                                <div className={`p-3.5 rounded-2xl border transition ${showDop ? 'bg-indigo-50/60 dark:bg-indigo-950/30 border-indigo-300 dark:border-indigo-800' : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/80'}`}>
                                    <label className="flex items-center justify-between cursor-pointer">
                                        <div className="flex items-center gap-2.5">
                                            <input
                                                type="checkbox"
                                                checked={showDop}
                                                onChange={(e) => setShowDop(e.target.checked)}
                                                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                            />
                                            <span className="text-xs sm:text-sm font-black text-slate-800 dark:text-white">
                                                2. DOP Add (फोटो की तारीख - Date of Photo)
                                            </span>
                                        </div>
                                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${showDop ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>
                                            {showDop ? 'चालू' : 'बंद'}
                                        </span>
                                    </label>

                                    {showDop && (
                                        <div className="mt-2.5 pl-6 flex flex-col sm:flex-row gap-2 items-center">
                                            <input
                                                type="text"
                                                value={dopDate}
                                                onChange={(e) => setDopDate(e.target.value)}
                                                placeholder="DD/MM/YYYY (उदा. 04/10/2026)"
                                                className="flex-1 px-3.5 py-2 rounded-xl text-xs sm:text-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                                            />
                                            <label className="flex items-center gap-1.5 cursor-pointer text-xs font-bold text-slate-600 dark:text-slate-300 shrink-0">
                                                <input
                                                    type="checkbox"
                                                    checked={showDopPrefix}
                                                    onChange={(e) => setShowDopPrefix(e.target.checked)}
                                                    className="w-3.5 h-3.5 rounded text-indigo-600 cursor-pointer"
                                                />
                                                <span>'DOP: ' उपसर्ग लगाएं</span>
                                            </label>
                                        </div>
                                    )}
                                </div>

                                {/* Option 3: DOB Add (Date of Birth) */}
                                <div className={`p-3.5 rounded-2xl border transition ${showDob ? 'bg-indigo-50/60 dark:bg-indigo-950/30 border-indigo-300 dark:border-indigo-800' : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/80'}`}>
                                    <label className="flex items-center justify-between cursor-pointer">
                                        <div className="flex items-center gap-2.5">
                                            <input
                                                type="checkbox"
                                                checked={showDob}
                                                onChange={(e) => setShowDob(e.target.checked)}
                                                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                            />
                                            <span className="text-xs sm:text-sm font-black text-slate-800 dark:text-white">
                                                3. DOB Add (जन्म तिथि - Date of Birth)
                                            </span>
                                        </div>
                                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${showDob ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>
                                            {showDob ? 'चालू' : 'बंद'}
                                        </span>
                                    </label>

                                    {showDob && (
                                        <div className="mt-2.5 pl-6 flex flex-col sm:flex-row gap-2 items-center">
                                            <input
                                                type="text"
                                                value={dobDate}
                                                onChange={(e) => setDobDate(e.target.value)}
                                                placeholder="DD/MM/YYYY (उदा. 15/08/1998)"
                                                className="flex-1 px-3.5 py-2 rounded-xl text-xs sm:text-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                                            />
                                            <label className="flex items-center gap-1.5 cursor-pointer text-xs font-bold text-slate-600 dark:text-slate-300 shrink-0">
                                                <input
                                                    type="checkbox"
                                                    checked={showDobPrefix}
                                                    onChange={(e) => setShowDobPrefix(e.target.checked)}
                                                    className="w-3.5 h-3.5 rounded text-indigo-600 cursor-pointer"
                                                />
                                                <span>'DOB: ' उपसर्ग लगाएं</span>
                                            </label>
                                        </div>
                                    )}
                                </div>

                                {/* Option 4: Signature Add (फोटो के नीचे हस्ताक्षर जोड़ें) */}
                                <div className={`p-3.5 rounded-2xl border transition ${showSignature ? 'bg-indigo-50/60 dark:bg-indigo-950/30 border-indigo-300 dark:border-indigo-800' : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/80'}`}>
                                    <label className="flex items-center justify-between cursor-pointer">
                                        <div className="flex items-center gap-2.5">
                                            <input
                                                type="checkbox"
                                                checked={showSignature}
                                                onChange={(e) => setShowSignature(e.target.checked)}
                                                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                            />
                                            <span className="text-xs sm:text-sm font-black text-slate-800 dark:text-white">
                                                4. Signature Add (फोटो के नीचे हस्ताक्षर जोड़ें)
                                            </span>
                                        </div>
                                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${showSignature ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>
                                            {showSignature ? 'चालू' : 'बंद'}
                                        </span>
                                    </label>

                                    {showSignature && (
                                        <div className="mt-3 pl-6 space-y-2.5">
                                            <input
                                                ref={sigInputRef}
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={(e) => handleSignatureFile(e.target.files?.[0])}
                                            />

                                            {signatureSrc ? (
                                                <div className="space-y-2">
                                                    <div className="flex items-center justify-between bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-20 h-10 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden flex items-center justify-center p-1">
                                                                <img
                                                                    src={signatureSrc}
                                                                    alt="Signature"
                                                                    className="max-w-full max-h-full object-contain"
                                                                />
                                                            </div>
                                                            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                                                                <span className="material-symbols-outlined text-sm">check_circle</span>
                                                                हस्ताक्षर फोटो के नीचे सेट है
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5">
                                                            <button
                                                                type="button"
                                                                onClick={() => sigInputRef.current?.click()}
                                                                className="px-2.5 py-1 text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-lg text-slate-700 dark:text-slate-200 cursor-pointer transition"
                                                            >
                                                                बदलें
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={handleRemoveSignature}
                                                                className="px-2 py-1 text-xs font-bold bg-red-50 hover:bg-red-100 dark:bg-red-950/60 text-red-600 rounded-lg cursor-pointer transition"
                                                                title="हटाएं"
                                                            >
                                                                हटाएं
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Signature Zoom In / Out Controls */}
                                                    <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
                                                        <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                                                            <span className="flex items-center gap-1.5">
                                                                <span className="material-symbols-outlined text-indigo-600 text-base">zoom_in</span>
                                                                हस्ताक्षर ज़ूम (Signature Zoom In / Out):
                                                            </span>
                                                            <span className="px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-[11px] font-black">
                                                                {Math.round(signatureZoom * 100)}%
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={() => setSignatureZoom((z) => Math.max(0.4, Math.round((z - 0.05) * 100) / 100))}
                                                                className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 font-black text-sm text-slate-700 dark:text-slate-200 flex items-center justify-center cursor-pointer transition shadow-2xs border border-slate-200 dark:border-slate-600"
                                                                title="Zoom Out (कम करें)"
                                                            >
                                                                −
                                                            </button>
                                                            <input
                                                                type="range"
                                                                min="0.4"
                                                                max="2.5"
                                                                step="0.05"
                                                                value={signatureZoom}
                                                                onChange={(e) => setSignatureZoom(parseFloat(e.target.value))}
                                                                className="flex-1 accent-indigo-600 cursor-pointer"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => setSignatureZoom((z) => Math.min(2.5, Math.round((z + 0.05) * 100) / 100))}
                                                                className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 font-black text-sm text-slate-700 dark:text-slate-200 flex items-center justify-center cursor-pointer transition shadow-2xs border border-slate-200 dark:border-slate-600"
                                                                title="Zoom In (बढ़ाएं)"
                                                            >
                                                                +
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => setSignatureZoom(1)}
                                                                className="px-2.5 py-1 text-[11px] font-bold bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg text-slate-600 dark:text-slate-300 cursor-pointer border border-slate-200 dark:border-slate-600"
                                                            >
                                                                100%
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() => sigInputRef.current?.click()}
                                                    className="w-full py-3 px-4 border-2 border-dashed border-indigo-300 dark:border-indigo-700 bg-white dark:bg-slate-800/80 hover:bg-indigo-50/50 dark:hover:bg-slate-800 rounded-xl text-center cursor-pointer transition flex items-center justify-center gap-2 text-xs font-bold text-indigo-700 dark:text-indigo-300"
                                                >
                                                    <span className="material-symbols-outlined text-base">draw</span>
                                                    ✍️ उम्मीदवार का हस्ताक्षर अपलोड करें (PNG/JPG)
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Strip Background Theme Option */}
                            {(showName || showDop || showDob) && (
                                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                                    <span className="font-bold text-slate-600 dark:text-slate-400">
                                        नाम व तारीख पट्टी का रंग:
                                    </span>
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setStripTheme('white')}
                                            className={`px-3 py-1 rounded-lg font-bold border transition cursor-pointer flex items-center gap-1.5 ${
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
                                            className={`px-3 py-1 rounded-lg font-bold border transition cursor-pointer flex items-center gap-1.5 ${
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
                            )}
                        </div>
                    </div>

                    {/* Right: Live Interactive Canvas & Download + A4 Sheet Studio */}
                    <div className="lg:col-span-6 space-y-4">
                        {/* Single Passport Photo Preview Box */}
                        <div className="bg-slate-100 dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col items-center justify-center min-h-[460px] relative overflow-hidden">
                            {/* Standard Passport Size Badge */}
                            <div className="absolute top-4 left-4 z-10">
                                <span className="px-3.5 py-1 bg-white/95 dark:bg-slate-800/95 backdrop-blur rounded-full text-xs font-black text-slate-800 dark:text-slate-100 shadow-sm border border-slate-200/50 dark:border-slate-700/50">
                                    3.5 × 4.5 cm (Online Passport Photo)
                                </span>
                            </div>

                            {/* Live Result Size Badge */}
                            {outputKb > 0 && (
                                <div className="absolute top-4 right-4 z-10">
                                    <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-500 text-white shadow-sm flex items-center gap-1">
                                        <span className="material-symbols-outlined text-sm">check_circle</span>
                                        HD: {outputKb} KB
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
                                        aspectRatio: `${TARGET_WIDTH} / ${TARGET_HEIGHT}`,
                                        width: 'auto',
                                        height: '380px',
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
                                            प्रोसेसिंग हो रही है...
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
                                        <span className="material-symbols-outlined text-3xl">account_box</span>
                                    </div>
                                    <p className="font-bold text-slate-600 dark:text-slate-300 text-sm">
                                        यहाँ कोई इमेज अपलोड नहीं है
                                    </p>
                                    <p className="text-xs text-slate-400 max-w-xs">
                                        बाईं ओर से पासपोर्ट फोटो अपलोड करें, तुरंत लाइव प्रिव्यू और A4 शीट दिखेगी।
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
                                        className="flex-1 py-3.5 px-5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-2xl shadow-lg shadow-emerald-600/20 text-center transition-all flex items-center justify-center gap-2 cursor-pointer text-xs sm:text-sm"
                                    >
                                        <span className="material-symbols-outlined text-xl">download</span>
                                        सिंगल पासपोर्ट फोटो डाउनलोड ({outputKb} KB)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="py-3.5 px-5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-2xl text-center text-xs cursor-pointer transition flex items-center justify-center gap-1.5"
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
                                                    ऊपर 1 लाइन में 6 फोटो • कुल 36 फोटो • 1-क्लिक में A4 शीट प्रिंट व डाउनलोड
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
                                                1 लाइन = 6 फोटो • कुल 36 फोटो
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
                                                कस्टम फोटो संख्या (1 से 36+):
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
                                                    max="72"
                                                    value={a4Count}
                                                    onChange={(e) => {
                                                        const val = parseInt(e.target.value) || 1;
                                                        setA4Count(Math.max(1, val));
                                                    }}
                                                    className="flex-1 py-1.5 text-center font-black text-lg bg-white dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setA4Count((c) => c + 1)}
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
                                                    ऊपर की पहली 6 फोटो A4 पेपर के टॉप रो में सेट होती हैं। प्रिंट करने के बाद कैंची से ऊपर की पट्टी काटकर बाकी बचे A4 पेपर को दोबारा इस्तेमाल कर सकते हैं!
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
