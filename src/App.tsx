/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { AboutSection } from './components/AboutSection';
import { WorkSection } from './components/WorkSection';
import { ResearchWritingSection } from './components/ResearchWritingSection';
import { ExperienceSection } from './components/ExperienceSection';
import { RecognitionSection } from './components/RecognitionSection';
import { EducationSection } from './components/EducationSection';
import { CertificatesSection } from './components/CertificatesSection';
import { ArtSection } from './components/ArtSection';
import { ContactSection } from './components/ContactSection';
import { CvModal } from './components/CvModal';
import { SearchModal } from './components/SearchModal';
import { ProjectDetailModal } from './components/ProjectDetailModal';
import { ImageEditModal, ImageSlot } from './components/ImageEditModal';
import { PublishPhotoSyncModal } from './components/PublishPhotoSyncModal';
import { ContentProvider } from './context/ContentContext';
import { persistPhoto, loadPersistedPhoto, removePersistedPhoto, syncAllLocalPhotosToServer, fetchAllPersistedPhotos } from './utils/storage';
import { THEME_OPTIONS, PROJECTS, PORTRAIT_IMAGE, LEVE_IMAGE, ROWBOT_IMAGE } from './data';
import { ThemeOption, Project } from './types';

export default function App() {
  const [currentTheme, setCurrentTheme] = useState<ThemeOption>(() => {
    const saved = localStorage.getItem('anb_theme_id');
    if (saved) {
      const found = THEME_OPTIONS.find((t) => t.id === saved);
      if (found) return found;
    }
    return THEME_OPTIONS[0]; // Royal Cobalt #2f3fe0
  });

  const [accentColor, setAccentColor] = useState<string>(() => {
    return localStorage.getItem('anb_accent_color') || currentTheme.color;
  });

  // Photo management state with local persistence
  const [portraitImage, setPortraitImage] = useState<string>(() => {
    return localStorage.getItem('anb_photo_portrait') || PORTRAIT_IMAGE;
  });
  const [leveImage, setLeveImage] = useState<string>(() => {
    const saved = localStorage.getItem('anb_photo_leve');
    if (saved && !saved.includes('leve_community_1794058095294.jpg')) return saved;
    return LEVE_IMAGE;
  });
  const [rowbotImage, setRowbotImage] = useState<string>(() => {
    const saved = localStorage.getItem('anb_photo_rowbot');
    if (saved && !saved.includes('rowbot_buoy_1794058083297.jpg')) return saved;
    return ROWBOT_IMAGE;
  });

  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [cvModalOpen, setCvModalOpen] = useState(false);
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [publishSyncModalOpen, setPublishSyncModalOpen] = useState(false);
  const [activePhotoSlot, setActivePhotoSlot] = useState<string>('portrait');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const imageSlots: ImageSlot[] = [
    {
      key: 'portrait',
      name: 'Hero Portrait',
      recommendedAspect: '4:5 or 3:4 (Vertical)',
      currentSrc: portraitImage,
      defaultSrc: PORTRAIT_IMAGE,
    },
    {
      key: 'leve',
      name: 'Leve Project',
      recommendedAspect: '16:9 (Horizontal)',
      currentSrc: leveImage,
      defaultSrc: LEVE_IMAGE,
    },
    {
      key: 'rowbot',
      name: 'Rowbot Project',
      recommendedAspect: '16:9 (Horizontal)',
      currentSrc: rowbotImage,
      defaultSrc: ROWBOT_IMAGE,
    },
  ];

  // Auto-sync any existing local browser photos/URLs into codebase, and hydrate from server
  useEffect(() => {
    // 1. Sweep local uploads into codebase so published build receives them
    syncAllLocalPhotosToServer();

    // 2. Hydrate from IndexedDB / Server
    loadPersistedPhoto('anb_photo_portrait', PORTRAIT_IMAGE).then((src) => {
      if (src && src !== PORTRAIT_IMAGE) setPortraitImage(src);
    });
    loadPersistedPhoto('anb_photo_leve', LEVE_IMAGE).then((src) => {
      if (src && src !== LEVE_IMAGE && !src.includes('leve_community_1794058095294.jpg')) setLeveImage(src);
    });
    loadPersistedPhoto('anb_photo_rowbot', ROWBOT_IMAGE).then((src) => {
      if (src && src !== ROWBOT_IMAGE && !src.includes('rowbot_buoy_1794058083297.jpg')) setRowbotImage(src);
    });

    fetchAllPersistedPhotos().then((serverPhotos) => {
      if (serverPhotos) {
        if (serverPhotos.portrait && !localStorage.getItem('anb_photo_portrait')) {
          setPortraitImage(serverPhotos.portrait);
        }
        if (serverPhotos.leve) {
          setLeveImage(serverPhotos.leve);
        }
        if (serverPhotos.rowbot) {
          setRowbotImage(serverPhotos.rowbot);
        }
      }
    });
  }, []);

  const handleUpdateImage = async (slotKey: string, newSrc: string) => {
    const key = `anb_photo_${slotKey}`;
    const savedUrl = await persistPhoto(key, newSrc);
    if (slotKey === 'portrait') {
      setPortraitImage(savedUrl);
    } else if (slotKey === 'leve') {
      setLeveImage(savedUrl);
    } else if (slotKey === 'rowbot') {
      setRowbotImage(savedUrl);
    }
  };

  const handleResetImage = async (slotKey: string) => {
    const key = `anb_photo_${slotKey}`;
    await removePersistedPhoto(key);
    if (slotKey === 'portrait') {
      setPortraitImage(PORTRAIT_IMAGE);
    } else if (slotKey === 'leve') {
      setLeveImage(LEVE_IMAGE);
    } else if (slotKey === 'rowbot') {
      setRowbotImage(ROWBOT_IMAGE);
    }
  };

  const handleOpenPhotoEditor = (slotKey = 'portrait') => {
    setActivePhotoSlot(slotKey);
    setPhotoModalOpen(true);
  };

  // Sync CSS variable `--bold`
  useEffect(() => {
    document.documentElement.style.setProperty('--bold', accentColor);
    localStorage.setItem('anb_accent_color', accentColor);
  }, [accentColor]);

  // Keyboard shortcut Ctrl/Cmd+K for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchModalOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setSearchModalOpen(false);
        setCvModalOpen(false);
        setSelectedProject(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSelectTheme = (theme: ThemeOption) => {
    setCurrentTheme(theme);
    setAccentColor(theme.color);
    localStorage.setItem('anb_theme_id', theme.id);
  };

  const handleCustomColor = (color: string) => {
    setAccentColor(color);
    setCurrentTheme({
      id: 'custom',
      name: `Custom (${color})`,
      color,
      onColor: '#ffffff'
    });
  };

  const handleSelectProjectById = (id: string) => {
    const proj = PROJECTS.find((p) => p.id === id);
    if (proj) {
      setSelectedProject(proj);
    }
  };

  return (
    <ContentProvider>
      <div className="min-h-screen bg-white text-[#141414] font-['DM_Sans',system-ui,sans-serif]">
        {/* Sticky navigation bar */}
        <Navbar
          onOpenSearch={() => setSearchModalOpen(true)}
          onOpenCv={() => setCvModalOpen(true)}
        />

        {/* Main hero header */}
        <Hero
          accentColor={accentColor}
          portraitSrc={portraitImage}
        />

        {/* Main content body */}
        <main>
          <AboutSection accentColor={accentColor} />
          <WorkSection
            accentColor={accentColor}
            onOpenProjectDetail={(proj) => setSelectedProject(proj)}
            leveSrc={leveImage}
            rowbotSrc={rowbotImage}
          />
          <ResearchWritingSection accentColor={accentColor} />
          <ExperienceSection accentColor={accentColor} />
          <RecognitionSection accentColor={accentColor} />
          <EducationSection accentColor={accentColor} />
          <CertificatesSection accentColor={accentColor} />
          <ArtSection accentColor={accentColor} />
        </main>

        {/* Contact & Footer */}
        <ContactSection
          accentColor={accentColor}
          onOpenCv={() => setCvModalOpen(true)}
        />

        {/* Search Modal */}
        <SearchModal
          isOpen={searchModalOpen}
          onClose={() => setSearchModalOpen(false)}
          accentColor={accentColor}
          onSelectProject={handleSelectProjectById}
        />

        {/* CV Modal */}
        <CvModal
          isOpen={cvModalOpen}
          onClose={() => setCvModalOpen(false)}
          accentColor={accentColor}
        />

        {/* Project Detail Modal */}
        <ProjectDetailModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
          accentColor={accentColor}
        />

        {/* Image / Photo Edit Modal */}
        <ImageEditModal
          isOpen={photoModalOpen}
          onClose={() => setPhotoModalOpen(false)}
          slots={imageSlots}
          activeSlotKey={activePhotoSlot}
          onUpdateImage={handleUpdateImage}
          onResetImage={handleResetImage}
          accentColor={accentColor}
        />

        {/* Dedicated Modal to manage all photo URLs & permanently bake them into the published site */}
        <PublishPhotoSyncModal
          isOpen={publishSyncModalOpen}
          onClose={() => setPublishSyncModalOpen(false)}
          accentColor={accentColor}
        />
      </div>
    </ContentProvider>
  );
}
