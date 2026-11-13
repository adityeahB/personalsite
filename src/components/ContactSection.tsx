import React from 'react';
import { ArrowUp, ExternalLink, FileText, MessageSquare } from 'lucide-react';
import { useContent } from '../context/ContentContext';
import { EditableText, EditSectionButton } from './EditableControls';

interface ContactSectionProps {
  accentColor: string;
  onOpenCv: () => void;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ accentColor, onOpenCv }) => {
  const currentYear = new Date().getFullYear();
  const { content } = useContent();

  return (
    <section
      id="contact"
      className="text-white transition-colors duration-500 relative"
      style={{ backgroundColor: accentColor }}
    >
      <div className="max-w-[1080px] mx-auto px-4 sm:px-8 pt-28 pb-10">
        <div className="flex items-center justify-between mb-4">
          <EditSectionButton sectionId="contact" label="Edit contact text" />
        </div>

        <h2 className="text-[clamp(2.6rem,6vw,4.6rem)] font-bold tracking-[-0.035em] leading-[1.05] mb-6">
          <EditableText path="contact.heading" value={content.contact.heading} tag="span" />
        </h2>

        <p className="max-w-[540px] text-lg sm:text-xl opacity-92 mb-8 font-normal leading-relaxed">
          <EditableText path="contact.subheading" value={content.contact.subheading} tag="span" />
        </p>

        {/* Contact actions (no email ID displayed) */}
        <div className="flex flex-wrap items-center gap-4 my-8">
          <a
            href="https://www.linkedin.com"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-white text-gray-900 font-semibold text-sm hover:bg-gray-100 transition shadow-md hover:scale-[1.02]"
          >
            <MessageSquare className="w-4 h-4 text-blue-600" />
            <span>Connect on LinkedIn</span>
          </a>

          <button
            onClick={onOpenCv}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-white/40 hover:border-white text-white font-semibold text-sm hover:bg-white/10 transition"
          >
            <FileText className="w-4 h-4" />
            <span>View Curriculum Vitae</span>
          </button>
        </div>

        {/* Project Links */}
        <div className="flex gap-7 mt-12 flex-wrap text-base font-medium">
          <a
            href="https://www.linkedin.com"
            target="_blank"
            rel="noreferrer"
            className="opacity-85 hover:opacity-100 hover:underline underline-offset-6 transition"
          >
            LinkedIn
          </a>
          <a
            href="https://www.deleve.eu"
            target="_blank"
            rel="noreferrer"
            className="opacity-85 hover:opacity-100 hover:underline underline-offset-6 transition"
          >
            Leve
          </a>
          <a
            href="https://www.rowbots.eu"
            target="_blank"
            rel="noreferrer"
            className="opacity-85 hover:opacity-100 hover:underline underline-offset-6 transition"
          >
            Rowbot
          </a>
          <button
            onClick={onOpenCv}
            className="opacity-85 hover:opacity-100 hover:underline underline-offset-6 transition text-left cursor-pointer"
          >
            CV (PDF)
          </button>
        </div>

        {/* Footer */}
        <footer className="mt-24 pt-8 border-t border-white/20 text-[0.85rem] opacity-75 flex justify-between items-center flex-wrap gap-4">
          <span>© {currentYear} Aditya Neil Banerjee</span>
          <a
            href="#top"
            className="inline-flex items-center gap-1 hover:opacity-100 transition no-underline hover:underline underline-offset-4"
          >
            <span>Back to top</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </a>
        </footer>
      </div>
    </section>
  );
};
