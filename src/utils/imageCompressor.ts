/**
 * Client-side image compressor utility.
 * Reduces 5MB-15MB camera/scanned photos down to ~100KB-250KB JPEG/WebP
 * without noticeable visual loss, solving browser storage quota limits.
 */

export interface CompressionResult {
  dataUrl: string;
  originalSizeKb: number;
  compressedSizeKb: number;
  width: number;
  height: number;
}

export async function compressImage(
  fileOrDataUrl: File | string,
  maxWidth = 1600,
  maxHeight = 1600,
  quality = 0.82
): Promise<CompressionResult> {
  return new Promise((resolve, reject) => {
    let originalSizeKb = 0;
    const img = new Image();

    img.onload = () => {
      try {
        let { width, height } = img;

        // Downscale proportionally if either dimension exceeds limits
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          throw new Error('Failed to create canvas 2D context for image compression.');
        }

        // Draw with high-quality smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Export as JPEG (or webp if supported)
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);

        // Approximate size calculation
        const base64Length = compressedDataUrl.length - (compressedDataUrl.indexOf(',') + 1);
        const compressedSizeKb = Math.round((base64Length * 0.75) / 1024);

        resolve({
          dataUrl: compressedDataUrl,
          originalSizeKb: originalSizeKb || compressedSizeKb,
          compressedSizeKb,
          width,
          height,
        });
      } catch (err) {
        reject(err);
      }
    };

    img.onerror = (e) => {
      reject(new Error('Failed to load image for compression.'));
    };

    if (typeof fileOrDataUrl === 'string') {
      // Data URL or web URL
      const base64Length = fileOrDataUrl.length - (fileOrDataUrl.indexOf(',') + 1);
      originalSizeKb = Math.round((base64Length * 0.75) / 1024);
      img.src = fileOrDataUrl;
    } else {
      // File object from input
      originalSizeKb = Math.round(fileOrDataUrl.size / 1024);
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          img.src = e.target.result as string;
        } else {
          reject(new Error('Failed to read file.'));
        }
      };
      reader.onerror = () => reject(new Error('FileReader error.'));
      reader.readAsDataURL(fileOrDataUrl);
    }
  });
}
