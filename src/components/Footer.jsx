import React from 'react';
import { ArrowUpRight, Mail, Phone, MapPin, Feather, ExternalLink } from 'lucide-react';

export default function Footer({ navigate }) {
  const handleNav = (path) => {
    navigate(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const MAPS_URL = "https://maps.app.goo.gl/NhQYhywYBYX1ffkk9";
  const LEGACY_PLATFORM_URL = "https://www.iasmentoring.com/";
  const SANKALPA_SIDDHI_URL = "https://www.sankalpasiddi.com/";
  const YOUTUBE_CHANNEL_URL = "https://www.youtube.com/@e-GurukulamforIAS";

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/about', label: 'About e-Gurukulam' },
    { path: '/programs', label: 'Programs' },
    { path: '/test-series', label: 'Test Series' },
    { path: '/blog', label: 'Current Affairs' },
    { path: '/resources', label: 'Resources' },
    { path: '/contact', label: 'Begin Your Journey With Us' }
  ];

  return (
    <footer className="bg-[#140C08] text-[#F9F5EB] pt-16 pb-12 relative overflow-hidden border-t-4 border-[#8C3A27]">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
          
          {/* Brand Info */}
          <div className="lg:col-span-5 space-y-4">
            <div 
              className="flex items-center cursor-pointer inline-flex"
              onClick={() => handleNav('/')}
            >
              <img 
                src="/images/Logo.png" 
                alt="e-Gurukulam Logo"
                className="h-16 w-auto object-contain block"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.style.display = 'none';
                }}
              />
            </div>

            <p className="font-serif italic text-sm text-[#C5A059] leading-relaxed font-semibold">
              “Learn with Purpose. Prepare with Discipline. Lead with Wisdom.”
            </p>

            <p className="text-xs text-[#F9F5EB]/80 leading-relaxed max-w-md font-sans">
              Transforming civil service preparation into a journey of purposeful growth. Blending timeless mentorship wisdom with contemporary exam strategy to shape thoughtful, capable, and exemplary civil servants.
            </p>
          </div>

          {/* Contact Metadata */}
          <div className="lg:col-span-4 space-y-3">
            <h4 className="font-serif-header text-sm font-bold uppercase tracking-wider text-[#C5A059] border-b border-[#C5A059]/20 pb-2">
              Institutional Contact
            </h4>

            {/* Social Media Contact Icons Placed Above Akella's Residence */}
            <div className="flex flex-wrap items-center gap-2.5 pb-1">
              
              {/* 1. YouTube */}
              <a 
                href={YOUTUBE_CHANNEL_URL}
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="YouTube Channel" 
                title="Official YouTube Channel"
                className="w-8 h-8 rounded-full bg-[#2A1E18] border border-[#C5A059]/40 flex items-center justify-center text-[#C5A059] hover:bg-[#FF0000] hover:text-white hover:border-[#FF0000] transition-all duration-300"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>

              {/* 2. Facebook */}
              <a 
                href="https://www.facebook.com/profile.php?id=61570902514505" 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="Facebook" 
                title="Facebook Page"
                className="w-8 h-8 rounded-full bg-[#2A1E18] border border-[#C5A059]/40 flex items-center justify-center text-[#C5A059] hover:bg-[#8C3A27] hover:text-white hover:border-[#8C3A27] transition-all duration-300"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>

              {/* 3. LinkedIn */}
              <a 
                href="https://www.linkedin.com/in/akella-raghavendra-b62158284/" 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="LinkedIn" 
                title="Akella Raghavendra | LinkedIn"
                className="w-8 h-8 rounded-full bg-[#2A1E18] border border-[#C5A059]/40 flex items-center justify-center text-[#C5A059] hover:bg-[#8C3A27] hover:text-white hover:border-[#8C3A27] transition-all duration-300"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
                </svg>
              </a>

              {/* 4. Instagram */}
              <a 
                href="https://www.instagram.com/egurukulamforias/" 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="Instagram" 
                title="Instagram Profile"
                className="w-8 h-8 rounded-full bg-[#2A1E18] border border-[#C5A059]/40 flex items-center justify-center text-[#C5A059] hover:bg-[#8C3A27] hover:text-white hover:border-[#8C3A27] transition-all duration-300"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>

              {/* 5. Telegram */}
              <a 
                href="https://t.me/egurukulamforias" 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="Telegram" 
                title="Telegram Channel"
                className="w-8 h-8 rounded-full bg-[#2A1E18] border border-[#C5A059]/40 flex items-center justify-center text-[#C5A059] hover:bg-[#8C3A27] hover:text-white hover:border-[#8C3A27] transition-all duration-300"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm5.56 8.16l-2.02 9.51c-.15.68-.55.85-1.12.53l-3.08-2.27-1.49 1.43c-.16.16-.3.3-.62.3l.22-3.14 5.73-5.18c.25-.22-.05-.34-.39-.12l-7.08 4.46-3.05-.95c-.66-.21-.67-.66.14-.98l11.91-4.59c.55-.2 1.04.13.85.91z"/>
                </svg>
              </a>

              {/* 6. WhatsApp Channel */}
              <a 
                href="https://whatsapp.com/channel/0029VbB3qcSE50UaECuWi52o" 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="WhatsApp Channel" 
                title="WhatsApp Channel"
                className="w-8 h-8 rounded-full bg-[#2A1E18] border border-[#C5A059]/40 flex items-center justify-center text-[#C5A059] hover:bg-[#8C3A27] hover:text-white hover:border-[#8C3A27] transition-all duration-300"
              >
                <Mail className="w-3.5 h-3.5" />
              </a>

              {/* 7. Twitter / X */}
              <a 
                href="https://x.com/egurukulamf1674?s=20" 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="Twitter / X" 
                title="Twitter / X"
                className="w-8 h-8 rounded-full bg-[#2A1E18] border border-[#C5A059]/40 flex items-center justify-center text-[#C5A059] hover:bg-[#8C3A27] hover:text-white hover:border-[#8C3A27] transition-all duration-300"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>

            </div>

            <div className="space-y-2.5 text-xs text-[#F9F5EB]/85 font-sans">
              
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#C5A059] shrink-0 mt-0.5" />
                <a 
                  href={MAPS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#C5A059] transition-colors underline decoration-[#C5A059]/40 underline-offset-4 font-semibold"
                >
                  Akella's Residence
                </a>
              </div>

              <div className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-[#C5A059] shrink-0 mt-0.5" />
                <div className="space-y-1 font-medium">
                  <div><a href="tel:+918897826108" className="hover:text-[#C5A059] transition-colors">+91 8897826108</a></div>
                  <div><a href="tel:+919912211109" className="hover:text-[#C5A059] transition-colors">+91 9912211109</a></div>
                  <div><a href="tel:+918985894254" className="hover:text-[#C5A059] transition-colors">+91 8985894254</a></div>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#C5A059] shrink-0" />
                <a href="mailto:akellas.egurukulamforias@gmail.com" className="hover:text-[#C5A059] transition-colors font-medium">
                  akellas.egurukulamforias@gmail.com
                </a>
              </div>

              <div className="flex items-center gap-2.5 pt-1">
                <Feather className="w-4 h-4 text-[#8C3A27] shrink-0" />
                <span className="text-[#C5A059] italic font-serif font-semibold">Under guidance of Akella Raghavendra Sir</span>
              </div>

            </div>
          </div>

          {/* Admissions Action & Legacy Platforms */}
          <div className="lg:col-span-3 space-y-4">
            <div className="space-y-2">
              <h4 className="font-serif-header text-sm font-bold uppercase tracking-wider text-[#C5A059] border-b border-[#C5A059]/20 pb-2">
                Enrollment &amp; Dispatches
              </h4>
              <p className="text-xs text-[#F9F5EB]/75 leading-relaxed font-sans">
                Begin your administrative preparation journey under personal mentor guidance.
              </p>
              <div className="pt-1">
                <button
                  onClick={() => handleNav('/contact')}
                  className="btn-terracotta-pill text-[11px] sm:text-xs py-2.5 px-4 justify-center font-bold"
                  style={{ whiteSpace: 'nowrap', display: 'inline-flex', width: 'auto' }}
                >
                  <span className="btn-label" style={{ whiteSpace: 'nowrap' }}>Begin Your Journey With Us</span>
                  <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
                </button>
              </div>
            </div>

            {/* Legacy & Social Initiatives Links */}
            <div className="pt-2 border-t border-[#C5A059]/20 space-y-2 text-xs font-serif font-semibold">
              <a 
                href={LEGACY_PLATFORM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#C5A059] hover:text-white transition-colors flex items-center gap-1.5"
              >
                <span>Visit Our Legacy Platform</span>
                <ExternalLink className="w-3 h-3 opacity-70" />
              </a>

              <a 
                href={SANKALPA_SIDDHI_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#C5A059] hover:text-white transition-colors flex items-center gap-1.5"
              >
                <span>Sankalpa Siddhi (సంకల్ప సిద్ధి) Foundation</span>
                <ExternalLink className="w-3 h-3 opacity-70" />
              </a>
            </div>

          </div>

        </div>

        {/* Quick Links Grid */}
        <div className="border-t border-[#F9F5EB]/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-[#F9F5EB]/70 font-sans">
          
          <div className="flex flex-wrap items-center justify-center gap-6">
            {navLinks.map((link) => (
              <button
                key={link.path}
                onClick={() => handleNav(link.path)}
                className="hover:text-[#C5A059] transition-colors font-semibold"
              >
                {link.label}
              </button>
            ))}
          </div>

          <div className="text-center md:text-right space-y-1">
            <p>© {new Date().getFullYear()} e-Gurukulam for IAS. All rights reserved.</p>
            <p className="text-[10px] text-[#F9F5EB]/50 italic">
              Empowering administrative excellence through ethical mentorship.
            </p>
          </div>

        </div>

      </div>

    </footer>
  );
}