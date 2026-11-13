import React from 'react';
import { ArrowUpRight, ExternalLink, Award, Eye } from 'lucide-react';
import { PROJECTS, OTHER_WORK } from '../data';
import { Project } from '../types';
import { useContent } from '../context/ContentContext';
import { EditableText } from './EditableControls';

interface WorkSectionProps {
  accentColor: string;
  onOpenProjectDetail: (project: Project) => void;
  leveSrc?: string;
  rowbotSrc?: string;
}

export const WorkSection: React.FC<WorkSectionProps> = ({
  accentColor,
  onOpenProjectDetail,
  leveSrc,
  rowbotSrc,
}) => {
  const { content } = useContent();
  const projectsList = content?.work?.projects || PROJECTS;
  const otherList = content?.work?.otherItems || OTHER_WORK;

  return (
    <section id="work" className="border-t border-[#e8e8e8]">
      <div className="max-w-[1080px] mx-auto px-4 sm:px-8 py-20 sm:py-24 grid grid-cols-1 md:grid-cols-[200px_1fr] gap-8 md:gap-12">
        {/* Sticky Label */}
        <div className="md:sticky md:top-28 self-start space-y-3">
          <h2
            className="text-xs uppercase tracking-[0.14em] font-bold transition-colors"
            style={{ color: accentColor }}
          >
            Work
          </h2>
        </div>

        {/* Content Column */}
        <div>
          {/* Featured Projects */}
          <div className="space-y-16">
            {projectsList.map((project, pIdx) => {
              const projectImage = project.id === 'leve' && leveSrc
                ? leveSrc
                : project.id === 'rowbot' && rowbotSrc
                ? rowbotSrc
                : project.image;

              return (
                <article key={project.id} className="group">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="text-3xl sm:text-[2.1rem] font-bold tracking-[-0.025em] leading-[1.1] text-[#141414]">
                      <EditableText path={`work.projects.${pIdx}.title`} value={project.title} tag="span" />
                    </h3>
                    {project.badges && (
                      <div className="flex flex-wrap gap-1.5">
                        {project.badges.slice(0, 2).map((badge, idx) => {
                          const badgeLink = badge.toLowerCase().includes('diana')
                            ? 'https://diana-award.org.uk/our-programmes-and-initiatives/award-and-development/roll-of-honour/roll-of-honour-2026'
                            : badge.toLowerCase().includes('bright future')
                            ? 'https://www.ardonaghtrust.org/our-news/meet-bright-future-prizes-2026-finalists'
                            : null;

                          return badgeLink ? (
                            <a
                              key={idx}
                              href={badgeLink}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200 transition inline-flex items-center gap-0.5"
                            >
                              <span>{badge}</span>
                              <span className="text-[10px] text-gray-400">↗</span>
                            </a>
                          ) : (
                            <span
                              key={idx}
                              className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 border border-gray-200"
                            >
                              {badge}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className="text-[#6b6b6b] text-[0.92rem] mt-1.5 mb-4 font-normal">
                    <EditableText path={`work.projects.${pIdx}.meta`} value={project.meta} tag="span" />
                  </div>

                  {/* Project Image Preview Card */}
                  {projectImage && (
                    <div className="relative max-w-[640px] mb-5 group/box">
                      <div
                        onClick={() => onOpenProjectDetail({ ...project, image: projectImage })}
                        className="rounded-xl overflow-hidden border border-gray-200 aspect-[16/9] relative cursor-pointer group/img shadow-sm"
                      >
                        <img
                          src={projectImage}
                          alt={project.imageAlt || project.title}
                          className="w-full h-full object-cover transition duration-500 group-hover/img:scale-105"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-black/25 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-1.5 backdrop-blur-[1px]">
                          <Eye className="w-4 h-4" />
                          <span>View details &amp; gallery</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Descriptions */}
                  <div className="space-y-3 max-w-[640px] text-[1.05rem] leading-relaxed text-[#2a2a2a] mb-5">
                    {project.desc.map((d, idx) => (
                      <EditableText
                        key={idx}
                        path={`work.projects.${pIdx}.desc.${idx}`}
                        value={d}
                        tag="p"
                      />
                    ))}
                  </div>

                  {/* Action Links */}
                  <div className="flex items-center gap-4">
                    {project.link && (
                      <a
                        href={project.link}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 font-semibold text-[0.98rem] pb-0.5 border-b-[1.5px] hover:opacity-80 transition"
                        style={{ color: accentColor, borderColor: accentColor }}
                      >
                        <span>{project.linkText}</span>
                        <ArrowUpRight className="w-4 h-4" />
                      </a>
                    )}
                    <button
                      onClick={() => onOpenProjectDetail(project)}
                      className="text-xs font-medium text-gray-500 hover:text-gray-900 transition underline underline-offset-4"
                    >
                      Read full overview
                    </button>
                  </div>
                </article>
              );
            })}
          </div>

          {/* Subheading: Other things */}
          <h4 className="text-xs uppercase tracking-[0.14em] text-[#6b6b6b] font-semibold mt-20 mb-3">
            Other things I&apos;ve been part of
          </h4>

          {/* Other Items List */}
          <div className="divide-y divide-[#e8e8e8]">
            {otherList.map((item, oIdx) => (
              <div
                key={item.id}
                className="grid grid-cols-1 sm:grid-cols-[110px_1fr] gap-2 sm:gap-6 py-5"
              >
                <span className="text-[#6b6b6b] text-[0.9rem] pt-0.5 font-normal">
                  <EditableText path={`work.otherItems.${oIdx}.when`} value={item.when} tag="span" />
                </span>
                <div>
                  <h5 className="text-[1.08rem] font-semibold leading-[1.4] text-[#141414]">
                    {item.link ? (
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:underline inline-flex items-center gap-1"
                        style={{ color: accentColor }}
                      >
                        <EditableText path={`work.otherItems.${oIdx}.title`} value={item.title} tag="span" />
                        <span className="inline-block ml-0.5">↗</span>
                      </a>
                    ) : (
                      <EditableText path={`work.otherItems.${oIdx}.title`} value={item.title} tag="span" />
                    )}
                  </h5>
                  {item.where && (
                    <div className="text-[#6b6b6b] text-[0.92rem] mt-0.5">
                      <EditableText path={`work.otherItems.${oIdx}.where`} value={item.where} tag="span" />
                    </div>
                  )}
                  {item.desc && (
                    <div className="text-[0.95rem] mt-1.5 max-w-[640px] text-[#333] leading-relaxed">
                      <EditableText path={`work.otherItems.${oIdx}.desc`} value={item.desc} tag="p" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
