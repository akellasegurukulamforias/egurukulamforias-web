import React, { useState, useEffect, useMemo } from 'react';
import { Menu, X, ArrowUpRight, Sparkles, Phone, Globe } from 'lucide-react';
import { useCMSData } from '../hooks/useCMSData';

// Helper to strip leading emojis from CMS strings so icons never duplicate
const stripLeadingEmoji = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str.replace(/^[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2702}-\u{27B0}\u{24C2}-\u{1F251}]\s*/u, '').trim();
};

export default function Header({ currentPath, navigate, onOpenPopup }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { data } = useCMSData();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Build Dynamic Horizontal Loop of New Additions & CMS Announcements
  const updateItems = useMemo(() => {
    const items = [];

    // 1. Live Ticker Announcements from CMS
    if (data?.liveTicker && Array.isArray(data.liveTicker)) {
      data.liveTicker.forEach((t, i) => {
        const headline = t.Headline || t.headline || t.Title || t.title;
        if (headline) {
          items.push({
            id: `ticker-${i}-${headline}`,
            type: 'ANNOUNCEMENT',
            icon: '🎯',
            text: stripLeadingEmoji(headline),
            onClick: () => onOpenPopup && onOpenPopup()
          });
        }
      });
    }

    // 2. Latest Current Affairs Dispatches from CMS
    if (data?.currentAffairs && Array.isArray(data.currentAffairs)) {
      data.currentAffairs.slice(0, 4).forEach((ca, i) => {
        const title = ca.Title || ca.title || ca.Headline || ca.headline;
        if (title) {
          const cleanTitle = stripLeadingEmoji(title);
          items.push({
            id: `ca-${i}-${cleanTitle}`,
            type: 'CURRENT_AFFAIRS',
            icon: '📰',
            text: `New Current Affairs: ${cleanTitle}`,
            onClick: () => navigate('/blog')
          });
        }
      });
    }

    // 3. Latest Test Series Programs from CMS
    if (data?.testSeries && Array.isArray(data.testSeries)) {
      data.testSeries.slice(0, 3).forEach((ts, i) => {
        const title = ts.Title || ts.title || ts.Name || ts.name;
        if (title) {
          const cleanTitle = stripLeadingEmoji(title);
          items.push({
            id: `ts-${i}-${cleanTitle}`,
            type: 'TEST_SERIES',
            icon: '📝',
            text: `New Test Series: ${cleanTitle}`,
            onClick: () => navigate('/test-series')
          });
        }
      });
    }

    // 4. Latest Study Resources & PDF Downloads from CMS
    if (data?.digitalResources && Array.isArray(data.digitalResources)) {
      data.digitalResources.slice(0, 3).forEach((res, i) => {
        const title = res.Title || res.title || res.Name || res.name;
        if (title) {
          const cleanTitle = stripLeadingEmoji(title);
          items.push({
            id: `res-${i}-${cleanTitle}`,
            type: 'RESOURCE',
            icon: '📚',
            text: `New Study Resource: ${cleanTitle}`,
            onClick: () => navigate('/resources')
          });
        }
      });
    }

    // Fallback if CMS data is empty
    if (items.length === 0) {
      items.push({
        id: 'fallback-1',
        type: 'ANNOUNCEMENT',
        icon: '🎯',
        text: 'Ekadasa Sadhana Deeksha: 110 Days Complete UPSC Coverage',
        onClick: () => onOpenPopup && onOpenPopup()
      });
      items.push({
        id: 'fallback-2',
        type: 'CURRENT_AFFAIRS',
        icon: '📰',
        text: 'New Current Affairs Dispatches Updated Daily',
        onClick: () => navigate('/blog')
      });
      items.push({
        id: 'fallback-3',
        type: 'RESOURCE',
        icon: '📚',
        text: 'Downloads Vault: Access Syllabus Micro-Notes & PDF Resources',
        onClick: () => navigate('/resources')
      });
    }

    return items;
  }, [data, navigate, onOpenPopup]);

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/about', label: 'About e-Gurukulam' },
    { path: '/programs', label: 'Programs' },
    { path: '/test-series', label: 'Test Series' },
    { path: '/blog', label: 'Current Affairs' },
    { path: '/resources', label: 'Resources' },
    { path: '/contact', label: 'Begin Your Journey With Us', isBadge: true },
  ];

  const handleNavClick = (path) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <div className="sticky top-0 z-50">
      {/* EXECUTIVE TOP UTILITY RIBBON */}
      <div className="w-full bg-[#140E0C] text-[#FAF5EE] border-b border-[#D4AF37]/25 py-2 px-4 md:px-6 select-none overflow-x-auto scrollbar-none">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 text-xs font-sans font-medium min-w-max md:min-w-0">
          
          {/* Left Side: Institutional Direct Lines */}
          <div className="flex items-center gap-2 text-[#FAF5EE]/90">
            <Phone className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
            <span className="text-[11px] uppercase tracking-wider text-[#D4AF37] font-semibold hidden sm:inline">
              Reach Us:
            </span>
            <div className="flex items-center gap-2 tracking-wide text-xs md:text-sm">
              <a href="tel:+918897826108" className="hover:text-[#D4AF37] transition-colors">
                +91 88978 26108
              </a>
              <span className="opacity-40">•</span>
              <a href="tel:+919912211109" className="hover:text-[#D4AF37] transition-colors">
                +91 99122 11109
              </a>
              <span className="opacity-40">•</span>
              <a href="tel:+918985894254" className="hover:text-[#D4AF37] transition-colors">
                +91 89858 94254
              </a>
            </div>
          </div>

          {/* Center Vertical Divider (Desktop) */}
          <div className="hidden lg:block h-3.5 w-px bg-[#D4AF37]/30 mx-2 shrink-0" />

          {/* Right Side: Sister Ecosystem Portals */}
          <div className="flex items-center gap-3 shrink-0 text-xs">
            <div className="flex items-center gap-1.5 text-[#D4AF37] font-semibold text-[11px] uppercase tracking-wider">
              <Globe className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
              <span className="hidden sm:inline">Our Ecosystem:</span>
            </div>
            
            <div className="flex items-center gap-2.5">
              <a 
                href="https://www.sankalpasiddi.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-[#D4AF37] transition-colors inline-flex items-center gap-0.5 group"
              >
                <span>Sankalpa Siddi</span>
                <ArrowUpRight className="w-3 h-3 text-[#D4AF37] opacity-60 group-hover:opacity-100 transition-opacity" />
              </a>

              <span className="opacity-40">•</span>

              <a 
                href="https://iasmentoring.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-[#D4AF37] transition-colors inline-flex items-center gap-0.5 group"
              >
                <span>IAS Mentoring</span>
                <ArrowUpRight className="w-3 h-3 text-[#D4AF37] opacity-60 group-hover:opacity-100 transition-opacity" />
              </a>

              <span className="opacity-40">•</span>

              <a 
                href="https://akellaraghavendra.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-[#D4AF37] transition-colors inline-flex items-center gap-0.5 group"
              >
                <span>Akella Raghavendra Foundation</span>
                <ArrowUpRight className="w-3 h-3 text-[#D4AF37] opacity-60 group-hover:opacity-100 transition-opacity" />
              </a>
            </div>
          </div>

        </div>
      </div>

      {/* ANNOUNCEMENT & NEW ADDITIONS TICKER BAR (DYNAMIC HORIZONTAL CONTINUOUS LOOP) */}
      <div className="w-full bg-[#8C3A27] text-[#FAF6EE] text-xs font-serif font-bold py-1.5 px-4 overflow-hidden relative border-b border-[#C5A059]/40 flex items-center gap-3 select-none">
        
        {/* Clickable UPDATES Badge Button */}
        <button 
          type="button"
          onClick={() => onOpenPopup && onOpenPopup()}
          className="flex items-center gap-1.5 shrink-0 bg-[#732D1B] hover:bg-[#5C2415] px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-widest text-[#FFD700] border border-[#C5A059]/40 shadow-xs transition-all cursor-pointer group z-10"
          title="Click to view active announcement poster modal"
        >
          <Sparkles className="w-3 h-3 text-[#FFD700] group-hover:scale-110 transition-transform" />
          <span>UPDATES</span>
        </button>

        {/* Continuous Horizontal Looping Ticker Track */}
        <div className="overflow-hidden whitespace-nowrap w-full flex-1">
          <div className="inline-flex gap-8 animate-marquee">
            {/* Render 2 identical sets of items to guarantee seamless 100% infinite looping marquee */}
            {[...updateItems, ...updateItems].map((item, idx) => (
              <button
                key={`${item.id}-${idx}`}
                type="button"
                onClick={item.onClick}
                className="inline-flex items-center gap-2 hover:text-[#FFD700] transition-colors cursor-pointer text-left bg-transparent border-0 p-0 text-xs font-serif font-bold group"
              >
                <span>{item.icon}</span>
                <span className="group-hover:underline underline-offset-2">{item.text}</span>
                <ArrowUpRight className="w-3 h-3 text-[#C5A059] group-hover:text-[#FFD700] transition-colors shrink-0" />
                <span className="opacity-40 text-amber-200/60 ml-4">•</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* MAIN NAVIGATION BAR */}
      <header className={`transition-all duration-300 ${
        scrolled 
          ? 'py-1.5 bg-[#F9F5EB]/95 backdrop-blur-md border-b border-[#D5C3B0] shadow-sm' 
          : 'py-2.5 bg-[#F9F5EB]/85 backdrop-blur-xs border-b border-[#D5C3B0]/30'
      }`}>
      <div className="navbar-container">
        
        {/* Logo 68px Height with Multiply Blending & Drop Shadow (NO BOX, NO TEXT) */}
        <div 
          className="flex items-center cursor-pointer shrink-0 group"
          onClick={() => handleNavClick('/')}
        >
          <img 
            src="/images/Logo.png" 
            alt="e-Gurukulam Logo"
            className="navbar-logo-img"
            onError={(e) => {
              e.target.onerror = null;
              e.target.style.display = 'none';
            }}
          />
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex nav-links-wrapper items-center">
          {navItems.map((item) => {
            const isActive = currentPath === item.path || (item.path !== '/' && currentPath.startsWith(item.path));
            if (item.isBadge) {
              return (
                <button
                  key={item.path}
                  onClick={() => handleNavClick(item.path)}
                  className="btn-terracotta-pill text-xs py-2 px-4 shrink-0 whitespace-nowrap ml-2 shadow-xs"
                >
                  <span className="btn-label" style={{ whiteSpace: 'nowrap' }}>{item.label}</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              );
            }
            return (
              <button
                key={item.path}
                onClick={() => handleNavClick(item.path)}
                className={`nav-link manuscript-link transition-colors py-1 shrink-0 ${
                  isActive
                    ? 'text-[#8C3A27] border-b-2 border-[#8C3A27]'
                    : 'text-[#1A0F0B] hover:text-[#8C3A27]'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Mobile Menu Toggle Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 text-[#140C08] hover:text-[#8C3A27] transition-colors"
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#F9F5EB] border-b border-[#D5C3B0] px-4 pt-3 pb-6 space-y-3 animate-fade-in">
          {navItems.map((item) => {
            const isActive = currentPath === item.path;
            if (item.isBadge) {
              return (
                <div key={item.path} className="pt-2">
                  <button
                    onClick={() => handleNavClick(item.path)}
                    className="btn-terracotta-pill text-xs py-2.5 px-6 w-full justify-center"
                  >
                    <span className="btn-label">{item.label}</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            }
            return (
              <button
                key={item.path}
                onClick={() => handleNavClick(item.path)}
                className={`block w-full text-left font-serif text-sm font-bold uppercase tracking-wider py-2 border-b border-[#D5C3B0]/40 ${
                  isActive ? 'text-[#8C3A27]' : 'text-[#140C08]'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      )}

    </header>
    </div>
  );
}