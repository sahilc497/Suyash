/**
 * Browser-side and administrative image optimization utility.
 * Optimizes images (resize + WebP compression + aspect ratio preservation)
 * before uploading to Supabase Storage, dramatically lowering storage size
 * and egress bandwidth.
 */

export interface OptimizeOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.0 to 1.0 (default: 0.82)
  targetFormat?: 'image/webp' | 'image/jpeg' | 'image/png';
}

const DEFAULT_OPTIONS: Required<OptimizeOptions> = {
  maxWidth: 800,
  maxHeight: 800,
  quality: 0.82,
  targetFormat: 'image/webp',
};

/**
 * Validates whether the given file is an allowed image type.
 */
export function validateImageFile(file: File, maxSizeBytes = 20 * 1024 * 1024): { valid: boolean; error?: string } {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/gif'];
  if (!allowedTypes.includes(file.type.toLowerCase())) {
    return {
      valid: false,
      error: `Unsupported image format (${file.type}). Allowed types: JPG, PNG, WebP, GIF.`,
    };
  }
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `File is too large (${(file.size / (1024 * 1024)).toFixed(1)} MB). Maximum allowed size is ${maxSizeBytes / (1024 * 1024)} MB.`,
    };
  }
  return { valid: true };
}

/**
 * Optimizes an image File using the HTML5 Canvas API in the browser.
 * Retains aspect ratio, prevents upscaling, preserves alpha channel in WebP,
 * and sets long-term immutable Cache-Control metadata for Supabase Storage.
 */
export async function optimizeImageBeforeUpload(
  file: File,
  options: OptimizeOptions = {}
): Promise<{
  blob: Blob;
  filename: string;
  contentType: string;
  width: number;
  height: number;
  cacheControl: string;
}> {
  const validation = validateImageFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const merged = { ...DEFAULT_OPTIONS, ...options };

  return new Promise((resolve, reject) => {
    // For non-browser environments, return original
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return resolve({
        blob: file,
        filename: file.name,
        contentType: file.type || 'image/jpeg',
        width: 0,
        height: 0,
        cacheControl: '31536000, immutable',
      });
    }

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      const originWidth = img.naturalWidth || img.width;
      const originHeight = img.naturalHeight || img.height;

      // Calculate target dimensions preserving aspect ratio
      let targetWidth = originWidth;
      let targetHeight = originHeight;

      if (originWidth > merged.maxWidth || originHeight > merged.maxHeight) {
        const ratio = Math.min(merged.maxWidth / originWidth, merged.maxHeight / originHeight);
        targetWidth = Math.round(originWidth * ratio);
        targetHeight = Math.round(originHeight * ratio);
      }

      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        return resolve({
          blob: file,
          filename: file.name,
          contentType: file.type,
          width: originWidth,
          height: originHeight,
          cacheControl: '31536000, immutable',
        });
      }

      // High quality rendering
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

      // Export as WebP
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            return resolve({
              blob: file,
              filename: file.name,
              contentType: file.type,
              width: originWidth,
              height: originHeight,
              cacheControl: '31536000, immutable',
            });
          }

          // If original file was already smaller and was WebP, preserve it
          if (file.type === 'image/webp' && blob.size >= file.size) {
            return resolve({
              blob: file,
              filename: file.name,
              contentType: 'image/webp',
              width: originWidth,
              height: originHeight,
              cacheControl: '31536000, immutable',
            });
          }

          const baseName = file.name.replace(/\.[^/.]+$/, '');
          const newFilename = `${baseName}_${Date.now()}.webp`;

          resolve({
            blob,
            filename: newFilename,
            contentType: 'image/webp',
            width: targetWidth,
            height: targetHeight,
            cacheControl: '31536000, immutable',
          });
        },
        'image/webp',
        merged.quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to decode image file.'));
    };

    img.src = objectUrl;
  });
}
