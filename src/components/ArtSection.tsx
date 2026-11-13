import React, { useState, useRef, useEffect } from 'react';
import { Palette, Upload, Eye, X, ExternalLink, Link as LinkIcon, Check, Image as ImageIcon, Maximize2, Sparkles, Loader2, Globe } from 'lucide-react';
import { DEFAULT_ARTWORKS } from '../data';
import { Artwork } from '../types';
import { compressImage } from '../utils/imageCompressor';
import { persistPhoto, loadPersistedPhoto, removePersistedPhoto, fetchAllPersistedPhotos } from '../utils/storage';

interface ArtSectionProps {
  accentColor: string;
}

export const ArtSection: React.FC<ArtSectionProps> = ({ accentColor }) => {

  // Load saved artwork images and titles
  const [artworks, setArtworks] = useState<Artwork[]>(() => {
    return DEFAULT_ARTWORKS.map((art) => {
      const savedImage = localStorage.getItem(`anb_art_${art.id}`);
      return {
        id: art.id,
        title: art.title,
        image: savedImage || art.image
      };
    });
  });

  // Modal & feedback states
  const [activeUploadArt, setActiveUploadArt] = useState<Artwork | null>(null);
  const [urlInput, setUrlInput] = useState<string>('');
  const [lightboxArt, setLightboxArt] = useState<Artwork | null>(null);
  const [feedback, setFeedback] = useState<string>('');
  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Hydrate persisted artwork photos from IndexedDB/Server and clear stale description metadata
  useEffect(() => {
    DEFAULT_ARTWORKS.forEach((art) => {
      try {
        localStorage.removeItem(`anb_art_meta_${art.id}`);
      } catch (_) {}
    });

    fetchAllPersistedPhotos().then((serverPhotos) => {
      if (serverPhotos?.artworks) {
        setArtworks((prev) =>
          prev.map((a) => (serverPhotos.artworks[a.id] ? { ...a, image: serverPhotos.artworks[a.id] } : a))
        );
      }
    });

    DEFAULT_ARTWORKS.forEach((art) => {
      loadPersistedPhoto(`anb_art_${art.id}`, art.image || '').then((src) => {
        if (src) {
          setArtworks((prev) =>
            prev.map((a) => (a.id === art.id ? { ...a, image: src } : a))
          );
        }
      });
    });
  }, []);

  // Save image data to multi-tier storage (Server + IndexedDB + localStorage)
  const handleSaveImage = async (artId: string, imageDataUrl: string) => {
    const savedUrl = await persistPhoto(`anb_art_${artId}`, imageDataUrl);
    setArtworks((prev) =>
      prev.map((a) => (a.id === artId ? { ...a, image: savedUrl } : a))
    );
    setFeedback('Artwork photo saved and synced to site!');
    setTimeout(() => setFeedback(''), 3500);
    setActiveUploadArt(null);
    setUrlInput('');
  };

  // Remove custom image and return to placeholder
  const handleRemoveImage = async (artId: string) => {
    await removePersistedPhoto(`anb_art_${artId}`);
    setArtworks((prev) =>
      prev.map((a) => (a.id === artId ? { ...a, image: undefined } : a))
    );
    setFeedback('Reset to default artwork canvas.');
    setTimeout(() => setFeedback(''), 3000);
  };


  // File upload reader with automatic image compression
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && activeUploadArt) {
      setIsCompressing(true);
      try {
        const compressed = await compressImage(file, 1600, 1600, 0.85);
        await handleSaveImage(activeUploadArt.id, compressed.dataUrl);
      } catch (err: any) {
        alert('Could not process image. Please try another image file.');
      } finally {
        setIsCompressing(false);
      }
    }
  };

  // URL input submit
  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim() || !activeUploadArt) return;
    await handleSaveImage(activeUploadArt.id, urlInput.trim());
  };

  return (
    <section id="art" className="border-t border-[#e8e8e8]">
      <div className="max-w-[1080px] mx-auto px-4 sm:px-8 py-20 sm:py-24 grid grid-cols-1 md:grid-cols-[200px_1fr] gap-8 md:gap-12">
        {/* Sticky Label */}
        <div className="md:sticky md:top-28 self-start space-y-2">
          <h2
            className="text-xs uppercase tracking-[0.14em] font-bold transition-colors"
            style={{ color: accentColor }}
          >
            Art
          </h2>
          <p className="text-xs text-gray-500 hidden md:block leading-relaxed">
            Visual works, studies &amp; materials
          </p>
        </div>

        {/* Content Column */}
        <div>
          {/* Header */}
          <div className="flex flex-wrap items-baseline justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2">
                <Palette className="w-5 h-5" style={{ color: accentColor }} />
                <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#141414]">
                  Art
                </h3>
              </div>
            </div>

            {feedback && (
              <div className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs flex items-center gap-1.5 animate-fade-in shadow-xs">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>{feedback}</span>
              </div>
            )}
          </div>

          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            className="hidden"
          />

          {/* Artworks Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {artworks.map((art, index) => {
              const hasCustomImage = Boolean(art.image);

              return (
                <article
                  key={art.id}
                  className="group relative bg-white border border-[#e8e8e8] hover:border-gray-300 rounded-xl overflow-hidden shadow-xs hover:shadow-md transition duration-300 flex flex-col"
                >
                  {/* Artwork Canvas Frame */}
                  <div
                    onClick={() => setLightboxArt(art)}
                    className="relative aspect-[4/3] bg-gradient-to-br from-[#fafafa] via-[#f4f4f4] to-[#ebebeb] border-b border-[#e8e8e8] overflow-hidden flex items-center justify-center cursor-pointer"
                  >
                    {hasCustomImage ? (
                      <>
                        <img
                          src={art.image}
                          alt={art.title}
                          className="w-full h-full object-cover transition duration-700 group-hover:scale-[1.03]"
                          loading="lazy"
                        />
                        {/* Hover Overlay with Enlarge */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[2px]">
                          <span className="px-3 py-1.5 rounded-md bg-white text-gray-900 text-xs font-semibold flex items-center gap-1.5 shadow-md">
                            <Eye className="w-3.5 h-3.5" />
                            <span>Enlarge</span>
                          </span>
                        </div>
                      </>
                    ) : (
                      /* Minimalist Archival Canvas Placeholder */
                      <div className="w-full h-full p-6 flex flex-col justify-between bg-white/70 hover:bg-white relative overflow-hidden transition">
                        {/* Subtle decorative background water-mark / geometric art accent */}
                        <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full border border-gray-100 opacity-60 pointer-events-none" />

                        <div className="flex justify-between items-start z-10">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                            Artwork #{index + 1}
                          </span>
                          <span
                            className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-xs"
                            style={{ backgroundColor: accentColor }}
                          >
                            <Palette className="w-3 h-3" />
                          </span>
                        </div>

                        <div className="my-auto text-center py-2 z-10">
                          <ImageIcon className="w-9 h-9 mx-auto text-gray-300 group-hover:text-gray-500 transition mb-2" />
                          <p className="text-xs font-bold text-gray-900 line-clamp-1">{art.title}</p>
                          <p className="text-[11px] text-gray-500 mt-0.5">{art.medium}</p>
                        </div>
                      </div>
                    )}

                    {/* Badge Pill for Year */}
                    {art.year && (
                      <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded bg-black/60 backdrop-blur-xs text-white text-[10px] font-medium tracking-wide">
                        {art.year}
                      </div>
                    )}
                  </div>

                  {/* Artwork Metadata */}
                  <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <h4 className="text-lg font-bold text-gray-900 group-hover:text-black leading-snug">
                        {art.title}
                      </h4>
                    </div>

                    {/* Card Footer Actions */}
                    <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                      <button
                        type="button"
                        onClick={() => setLightboxArt(art)}
                        className="inline-flex items-center gap-1 font-semibold hover:underline"
                        style={{ color: accentColor }}
                      >
                        <span>View Details</span>
                        <Maximize2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>

      {/* Upload / Replace Artwork Modal */}
      {activeUploadArt && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in text-[#141414]">
          <div
            className="w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50/80">
              <div>
                <h3 className="text-sm font-bold text-gray-900">Upload Artwork Photo</h3>
                <p className="text-xs text-gray-500">{activeUploadArt.title}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setActiveUploadArt(null);
                  setUrlInput('');
                }}
                className="p-1 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-200 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              {/* Option 1: File from Computer */}
              <div
                onClick={() => !isCompressing && fileInputRef.current?.click()}
                className="p-6 border-2 border-dashed border-gray-300 hover:border-gray-500 rounded-xl text-center cursor-pointer bg-gray-50/50 hover:bg-gray-50 transition"
              >
                {isCompressing ? (
                  <div className="py-2 flex flex-col items-center justify-center gap-2">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                    <span className="font-semibold text-gray-800">Optimizing &amp; compressing image...</span>
                    <span className="text-[11px] text-gray-400">Scaling to high-quality lightweight web asset</span>
                  </div>
                ) : (
                  <>
                    <Upload className="w-6 h-6 mx-auto text-gray-400 mb-2" />
                    <span className="font-semibold text-blue-600 hover:underline block">
                      Select photo of your artwork
                    </span>
                    <span className="text-[11px] text-gray-400 mt-1 block">
                      Any photo size (auto-compressed to prevent quota errors)
                    </span>
                  </>
                )}
              </div>

              {/* Option 2: Image URL */}
              <form onSubmit={handleUrlSubmit} className="space-y-2 pt-2 border-t border-gray-100">
                <label className="font-semibold text-gray-700 block">
                  Or paste an image web link:
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <LinkIcon className="w-3.5 h-3.5 absolute left-3 top-2.5 text-gray-400" />
                    <input
                      type="url"
                      placeholder="https://example.com/artwork.jpg"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-gray-900 text-white hover:bg-black transition shrink-0"
                  >
                    Save URL
                  </button>
                </div>
              </form>
            </div>

            <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setActiveUploadArt(null);
                  setUrlInput('');
                }}
                className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Modal for Enlarge View */}
      {lightboxArt && (
        <div
          className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in"
          onClick={() => setLightboxArt(null)}
        >
          <div
            className="relative w-full max-w-4xl max-h-[92vh] bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col text-[#141414]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div>
                <h4 className="text-lg font-bold text-gray-900">{lightboxArt.title}</h4>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setLightboxArt(null)}
                  className="p-1.5 text-gray-500 hover:text-gray-900 rounded-md hover:bg-gray-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Artwork Canvas Large View */}
            <div className="p-4 sm:p-6 overflow-auto max-h-[82vh] flex items-center justify-center bg-gray-900">
              {lightboxArt.image ? (
                <img
                  src={lightboxArt.image}
                  alt={lightboxArt.title}
                  className="max-h-[78vh] w-auto object-contain rounded shadow-lg"
                />
              ) : (
                <div className="w-full max-w-lg aspect-[4/3] bg-gray-800 rounded-lg p-8 flex flex-col items-center justify-center text-center text-gray-300">
                  <Palette className="w-12 h-12 mb-3 text-gray-500" />
                  <h5 className="text-lg font-bold text-white mb-1">{lightboxArt.title}</h5>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
