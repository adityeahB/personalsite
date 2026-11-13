import React from 'react';
import { PORTRAIT_IMAGE, PHOTO_EXTERNAL_LINK } from '../data';
import { ArrowDown, MapPin, ArrowUpRight } from 'lucide-react';
import { useContent } from '../context/ContentContext';
import { EditableText } from './EditableControls';

interface HeroProps {
  accentColor: string;
  portraitSrc?: string;
}

export const Hero: React.FC<HeroProps> = ({ accentColor, portraitSrc }) => {
  const { content } = useContent();
  const imageSrc = portraitSrc || PORTRAIT_IMAGE;

  return (
    <header
      id="top"
      className="min-h-screen flex items-center transition-colors duration-500 text-white relative"
      style={{ backgroundColor: accentColor }}
    >
      <div className="max-w-[1080px] w-full mx-auto px-4 sm:px-8 pt-[120px] pb-16 grid grid-cols-1 md:grid-cols-[1.25fr_1fr] gap-10 md:gap-16 items-center">
        {/* Left Column Text */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-white/15 backdrop-blur-xs tracking-wide">
              <MapPin className="w-3.5 h-3.5 opacity-90" />
              <EditableText path="hero.locationBadge" value={content.hero.locationBadge} tag="span" />
            </div>
          </div>

          <h1 className="text-[clamp(3rem,8vw,5.5rem)] font-bold tracking-[-0.035em] leading-[1.02]">
            <EditableText path="hero.greeting" value={content.hero.greeting} tag="span" />
          </h1>

          <p className="text-xl sm:text-2xl leading-relaxed max-w-[530px] opacity-92 font-normal">
            <EditableText path="hero.description" value={content.hero.description} tag="span" />
          </p>

          <div className="pt-4 flex flex-wrap items-center gap-6">
            <a
              href="#about"
              className="inline-flex items-center gap-2 text-base sm:text-lg font-medium border-b-[1.5px] border-current pb-0.5 hover:opacity-85 transition group"
            >
              <span><EditableText path="hero.ctaText" value={content.hero.ctaText} tag="span" /></span>
              <ArrowDown className="w-4 h-4 transition-transform group-hover:translate-y-0.5" />
            </a>

            <a
              href="#work"
              className="text-sm font-medium opacity-80 hover:opacity-100 transition hover:underline underline-offset-4"
            >
              Featured Work (Leve &amp; Rowbot) →
            </a>
          </div>
        </div>

        {/* Right Column Portrait Photo linked to external site */}
        <div className="flex justify-center md:justify-end relative group">
          <div className="w-full max-w-[340px] sm:max-w-[380px] aspect-[4/5] rounded-lg overflow-hidden shadow-2xl relative bg-black/15 border border-white/10 block">
            <a
              href={PHOTO_EXTERNAL_LINK}
              target="_blank"
              rel="noopener noreferrer"
              title="Open external link (opens in a new tab)"
              className="block w-full h-full cursor-pointer"
            >
              <img
                src={imageSrc}
                alt="Aditya Neil Banerjee"
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-[1.04]"
                loading="eager"
              />
              {/* Subtle overlay pill with external link indicator */}
              <div className="absolute bottom-3 left-3 right-3 py-2 px-3 rounded bg-black/40 backdrop-blur-md text-white text-xs flex justify-between items-center opacity-90 hover:opacity-100 transition">
                <span className="font-medium tracking-tight">Aditya Neil Banerjee</span>
                <span className="text-[11px] opacity-80 flex items-center gap-1">
                  <span>External Link</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};
