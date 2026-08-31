/* Reusable Custom Canvas-Based Cropper */
export class CustomCropper {
    constructor(wrapperElement, imageElementOrUrl, options = {}) {
        this.wrapper = wrapperElement;
        this.options = options;
        this.crop = { x: 0.1, y: 0.1, w: 0.8, h: 0.8 };
        this.rotation = 0;
        
        this.aspectRatio = options.aspectRatio || 1;
        this.showBiometricGuide = options.showBiometricGuide !== false;
        
        this.canvas = null;
        this.cropFrame = null;
        this.overlay = null;
        this.filters = options.filters || { brightness: 100, contrast: 100, saturation: 100 };
        this.isOriginalMode = options.isOriginalMode !== false;
        this.bgColor = options.bgColor || '#ffffff';
        this.onChange = options.onChange || (() => {});

        this.readyPromise = this.init(imageElementOrUrl);
        
        this.resizeHandler = () => this.setupCropperViewport();
        window.addEventListener('resize', this.resizeHandler);
    }

    async init(imageElementOrUrl) {
        return new Promise((resolve, reject) => {
            this.img = new Image();
            
            // Only set crossOrigin for http/https URLs, not blob/data
            if (typeof imageElementOrUrl === 'string' && imageElementOrUrl.startsWith('http')) {
                this.img.crossOrigin = 'anonymous';
            }
            
            this.img.onload = () => {
                this.crop = this.getDefaultCrop(this.img.width, this.img.height);
                this.setupCropperViewport();
                resolve();
            };
            this.img.onerror = (e) => {
                console.error("CustomCropper image load error:", e);
                resolve(); // resolve anyway to avoid hanging
            };
            if (typeof imageElementOrUrl === 'string') {
                this.img.src = imageElementOrUrl;
            } else if (imageElementOrUrl instanceof HTMLImageElement) {
                this.img.src = imageElementOrUrl.src;
            }
        });
    }

    getDefaultCrop(imgWidth, imgHeight) {
        const ar = this.aspectRatio;
        let w = 0.85;
        let h = w * (imgWidth / imgHeight) / ar;
        if (h > 0.85) {
            h = 0.85;
            w = h * ar / (imgWidth / imgHeight);
        }
        return {
            x: (1 - w) / 2,
            y: (1 - h) / 2,
            w: w,
            h: h
        };
    }

    getRotatedSourceCanvas(img, rotation, flipH = false, flipV = false) {
        const canvas = document.createElement('canvas');
        const rad = (rotation * Math.PI) / 180;
        const is90or270 = (rotation / 90) % 2 !== 0;
        
        canvas.width = is90or270 ? img.height : img.width;
        canvas.height = is90or270 ? img.width : img.height;
        
        const ctx = canvas.getContext('2d');
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(rad);
        
        const scaleX = flipH ? -1 : 1;
        const scaleY = flipV ? -1 : 1;
        ctx.scale(scaleX, scaleY);
        
        ctx.drawImage(img, -img.width / 2, -img.height / 2);
        
        return canvas;
    }

    setupCropperViewport() {
        if (!this.img) return;
        this.wrapper.innerHTML = '';

        const container = document.createElement('div');
        container.style.position = 'relative';
        container.style.width = '100%';
        container.style.height = '100%';
        container.style.display = 'flex';
        container.style.alignItems = 'center';
        container.style.justifyContent = 'center';

        this.canvas = document.createElement('canvas');
        this.canvas.style.display = 'block';

        container.appendChild(this.canvas);
        this.wrapper.appendChild(container);

        this.drawEditorImage();
        this.createCropBoxOverlay(container);
    }

