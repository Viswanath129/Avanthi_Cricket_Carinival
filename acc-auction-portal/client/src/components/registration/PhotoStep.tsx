import React, { useRef } from 'react';
import { UseImageProcessorReturn } from '@/hooks/useImageProcessor';

interface PhotoStepProps {
  imageProcessor: UseImageProcessorReturn;
  onPhotoSelected: (file: File) => void;
  photoPreview: string | null;
}

export const PhotoStep: React.FC<PhotoStepProps> = ({
  imageProcessor,
  onPhotoSelected,
  photoPreview,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const res = await imageProcessor.processFile(file);
      if (res) {
        onPhotoSelected(file);
      }
    }
  };

  const handleTriggerUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h2 className="font-serif font-bold text-xl text-slate-900 dark:text-slate-100">
          Step 2: Player Photograph
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Upload a clear photograph where your face is visible. Formal or casual pictures are both acceptable. This photo is displayed on live auction screens and the hall projector.
        </p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl">
        {photoPreview || imageProcessor.processedPhoto?.previewUrl ? (
          <div className="flex flex-col items-center space-y-4">
            <div className="relative w-44 h-44 rounded-full overflow-hidden border-4 border-emerald-500 shadow-xl bg-slate-100 dark:bg-slate-800">
              <img
                src={photoPreview || imageProcessor.processedPhoto?.previewUrl || ''}
                alt="Player Preview"
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                \u2713 Photo Processed (1080p + 256x256 Thumb)
              </span>
            </div>

            <button
              type="button"
              onClick={handleTriggerUpload}
              className="min-h-[48px] px-6 py-2.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold rounded-xl text-sm transition-all shadow-sm"
            >
              [ REPLACE PHOTO ]
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center space-y-4">
            <div
              onClick={handleTriggerUpload}
              className="w-36 h-36 rounded-full border-2 border-dashed border-emerald-500/50 hover:border-emerald-500 flex flex-col items-center justify-center cursor-pointer bg-emerald-50/50 dark:bg-emerald-950/20 hover:scale-105 transition-all group"
            >
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xl font-bold group-hover:scale-110 transition-transform">
                +
              </div>
              <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mt-2">
                Upload Photo
              </span>
            </div>

            <div className="max-w-xs">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Supported formats: JPG, PNG, WebP. High resolution image is automatically optimized for low latency and projector display.
              </p>
            </div>

            <button
              type="button"
              onClick={handleTriggerUpload}
              disabled={imageProcessor.isProcessing}
              className="min-h-[48px] px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-sm transition-all shadow-sm"
            >
              {imageProcessor.isProcessing ? 'Processing Image...' : 'Select Photograph'}
            </button>
          </div>
        )}

        {imageProcessor.error && (
          <div className="mt-4 p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 text-xs text-red-600 dark:text-red-400 font-medium">
            \u26A0 {imageProcessor.error}
          </div>
        )}
      </div>

      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 space-y-1">
        <p className="font-bold text-slate-800 dark:text-slate-200">Photo Requirements:</p>
        <p>\u2022 Centered headshot with face clearly recognizable.</p>
        <p>\u2022 Good lighting; avoid excessive filters, heavy sunglasses, or obscuring face wear.</p>
        <p>\u2022 Casual jerseys or formal campus uniform are both completely valid.</p>
      </div>
    </div>
  );
};
