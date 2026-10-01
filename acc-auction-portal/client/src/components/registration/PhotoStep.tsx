import React, { useRef, useState } from 'react';
import { UseImageProcessorReturn } from '@/hooks/useImageProcessor';
import { Crop, ZoomIn, ZoomOut, RotateCw, Check, X, UploadCloud, RefreshCw } from 'lucide-react';

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
  const [rawImageSrc, setRawImageSrc] = useState<string | null>(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const [cropZoom, setCropZoom] = useState(1);
  const [cropPan, setCropPan] = useState({ x: 0, y: 0 });
  const [cropError, setCropError] = useState<string | null>(null);
  const [isCropping, setIsCropping] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (!file.type.startsWith('image/')) {
        setCropError("Invalid file format. Please upload a JPEG, PNG, or WebP photograph.");
        return;
      }
      if (file.size > 8 * 1024 * 1024) {
        setCropError("Photograph exceeds 8MB limit. Please upload an optimized file.");
        return;
      }
      setCropError(null);
      const reader = new FileReader();
      reader.onload = () => {
        setRawImageSrc(reader.result as string);
        setCropZoom(1);
        setCropPan({ x: 0, y: 0 });
        setShowCropModal(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCommit43Crop = async () => {
    if (!rawImageSrc) return;
    setIsCropping(true);

    try {
      const img = new Image();
      img.src = rawImageSrc;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      // Render into authoritative 800x600 (4:3) canvas
      const canvas = document.createElement('canvas');
      canvas.width = 800;
      canvas.height = 600;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error("Could not initialize 2D canvas");

      // Draw background
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, 800, 600);

      // Compute scale & position with zoom/pan
      const baseScale = Math.max(800 / img.naturalWidth, 600 / img.naturalHeight);
      const finalScale = baseScale * cropZoom;
      const drawW = img.naturalWidth * finalScale;
      const drawH = img.naturalHeight * finalScale;
      const drawX = (800 - drawW) / 2 + cropPan.x;
      const drawY = (600 - drawH) / 2 + cropPan.y;

      ctx.drawImage(img, drawX, drawY, drawW, drawH);

      canvas.toBlob((blob) => {
        if (!blob) {
          setCropError("Failed to encode cropped 4:3 image");
          setIsCropping(false);
          return;
        }
        const croppedFile = new File([blob], `player_43_${Date.now()}.jpg`, { type: 'image/jpeg' });
        onPhotoSelected(croppedFile);
        setShowCropModal(false);
        setIsCropping(false);
      }, 'image/jpeg', 0.92);
    } catch {
      setCropError("Error while generating 4:3 cropped photograph.");
      setIsCropping(false);
    }
  };

  const handleTriggerUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h2 className="font-serif font-bold text-xl text-slate-900 dark:text-slate-100">
          Step 2: Player Photograph (4:3 Ratio)
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Upload a clear photograph with face visible. Official 4:3 projector standard framing is strictly enforced for stadium displays.
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
            {/* 4:3 Rectangular Stadium Projector Frame */}
            <div className="relative w-64 h-48 rounded-xl overflow-hidden border-4 border-emerald-500 shadow-2xl bg-slate-950 flex items-center justify-center">
              <img
                src={photoPreview || imageProcessor.processedPhoto?.previewUrl || ''}
                alt="4:3 Player Preview"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/70 text-emerald-400 text-[10px] font-mono font-bold border border-emerald-500/40">
                4:3 VERIFIED
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                ✓ 4:3 Stadium & Projector View Ready (800x600)
              </span>
            </div>

            <button
              type="button"
              onClick={handleTriggerUpload}
              className="min-h-[44px] px-6 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold rounded-xl text-xs transition-all shadow-sm flex items-center gap-2"
            >
              <RefreshCw size={14} />
              <span>REPLACE / RE-CROP PHOTO</span>
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center space-y-4">
            <div
              onClick={handleTriggerUpload}
              className="w-48 h-36 rounded-xl border-2 border-dashed border-emerald-500/50 hover:border-emerald-500 flex flex-col items-center justify-center cursor-pointer bg-emerald-50/50 dark:bg-emerald-950/20 hover:scale-105 transition-all group"
            >
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-lg font-bold group-hover:scale-110 transition-transform">
                +
              </div>
              <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mt-2">
                Choose 4:3 Photograph
              </span>
            </div>

            <div className="max-w-xs">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Supported: JPG, PNG, WebP. Interactive 4:3 crop tool launches upon selecting your image.
              </p>
            </div>

            <button
              type="button"
              onClick={handleTriggerUpload}
              className="min-h-[44px] px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-xs transition-all shadow-sm flex items-center gap-2"
            >
              <UploadCloud size={16} />
              <span>Select Photograph File</span>
            </button>
          </div>
        )}

        {(cropError || imageProcessor.error) && (
          <div className="mt-4 p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 text-xs text-red-600 dark:text-red-400 font-medium">
            ⚠ {cropError || imageProcessor.error}
          </div>
        )}
      </div>

      {/* Interactive 4:3 Crop Modal */}
      {showCropModal && rawImageSrc && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg p-6 rounded-2xl bg-[#0e1411] border border-white/10 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-white/[0.08] pb-3">
              <div>
                <h3 className="font-display font-bold text-base text-white">Crop Photograph to 4:3 Ratio</h3>
                <p className="text-[11px] text-slate-400">Position and zoom your photograph within the 4:3 frame.</p>
              </div>
              <button onClick={() => setShowCropModal(false)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            {/* 4:3 Cropper Viewport Container */}
            <div className="relative w-full aspect-[4/3] bg-black/80 rounded-xl overflow-hidden border-2 border-emerald-500 shadow-inner flex items-center justify-center">
              <img
                src={rawImageSrc}
                alt="Source Crop"
                style={{
                  transform: `scale(${cropZoom}) translate(${cropPan.x / cropZoom}px, ${cropPan.y / cropZoom}px)`,
                  transition: 'transform 0.05s ease-out',
                }}
                className="max-w-none max-h-none pointer-events-none select-none"
              />
              <div className="absolute inset-0 pointer-events-none border border-emerald-500/40 grid grid-cols-3 grid-rows-3 opacity-30">
                <div className="border-r border-b border-white" />
                <div className="border-r border-b border-white" />
                <div className="border-b border-white" />
                <div className="border-r border-b border-white" />
                <div className="border-r border-b border-white" />
                <div className="border-b border-white" />
                <div className="border-r border-white" />
                <div className="border-r border-white" />
                <div />
              </div>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center justify-between gap-4 p-3 rounded-xl bg-white/[0.03] border border-white/5">
              <span className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
                <Crop size={14} className="text-emerald-400" />
                Zoom: {(cropZoom * 100).toFixed(0)}%
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCropZoom(prev => Math.max(1, prev - 0.15))}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white"
                >
                  <ZoomOut size={16} />
                </button>
                <input
                  type="range"
                  min="1"
                  max="2.5"
                  step="0.05"
                  value={cropZoom}
                  onChange={e => setCropZoom(parseFloat(e.target.value))}
                  className="w-32 accent-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => setCropZoom(prev => Math.min(2.5, prev + 0.15))}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white"
                >
                  <ZoomIn size={16} />
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCropModal(false)}
                className="px-4 py-2 rounded-xl bg-white/5 text-xs text-slate-300 font-semibold"
              >
                CANCEL
              </button>
              <button
                type="button"
                onClick={handleCommit43Crop}
                disabled={isCropping}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
              >
                <Check size={14} />
                <span>{isCropping ? 'CROPPING...' : 'CONFIRM 4:3 CROP'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 space-y-1">
        <p className="font-bold text-slate-800 dark:text-slate-200">Official Specification Requirement:</p>
        <p>• Rectangular 4:3 aspect ratio framing is mandatory for live stadium projectors and spectator views.</p>
        <p>• Avoid sunglasses, non-cricket headwear, or face-covering masks.</p>
      </div>
    </div>
  );
};
