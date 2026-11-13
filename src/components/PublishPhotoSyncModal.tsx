import React, { useState, useEffect } from 'react';
import {
  X,
  Upload,
  Link as LinkIcon,
  Check,
  Globe,
  Sparkles,
  Loader2,
  RefreshCw,
  Image as ImageIcon,
  Award,
  Palette,
  ExternalLink,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { compressImage } from '../utils/imageCompressor';
import { syncAllLocalPhotosToServer, fetchAllPersistedPhotos } from '../utils/storage';
import { PORTRAIT_IMAGE, LEVE_IMAGE, ROWBOT_IMAGE, DEFAULT_CERTIFICATES, DEFAULT_ARTWORKS } from '../data';

interface PublishPhotoSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  accentColor: string;
}

interface PhotoField {
  key: string;
  name: string;
  category: 'main' | 'cert' | 'art';
  currentSrc: string;
  defaultSrc?: string;
  subtext: string;
}

export const PublishPhotoSyncModal: React.FC<PublishPhotoSyncModalProps> = ({
  isOpen,
  onClose,
  accentColor,
}) => {
  const [activeTab, setActiveTab] = useState<'main' | 'cert' | 'art'>('main');
  const [photoValues, setPhotoValues] = useState<Record<string, string>>({});
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [compressingKey, setCompressingKey] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'info' | 'error'; text: string } | null>(null);

  // Initialize fields
  const fields: PhotoField[] = [
    // Main
    {
      key: 'portrait',
      name: 'Hero Portrait',
      category: 'main',
      currentSrc: photoValues['portrait'] || PORTRAIT_IMAGE,
      defaultSrc: PORTRAIT_IMAGE,
      subtext: 'Main header profile photo (Vertical aspect ratio recommended)',
    },
    {
      key: 'leve',
      name: 'Leve Community Project',
      category: 'main',
      currentSrc: photoValues['leve'] || LEVE_IMAGE,
      defaultSrc: LEVE_IMAGE,
      subtext: 'Featured project photo in Work section',
    },
    {
      key: 'rowbot',
      name: 'Rowbot Buoy Project',
      category: 'main',
      currentSrc: photoValues['rowbot'] || ROWBOT_IMAGE,
      defaultSrc: ROWBOT_IMAGE,
      subtext: 'Featured project photo in Work section',
    },
    // Certificates
    ...DEFAULT_CERTIFICATES.map((cert) => ({
      key: `cert_${cert.id}`,
      name: cert.title,
      category: 'cert' as const,
      currentSrc: photoValues[`cert_${cert.id}`] || (cert.image as string) || '',
      subtext: `${cert.issuer} (${cert.year})`,
    })),
    // Artworks
    ...DEFAULT_ARTWORKS.map((art, idx) => ({
      key: `art_${art.id}`,
      name: art.title,
      category: 'art' as const,
      currentSrc: photoValues[`art_${art.id}`] || (art.image as string) || '',
      subtext: `${art.medium} (${art.year})`,
    })),
  ];

  // Load current values on open
  useEffect(() => {
    if (!isOpen) return;

    const loadValues = async () => {
      const serverPhotos = await fetchAllPersistedPhotos();
      const currentValues: Record<string, string> = {};

      // Load main slots
      currentValues['portrait'] =
        localStorage.getItem('anb_photo_portrait') || serverPhotos?.portrait || '';
      currentValues['leve'] =
        localStorage.getItem('anb_photo_leve') || serverPhotos?.leve || '';
      currentValues['rowbot'] =
        localStorage.getItem('anb_photo_rowbot') || serverPhotos?.rowbot || '';

      // Load certificates
      DEFAULT_CERTIFICATES.forEach((c) => {
        const val =
          localStorage.getItem(`anb_cert_${c.id}`) ||
          serverPhotos?.certificates?.[c.id] ||
          (c.image as string) ||
          '';
        currentValues[`cert_${c.id}`] = val;
      });

      // Load artworks
      DEFAULT_ARTWORKS.forEach((a) => {
        const val =
          localStorage.getItem(`anb_art_${a.id}`) ||
          serverPhotos?.artworks?.[a.id] ||
          (a.image as string) ||
          '';
        currentValues[`art_${a.id}`] = val;
      });

      setPhotoValues(currentValues);
    };

    loadValues();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleInputChange = (key: string, value: string) => {
    setPhotoValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleFileUpload = async (key: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCompressingKey(key);
    try {
      const compressed = await compressImage(file, 1600, 1600, 0.85);
      handleInputChange(key, compressed.dataUrl);

      // Save directly to local storage / server
      const storageKey = key.startsWith('cert_')
        ? `anb_cert_${key.replace('cert_', '')}`
        : key.startsWith('art_')
        ? `anb_art_${key.replace('art_', '')}`
        : `anb_photo_${key}`;

      try {
        localStorage.setItem(storageKey, compressed.dataUrl);
      } catch (_) {}

      setStatusMessage({
        type: 'success',
        text: `Uploaded and compressed photo (${compressed.originalSizeKb}KB → ${compressed.compressedSizeKb}KB). Click "Save & Bake into Published Site" to finalize!`,
      });
      setTimeout(() => setStatusMessage(null), 5000);
    } catch (err: any) {
      alert('Could not process image file. Please try another image.');
    } finally {
      setCompressingKey(null);
    }
  };

  const handleSyncFromBrowser = async () => {
    setIsSyncing(true);
    setStatusMessage({ type: 'info', text: 'Scanning local uploads and baking into published site build...' });

    const result = await syncAllLocalPhotosToServer();
    setIsSyncing(false);

    if (result.success) {
      setStatusMessage({
        type: 'success',
        text: `Successfully baked ${result.count} photos and URLs directly into the codebase and published build!`,
      });
      // Refresh local inputs
      if (result.photos) {
        setPhotoValues((prev) => {
          const updated = { ...prev };
          if (result.photos.portrait) updated['portrait'] = result.photos.portrait;
          if (result.photos.leve) updated['leve'] = result.photos.leve;
          if (result.photos.rowbot) updated['rowbot'] = result.photos.rowbot;
          if (result.photos.certificates) {
            Object.entries(result.photos.certificates).forEach(([id, url]) => {
              updated[`cert_${id}`] = url as string;
            });
          }
          if (result.photos.artworks) {
            Object.entries(result.photos.artworks).forEach(([id, url]) => {
              updated[`art_${id}`] = url as string;
            });
          }
          return updated;
        });
      }
    } else {
      setStatusMessage({
        type: 'error',
        text: 'Failed to sync photos to server. Please verify dev server is running.',
      });
    }
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    setStatusMessage({ type: 'info', text: 'Baking all photo URLs into the published codebase...' });

    const payload: {
      portrait?: string;
      leve?: string;
      rowbot?: string;
      certificates: Record<string, string>;
      artworks: Record<string, string>;
    } = {
      portrait: photoValues['portrait'] || '',
      leve: photoValues['leve'] || '',
      rowbot: photoValues['rowbot'] || '',
      certificates: {},
      artworks: {},
    };

    // Also mirror to localStorage
    if (payload.portrait) localStorage.setItem('anb_photo_portrait', payload.portrait);
    if (payload.leve) localStorage.setItem('anb_photo_leve', payload.leve);
    if (payload.rowbot) localStorage.setItem('anb_photo_rowbot', payload.rowbot);

    DEFAULT_CERTIFICATES.forEach((c) => {
      const val = photoValues[`cert_${c.id}`] || '';
      payload.certificates[c.id] = val;
      if (val) localStorage.setItem(`anb_cert_${c.id}`, val);
    });

    DEFAULT_ARTWORKS.forEach((a) => {
      const val = photoValues[`art_${a.id}`] || '';
      payload.artworks[a.id] = val;
      if (val) localStorage.setItem(`anb_art_${a.id}`, val);
    });

    try {
      const res = await fetch('/api/sync-photos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setStatusMessage({
          type: 'success',
          text: 'All 19 photos & URLs saved! Both dev and published builds now display current images for all visitors.',
        });
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        setStatusMessage({
          type: 'error',
          text: 'Server could not write changes. Please check console.',
        });
      }
    } catch (e: any) {
      setStatusMessage({
        type: 'error',
        text: `Error saving: ${e.message}`,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const currentCategoryFields = fields.filter((f) => f.category === activeTab);

  return (
    <div className="fixed inset-0 z-[125] flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm animate-fade-in text-[#141414]">
      <div
        className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-gray-200 max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50/90">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-xs"
              style={{ backgroundColor: accentColor }}
            >
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-gray-900">Manage Published Photo URLs</h3>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  Published Site Sync
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Ensure all uploaded pictures and URLs appear permanently for visitors on the published site.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sync Action Banner */}
        <div className="px-6 py-3 bg-blue-50/80 border-b border-blue-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-blue-900">
            <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              Previously uploaded photos in dev? Click sync to automatically bake them into the published build.
            </span>
          </div>

          <button
            onClick={handleSyncFromBrowser}
            disabled={isSyncing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition disabled:opacity-50"
          >
            {isSyncing ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Baking into site...</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Sync Local Photos to Codebase</span>
              </>
            )}
          </button>
        </div>

        {/* Status Toast */}
        {statusMessage && (
          <div
            className={`px-6 py-2.5 text-xs flex items-center gap-2 ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-b border-emerald-200'
                : statusMessage.type === 'error'
                ? 'bg-red-50 text-red-800 border-b border-red-200'
                : 'bg-amber-50 text-amber-800 border-b border-amber-200'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : statusMessage.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            ) : (
              <Loader2 className="w-4 h-4 animate-spin text-amber-600 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Category Navigation Tabs */}
        <div className="px-6 pt-3 pb-2 border-b border-gray-100 flex gap-2 overflow-x-auto bg-gray-50/40">
          {[
            { id: 'main', label: 'Main Projects & Hero (3)', icon: ImageIcon },
            { id: 'cert', label: 'Certificates (6)', icon: Award },
            { id: 'art', label: 'Art (8)', icon: Palette },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                  isSelected
                    ? 'bg-gray-900 text-white shadow-xs'
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Slots List Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {currentCategoryFields.map((field) => {
            const isCompressing = compressingKey === field.key;
            const val = photoValues[field.key] || '';
            const previewSrc = val || field.defaultSrc || '';

            return (
              <div
                key={field.key}
                className="p-4 rounded-xl border border-gray-200 bg-white hover:border-gray-300 transition space-y-3"
              >
                {/* Title & Subtext */}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">{field.name}</h4>
                    <p className="text-xs text-gray-500">{field.subtext}</p>
                  </div>
                  {val ? (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0 flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      <span>Custom Photo Set</span>
                    </span>
                  ) : (
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-gray-100 text-gray-500 shrink-0">
                      Default / Empty
                    </span>
                  )}
                </div>

                {/* Thumbnail Preview and URL Input row */}
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {/* Thumbnail */}
                  <div className="w-full sm:w-28 h-20 rounded-lg overflow-hidden border border-gray-200 bg-gray-100 shrink-0 flex items-center justify-center relative">
                    {previewSrc ? (
                      <img
                        src={previewSrc}
                        alt={field.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-gray-300" />
                    )}
                  </div>

                  {/* URL Input & File Upload */}
                  <div className="flex-1 w-full space-y-2">
                    <div className="relative">
                      <LinkIcon className="w-3.5 h-3.5 absolute left-3 top-2.5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Paste image web link (https://... or /uploads/...)"
                        value={val}
                        onChange={(e) => handleInputChange(field.key, e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 font-mono text-gray-800"
                      />
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <label className="inline-flex items-center gap-1.5 cursor-pointer text-blue-600 hover:text-blue-800 font-semibold">
                        {isCompressing ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Compressing...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-3.5 h-3.5" />
                            <span>Upload picture from device</span>
                          </>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileUpload(field.key, e)}
                          className="hidden"
                          disabled={isCompressing}
                        />
                      </label>

                      {val && (
                        <button
                          onClick={() => handleInputChange(field.key, '')}
                          className="text-gray-400 hover:text-red-600 text-[11px]"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
          <p className="text-[11px] text-gray-500">
            Clicking <strong>Save &amp; Bake into Published Site</strong> writes changes directly to <code>src/persistedPhotos.json</code>.
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveAll}
              disabled={isSaving}
              className="px-5 py-2 text-xs font-bold text-white rounded-lg shadow-sm flex items-center gap-1.5 transition disabled:opacity-50"
              style={{ backgroundColor: accentColor }}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving &amp; Baking...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Save &amp; Bake into Published Site</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