    getBackgroundStyle(ctx, width, height) {
        if (this.bgColor === 'studio') {
            const gradient = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, Math.max(width, height));
            gradient.addColorStop(0, '#f8fafc');
            gradient.addColorStop(1, '#94a3b8');
            return gradient;
        } else if (this.bgColor === 'studio-blue') {
            const gradient = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, Math.max(width, height));
            gradient.addColorStop(0, '#a5c7f7');
            gradient.addColorStop(1, '#3b82f6');
            return gradient;
        } else if (this.bgColor === 'studio-warm') {
            const gradient = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, Math.max(width, height));
            gradient.addColorStop(0, '#fff7ed');
            gradient.addColorStop(1, '#fdba74');
            return gradient;
        }
        return this.bgColor;
    }

    drawEditorImage() {
        if (!this.canvas || !this.img) return;

        const img = this.getRotatedSourceCanvas(this.img, this.rotation);
        const maxW = this.wrapper.clientWidth - 20;
        const maxH = this.wrapper.clientHeight - 20;

        let scale = Math.min(maxW / img.width, maxH / img.height);
        this.canvas.width = img.width * scale;
        this.canvas.height = img.height * scale;

        const ctx = this.canvas.getContext('2d');
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        if (!this.isOriginalMode) {
            ctx.fillStyle = this.getBackgroundStyle(ctx, this.canvas.width, this.canvas.height);
            ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }

        ctx.filter = `brightness(${this.filters.brightness}%) contrast(${this.filters.contrast}%) saturate(${this.filters.saturation || 100}%)`;
        ctx.drawImage(img, 0, 0, this.canvas.width, this.canvas.height);
    }

    createCropBoxOverlay(container) {
        const existing = container.querySelector('.crop-box-overlay');
        if (existing) existing.remove();

        if (!this.canvas || !this.crop) return;

        const overlay = document.createElement('div');
        overlay.className = 'crop-box-overlay';
        overlay.style.left = `${this.canvas.offsetLeft}px`;
        overlay.style.top = `${this.canvas.offsetTop}px`;
        overlay.style.width = `${this.canvas.offsetWidth}px`;
        overlay.style.height = `${this.canvas.offsetHeight}px`;
        
        const cropFrame = document.createElement('div');
        cropFrame.className = 'crop-frame';
        this.cropFrame = cropFrame;

        const updateFrameStyle = () => {
            cropFrame.style.left = `${this.crop.x * this.canvas.offsetWidth}px`;
            cropFrame.style.top = `${this.crop.y * this.canvas.offsetHeight}px`;
            cropFrame.style.width = `${this.crop.w * this.canvas.offsetWidth}px`;
            cropFrame.style.height = `${this.crop.h * this.canvas.offsetHeight}px`;
        };
        updateFrameStyle();

        // Inject biometric guide SVG inside cropFrame if enabled
        if (this.showBiometricGuide) {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = `
<svg id="biometric-guide-svg" viewBox="0 0 100 100" preserveAspectRatio="none" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 5;">
    <ellipse cx="50" cy="46" rx="26" ry="34" stroke="#ffffff" stroke-width="1.5" stroke-dasharray="3 3" fill="none" opacity="0.85" />
    <ellipse cx="50" cy="46" rx="26" ry="34" stroke="var(--primary)" stroke-width="1" stroke-dasharray="3 3" fill="none" />
    <line x1="15" y1="43" x2="85" y2="43" stroke="#ffffff" stroke-width="1.5" stroke-dasharray="2 2" fill="none" opacity="0.85" />
    <line x1="15" y1="43" x2="85" y2="43" stroke="var(--primary)" stroke-width="1" stroke-dasharray="2 2" fill="none" />
    <line x1="40" y1="12" x2="60" y2="12" stroke="var(--primary)" stroke-width="1.2" />
    <line x1="40" y1="80" x2="60" y2="80" stroke="var(--primary)" stroke-width="1.2" />
    <text x="50" y="8" font-size="4.5" fill="var(--primary)" font-weight="bold" text-anchor="middle" font-family="sans-serif">HAIRLINE</text>
    <text x="50" y="87" font-size="4.5" fill="var(--primary)" font-weight="bold" text-anchor="middle" font-family="sans-serif">CHIN</text>
</svg>`;
            cropFrame.appendChild(tempDiv.firstElementChild);
        }

        const handles = ['tl', 'tr', 'bl', 'br', 't', 'b', 'l', 'r'];
        handles.forEach(h => {
            const handle = document.createElement('div');
            handle.className = `crop-handle handle-${h}`;
            cropFrame.appendChild(handle);

            const onStart = (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.startCropResize(e, h, updateFrameStyle);
            };
            handle.addEventListener('mousedown', onStart);
            handle.addEventListener('touchstart', onStart);
        });

        const onDragStart = (e) => {
            if (e.target.classList.contains('crop-handle')) return;
            e.preventDefault();
            this.startCropDrag(e, updateFrameStyle);
        };
        cropFrame.addEventListener('mousedown', onDragStart);
        cropFrame.addEventListener('touchstart', onDragStart);

        overlay.appendChild(cropFrame);
        container.appendChild(overlay);
    }

    startCropDrag(e, updateFrameStyle) {
        const touch = e.touches ? e.touches[0] : e;
        const startMouseX = touch.clientX;
        const startMouseY = touch.clientY;
        const startCropX = this.crop.x;
        const startCropY = this.crop.y;

        const onMouseMove = (moveEvent) => {
            const mTouch = moveEvent.touches ? moveEvent.touches[0] : moveEvent;
            const deltaX = (mTouch.clientX - startMouseX) / this.canvas.offsetWidth;
            const deltaY = (mTouch.clientY - startMouseY) / this.canvas.offsetHeight;

            let newX = startCropX + deltaX;
            let newY = startCropY + deltaY;

            newX = Math.max(0, Math.min(1 - this.crop.w, newX));
            newY = Math.max(0, Math.min(1 - this.crop.h, newY));

            this.crop.x = newX;
            this.crop.y = newY;

            updateFrameStyle();
            this.onChange();
        };

        const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            document.removeEventListener('touchmove', onMouseMove);
            document.removeEventListener('touchend', onMouseUp);
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
        document.addEventListener('touchmove', onMouseMove, { passive: false });
        document.addEventListener('touchend', onMouseUp);
    }

    startCropResize(e, handle, updateFrameStyle) {
        const touch = e.touches ? e.touches[0] : e;
        const startMouseX = touch.clientX;
        const startMouseY = touch.clientY;
        const startCrop = { x: this.crop.x, y: this.crop.y, w: this.crop.w, h: this.crop.h };
        
        const canvasW = this.canvas.offsetWidth;
        const canvasH = this.canvas.offsetHeight;
        const ar = this.aspectRatio;
        const nRatio = ar * (canvasH / canvasW);

        const onMouseMove = (moveEvent) => {
            const mTouch = moveEvent.touches ? moveEvent.touches[0] : moveEvent;
            let deltaX = (mTouch.clientX - startMouseX) / canvasW;
            let deltaY = (mTouch.clientY - startMouseY) / canvasH;

            let newX = startCrop.x;
            let newY = startCrop.y;
            let newW = startCrop.w;
            let newH = startCrop.h;

            if (handle === 'tr') {
                newW = Math.max(0.1, Math.min(1 - startCrop.x, startCrop.w + deltaX));
                newH = newW / nRatio;
                newY = startCrop.y + startCrop.h - newH;
            } else if (handle === 'tl') {
                newW = Math.max(0.1, Math.min(startCrop.x + startCrop.w, startCrop.w - deltaX));
                newH = newW / nRatio;
                newX = startCrop.x + startCrop.w - newW;
                newY = startCrop.y + startCrop.h - newH;
            } else if (handle === 'br') {
                newW = Math.max(0.1, Math.min(1 - startCrop.x, startCrop.w + deltaX));
                newH = newW / nRatio;
            } else if (handle === 'bl') {
                newW = Math.max(0.1, Math.min(startCrop.x + startCrop.w, startCrop.w - deltaX));
                newH = newW / nRatio;
                newX = startCrop.x + startCrop.w - newW;
            } else if (handle === 't') {
                newH = Math.max(0.1, Math.min(startCrop.y + startCrop.h, startCrop.h - deltaY));
                newW = newH * nRatio;
                newY = startCrop.y + startCrop.h - newH;
                newX = startCrop.x + (startCrop.w - newW) / 2;
            } else if (handle === 'b') {
                newH = Math.max(0.1, Math.min(1 - startCrop.y, startCrop.h + deltaY));
                newW = newH * nRatio;
                newX = startCrop.x + (startCrop.w - newW) / 2;
            } else if (handle === 'l') {
                newW = Math.max(0.1, Math.min(startCrop.x + startCrop.w, startCrop.w - deltaX));
                newH = newW / nRatio;
                newX = startCrop.x + startCrop.w - newW;
                newY = startCrop.y + (startCrop.h - newH) / 2;
            } else if (handle === 'r') {
                newW = Math.max(0.1, Math.min(1 - startCrop.x, startCrop.w + deltaX));
                newH = newW / nRatio;
                newY = startCrop.y + (startCrop.h - newH) / 2;
            }

            if (newX < 0) {
                newW += newX;
                newH = newW / nRatio;
                newX = 0;
            }
            if (newY < 0) {
                newH += newY;
                newW = newH * nRatio;
                newY = 0;
            }
            if (newX + newW > 1) {
                newW = 1 - newX;
                newH = newW / nRatio;
            }
            if (newY + newH > 1) {
                newH = 1 - newY;
                newW = newH * nRatio;
            }

            this.crop.x = newX;
            this.crop.y = newY;
            this.crop.w = newW;
            this.crop.h = newH;

            updateFrameStyle();
            this.onChange();
        };

        const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            document.removeEventListener('touchmove', onMouseMove);
            document.removeEventListener('touchend', onMouseUp);
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
        document.addEventListener('touchmove', onMouseMove, { passive: false });
        document.addEventListener('touchend', onMouseUp);
    }

    nudge(direction, step = 0.01) {
        if (!this.crop) return;
        if (direction === 'up') {
            this.crop.y = Math.max(0, this.crop.y - step);
        } else if (direction === 'down') {
            this.crop.y = Math.min(1 - this.crop.h, this.crop.y + step);
        } else if (direction === 'left') {
            this.crop.x = Math.max(0, this.crop.x - step);
        } else if (direction === 'right') {
            this.crop.x = Math.min(1 - this.crop.w, this.crop.x + step);
        }
        this.updateOverlayStyles();
        this.onChange();
    }

    scaleCrop(step = 0.01) {
        if (!this.crop || !this.canvas) return;
        
        const ar = this.aspectRatio;
        const canvasW = this.canvas.offsetWidth;
        const canvasH = this.canvas.offsetHeight;
        const nRatio = ar * (canvasH / canvasW);

        const cx = this.crop.x + this.crop.w / 2;
        const cy = this.crop.y + this.crop.h / 2;

        const newW = Math.max(0.1, Math.min(1, this.crop.w + step * 2));
        const newH = newW / nRatio;

        if (cx - newW / 2 >= 0 && cx + newW / 2 <= 1 && cy - newH / 2 >= 0 && cy + newH / 2 <= 1) {
            this.crop.w = newW;
            this.crop.h = newH;
            this.crop.x = cx - newW / 2;
            this.crop.y = cy - newH / 2;
        } else {
            let x = cx - newW / 2;
            let y = cy - newH / 2;
            let w = newW;
            let h = newH;
            if (x < 0) { x = 0; }
            if (y < 0) { y = 0; }
            if (x + w > 1) { w = 1 - x; h = w / nRatio; }
            if (y + h > 1) { h = 1 - y; w = h * nRatio; }
            
            this.crop.x = x;
            this.crop.y = y;
            this.crop.w = w;
            this.crop.h = h;
        }

        this.updateOverlayStyles();
        this.onChange();
    }

    centerCrop() {
        if (!this.crop) return;
        this.crop.x = (1 - this.crop.w) / 2;
        this.crop.y = (1 - this.crop.h) / 2;
        this.updateOverlayStyles();
        this.onChange();
    }

    rotate(angle) {
        this.rotation = (this.rotation + angle + 360) % 360;
        
        const is90or270 = (this.rotation / 90) % 2 !== 0;
        const w = is90or270 ? this.img.height : this.img.width;
        const h = is90or270 ? this.img.width : this.img.height;
        this.crop = this.getDefaultCrop(w, h);

        this.setupCropperViewport();
        this.onChange();
    }

    setAspectRatio(ar) {
        this.aspectRatio = ar;
        if (this.img) {
            const is90or270 = (this.rotation / 90) % 2 !== 0;
            const w = is90or270 ? this.img.height : this.img.width;
            const h = is90or270 ? this.img.width : this.img.height;
            this.crop = this.getDefaultCrop(w, h);
            this.setupCropperViewport();
        }
    }

    setBiometricGuideVisible(visible) {
        this.showBiometricGuide = visible;
        const svg = this.wrapper.querySelector('#biometric-guide-svg');
        if (svg) {
            svg.style.display = visible ? 'block' : 'none';
        }
    }

    setBackgroundColor(color) {
        this.bgColor = color;
        this.drawEditorImage();
    }

    setFilters(filters) {
        this.filters = filters;
        this.drawEditorImage();
    }

    setMode(mode) {
        this.isOriginalMode = (mode === 'original');
        this.drawEditorImage();
    }

    updateOverlayStyles() {
        if (this.cropFrame && this.canvas) {
            this.cropFrame.style.left = `${this.crop.x * this.canvas.offsetWidth}px`;
            this.cropFrame.style.top = `${this.crop.y * this.canvas.offsetHeight}px`;
            this.cropFrame.style.width = `${this.crop.w * this.canvas.offsetWidth}px`;
            this.cropFrame.style.height = `${this.crop.h * this.canvas.offsetHeight}px`;
        }
    }

    runSmartCrop(faceBox) {
        if (!faceBox || !this.img) return;

        const imgW = this.img.width;
        const imgH = this.img.height;

        const faceWidth = faceBox.width;
        const faceHeight = faceBox.height;
        const faceX = faceBox.x;
        const faceY = faceBox.y;

        const cropHeight = faceHeight * 1.55;
        const cropWidth = cropHeight * this.aspectRatio;

        let finalCropHeight = cropHeight;
        let finalCropWidth = cropWidth;

        if (finalCropHeight > imgH) {
            finalCropHeight = imgH;
            finalCropWidth = finalCropHeight * this.aspectRatio;
        }
        if (finalCropWidth > imgW) {
            finalCropWidth = imgW;
            finalCropHeight = finalCropWidth / this.aspectRatio;
        }

        let cropX = faceX - (finalCropWidth - faceWidth) / 2;
        let cropY = faceY - (finalCropHeight * 0.15);

        cropX = Math.max(0, Math.min(cropX, imgW - finalCropWidth));
        cropY = Math.max(0, Math.min(cropY, imgH - finalCropHeight));

        this.crop = {
            x: cropX / imgW,
            y: cropY / imgH,
            w: finalCropWidth / imgW,
            h: finalCropHeight / imgH
        };

        this.updateOverlayStyles();
        this.onChange();
    }

    getCroppedCanvas(options = {}) {
        if (!this.img || !this.crop) return null;

        const srcCanvas = this.getRotatedSourceCanvas(this.img, this.rotation);
        const canvas = document.createElement('canvas');
        
        const sourceX = this.crop.x * srcCanvas.width;
        const sourceY = this.crop.y * srcCanvas.height;
        const sourceW = this.crop.w * srcCanvas.width;
        const sourceH = this.crop.h * srcCanvas.height;

        canvas.width = options.width || sourceW;
        canvas.height = options.height || sourceH;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(srcCanvas, sourceX, sourceY, sourceW, sourceH, 0, 0, canvas.width, canvas.height);
        
        return canvas;
    }

    destroy() {
        window.removeEventListener('resize', this.resizeHandler);
        this.wrapper.innerHTML = '';
    }
}

