
window.requestDownloadPermission = function(type, details) {
    return new Promise((resolve, reject) => {
        if (window.parent === window) {
            resolve(true);
            return;
        }
        const messageId = Date.now().toString() + Math.random().toString();
        const listener = (event) => {
            if (event.data && event.data.type === 'download_permission_response' && event.data.messageId === messageId) {
                window.removeEventListener('message', listener);
                if (event.data.approved) {
                    resolve(true);
                } else {
                    reject(new Error(event.data.reason || 'Permission denied'));
                }
            }
        };
        window.addEventListener('message', listener);
        window.parent.postMessage({
            type: 'request_download_permission',
            messageId: messageId,
            downloadType: type,
            details: details
        }, '*');
    });
};

import { ApiService } from './api.js';
import { EditorService, CustomCropper } from './editor.js';
import { LayoutService } from './layout.js';
import { FaceDetectionService } from './faceDetection.js';

class App {
    constructor() {
        this.currentStep = 1;
        this.originalImageFile = null;
        this.processedImageUrl = null;
        this.imageMode = null; // 'enhance' | 'manual' | 'original'
        this.currentFeedbackTool = '';
        this.showBiometricGuide = true;
        
        // Services
        this.api = new ApiService();
        this.faceDetector = new FaceDetectionService();
        this.editor = new EditorService(this.faceDetector);
        this.layout = new LayoutService();
        this.visitorId = null;
        
        this.init();
    }

    init() {
        this.updateTimeout = null;
        this.debouncedUpdatePrintLayout = () => {
            clearTimeout(this.updateTimeout);
            this.updateTimeout = setTimeout(() => {
                this.updatePrintLayout();
            }, 250);
        };

        this.trackVisit();
        this.bindThemeToggle();
        this.bindUploadEvents();
        this.bindNavigationEvents();
        this.initScrollAnimations();
        this.loadFeedback();
        this.bindFeedbackEvents();
        this.bindRemoveBgButton();
        
        // Initialize editing controls from editor
        this.editor.initControls();
        this.setupBackgroundColorPicker();
        this.bindSingleDownloadEvents();
        this.bindBiometricGuideToggle();
        this.bindSizePresetGuidelines();
        this.initMultiPhotoPrinting();
        
        // Initialize Theme from Storage or Default
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        this.updateThemeIcon(savedTheme);



        // Bind sliders real-time updates
        ['adj-brightness', 'adj-contrast', 'adj-saturation'].forEach(id => {
            const slider = document.getElementById(id);
            if (slider) {
                slider.addEventListener('input', () => {
                    if (window.innerWidth >= 992) {
                        this.debouncedUpdatePrintLayout();
                    }
                });
            }
        });

        // Window resize layout transition handler
        window.addEventListener('resize', () => {
            if (this.currentStep === 3 || this.currentStep === 4) {
                this.goToStep(this.currentStep);
                if (window.innerWidth >= 992) {
                    this.updatePrintLayout();
                } else {
                    this.closeAllDesktopPopups();
                }
            }
        });

        // Initialize A4 preview zoom & pan states
        this.a4Zoom = 1.0;
        this.a4PanX = 0;
        this.a4PanY = 0;
        this.isPanning = false;
        this.panStartX = 0;
        this.panStartY = 0;

        this.bindDesktopToolbarEvents();
        this.bindPreviewZoomEvents();
    }

    updateThemeIcon(theme) {
        const icon = document.querySelector('#theme-toggle i');
        if (!icon) return;
        icon.className = theme === 'dark' ? 'ph ph-sun' : 'ph ph-moon';
    }

    async loadFeedback(page = 1, tool_filter = this.currentFeedbackTool) {
        const list = document.getElementById('feedback-list');
        list.innerHTML = '<div class="text-center py-12"><div class="ai-loader" style="width: 30px; height: 30px;"></div></div>';
        try {
            const response = await fetch(`../api_feedback.php?tool_id=${tool_filter}&page=${page}`);
            const result = await response.json();
            
            if (result.success && result.data.length > 0) {
                list.innerHTML = '';
                result.data.forEach(fb => {
                    const initials = fb.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
                    const avatarColor = this.getAvatarColor(fb.name);
                    const rating = fb.rating || 5;
                    const starsHtml = Array(5).fill(0).map((_, i) => 
                        `<i class="${i < rating ? 'ph-fill' : 'ph'} ph-star" style="color: #fbbf24;"></i>`
                    ).join('');
                    
                    const item = document.createElement('div');
                    item.className = 'fb-card animate-up';
                    let html = `
                        <div class="fb-user-info">
                            <div class="fb-avatar" style="background: ${avatarColor}">${initials}</div>
                            <div style="flex: 1;">
                                <div style="display: flex; justify-content: space-between; align-items: center;">
                                    <div class="fb-name">${this.escapeHtml(fb.name)}</div>
                                    <div class="fb-date">${new Date(fb.created_at).toLocaleDateString()}</div>
                                </div>
                                <div style="display: flex; gap: 2px; margin-top: 4px; font-size: 0.9rem;">${starsHtml}</div>
                            </div>
                        </div>
                        <div class="fb-content">${this.escapeHtml(fb.message)}</div>
                    `;
                    if (fb.reply) {
                        html += `
                            <div class="fb-admin-reply">
                                <span class="fb-badge">Verified Support</span>
                                <div class="fb-reply-txt">${this.escapeHtml(fb.reply)}</div>
                            </div>
                        `;
                    }
                    item.innerHTML = html;
                    list.appendChild(item);
                });
                
                // Add pagination
                if (result.totalPages > 1) {
                    const pagination = document.createElement('div');
                    pagination.className = 'pagination flex justify-center items-center gap-3 mt-6';
                    
                    if (result.currentPage > 1) {
                        const prev = document.createElement('button');
                        prev.className = 'btn outline-btn';
                        prev.style.padding = '0.5rem 1rem';
                        prev.innerText = 'Prev';
                        prev.onclick = () => this.loadFeedback(result.currentPage - 1, tool_filter);
                        pagination.appendChild(prev);
                    }
                    
                    const info = document.createElement('span');
                    info.className = 'text-sm text-muted';
                    info.innerText = `Page ${result.currentPage} of ${result.totalPages}`;
                    pagination.appendChild(info);
                    
                    if (result.currentPage < result.totalPages) {
                        const next = document.createElement('button');
                        next.className = 'btn outline-btn';
                        next.style.padding = '0.5rem 1rem';
                        next.innerText = 'Next';
                        next.onclick = () => this.loadFeedback(result.currentPage + 1, tool_filter);
                        pagination.appendChild(next);
                    }
                    list.appendChild(pagination);
                }
                
                // Trigger animation for new items
                setTimeout(() => this.initScrollAnimations(), 50);

                // Inject dynamic SEO Review Schema
                if (page === 1 && result.seo) {
                    this.injectSEOSchema(result.seo.averageRating, result.seo.totalReviews, result.data);
                }
            } else {
                list.innerHTML = '<div class="text-center py-12 text-muted italic">No feedback yet. Be the first to share your experience!</div>';
            }
        } catch (err) {
            list.innerHTML = '<div class="text-center py-12 text-muted italic">Failed to load feedback.</div>';
        }
    }

