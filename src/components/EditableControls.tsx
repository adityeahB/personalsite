import React, { useState, useRef, useEffect } from 'react';
import { Pencil, Check, X, RotateCcw, Save, Edit3 } from 'lucide-react';
import { useContent } from '../context/ContentContext';

interface EditableTextProps {
  path: string;
  value: string;
  className?: string;
  multiline?: boolean;
  tag?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'p' | 'span';
}

export const EditableText: React.FC<EditableTextProps> = ({
  path,
  value,
  className = '',
  tag: Tag = 'span',
}) => {
  const { isEditMode, updateField } = useContent();
  const [justSaved, setJustSaved] = useState(false);
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (elementRef.current && elementRef.current.innerText !== value) {
      elementRef.current.innerText = value;
    }
  }, [value]);

  if (!isEditMode) {
    return <Tag className={className}>{value}</Tag>;
  }

  const handleBlur = (e: React.FocusEvent<HTMLElement>) => {
    const newText = e.currentTarget.innerText.trim();
    if (newText !== value) {
      updateField(path, newText);
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 2000);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && (Tag === 'h1' || Tag === 'h2' || Tag === 'h3' || Tag === 'h4' || Tag === 'h5')) {
      e.preventDefault();
      e.currentTarget.blur();
    }
  };

  return (
    <span className="relative inline-block group/editable">
      <Tag
        ref={elementRef as any}
        contentEditable
        suppressContentEditableWarning
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={`${className} outline-dashed outline-1 outline-blue-400 hover:outline-blue-600 hover:bg-blue-50/20 px-1 py-0.5 rounded cursor-text transition-all`}
        title="Click to edit text. Click outside to save."
      >
        {value}
      </Tag>
      <span className="absolute -top-3 -right-2 hidden group-hover/editable:flex items-center gap-0.5 px-1 py-0.5 bg-blue-600 text-white text-[9px] rounded shadow-xs z-10 pointer-events-none">
        <Pencil className="w-2.5 h-2.5" />
        <span>Edit</span>
      </span>
      {justSaved && (
        <span className="absolute -top-3 -right-2 flex items-center gap-0.5 px-1.5 py-0.5 bg-emerald-600 text-white text-[10px] rounded shadow-xs z-20 animate-fade-in pointer-events-none">
          <Check className="w-2.5 h-2.5" />
          <span>Saved</span>
        </span>
      )}
    </span>
  );
};

export const EditSectionButton: React.FC<{ sectionId: string; label?: string }> = () => null;

export const EditModeFloatingBar: React.FC = () => {
  const { isEditMode, toggleEditMode, resetAllContent } = useContent();

  if (!isEditMode) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[99] bg-gray-900/95 text-white px-5 py-3 rounded-full shadow-2xl backdrop-blur-md border border-white/10 flex items-center gap-4 text-xs animate-fade-in max-w-[95vw] overflow-x-auto">
      <div className="flex items-center gap-2 whitespace-nowrap">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="font-semibold">Edit Mode Active</span>
        <span className="text-gray-300 hidden md:inline">— Click text or upload photos (auto-compressed &amp; synced)</span>
      </div>

      <div className="flex items-center gap-2 pl-3 border-l border-white/20 whitespace-nowrap">
        <button
          onClick={resetAllContent}
          className="inline-flex items-center gap-1 px-2.5 py-1 text-gray-300 hover:text-white rounded hover:bg-white/10 transition"
          title="Reset all texts to initial defaults"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset</span>
        </button>

        <button
          onClick={toggleEditMode}
          className="inline-flex items-center gap-1 px-3 py-1 bg-white text-gray-900 font-bold rounded-full hover:bg-gray-100 transition shadow-sm"
        >
          <Check className="w-3.5 h-3.5" />
          <span>Done</span>
        </button>
      </div>
    </div>
  );
};