/* Photo Editor Service Class */
export class EditorService {
    constructor(faceDetector) {
        this.faceDetector = faceDetector;
        this.cropper = null;
        this.bgColor = '#ffffff';
        this.isOriginalMode = false;
        this.filters = {
            brightness: 100,
            contrast: 100,
            saturation: 100
        };
        
        this.cropWidthCm = 3;
        this.cropHeightCm = 4;
        this.wInput = document.getElementById('custom-width');
        this.hInput = document.getElementById('custom-height');
    }

    setMode(mode) {
        this.isOriginalMode = (mode === 'original');
        if (this.cropper) {
            this.cropper.setMode(mode);
        }
    }

    initControls() {
        // Brightness
        const brSlider = document.getElementById('adj-brightness');
        const brVal = document.getElementById('val-brightness');
        brSlider.addEventListener('input', (e) => {
            this.filters.brightness = e.target.value;
            brVal.innerText = `${e.target.value}%`;
            this.applyFilters();
        });

        // Contrast
        const cSlider = document.getElementById('adj-contrast');
        const cVal = document.getElementById('val-contrast');
        cSlider.addEventListener('input', (e) => {
            this.filters.contrast = e.target.value;
            cVal.innerText = `${e.target.value}%`;
            this.applyFilters();
        });

        // Saturation
        const sSlider = document.getElementById('adj-saturation');
        const sVal = document.getElementById('val-saturation');
        sSlider.addEventListener('input', (e) => {
            this.filters.saturation = e.target.value;
            sVal.innerText = `${e.target.value}%`;
            this.applyFilters();
        });

        // Rotation & Zoom
        document.getElementById('btn-rotate-left').addEventListener('click', () => {
            if (this.cropper) {
                this.cropper.rotate(-90);
                if (window.innerWidth >= 992 && window.app) window.app.updatePrintLayout();
            }
        });
        document.getElementById('btn-rotate-right').addEventListener('click', () => {
            if (this.cropper) {
                this.cropper.rotate(90);
                if (window.innerWidth >= 992 && window.app) window.app.updatePrintLayout();
            }
        });
        document.getElementById('btn-zoom-in').addEventListener('click', () => {
            if (this.cropper) {
                this.cropper.scaleCrop(-0.02);
                if (window.innerWidth >= 992 && window.app) window.app.debouncedUpdatePrintLayout();
            }
        });
        document.getElementById('btn-zoom-out').addEventListener('click', () => {
            if (this.cropper) {
                this.cropper.scaleCrop(0.02);
                if (window.innerWidth >= 992 && window.app) window.app.debouncedUpdatePrintLayout();
            }
        });
        document.getElementById('btn-reset-crop').addEventListener('click', () => {
            if (this.cropper) {
                this.cropper.rotation = 0;
                this.cropper.crop = this.cropper.getDefaultCrop(this.cropper.img.width, this.cropper.img.height);
                this.cropper.setupCropperViewport();
            }
            
            // Reset filters
            this.filters = { brightness: 100, contrast: 100, saturation: 100 };
            document.getElementById('adj-brightness').value = 100;
            document.getElementById('val-brightness').innerText = '100%';
            document.getElementById('adj-contrast').value = 100;
            document.getElementById('val-contrast').innerText = '100%';
            document.getElementById('adj-saturation').value = 100;
            document.getElementById('val-saturation').innerText = '100%';
            this.applyFilters();

            if (window.innerWidth >= 992 && window.app) window.app.updatePrintLayout();
        });

        // Wire Nudge Controls
        document.getElementById('btn-nudge-up')?.addEventListener('click', () => {
            if (this.cropper) this.cropper.nudge('up');
        });
        document.getElementById('btn-nudge-down')?.addEventListener('click', () => {
            if (this.cropper) this.cropper.nudge('down');
        });
        document.getElementById('btn-nudge-left')?.addEventListener('click', () => {
            if (this.cropper) this.cropper.nudge('left');
        });
        document.getElementById('btn-nudge-right')?.addEventListener('click', () => {
            if (this.cropper) this.cropper.nudge('right');
        });
        document.getElementById('btn-nudge-shrink')?.addEventListener('click', () => {
            if (this.cropper) this.cropper.scaleCrop(-0.02);
        });
        document.getElementById('btn-nudge-grow')?.addEventListener('click', () => {
            if (this.cropper) this.cropper.scaleCrop(0.02);
        });
        document.getElementById('btn-center-crop')?.addEventListener('click', () => {
            if (this.cropper) this.cropper.centerCrop();
        });

        // Custom Size Logic
        const sizeSelect = document.getElementById('preset-size');
        
        const updateAspectRatio = (w, h) => {
            w = Math.max(0.5, w);
            h = Math.max(0.5, h);
            
            this.cropWidthCm = w;
            this.cropHeightCm = h;
            this.wInput.value = w;
            this.hInput.value = h;
            
            if (this.cropper) {
                this.cropper.setAspectRatio(w / h);
            }
        };

        sizeSelect.addEventListener('change', (e) => {
            const val = e.target.value;
            if (val === 'custom') {
                const w = parseFloat(this.wInput.value) || 3;
                const h = parseFloat(this.hInput.value) || 4;
                updateAspectRatio(w, h);
            } else {
                const [w, h] = val.split(',').map(Number);
                updateAspectRatio(w, h);
            }
            if (window.innerWidth >= 992 && window.app) window.app.updatePrintLayout();
        });

        let customDebounce = null;
        const handleCustomInput = () => {
            sizeSelect.value = 'custom';
            clearTimeout(customDebounce);
            customDebounce = setTimeout(() => {
                const w = parseFloat(this.wInput.value);
                const h = parseFloat(this.hInput.value);
                if (w > 0 && h > 0) {
                    updateAspectRatio(w, h);
                    if (window.innerWidth >= 992 && window.app) window.app.updatePrintLayout();
                }
            }, 300);
        };

        this.wInput.addEventListener('input', handleCustomInput);
        this.hInput.addEventListener('input', handleCustomInput);
        this.wInput.addEventListener('change', handleCustomInput);
        this.hInput.addEventListener('change', handleCustomInput);
    }

