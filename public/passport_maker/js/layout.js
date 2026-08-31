export class LayoutService {
    constructor() {
        this.finalImageUrl = null;
        this.canvas = document.getElementById('a4-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.copies = 6;
        this.paperSize = 'A4';
        this.addTrim = true;
        this.addWatermark = false;
        this.showNameDate = false;
        this.photoName = '';
        this.photoDate = '';
        
        // New Border/Margin properties
        this.strokeWidth = 3;
        this.strokeColor = '#000000';
        this.padding = 50;
        this.gap = 24; // space between photos
        this.orientation = 'portrait';
        this.photosList = [];
        
        // Dimensions at 300 DPI
        this.dimensions = {
            'A4': { width: 2480, height: 3508 }, // 210 x 297 mm
            'A5': { width: 1748, height: 2480 }, // 148 x 210 mm
            'A6': { width: 1240, height: 1748 }, // 105 x 148 mm
            '4x6': { width: 1200, height: 1800 }, // 4"x6"
            '5x7': { width: 1500, height: 2100 }, // 5"x7"
            'letter': { width: 2550, height: 3300 }, // 8.5"x11"
            'card': { width: 1011, height: 638 },  // 85.6 x 53.98 mm (credit card @ 300 DPI)
            '3R': { width: 1050, height: 1500 }   // 3.5"x5" photo paper
        };
        
        this.photoWidth = 413;
        this.photoHeight = 531;

        this.initControls();
    }

    initControls() {
        // Copies
        const inputCopies = document.getElementById('input-copies');
        const btnMinus = document.getElementById('btn-copy-minus');
        const btnPlus = document.getElementById('btn-copy-plus');

        btnMinus.addEventListener('click', () => {
            if (this.copies > 1) {
                this.copies--;
                inputCopies.value = this.copies;
                if (this.photosList && this.photosList.length > 0) {
                    this.photosList[0].copies = this.copies;
                    this.updateMultiPhotosUI();
                }
                this.renderGrid();
            }
        });

        btnPlus.addEventListener('click', () => {
            if (this.copies < 30) {
                this.copies++;
                inputCopies.value = this.copies;
                if (this.photosList && this.photosList.length > 0) {
                    this.photosList[0].copies = this.copies;
                    this.updateMultiPhotosUI();
                }
                this.renderGrid();
            }
        });

        inputCopies.addEventListener('change', (e) => {
            let val = parseInt(e.target.value);
            if (val < 1) val = 1;
            if (val > 30) val = 30;
            this.copies = val;
            e.target.value = val;
            if (this.photosList && this.photosList.length > 0) {
                this.photosList[0].copies = this.copies;
                this.updateMultiPhotosUI();
            }
            this.renderGrid();
        });

        // New Layout Controls
        document.getElementById('input-stroke-width').addEventListener('input', (e) => {
            this.strokeWidth = parseInt(e.target.value);
            this.renderGrid();
        });

        document.getElementById('input-stroke-color').addEventListener('input', (e) => {
            this.strokeColor = e.target.value;
            this.renderGrid();
        });

        document.getElementById('input-page-margin').addEventListener('input', (e) => {
            this.padding = parseInt(e.target.value);
            this.renderGrid();
        });

        document.getElementById('input-image-gap').addEventListener('input', (e) => {
            this.gap = parseInt(e.target.value);
            this.renderGrid();
        });

        // Toggle Watermark
        document.getElementById('toggle-watermark').addEventListener('change', (e) => {
            this.addWatermark = e.target.checked;
            this.renderGrid();
        });

        // Toggle Name & Date
        const toggleNameDate = document.getElementById('toggle-namedate');
        const nameDateFields = document.getElementById('namedate-fields');
        toggleNameDate.addEventListener('change', (e) => {
            this.showNameDate = e.target.checked;
            if (e.target.checked) {
                nameDateFields.classList.remove('hidden');
            } else {
                nameDateFields.classList.add('hidden');
            }
            this.renderGrid();
        });

        document.getElementById('input-photo-name').addEventListener('input', (e) => {
            this.photoName = e.target.value.trim();
            this.renderGrid();
        });

        document.getElementById('input-photo-date').addEventListener('input', (e) => {
            this.photoDate = e.target.value.trim();
            this.renderGrid();
        });

        // Paper Format
        document.querySelectorAll('input[name="paper_size"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.paperSize = e.target.value;
                document.querySelectorAll('.radio-card').forEach(rc => {
                    if (rc.querySelector('input[name="paper_size"]')) {
                        rc.classList.remove('active');
                    }
                });
                e.target.closest('.radio-card').classList.add('active');
                this.renderGrid();
            });
        });

        // Orientation
        document.querySelectorAll('input[name="orientation"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.orientation = e.target.value;
                document.querySelectorAll('.radio-card').forEach(rc => {
                    if (rc.querySelector('input[name="orientation"]')) {
                        rc.classList.remove('active');
                    }
                });
                e.target.closest('.radio-card').classList.add('active');
                this.renderGrid();
            });
        });

        // Export Actions
        document.getElementById('btn-download-png').addEventListener('click', () => this.downloadPNG());
        document.getElementById('btn-download-pdf').addEventListener('click', () => this.downloadPDF());
        document.getElementById('btn-print').addEventListener('click', () => this.print());
        document.getElementById('btn-preview-layout').addEventListener('click', () => this.previewLayout());
    }

    init(dataUrl, photoWidthCm, photoHeightCm) {
        this.finalImageUrl = dataUrl;
        
        // Convert physical cm to pixels at 300 DPI (118.11 px/cm)
        this.photoWidth = Math.round(photoWidthCm * 118.11);
        this.photoHeight = Math.round(photoHeightCm * 118.11);
        
        // Seed the main photo
        if (this.photosList.length === 0) {
            this.photosList.push({
                id: 'main',
                dataUrl: dataUrl,
                width: this.photoWidth,
                height: this.photoHeight,
                copies: parseInt(document.getElementById('input-copies').value) || 6
            });
        } else {
            const mainPhoto = this.photosList.find(p => p.id === 'main');
            if (mainPhoto) {
                mainPhoto.dataUrl = dataUrl;
                mainPhoto.width = this.photoWidth;
                mainPhoto.height = this.photoHeight;
            }
        }
        
        this.updateMultiPhotosUI();
        this.renderGrid();
    }

    async renderGrid() {
        if (!this.finalImageUrl || this.photosList.length === 0) return;

        // Preload all photos in parallel
        const loadedImages = await Promise.all(this.photosList.map(photo => {
            return new Promise(resolve => {
                const img = new Image();
                img.onload = () => resolve({ photo, img });
                img.onerror = () => resolve({ photo, img: null });
                img.src = photo.dataUrl;
            });
        }));

        const currentSettings = this.dimensions[this.paperSize];
        if (this.orientation === 'landscape') {
            this.canvas.width = currentSettings.height;
            this.canvas.height = currentSettings.width;
        } else {
            this.canvas.width = currentSettings.width;
            this.canvas.height = currentSettings.height;
        }

        // Update preview wrapper aspect ratio dynamically
        const wrapper = document.getElementById('a4-container');
        if (wrapper) {
            wrapper.style.aspectRatio = `${this.canvas.width} / ${this.canvas.height}`;
        }

        // Draw white background
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        let count = 0;
        let currentX = this.padding;
        let currentY = this.padding;
        let rowMaxHeight = 0;

        const getNameDateHeight = (photo) => {
            if (!this.showNameDate) return 0;
            const fontSize = Math.round(photo.width * 0.065);
            const lineHeight = Math.round(fontSize * 1.4);
            let h = 0;
            if (this.photoName || this.photoDate) {
                h = lineHeight;
                if (this.photoName && this.photoDate) {
                    h = lineHeight * 2;
                }
                h += 6; // margin
            }
            return h;
        };

        for (const { photo, img } of loadedImages) {
            if (!img) continue;

            const textBlockHeight = getNameDateHeight(photo);
            const cellHeight = photo.height + textBlockHeight;

            for (let c = 0; c < photo.copies; c++) {
                // Check if this photo fits in the current row
                if (currentX + photo.width > this.canvas.width - this.padding) {
                    // Wrap to next row
                    currentX = this.padding;
                    currentY += rowMaxHeight + this.gap;
                    rowMaxHeight = 0;
                }

                // Prevent drawing outside the canvas height
                if (currentY + cellHeight > this.canvas.height - this.padding) {
                    break;
                }

                // Draw photo image
                this.ctx.drawImage(img, currentX, currentY, photo.width, photo.height);

                // Draw stroke border
                if (this.strokeWidth > 0) {
                    this.ctx.strokeStyle = this.strokeColor;
                    this.ctx.lineWidth = this.strokeWidth;
                    this.ctx.strokeRect(currentX, currentY, photo.width, photo.height);
                }

                // Draw name & date text below photo
                if (textBlockHeight > 0) {
                    this.ctx.save();
                    const fontSize = Math.round(photo.width * 0.065);
                    const lineHeight = Math.round(fontSize * 1.4);
                    this.ctx.font = `500 ${fontSize}px Inter, sans-serif`;
                    this.ctx.fillStyle = '#1e293b';
                    this.ctx.textAlign = 'center';

                    let textY = currentY + photo.height + 6 + fontSize;
                    if (this.photoName) {
                        this.ctx.fillText(this.photoName, currentX + photo.width / 2, textY, photo.width);
                        textY += lineHeight;
                    }
                    if (this.photoDate) {
                        this.ctx.font = `400 ${Math.round(fontSize * 0.85)}px Inter, sans-serif`;
                        this.ctx.fillStyle = '#64748b';
                        this.ctx.fillText(this.photoDate, currentX + photo.width / 2, textY, photo.width);
                    }
                    this.ctx.restore();
                }

                // Draw watermark
                if (this.addWatermark) {
                    this.ctx.save();
                    this.ctx.translate(currentX + photo.width / 2, currentY + photo.height / 2);
                    this.ctx.rotate(-Math.PI / 4);
                    this.ctx.font = "bold 60px Inter";
                    this.ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
                    this.ctx.textAlign = "center";
                    this.ctx.fillText("PREVIEW", 0, 0);
                    this.ctx.restore();
                }

                count++;
                rowMaxHeight = Math.max(rowMaxHeight, cellHeight);
                currentX += photo.width + this.gap;
            }
        }
        
        // Update live print status overlay info
        const infoPaper = document.getElementById('info-paper-size');
        const infoCopies = document.getElementById('info-copies-count');
        const infoPhoto = document.getElementById('info-photo-dims');

        if (infoPaper) {
            const paperText = this.paperSize === 'card' ? 'Credit Card' : this.paperSize;
            infoPaper.innerText = `${paperText} (${this.orientation.charAt(0).toUpperCase() + this.orientation.slice(1)})`;
        }
        if (infoCopies) {
            infoCopies.innerText = `${count} Photo${count !== 1 ? 's' : ''}`;
        }
        if (infoPhoto) {
            if (this.photosList.length === 1) {
                const wVal = parseFloat(document.getElementById('custom-width').value) || 3;
                const hVal = parseFloat(document.getElementById('custom-height').value) || 4;
                infoPhoto.innerText = `${wVal} × ${hVal} cm`;
            } else {
                infoPhoto.innerText = 'Mixed Sizes';
            }
        }

        const totalRequestedCopies = this.photosList.reduce((acc, p) => acc + p.copies, 0);
        if (count < totalRequestedCopies) {
            window.app.showToast(`Only ${count} of ${totalRequestedCopies} photos fit on ${this.paperSize} paper`, 'warning');
        }
    }

    updateMultiPhotosUI() {
        const listContainer = document.getElementById('multi-photos-list');
        if (!listContainer) return;

        listContainer.innerHTML = '';
        this.photosList.forEach((photo, index) => {
            const item = document.createElement('div');
            item.className = 'flex items-center justify-between bg-darker p-2.5 rounded-lg border border-border';
            item.style.gap = '0.5rem';

            // Left side: thumbnail + label
            const left = document.createElement('div');
            left.className = 'flex items-center gap-2';

            const thumb = document.createElement('img');
            thumb.src = photo.dataUrl;
            thumb.style.width = '35px';
            thumb.style.height = '45px';
            thumb.style.objectFit = 'cover';
            thumb.style.borderRadius = 'var(--radius-sm)';
            thumb.style.border = '1px solid var(--border)';

            const textDiv = document.createElement('div');
            const title = document.createElement('span');
            title.className = 'text-xs font-semibold block';
            title.innerText = photo.id === 'main' ? 'Main Photo' : `Photo ${index + 1}`;

            const sizeLabel = document.createElement('span');
            sizeLabel.className = 'text-muted block';
            sizeLabel.style.fontSize = '0.65rem';
            sizeLabel.innerText = `${Math.round(photo.width / 118.11 * 10) / 10} × ${Math.round(photo.height / 118.11 * 10) / 10} cm`;

            textDiv.appendChild(title);
            textDiv.appendChild(sizeLabel);
            left.appendChild(thumb);
            left.appendChild(textDiv);

            // Right side: copies input + optional delete
            const right = document.createElement('div');
            right.className = 'flex items-center gap-2';

            // Copies counter
            const copyCtrl = document.createElement('div');
            copyCtrl.className = 'flex items-center border border-border rounded-md overflow-hidden bg-bg';
            
            const btnMinus = document.createElement('button');
            btnMinus.className = 'px-1.5 py-0.5 text-xs hover:bg-darker transition';
            btnMinus.innerHTML = '<i class="ph ph-minus"></i>';
            btnMinus.onclick = () => {
                if (photo.copies > 1) {
                    photo.copies--;
                    copiesVal.innerText = photo.copies;
                    // Sync main copies input if this is the main photo
                    if (photo.id === 'main') {
                        document.getElementById('input-copies').value = photo.copies;
                    }
                    this.renderGrid();
                }
            };

            const copiesVal = document.createElement('span');
            copiesVal.className = 'px-2 text-xs font-bold';
            copiesVal.innerText = photo.copies;

            const btnPlus = document.createElement('button');
            btnPlus.className = 'px-1.5 py-0.5 text-xs hover:bg-darker transition';
            btnPlus.innerHTML = '<i class="ph ph-plus"></i>';
            btnPlus.onclick = () => {
                if (photo.copies < 30) {
                    photo.copies++;
                    copiesVal.innerText = photo.copies;
                    // Sync main copies input if this is the main photo
                    if (photo.id === 'main') {
                        document.getElementById('input-copies').value = photo.copies;
                    }
                    this.renderGrid();
                }
            };

            copyCtrl.appendChild(btnMinus);
            copyCtrl.appendChild(copiesVal);
            copyCtrl.appendChild(btnPlus);
            right.appendChild(copyCtrl);

            // Delete button (only for added photos)
            if (photo.id !== 'main') {
                const btnDel = document.createElement('button');
                btnDel.className = 'text-red hover:text-red-hover p-1 transition';
                btnDel.style.color = 'var(--error, #ef4444)';
                btnDel.innerHTML = '<i class="ph ph-trash" style="font-size: 1.1rem;"></i>';
                btnDel.onclick = () => {
                    this.photosList.splice(index, 1);
                    this.updateMultiPhotosUI();
                    this.renderGrid();
                };
                right.appendChild(btnDel);
            }

            item.appendChild(left);
            item.appendChild(right);
            listContainer.appendChild(item);
        });
    }

    async downloadPNG() {
        const btn = document.getElementById('btn-download-png');
        if(btn) btn.innerHTML = 'Wait...';
        try {
            await window.requestDownloadPermission('png', { paper: this.paperSize, copies: this.copies });
            const link = document.createElement('a');
            link.download = `passport_photos_${this.paperSize}.png`;
            link.href = this.canvas.toDataURL('image/png', 1.0);
            link.click();
            window.app.logActivity('download_png', `Paper: ${this.paperSize}, Copies: ${this.copies}`);
        } catch(e) {
            window.app.showToast(e.message || 'Download cancelled', 'error');
        } finally {
            if(btn) btn.innerHTML = '<i class="ph ph-download-simple"></i> Download PNG';
        }
    }

    async downloadPDF() {
        const btn = document.getElementById('btn-download-pdf');
        if(btn) btn.innerHTML = 'Wait...';
        try {
            await window.requestDownloadPermission('pdf', { paper: this.paperSize, copies: this.copies });
            const { width, height } = this.canvas;
            const orient = width > height ? 'l' : 'p';
            
            const pdf = new jspdf.jsPDF({
                orientation: orient,
                unit: 'px',
                format: [width, height]
            });
            
            const imgData = this.canvas.toDataURL('image/jpeg', 0.95);
            pdf.addImage(imgData, 'JPEG', 0, 0, width, height);
            pdf.save(`passport_photos_${this.paperSize}.pdf`);
            window.app.logActivity('download_pdf', `Paper: ${this.paperSize}, Copies: ${this.copies}`);
        } catch(e) {
            window.app.showToast(e.message || 'Download cancelled', 'error');
        } finally {
            if(btn) btn.innerHTML = '<i class="ph ph-file-pdf"></i> Download PDF';
        }
    }

    async print() {
        const btn = document.getElementById('btn-print');
        if(btn) btn.innerHTML = 'Wait...';
        try {
            await window.requestDownloadPermission('print', { paper: this.paperSize, copies: this.copies });
            const dataUrl = this.canvas.toDataURL('image/png', 1.0);
            const win = window.open('', '_blank');
        win.document.write(`
            <html>
                <head>
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-QGCLVH098K"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-QGCLVH098K');
</script>

                    <title>Print Passport Photos</title>
                    <style>
                        @page { size: ${this.orientation}; margin: 0; }
                        body { margin: 0; display: flex; justify-content: center; }
                        img { max-width: 100%; height: auto; }
                        @media print {
                            input { display: none; }
                        }
                    </style>
                    <meta name="google-adsense-account" content="ca-pub-9691491237829379">
                    
                </head>
                <body>
                    <img src="${dataUrl}" onload="window.print(); window.close();" />
                </body>
            </html>
        `);
        win.document.close();
        window.app.logActivity('print', `Paper: ${this.paperSize}, Orientation: ${this.orientation}, Copies: ${this.copies}`);
        } catch(e) {
            window.app.showToast(e.message || 'Print cancelled', 'error');
        } finally {
            if(btn) btn.innerHTML = '<i class="ph ph-printer"></i> Print Photos';
        }
    }

    previewLayout() {
        const dataUrl = this.canvas.toDataURL('image/png');
        const win = window.open();
        if (win) {
            win.document.write(`
                <html>
                <head>
                    <title>Layout Preview</title>
                    <style>
                        body { margin: 0; background: #333; display: flex; justify-content: center; align-items: flex-start; padding: 20px; }
                        img { max-width: 100%; box-shadow: 0 4px 12px rgba(0,0,0,0.5); }
                    </style>
                    <meta name="google-adsense-account" content="ca-pub-9691491237829379">
                    
                </head>
                <body>
                    <img src="${dataUrl}" alt="Preview" />
                </body>
                </html>
            `);
        }
    }
}