export const SectionEditModal: React.FC<{ accentColor: string }> = ({ accentColor }) => {
  const { activeEditSection, closeSectionEditor, content, updateField, updateContent } = useContent();

  if (!activeEditSection) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-fade-in text-[#141414]">
      <div
        className="w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] border border-gray-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center gap-2">
            <Edit3 className="w-4 h-4" style={{ color: accentColor }} />
            <h3 className="text-base font-bold capitalize">Edit {activeEditSection} Section</h3>
          </div>
          <button
            onClick={closeSectionEditor}
            className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
          {activeEditSection === 'hero' && (
            <>
              <div>
                <label className="font-semibold text-gray-700 block mb-1">Heading / Greeting</label>
                <input
                  type="text"
                  value={content.hero.greeting}
                  onChange={(e) => updateField('hero.greeting', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="font-semibold text-gray-700 block mb-1">Location Badge</label>
                <input
                  type="text"
                  value={content.hero.locationBadge}
                  onChange={(e) => updateField('hero.locationBadge', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="font-semibold text-gray-700 block mb-1">Hero Description</label>
                <textarea
                  rows={4}
                  value={content.hero.description}
                  onChange={(e) => updateField('hero.description', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm leading-relaxed"
                />
              </div>
              <div>
                <label className="font-semibold text-gray-700 block mb-1">Call to Action Link Text</label>
                <input
                  type="text"
                  value={content.hero.ctaText}
                  onChange={(e) => updateField('hero.ctaText', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                />
              </div>
            </>
          )}

          {activeEditSection === 'about' && (
            <>
              <div>
                <label className="font-semibold text-gray-700 block mb-1">Paragraph 1 (Main Opening Hook)</label>
                <textarea
                  rows={3}
                  value={content.about.p1}
                  onChange={(e) => updateField('about.p1', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none text-sm leading-relaxed"
                />
              </div>
              <div>
                <label className="font-semibold text-gray-700 block mb-1">Paragraph 2 (Background &amp; Caldas da Rainha)</label>
                <textarea
                  rows={4}
                  value={content.about.p2}
                  onChange={(e) => updateField('about.p2', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none text-sm leading-relaxed"
                />
              </div>
              <div>
                <label className="font-semibold text-gray-700 block mb-1">Paragraph 3 (Interests &amp; Writing)</label>
                <textarea
                  rows={3}
                  value={content.about.p3}
                  onChange={(e) => updateField('about.p3', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none text-sm leading-relaxed"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Card 1</label>
                  <input
                    type="text"
                    value={content.about.originsDesc}
                    onChange={(e) => updateField('about.originsDesc', e.target.value)}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Card 2</label>
                  <input
                    type="text"
                    value={content.about.educationDesc}
                    onChange={(e) => updateField('about.educationDesc', e.target.value)}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Card 3</label>
                  <input
                    type="text"
                    value={content.about.interestsDesc}
                    onChange={(e) => updateField('about.interestsDesc', e.target.value)}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs"
                  />
                </div>
              </div>
            </>
          )}

          {activeEditSection === 'work' && (
            <div className="space-y-6">
              <div className="text-gray-500 text-xs">
                You can edit featured projects or secondary work items below. Changes save instantly.
              </div>
              {content.work.projects.map((proj, pIdx) => (
                <div key={proj.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
                  <span className="font-bold text-gray-900 block text-xs uppercase tracking-wide">
                    Featured Project #{pIdx + 1}: {proj.title}
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-semibold text-gray-600 block mb-1">Title</label>
                      <input
                        type="text"
                        value={proj.title}
                        onChange={(e) => updateField(`work.projects.${pIdx}.title`, e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-gray-600 block mb-1">Meta / Subtitle</label>
                      <input
                        type="text"
                        value={proj.meta}
                        onChange={(e) => updateField(`work.projects.${pIdx}.meta`, e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-gray-600 block mb-1">Description Paragraphs</label>
                    {proj.desc.map((d, dIdx) => (
                      <textarea
                        key={dIdx}
                        rows={2}
                        value={d}
                        onChange={(e) => updateField(`work.projects.${pIdx}.desc.${dIdx}`, e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs mb-2 leading-relaxed"
                      />
                    ))}
                  </div>
                </div>
              ))}

              <div className="pt-4 border-t border-gray-200">
                <span className="font-bold text-gray-900 block text-xs uppercase tracking-wide mb-3">
                  Other Work Items ({content.work.otherItems.length})
                </span>
                <div className="space-y-3">
                  {content.work.otherItems.map((item, idx) => (
                    <div key={item.id} className="p-3 bg-gray-50 rounded border border-gray-200 space-y-2">
                      <div className="grid grid-cols-1 sm:grid-cols-[100px_1fr] gap-2">
                        <input
                          type="text"
                          placeholder="Dates"
                          value={item.when}
                          onChange={(e) => updateField(`work.otherItems.${idx}.when`, e.target.value)}
                          className="px-2 py-1 border border-gray-300 rounded text-xs"
                        />
                        <input
                          type="text"
                          placeholder="Title"
                          value={item.title}
                          onChange={(e) => updateField(`work.otherItems.${idx}.title`, e.target.value)}
                          className="px-2 py-1 border border-gray-300 rounded text-xs font-semibold"
                        />
                      </div>
                      <textarea
                        rows={2}
                        placeholder="Description"
                        value={item.desc || ''}
                        onChange={(e) => updateField(`work.otherItems.${idx}.desc`, e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeEditSection === 'writing' && (
            <div className="space-y-6">
              <div>
                <span className="font-bold text-gray-900 block text-xs uppercase tracking-wide mb-2">
                  Research Papers ({content.writing.researchItems.length})
                </span>
                <div className="space-y-3">
                  {content.writing.researchItems.map((item, idx) => (
                    <div key={item.id} className="p-3 bg-gray-50 rounded border border-gray-200 space-y-2">
                      <div className="grid grid-cols-1 sm:grid-cols-[100px_1fr] gap-2">
                        <input
                          type="text"
                          placeholder="Date"
                          value={item.when}
                          onChange={(e) => updateField(`writing.researchItems.${idx}.when`, e.target.value)}
                          className="px-2 py-1 border border-gray-300 rounded text-xs"
                        />
                        <input
                          type="text"
                          placeholder="Title"
                          value={item.title}
                          onChange={(e) => updateField(`writing.researchItems.${idx}.title`, e.target.value)}
                          className="px-2 py-1 border border-gray-300 rounded text-xs font-semibold"
                        />
                      </div>
                      <input
                        type="text"
                        placeholder="Journal / Where"
                        value={item.where || ''}
                        onChange={(e) => updateField(`writing.researchItems.${idx}.where`, e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                      />
                      <textarea
                        rows={2}
                        placeholder="Description"
                        value={item.desc || ''}
                        onChange={(e) => updateField(`writing.researchItems.${idx}.desc`, e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <span className="font-bold text-gray-900 block text-xs uppercase tracking-wide mb-2">
                  Essays &amp; Articles ({content.writing.essayItems.length})
                </span>
                <div className="space-y-3">
                  {content.writing.essayItems.map((item, idx) => (
                    <div key={item.id} className="p-3 bg-gray-50 rounded border border-gray-200 space-y-2">
                      <div className="grid grid-cols-1 sm:grid-cols-[100px_1fr] gap-2">
                        <input
                          type="text"
                          value={item.when}
                          onChange={(e) => updateField(`writing.essayItems.${idx}.when`, e.target.value)}
                          className="px-2 py-1 border border-gray-300 rounded text-xs"
                        />
                        <input
                          type="text"
                          value={item.title}
                          onChange={(e) => updateField(`writing.essayItems.${idx}.title`, e.target.value)}
                          className="px-2 py-1 border border-gray-300 rounded text-xs font-semibold"
                        />
                      </div>
                      <textarea
                        rows={2}
                        value={item.desc || ''}
                        onChange={(e) => updateField(`writing.essayItems.${idx}.desc`, e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <span className="font-bold text-gray-900 block text-xs uppercase tracking-wide mb-2">
                  Poetry &amp; Books ({content.writing.creativeItems.length})
                </span>
                <div className="space-y-3">
                  {content.writing.creativeItems.map((item, idx) => (
                    <div key={item.id} className="p-3 bg-gray-50 rounded border border-gray-200 space-y-2">
                      <div className="grid grid-cols-1 sm:grid-cols-[100px_1fr] gap-2">
                        <input
                          type="text"
                          value={item.when}
                          onChange={(e) => updateField(`writing.creativeItems.${idx}.when`, e.target.value)}
                          className="px-2 py-1 border border-gray-300 rounded text-xs"
                        />
                        <input
                          type="text"
                          value={item.title}
                          onChange={(e) => updateField(`writing.creativeItems.${idx}.title`, e.target.value)}
                          className="px-2 py-1 border border-gray-300 rounded text-xs font-semibold"
                        />
                      </div>
                      <textarea
                        rows={2}
                        value={item.desc || ''}
                        onChange={(e) => updateField(`writing.creativeItems.${idx}.desc`, e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeEditSection === 'experience' && (
            <div className="space-y-4">
              <span className="font-bold text-gray-900 block text-xs uppercase tracking-wide">
                Experience Roles ({content.experience.items.length})
              </span>
              {content.experience.items.map((item, idx) => (
                <div key={item.id} className="p-3 bg-gray-50 rounded border border-gray-200 space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-[100px_1fr] gap-2">
                    <input
                      type="text"
                      placeholder="Dates"
                      value={item.when}
                      onChange={(e) => updateField(`experience.items.${idx}.when`, e.target.value)}
                      className="px-2 py-1 border border-gray-300 rounded text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Title / Role"
                      value={item.title}
                      onChange={(e) => updateField(`experience.items.${idx}.title`, e.target.value)}
                      className="px-2 py-1 border border-gray-300 rounded text-xs font-semibold"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Organization / Location"
                    value={item.where || ''}
                    onChange={(e) => updateField(`experience.items.${idx}.where`, e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                  />
                  <textarea
                    rows={2}
                    placeholder="Description"
                    value={item.desc || ''}
                    onChange={(e) => updateField(`experience.items.${idx}.desc`, e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                  />
                </div>
              ))}
            </div>
          )}

          {activeEditSection === 'recognition' && (
            <div className="space-y-4">
              <span className="font-bold text-gray-900 block text-xs uppercase tracking-wide">
                Honors &amp; Awards ({content.recognition.items.length})
              </span>
              {content.recognition.items.map((item, idx) => (
                <div key={item.id} className="p-3 bg-gray-50 rounded border border-gray-200 space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-[100px_1fr] gap-2">
                    <input
                      type="text"
                      placeholder="Year"
                      value={item.when}
                      onChange={(e) => updateField(`recognition.items.${idx}.when`, e.target.value)}
                      className="px-2 py-1 border border-gray-300 rounded text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Award Title"
                      value={item.title}
                      onChange={(e) => updateField(`recognition.items.${idx}.title`, e.target.value)}
                      className="px-2 py-1 border border-gray-300 rounded text-xs font-semibold"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Conferred by / Context"
                    value={item.where || ''}
                    onChange={(e) => updateField(`recognition.items.${idx}.where`, e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                  />
                </div>
              ))}
            </div>
          )}

          {activeEditSection === 'education' && (
            <div className="space-y-6">
              <span className="font-bold text-gray-900 block text-xs uppercase tracking-wide">
                Education History ({content.education.items.length})
              </span>
              {content.education.items.map((item, idx) => (
                <div key={item.id} className="p-3 bg-gray-50 rounded border border-gray-200 space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-[100px_1fr] gap-2">
                    <input
                      type="text"
                      value={item.when}
                      onChange={(e) => updateField(`education.items.${idx}.when`, e.target.value)}
                      className="px-2 py-1 border border-gray-300 rounded text-xs"
                    />
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) => updateField(`education.items.${idx}.title`, e.target.value)}
                      className="px-2 py-1 border border-gray-300 rounded text-xs font-semibold"
                    />
                  </div>
                  <input
                    type="text"
                    value={item.where || ''}
                    onChange={(e) => updateField(`education.items.${idx}.where`, e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                  />
                </div>
              ))}

              <div className="pt-4 border-t border-gray-200">
                <span className="font-bold text-gray-900 block text-xs uppercase tracking-wide mb-3">
                  Skills &amp; Interests Categories
                </span>
                {content.education.skills.map((skill, idx) => (
                  <div key={idx} className="p-2.5 bg-gray-50 rounded border border-gray-200 space-y-1 mb-2">
                    <input
                      type="text"
                      value={skill.category}
                      onChange={(e) => updateField(`education.skills.${idx}.category`, e.target.value)}
                      className="font-bold px-2 py-1 border border-gray-300 rounded text-xs w-full"
                    />
                    <textarea
                      rows={2}
                      value={skill.items}
                      onChange={(e) => updateField(`education.skills.${idx}.items`, e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeEditSection === 'art' && (
            <div className="space-y-4">
              <div className="text-gray-600 text-xs leading-relaxed">
                You have 8 artworks in this section. You can edit any artwork&apos;s title, medium, dimensions, or description directly on the card when Edit Mode is active, or upload custom scans and photos using the &quot;Upload Image&quot; button on each piece.
              </div>
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-2">
                <span className="font-bold text-gray-900 block text-xs">How to customize your 8 Artworks:</span>
                <ul className="list-disc pl-4 space-y-1 text-gray-600 text-xs">
                  <li><strong>Upload photo:</strong> Click the &quot;Upload Image&quot; button on any artwork card to choose a photo from your computer (PNG/JPG up to 12MB) or paste an image web link.</li>
                  <li><strong>Edit text:</strong> Click directly on any artwork&apos;s title, medium, dimensions, or description to edit it inline. Changes auto-save immediately.</li>
                  <li><strong>Enlarge &amp; Lightbox:</strong> Click &quot;View Details&quot; or hover to inspect in high resolution.</li>
                </ul>
              </div>
            </div>
          )}

          {activeEditSection === 'contact' && (
            <>
              <div>
                <label className="font-semibold text-gray-700 block mb-1">Heading</label>
                <input
                  type="text"
                  value={content.contact.heading}
                  onChange={(e) => updateField('contact.heading', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="font-semibold text-gray-700 block mb-1">Subheading</label>
                <textarea
                  rows={3}
                  value={content.contact.subheading}
                  onChange={(e) => updateField('contact.subheading', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
            </>
          )}
        </div>

        <div className="px-6 py-3 border-t border-gray-100 bg-gray-50 flex justify-end">
          <button
            onClick={closeSectionEditor}
            className="px-4 py-1.5 text-xs font-semibold text-white rounded-lg shadow-sm"
            style={{ backgroundColor: accentColor }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
