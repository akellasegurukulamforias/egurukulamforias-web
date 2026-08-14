import React, { useState, useEffect } from 'react';
import { Menu, X, ArrowUpRight } from 'lucide-react';

export default function Header({ currentPath, navigate }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

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
    <header className={`sticky top-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'py-1.5 bg-[#F9F5EB]/95 backdrop-blur-md border-b border-[#D5C3B0] shadow-sm' 
        : 'py-2.5 bg-[#F9F5EB]/85 backdrop-blur-xs'
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
  );
}