export class FaceDetectionService {
    constructor() {
        this.modelsLoaded = false;
        // Using unpkg for face-api.js models (weights)
        this.MODEL_URL = 'https://justadudewhohacks.github.io/face-api.js/models/';
    }

    async loadModels() {
        if (this.modelsLoaded) return true;
        
        try {
            // Load face-api.js from CDN dynamically if not present
            if (typeof faceapi === 'undefined') {
                await this.loadScript('https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/dist/face-api.min.js');
            }

            // Load tiny face detector for speed
            await faceapi.nets.tinyFaceDetector.loadFromUri(this.MODEL_URL);
            this.modelsLoaded = true;
            return true;
        } catch (e) {
            console.error('Failed to load FaceAPI models', e);
            return false;
        }
    }

    async detectFace(imageElement) {
        if (!this.modelsLoaded) {
            await this.loadModels();
        }

        if (this.modelsLoaded) {
            const detection = await faceapi.detectSingleFace(
                imageElement, 
                new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.4 })
            );
            return detection;
        }
        return null;
    }

    loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }
}