    setBackgroundColor(color) {
        this.bgColor = color;
        if (this.cropper) {
            this.cropper.setBackgroundColor(color);
        }
    }

    async loadImage(url) {
        if (this.cropper) {
            this.cropper.destroy();
        }

        const wrapper = document.getElementById('cropper-wrapper');
        this.cropper = new CustomCropper(wrapper, url, {
            aspectRatio: this.cropWidthCm / this.cropHeightCm,
            showBiometricGuide: window.app ? window.app.showBiometricGuide : true,
            filters: this.filters,
            isOriginalMode: this.isOriginalMode,
            bgColor: this.bgColor,
            onChange: () => {
                if (window.innerWidth >= 992 && window.app) {
                    window.app.debouncedUpdatePrintLayout();
                }
            }
        });

        await this.cropper.readyPromise;

        // Try Face Detection for smart crop
        if (this.faceDetector) {
            try {
                const detection = await this.faceDetector.detectFace(this.cropper.img);
                if (detection) {
                    this.cropper.runSmartCrop(detection.box);
                }
            } catch (e) {
                 console.warn("Face detection fallback to default crop", e);
            }
        }
    }

    applyFilters() {
        if (!this.cropper) return;
        this.cropper.setFilters(this.filters);
    }

    // Process all modifications into a single flattened canvas, then DataURL
    async getFinalImage() {
        return new Promise(async (resolve, reject) => {
            if (!this.cropper) return reject('No cropper initialized');

            const croppedCanvas = this.cropper.getCroppedCanvas({
                imageSmoothingEnabled: true,
                imageSmoothingQuality: 'high',
            });

            const finalCanvas = document.createElement('canvas');
            const ctx = finalCanvas.getContext('2d');
            
            finalCanvas.width = croppedCanvas.width;
            finalCanvas.height = croppedCanvas.height;

            if (this.isOriginalMode) {
                ctx.filter = `brightness(${this.filters.brightness}%) contrast(${this.filters.contrast}%) saturate(${this.filters.saturation}%)`;
                ctx.drawImage(croppedCanvas, 0, 0);
            } else {
                ctx.fillStyle = this.getBackgroundStyle(ctx, finalCanvas.width, finalCanvas.height);
                ctx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);

                ctx.filter = `brightness(${this.filters.brightness}%) contrast(${this.filters.contrast}%) saturate(${this.filters.saturation}%)`;
                ctx.drawImage(croppedCanvas, 0, 0);
            }

            if (this.isOriginalMode) {
                resolve(finalCanvas.toDataURL('image/jpeg', 1.0));
            } else {
                resolve(finalCanvas.toDataURL('image/png', 1.0));
            }
        });
    }

    // Download a single image with specific format, pixel dimensions, and target KB size
    async downloadSingleImage(format, widthPx, heightPx, targetKb = null) {
        if (!this.cropper) return;

        const croppedCanvas = this.cropper.getCroppedCanvas({
            width: widthPx,
            height: heightPx,
            imageSmoothingEnabled: true,
            imageSmoothingQuality: 'high',
        });

        const finalCanvas = document.createElement('canvas');
        const ctx = finalCanvas.getContext('2d');
        
        finalCanvas.width = widthPx;
        finalCanvas.height = heightPx;

        if (!this.isOriginalMode) {
            ctx.fillStyle = this.getBackgroundStyle(ctx, finalCanvas.width, finalCanvas.height);
            ctx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);
        }

        ctx.filter = `brightness(${this.filters.brightness}%) contrast(${this.filters.contrast}%) saturate(${this.filters.saturation}%)`;
        ctx.drawImage(croppedCanvas, 0, 0, widthPx, heightPx);

        let ext = format.split('/')[1] || 'jpg';
        if (ext === 'jpeg') ext = 'jpg';
        
        const fileName = `passport_photo_${widthPx}x${heightPx}.${ext}`;
        
        if (ext === 'jpg' && targetKb) {
            let quality = 0.95;
            let blob = null;
            const targetBytes = targetKb * 1024;
            
            for (let i = 0; i < 7; i++) {
                blob = await new Promise(resolve => finalCanvas.toBlob(resolve, 'image/jpeg', quality));
                if (blob.size <= targetBytes || quality <= 0.1) break;
                
                const ratio = targetBytes / blob.size;
                quality *= Math.max(0.5, Math.min(0.9, ratio));
            }
            
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.download = fileName;
            link.href = url;
            link.click();
            setTimeout(() => URL.revokeObjectURL(url), 100);
        } else {
            const link = document.createElement('a');
            link.download = fileName;
            link.href = finalCanvas.toDataURL(format, 1.0);
            link.click();
        }
    }

    getBackgroundStyle(ctx, width, height) {
        if (this.bgColor === 'studio') {
            const gradient = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, Math.max(width, height));
            gradient.addColorStop(0, '#f8fafc');
            gradient.addColorStop(1, '#94a3b8');
            return gradient;
        } else if (this.bgColor === 'studio-blue') {
            const gradient = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, Math.max(width, height));
            gradient.addColorStop(0, '#a5c7f7');
            gradient.addColorStop(1, '#3b82f6');
            return gradient;
        } else if (this.bgColor === 'studio-warm') {
            const gradient = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, Math.max(width, height));
            gradient.addColorStop(0, '#fff7ed');
            gradient.addColorStop(1, '#fdba74');
            return gradient;
        }
        return this.bgColor;
    }
}
