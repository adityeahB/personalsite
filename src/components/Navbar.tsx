import React, { useState, useEffect } from 'react';
import { Search, FileText, Menu as MenuIcon, X } from 'lucide-react';

interface NavbarProps {
  onOpenSearch: () => void;
  onOpenCv: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenSearch,
  onOpenCv,
}) => {
  const [isSolid, setIsSolid] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('top');

  useEffect(() => {
    const handleScroll = () => {
      const hero = document.getElementById('top');
      const heroHeight = hero ? hero.offsetHeight : 600;
      const solidState = window.scrollY > heroHeight - 80 || menuOpen;
      setIsSolid(solidState);

      // Section spy
      const sections = ['contact', 'art', 'certificates', 'education', 'recognition', 'experience', 'writing', 'work', 'about', 'top'];
      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 140) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [menuOpen]);

  const navLinks = [
    { href: '#about', label: 'About', id: 'about' },
    { href: '#work', label: 'Work', id: 'work' },
    { href: '#writing', label: 'Writing', id: 'writing' },
    { href: '#experience', label: 'Experience', id: 'experience' },
    { href: '#recognition', label: 'Recognition', id: 'recognition' },
    { href: '#education', label: 'Education', id: 'education' },
    { href: '#certificates', label: 'Certificates', id: 'certificates' },
    { href: '#art', label: 'Art', id: 'art' },
    { href: '#contact', label: 'Contact', id: 'contact' },
  ];

  const handleLinkClick = () => {
    setMenuOpen(false);
  };

  return (
    <nav
      id="nav"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isSolid
          ? 'bg-white/95 backdrop-blur-md text-[#141414] border-b border-[#e8e8e8] shadow-xs'
          : 'bg-transparent text-white'
      }`}
    >
      <div className="max-w-[1080px] mx-auto px-4 sm:px-8 h-[72px] flex items-center justify-between relative">
        {/* Brand */}
        <a
          href="#top"
          className="font-bold text-lg sm:text-xl tracking-tight hover:opacity-90 transition cursor-pointer select-none"
        >
          Aditya Neil Banerjee
        </a>

        {/* Desktop Links & Utilities */}
        <div className="hidden md:flex items-center gap-6">
          <ul className="flex items-center gap-6 text-[0.95rem]">
            {navLinks.map((link) => {
              const isActive = activeSection === link.id;
              return (
                <li key={link.href}>
                  <a
                    href={link.href}
                    onClick={handleLinkClick}
                    className={`transition-opacity hover:opacity-100 hover:underline underline-offset-6 ${
                      isActive ? 'opacity-100 font-semibold underline' : 'opacity-85'
                    }`}
                  >
                    {link.label}
                  </a>
                </li>
              );
            })}
          </ul>

          <div className="flex items-center gap-2 pl-2 border-l border-current/20">
            {/* Search trigger */}
            <button
              onClick={onOpenSearch}
              className="p-1.5 rounded-md hover:bg-current/10 transition opacity-85 hover:opacity-100"
              title="Search (Ctrl+K)"
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* CV Modal trigger */}
            <button
              onClick={onOpenCv}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-semibold hover:bg-current/10 transition opacity-90 hover:opacity-100 border border-current/25"
              title="View Curriculum Vitae"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>CV</span>
            </button>
          </div>
        </div>

        {/* Mobile Actions & Toggle */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={onOpenSearch}
            className="p-2 rounded-md hover:bg-current/10 transition"
            aria-label="Search"
          >
            <Search className="w-4 h-4" />
          </button>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 text-sm font-semibold tracking-wide flex items-center gap-1 focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
            <span className="text-xs uppercase">{menuOpen ? 'Close' : 'Menu'}</span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {menuOpen && (
        <div className="md:hidden bg-white text-[#141414] border-b border-[#e8e8e8] shadow-lg animate-fade-in">
          <ul className="flex flex-col">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={handleLinkClick}
                  className="block px-6 py-3.5 border-t border-[#e8e8e8] text-base font-medium hover:bg-gray-50 transition"
                >
                  {link.label}
                </a>
              </li>
            ))}
            <li className="px-6 py-3.5 border-t border-[#e8e8e8] bg-gray-50 flex items-center justify-between">
              <span className="text-sm text-gray-600">Curriculum Vitae</span>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onOpenCv();
                }}
                className="px-3 py-1.5 text-xs font-semibold rounded bg-gray-900 text-white"
              >
                View CV
              </button>
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
};
