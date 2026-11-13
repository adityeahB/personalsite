import React from 'react';
import { Compass, BookOpen, Sparkles } from 'lucide-react';
import { useContent } from '../context/ContentContext';
import { EditableText, EditSectionButton } from './EditableControls';

interface AboutSectionProps {
  accentColor: string;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ accentColor }) => {
  const { content } = useContent();

  return (
    <section id="about" className="relative">
      <div className="max-w-[1080px] mx-auto px-4 sm:px-8 py-20 sm:py-24 grid grid-cols-1 md:grid-cols-[200px_1fr] gap-8 md:gap-12">
        {/* Sticky Label */}
        <div className="md:sticky md:top-28 self-start space-y-2">
          <h2
            className="text-xs uppercase tracking-[0.14em] font-bold transition-colors"
            style={{ color: accentColor }}
          >
            About
          </h2>
          <EditSectionButton sectionId="about" label="Edit About" />
        </div>

        {/* About Prose */}
        <div className="space-y-6 max-w-[660px]">
          <p className="text-2xl sm:text-[1.65rem] leading-[1.4] font-medium tracking-[-0.015em] text-[#141414]">
            <EditableText path="about.p1" value={content.about.p1} tag="span" />
          </p>

          <p className="text-lg leading-relaxed text-[#2a2a2a]">
            <EditableText path="about.p2" value={content.about.p2} tag="span" />
          </p>

          <p className="text-lg leading-relaxed text-[#2a2a2a]">
            <EditableText path="about.p3" value={content.about.p3} tag="span" />
          </p>

          {/* Quick Context Callout */}
          <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-gray-600">
            <div className="p-3 rounded-lg border border-gray-100 bg-gray-50/70">
              <span className="font-semibold text-gray-900 block mb-0.5">Origins</span>
              <EditableText path="about.originsDesc" value={content.about.originsDesc} tag="span" />
            </div>
            <div className="p-3 rounded-lg border border-gray-100 bg-gray-50/70">
              <span className="font-semibold text-gray-900 block mb-0.5">Education</span>
              <EditableText path="about.educationDesc" value={content.about.educationDesc} tag="span" />
            </div>
            <div className="p-3 rounded-lg border border-gray-100 bg-gray-50/70">
              <span className="font-semibold text-gray-900 block mb-0.5">Interests</span>
              <EditableText path="about.interestsDesc" value={content.about.interestsDesc} tag="span" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
