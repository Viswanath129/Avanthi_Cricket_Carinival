import { useState, useCallback } from 'react';

export interface ProcessedPhoto {
  file: File;
  previewUrl: string;
  fullBlob: Blob;
  thumbBlob: Blob;
  hasFaceDetected?: boolean;
}

export interface UseImageProcessorReturn {
  isProcessing: boolean;
  error: string | null;
  processedPhoto: ProcessedPhoto | null;
  processFile: (file: File) => Promise<ProcessedPhoto | null>;
  reset: () => void;
}

/**
 * Resizes an image file using an off-screen HTML5 Canvas.
 */
async function resizeImage(file: File, maxDim: number, quality: number = 0.88): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas 2D context unavailable'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else reject(new Error('Failed to compress image blob'));
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = () => reject(new Error('Failed to load image for resizing'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Attempts face detection using native Shape Detection API if available,
 * or resolves gracefully.
 */
async function detectFace(file: File): Promise<boolean> {
  if (typeof window !== 'undefined' && 'FaceDetector' in window) {
    try {
      // @ts-ignore Native experimental FaceDetector API
      const detector = new window.FaceDetector({ fastMode: true, maxDetectedFaces: 3 });
      const img = await createImageBitmap(file);
      const faces = await detector.detect(img);
      return faces.length > 0;
    } catch {
      return true; // Fallback if detector fails
    }
  }
  return true;
}

export function useImageProcessor(): UseImageProcessorReturn {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processedPhoto, setProcessedPhoto] = useState<ProcessedPhoto | null>(null);

  const processFile = useCallback(async (file: File): Promise<ProcessedPhoto | null> => {
    setError(null);
    setIsProcessing(true);

    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file (JPG, PNG, WebP).');
      setIsProcessing(false);
      return null;
    }

    if (file.size > 15 * 1024 * 1024) {
      setError('Photo exceeds 15MB size limit. Please choose a smaller photo.');
      setIsProcessing(false);
      return null;
    }

    try {
      const faceDetected = await detectFace(file);
      // Resize to full 1080p and thumb 256x256
      const fullBlob = await resizeImage(file, 1080, 0.88);
      const thumbBlob = await resizeImage(file, 256, 0.85);
      const previewUrl = URL.createObjectURL(fullBlob);

      const result: ProcessedPhoto = {
        file,
        previewUrl,
        fullBlob,
        thumbBlob,
        hasFaceDetected: faceDetected,
      };

      setProcessedPhoto(result);
      return result;
    } catch (err: any) {
      setError(err.message || 'Error processing photo. Please try another image.');
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const reset = useCallback(() => {
    if (processedPhoto?.previewUrl) {
      URL.revokeObjectURL(processedPhoto.previewUrl);
    }
    setProcessedPhoto(null);
    setError(null);
  }, [processedPhoto]);

  return {
    isProcessing,
    error,
    processedPhoto,
    processFile,
    reset,
  };
}
