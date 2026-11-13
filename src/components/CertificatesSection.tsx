import React, { useState, useEffect, useRef } from 'react';
import { Award, Upload, Eye, X, ExternalLink, RotateCcw, Link as LinkIcon, Check, FileCheck, ZoomIn, Edit3, Loader2, Globe } from 'lucide-react';
import { DEFAULT_CERTIFICATES } from '../data';
import { Certificate } from '../types';
import { useContent } from '../context/ContentContext';
import { compressImage } from '../utils/imageCompressor';
import { persistPhoto, loadPersistedPhoto, removePersistedPhoto, fetchAllPersistedPhotos } from '../utils/storage';

interface CertificatesSectionProps {
  accentColor: string;
}

export const CertificatesSection: React.FC<CertificatesSectionProps> = ({ accentColor }) => {
  const { isEditMode } = useContent();

  // Load saved certificate images and metadata from localStorage
  const [certificates, setCertificates] = useState<Certificate[]>(() => {
    return DEFAULT_CERTIFICATES.map((cert) => {
      const savedImage = localStorage.getItem(`anb_cert_${cert.id}`);
      const savedMeta = localStorage.getItem(`anb_cert_meta_${cert.id}`);
      const parsedMeta = savedMeta ? JSON.parse(savedMeta) : {};
      return {
        ...cert,
        ...parsedMeta,
        image: savedImage || cert.image
      };
    });
  });

  // Modal states
  const [activeUploadCert, setActiveUploadCert] = useState<Certificate | null>(null);
  const [urlInput, setUrlInput] = useState<string>('');
  const [lightboxCert, setLightboxCert] = useState<Certificate | null>(null);
  const [feedback, setFeedback] = useState<string>('');
  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Hydrate persisted certificate photos from IndexedDB/Server if localStorage was cleared
  useEffect(() => {
    fetchAllPersistedPhotos().then((serverPhotos) => {
      if (serverPhotos?.certificates) {
        setCertificates((prev) =>
          prev.map((c) => (serverPhotos.certificates[c.id] ? { ...c, image: serverPhotos.certificates[c.id] } : c))
        );
      }
    });

    DEFAULT_CERTIFICATES.forEach((cert) => {
      loadPersistedPhoto(`anb_cert_${cert.id}`, cert.image || '').then((src) => {
        if (src) {
          setCertificates((prev) =>
            prev.map((c) => (c.id === cert.id ? { ...c, image: src } : c))
          );
        }
      });
    });
  }, []);

  // Sync to multi-tier storage (Server + IndexedDB + localStorage)
  const handleSaveImage = async (certId: string, imageDataUrl: string) => {
    const savedUrl = await persistPhoto(`anb_cert_${certId}`, imageDataUrl);
    setCertificates((prev) =>
      prev.map((c) => (c.id === certId ? { ...c, image: savedUrl } : c))
    );
    setFeedback('Certificate scan saved and synced to site!');
    setTimeout(() => setFeedback(''), 3500);
    setActiveUploadCert(null);
    setUrlInput('');
  };

  const handleRemoveImage = async (certId: string) => {
    await removePersistedPhoto(`anb_cert_${certId}`);
    setCertificates((prev) =>
      prev.map((c) => (c.id === certId ? { ...c, image: undefined } : c))
    );
    setFeedback('Reset to default certificate placeholder.');
    setTimeout(() => setFeedback(''), 3000);
  };

  const handleUpdateCertField = (certId: string, field: 'title' | 'issuer' | 'description', value: string) => {
    setCertificates((prev) => {
      const updated = prev.map((c) => (c.id === certId ? { ...c, [field]: value } : c));
      const target = updated.find((c) => c.id === certId);
      if (target) {
        localStorage.setItem(
          `anb_cert_meta_${certId}`,
          JSON.stringify({ title: target.title, issuer: target.issuer, description: target.description })
        );
      }
      return updated;
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && activeUploadCert) {
      setIsCompressing(true);
      try {
        const compressed = await compressImage(file, 1600, 1600, 0.85);
        await handleSaveImage(activeUploadCert.id, compressed.dataUrl);
      } catch (err: any) {
        alert('Could not process certificate image. Please try another image.');
      } finally {
        setIsCompressing(false);
      }
    }
  };

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim() || !activeUploadCert) return;
    await handleSaveImage(activeUploadCert.id, urlInput.trim());
  };

  return (
    <section id="certificates" className="border-t border-[#e8e8e8]">
      <div className="max-w-[1080px] mx-auto px-4 sm:px-8 py-20 sm:py-24 grid grid-cols-1 md:grid-cols-[200px_1fr] gap-8 md:gap-12">
        {/* Sticky Label */}
        <div className="md:sticky md:top-28 self-start space-y-2">
          <h2
            className="text-xs uppercase tracking-[0.14em] font-bold transition-colors"
            style={{ color: accentColor }}
          >
            Certificates
          </h2>
          <p className="text-xs text-gray-500 hidden md:block">
            Verified credentials &amp; awards
          </p>
        </div>

        {/* Content Column */}
        <div>
          <div className="flex flex-wrap items-baseline justify-between gap-4 mb-8">
            <div>
              <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#141414]">
                Certificates &amp; Credentials
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Official awards, research honours, and program completions. Click any certificate to enlarge or upload a scan.
              </p>
            </div>

            {feedback && (
              <div className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs flex items-center gap-1.5 animate-fade-in">
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

          {/* Certificates Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {certificates.map((cert, index) => {
              const hasCustomImage = Boolean(cert.image);

              return (
                <div
                  key={cert.id}
                  className="group relative bg-white border border-[#e8e8e8] hover:border-gray-300 rounded-xl overflow-hidden shadow-xs hover:shadow-md transition duration-300 flex flex-col"
                >
                  {/* Certificate Image Canvas */}
                  <div
                    onClick={() => hasCustomImage && setLightboxCert(cert)}
                    className={`relative aspect-[4/3] bg-gradient-to-br from-gray-50 to-gray-100/80 border-b border-[#e8e8e8] overflow-hidden flex items-center justify-center ${hasCustomImage ? 'cursor-pointer' : ''}`}
                  >
                    {hasCustomImage ? (
                      <>
                        <img
                          src={cert.image}
                          alt={`${cert.title} Certificate`}
                          className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                        {/* Overlay Actions on Hover */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[1px]">
                          <button
                            onClick={() => setLightboxCert(cert)}
                            className="px-3 py-1.5 rounded-md bg-white text-gray-900 text-xs font-semibold flex items-center gap-1 shadow-md hover:bg-gray-100 transition"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Enlarge</span>
                          </button>
                        </div>
                      </>
                    ) : (
                      /* Elegant Placeholder when no scan uploaded yet */
                      <div className="w-full h-full p-6 flex flex-col justify-between border-2 border-dashed border-gray-200 bg-white/70 hover:bg-white transition">
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                            Certificate #{index + 1}
                          </span>
                          <span
                            className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-xs"
                            style={{ backgroundColor: accentColor }}
                          >
                            <Award className="w-3.5 h-3.5" />
                          </span>
                        </div>

                        <div className="my-auto text-center py-2">
                          <FileCheck className="w-8 h-8 mx-auto text-gray-300 group-hover:text-gray-500 transition mb-2" />
                          <p className="text-xs font-semibold text-gray-800 line-clamp-1">{cert.title}</p>
                          <p className="text-[11px] text-gray-500 mt-0.5">{cert.issuer}</p>
                        </div>
                      </div>
                    )}

                    {/* Badge Pill for Year */}
                    <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded bg-black/60 backdrop-blur-xs text-white text-[10px] font-medium tracking-wide">
                      {cert.year}
                    </div>
                  </div>

                  {/* Certificate Information */}
                  <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <h4 className="text-base font-bold text-gray-900 group-hover:text-black leading-snug">
                        {isEditMode ? (
                          <span
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={(e) => handleUpdateCertField(cert.id, 'title', e.currentTarget.innerText.trim())}
                            className="outline-dashed outline-1 outline-blue-400 hover:outline-blue-600 px-1 py-0.5 rounded cursor-text"
                            title="Click to edit certificate title"
                          >
                            {cert.title}
                          </span>
                        ) : (
                          cert.title
                        )}
                      </h4>
                      <p className="text-xs text-gray-600 font-medium mt-0.5">
                        {isEditMode ? (
                          <span
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={(e) => handleUpdateCertField(cert.id, 'issuer', e.currentTarget.innerText.trim())}
                            className="outline-dashed outline-1 outline-blue-400 hover:outline-blue-600 px-1 py-0.5 rounded cursor-text"
                            title="Click to edit certificate issuer"
                          >
                            {cert.issuer}
                          </span>
                        ) : (
                          cert.issuer
                        )}
                      </p>
                      {cert.description && (
                        <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                          {isEditMode ? (
                            <span
                              contentEditable
                              suppressContentEditableWarning
                              onBlur={(e) => handleUpdateCertField(cert.id, 'description', e.currentTarget.innerText.trim())}
                              className="outline-dashed outline-1 outline-blue-400 hover:outline-blue-600 px-1 py-0.5 rounded cursor-text block"
                              title="Click to edit certificate description"
                            >
                              {cert.description}
                            </span>
                          ) : (
                            cert.description
                          )}
                        </p>
                      )}
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                      {cert.link ? (
                        <a
                          href={cert.link}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 font-semibold hover:underline"
                          style={{ color: accentColor }}
                        >
                          <span>Verification</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      ) : (
                        <span className="text-gray-400 text-[11px]">Official Credential</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Upload / Edit Certificate Modal */}
      {activeUploadCert && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in text-[#141414]">
          <div
            className="w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50/80">
              <div>
                <h3 className="text-sm font-bold text-gray-900">Upload Certificate</h3>
                <p className="text-xs text-gray-500">{activeUploadCert.title}</p>
              </div>
              <button
                onClick={() => {
                  setActiveUploadCert(null);
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
                    <span className="font-semibold text-gray-800">Optimizing &amp; compressing scan...</span>
                    <span className="text-[11px] text-gray-400">Scaling to high-quality lightweight asset</span>
                  </div>
                ) : (
                  <>
                    <Upload className="w-6 h-6 mx-auto text-gray-400 mb-2" />
                    <span className="font-semibold text-blue-600 hover:underline block">
                      Select image from your computer
                    </span>
                    <span className="text-[11px] text-gray-400 mt-1 block">
                      Any image size (auto-compressed to prevent quota errors)
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
                      placeholder="https://example.com/certificate.jpg"
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
                onClick={() => {
                  setActiveUploadCert(null);
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
      {lightboxCert && lightboxCert.image && (
        <div
          className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
          onClick={() => setLightboxCert(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col text-[#141414]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-gray-50">
              <div>
                <h4 className="text-base font-bold text-gray-900">{lightboxCert.title}</h4>
                <p className="text-xs text-gray-500">{lightboxCert.issuer} · {lightboxCert.year}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setLightboxCert(null)}
                  className="p-1.5 text-gray-500 hover:text-gray-900 rounded-md hover:bg-gray-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Certificate Large View */}
            <div className="p-4 sm:p-6 overflow-auto max-h-[75vh] flex items-center justify-center bg-gray-900">
              <img
                src={lightboxCert.image}
                alt={lightboxCert.title}
                className="max-h-[70vh] w-auto object-contain rounded shadow-lg"
              />
            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between text-xs text-gray-500">
              <span>{lightboxCert.description || 'Verified credential'}</span>
              {lightboxCert.link && (
                <a
                  href={lightboxCert.link}
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-blue-600 hover:underline inline-flex items-center gap-1"
                >
                  <span>Official Record</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
