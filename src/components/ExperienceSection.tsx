import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { EXPERIENCE_ITEMS } from '../data';
import { useContent } from '../context/ContentContext';
import { EditableText, EditSectionButton } from './EditableControls';

interface ExperienceSectionProps {
  accentColor: string;
}

export const ExperienceSection: React.FC<ExperienceSectionProps> = ({ accentColor }) => {
  const { content } = useContent();
  const experienceList = content?.experience?.items || EXPERIENCE_ITEMS;

  return (
    <section id="experience" className="border-t border-[#e8e8e8]">
      <div className="max-w-[1080px] mx-auto px-4 sm:px-8 py-20 sm:py-24 grid grid-cols-1 md:grid-cols-[200px_1fr] gap-8 md:gap-12">
        {/* Sticky Label */}
        <div className="md:sticky md:top-28 self-start space-y-3">
          <h2
            className="text-xs uppercase tracking-[0.14em] font-bold transition-colors"
            style={{ color: accentColor }}
          >
            Experience
          </h2>
          <EditSectionButton sectionId="experience" label="Edit experience text" />
        </div>

        {/* List */}
        <div className="divide-y divide-[#e8e8e8]">
          {experienceList.map((item, idx) => (
            <div
              key={item.id}
              className="grid grid-cols-1 sm:grid-cols-[110px_1fr] gap-2 sm:gap-6 py-5 group"
            >
              <span className="text-[#6b6b6b] text-[0.9rem] pt-0.5 font-normal">
                <EditableText path={`experience.items.${idx}.when`} value={item.when} tag="span" />
              </span>
              <div>
                <h5 className="text-[1.08rem] font-semibold leading-[1.4] text-[#141414] group-hover:text-black">
                  {item.link ? (
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 hover:underline"
                      style={{ color: accentColor }}
                    >
                      <EditableText path={`experience.items.${idx}.title`} value={item.title} tag="span" />
                      <ArrowUpRight className="w-4 h-4 shrink-0" />
                    </a>
                  ) : (
                    <EditableText path={`experience.items.${idx}.title`} value={item.title} tag="span" />
                  )}
                </h5>
                {item.where && (
                  <div className="text-[#6b6b6b] text-[0.92rem] mt-0.5 font-normal">
                    <EditableText path={`experience.items.${idx}.where`} value={item.where} tag="span" />
                  </div>
                )}
                {item.desc && (
                  <div className="text-[0.95rem] mt-1.5 max-w-[640px] text-[#333] leading-relaxed">
                    <EditableText path={`experience.items.${idx}.desc`} value={item.desc} tag="p" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
