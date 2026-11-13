import React, { useState, useMemo } from 'react';
import { Search, X, ArrowUpRight, FileText, Award, FolderKanban, GraduationCap, Palette } from 'lucide-react';
import { PROJECTS, OTHER_WORK, RESEARCH_ITEMS, ESSAY_ITEMS, CREATIVE_ITEMS, EXPERIENCE_ITEMS, HONORS_ITEMS, EDUCATION_ITEMS, SKILLS_LIST, DEFAULT_CERTIFICATES, DEFAULT_ARTWORKS } from '../data';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  accentColor: string;
  onSelectProject?: (id: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose, accentColor, onSelectProject }) => {
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    if (!query.trim()) return [];

    const q = query.toLowerCase().trim();
    const items: Array<{
      id: string;
      title: string;
      subtitle?: string;
      category: string;
      desc?: string;
      link?: string;
      targetSection: string;
    }> = [];

    // Projects
    PROJECTS.forEach((p) => {
      if (
        p.title.toLowerCase().includes(q) ||
        p.desc.some((d) => d.toLowerCase().includes(q)) ||
        p.meta.toLowerCase().includes(q)
      ) {
        items.push({
          id: p.id,
          title: p.title,
          subtitle: p.meta,
          category: 'Project',
          desc: p.desc[0],
          link: p.link,
          targetSection: '#work'
        });
      }
    });

    // Other Work
    OTHER_WORK.forEach((o) => {
      if (
        o.title.toLowerCase().includes(q) ||
        (o.desc && o.desc.toLowerCase().includes(q)) ||
        (o.where && o.where.toLowerCase().includes(q))
      ) {
        items.push({
          id: o.id,
          title: o.title,
          subtitle: o.where ? `${o.when} · ${o.where}` : o.when,
          category: 'Work & Initiative',
          desc: o.desc,
          link: o.link,
          targetSection: '#work'
        });
      }
    });

    // Research
    RESEARCH_ITEMS.forEach((r) => {
      if (
        r.title.toLowerCase().includes(q) ||
        (r.desc && r.desc.toLowerCase().includes(q)) ||
        (r.where && r.where.toLowerCase().includes(q))
      ) {
        items.push({
          id: r.id,
          title: r.title,
          subtitle: r.where,
          category: 'Research Paper',
          desc: r.desc,
          link: r.link,
          targetSection: '#writing'
        });
      }
    });

    // Essays
    ESSAY_ITEMS.forEach((e) => {
      if (
        e.title.toLowerCase().includes(q) ||
        (e.where && e.where.toLowerCase().includes(q)) ||
        (e.desc && e.desc.toLowerCase().includes(q))
      ) {
        items.push({
          id: e.id,
          title: e.title,
          subtitle: e.where,
          category: 'Essay / Paper',
          desc: e.desc,
          link: e.link,
          targetSection: '#writing'
        });
      }
    });

    // Creative
    CREATIVE_ITEMS.forEach((c) => {
      if (
        c.title.toLowerCase().includes(q) ||
        (c.where && c.where.toLowerCase().includes(q)) ||
        (c.desc && c.desc.toLowerCase().includes(q))
      ) {
        items.push({
          id: c.id,
          title: c.title,
          subtitle: c.where,
          category: 'Poetry & Book',
          desc: c.desc,
          link: c.link,
          targetSection: '#writing'
        });
      }
    });

    // Experience
    EXPERIENCE_ITEMS.forEach((exp) => {
      if (
        exp.title.toLowerCase().includes(q) ||
        (exp.desc && exp.desc.toLowerCase().includes(q)) ||
        (exp.where && exp.where.toLowerCase().includes(q))
      ) {
        items.push({
          id: exp.id,
          title: exp.title,
          subtitle: exp.where,
          category: 'Experience',
          desc: exp.desc,
          link: exp.link,
          targetSection: '#experience'
        });
      }
    });

    // Honors
    HONORS_ITEMS.forEach((h) => {
      if (
        h.title.toLowerCase().includes(q) ||
        (h.where && h.where.toLowerCase().includes(q))
      ) {
        items.push({
          id: h.id,
          title: h.title,
          subtitle: h.where ? `${h.when} · ${h.where}` : h.when,
          category: 'Recognition',
          link: h.link,
          targetSection: '#recognition'
        });
      }
    });

    // Education
    EDUCATION_ITEMS.forEach((edu) => {
      if (
        edu.title.toLowerCase().includes(q) ||
        (edu.where && edu.where.toLowerCase().includes(q))
      ) {
        items.push({
          id: edu.id,
          title: edu.title,
          subtitle: edu.where,
          category: 'Education',
          targetSection: '#education'
        });
      }
    });

    // Skills
    SKILLS_LIST.forEach((s, idx) => {
      if (s.items.toLowerCase().includes(q) || s.category.toLowerCase().includes(q)) {
        items.push({
          id: `skill-${idx}`,
          title: `${s.category}: ${s.items}`,
          subtitle: 'Technical & Creative Skills',
          category: 'Skills',
          targetSection: '#education'
        });
      }
    });

    // Certificates
    DEFAULT_CERTIFICATES.forEach((cert) => {
      if (
        cert.title.toLowerCase().includes(q) ||
        cert.issuer.toLowerCase().includes(q) ||
        (cert.description && cert.description.toLowerCase().includes(q))
      ) {
        items.push({
          id: cert.id,
          title: cert.title,
          subtitle: `${cert.issuer} (${cert.year})`,
          category: 'Certificate',
          desc: cert.description,
          link: cert.link,
          targetSection: '#certificates'
        });
      }
    });

    // Artworks
    DEFAULT_ARTWORKS.forEach((art) => {
      if (
        art.title.toLowerCase().includes(q) ||
        (art.medium && art.medium.toLowerCase().includes(q))
      ) {
        items.push({
          id: art.id,
          title: art.title,
          subtitle: art.medium || 'Artwork',
          category: 'Artwork',
          targetSection: '#art'
        });
      }
    });

    return items;
  }, [query]);

  if (!isOpen) return null;

  const handleSelect = (item: (typeof results)[0]) => {
    onClose();
    if (item.category === 'Project' && onSelectProject) {
      onSelectProject(item.id);
    }
    const element = document.querySelector(item.targetSection);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-20 p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col border border-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3 border-b border-gray-200 gap-3">
          <Search className="w-5 h-5 text-gray-400 shrink-0" />
          <input
            type="text"
            placeholder="Search papers, essays, Leve, Rowbot, honors, skills..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full text-base bg-transparent focus:outline-none placeholder:text-gray-400 text-gray-900"
          />
          {query && (
            <button 
              onClick={() => setQuery('')}
              className="p-1 text-gray-400 hover:text-gray-600 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="text-xs font-semibold px-2 py-1 bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
          >
            ESC
          </button>
        </div>

        {/* Search Results */}
        <div className="max-h-96 overflow-y-auto p-2">
          {!query.trim() && (
            <div className="p-6 text-center text-sm text-gray-500">
              <p className="font-medium text-gray-700">Quick Search</p>
              <p className="text-xs text-gray-400 mt-1">Try searching for &quot;economics&quot;, &quot;water&quot;, &quot;Locke&quot;, &quot;buoy&quot;, &quot;compost&quot;, &quot;Stanford&quot; or &quot;poetry&quot;.</p>
              <div className="flex flex-wrap justify-center gap-1.5 mt-4">
                {['Leve', 'Rowbot', 'Art', 'Earnings Calls', 'Amartya Sen', 'Diana Award', 'CREST Gold', 'Python'].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => setQuery(suggestion)}
                    className="text-xs px-2.5 py-1 bg-gray-50 border border-gray-200 rounded-full hover:bg-gray-100 text-gray-600"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {query.trim() && results.length === 0 && (
            <div className="p-8 text-center text-sm text-gray-500">
              No matching entries found for &quot;{query}&quot;.
            </div>
          )}

          {results.map((item) => (
            <button
              key={item.id}
              onClick={() => handleSelect(item)}
              className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition flex items-start justify-between gap-4 group border-b border-gray-50 last:border-b-0"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">
                    {item.category}
                  </span>
                  {item.subtitle && (
                    <span className="text-xs text-gray-400 truncate">{item.subtitle}</span>
                  )}
                </div>
                <h4 className="text-sm font-semibold text-gray-900 mt-1 group-hover:text-blue-600 transition">
                  {item.title}
                </h4>
                {item.desc && (
                  <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{item.desc}</p>
                )}
              </div>
              <ArrowUpRight className="w-4 h-4 text-gray-300 group-hover:text-gray-600 shrink-0 mt-1" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
