import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { HONORS_ITEMS } from '../data';
import { useContent } from '../context/ContentContext';
import { EditableText, EditSectionButton } from './EditableControls';

interface RecognitionSectionProps {
  accentColor: string;
}

export const RecognitionSection: React.FC<RecognitionSectionProps> = ({ accentColor }) => {
  const { content } = useContent();
  const honorsList = content?.recognition?.items || HONORS_ITEMS;

  return (
    <section id="recognition" className="border-t border-[#e8e8e8]">
      <div className="max-w-[1080px] mx-auto px-4 sm:px-8 py-20 sm:py-24 grid grid-cols-1 md:grid-cols-[200px_1fr] gap-8 md:gap-12">
        {/* Sticky Label */}
        <div className="md:sticky md:top-28 self-start space-y-3">
          <h2
            className="text-xs uppercase tracking-[0.14em] font-bold transition-colors"
            style={{ color: accentColor }}
          >
            Recognition
          </h2>
          <EditSectionButton sectionId="recognition" label="Edit recognition text" />
        </div>

        {/* List */}
        <div className="divide-y divide-[#e8e8e8]">
          {honorsList.map((item, idx) => (
            <div
              key={item.id}
              className="grid grid-cols-1 sm:grid-cols-[110px_1fr] gap-2 sm:gap-6 py-4.5 group"
            >
              <span className="text-[#6b6b6b] text-[0.9rem] pt-0.5 font-normal">
                <EditableText path={`recognition.items.${idx}.when`} value={item.when} tag="span" />
              </span>
              <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
                <h5 className="text-[1.08rem] font-semibold leading-[1.4] text-[#141414] group-hover:text-black">
                  {item.link ? (
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 hover:underline"
                      style={{ color: accentColor }}
                    >
                      <EditableText path={`recognition.items.${idx}.title`} value={item.title} tag="span" />
                      <ArrowUpRight className="w-4 h-4 shrink-0" />
                    </a>
                  ) : (
                    <EditableText path={`recognition.items.${idx}.title`} value={item.title} tag="span" />
                  )}
                </h5>
                {item.where && (
                  <div className="text-[#6b6b6b] text-[0.92rem] font-normal sm:text-right">
                    <EditableText path={`recognition.items.${idx}.where`} value={item.where} tag="span" />
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
