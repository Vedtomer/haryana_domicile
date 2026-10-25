import React, { useState, useRef, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import axios from 'axios';

// Categories supported
const CATEGORIES = [
    { id: 'wedding', label: 'Wedding / Vivah (विवाह)', icon: 'favorite', color: 'from-rose-500 to-pink-600' },
    { id: 'baby_birth', label: 'Baby Birth (बेबी बर्थ)', icon: 'child_care', color: 'from-sky-400 to-blue-600' },
    { id: 'ring_ceremony', label: 'Ring Ceremony / Sagai (सगाई)', icon: 'diamond', color: 'from-amber-400 to-amber-600' },
    { id: 'birthday', label: 'Birthday Party (जन्मदिन)', icon: 'cake', color: 'from-purple-500 to-indigo-600' },
    { id: 'pooja', label: 'Pooja / Kirtan / Griha Pravesh (पूजा / कीर्तन)', icon: 'temple_hindu', color: 'from-orange-500 to-amber-600' },
];

// Template Presets
const TEMPLATES = [
    {
        id: 'royal_gold',
        category: 'wedding',
        name: 'Royal Marwar Gold (शाही विवाह)',
        tagline: 'Deep Maroon Velvet with Royal Gold Filigree & Flower Shower',
        bgGradient: ['#3b020b', '#1a0004'],
        accentColor: '#f59e0b',
        secondaryColor: '#fef08a',
        textColor: '#ffffff',
        borderStyle: 'ornate',
        musicPreset: 'shehnai',
        shloka: '|| श्री गणेशाय नमः ||',
    },
    {
        id: 'pastel_floral',
        category: 'wedding',
        name: 'Rose Gold Floral (फ्लोरल वेडिंग)',
        tagline: 'Blush Pink & Ivory Floral Wreaths with Floating Petals',
        bgGradient: ['#2e0817', '#12020a'],
        accentColor: '#f43f5e',
        secondaryColor: '#fbcfe8',
        textColor: '#ffffff',
        borderStyle: 'floral',
        musicPreset: 'romantic_flute',
        shloka: 'Save Our Date',
    },
    {
        id: 'baby_boy',
        category: 'baby_birth',
        name: 'Little Prince (नन्हा राजकुमार - Boy)',
        tagline: 'Royal Blue Clouds, Twinkling Stars & Cute Teddy Theme',
        bgGradient: ['#0f172a', '#032a52'],
        accentColor: '#38bdf8',
        secondaryColor: '#fef08a',
        textColor: '#ffffff',
        borderStyle: 'stars',
        musicPreset: 'lullaby',
        shloka: '★ A Little Prince Has Arrived! ★',
    },
    {
        id: 'baby_girl',
        category: 'baby_birth',
        name: 'Princess Fairy (नन्ही राजकुमारी - Girl)',
        tagline: 'Sweet Pink Fairytale Castle, Butterflies & Golden Sparkles',
        bgGradient: ['#2c061f', '#4a0e35'],
        accentColor: '#f472b6',
        secondaryColor: '#fde047',
        textColor: '#ffffff',
        borderStyle: 'butterflies',
        musicPreset: 'lullaby',
        shloka: '♥ Our Little Angel Has Arrived! ♥',
    },
    {
        id: 'emerald_ring',
        category: 'ring_ceremony',
        name: 'Emerald Luxury (रिंग सेरेमनी)',
        tagline: 'Deep Emerald Green with Sparkling Diamond Rings & Gold Arch',
        bgGradient: ['#022c22', '#064e3b'],
        accentColor: '#34d399',
        secondaryColor: '#fde047',
        textColor: '#ffffff',
        borderStyle: 'geometric',
        musicPreset: 'romantic_flute',
        shloka: 'Together Forever',
    },
    {
        id: 'birthday_blast',
        category: 'birthday',
        name: 'Confetti Blast (भव्य जन्मदिन)',
        tagline: 'Midnight Party Vibe with Floating Balloons & Golden Confetti',
        bgGradient: ['#1e1b4b', '#312e81'],
        accentColor: '#a855f7',
        secondaryColor: '#fbbf24',
        textColor: '#ffffff',
        borderStyle: 'balloons',
        musicPreset: 'party',
        shloka: '★ Let\'s Celebrate! ★',
    },
    {
        id: 'religious_pooja',
        category: 'pooja',
        name: 'Divya Kripa (शुभ कीर्तन व पूजा)',
        tagline: 'Auspicious Saffron Glow with Kalash, Diya & Bhajan Vibes',
        bgGradient: ['#451a03', '#78350f'],
        accentColor: '#f59e0b',
        secondaryColor: '#fef3c7',
        textColor: '#ffffff',
        borderStyle: 'ornate',
        musicPreset: 'shehnai',
        shloka: '|| ॐ नमो भगवते वासुदेवाय नमः ||',
    },
];

export default function VideoInvitationMaker({
    coinCost = 399,
    userCoins = 0,
    isAdmin = false,
    service = {},
    recentVideos = [],
}) {
    // Current Wallet state
    const [currentCoins, setCurrentCoins] = useState(userCoins);

    // Active Category and Template
    const [selectedCategory, setSelectedCategory] = useState('wedding');
    const [selectedTemplate, setSelectedTemplate] = useState(TEMPLATES[0]);

    // Form Details
    const [formData, setFormData] = useState({
        title: '|| श्री गणेशाय नमः ||',
        personName: 'Rahul',
        partnerName: 'Priya',
        parentsName: 'Smt. Sunita & Sh. Ramesh Sharma',
        grandParents: 'Late Smt. & Sh. K.L. Sharma',
        eventDate: '24 December 2026',
        eventTime: '07:00 PM Onwards',
        program1: 'Haldi & Mehendi - 23 Dec, 04:00 PM',
        program2: 'Barat & Reception - 24 Dec, 07:00 PM',
        venue: 'The Grand Palace Resort, GT Road, Karnal (Haryana)',
        rsvp: 'Sharma & Verma Family: 9812345678, 9876543210',
        message: 'Aap sabhi parivar sahit sadar aamantrit hain.',
    });

    // Uploaded Photo
    const [photoSrc, setPhotoSrc] = useState(null);
    const [photoImgElement, setPhotoImgElement] = useState(null);

    // Custom Audio File
    const [customAudioUrl, setCustomAudioUrl] = useState(null);
    const [audioFileName, setAudioFileName] = useState('');

    // Playback and Render State
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0); // 0 to 16 seconds
    const [isRendering, setIsRendering] = useState(false);
    const [renderProgress, setRenderProgress] = useState(0);
    const [downloadUrl, setDownloadUrl] = useState(null);
    const [successModalOpen, setSuccessModalOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    // Canvas references
    const canvasRef = useRef(null);
    const animationFrameRef = useRef(null);
    const audioContextRef = useRef(null);
    const audioPlayerRef = useRef(null);
    const startTimeRef = useRef(0);
    const DURATION = 16; // 16 seconds video (4 scenes x 4s)

    // Sync template when category changes
    const handleCategoryChange = (catId) => {
        setSelectedCategory(catId);
        const match = TEMPLATES.find(t => t.category === catId) || TEMPLATES[0];
        setSelectedTemplate(match);

        // Adjust default placeholders based on category
        if (catId === 'baby_birth') {
            setFormData(prev => ({
                ...prev,
                title: '★ A Little Prince Has Arrived! ★',
                personName: 'Baby Aarav',
                partnerName: '',
                parentsName: 'Proud Parents: Neha & Amit Verma',
                grandParents: 'Blessings from: Dadi & Dada Ji',
                eventDate: 'Born on 15 October 2026',
                eventTime: 'Weight: 3.2 Kg | Time: 09:45 AM',
                program1: 'Namkaran & Annaprashan Ceremony',
                program2: 'Blessing Ceremony - 05:00 PM',
                venue: 'Verma Niwas, Sector 14, Gurugram',
                rsvp: 'Verma Family: 9812345678',
                message: 'With love and gratitude, we welcome our bundle of joy!',
            }));
        } else if (catId === 'birthday') {
            setFormData(prev => ({
                ...prev,
                title: '★ Let\'s Celebrate 1st Birthday! ★',
                personName: 'Little Princess Rhea',
                partnerName: '',
                parentsName: 'Hosted by: Pooja & Vikram Malhotra',
                grandParents: 'Dada-Dadi: Smt. & Sh. O.P. Malhotra',
                eventDate: 'Sunday, 18 November 2026',
                eventTime: '06:30 PM Onwards',
                program1: 'Cake Cutting & Games - 07:00 PM',
                program2: 'Dinner & Music - 08:30 PM',
                venue: 'Celebration Banquet, Delhi Road, Rohtak',
                rsvp: 'Malhotra Family: 9812345678',
                message: 'Join us for fun, laughter, and birthday cake!',
            }));
        } else if (catId === 'ring_ceremony') {
            setFormData(prev => ({
                ...prev,
                title: 'Together Forever | Ring Ceremony',
                personName: 'Amit',
                partnerName: 'Sneha',
                parentsName: 'Smt. & Sh. Rajesh Singhal',
                grandParents: 'With Best Compliments: All Relatives & Friends',
                eventDate: 'Sunday, 10 December 2026',
                eventTime: '06:00 PM Onwards',
                program1: 'Ring Exchange Ceremony - 07:30 PM',
                program2: 'Cocktail & Dinner - 08:30 PM',
                venue: 'Hotel Radisson Blu, New Delhi',
                rsvp: 'Singhal & Mittal Family: 9812345678',
                message: 'We request the honor of your presence as we exchange rings.',
            }));
        } else if (catId === 'pooja') {
            setFormData(prev => ({
                ...prev,
                title: '|| श्री गणेशाय नमः ||',
                personName: 'Mata Ki Chowki & Griha Pravesh',
                partnerName: '',
                parentsName: 'Yajman: Smt. & Sh. Satish Sharma',
                grandParents: 'Kripa Patra: Sharma Parivar',
                eventDate: 'Saturday, 05 November 2026',
                eventTime: '04:00 PM to 09:00 PM',
                program1: 'Havan & Griha Pravesh - 09:00 AM',
                program2: 'Bhajan Kirtan & Prasad - 05:00 PM',
                venue: 'House No. 124, Green Avenue, Panipat',
                rsvp: 'Sharma Family: 9812345678',
                message: 'Prabhu kripa se aayojit is shubh avsar par aapka aagman prarthaniya hai.',
            }));
        } else {
            // Wedding default
            setFormData(prev => ({
                ...prev,
                title: '|| श्री गणेशाय नमः ||',
                personName: 'Rahul',
                partnerName: 'Priya',
                parentsName: 'Smt. Sunita & Sh. Ramesh Sharma',
                grandParents: 'Late Smt. & Sh. K.L. Sharma',
                eventDate: '24 December 2026',
                eventTime: '07:00 PM Onwards',
                program1: 'Haldi & Mehendi - 23 Dec, 04:00 PM',
                program2: 'Barat & Reception - 24 Dec, 07:00 PM',
                venue: 'The Grand Palace Resort, GT Road, Karnal (Haryana)',
                rsvp: 'Sharma & Verma Family: 9812345678, 9876543210',
                message: 'Aap sabhi parivar sahit sadar aamantrit hain.',
            }));
        }
    };

    // Handle photo upload
    const handlePhotoUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            const src = event.target.result;
            setPhotoSrc(src);
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.src = src;
            img.onload = () => setPhotoImgElement(img);
        };
        reader.readAsDataURL(file);
    };

    // Handle audio upload
    const handleAudioUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setAudioFileName(file.name);
        const url = URL.createObjectURL(file);
        setCustomAudioUrl(url);
    };

    // Synthesize celebration background music via Web Audio API
    const playSynthesizedMelody = (audioCtx, timeOffset = 0) => {
        try {
            const now = audioCtx.currentTime;
            const tempo = 120;
            const beat = 60 / tempo;

            // Pentatonic Indian classical festive frequencies (Raag Bilawal / Yaman celebratory notes)
            const notes = [
                261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25, 783.99
            ];

            // Harmonic Drone (Tanpura / Sa-Pa ambient drone)
            const drone1 = audioCtx.createOscillator();
            const drone2 = audioCtx.createOscillator();
            const droneGain = audioCtx.createGain();
            drone1.type = 'triangle';
            drone2.type = 'sine';
            drone1.frequency.setValueAtTime(130.81, now); // C3
            drone2.frequency.setValueAtTime(196.00, now); // G3
            droneGain.gain.setValueAtTime(0.08, now);
            drone1.connect(droneGain);
            drone2.connect(droneGain);
            droneGain.connect(audioCtx.destination);
            drone1.start(now);
            drone2.start(now);
            drone1.stop(now + DURATION);
            drone2.stop(now + DURATION);

            // Melodic Chimes / Shehnai Flute Simulation
            for (let i = 0; i < 32; i++) {
                const noteTime = now + (i * beat * 0.75);
                if (noteTime > now + DURATION) break;

                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();

                const noteIndex = (i * 2 + (i % 3)) % notes.length;
                osc.type = i % 2 === 0 ? 'sine' : 'triangle';
                osc.frequency.setValueAtTime(notes[noteIndex], noteTime);

                gain.gain.setValueAtTime(0, noteTime);
                gain.gain.linearRampToValueAtTime(0.12, noteTime + 0.05);
                gain.gain.exponentialRampToValueAtTime(0.001, noteTime + (beat * 0.7));

                osc.connect(gain);
                gain.connect(audioCtx.destination);
                osc.start(noteTime);
                osc.stop(noteTime + (beat * 0.75));
            }
        } catch (e) {
            console.error('Audio synthesizer note failed', e);
        }
    };

    // Draw frame onto 720x1280 (9:16) Canvas
    const drawCanvasFrame = (ctx, time) => {
        const width = 720;
        const height = 1280;

        // Determine scene (0-4s: Scene 1, 4-8s: Scene 2, 8-12s: Scene 3, 12-16s: Scene 4)
        const sceneIndex = Math.min(3, Math.floor(time / 4));
        const sceneProgress = (time % 4) / 4; // 0.0 to 1.0 within scene

        // Smooth easeInOut
        const ease = 0.5 - Math.cos(sceneProgress * Math.PI) / 2;

        // 1. Background Gradient
        const grad = ctx.createLinearGradient(0, 0, width, height);
        grad.addColorStop(0, selectedTemplate.bgGradient[0]);
        grad.addColorStop(1, selectedTemplate.bgGradient[1]);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);

        // 2. Animated Ambient Gold Sparkles & Floating Petals
        const particleCount = 28;
        for (let i = 0; i < particleCount; i++) {
            const seed = i * 137.5;
            const px = (Math.sin(seed + time * 0.4) * 0.45 + 0.5) * width;
            const py = ((seed * 11 + time * 55) % (height + 40)) - 20;
            const pSize = (Math.sin(seed + time) * 0.5 + 0.5) * 4 + 2;
            const pAlpha = (Math.sin(seed + time * 2) * 0.3 + 0.6);

            ctx.fillStyle = selectedTemplate.secondaryColor;
            ctx.globalAlpha = pAlpha;
            ctx.beginPath();
            ctx.arc(px, py, pSize, 0, Math.PI * 2);
            ctx.fill();

            // Tiny flower petal simulation
            if (i % 3 === 0) {
                ctx.fillStyle = selectedTemplate.accentColor;
                ctx.beginPath();
                ctx.ellipse(px + 10, py, pSize * 1.6, pSize * 0.8, (time + i) * 0.5, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        ctx.globalAlpha = 1.0;

        // 3. Ornate Royal Border
        ctx.strokeStyle = selectedTemplate.accentColor;
        ctx.lineWidth = 4;
        ctx.strokeRect(30, 30, width - 60, height - 60);

        ctx.strokeStyle = selectedTemplate.secondaryColor;
        ctx.lineWidth = 1.5;
        ctx.strokeRect(40, 40, width - 80, height - 80);

        // 4 Corner Ornaments (Golden Filigree simulation)
        const drawCornerOrnament = (cx, cy, rot) => {
            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate(rot);
            ctx.strokeStyle = selectedTemplate.secondaryColor;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(0, 0, 30, 0, Math.PI / 2);
            ctx.stroke();
            ctx.fillStyle = selectedTemplate.accentColor;
            ctx.beginPath();
            ctx.arc(15, 15, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        };
        drawCornerOrnament(35, 35, 0);
        drawCornerOrnament(width - 35, 35, Math.PI / 2);
        drawCornerOrnament(width - 35, height - 35, Math.PI);
        drawCornerOrnament(35, height - 35, -Math.PI / 2);

        // Top Rotating Sacred Mandala / Star
        const mandalaY = 120;
        ctx.save();
        ctx.translate(width / 2, mandalaY);
        ctx.rotate(time * 0.2);
        for (let m = 0; m < 8; m++) {
            ctx.rotate(Math.PI / 4);
            ctx.fillStyle = selectedTemplate.secondaryColor;
            ctx.globalAlpha = 0.5;
            ctx.beginPath();
            ctx.ellipse(0, 18, 6, 14, 0, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
        ctx.globalAlpha = 1.0;

        // Central Top Shloka / Blessing Header
        ctx.fillStyle = selectedTemplate.secondaryColor;
        ctx.font = 'bold 22px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(formData.title || selectedTemplate.shloka, width / 2, 190);

        // -------------------------------------------------------------
        // SCENE 1: Auspicious Announcement (0 - 4s)
        // -------------------------------------------------------------
        if (sceneIndex === 0) {
            const scale = 0.95 + ease * 0.05;
            ctx.save();
            ctx.translate(width / 2, height / 2);
            ctx.scale(scale, scale);
            ctx.translate(-width / 2, -height / 2);

            // Grand Ribbon Subtitle
            ctx.fillStyle = selectedTemplate.accentColor;
            ctx.font = 'bold 26px sans-serif';
            ctx.fillText(
                selectedCategory === 'wedding' ? 'WE ARE GETTING MARRIED' :
                selectedCategory === 'baby_birth' ? 'WELCOME TO OUR WORLD' :
                selectedCategory === 'ring_ceremony' ? 'JOIN OUR CELEBRATION' : 'CORDIALLY INVITED',
                width / 2,
                380
            );

            // Main Hero Names
            ctx.fillStyle = '#ffffff';
            ctx.font = '900 48px serif';
            ctx.shadowColor = selectedTemplate.accentColor;
            ctx.shadowBlur = 15;

            if (formData.partnerName) {
                ctx.fillText(formData.personName, width / 2, 490);
                ctx.fillStyle = selectedTemplate.secondaryColor;
                ctx.font = 'italic 34px serif';
                ctx.fillText('&', width / 2, 550);
                ctx.fillStyle = '#ffffff';
                ctx.font = '900 48px serif';
                ctx.fillText(formData.partnerName, width / 2, 620);
            } else {
                ctx.fillText(formData.personName, width / 2, 530);
            }

            ctx.shadowBlur = 0;

            // Golden Divider
            ctx.strokeStyle = selectedTemplate.secondaryColor;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(width / 2 - 120, 680);
            ctx.lineTo(width / 2 + 120, 680);
            ctx.stroke();

            // Date Badge
            ctx.fillStyle = selectedTemplate.secondaryColor;
            ctx.font = 'bold 28px sans-serif';
            ctx.fillText(formData.eventDate, width / 2, 740);

            // Warm tagline
            ctx.fillStyle = '#f1f5f9';
            ctx.font = '500 20px sans-serif';
            ctx.fillText(formData.message || 'With the blessings of our family', width / 2, 820);

            ctx.restore();
        }

        // -------------------------------------------------------------
        // SCENE 2: The Couple / Baby / Star Spotlight with Photo (4 - 8s)
        // -------------------------------------------------------------
        else if (sceneIndex === 1) {
            // Photo Circle Frame
            const photoX = width / 2;
            const photoY = 440;
            const photoRadius = 140;

            ctx.save();
            ctx.beginPath();
            ctx.arc(photoX, photoY, photoRadius + 10, 0, Math.PI * 2);
            ctx.fillStyle = selectedTemplate.accentColor;
            ctx.shadowColor = selectedTemplate.accentColor;
            ctx.shadowBlur = 20;
            ctx.fill();
            ctx.shadowBlur = 0;

            ctx.beginPath();
            ctx.arc(photoX, photoY, photoRadius, 0, Math.PI * 2);
            ctx.clip();

            if (photoImgElement) {
                // Draw uploaded photo centered
                const aspect = photoImgElement.width / photoImgElement.height;
                let dw = photoRadius * 2;
                let dh = photoRadius * 2;
                if (aspect > 1) {
                    dw = dh * aspect;
                } else {
                    dh = dw / aspect;
                }
                ctx.drawImage(photoImgElement, photoX - dw / 2, photoY - dh / 2, dw, dh);
            } else {
                // Default placeholder
                ctx.fillStyle = '#1e293b';
                ctx.fillRect(photoX - photoRadius, photoY - photoRadius, photoRadius * 2, photoRadius * 2);
                ctx.fillStyle = selectedTemplate.secondaryColor;
                ctx.font = 'bold 64px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(formData.personName ? formData.personName[0] : '★', photoX, photoY);
                ctx.textBaseline = 'alphabetic';
            }
            ctx.restore();

            // Names Banner
            ctx.fillStyle = '#ffffff';
            ctx.font = '900 36px serif';
            ctx.fillText(formData.personName + (formData.partnerName ? ' & ' + formData.partnerName : ''), width / 2, 650);

            // Parents' Blessings
            ctx.fillStyle = selectedTemplate.secondaryColor;
            ctx.font = '600 20px sans-serif';
            ctx.fillText('Cherished By', width / 2, 720);

            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 22px sans-serif';
            ctx.fillText(formData.parentsName, width / 2, 760);

            if (formData.grandParents) {
                ctx.fillStyle = selectedTemplate.secondaryColor;
                ctx.font = '500 18px sans-serif';
                ctx.fillText('Grandparents:', width / 2, 810);
                ctx.fillStyle = '#f8fafc';
                ctx.font = '500 19px sans-serif';
                ctx.fillText(formData.grandParents, width / 2, 840);
            }
        }

        // -------------------------------------------------------------
        // SCENE 3: Auspicious Programs & Timeline (8 - 12s)
        // -------------------------------------------------------------
        else if (sceneIndex === 2) {
            ctx.fillStyle = selectedTemplate.secondaryColor;
            ctx.font = 'bold 28px sans-serif';
            ctx.fillText('PROGRAM & CEREMONIES', width / 2, 340);

            // Decorative separator
            ctx.strokeStyle = selectedTemplate.accentColor;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(width / 2 - 90, 365);
            ctx.lineTo(width / 2 + 90, 365);
            ctx.stroke();

            // Event 1 Box
            ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
            ctx.roundRect(80, 420, width - 160, 130, 16);
            ctx.fill();
            ctx.strokeStyle = selectedTemplate.secondaryColor;
            ctx.lineWidth = 1;
            ctx.roundRect(80, 420, width - 160, 130, 16);
            ctx.stroke();

            ctx.fillStyle = selectedTemplate.secondaryColor;
            ctx.font = 'bold 24px sans-serif';
            ctx.fillText('✧ Event / Ceremony ✧', width / 2, 465);
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 20px sans-serif';
            ctx.fillText(formData.program1 || 'Pre-Wedding Ceremonies', width / 2, 510);

            // Event 2 Box
            ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
            ctx.roundRect(80, 590, width - 160, 130, 16);
            ctx.fill();
            ctx.strokeStyle = selectedTemplate.accentColor;
            ctx.lineWidth = 1;
            ctx.roundRect(80, 590, width - 160, 130, 16);
            ctx.stroke();

            ctx.fillStyle = selectedTemplate.secondaryColor;
            ctx.font = 'bold 24px sans-serif';
            ctx.fillText('✧ Main Muhurat ✧', width / 2, 635);
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 20px sans-serif';
            ctx.fillText(formData.program2 || 'Main Function & Dinner', width / 2, 680);

            // Auspicious Time
            ctx.fillStyle = selectedTemplate.secondaryColor;
            ctx.font = 'bold 24px sans-serif';
            ctx.fillText('Date: ' + formData.eventDate, width / 2, 790);
            ctx.fillStyle = '#ffffff';
            ctx.font = '600 20px sans-serif';
            ctx.fillText('Time: ' + (formData.eventTime || '07:00 PM Onwards'), width / 2, 830);
        }

        // -------------------------------------------------------------
        // SCENE 4: Venue, RSVP & Warm Invitation (12 - 16s)
        // -------------------------------------------------------------
        else if (sceneIndex === 3) {
            ctx.fillStyle = selectedTemplate.secondaryColor;
            ctx.font = 'bold 30px sans-serif';
            ctx.fillText('VENUE & LOCATION', width / 2, 340);

            // Venue Box
            ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
            ctx.roundRect(60, 390, width - 120, 180, 20);
            ctx.fill();
            ctx.strokeStyle = selectedTemplate.secondaryColor;
            ctx.lineWidth = 1.5;
            ctx.roundRect(60, 390, width - 120, 180, 20);
            ctx.stroke();

            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 24px sans-serif';

            // Wrap venue text
            const wrapText = (text, x, startY, maxWidth, lineHeight) => {
                const words = (text || '').split(' ');
                let line = '';
                let y = startY;
                for (let n = 0; n < words.length; n++) {
                    const testLine = line + words[n] + ' ';
                    const metrics = ctx.measureText(testLine);
                    if (metrics.width > maxWidth && n > 0) {
                        ctx.fillText(line, x, y);
                        line = words[n] + ' ';
                        y += lineHeight;
                    } else {
                        line = testLine;
                    }
                }
                ctx.fillText(line, x, y);
            };

            wrapText(formData.venue, width / 2, 450, width - 160, 32);

            // RSVP Box
            ctx.fillStyle = selectedTemplate.secondaryColor;
            ctx.font = 'bold 24px sans-serif';
            ctx.fillText('R.S.V.P & Best Compliments', width / 2, 630);

            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 20px sans-serif';
            wrapText(formData.rsvp, width / 2, 675, width - 140, 28);

            // Closing line
            ctx.fillStyle = selectedTemplate.secondaryColor;
            ctx.font = 'italic bold 22px serif';
            ctx.fillText('Waiting for your gracious presence!', width / 2, 790);
        }

        // Bottom Animated Progress Bar
        const progressWidth = (width - 120) * (time / DURATION);
        ctx.fillStyle = 'rgba(255,255,255,0.2)';
        ctx.fillRect(60, height - 70, width - 120, 6);
        ctx.fillStyle = selectedTemplate.accentColor;
        ctx.fillRect(60, height - 70, progressWidth, 6);

        // Slide counter (e.g. 1 / 4)
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.font = 'bold 16px sans-serif';
        ctx.fillText(`Scene ${sceneIndex + 1} of 4 • ${Math.floor(time)}s / ${DURATION}s`, width / 2, height - 45);
    };

    // Render loop for interactive live preview
    useEffect(() => {
        let isCancelled = false;
        const renderLoop = (timestamp) => {
            if (!startTimeRef.current) startTimeRef.current = timestamp;
            const elapsed = ((timestamp - startTimeRef.current) / 1000) % DURATION;
            setCurrentTime(elapsed);

            const canvas = canvasRef.current;
            if (canvas) {
                const ctx = canvas.getContext('2d');
                drawCanvasFrame(ctx, elapsed);
            }

            if (isPlaying && !isCancelled) {
                animationFrameRef.current = requestAnimationFrame(renderLoop);
            }
        };

        if (isPlaying) {
            startTimeRef.current = performance.now() - (currentTime * 1000);
            animationFrameRef.current = requestAnimationFrame(renderLoop);
        } else {
            const canvas = canvasRef.current;
            if (canvas) {
                const ctx = canvas.getContext('2d');
                drawCanvasFrame(ctx, currentTime);
            }
        }

        return () => {
            isCancelled = true;
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [isPlaying, selectedTemplate, formData, photoImgElement]);

    // Toggle Preview Play / Pause
    const togglePlay = () => {
        if (!isPlaying) {
            setIsPlaying(true);
            if (customAudioUrl && audioPlayerRef.current) {
                audioPlayerRef.current.play().catch(e => console.log('Audio autoplay prevented', e));
            } else {
                try {
                    const AudioContext = window.AudioContext || window.webkitAudioContext;
                    if (AudioContext) {
                        if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
                            audioContextRef.current = new AudioContext();
                        }
                        if (audioContextRef.current.state === 'suspended') {
                            audioContextRef.current.resume();
                        }
                        playSynthesizedMelody(audioContextRef.current, currentTime);
                    }
                } catch (err) {
                    console.log('Audio init failed', err);
                }
            }
        } else {
            setIsPlaying(false);
            if (audioPlayerRef.current) {
                audioPlayerRef.current.pause();
            }
            if (audioContextRef.current && audioContextRef.current.state === 'running') {
                audioContextRef.current.suspend();
            }
        }
    };

    // Scrub slider
    const handleScrub = (e) => {
        const val = parseFloat(e.target.value);
        setCurrentTime(val);
        startTimeRef.current = performance.now() - (val * 1000);
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            drawCanvasFrame(ctx, val);
        }
    };

    // -------------------------------------------------------------
    // Full HD Video Generation & Auto-Approved Coin Deduction (399 Coins)
    // -------------------------------------------------------------
    const handleGenerateVideo = async () => {
        setErrorMessage('');

        // Wallet Balance check
        if (!isAdmin && currentCoins < coinCost) {
            setErrorMessage(`Insufficient coins. Aapke wallet me ${currentCoins} coins hain, jabki is service ke liye ${coinCost} coins chahiye. Kripya pehle wallet recharge karein.`);
            return;
        }

        setIsRendering(true);
        setRenderProgress(5);

        try {
            // 1. Call Backend to deduct 399 coins & create Auto-Approved ServiceRequest
            const response = await axios.post('/utilities/video-invitation-maker/generate', {
                category: selectedCategory,
                template_id: selectedTemplate.id,
                title: formData.title,
                person_name: formData.personName,
                partner_name: formData.partnerName,
                parents_name: formData.parentsName,
                event_date: formData.eventDate,
                event_time: formData.eventTime,
                venue: formData.venue,
                rsvp: formData.rsvp,
                message: formData.message,
            });

            if (!response.data.success) {
                throw new Error(response.data.message || 'Payment/Generation failed');
            }

            // Update remaining coins in UI
            if (typeof response.data.remaining_coins === 'number') {
                setCurrentCoins(response.data.remaining_coins);
            }

            setRenderProgress(20);

            // 2. Start Offscreen High-Resolution Canvas Rendering & MediaRecorder
            const renderCanvas = document.createElement('canvas');
            renderCanvas.width = 720;
            renderCanvas.height = 1280;
            const rCtx = renderCanvas.getContext('2d');

            // Setup MediaStream
            const stream = renderCanvas.captureStream(30); // 30 FPS

            // Setup Audio Stream into MediaRecorder
            let audioDestination = null;
            let audioCtx = null;
            try {
                const AudioContext = window.AudioContext || window.webkitAudioContext;
                if (AudioContext) {
                    audioCtx = new AudioContext();
                    audioDestination = audioCtx.createMediaStreamDestination();
                    playSynthesizedMelody(audioCtx, 0);
                    // Add audio tracks to stream
                    audioDestination.stream.getAudioTracks().forEach(track => stream.addTrack(track));
                }
            } catch (aErr) {
                console.warn('Audio stream mix failed, continuing with video only', aErr);
            }

            // Supported MIME types
            let mimeType = 'video/webm;codecs=vp9,opus';
            if (!MediaRecorder.isTypeSupported(mimeType)) {
                mimeType = 'video/webm';
                if (!MediaRecorder.isTypeSupported(mimeType)) {
                    mimeType = 'video/mp4';
                }
            }

            const mediaRecorder = new MediaRecorder(stream, {
                mimeType: MediaRecorder.isTypeSupported(mimeType) ? mimeType : undefined,
                videoBitsPerSecond: 3000000, // 3 Mbps HD quality
            });

            const recordedChunks = [];
            mediaRecorder.ondataavailable = (event) => {
                if (event.data && event.data.size > 0) {
                    recordedChunks.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(recordedChunks, { type: 'video/mp4' });
                const url = URL.createObjectURL(blob);
                setDownloadUrl(url);
                setRenderProgress(100);
                setIsRendering(false);
                setSuccessModalOpen(true);

                // Auto Trigger Download
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
                const safeName = (formData.personName || 'invitation').replace(/[^a-zA-Z0-9]/g, '_');
                a.download = `${safeName}_invitation_video.mp4`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            };

            mediaRecorder.start();

            // Render loop over 16 seconds
            const fps = 30;
            const totalFrames = DURATION * fps;
            let currentFrame = 0;

            const renderInterval = setInterval(() => {
                const t = (currentFrame / totalFrames) * DURATION;
                drawCanvasFrame(rCtx, t);
                currentFrame++;

                const progress = Math.min(95, Math.floor(20 + (currentFrame / totalFrames) * 75));
                setRenderProgress(progress);

                if (currentFrame >= totalFrames) {
                    clearInterval(renderInterval);
                    setTimeout(() => {
                        mediaRecorder.stop();
                        if (audioCtx && audioCtx.state !== 'closed') {
                            audioCtx.close();
                        }
                    }, 500);
                }
            }, 1000 / fps);

        } catch (err) {
            console.error('Video generation error:', err);
            setIsRendering(false);
            setErrorMessage(err.response?.data?.message || err.message || 'Something went wrong while generating the video.');
        }
    };

    return (
        <AdminLayout
            header={
                <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-rose-600 dark:text-rose-400 text-[26px]">
                            videocam
                        </span>
                        <div>
                            <h1 className="text-lg sm:text-xl font-black text-slate-800 dark:text-white leading-tight">
                                Digital Video Invitation Maker (वीडियो इनविटेशन मेकर)
                            </h1>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                Wedding, Baby Birth, Ring Ceremony &amp; Birthday HD Videos • 100% Auto-Approved
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="px-3.5 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs font-bold flex items-center gap-1.5 shadow-xs">
                            <span className="material-symbols-outlined text-[18px] text-amber-500">monetization_on</span>
                            <span>Service Charge: <b>{coinCost} Coins</b></span>
                        </div>
                        <div className="px-3.5 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-300 dark:border-indigo-800 text-indigo-900 dark:text-indigo-200 text-xs font-bold flex items-center gap-1.5 shadow-xs">
                            <span className="material-symbols-outlined text-[18px] text-indigo-500">account_balance_wallet</span>
                            <span>My Balance: <b>{currentCoins} Coins</b></span>
                        </div>
                    </div>
                </div>
            }
        >
            <Head title="Digital Video Invitation Maker - CSP Jaankari" />

            <div className="max-w-7xl mx-auto py-4 px-2 sm:px-4 space-y-6">

                {/* Error Banner */}
                {errorMessage && (
                    <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200 text-sm font-bold flex items-start gap-3">
                        <span className="material-symbols-outlined text-rose-600 mt-0.5">error</span>
                        <div className="flex-1">
                            <p>{errorMessage}</p>
                            {!isAdmin && currentCoins < coinCost && (
                                <Link
                                    href="/wallet/add"
                                    className="inline-flex items-center gap-1 mt-2 px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-black shadow-xs"
                                >
                                    <span>Recharge Wallet Now</span>
                                    <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                                </Link>
                            )}
                        </div>
                        <button onClick={() => setErrorMessage('')} className="text-slate-400 hover:text-slate-600">
                            ✕
                        </button>
                    </div>
                )}

                {/* Top Category Tabs */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-2.5 sm:p-3 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-2 overflow-x-auto custom-scrollbar">
                    {CATEGORIES.map((cat) => {
                        const active = selectedCategory === cat.id;
                        return (
                            <button
                                key={cat.id}
                                onClick={() => handleCategoryChange(cat.id)}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black whitespace-nowrap transition-all duration-200 cursor-pointer ${
                                    active
                                        ? `bg-gradient-to-r ${cat.color} text-white shadow-md shadow-rose-500/20 scale-[1.02]`
                                        : 'bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                                }`}
                            >
                                <span className="material-symbols-outlined text-[18px]">{cat.icon}</span>
                                <span>{cat.label}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Main 2-Column Studio Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                    {/* LEFT COLUMN: Customizer Form (7 Cols) */}
                    <div className="lg:col-span-7 space-y-5">

                        {/* 1. Template Presets Selector */}
                        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-3">
                            <div className="flex items-center justify-between">
                                <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                                    <span className="material-symbols-outlined text-rose-500 text-[20px]">palette</span>
                                    <span>Select Invitation Design Template</span>
                                </h2>
                                <span className="text-[11px] font-bold text-slate-400">
                                    {TEMPLATES.filter(t => t.category === selectedCategory).length} Designs Available
                                </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {TEMPLATES.filter(t => t.category === selectedCategory).map((tmpl) => {
                                    const isSelected = selectedTemplate.id === tmpl.id;
                                    return (
                                        <div
                                            key={tmpl.id}
                                            onClick={() => setSelectedTemplate(tmpl)}
                                            className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer relative overflow-hidden ${
                                                isSelected
                                                    ? 'border-rose-500 bg-rose-50/40 dark:bg-rose-950/20 shadow-md ring-2 ring-rose-400/30'
                                                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50'
                                            }`}
                                        >
                                            <div className="flex items-center gap-2.5">
                                                <div
                                                    className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs"
                                                    style={{ background: `linear-gradient(135deg, ${tmpl.bgGradient[0]}, ${tmpl.bgGradient[1]})` }}
                                                >
                                                    <span className="material-symbols-outlined text-[18px]">movie</span>
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <h3 className="text-xs font-black text-slate-800 dark:text-slate-100 truncate">
                                                        {tmpl.name}
                                                    </h3>
                                                    <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                                                        {tmpl.tagline}
                                                    </p>
                                                </div>
                                                {isSelected && (
                                                    <span className="material-symbols-outlined text-rose-600 dark:text-rose-400 text-[20px]">
                                                        check_circle
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* 2. Personalized Details Form */}
                        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
                            <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-3">
                                <span className="material-symbols-outlined text-indigo-500 text-[20px]">edit_note</span>
                                <span>Event &amp; Names Details (विवरण भरें)</span>
                            </h2>

                            <div className="space-y-3.5">
                                {/* Title / Shloka */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                                        Top Blessing / Shloka / Header
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        placeholder="|| श्री गणेशाय नमः || or Save Our Date"
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-rose-500 focus:outline-none"
                                    />
                                </div>

                                {/* Names Row */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                                            {selectedCategory === 'wedding' ? 'Dulha (Groom) Name *' :
                                             selectedCategory === 'baby_birth' ? 'Baby Name *' :
                                             selectedCategory === 'birthday' ? 'Birthday Star Name *' : 'Main Person Name *'}
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.personName}
                                            onChange={(e) => setFormData({ ...formData, personName: e.target.value })}
                                            placeholder="e.g. Rahul"
                                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-rose-500 focus:outline-none"
                                        />
                                    </div>

                                    {(selectedCategory === 'wedding' || selectedCategory === 'ring_ceremony') && (
                                        <div>
                                            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                                                Dulhan (Bride) Name *
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.partnerName}
                                                onChange={(e) => setFormData({ ...formData, partnerName: e.target.value })}
                                                placeholder="e.g. Priya"
                                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-rose-500 focus:outline-none"
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Parents & Grandparents */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                                            Mata-Pita (Parents) Name
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.parentsName}
                                            onChange={(e) => setFormData({ ...formData, parentsName: e.target.value })}
                                            placeholder="Smt. & Sh. Ramesh Sharma"
                                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-rose-500 focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                                            Dada-Dadi / Grandparents (Optional)
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.grandParents}
                                            onChange={(e) => setFormData({ ...formData, grandParents: e.target.value })}
                                            placeholder="Late Smt. & Sh. K.L. Sharma"
                                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-rose-500 focus:outline-none"
                                        />
                                    </div>
                                </div>

                                {/* Date & Time */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                                            Event Date *
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.eventDate}
                                            onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                                            placeholder="e.g. 24 December 2026"
                                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-rose-500 focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                                            Event Time / Muhurat
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.eventTime}
                                            onChange={(e) => setFormData({ ...formData, eventTime: e.target.value })}
                                            placeholder="e.g. 07:00 PM Onwards"
                                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-rose-500 focus:outline-none"
                                        />
                                    </div>
                                </div>

                                {/* Programs Schedule */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                                            Program 1 (Pre-Event / Haldi etc.)
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.program1}
                                            onChange={(e) => setFormData({ ...formData, program1: e.target.value })}
                                            placeholder="Haldi & Mehendi - 23 Dec, 04:00 PM"
                                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-rose-500 focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                                            Program 2 (Main Function / Barat)
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.program2}
                                            onChange={(e) => setFormData({ ...formData, program2: e.target.value })}
                                            placeholder="Barat & Reception - 24 Dec, 07:00 PM"
                                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-rose-500 focus:outline-none"
                                        />
                                    </div>
                                </div>

                                {/* Venue & Address */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                                        Venue &amp; Banquet Hall Address *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.venue}
                                        onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                                        placeholder="The Grand Palace Resort, GT Road, Karnal (Haryana)"
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-rose-500 focus:outline-none"
                                    />
                                </div>

                                {/* RSVP & Welcome */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                                            RSVP &amp; Contact Mobile Numbers
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.rsvp}
                                            onChange={(e) => setFormData({ ...formData, rsvp: e.target.value })}
                                            placeholder="Sharma Family: 9812345678"
                                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-rose-500 focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                                            Warm Invitation Note
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.message}
                                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                            placeholder="Aap sabhi parivar sahit sadar aamantrit hain."
                                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-rose-500 focus:outline-none"
                                        />
                                    </div>
                                </div>

                                {/* Photo & Audio Upload Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                                    {/* Photo Upload */}
                                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                                                <span className="material-symbols-outlined text-rose-500 text-[18px]">add_a_photo</span>
                                                <span>Couple / Baby Photo</span>
                                            </span>
                                            {photoSrc && (
                                                <button
                                                    onClick={() => { setPhotoSrc(null); setPhotoImgElement(null); }}
                                                    className="text-[11px] text-rose-500 font-bold hover:underline"
                                                >
                                                    Remove
                                                </button>
                                            )}
                                        </div>
                                        <label className="flex items-center justify-center gap-2 px-3 py-2 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl cursor-pointer hover:bg-white dark:hover:bg-slate-800 transition-colors">
                                            <span className="material-symbols-outlined text-[20px] text-slate-400">upload_file</span>
                                            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                                                {photoSrc ? 'Change Photo' : 'Upload Photo (JPG/PNG)'}
                                            </span>
                                            <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                                        </label>
                                    </div>

                                    {/* Audio Track / Custom MP3 */}
                                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                                                <span className="material-symbols-outlined text-amber-500 text-[18px]">music_note</span>
                                                <span>Custom Song / MP3</span>
                                            </span>
                                            {customAudioUrl && (
                                                <button
                                                    onClick={() => { setCustomAudioUrl(null); setAudioFileName(''); }}
                                                    className="text-[11px] text-rose-500 font-bold hover:underline"
                                                >
                                                    Reset
                                                </button>
                                            )}
                                        </div>
                                        <label className="flex items-center justify-center gap-2 px-3 py-2 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl cursor-pointer hover:bg-white dark:hover:bg-slate-800 transition-colors">
                                            <span className="material-symbols-outlined text-[20px] text-slate-400">audio_file</span>
                                            <span className="text-xs font-bold text-slate-600 dark:text-slate-300 truncate max-w-[180px]">
                                                {audioFileName || 'Upload Audio / Song'}
                                            </span>
                                            <input type="file" accept="audio/*" onChange={handleAudioUpload} className="hidden" />
                                        </label>
                                        {customAudioUrl && (
                                            <audio ref={audioPlayerRef} src={customAudioUrl} loop className="hidden" />
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* RIGHT COLUMN: Interactive Live Canvas Player & HD Export (5 Cols) */}
                    <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-4">

                        {/* Player Frame Card */}
                        <div className="bg-slate-900 rounded-3xl p-4 sm:p-5 border border-slate-800 shadow-xl flex flex-col items-center space-y-4">
                            <div className="w-full flex items-center justify-between text-white">
                                <div className="flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                                    <span className="text-xs font-black uppercase tracking-wider text-slate-300">
                                        Live Video Preview (9:16 Reel)
                                    </span>
                                </div>
                                <span className="text-[11px] font-bold text-slate-400">
                                    1080x1920 HD Ready
                                </span>
                            </div>

                            {/* Responsive 9:16 Canvas Wrapper */}
                            <div className="relative w-full max-w-[280px] sm:max-w-[310px] aspect-[9/16] rounded-2xl overflow-hidden shadow-2xl border-2 border-amber-500/30 bg-black flex items-center justify-center">
                                <canvas
                                    ref={canvasRef}
                                    width={720}
                                    height={1280}
                                    className="w-full h-full object-contain"
                                />

                                {/* Center Big Play/Pause Button when paused */}
                                {!isPlaying && (
                                    <button
                                        onClick={togglePlay}
                                        className="absolute w-14 h-14 rounded-full bg-black/60 hover:bg-rose-600 text-white flex items-center justify-center backdrop-blur-sm transition-all hover:scale-110 shadow-lg cursor-pointer"
                                    >
                                        <span className="material-symbols-outlined text-[32px] ml-0.5">
                                            play_arrow
                                        </span>
                                    </button>
                                )}
                            </div>

                            {/* Playback Controls */}
                            <div className="w-full space-y-2">
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={togglePlay}
                                        className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer"
                                    >
                                        <span className="material-symbols-outlined text-[24px]">
                                            {isPlaying ? 'pause' : 'play_arrow'}
                                        </span>
                                    </button>

                                    <input
                                        type="range"
                                        min="0"
                                        max={DURATION}
                                        step="0.1"
                                        value={currentTime}
                                        onChange={handleScrub}
                                        className="flex-1 accent-rose-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
                                    />

                                    <span className="text-xs font-mono font-bold text-slate-300">
                                        {Math.floor(currentTime)}s / {DURATION}s
                                    </span>
                                </div>

                                <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold px-1">
                                    <span>Scene 1: Intro</span>
                                    <span>Scene 2: Star</span>
                                    <span>Scene 3: Program</span>
                                    <span>Scene 4: Venue</span>
                                </div>
                            </div>

                            {/* Render / Download Action Button */}
                            <div className="w-full pt-2">
                                <button
                                    onClick={handleGenerateVideo}
                                    disabled={isRendering}
                                    className={`w-full py-4 px-6 rounded-2xl font-black text-sm text-white shadow-xl flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer ${
                                        isRendering
                                            ? 'bg-slate-700 cursor-not-allowed opacity-80'
                                            : 'bg-gradient-to-r from-rose-600 via-pink-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 shadow-rose-600/30'
                                    }`}
                                >
                                    {isRendering ? (
                                        <>
                                            <span className="material-symbols-outlined animate-spin text-[22px]">progress_activity</span>
                                            <span>Generating HD Video ({renderProgress}%)...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined text-[22px]">auto_awesome</span>
                                            <span>Generate &amp; Download HD Video ({coinCost} Coins)</span>
                                        </>
                                    )}
                                </button>
                                <p className="text-[11px] text-center text-slate-400 mt-2 font-medium">
                                    Instant Auto-Approved • Direct WhatsApp &amp; Instagram Reel MP4 Format
                                </p>
                            </div>
                        </div>

                        {/* Recent Requests Widget */}
                        {recentVideos.length > 0 && (
                            <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-3">
                                <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-2">
                                    <span className="material-symbols-outlined text-emerald-500 text-[18px]">history</span>
                                    <span>Recent Created Videos ({recentVideos.length})</span>
                                </h3>

                                <div className="space-y-2 max-h-52 overflow-y-auto custom-scrollbar">
                                    {recentVideos.map((item) => (
                                        <div
                                            key={item.id}
                                            className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs"
                                        >
                                            <div className="min-w-0 pr-2">
                                                <div className="font-bold text-slate-800 dark:text-white truncate">
                                                    {item.names || item.title}
                                                </div>
                                                <div className="text-[10px] text-slate-500">
                                                    {item.category} • {item.created_at}
                                                </div>
                                            </div>
                                            <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-[10px] shrink-0">
                                                Approved
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                    </div>

                </div>

            </div>

            {/* Success & Download Modal */}
            {successModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl text-center space-y-4 animate-scale-in">
                        <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-sm ring-8 ring-emerald-50 dark:ring-emerald-900/30">
                            <span className="material-symbols-outlined text-[36px]">check_circle</span>
                        </div>

                        <div>
                            <h3 className="text-lg font-black text-slate-900 dark:text-white">
                                Video Generated &amp; Auto-Approved!
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                Aapka HD Invitation Video successfully download ho chuka hai. Wallet se {coinCost} coins deduct hue hain.
                            </p>
                        </div>

                        {downloadUrl && (
                            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                                <video
                                    src={downloadUrl}
                                    controls
                                    className="max-h-60 rounded-xl shadow-md"
                                />
                            </div>
                        )}

                        <div className="flex flex-col gap-2 pt-2">
                            {downloadUrl && (
                                <a
                                    href={downloadUrl}
                                    download={`${(formData.personName || 'invitation').replace(/[^a-zA-Z0-9]/g, '_')}_video.mp4`}
                                    className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md flex items-center justify-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-[18px]">download</span>
                                    <span>Download Video Again (MP4)</span>
                                </a>
                            )}

                            <button
                                onClick={() => setSuccessModalOpen(false)}
                                className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl"
                            >
                                Close &amp; Create Another Video
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
