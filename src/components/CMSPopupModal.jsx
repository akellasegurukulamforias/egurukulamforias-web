// src/components/CMSPopupModal.jsx
// 5-Minute Intelligent Popup Modal for Google Sheet Content CMS
import React, { useState, useEffect } from 'react';
import { X, ArrowRight, Sparkles, ExternalLink } from 'lucide-react';
import { useCMSData } from '../hooks/useCMSData';

const RECURRENCE_INTERVAL = 5 * 60 * 1000; // 5 minutes in milliseconds (300,000 ms)
const INITIAL_LANDING_DELAY = 2000; // 2 seconds after landing

export default function CMSPopupModal({ navigate }) {
  const { data } = useCMSData();
  const [visible, setVisible] = useState(false);

  const activePopup = data?.activePopup;

  // Extract keys dynamically with fallback key mappings
  const posterImg = activePopup ? (activePopup.Poster_Image_Link || activePopup.poster_image_link || activePopup.Poster_Link || activePopup.poster_link || activePopup.Image || activePopup.image) : null;
  const headline = activePopup ? (activePopup.Headline || activePopup.headline || activePopup.Title || activePopup.title) : null;
  const link = activePopup ? (activePopup.Link || activePopup.link || activePopup.URL || activePopup.url) : null;
  const subheading = activePopup ? (activePopup.Subheading || activePopup.subheading || activePopup.Description || activePopup.description) : null;

  // GUARD RULE: If activePopup is null or has no Poster_Image_Link AND no Headline, DO NOT show modal
  const isValidPopup = activePopup && (posterImg || headline);

  useEffect(() => {
    if (!isValidPopup) {
      setVisible(false);
      return;
    }

    let showTimer = null;
    let nextCheckTimer = null;

    const checkAndSchedulePopup = () => {
      const lastDismissedStr = sessionStorage.getItem('cmsPopupLastDismissed');
      const now = Date.now();

      if (!lastDismissedStr) {
        // Never dismissed in this session: show 2s after initial landing
        showTimer = setTimeout(() => {
          setVisible(true);
        }, INITIAL_LANDING_DELAY);
      } else {
        const lastDismissed = Number(lastDismissedStr);
        const elapsed = now - lastDismissed;

        if (elapsed >= RECURRENCE_INTERVAL) {
          // 5+ minutes have passed: show 2s after landing/navigation
          showTimer = setTimeout(() => {
            setVisible(true);
          }, INITIAL_LANDING_DELAY);
        } else {
          // Less than 5 minutes: wait remaining time before evaluating again
          const remaining = RECURRENCE_INTERVAL - elapsed;
          nextCheckTimer = setTimeout(() => {
            checkAndSchedulePopup();
          }, remaining);
        }
      }
    };

    checkAndSchedulePopup();

    return () => {
      if (showTimer) clearTimeout(showTimer);
      if (nextCheckTimer) clearTimeout(nextCheckTimer);
    };
  }, [isValidPopup]);

  const handleDismiss = () => {
    // Record current timestamp in sessionStorage
    sessionStorage.setItem('cmsPopupLastDismissed', Date.now().toString());
    setVisible(false);
  };

  const handleActionClick = () => {
    handleDismiss();
    if (link) {
      if (link.startsWith('http://') || link.startsWith('https://')) {
        window.open(link, '_blank', 'noopener,noreferrer');
      } else if (navigate) {
        navigate(link);
      }
    }
  };

  // DO NOT render anything if invalid or hidden
  if (!isValidPopup || !visible) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-xs transition-opacity animate-fade-in text-[#221814]"
      onClick={handleDismiss}
    >
      <div 
        className="relative w-full max-w-lg bg-[#FAF6EE] text-[#221814] rounded-3xl shadow-2xl border-2 border-[#8C3A27]/40 p-6 sm:p-8 overflow-hidden text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button ("✕") */}
        <button 
          type="button"
          onClick={handleDismiss}
          className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-[#8C3A27]/10 hover:bg-[#8C3A27]/20 text-[#8C3A27] transition-colors cursor-pointer"
          aria-label="Close announcement modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-5">
          
          {/* Header Eyebrow Tag */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#8C3A27]/10 border border-[#8C3A27]/30 text-[#8C3A27]">
            <Sparkles className="w-3.5 h-3.5 text-[#8C3A27]" />
            <span className="text-[11px] font-mono font-bold uppercase tracking-widest">
              SPECIAL ANNOUNCEMENT
            </span>
          </div>

          {/* Optional Clickable Poster Image */}
          {posterImg && (
            <div 
              className={`rounded-2xl overflow-hidden border border-[#D5C3B0] shadow-md group ${link ? 'cursor-pointer' : ''}`}
              onClick={link ? handleActionClick : undefined}
            >
              <img 
                src={posterImg} 
                alt={headline || "Announcement Poster"} 
                className="w-full max-h-64 object-cover group-hover:scale-102 transition-transform duration-500"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.style.display = 'none';
                }}
              />
            </div>
          )}

          {/* Headline */}
          {headline && (
            <h3 className="font-serif-header text-2xl sm:text-3xl font-extrabold text-[#221814] leading-snug">
              {headline}
            </h3>
          )}

          {/* Subheading / Description */}
          {subheading && (
            <p className="text-xs sm:text-sm font-serif italic text-[#5C4028] font-bold leading-relaxed">
              {subheading}
            </p>
          )}

          {/* Action Link Button */}
          {link && (
            <div className="pt-2">
              <button
                type="button"
                onClick={handleActionClick}
                className="btn-terracotta-pill text-xs py-3.5 px-8 font-serif font-bold shadow-md hover:shadow-xl transition-all w-full flex items-center justify-center gap-2.5 cursor-pointer"
              >
                <span>EXPLORE ANNOUNCEMENT</span>
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
