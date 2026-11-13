import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  PROJECTS,
  OTHER_WORK,
  RESEARCH_ITEMS,
  ESSAY_ITEMS,
  CREATIVE_ITEMS,
  EXPERIENCE_ITEMS,
  HONORS_ITEMS,
  EDUCATION_ITEMS,
  SKILLS_LIST
} from '../data';
import { Project, ListItem, SkillCategory } from '../types';
import { syncSiteContentToServer } from '../utils/storage';

export interface SiteContent {
  hero: {
    greeting: string;
    locationBadge: string;
    description: string;
    ctaText: string;
  };
  about: {
    p1: string;
    p2: string;
    p3: string;
    originsTitle: string;
    originsDesc: string;
    educationTitle: string;
    educationDesc: string;
    interestsTitle: string;
    interestsDesc: string;
  };
  work: {
    projects: Project[];
    otherItems: ListItem[];
  };
  writing: {
    researchItems: ListItem[];
    essayItems: ListItem[];
    creativeItems: ListItem[];
  };
  experience: {
    items: ListItem[];
  };
  recognition: {
    items: ListItem[];
  };
  education: {
    items: ListItem[];
    skills: SkillCategory[];
  };
  contact: {
    heading: string;
    subheading: string;
  };
}

export const DEFAULT_SITE_CONTENT: SiteContent = {
  hero: {
    greeting: "Hi, I'm Aditya.",
    locationBadge: "Caldas da Rainha, Portugal · Stanford OHS",
    description: "I'm a student in Caldas da Rainha, Portugal. I start community projects, build small things for the environment, study economics, and write.",
    ctaText: "A bit more about me"
  },
  about: {
    p1: "I like figuring out how things work, whether markets, river-robots, or sentences, and then trying to make something useful with what I learn.",
    p2: "I grew up in São Paulo, Brazil, and now live in a small town in Portugal, where I study at Stanford Online High School. Most of what I do started close to home: a composting project, a buoy that checks the water-quality in local rivers, tutoring kids in math and adults in art.",
    p3: "At school I'm drawn to economics, math and computer science. Outside of it, I compost, illustrate and write. I edit our school newspaper and write poetry, sometimes about math and at other times about the beauty of bogs.",
    originsTitle: "Origins",
    originsDesc: "São Paulo, Brazil → Caldas da Rainha, Portugal",
    educationTitle: "Education",
    educationDesc: "Stanford Online High School · Senior",
    interestsTitle: "Interests",
    interestsDesc: "Public Policy, Economics, Building & Creative Writing"
  },
  work: {
    projects: PROJECTS,
    otherItems: OTHER_WORK
  },
  writing: {
    researchItems: RESEARCH_ITEMS,
    essayItems: ESSAY_ITEMS,
    creativeItems: CREATIVE_ITEMS
  },
  experience: {
    items: EXPERIENCE_ITEMS
  },
  recognition: {
    items: HONORS_ITEMS
  },
  education: {
    items: EDUCATION_ITEMS,
    skills: SKILLS_LIST
  },
  contact: {
    heading: "Say hello.",
    subheading: "I'm always glad to hear from people working on similar things, or just curious about them."
  }
};

interface ContentContextType {
  content: SiteContent;
  isEditMode: boolean;
  toggleEditMode: () => void;
  updateContent: (updater: (prev: SiteContent) => SiteContent) => void;
  updateField: (path: string, value: any) => void;
  resetAllContent: () => void;
  activeEditSection: string | null;
  openSectionEditor: (section: string) => void;
  closeSectionEditor: () => void;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

const STORAGE_KEY = 'anb_site_content_v4';

export const ContentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [content, setContent] = useState<SiteContent>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_SITE_CONTENT,
          ...parsed,
          hero: { ...DEFAULT_SITE_CONTENT.hero, ...parsed.hero },
          about: { ...DEFAULT_SITE_CONTENT.about, ...parsed.about },
          contact: { ...DEFAULT_SITE_CONTENT.contact, ...parsed.contact }
        };
      }
    } catch (e) {
      console.error('Failed to parse saved content', e);
    }
    return DEFAULT_SITE_CONTENT;
  });

  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [activeEditSection, setActiveEditSection] = useState<string | null>(null);

  // Hydrate from server /site-content.json if visiting published site or new device
  useEffect(() => {
    ['anb_site_content', 'anb_site_content_v2', 'anb_site_content_v3'].forEach((k) => {
      try {
        localStorage.removeItem(k);
      } catch (_) {}
    });

    fetch('/site-content.json')
      .then((res) => (res.ok ? res.json() : null))
      .then((serverData) => {
        if (serverData && typeof serverData === 'object' && Object.keys(serverData).length > 0) {
          setContent((prev) => ({
            ...prev,
            ...serverData,
          }));
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(content));
    } catch (e) {
      console.error('Failed to save content to localStorage', e);
    }
    syncSiteContentToServer(content);
  }, [content]);

  const toggleEditMode = () => setIsEditMode((prev) => !prev);

  const updateContent = (updater: (prev: SiteContent) => SiteContent) => {
    setContent((prev) => updater(prev));
  };

  const updateField = (path: string, value: any) => {
    setContent((prev) => {
      const copy = JSON.parse(JSON.stringify(prev));
      const parts = path.split('.');
      let current: any = copy;
      for (let i = 0; i < parts.length - 1; i++) {
        if (!current[parts[i]]) current[parts[i]] = {};
        current = current[parts[i]];
      }
      current[parts[parts.length - 1]] = value;
      return copy;
    });
  };

  const resetAllContent = () => {
    if (window.confirm('Reset all edited text back to original default content?')) {
      localStorage.removeItem(STORAGE_KEY);
      setContent(DEFAULT_SITE_CONTENT);
    }
  };

  const openSectionEditor = (section: string) => setActiveEditSection(section);
  const closeSectionEditor = () => setActiveEditSection(null);

  return (
    <ContentContext.Provider
      value={{
        content,
        isEditMode,
        toggleEditMode,
        updateContent,
        updateField,
        resetAllContent,
        activeEditSection,
        openSectionEditor,
        closeSectionEditor
      }}
    >
      {children}
    </ContentContext.Provider>
  );
};

export const useContent = () => {
  const ctx = useContext(ContentContext);
  if (!ctx) throw new Error('useContent must be used within ContentProvider');
  return ctx;
};
