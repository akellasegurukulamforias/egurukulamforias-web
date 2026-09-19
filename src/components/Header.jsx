import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Menu, X, ArrowUpRight, Sparkles, Phone, Globe, Search, BookOpen, FileText } from 'lucide-react';
import { useCMSData } from '../hooks/useCMSData';
import { sortCurrentAffairsByDate, formatDisplayDate } from '../utils/dateUtils';
import { 
  getCachedCMSData, 
  isPYQResource, 
  isSyllabusResource, 
  extractPYQYear, 
  extractPYQStage, 
  extractPYQPaperLabel, 
  getPYQPaperUrl 
} from '../services/cmsService';
import { createSlug } from '../pages/CurrentAffairsReader';

// Helper to strip leading emojis from CMS strings so icons never duplicate
const stripLeadingEmoji = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str.replace(/^[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2702}-\u{27B0}\u{24C2}-\u{1F251}]\s*/u, '').trim();
};

export default function Header({ currentPath, navigate, onOpenPopup }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileSearchFocused, setMobileSearchFocused] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const headerRef = useRef(null);
  const searchContainerRef = useRef(null);
  const searchInputRef = useRef(null);
  const { data } = useCMSData();

  // Close search suggestions on outside click or ESC key
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setSearchOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setSearchOpen(false);
        if (searchInputRef.current) searchInputRef.current.blur();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [mobileMenuOpen]);

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

  // Dynamically measure and sync rendered header height to CSS variable --site-header-height
  useEffect(() => {
    const updateHeaderHeight = () => {
      if (headerRef.current) {
        const rect = headerRef.current.getBoundingClientRect();
        const height = Math.round(rect.height) || headerRef.current.offsetHeight;
        if (height > 0) {
          document.documentElement.style.setProperty('--site-header-height', `${height}px`);
        }
      }
    };

    updateHeaderHeight();

    // Use requestAnimationFrame to ensure accurate measurement after layout paint
    const rafId = requestAnimationFrame(updateHeaderHeight);

    // Live ResizeObserver continuously measures the rendered header across viewports, transitions & image loads
    let resizeObserver = null;
    if (typeof ResizeObserver !== 'undefined' && headerRef.current) {
      resizeObserver = new ResizeObserver(() => {
        updateHeaderHeight();
      });
      resizeObserver.observe(headerRef.current);
    }

    window.addEventListener('resize', updateHeaderHeight);
    window.addEventListener('scroll', updateHeaderHeight, { passive: true });

    return () => {
      cancelAnimationFrame(rafId);
      if (resizeObserver) resizeObserver.disconnect();
      window.removeEventListener('resize', updateHeaderHeight);
      window.removeEventListener('scroll', updateHeaderHeight);
    };
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
            onClick: () => onOpenPopup && onOpenPopup(i, t)
          });
        }
      });
    }

    // 2. Latest Current Affairs Dispatches from CMS (Sorted latest first)
    if (data?.currentAffairs && Array.isArray(data.currentAffairs)) {
      const sortedCA = sortCurrentAffairsByDate(data.currentAffairs);
      sortedCA.slice(0, 4).forEach((ca, i) => {
        const title = ca.Title || ca.title || ca.Headline || ca.headline;
        if (title) {
          const cleanTitle = stripLeadingEmoji(title);
          items.push({
            id: `ca-${i}-${cleanTitle}`,
            type: 'CURRENT_AFFAIRS',
            icon: '📰',
            text: `New Current Affairs: ${cleanTitle}`,
            onClick: () => navigate('/current-affairs')
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
        onClick: () => navigate('/current-affairs')
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
    { path: '/current-affairs', label: 'Current Affairs' },
    { path: '/resources', label: 'Resources' },
    { path: '/contact', label: 'Begin Your Journey With Us', isBadge: true },
  ];

  const handleNavClick = (path) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  // Default Built-in Suggestions shown ON FOCUS when input is empty (Zero Typing)
  const defaultSuggestions = useMemo(() => {
    const memData = getCachedCMSData();
    const caList = (memData?.currentAffairs && Array.isArray(memData.currentAffairs) && memData.currentAffairs.length > 0)
      ? memData.currentAffairs
      : (data?.currentAffairs || data?.articles || []);

    // 1. Trending Current Affairs: 3–4 latest/trending dispatches directly from cache
    let trendingCA = [];
    if (caList.length > 0) {
      const sortedCA = sortCurrentAffairsByDate(caList.filter(item => item && typeof item === 'object'));
      trendingCA = sortedCA.slice(0, 4).map(art => {
        const title = String(art.Title || art.title || '');
        const cat = String(art.Category || art.category || '');
        const tags = String(art.Tags || art.tags || '');
        const content = String(art.Full_Content || art.full_content || art.Article_HTML || art.content || '');
        const gsMatch = (content + ' ' + tags + ' ' + cat).match(/GS\s*(?:Paper\s*)?(?:I|II|III|IV|[1-4])\b/i);
        const artSlug = art.slug || art.Slug || createSlug(title);
        return {
          title,
          date: formatDisplayDate(art.Date || art.date) || '',
          slug: artSlug,
          gsTag: gsMatch ? gsMatch[0].toUpperCase() : null
        };
      });
    }

    // High-yield fallback topics if cache is initially empty
    if (trendingCA.length === 0) {
      trendingCA = [
        {
          title: 'BRICS Expansion & Emerging Geopolitical Order',
          date: 'Latest Analysis',
          slug: 'brics-expansion-emerging-geopolitical-order',
          gsTag: 'GS PAPER II'
        },
        {
          title: 'Important Emergency Helpline Numbers in India',
          date: 'Latest Analysis',
          slug: 'important-emergency-helpline-numbers-in-india',
          gsTag: 'GS PAPER II'
        },
        {
          title: 'Voice of Global South & India’s Diplomatic Leadership',
          date: 'Latest Analysis',
          slug: 'voice-of-global-south-indias-diplomatic-leadership',
          gsTag: 'GS PAPER II'
        }
      ];
    }

    // 2. Syllabus Areas: Quick-filter pills for GS Paper I, GS Paper II, GS Paper III, GS Paper IV
    const syllabusAreas = [
      { id: 'gs1', label: 'GS Paper I', query: 'GS Paper I', sub: 'History & Society' },
      { id: 'gs2', label: 'GS Paper II', query: 'GS Paper II', sub: 'Polity & Governance' },
      { id: 'gs3', label: 'GS Paper III', query: 'GS Paper III', sub: 'Economy & Security' },
      { id: 'gs4', label: 'GS Paper IV', query: 'GS Paper IV', sub: 'Ethics & Integrity' }
    ];

    // 3. High-Frequency PYQ Topics: Direct shortcuts
    const pyqShortcuts = [
      { id: 'ethics', label: 'Ethics Case Studies', query: 'Ethics', stage: 'Mains GS 4' },
      { id: 'internal-sec', label: 'Internal Security Mains', query: 'Security', stage: 'Mains GS 3' },
      { id: 'modern-hist', label: 'Modern History Prelims', query: 'History', stage: 'Prelims GS 1' }
    ];

    return {
      trendingCA,
      syllabusAreas,
      pyqShortcuts
    };
  }, [data]);

  // Real-Time Query Fan-Out Suggestions from in-memory cache
  const searchSuggestions = useMemo(() => {
    const rawQ = searchQuery.trim();
    if (!rawQ) return { currentAffairs: [], pyqs: [], syllabus: [] };
    const q = rawQ.toLowerCase();

    const memData = getCachedCMSData();
    const caList = (memData?.currentAffairs && Array.isArray(memData.currentAffairs) && memData.currentAffairs.length > 0)
      ? memData.currentAffairs
      : (data?.currentAffairs || data?.articles || []);
    const resList = (memData?.resources && Array.isArray(memData.resources) && memData.resources.length > 0)
      ? memData.resources
      : (data?.resources || []);

    // Flexible regex for GS Paper matching (e.g. "GS Paper I", "GS 1", "GS Paper 1")
    const isGS1 = /\b(gs\s*1|gs\s*i|gs\s*paper\s*1|gs\s*paper\s*i)\b/i.test(q);
    const isGS2 = /\b(gs\s*2|gs\s*ii|gs\s*paper\s*2|gs\s*paper\s*ii)\b/i.test(q);
    const isGS3 = /\b(gs\s*3|gs\s*iii|gs\s*paper\s*3|gs\s*paper\s*iii)\b/i.test(q);
    const isGS4 = /\b(gs\s*4|gs\s*iv|gs\s*paper\s*4|gs\s*paper\s*iv)\b/i.test(q);

    const matchesGSTerm = (text) => {
      if (!text) return false;
      const lower = text.toLowerCase();
      if (isGS1 && (lower.includes('gs 1') || lower.includes('gs i') || lower.includes('gs-1') || lower.includes('general studies 1') || lower.includes('general studies - 1') || lower.includes('general studies i') || lower.includes('paper 1') || lower.includes('paper i'))) return true;
      if (isGS2 && (lower.includes('gs 2') || lower.includes('gs ii') || lower.includes('gs-2') || lower.includes('general studies 2') || lower.includes('general studies - 2') || lower.includes('general studies ii') || lower.includes('paper 2') || lower.includes('paper ii'))) return true;
      if (isGS3 && (lower.includes('gs 3') || lower.includes('gs iii') || lower.includes('gs-3') || lower.includes('general studies 3') || lower.includes('general studies - 3') || lower.includes('general studies iii') || lower.includes('paper 3') || lower.includes('paper iii'))) return true;
      if (isGS4 && (lower.includes('gs 4') || lower.includes('gs iv') || lower.includes('gs-4') || lower.includes('general studies 4') || lower.includes('general studies - 4') || lower.includes('general studies iv') || lower.includes('paper 4') || lower.includes('paper iv') || lower.includes('ethics'))) return true;
      return false;
    };

    // 1. Current Affairs matching
    const matchingCA = [];
    for (const art of caList) {
      if (!art || typeof art !== 'object') continue;
      const title = String(art.Title || art.title || '');
      const cat = String(art.Category || art.category || '');
      const tags = String(art.Tags || art.tags || '');
      const content = String(art.Full_Content || art.full_content || art.Article_HTML || art.content || '');

      if (
        title.toLowerCase().includes(q) ||
        cat.toLowerCase().includes(q) ||
        tags.toLowerCase().includes(q) ||
        (q.length >= 3 && content.toLowerCase().includes(q)) ||
        matchesGSTerm(title + ' ' + cat + ' ' + tags + ' ' + content)
      ) {
        const gsMatch = (content + ' ' + tags + ' ' + cat).match(/GS\s*(?:Paper\s*)?(?:I|II|III|IV|[1-4])\b/i);
        const artSlug = art.slug || art.Slug || createSlug(title);
        matchingCA.push({
          title,
          date: formatDisplayDate(art.Date || art.date) || '',
          slug: artSlug,
          gsTag: gsMatch ? gsMatch[0].toUpperCase() : null
        });
        if (matchingCA.length >= 4) break;
      }
    }

    // 2. PYQ matching
    const pyqList = resList.filter(isPYQResource);
    const matchingPYQ = [];
    for (const pyq of pyqList) {
      if (!pyq || typeof pyq !== 'object') continue;
      const title = String(pyq.Title || pyq.title || '');
      const year = extractPYQYear(pyq);
      const stage = extractPYQStage(pyq);
      const paperLabel = extractPYQPaperLabel(pyq);
      const content = String(pyq.Full_Content || pyq.full_content || pyq.Content || '');

      if (
        title.toLowerCase().includes(q) ||
        paperLabel.toLowerCase().includes(q) ||
        year.toLowerCase().includes(q) ||
        stage.toLowerCase().includes(q) ||
        (q.length >= 3 && content.toLowerCase().includes(q)) ||
        matchesGSTerm(title + ' ' + paperLabel + ' ' + content)
      ) {
        matchingPYQ.push({
          title,
          year,
          stage,
          paperLabel,
          url: getPYQPaperUrl(pyq)
        });
        if (matchingPYQ.length >= 4) break;
      }
    }

    // 3. Syllabus matching
    const sylList = resList.filter(isSyllabusResource);
    const matchingSyl = [];
    for (const syl of sylList) {
      if (!syl || typeof syl !== 'object') continue;
      const title = String(syl.Title || syl.title || '');
      const cat = String(syl.Category || syl.category || '');
      if (
        title.toLowerCase().includes(q) || 
        cat.toLowerCase().includes(q) ||
        matchesGSTerm(title + ' ' + cat)
      ) {
        const sylSlug = syl.slug || syl.Slug || syl.id || syl.ID || createSlug(title);
        matchingSyl.push({
          title,
          slug: sylSlug
        });
        if (matchingSyl.length >= 2) break;
      }
    }

    return { currentAffairs: matchingCA, pyqs: matchingPYQ, syllabus: matchingSyl };
  }, [searchQuery, data]);

  const hasAnySuggestions = 
    searchSuggestions.currentAffairs.length > 0 || 
    searchSuggestions.pyqs.length > 0 || 
    searchSuggestions.syllabus.length > 0;

  return (
    <div ref={headerRef} id="site-main-header" className="sticky top-0 z-50">
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
          onClick={() => onOpenPopup && onOpenPopup(0)}
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
            onLoad={() => {
              if (headerRef.current) {
                const rect = headerRef.current.getBoundingClientRect();
                const height = Math.round(rect.height) || headerRef.current.offsetHeight;
                if (height > 0) {
                  document.documentElement.style.setProperty('--site-header-height', `${height}px`);
                }
              }
            }}
            onError={(e) => {
              e.target.onerror = null;
              e.target.style.display = 'none';
            }}
          />
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex nav-links-wrapper items-center">
          {navItems.map((item) => {
            if (item.isBadge) return null;
            const isActive = currentPath === item.path || (item.path !== '/' && currentPath.startsWith(item.path));
            return (
              <a
                key={item.path}
                href={item.path}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(item.path);
                }}
                className={`nav-link manuscript-link transition-colors py-1 shrink-0 ${
                  isActive
                    ? 'text-[#8C3A27] border-b-2 border-[#8C3A27]'
                    : 'text-[#1A0F0B] hover:text-[#8C3A27]'
                }`}
              >
                {item.label}
              </a>
            );
          })}

          {/* MINIMALIST NAV BAR SEARCH WITH REAL-TIME QUERY FAN-OUT SUGGESTIONS */}
          <div className="relative shrink-0 ml-1" ref={searchContainerRef}>
            <div className="flex items-center bg-[#FAF6EE] border border-[#D5C3B0] rounded-full px-2.5 py-1 text-xs text-[#1A0F0B] focus-within:border-[#8C3A27] focus-within:ring-1 focus-within:ring-[#8C3A27]/20 transition-all shadow-2xs w-36 xl:w-44">
              <Search className="w-3.5 h-3.5 text-[#8C3A27] shrink-0 mr-1.5" />
              <input
                ref={searchInputRef}
                type="text"
                role="combobox"
                aria-label="Search UPSC Current Affairs and PYQs"
                aria-expanded={searchOpen}
                aria-haspopup="listbox"
                aria-controls="header-search-results"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSearchOpen(true);
                }}
                onFocus={() => setSearchOpen(true)}
                placeholder="Search GS, PYQs..."
                className="w-full bg-transparent border-0 p-0 text-xs focus:outline-none placeholder:text-[#7A6B5D]/70 font-sans"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    if (searchInputRef.current) searchInputRef.current.focus();
                  }}
                  className="text-[#7A6B5D] hover:text-[#8C3A27] ml-1 shrink-0 cursor-pointer"
                  aria-label="Clear search"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* REAL-TIME AUTOCOMPLETE RECOMMENDATIONS DROPDOWN */}
            {searchOpen && (
              <div 
                id="header-search-results"
                role="listbox"
                className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-[#FFFDF8] border border-[#D5C3B0] rounded-2xl shadow-2xl p-3.5 z-50 animate-fade-in text-left"
                style={{ filter: 'drop-shadow(0 12px 28px rgba(20, 14, 12, 0.18))' }}
              >
                {!searchQuery.trim() ? (
                  /* 1. ON-FOCUS DEFAULT SUGGESTIONS (Zero Typing) */
                  <div className="space-y-3.5 divide-y divide-[#D5C3B0]/30">
                    {/* SYLLABUS AREAS QUICK-FILTER PILLS */}
                    <div className="space-y-2">
                      <div className="px-1 flex items-center justify-between text-[10px] font-mono font-bold tracking-wider uppercase text-[#8C3A27]">
                        <span className="flex items-center gap-1.5">
                          <Sparkles className="w-3 h-3 text-[#D4AF37]" />
                          <span>Syllabus Areas</span>
                        </span>
                        <span className="text-[#7A6B5D] font-normal text-[9px]">Quick Filters</span>
                      </div>
                      <div className="grid grid-cols-2 gap-1.5">
                        {defaultSuggestions.syllabusAreas.map((area) => (
                          <button
                            key={area.id}
                            type="button"
                            onClick={() => {
                              setSearchQuery(area.query);
                              if (searchInputRef.current) searchInputRef.current.focus();
                            }}
                            className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-[#FAF6EE] hover:bg-[#8C3A27] text-[#221814] hover:text-white border border-[#D5C3B0]/60 hover:border-[#8C3A27] transition-all group text-left cursor-pointer shadow-2xs"
                          >
                            <div>
                              <span className="text-xs font-serif font-bold block group-hover:text-white transition-colors">
                                {area.label}
                              </span>
                              <span className="text-[10px] font-sans text-[#7A6B5D] group-hover:text-white/80 transition-colors block">
                                {area.sub}
                              </span>
                            </div>
                            <ArrowUpRight className="w-3 h-3 text-[#8C3A27] group-hover:text-white opacity-60 group-hover:opacity-100 transition-all shrink-0" />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* TRENDING CURRENT AFFAIRS */}
                    {defaultSuggestions.trendingCA.length > 0 && (
                      <div className="pt-3 space-y-1">
                        <div className="px-1 pb-1 flex items-center justify-between text-[10px] font-mono font-bold tracking-wider uppercase text-[#8C3A27]">
                          <span className="flex items-center gap-1.5">
                            <BookOpen className="w-3 h-3 text-[#8C3A27]" />
                            <span>Trending Current Affairs</span>
                          </span>
                          <span className="text-[#7A6B5D] font-normal text-[9px]">Latest Dispatches</span>
                        </div>
                        {defaultSuggestions.trendingCA.map((ca, idx) => (
                          <a
                            key={ca.slug || idx}
                            href={`/current-affairs/${encodeURIComponent(ca.slug)}`}
                            onClick={(e) => {
                              e.preventDefault();
                              setSearchOpen(false);
                              setSearchQuery('');
                              navigate(`/current-affairs/${encodeURIComponent(ca.slug)}`);
                            }}
                            className="block px-2.5 py-1.5 rounded-lg hover:bg-[#FAF6EE] transition-colors group cursor-pointer"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <span className="text-xs font-serif font-bold text-[#221814] group-hover:text-[#8C3A27] transition-colors leading-snug line-clamp-2">
                                {ca.title}
                              </span>
                              {ca.gsTag && (
                                <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#8C3A27]/10 text-[#8C3A27] border border-[#8C3A27]/20 shrink-0">
                                  {ca.gsTag}
                                </span>
                              )}
                            </div>
                            {ca.date && (
                              <span className="text-[10px] text-[#7A6B5D] font-serif italic block mt-0.5">
                                {ca.date}
                              </span>
                            )}
                          </a>
                        ))}
                      </div>
                    )}

                    {/* HIGH-FREQUENCY PYQ TOPICS */}
                    <div className="pt-3 space-y-1.5">
                      <div className="px-1 pb-0.5 flex items-center justify-between text-[10px] font-mono font-bold tracking-wider uppercase text-[#8C3A27]">
                        <span className="flex items-center gap-1.5">
                          <FileText className="w-3 h-3 text-[#8C3A27]" />
                          <span>High-Frequency PYQ Topics</span>
                        </span>
                        <span className="text-[#7A6B5D] font-normal text-[9px]">Direct Shortcuts</span>
                      </div>
                      <div className="space-y-1">
                        {defaultSuggestions.pyqShortcuts.map((topic) => (
                          <button
                            key={topic.id}
                            type="button"
                            onClick={() => {
                              setSearchQuery(topic.query);
                              if (searchInputRef.current) searchInputRef.current.focus();
                            }}
                            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-[#FAF6EE] text-left transition-colors group cursor-pointer"
                          >
                            <div className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#8C3A27] shrink-0"></span>
                              <span className="text-xs font-serif font-bold text-[#221814] group-hover:text-[#8C3A27] transition-colors">
                                {topic.label}
                              </span>
                            </div>
                            <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#D4AF37]/20 text-[#8C3A27] border border-[#D4AF37]/30 shrink-0">
                              {topic.stage}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* 2. ACTIVE TYPING FILTER (Query Fan-Out) */
                  <div>
                    {hasAnySuggestions ? (
                      <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1 scrollbar-thin divide-y divide-[#D5C3B0]/30">
                        {/* CURRENT AFFAIRS */}
                        {searchSuggestions.currentAffairs.length > 0 && (
                          <div className="space-y-1 pb-2">
                            <div className="px-2 py-1 flex items-center justify-between text-[10px] font-mono font-bold tracking-wider uppercase text-[#8C3A27]">
                              <span className="flex items-center gap-1.5">
                                <BookOpen className="w-3 h-3 text-[#8C3A27]" />
                                <span>Current Affairs</span>
                              </span>
                              <span className="text-[#7A6B5D] font-normal">{searchSuggestions.currentAffairs.length} found</span>
                            </div>
                            {searchSuggestions.currentAffairs.map((ca, idx) => (
                              <a
                                key={ca.slug || idx}
                                href={`/current-affairs/${encodeURIComponent(ca.slug)}`}
                                onClick={(e) => {
                                  e.preventDefault();
                                  setSearchOpen(false);
                                  setSearchQuery('');
                                  navigate(`/current-affairs/${encodeURIComponent(ca.slug)}`);
                                }}
                                className="block px-2.5 py-1.5 rounded-lg hover:bg-[#FAF6EE] transition-colors group cursor-pointer"
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <span className="text-xs font-serif font-bold text-[#221814] group-hover:text-[#8C3A27] transition-colors leading-snug line-clamp-2">
                                    {ca.title}
                                  </span>
                                  {ca.gsTag && (
                                    <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#8C3A27]/10 text-[#8C3A27] border border-[#8C3A27]/20 shrink-0">
                                      {ca.gsTag}
                                    </span>
                                  )}
                                </div>
                                {ca.date && (
                                  <span className="text-[10px] text-[#7A6B5D] font-serif italic block mt-0.5">
                                    {ca.date}
                                  </span>
                                )}
                              </a>
                            ))}
                          </div>
                        )}

                        {/* PREVIOUS YEAR QUESTIONS (PYQs) */}
                        {searchSuggestions.pyqs.length > 0 && (
                          <div className="space-y-1 pt-2 pb-2">
                            <div className="px-2 py-1 flex items-center justify-between text-[10px] font-mono font-bold tracking-wider uppercase text-[#8C3A27]">
                              <span className="flex items-center gap-1.5">
                                <FileText className="w-3 h-3 text-[#8C3A27]" />
                                <span>Previous Year Questions (PYQs)</span>
                              </span>
                              <span className="text-[#7A6B5D] font-normal">{searchSuggestions.pyqs.length} found</span>
                            </div>
                            {searchSuggestions.pyqs.map((pyq, idx) => (
                              <a
                                key={pyq.url || `${pyq.year}-${pyq.paperLabel}-${idx}`}
                                href={pyq.url}
                                onClick={(e) => {
                                  e.preventDefault();
                                  setSearchOpen(false);
                                  setSearchQuery('');
                                  navigate(pyq.url);
                                }}
                                className="block px-2.5 py-1.5 rounded-lg hover:bg-[#FAF6EE] transition-colors group cursor-pointer"
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <span className="text-xs font-serif font-bold text-[#221814] group-hover:text-[#8C3A27] transition-colors leading-snug line-clamp-2">
                                    {pyq.paperLabel}
                                  </span>
                                  <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#D4AF37]/20 text-[#8C3A27] border border-[#D4AF37]/30 shrink-0">
                                    {pyq.year} {pyq.stage}
                                  </span>
                                </div>
                                <span className="text-[10px] text-[#7A6B5D] font-sans truncate block mt-0.5">
                                  {pyq.title}
                                </span>
                              </a>
                            ))}
                          </div>
                        )}

                        {/* SYLLABUS */}
                        {searchSuggestions.syllabus.length > 0 && (
                          <div className="space-y-1 pt-2">
                            <div className="px-2 py-1 flex items-center justify-between text-[10px] font-mono font-bold tracking-wider uppercase text-[#8C3A27]">
                              <span className="flex items-center gap-1.5">
                                <BookOpen className="w-3 h-3 text-[#8C3A27]" />
                                <span>UPSC Syllabus</span>
                              </span>
                            </div>
                            {searchSuggestions.syllabus.map((syl, idx) => (
                              <a
                                key={syl.slug || idx}
                                href={`/resources/upsc-syllabus/${syl.slug}`}
                                onClick={(e) => {
                                  e.preventDefault();
                                  setSearchOpen(false);
                                  setSearchQuery('');
                                  navigate(`/resources/upsc-syllabus/${syl.slug}`);
                                }}
                                className="block px-2.5 py-1.5 rounded-lg hover:bg-[#FAF6EE] transition-colors group cursor-pointer"
                              >
                                <span className="text-xs font-serif font-bold text-[#221814] group-hover:text-[#8C3A27] transition-colors leading-snug">
                                  {syl.title}
                                </span>
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="p-4 text-center space-y-1">
                        <p className="text-xs font-serif italic text-[#7A6B5D] font-semibold">
                          No matching topics found for &ldquo;{searchQuery}&rdquo;.
                        </p>
                        <p className="text-[11px] text-[#5C4028]">
                          Try searching &ldquo;GS 1&rdquo;, &ldquo;Ethics&rdquo;, &ldquo;2024 Prelims&rdquo;, or &ldquo;Economy&rdquo;.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* "Begin Your Journey With Us" CTA Button */}
          <a
            href="/contact"
            onClick={(e) => {
              e.preventDefault();
              handleNavClick('/contact');
            }}
            className="btn-terracotta-pill text-xs py-2 px-4 shrink-0 whitespace-nowrap ml-2 shadow-xs inline-flex items-center no-underline"
          >
            <span className="btn-label" style={{ whiteSpace: 'nowrap' }}>Begin Your Journey With Us</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
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
          {/* Mobile Search Bar */}
          <div className="relative pb-2 border-b border-[#D5C3B0]/40">
            <div className="flex items-center bg-[#FFFDF8] border border-[#D5C3B0] rounded-full px-3 py-2 text-xs text-[#1A0F0B] focus-within:border-[#8C3A27]">
              <Search className="w-4 h-4 text-[#8C3A27] shrink-0 mr-2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setMobileSearchFocused(true)}
                placeholder="Search GS, PYQs & Syllabus..."
                className="w-full bg-transparent border-0 p-0 text-xs focus:outline-none placeholder:text-[#7A6B5D]"
              />
              {searchQuery && (
                <button 
                  type="button" 
                  onClick={() => {
                    setSearchQuery('');
                    setMobileSearchFocused(true);
                  }} 
                  className="text-[#7A6B5D] hover:text-[#8C3A27]"
                  aria-label="Clear mobile search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Mobile Suggestions (Active or On-Focus Default) */}
            {(searchQuery.trim() || mobileSearchFocused) && (
              <div className="mt-2 bg-[#FFFDF8] border border-[#D5C3B0] rounded-xl p-3 space-y-3 max-h-72 overflow-y-auto divide-y divide-[#D5C3B0]/30 text-left">
                {!searchQuery.trim() ? (
                  /* Mobile On-Focus Default Suggestions */
                  <div className="space-y-3">
                    <div>
                      <div className="px-1 pb-1.5 text-[10px] font-mono font-bold uppercase text-[#8C3A27] flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3 text-[#D4AF37]" />
                        <span>Syllabus Quick Filters</span>
                      </div>
                      <div className="grid grid-cols-2 gap-1.5">
                        {defaultSuggestions.syllabusAreas.map((area) => (
                          <button
                            key={area.id}
                            type="button"
                            onClick={() => setSearchQuery(area.query)}
                            className="px-2.5 py-1.5 text-xs font-serif font-bold text-[#221814] bg-[#FAF6EE] hover:bg-[#8C3A27] hover:text-white rounded-md border border-[#D5C3B0]/50 text-left transition-colors flex items-center justify-between"
                          >
                            <span>{area.label}</span>
                            <ArrowUpRight className="w-3 h-3 opacity-60" />
                          </button>
                        ))}
                      </div>
                    </div>

                    {defaultSuggestions.trendingCA.length > 0 && (
                      <div className="pt-2">
                        <div className="px-1 pb-1 text-[10px] font-mono font-bold uppercase text-[#8C3A27] flex items-center gap-1.5">
                          <BookOpen className="w-3 h-3 text-[#8C3A27]" />
                          <span>Trending Dispatches</span>
                        </div>
                        <div className="space-y-1">
                          {defaultSuggestions.trendingCA.map((ca, idx) => (
                            <a
                              key={ca.slug || idx}
                              href={`/current-affairs/${encodeURIComponent(ca.slug)}`}
                              onClick={(e) => {
                                e.preventDefault();
                                setSearchQuery('');
                                handleNavClick(`/current-affairs/${encodeURIComponent(ca.slug)}`);
                              }}
                              className="block p-1.5 rounded-md hover:bg-[#FAF6EE] text-left transition-colors"
                            >
                              <span className="text-xs font-serif font-bold text-[#221814] block line-clamp-1">{ca.title}</span>
                              <span className="text-[9px] text-[#7A6B5D]">{ca.date}</span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {defaultSuggestions.pyqShortcuts.length > 0 && (
                      <div className="pt-2">
                        <div className="px-1 pb-1 text-[10px] font-mono font-bold uppercase text-[#8C3A27] flex items-center gap-1.5">
                          <FileText className="w-3 h-3 text-[#8C3A27]" />
                          <span>Quick PYQs</span>
                        </div>
                        <div className="space-y-1">
                          {defaultSuggestions.pyqShortcuts.map((topic) => (
                            <button
                              key={topic.id}
                              type="button"
                              onClick={() => setSearchQuery(topic.query)}
                              className="w-full flex items-center justify-between p-1.5 rounded-md hover:bg-[#FAF6EE] text-left"
                            >
                              <span className="text-xs font-serif font-bold text-[#221814]">{topic.label}</span>
                              <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#D4AF37]/20 text-[#8C3A27]">{topic.stage}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Mobile Active Typing Filter */
                  <div className="space-y-2">
                    {hasAnySuggestions ? (
                      <>
                        {searchSuggestions.currentAffairs.map((ca, idx) => (
                          <a
                            key={ca.slug || idx}
                            href={`/current-affairs/${encodeURIComponent(ca.slug)}`}
                            onClick={(e) => {
                              e.preventDefault();
                              setSearchQuery('');
                              handleNavClick(`/current-affairs/${encodeURIComponent(ca.slug)}`);
                            }}
                            className="block p-2 rounded-lg hover:bg-[#FAF6EE] text-left"
                          >
                            <span className="text-xs font-serif font-bold text-[#221814] block line-clamp-1">{ca.title}</span>
                            <span className="text-[10px] text-[#8C3A27] font-mono">Current Affairs {ca.gsTag ? `• ${ca.gsTag}` : ''}</span>
                          </a>
                        ))}
                        {searchSuggestions.pyqs.map((pyq, idx) => (
                          <a
                            key={pyq.url || `${pyq.year}-${pyq.paperLabel}-${idx}`}
                            href={pyq.url}
                            onClick={(e) => {
                              e.preventDefault();
                              setSearchQuery('');
                              handleNavClick(pyq.url);
                            }}
                            className="block p-2 rounded-lg hover:bg-[#FAF6EE] text-left"
                          >
                            <span className="text-xs font-serif font-bold text-[#221814] block line-clamp-1">{pyq.paperLabel}</span>
                            <span className="text-[10px] text-[#8C3A27] font-mono">PYQ • {pyq.year} {pyq.stage}</span>
                          </a>
                        ))}
                      </>
                    ) : (
                      <p className="text-xs text-[#7A6B5D] p-2 text-center">No matches found for &ldquo;{searchQuery}&rdquo;</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {navItems.map((item) => {
            const isActive = currentPath === item.path;
            if (item.isBadge) {
              return (
                <div key={item.path} className="pt-2">
                  <a
                    href={item.path}
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavClick(item.path);
                    }}
                    className="btn-terracotta-pill text-xs py-2.5 px-6 w-full justify-center inline-flex items-center no-underline"
                  >
                    <span className="btn-label">{item.label}</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              );
            }
            return (
              <a
                key={item.path}
                href={item.path}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(item.path);
                }}
                className={`block w-full text-left font-serif text-sm font-bold uppercase tracking-wider py-2 border-b border-[#D5C3B0]/40 no-underline ${
                  isActive ? 'text-[#8C3A27]' : 'text-[#140C08]'
                }`}
              >
                {item.label}
              </a>
            );
          })}
        </div>
      )}

    </header>
    </div>
  );
}