    getAvatarColor(name) {
        const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        return colors[Math.abs(hash) % colors.length];
    }

    bindFeedbackEvents() {
        let selectedRating = 5;
        const stars = document.querySelectorAll('.star-opt');
        stars.forEach(star => {
            star.addEventListener('click', () => {
                selectedRating = parseInt(star.dataset.rating);
                stars.forEach(s => {
                    if (parseInt(s.dataset.rating) <= selectedRating) {
                        s.classList.add('ph-fill');
                        s.classList.remove('ph');
                    } else {
                        s.classList.remove('ph-fill');
                        s.classList.add('ph');
                    }
                });
            });
        });

        // Filter Click Events
        document.querySelectorAll('.feedback-filter').forEach(filter => {
            filter.addEventListener('click', () => {
                document.querySelectorAll('.feedback-filter').forEach(f => f.classList.remove('active'));
                filter.classList.add('active');
                this.currentFeedbackTool = filter.getAttribute('data-tool');
                this.loadFeedback(1, this.currentFeedbackTool);
            });
        });

        const btn = document.getElementById('btn-submit-feedback');
        btn.addEventListener('click', async () => {
            const nameEl = document.getElementById('fb-name');
            const msgEl = document.getElementById('fb-message');
            
            const name = nameEl.value.trim();
            const message = msgEl.value.trim();
            
            if (!name || !message) {
                this.showToast('Please enter both name and message', 'error');
                return;
            }
            
            btn.disabled = true;
            btn.innerText = 'Sending...';
            
            try {
                const response = await fetch('../api_feedback.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, message, rating: selectedRating, tool_id: 'passport_photo_maker' })
                });
                const result = await response.json();
                
                if (result.success) {
                    this.showToast(result.message);
                    this.logActivity('feedback', `Name: ${name}`);
                    nameEl.value = '';
                    msgEl.value = '';
                    setTimeout(() => this.loadFeedback(1, this.currentFeedbackTool), 1000);
                } else {
                    this.showToast(result.message, 'error');
                }
            } catch (err) {
                this.showToast('Failed to send feedback', 'error');
            } finally {
                btn.disabled = false;
                btn.innerHTML = '<i class="ph ph-paper-plane-tilt"></i> Send Feedback';
            }
        });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    injectSEOSchema(avg, total, reviewsArr) {
        // Remove existing dynamic schema if present
        const existing = document.getElementById('dynamic-seo-schema');
        if (existing) existing.remove();

        // Build reviews array
        const reviewObjects = reviewsArr.slice(0, 5).map(r => ({
            "@type": "Review",
            "author": {"@type": "Person", "name": r.name},
            "datePublished": new Date(r.created_at).toISOString().split('T')[0],
            "reviewBody": r.message,
            "reviewRating": {"@type": "Rating", "ratingValue": r.rating || 5, "bestRating": "5"}
        }));

        const schema = {
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "Passport Photo Maker",
            "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": avg,
                "bestRating": "5",
                "worstRating": "1",
                "ratingCount": total
            },
            "review": reviewObjects
        };

