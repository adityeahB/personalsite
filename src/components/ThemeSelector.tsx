import React, { useState } from 'react';
import { Palette, Check, Sparkles, X } from 'lucide-react';
import { THEME_OPTIONS } from '../data';
import { ThemeOption } from '../types';

interface ThemeSelectorProps {
  currentTheme: ThemeOption;
  onSelectTheme: (theme: ThemeOption) => void;
  onCustomColor: (color: string) => void;
  accentColor: string;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  currentTheme,
  onSelectTheme,
  onCustomColor,
  accentColor,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [customHex, setCustomHex] = useState(accentColor);

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (/^#[0-9A-F]{6}$/i.test(customHex)) {
      onCustomColor(customHex);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition border border-current/20 hover:border-current/50 opacity-90 hover:opacity-100"
        title="Change accent color"
      >
        <span
          className="w-3 h-3 rounded-full border border-white/60 shadow-xs"
          style={{ backgroundColor: accentColor }}
        />
        <span className="hidden sm:inline">Color</span>
        <Palette className="w-3.5 h-3.5 opacity-80" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-64 p-3 bg-white text-gray-900 rounded-xl shadow-xl border border-gray-200 z-50 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100 mb-2">
              <span className="font-semibold text-gray-800 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" style={{ color: accentColor }} />
                Palette & Accent
              </span>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="text-[11px] text-gray-500 mb-2.5">
              Change the hero & accent color (per stylesheet <code>--bold</code>):
            </p>

            <div className="grid grid-cols-1 gap-1 mb-3">
              {THEME_OPTIONS.map((theme) => {
                const isSelected = accentColor.toLowerCase() === theme.color.toLowerCase();
                return (
                  <button
                    key={theme.id}
                    onClick={() => {
                      onSelectTheme(theme);
                      setIsOpen(false);
                    }}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition ${
                      isSelected ? 'bg-gray-100 font-semibold' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0"
                        style={{ backgroundColor: theme.color }}
                      />
                      <span>{theme.name}</span>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-gray-700" />}
                  </button>
                );
              })}
            </div>

            <form onSubmit={handleCustomSubmit} className="pt-2 border-t border-gray-100 flex items-center gap-1.5">
              <input
                type="color"
                value={customHex}
                onChange={(e) => setCustomHex(e.target.value)}
                className="w-6 h-6 rounded cursor-pointer border-0 p-0"
                title="Choose custom hex color"
              />
              <input
                type="text"
                value={customHex}
                onChange={(e) => setCustomHex(e.target.value)}
                placeholder="#2f3fe0"
                className="flex-1 font-mono text-[11px] px-2 py-1 border border-gray-200 rounded focus:outline-none"
              />
              <button
                type="submit"
                className="px-2 py-1 bg-gray-900 text-white rounded text-[11px] font-medium hover:bg-black transition"
              >
                Apply
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
};
