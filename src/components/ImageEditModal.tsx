import React, { useState } from 'react';
import { X, Upload, Link as LinkIcon, RotateCcw, Check, Image as ImageIcon, Sparkles, Loader2 } from 'lucide-react';
import { compressImage } from '../utils/imageCompressor';

export interface ImageSlot {
  key: string;
  name: string;
  recommendedAspect: string;
  currentSrc: string;
  defaultSrc: string;
}

interface ImageEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  slots: ImageSlot[];
  activeSlotKey: string;
  onUpdateImage: (slotKey: string, newSrc: string) => void;
  onResetImage: (slotKey: string) => void;
  accentColor: string;
}

export const ImageEditModal: React.FC<ImageEditModalProps> = ({
  isOpen,
  onClose,
  slots,
  activeSlotKey,
  onUpdateImage,
  onResetImage,
  accentColor,
}) => {
  const [selectedKey, setSelectedKey] = useState<string>(activeSlotKey || slots[0]?.key || 'portrait');
  const [urlInput, setUrlInput] = useState<string>('');
  const [previewError, setPreviewError] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [isCompressing, setIsCompressing] = useState<boolean>(false);

  if (!isOpen) return null;

  const currentSlot = slots.find((s) => s.key === selectedKey) || slots[0];

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsCompressing(true);
      try {
        // Automatically compress and optimize the image
        const result = await compressImage(file, 1600, 1600, 0.85);
        onUpdateImage(currentSlot.key, result.dataUrl);
        setSuccessMessage(
          `Compressed ${result.originalSizeKb}KB → ${result.compressedSizeKb}KB and saved for ${currentSlot.name}!`
        );
        setTimeout(() => setSuccessMessage(''), 4000);
      } catch (err: any) {
        alert('Failed to process image. Please try another file.');
      } finally {
        setIsCompressing(false);
      }
    }
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    onUpdateImage(currentSlot.key, urlInput.trim());
    setUrlInput('');
    setSuccessMessage(`Updated photo for ${currentSlot.name}!`);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleReset = () => {
    onResetImage(currentSlot.key);
    setSuccessMessage(`Reset to default photo for ${currentSlot.name}!`);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-fade-in text-[#141414]">
      <div
        className="w-full max-w-xl bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col border border-gray-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/70">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5" style={{ color: accentColor }} />
            <div>
              <h3 className="text-base font-bold text-gray-900">Edit Website Photos</h3>
              <p className="text-xs text-gray-500">Change or upload new pictures for your portfolio</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher for photo slots */}
        <div className="px-6 pt-4 pb-2 border-b border-gray-100 flex gap-2 overflow-x-auto">
          {slots.map((slot) => {
            const isSelected = slot.key === selectedKey;
            return (
              <button
                key={slot.key}
                onClick={() => {
                  setSelectedKey(slot.key);
                  setPreviewError(false);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                  isSelected
                    ? 'bg-gray-900 text-white shadow-xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {slot.name}
              </button>
            );
          })}
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[75vh]">
          {/* Current Preview */}
          <div className="space-y-2">
            <div className="flex justify-between items-baseline">
              <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Current Photo</span>
              <span className="text-[11px] text-gray-400">Aspect ratio: {currentSlot.recommendedAspect}</span>
            </div>

            <div className="relative rounded-lg overflow-hidden border border-gray-200 bg-gray-100 flex items-center justify-center max-h-56">
              <img
                src={currentSlot.currentSrc}
                alt={currentSlot.name}
                onError={() => setPreviewError(true)}
                className="w-full h-full object-cover max-h-56"
              />
              {previewError && (
                <div className="absolute inset-0 bg-red-50 text-red-600 p-4 text-xs flex items-center justify-center text-center">
                  Failed to load image from URL. Please check the link.
                </div>
              )}
            </div>
          </div>

          {/* Feedback message */}
          {successMessage && (
            <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs flex items-center gap-2 animate-fade-in">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Upload Method 1: File from Computer */}
          <div className="p-4 rounded-xl border border-dashed border-gray-300 hover:border-gray-400 bg-gray-50/50 text-center space-y-2 transition">
            {isCompressing ? (
              <div className="py-2 flex flex-col items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                <span className="text-xs font-semibold text-gray-700">Optimizing &amp; compressing image...</span>
              </div>
            ) : (
              <>
                <Upload className="w-5 h-5 mx-auto text-gray-400" />
                <div>
                  <label
                    htmlFor="photo-upload-input"
                    className="cursor-pointer text-xs font-semibold text-blue-600 hover:text-blue-800 underline underline-offset-2"
                  >
                    Choose an image from your device
                  </label>
                  <input
                    id="photo-upload-input"
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    Any photo (auto-compressed to prevent quota errors)
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Upload Method 2: Online URL */}
          <form onSubmit={handleUrlSubmit} className="space-y-2">
            <label className="text-xs font-semibold text-gray-700 block">Or paste any image web URL:</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <LinkIcon className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                <input
                  type="url"
                  placeholder="https://example.com/photo.jpg"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400"
                />
              </div>
              <button
                type="submit"
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-gray-900 text-white hover:bg-black transition shrink-0"
              >
                Apply URL
              </button>
            </div>
          </form>

          {/* Reset button & Code Guide */}
          <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 font-medium transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to default photo</span>
            </button>

            <span className="text-[11px] text-gray-400">
              Saved automatically
            </span>
          </div>

          {/* Code tip */}
          <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg text-[11px] text-amber-900 leading-relaxed">
            <strong>Pro Tip:</strong> To make permanent changes in code, you can also replace the files inside <code>/src/assets/images/</code> or edit the image imports at the top of <code>/src/data.ts</code>.
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-gray-100 bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-white rounded-lg shadow-sm"
            style={{ backgroundColor: accentColor }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