        const script = document.createElement('script');
        script.id = 'dynamic-seo-schema';
        script.type = 'application/ld+json';
        script.text = JSON.stringify(schema);
        document.head.appendChild(script);
    }

    initScrollAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.animate-up').forEach(el => observer.observe(el));
    }

    async trackVisit() {
        if (window.PortalAnalytics) {
            this.visitorId = window.PortalAnalytics.visitorId;
            return;
        }
        window.addEventListener('PortalAnalyticsReady', () => {
            this.visitorId = window.PortalAnalytics.visitorId;
        });
        
        setTimeout(async () => {
            if (this.visitorId) return;
            try {
                const response = await fetch('track.php');
                const result = await response.json();
                if (result.status === 'success') {
                    this.visitorId = result.visitor_id;
                }
            } catch (err) {
                console.warn('Analytics tracking failed');
            }
        }, 1000);
    }

    async logActivity(actionType, details = null) {
        if (window.PortalAnalytics) {
            window.PortalAnalytics.logAction(actionType, details, 'passport_photo_maker');
            return;
        }
        if (!this.visitorId) return;
        try {
            await fetch('api_log_activity.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    visitor_id: this.visitorId,
                    action_type: actionType,
                    details: details
                })
            });
        } catch (err) {
            console.warn(`Failed to log activity: ${actionType}`);
        }
    }

    showToast(message, type = 'success') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerText = message;
        container.appendChild(toast);
        setTimeout(() => toast.remove(), 4000);
    }

    bindThemeToggle() {
        const btn = document.getElementById('theme-toggle');
        btn.addEventListener('click', () => {
            const html = document.documentElement;
            const newTheme = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
            html.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            this.updateThemeIcon(newTheme);
        });
    }

    goToStep(stepNumber) {
        const isDesktop = window.innerWidth >= 992;
        
        if (isDesktop && (stepNumber === 3 || stepNumber === 4)) {
            document.body.classList.add('desktop-single-view');
        } else {
            document.body.classList.remove('desktop-single-view');
        }

        // Update steppers
        document.querySelectorAll('.step').forEach(step => {
            const num = parseInt(step.dataset.step);
            if (num < stepNumber) {
                step.classList.add('completed');
                step.classList.remove('active');
            } else if (num === stepNumber) {
                step.classList.add('active');
                step.classList.remove('completed');
            } else {
                step.classList.remove('active', 'completed');
            }
        });

        // Update views
        const views = ['view-upload', 'view-process', 'view-edit', 'view-export'];
        views.forEach((id, index) => {
            const view = document.getElementById(id);
            if (isDesktop && (stepNumber === 3 || stepNumber === 4)) {
                if (id === 'view-edit' || id === 'view-export') {
                    view.classList.add('active');
                } else {
                    view.classList.remove('active');
                }
            } else {
                if (index + 1 === stepNumber) {
                    view.classList.add('active');
                } else {
                    view.classList.remove('active');
                }
            }
        });

        this.currentStep = stepNumber;
    }

    async updatePrintLayout() {
        if (!this.editor.cropper) return;
        try {
            const finalImage = await this.editor.getFinalImage();
            this.layout.init(finalImage, this.editor.cropWidthCm, this.editor.cropHeightCm);
        } catch (err) {
            console.error('Failed to update print layout', err);
        }
    }

    bindUploadEvents() {
        const dropZone = document.getElementById('drop-zone');
        const fileInput = document.getElementById('file-input');
        const btnBrowse = document.getElementById('btn-browse');

        btnBrowse.addEventListener('click', () => fileInput.click());

        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('dragover');
        });

        dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));

        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('dragover');
            if (e.dataTransfer.files.length) {
                this.handleFile(e.dataTransfer.files[0]);
            }
        });

        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length) {
                this.handleFile(e.target.files[0]);
            }
        });
    }

    async handleFile(file) {
        const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            this.showToast('Invalid file format. Please upload JPG, PNG or WEBP.', 'error');
            return;
        }
        if (file.size > 10 * 1024 * 1024) {
            this.showToast('File too large. Max 10MB allowed.', 'error');
            return;
        }

        this.originalImageFile = file;
        this.logActivity('upload', `File: ${file.name}, Size: ${file.size}`);
        
        // Go directly to editor with the original image
        const url = URL.createObjectURL(file);
        this.processedImageUrl = url;
        this.editor.setMode('original');

        this.goToStep(3);
        await this.editor.loadImage(url);

        // Show the Remove BG button (reset state)
        const bgBtn = document.getElementById('btn-remove-bg');
        bgBtn.disabled = false;
        bgBtn.innerHTML = '<i class="ph ph-sparkle"></i> Remove Background (AI)';

        // Desktop real-time print layout initialization
        if (window.innerWidth >= 992) {
            this.updatePrintLayout();
        }
    }

    /** In-editor AI background removal — triggered by the button */
    bindRemoveBgButton() {
        const btn = document.getElementById('btn-remove-bg');
        btn.addEventListener('click', async () => {
            if (!this.originalImageFile) return;

            btn.disabled = true;
            btn.innerHTML = '<div class="ai-loader" style="width:20px;height:20px;border-width:2px;"></div> Removing...';
            this.logActivity('bg_remove_start');

            try {
                const resultBlob = await this.api.removeBackground(this.originalImageFile);
                const url = URL.createObjectURL(resultBlob);
                this.processedImageUrl = url;

                // Switch editor to enhanced mode
                this.editor.setMode('enhance');
                this.editor.setBackgroundColor('#4e9fe5');
                await this.editor.loadImage(url);

                btn.innerHTML = '<i class="ph ph-check-circle"></i> Background Removed';
                btn.style.background = 'var(--success)';
                this.showToast('Background removed successfully!');
                this.logActivity('bg_remove_complete');

                if (window.innerWidth >= 992) {
                    this.updatePrintLayout();
                }
            } catch (error) {
                btn.disabled = false;
                btn.innerHTML = '<i class="ph ph-sparkle"></i> Remove Background (AI)';
                this.showToast(error.message || 'Background removal failed', 'error');
            }
        });
    }
    
    setupBackgroundColorPicker() {
        const swatches = document.querySelectorAll('.color-swatch');
        const customColor = document.getElementById('custom-bg-color');
        const customColorContainer = customColor.closest('.color-custom');
        
        swatches.forEach(btn => {
            btn.addEventListener('click', () => {
                swatches.forEach(b => b.classList.remove('active'));
                if (customColorContainer) customColorContainer.classList.remove('active');
                btn.classList.add('active');
                this.editor.setBackgroundColor(btn.dataset.color);
                if (window.innerWidth >= 992) {
                    this.updatePrintLayout();
                }
            });
        });
        
        customColor.addEventListener('input', (e) => {
            swatches.forEach(b => b.classList.remove('active'));
            if (customColorContainer) customColorContainer.classList.add('active');
            this.editor.setBackgroundColor(e.target.value);
            if (window.innerWidth >= 992) {
                this.debouncedUpdatePrintLayout();
            }
        });
    }

    bindNavigationEvents() {
        // Back from edit (goes back to upload step since we skip the loader)
        document.getElementById('btn-back-process').addEventListener('click', () => {
            this.goToStep(1);
        });

        // Back from export
        document.getElementById('btn-back-edit').addEventListener('click', () => {
            this.goToStep(3);
        });

        // Generate Layout Phase
        document.getElementById('btn-generate-layout').addEventListener('click', async () => {
            try {
                // Flatten edits to a final data URL
                const finalImage = await this.editor.getFinalImage();
                this.goToStep(4);
                this.logActivity('generate_layout', `Size: ${this.editor.cropWidthCm}x${this.editor.cropHeightCm}`);
                this.layout.init(finalImage, this.editor.cropWidthCm, this.editor.cropHeightCm);
            } catch (err) {
                this.showToast('Failed to generate image', 'error');
            }
        });

        // Start Over
        document.getElementById('btn-start-over').addEventListener('click', () => {
            location.reload();
        });
    }

    bindSingleDownloadEvents() {
        const btn = document.getElementById('btn-download-single');
        const formatRadios = document.querySelectorAll('input[name="single_format"]');
        const pxWidth = document.getElementById('single-px-width');
        const pxHeight = document.getElementById('single-px-height');
        const sizePreset = document.getElementById('preset-size');

        // Toggle radio cards
        formatRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                document.querySelectorAll('#single-download-format .radio-card').forEach(rc => {
                    rc.classList.remove('active');
                });
                e.target.closest('.radio-card').classList.add('active');
            });
        });

        // Sync pixels when physical size preset changes
        const updatePixelsFromCm = () => {
            const wCm = parseFloat(document.getElementById('custom-width').value) || 3.5;
            const hCm = parseFloat(document.getElementById('custom-height').value) || 4.5;
            // 300 DPI = 118.11 px/cm
            pxWidth.value = Math.round(wCm * 118.11);
            pxHeight.value = Math.round(hCm * 118.11);
        };

        sizePreset.addEventListener('change', updatePixelsFromCm);
        // Also listen to custom cm inputs
        document.getElementById('custom-width').addEventListener('input', updatePixelsFromCm);
        document.getElementById('custom-height').addEventListener('input', updatePixelsFromCm);

        btn.addEventListener('click', async () => {
            const format = document.querySelector('input[name="single_format"]:checked').value;
            const w = parseInt(pxWidth.value) || 413;
            const h = parseInt(pxHeight.value) || 531;
            const targetKb = parseInt(document.getElementById('single-target-kb').value);

            if (w < 50 || h < 50) {
                this.showToast('Pixel dimensions are too small (min 50px)', 'error');
                return;
            }
            if (w > 5000 || h > 5000) {
                this.showToast('Pixel dimensions are too large (max 5000px)', 'error');
                return;
            }

            btn.disabled = true;
            btn.innerHTML = '<div class="ai-loader" style="width:20px;height:20px;border-width:2px;"></div> Downloading...';

            try {
                await window.requestDownloadPermission('single', { w, h, format, targetKb });
                await this.editor.downloadSingleImage(format, w, h, targetKb);
                this.showToast('Photo downloaded successfully');
                this.logActivity('download_single', `${w}x${h}px, Format: ${format}, Target: ${targetKb}KB`);
            } catch (err) {
                this.showToast('Failed to download photo', 'error');
            } finally {
                btn.disabled = false;
                btn.innerHTML = '<i class="ph ph-download-simple"></i> Download Single Photo';
            }
        });
    }

    bindBiometricGuideToggle() {
        const biometricToggle = document.getElementById('toggle-biometric-guide');
        if (biometricToggle) {
            biometricToggle.checked = this.showBiometricGuide;
            biometricToggle.addEventListener('change', (e) => {
                this.showBiometricGuide = e.target.checked;
                if (this.editor.cropper) {
                    this.editor.cropper.setBiometricGuideVisible(e.target.checked);
                }
            });
        }
    }

    bindSizePresetGuidelines() {
        const sizePreset = document.getElementById('preset-size');
        const guidelinesBox = document.getElementById('size-guidelines-box');
        const guidelinesList = document.getElementById('guidelines-list');

        const guidelinesData = {
            '3,4': {
                checklist: [
                    'White or light background',
                    'Face clearly visible, eyes open',
                    'Head occupies 70-80% of photo',
                    'No hats, headcoverings (except religious), or sunglasses'
                ],
                optimalPaper: 'A4',
                optimalCopies: 6
            },
            '3.5,4.5': {
                checklist: [
                    'Plain white background (no shadows)',
                    'No glasses (no glare/reflections)',
                    'Head height should be 70% to 80% of photo',
                    'Frontal view, neutral expression, eyes open'
                ],
                optimalPaper: 'A4',
                optimalCopies: 6
            },
            '5.1,5.1': {
                checklist: [
                    'Pure white or off-white background',
                    'No eyeglasses allowed (strict)',
                    'Head centered and sized between 1 - 1.375 inches',
                    'Neutral facial expression or natural smile'
                ],
                optimalPaper: 'A4',
                optimalCopies: 4
            },
            '3.5,3.5': {
                checklist: [
                    'Light colored background',
                    'Clear facial features, no sunglasses',
                    'Good lighting, no shadows on face'
                ],
                optimalPaper: 'A4',
                optimalCopies: 6
            },
            '2.5,3': {
                checklist: [
                    'Plain white background',
                    'Eyes open, face looking straight',
                    'No shadows or color casts'
                ],
                optimalPaper: 'A4',
                optimalCopies: 8
            },
            '2.5,3.5': {
                checklist: [
                    'White or light background',
                    'Good quality photo, no stamps/signatures on face',
                    'Neutral expression, frontal shot'
                ],
                optimalPaper: 'A4',
                optimalCopies: 8
            },
            '2,2.5': {
                checklist: [
                    'Light background',
                    'Neutral expression, eyes open'
                ],
                optimalPaper: 'A4',
                optimalCopies: 12
            },
            '8.56,5.398': {
                checklist: [
                    'ID badge quality photograph',
                    'Clear view of the face'
                ],
                optimalPaper: 'A4',
                optimalCopies: 4
            },
            '8.5,5.5': {
                checklist: [
                    'ID badge quality photograph',
                    'Clear view of the face'
                ],
                optimalPaper: 'A4',
                optimalCopies: 4
            }
        };

        const updateGuidelinesAndLayout = () => {
            const val = sizePreset.value;
            const data = guidelinesData[val];

            if (data) {
                // Populate checklist
                guidelinesList.innerHTML = '';
                data.checklist.forEach(item => {
                    const li = document.createElement('li');
                    li.innerHTML = `<i class="ph ph-check-circle"></i> <span>${item}</span>`;
                    guidelinesList.appendChild(li);
                });
                guidelinesBox.classList.remove('hidden');

                // Auto-configure optimal printing options
                if (data.optimalPaper) {
                    const paperRadio = document.querySelector(`input[name="paper_size"][value="${data.optimalPaper}"]`);
                    if (paperRadio && !paperRadio.checked) {
                        paperRadio.checked = true;
                        paperRadio.dispatchEvent(new Event('change'));
                    }
                }
                if (data.optimalCopies !== undefined) {
                    const inputCopies = document.getElementById('input-copies');
                    if (inputCopies && parseInt(inputCopies.value) !== data.optimalCopies) {
                        inputCopies.value = data.optimalCopies;
                        inputCopies.dispatchEvent(new Event('change'));
                    }
                }
            } else {
                guidelinesBox.classList.add('hidden');
                guidelinesList.innerHTML = '';
            }
        };

        // Listen for preset change
        sizePreset.addEventListener('change', updateGuidelinesAndLayout);

        // Run initially to set defaults for the initial preset
        updateGuidelinesAndLayout();
    }    initMultiPhotoPrinting() {
        const btnAdd = document.getElementById('btn-add-multi-photo');
        const inputAdd = document.getElementById('input-add-multi-photo');
        const modal = document.getElementById('multi-photo-modal');
        const btnClose = document.getElementById('btn-close-multi-modal');
        const btnCancel = document.getElementById('btn-cancel-multi-modal');
        const btnSave = document.getElementById('btn-add-to-sheet');
        const presetSelect = document.getElementById('multi-crop-preset');
        const bgRadios = document.querySelectorAll('input[name="multi-bg-type"]');
        const bgPicker = document.getElementById('multi-custom-bg-color');
        const bgPickerContainer = bgPicker ? bgPicker.closest('.multi-color-custom') : null;
        const multiColorPanel = document.getElementById('multi-color-selection');
        const multiSwatches = document.querySelectorAll('.multi-color-swatch');
        const btnRemoveBg = document.getElementById('btn-multi-remove-bg');

        let multiCropper = null;
        let currentMultiPhotoFile = null;
        let selectedMultiBgColor = '#ffffff';

        // Helper to update the live preview background color inside the multi-cropper
        const updateMultiCropperPreview = () => {
            const bgType = document.querySelector('input[name="multi-bg-type"]:checked')?.value || 'original';
            let bgColor = 'transparent';
            if (bgType === 'color') {
                bgColor = selectedMultiBgColor;
            }

            if (multiCropper) {
                multiCropper.setMode(bgType);
                multiCropper.setBackgroundColor(bgColor);
            }
        };

        if (!btnAdd || !inputAdd) return;

        // Trigger file input
        btnAdd.addEventListener('click', () => {
            inputAdd.click();
        });

        // Toggle custom color panel
        bgRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                if (e.target.value === 'color') {
                    if (multiColorPanel) multiColorPanel.classList.remove('hidden');
                } else {
                    if (multiColorPanel) multiColorPanel.classList.add('hidden');
                }
                updateMultiCropperPreview();
            });
        });

        // Wire up multi-photo swatches click
        multiSwatches.forEach(swatch => {
            swatch.addEventListener('click', () => {
                multiSwatches.forEach(s => s.classList.remove('active'));
                if (bgPickerContainer) bgPickerContainer.classList.remove('active');
                
                swatch.classList.add('active');
                selectedMultiBgColor = swatch.dataset.color;
                updateMultiCropperPreview();
            });
        });

        // Wire up custom color picker input
        if (bgPicker) {
            bgPicker.addEventListener('input', (e) => {
                multiSwatches.forEach(s => s.classList.remove('active'));
                if (bgPickerContainer) bgPickerContainer.classList.add('active');
                
                selectedMultiBgColor = e.target.value;
                updateMultiCropperPreview();
            });
        }

        // Handle file select
        inputAdd.addEventListener('change', (e) => {
            if (e.target.files.length === 0) return;
            const file = e.target.files[0];
            currentMultiPhotoFile = file;

            // Reset Remove BG button state inside modal
            if (btnRemoveBg) {
                btnRemoveBg.disabled = false;
                btnRemoveBg.style.background = 'linear-gradient(135deg, #8b5cf6, #6366f1)';
                btnRemoveBg.innerHTML = '<i class="ph ph-sparkle"></i> Remove Background (AI)';
            }

            // Reset color selections to White standard
            multiSwatches.forEach(s => s.classList.remove('active'));
            const whiteSwatch = Array.from(multiSwatches).find(s => s.dataset.color === '#ffffff');
            if (whiteSwatch) whiteSwatch.classList.add('active');
            if (bgPickerContainer) bgPickerContainer.classList.remove('active');
            selectedMultiBgColor = '#ffffff';
            
            const originalRadio = document.querySelector('input[name="multi-bg-type"][value="original"]');
            if (originalRadio) {
                originalRadio.checked = true;
                originalRadio.dispatchEvent(new Event('change'));
            }
            
            const reader = new FileReader();
            reader.onload = (event) => {
                modal.classList.remove('hidden');

                if (multiCropper) {
                    multiCropper.destroy();
                }

                const [w, h] = presetSelect.value.split(',').map(Number);
                multiCropper = new CustomCropper(document.querySelector('.crop-area-wrapper-multi'), event.target.result, {
                    aspectRatio: w / h,
                    showBiometricGuide: false,
                    isOriginalMode: true,
                    bgColor: '#ffffff',
                    onChange: () => {}
                });

                // Wait for image to load to do smart crop
                multiCropper.readyPromise.then(async () => {
                    if (this.faceDetector) {
                        try {
                            const detection = await this.faceDetector.detectFace(multiCropper.img);
                            if (detection) {
                                multiCropper.runSmartCrop(detection.box);
                            }
                        } catch (err) {
                            console.warn("Multi-photo face detection fallback to default crop", err);
                        }
                    }
                });
            };
            reader.readAsDataURL(file);
        });

        // AI Background Removal click handler inside modal
        if (btnRemoveBg) {
            btnRemoveBg.addEventListener('click', async () => {
                if (!currentMultiPhotoFile) return;

                btnRemoveBg.disabled = true;
                btnRemoveBg.innerHTML = '<div class="ai-loader" style="width:15px;height:15px;border-width:2px;margin-right:0.25rem;"></div> Removing...';

                try {
                    const resultBlob = await this.api.removeBackground(currentMultiPhotoFile);
                    const url = URL.createObjectURL(resultBlob);

                    if (multiCropper) {
                        multiCropper.destroy();
                    }
                    const [w, h] = presetSelect.value.split(',').map(Number);
                    multiCropper = new CustomCropper(document.querySelector('.crop-area-wrapper-multi'), url, {
                        aspectRatio: w / h,
                        showBiometricGuide: false,
                        isOriginalMode: false,
                        bgColor: selectedMultiBgColor,
                        onChange: () => {}
                    });

                    multiCropper.readyPromise.then(async () => {
                        if (this.faceDetector) {
                            try {
                                const detection = await this.faceDetector.detectFace(multiCropper.img);
                                if (detection) {
                                    multiCropper.runSmartCrop(detection.box);
                                }
                            } catch (err) {
                                console.warn("Multi-photo face detection fallback to default crop", err);
                            }
                        }
                    });

                    btnRemoveBg.innerHTML = '<i class="ph ph-check-circle"></i> Background Removed';
                    btnRemoveBg.style.background = 'var(--success)';
                    this.showToast('Background removed successfully!');
                    
                    // Switch background fill radio to custom color (white by default)
                    const bgTypeColor = document.querySelector('input[name="multi-bg-type"][value="color"]');
                    if (bgTypeColor) {
                        bgTypeColor.checked = true;
                        bgTypeColor.dispatchEvent(new Event('change'));
                    }

                    // Select white swatch as active
                    multiSwatches.forEach(s => s.classList.remove('active'));
                    const whiteSwatch = Array.from(multiSwatches).find(s => s.dataset.color === '#ffffff');
                    if (whiteSwatch) whiteSwatch.classList.add('active');
                    if (bgPickerContainer) bgPickerContainer.classList.remove('active');
                    selectedMultiBgColor = '#ffffff';

                    // Update preview right after removal
                    updateMultiCropperPreview();

                } catch (err) {
                    console.error(err);
                    this.showToast('Failed to remove background', 'error');
                    btnRemoveBg.disabled = false;
                    btnRemoveBg.style.background = 'linear-gradient(135deg, #8b5cf6, #6366f1)';
                    btnRemoveBg.innerHTML = '<i class="ph ph-sparkle"></i> Remove Background (AI)';
                }
            });
        }

        // Preset change aspect ratio update
        presetSelect.addEventListener('change', (e) => {
            if (multiCropper) {
                const [w, h] = e.target.value.split(',').map(Number);
                multiCropper.setAspectRatio(w / h);
                updateMultiCropperPreview();
            }
        });

        // Close modal
        const closeModal = () => {
            modal.classList.add('hidden');
            if (multiCropper) {
                multiCropper.destroy();
                multiCropper = null;
            }
            inputAdd.value = ''; // Reset file input
            currentMultiPhotoFile = null;
        };

        btnClose.addEventListener('click', closeModal);
        btnCancel.addEventListener('click', closeModal);

        // Crop and Save to Layout
        btnSave.addEventListener('click', () => {
            if (!multiCropper) return;

            // Get cropped area
            const croppedCanvas = multiCropper.getCroppedCanvas({
                imageSmoothingEnabled: true,
                imageSmoothingQuality: 'high'
            });

            const [wCm, hCm] = presetSelect.value.split(',').map(Number);
            const widthPx = Math.round(wCm * 118.11);
            const heightPx = Math.round(hCm * 118.11);

            const compositionCanvas = document.createElement('canvas');
            compositionCanvas.width = widthPx;
            compositionCanvas.height = heightPx;
            const ctx = compositionCanvas.getContext('2d');

            const bgType = document.querySelector('input[name="multi-bg-type"]:checked').value;
            if (bgType === 'color') {
                let fillVal = selectedMultiBgColor;
                if (fillVal === 'studio') {
                    const gradient = ctx.createRadialGradient(widthPx / 2, heightPx / 2, 0, widthPx / 2, heightPx / 2, Math.max(widthPx, heightPx));
                    gradient.addColorStop(0, '#f8fafc');
                    gradient.addColorStop(1, '#94a3b8');
                    ctx.fillStyle = gradient;
                } else if (fillVal === 'studio-blue') {
                    const gradient = ctx.createRadialGradient(widthPx / 2, heightPx / 2, 0, widthPx / 2, heightPx / 2, Math.max(widthPx, heightPx));
                    gradient.addColorStop(0, '#a5c7f7');
                    gradient.addColorStop(1, '#3b82f6');
                    ctx.fillStyle = gradient;
                } else if (fillVal === 'studio-warm') {
                    const gradient = ctx.createRadialGradient(widthPx / 2, heightPx / 2, 0, widthPx / 2, heightPx / 2, Math.max(widthPx, heightPx));
                    gradient.addColorStop(0, '#fff7ed');
                    gradient.addColorStop(1, '#fdba74');
                    ctx.fillStyle = gradient;
                } else {
                    ctx.fillStyle = fillVal;
                }
                ctx.fillRect(0, 0, widthPx, heightPx);
            }

            ctx.drawImage(croppedCanvas, 0, 0, widthPx, heightPx);
            const resultDataUrl = compositionCanvas.toDataURL('image/png', 1.0);

            // Add to LayoutService list
            this.layout.photosList.push({
                id: 'photo_' + Date.now(),
                dataUrl: resultDataUrl,
                width: widthPx,
                height: heightPx,
                copies: 6
            });

            // Update UI and re-render sheet
            this.layout.updateMultiPhotosUI();
            this.layout.renderGrid();

            closeModal();
            this.showToast('Photo added to print layout');
        });

        // Wire up multi-photo nudge listeners
        document.getElementById('btn-multi-nudge-up')?.addEventListener('click', () => {
            if (multiCropper) multiCropper.nudge('up');
        });
        document.getElementById('btn-multi-nudge-down')?.addEventListener('click', () => {
            if (multiCropper) multiCropper.nudge('down');
        });
        document.getElementById('btn-multi-nudge-left')?.addEventListener('click', () => {
            if (multiCropper) multiCropper.nudge('left');
        });
        document.getElementById('btn-multi-nudge-right')?.addEventListener('click', () => {
            if (multiCropper) multiCropper.nudge('right');
        });
        document.getElementById('btn-multi-nudge-shrink')?.addEventListener('click', () => {
            if (multiCropper) multiCropper.scaleCrop(-0.02);
        });
        document.getElementById('btn-multi-nudge-grow')?.addEventListener('click', () => {
            if (multiCropper) multiCropper.scaleCrop(0.02);
        });
        document.getElementById('btn-multi-center-crop')?.addEventListener('click', () => {
            if (multiCropper) multiCropper.centerCrop();
        });
        document.getElementById('btn-multi-rotate-cw')?.addEventListener('click', () => {
            if (multiCropper) multiCropper.rotate(90);
        });
    }

    bindDesktopToolbarEvents() {
        // Initialize accordion parent registry for teleportation
        this.accordionParents = {};
        document.querySelectorAll('.edit-accordion').forEach(acc => {
            this.accordionParents[acc.id] = acc.parentElement;
        });

        const toolButtons = document.querySelectorAll('.tool-btn');
        const accordions = document.querySelectorAll('.edit-accordion');

        toolButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                
                // Only act if we are on desktop single view
                if (!document.body.classList.contains('desktop-single-view')) return;

                const targetId = btn.getAttribute('data-target');
                const targetAccordion = document.getElementById(targetId);
                
                if (!targetAccordion) return;

                const isAlreadyActive = btn.classList.contains('active');

                // Close all popups and remove active state from buttons
                this.closeAllDesktopPopups();

                if (!isAlreadyActive) {
                    // Open this one
                    btn.classList.add('active');
                    targetAccordion.classList.add('popup-active');
                    targetAccordion.setAttribute('open', '');
                    
                    // Teleport the accordion to .views-container to escape any grid cell overflow clipping
                    const viewsContainer = document.querySelector('.views-container');
                    if (viewsContainer && targetAccordion.parentElement !== viewsContainer) {
                        viewsContainer.appendChild(targetAccordion);
                    }
                    
                    // Align the popup vertically and horizontally with the clicked button
                    this.alignPopupWithButton(targetAccordion, btn);
                }
            });
        });

        // Close popup when clicking summary or toggling details
        accordions.forEach(acc => {
            acc.addEventListener('toggle', () => {
                if (!document.body.classList.contains('desktop-single-view')) return;
                
                // If it was closed natively (by clicking summary or X)
                if (!acc.hasAttribute('open')) {
                    acc.classList.remove('popup-active');
                    acc.style.top = '';
                    acc.style.right = '';
                    
                    // Teleport back to its original parent
                    const originalParent = this.accordionParents[acc.id];
                    if (originalParent && acc.parentElement !== originalParent) {
                        originalParent.appendChild(acc);
                    }

                    const targetBtn = document.querySelector(`.tool-btn[data-target="${acc.id}"]`);
                    if (targetBtn) {
                        targetBtn.classList.remove('active');
                    }
                }
            });

            // Prevent clicks inside popup from propagation (so it doesn't close via body click)
            acc.addEventListener('click', (e) => {
                if (document.body.classList.contains('desktop-single-view')) {
                    e.stopPropagation();
                }
            });
        });

        // Close popups when clicking outside
        document.addEventListener('click', (e) => {
            if (document.body.classList.contains('desktop-single-view')) {
                // If we click outside the active popup and toolbar buttons
                const activePopup = document.querySelector('.edit-accordion.popup-active');
                if (activePopup) {
                    // Check if click was outside the active popup and not on a toolbar button
                    const clickedButton = e.target.closest('.tool-btn');
                    const clickedInsidePopup = e.target.closest('.edit-accordion.popup-active');
                    if (!clickedButton && !clickedInsidePopup) {
                        this.closeAllDesktopPopups();
                    }
                }
            }
        });
    }

    closeAllDesktopPopups() {
        document.querySelectorAll('.tool-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.edit-accordion').forEach(acc => {
            acc.classList.remove('popup-active');
            acc.removeAttribute('open');
            acc.style.top = ''; // Reset inline top position
            acc.style.right = ''; // Reset inline right position
            
            // Restore back to original parent if teleported
            const originalParent = this.accordionParents ? this.accordionParents[acc.id] : null;
            if (originalParent && acc.parentElement !== originalParent) {
                originalParent.appendChild(acc);
            }
        });
    }

    alignPopupWithButton(popup, button) {
        const viewsContainer = document.querySelector('.views-container');
        if (!viewsContainer) return;

        const containerRect = viewsContainer.getBoundingClientRect();
        const btnRect = button.getBoundingClientRect();

        // 1. Calculate dynamic right offset to float exactly 15px left of the sidebar
        const controlsPanel = document.querySelector('#view-edit .controls-panel');
        if (controlsPanel) {
            const panelRect = controlsPanel.getBoundingClientRect();
            const rightOffset = containerRect.right - panelRect.left + 15;
            popup.style.right = `${rightOffset}px`;
        } else {
            popup.style.right = '440px'; // Fallback
        }

        // 2. Calculate dynamic top offset relative to viewsContainer (since it's teleported there)
        const popupHeight = popup.offsetHeight || 380;
        const containerHeight = containerRect.height;
        const btnHeight = btnRect.height;
        
        // Target top relative to viewsContainer
        let targetTop = (btnRect.top - containerRect.top) - (popupHeight / 2) + (btnHeight / 2);

        // Adjust boundaries so it doesn't overflow container top/bottom
        if (targetTop + popupHeight > containerHeight - 15) {
            targetTop = containerHeight - popupHeight - 15;
        }
        if (targetTop < 15) {
            targetTop = 15;
        }

        popup.style.top = `${targetTop}px`;
    }

    bindPreviewZoomEvents() {
        const btnZoomIn = document.getElementById('btn-zoom-in-a4');
        const btnZoomOut = document.getElementById('btn-zoom-out-a4');
        const btnZoomReset = document.getElementById('btn-zoom-reset-a4');
        const a4Container = document.getElementById('a4-container');
        const previewPanel = document.querySelector('#view-export .preview-panel');

        if (!a4Container || !previewPanel) return;

        const updateTransform = () => {
            a4Container.style.transform = `translate(${this.a4PanX}px, ${this.a4PanY}px) scale(${this.a4Zoom})`;
        };

        const handleZoomIn = (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (this.a4Zoom < 3.0) {
                this.a4Zoom += 0.15;
                updateTransform();
            }
        };
        btnZoomIn.addEventListener('click', handleZoomIn);
        btnZoomIn.addEventListener('touchstart', handleZoomIn, { passive: false });

        const handleZoomOut = (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (this.a4Zoom > 0.5) {
                this.a4Zoom -= 0.15;
                updateTransform();
            }
        };
        btnZoomOut.addEventListener('click', handleZoomOut);
        btnZoomOut.addEventListener('touchstart', handleZoomOut, { passive: false });

        const handleReset = (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.a4Zoom = 1.0;
            this.a4PanX = 0;
            this.a4PanY = 0;
            updateTransform();
        };
        btnZoomReset.addEventListener('click', handleReset);
        btnZoomReset.addEventListener('touchstart', handleReset, { passive: false });

        // Mouse Drag to Pan
        previewPanel.addEventListener('mousedown', (e) => {
            if (e.button !== 0) return;
            if (e.target.closest('.preview-zoom-toolbar') || e.target.closest('.print-info-overlay')) return;

            this.isPanning = true;
            this.panStartX = e.clientX - this.a4PanX;
            this.panStartY = e.clientY - this.a4PanY;
            previewPanel.style.cursor = 'grabbing';
            e.preventDefault();
        });

        document.addEventListener('mousemove', (e) => {
            if (!this.isPanning) return;
            this.a4PanX = e.clientX - this.panStartX;
            this.a4PanY = e.clientY - this.panStartY;
            updateTransform();
        });

        document.addEventListener('mouseup', () => {
            if (this.isPanning) {
                this.isPanning = false;
                previewPanel.style.cursor = '';
            }
        });

        // Touch Drag to Pan
        previewPanel.addEventListener('touchstart', (e) => {
            if (e.target.closest('.preview-zoom-toolbar') || e.target.closest('.print-info-overlay')) return;
            if (e.touches.length === 1) {
                this.isPanning = true;
                this.panStartX = e.touches[0].clientX - this.a4PanX;
                this.panStartY = e.touches[0].clientY - this.a4PanY;
            }
        }, { passive: true });

        previewPanel.addEventListener('touchmove', (e) => {
            if (!this.isPanning || e.touches.length !== 1) return;
            this.a4PanX = e.touches[0].clientX - this.panStartX;
            this.a4PanY = e.touches[0].clientY - this.panStartY;
            updateTransform();
        }, { passive: true });

        previewPanel.addEventListener('touchend', () => {
            this.isPanning = false;
        });
    }
}

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});
