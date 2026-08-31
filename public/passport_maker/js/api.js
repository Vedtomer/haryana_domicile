export class ApiService {
    constructor() {
        this._model = null;
        this._processor = null;
    }

    /**
     * Removes background using briaai/RMBG-1.4 via Transformers.js.
     * Completely free, unlimited, browser-based. No API key required.
     * Models are downloaded from HuggingFace CDN and cached in the browser IndexedDB.
     */
    async removeBackground(file) {
        try {
            console.log("Loading Transformers.js AI engine...");

            // Dynamically import Transformers.js from CDN (ESM)
            const { env, AutoProcessor, AutoModel, RawImage } = await import(
                'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2'
            );

            // Cache models in browser after first download
            env.allowLocalModels = false;
            env.useBrowserCache = true;

            // Lazy-load and cache model + processor
            if (!this._model || !this._processor) {
                console.log("Downloading AI model (first time only, then cached)...");
                [this._processor, this._model] = await Promise.all([
                    AutoProcessor.from_pretrained('briaai/RMBG-1.4', {
                        config: {
                            do_normalize: true,
                            do_pad: false,
                            do_rescale: true,
                            do_resize: true,
                            image_mean: [0.5, 0.5, 0.5],
                            image_std: [1, 1, 1],
                            resample: 2,
                            rescale_factor: 0.00392156862745098,
                            size: { width: 1024, height: 1024 },
                        },
                    }),
                    AutoModel.from_pretrained('briaai/RMBG-1.4', {
                        config: { model_type: 'custom' },
                    }),
                ]);
            }

            console.log("Model ready. Processing image...");

            // Load the uploaded image into Transformers' RawImage
            const image = await RawImage.fromBlob(file);

            // Pre-process the image for the model
            const { pixel_values } = await this._processor(image);

            // Run inference — produces an alpha matte
            const { output } = await this._model({ input: pixel_values });

            // Resize mask back to original image size
            const mask = await RawImage
                .fromTensor(output[0].mul(255).to('uint8'))
                .resize(image.width, image.height);

            // Compose final transparent PNG
            const canvas = document.createElement('canvas');
            canvas.width = image.width;
            canvas.height = image.height;
            const ctx = canvas.getContext('2d');

            // Draw the original image
            ctx.drawImage(image.toCanvas(), 0, 0);

            // Apply the alpha mask from the AI model
            const pixelData = ctx.getImageData(0, 0, image.width, image.height);
            for (let i = 0; i < mask.data.length; i++) {
                pixelData.data[4 * i + 3] = mask.data[i]; // set alpha channel
            }
            ctx.putImageData(pixelData, 0, 0);

            console.log("Background removed successfully.");

            return new Promise((resolve, reject) => {
                canvas.toBlob((blob) => {
                    if (blob) resolve(blob);
                    else reject(new Error("Failed to create image blob after background removal."));
                }, 'image/png');
            });

        } catch (error) {
            console.error("Background removal failed:", error);
            throw new Error(`AI background removal failed: ${error.message}`);
        }
    }

    /**
     * Converts a File to an HTMLImageElement
     */
    fileToImage(file) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => resolve(img);
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
    }
}
