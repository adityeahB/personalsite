import React, { useState } from 'react';
import { ArrowUpRight, BookOpen, ExternalLink, FileText, Feather } from 'lucide-react';
import { RESEARCH_ITEMS, ESSAY_ITEMS, CREATIVE_ITEMS } from '../data';
import { ListItem } from '../types';
import { useContent } from '../context/ContentContext';
import { EditableText, EditSectionButton } from './EditableControls';

interface ResearchWritingSectionProps {
  accentColor: string;
}

export const ResearchWritingSection: React.FC<ResearchWritingSectionProps> = ({ accentColor }) => {
  const [activeTab, setActiveTab] = useState<'all' | 'research' | 'essays' | 'creative'>('all');
  const { content } = useContent();

  const researchItems = content?.writing?.researchItems || RESEARCH_ITEMS;
  const essayItems = content?.writing?.essayItems || ESSAY_ITEMS;
  const creativeItems = content?.writing?.creativeItems || CREATIVE_ITEMS;

  const renderRow = (r: ListItem, basePath: string) => (
    <div
      key={r.id}
      className="grid grid-cols-1 sm:grid-cols-[110px_1fr] gap-2 sm:gap-6 py-5 border-b border-[#e8e8e8] last:border-b-0 group"
    >
      <span className="text-[#6b6b6b] text-[0.9rem] pt-0.5 font-normal">
        <EditableText path={`${basePath}.when`} value={r.when} tag="span" />
      </span>
      <div>
        <h5 className="text-[1.08rem] font-semibold leading-[1.4] text-[#141414] group-hover:text-black">
          {r.link ? (
            <a
              href={r.link}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 hover:underline"
              style={{ color: accentColor }}
            >
              <EditableText path={`${basePath}.title`} value={r.title} tag="span" />
              <ArrowUpRight className="w-4 h-4 shrink-0" />
            </a>
          ) : (
            <EditableText path={`${basePath}.title`} value={r.title} tag="span" />
          )}
        </h5>

        {r.where && (
          <div className="text-[#6b6b6b] text-[0.92rem] mt-0.5 font-normal flex flex-wrap items-center gap-2">
            <EditableText path={`${basePath}.where`} value={r.where} tag="span" />
            {r.tags && r.tags.length > 0 && (
              <span className="inline-flex gap-1 text-[11px]">
                {r.tags.map((t, i) => (
                  <span
                    key={i}
                    className="px-1.5 py-0.2 bg-gray-100 text-gray-600 rounded font-normal"
                  >
                    #{t}
                  </span>
                ))}
              </span>
            )}
          </div>
        )}

        {r.desc && (
          <div className="text-[0.95rem] mt-1.5 max-w-[640px] text-[#333] leading-relaxed">
            <EditableText path={`${basePath}.desc`} value={r.desc} tag="p" />
          </div>
        )}
      </div>
    </div>
  );

  return (
    <section id="writing" className="border-t border-[#e8e8e8]">
      <div className="max-w-[1080px] mx-auto px-4 sm:px-8 py-20 sm:py-24 grid grid-cols-1 md:grid-cols-[200px_1fr] gap-8 md:gap-12">
        {/* Sticky Label */}
        <div className="md:sticky md:top-28 self-start space-y-3">
          <h2
            className="text-xs uppercase tracking-[0.14em] font-bold transition-colors"
            style={{ color: accentColor }}
          >
            Research &amp; Writing
          </h2>

          <EditSectionButton sectionId="writing" label="Edit writing text" />

          {/* Quick tab switcher */}
          <div className="flex md:flex-col flex-wrap gap-1 text-xs pt-1">
            {[
              { id: 'all', label: 'All Writing' },
              { id: 'research', label: 'Research' },
              { id: 'essays', label: 'Essays & Papers' },
              { id: 'creative', label: 'Poetry & Books' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`px-2.5 py-1 text-left rounded transition text-xs font-medium ${
                  activeTab === tab.id
                    ? 'bg-gray-100 text-gray-900 font-semibold'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Column */}
        <div>
          {/* Research */}
          {(activeTab === 'all' || activeTab === 'research') && (
            <div className="mb-12">
              <h4 className="text-xs uppercase tracking-[0.14em] text-[#6b6b6b] font-semibold mb-2 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" style={{ color: accentColor }} />
                <span>Research</span>
              </h4>
              <div className="border-t border-[#e8e8e8]">
                {researchItems.map((item, idx) => renderRow(item, `writing.researchItems.${idx}`))}
              </div>
            </div>
          )}

          {/* Essays & Papers */}
          {(activeTab === 'all' || activeTab === 'essays') && (
            <div className="mb-12">
              <h4 className="text-xs uppercase tracking-[0.14em] text-[#6b6b6b] font-semibold mb-2 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" style={{ color: accentColor }} />
                <span>Essays &amp; papers</span>
              </h4>
              <div className="border-t border-[#e8e8e8]">
                {essayItems.map((item, idx) => renderRow(item, `writing.essayItems.${idx}`))}
              </div>
            </div>
          )}

          {/* Poetry & Creative */}
          {(activeTab === 'all' || activeTab === 'creative') && (
            <div className="mb-8">
              <h4 className="text-xs uppercase tracking-[0.14em] text-[#6b6b6b] font-semibold mb-2 flex items-center gap-1.5">
                <Feather className="w-3.5 h-3.5" style={{ color: accentColor }} />
                <span>Poetry &amp; books</span>
              </h4>
              <div className="border-t border-[#e8e8e8]">
                {creativeItems.map((item, idx) => renderRow(item, `writing.creativeItems.${idx}`))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
