// src/components/AnnouncementPopup.jsx
// Interactive Fanned-Out Card Deck Modal (Hand of Playing Cards)
// Reverse-chronological sorting, 3D fan tilt, hover-lift drawing, maximized poster image, and card-tap navigation.

import React, { useState, useEffect, useMemo } from "react";
import { Calendar, ExternalLink, Tag, Layers, Sparkles, X } from "lucide-react";
import { getCMSImageLink, getSecondaryCMSImageUrl } from "../services/cmsService";
import { formatDisplayDate } from "../utils/formatDate";
import { parseDateToTimestamp } from "../utils/dateUtils";

export function isItemActive(obj) {
  if (!obj || typeof obj !== 'object') return false;
  if (obj.Active === false || obj.active === false || obj.Is_Active === false || obj.is_active === false) return false;
  if (obj.Status && String(obj.Status).toLowerCase() === 'inactive') return false;
  if (obj.status && String(obj.status).toLowerCase() === 'inactive') return false;
  return true;
}

export default function AnnouncementPopup({ 
  activePopup, 
  tickerItems, 
  initialIndex = 0,
  selectedItem,
  isOpen: externalIsOpen, 
  onClose 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  // Touch swipe tracking
  const [touchStartX, setTouchStartX] = useState(null);
  const [touchEndX, setTouchEndX] = useState(null);
  const minSwipeDistance = 45;

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // 1. Build & Sort All Active Cards Reverse-Chronologically (Newest on top / front)
  const sortedCards = useMemo(() => {
    let list = [];
    if (Array.isArray(tickerItems) && tickerItems.length > 0) {
      list = tickerItems.filter(isItemActive);
    }
    
    // Merge activePopup if present and not already duplicated
    if (activePopup && isItemActive(activePopup)) {
      const activeHeadline = activePopup.Headline || activePopup.headline || activePopup.Title || activePopup.title;
      const alreadyInList = list.some(item => {
        const h = item.Headline || item.headline || item.Title || item.title;
        return h && activeHeadline && h.trim().toLowerCase() === activeHeadline.trim().toLowerCase();
      });
      if (!alreadyInList) {
        list = [activePopup, ...list];
      }
    }

    // Sort descending: highest timestamp (newest date) comes first at index 0
    return [...list].sort((a, b) => {
      const dateA = a.Date || a.date || a.Published_Date || a.published_date || '';
      const dateB = b.Date || b.date || b.Published_Date || b.published_date || '';
      const timeA = parseDateToTimestamp(dateA);
      const timeB = parseDateToTimestamp(dateB);
      return timeB - timeA;
    });
  }, [tickerItems, activePopup]);

  // Synchronize external modal visibility
  useEffect(() => {
    if (externalIsOpen !== undefined && externalIsOpen !== null) {
      setIsOpen(externalIsOpen);
    }
  }, [externalIsOpen]);

  // 2. Dynamic Card Selection: Bring the clicked card directly to the forefront
  useEffect(() => {
    if (!isOpen || sortedCards.length === 0) return;

    // Check if a specific item object was passed
    if (selectedItem && typeof selectedItem === 'object') {
      const targetHeadline = selectedItem.Headline || selectedItem.headline || selectedItem.Title || selectedItem.title;
      if (targetHeadline) {
        const foundIdx = sortedCards.findIndex(card => {
          const h = card.Headline || card.headline || card.Title || card.title;
          return h && h.trim().toLowerCase() === targetHeadline.trim().toLowerCase();
        });
        if (foundIdx >= 0) {
          setActiveIndex(foundIdx);
          return;
        }
      }
    }

    // Otherwise check if a numeric initialIndex was passed
    if (typeof initialIndex === 'number' && initialIndex >= 0 && initialIndex < sortedCards.length) {
      setActiveIndex(initialIndex);
    } else {
      setActiveIndex(0); // Default to latest card (top of the deck)
    }
  }, [isOpen, selectedItem, initialIndex, sortedCards]);

  // 5-minute intelligent auto-popup check
  useEffect(() => {
    if (sortedCards.length === 0) return;

    const checkAndShow = () => {
      const lastClosed = sessionStorage.getItem("egk_popup_closed_time");
      const fiveMinutes = 5 * 60 * 1000;

      // If never closed, or 5 minutes have passed since last close
      if (!lastClosed || Date.now() - Number(lastClosed) > fiveMinutes) {
        setIsOpen(true);
      }
    };

    const timer = setTimeout(checkAndShow, 2000);
    const interval = setInterval(checkAndShow, 5 * 60 * 1000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [sortedCards.length]);

  // Keyboard navigation (Escape to close, ArrowLeft/Right to fan cards)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        handleClose();
      } else if (e.key === "ArrowLeft" && sortedCards.length > 1) {
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : sortedCards.length - 1));
      } else if (e.key === "ArrowRight" && sortedCards.length > 1) {
        setActiveIndex((prev) => (prev < sortedCards.length - 1 ? prev + 1 : 0));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, sortedCards.length]);

  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.setItem("egk_popup_closed_time", String(Date.now()));
    if (onClose) onClose();
  };

  // Touch Swipe Handlers for mobile navigation
  const handleTouchStart = (e) => {
    setTouchEndX(null);
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStartX || !touchEndX || sortedCards.length <= 1) return;
    const distance = touchStartX - touchEndX;
    if (distance > minSwipeDistance) {
      // Swiped left -> next card
      setActiveIndex((prev) => (prev < sortedCards.length - 1 ? prev + 1 : 0));
    } else if (distance < -minSwipeDistance) {
      // Swiped right -> previous card
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : sortedCards.length - 1));
    }
  };

  if (!isOpen || sortedCards.length === 0) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fadeIn select-none overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Announcement Deck"
    >
      {/* Backdrop click to close */}
      <div className="absolute inset-0 z-0" onClick={handleClose} />

      {/* TOP HEADER CONTROLS (Deck Counter & Close Button) */}
      <div className="relative z-50 w-full max-w-4xl flex items-center justify-between px-2 sm:px-4 py-2 mb-2 sm:mb-3">
        
        {/* Hand of Cards Counter */}
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF5EE]/95 border border-[#D5C3B0] text-xs font-serif font-bold text-[#8C3A27] shadow-sm">
            <Layers className="w-3.5 h-3.5 text-[#8C3A27]" />
            <span className="hidden sm:inline">ANNOUNCEMENT DECK:</span>
            <span>{activeIndex + 1} of {sortedCards.length}</span>
          </span>
        </div>

        {/* Global Modal Close Button */}
        <button
          type="button"
          onClick={handleClose}
          className="bg-[#FAF5EE]/95 hover:bg-[#8C3A27] text-[#221814] hover:text-white rounded-full w-9 h-9 flex items-center justify-center text-sm font-bold shadow-lg transition-all cursor-pointer border border-[#D5C3B0] group"
          aria-label="Close Announcement Deck"
          title="Close Deck (or press Esc)"
        >
          <X className="w-4 h-4 group-hover:scale-110 transition-transform" />
        </button>
      </div>

      {/* MAIN FANNED CARD-DECK ARENA */}
      <div 
        className="relative z-20 w-full max-w-4xl flex items-center justify-center my-auto py-2 sm:py-3 px-3"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* THE FANNED DECK OF PHYSICAL CARDS (CSS Grid Overlay) */}
        <div className="grid grid-cols-1 grid-rows-1 place-items-center w-[92vw] max-w-[340px] sm:max-w-[390px] md:max-w-[430px] mx-auto">
          {sortedCards.map((card, idx) => {
            const diff = idx - activeIndex;
            const isActive = (idx === activeIndex);
            const isHovered = (idx === hoveredIndex && !isActive);

            // Compute Fanned Transform for Hand-of-Cards Spread
            let transformStyle = '';
            let zIndex = 30 - Math.abs(diff);
            let opacity = 1;

            if (isMobile) {
              // Mobile Stack Layout: gentle offset so cards behind peek from top/right
              if (isActive) {
                transformStyle = 'translate3d(0, 0, 30px) rotate(0deg) scale(1)';
                zIndex = 40;
                opacity = 1;
              } else {
                const mobileOffset = Math.sign(diff) * Math.min(Math.abs(diff), 2);
                const xOffset = mobileOffset * 16;
                const yOffset = mobileOffset * 12;
                const rot = mobileOffset * 2.5;
                transformStyle = `translate3d(${xOffset}px, ${yOffset}px, 0) rotate(${rot}deg) scale(${1 - Math.abs(mobileOffset) * 0.04})`;
                zIndex = 30 - Math.abs(diff);
                opacity = Math.max(0.65, 1 - Math.abs(diff) * 0.15);
              }
            } else {
              // Desktop Fanned Hand: fan out with rotational arc & horizontal spread
              if (isActive) {
                transformStyle = 'translate3d(0, -10px, 60px) rotate(0deg) scale(1.02)';
                zIndex = 45;
                opacity = 1;
              } else if (isHovered) {
                // Card lifted out of the hand when hovered
                const hoverOffsetX = diff * 60;
                transformStyle = `translate3d(${hoverOffsetX}px, -26px, 45px) rotate(${diff * 2}deg) scale(1)`;
                zIndex = 40;
                opacity = 1;
              } else {
                // Natural fanned arc in a card player's hand
                const spreadX = diff * 56;
                const spreadY = Math.min(Math.abs(diff) * 10, 28);
                const spreadAngle = diff * 4.5; // gentle fan angle
                const spreadScale = Math.max(0.92, 1 - Math.abs(diff) * 0.035);
                transformStyle = `translate3d(${spreadX}px, ${spreadY}px, 0) rotate(${spreadAngle}deg) scale(${spreadScale})`;
                zIndex = 30 - Math.abs(diff);
                opacity = Math.max(0.72, 1 - Math.abs(diff) * 0.1);
              }
            }

            // Data extraction for card
            const posterLink = getCMSImageLink(card);
            const rawPoster = 
              card.Poster_Image_Link || 
              card.poster_image_link || 
              card.Banner_Image || 
              card.banner_image || 
              card.Poster_Image || 
              card.poster_image || 
              card.Poster_Link || 
              card.poster_link || 
              card.Image || 
              card.image;

            const headline = card.Headline || card.headline || card.Title || card.title || "Announcement";
            const actionLink = card.Link || card.link || card.URL || card.url || card.Target_Link || card.target_link || "";
            const badge = card.Badge || card.badge || card.Tag || card.tag || card.Category || card.category || "ANNOUNCEMENT";
            const rawDate = card.Date || card.date || card.Published_Date || card.published_date || "";
            const formattedDate = formatDisplayDate(rawDate);
            const description = 
              card.Description || 
              card.description || 
              card.Full_Content || 
              card.full_content || 
              card.Subheading || 
              card.subheading || 
              card.Text || 
              card.text || 
              card.Summary || 
              card.summary || 
              "";

            return (
              <div
                key={`deck-card-${idx}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveIndex(idx);
                }}
                onMouseEnter={() => !isMobile && setHoveredIndex(idx)}
                onMouseLeave={() => !isMobile && setHoveredIndex(null)}
                style={{
                  gridArea: '1 / 1 / 2 / 2',
                  transform: transformStyle,
                  zIndex: zIndex,
                  opacity: opacity,
                  transition: "transform 420ms cubic-bezier(0.16, 1, 0.3, 1), opacity 300ms ease, box-shadow 300ms ease"
                }}
                className={`w-full flex flex-col rounded-2xl sm:rounded-3xl bg-gradient-to-b from-[#FFFDF8] via-[#FAF5EE] to-[#F5EBD9] border-2 overflow-hidden cursor-pointer select-none text-left shadow-2xl ${
                  isActive 
                    ? 'border-[#8C3A27] shadow-[0_24px_50px_-12px_rgba(44,34,30,0.55),0_0_0_1px_rgba(197,160,89,0.4)]' 
                    : 'border-[#D5C3B0]/85 shadow-xl hover:border-[#8C3A27]/60'
                }`}
              >
                {/* CARD HEADER: Tag, Latest Badge, Date, Card Indicator */}
                <div className="flex items-center justify-between px-3.5 py-2 sm:px-4 sm:py-2.5 bg-[#FAF5EE] border-b border-[#D5C3B0]/60 gap-2 shrink-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {/* Category Tag */}
                    <span className="text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-wider text-[#8C3A27] bg-[#8C3A27]/10 px-2 py-0.5 rounded-md border border-[#8C3A27]/20 inline-flex items-center gap-1">
                      <Tag className="w-2.5 h-2.5" />
                      <span>{badge}</span>
                    </span>

                    {/* PROMINENT LATEST CARD BADGE (Directly inside Card Header) */}
                    {idx === 0 && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#8C3A27] text-[#FFD700] text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-wider shadow-xs border border-[#FFD700]/40">
                        <Sparkles className="w-3 h-3 text-[#FFD700] shrink-0" />
                        <span>LATEST DISPATCH</span>
                      </span>
                    )}

                    {/* Date Badge */}
                    {formattedDate && (
                      <span className="inline-flex items-center gap-1 font-serif text-[11px] text-[#7A6B5D] italic font-semibold">
                        <Calendar className="w-3 h-3 text-[#8C3A27]" />
                        <span>{formattedDate}</span>
                      </span>
                    )}
                  </div>

                  <span className="font-mono text-[10px] font-bold text-[#8C3A27]/80 bg-[#FAF5EE] px-2 py-0.5 rounded-full border border-[#D5C3B0] shrink-0">
                    {idx + 1}/{sortedCards.length}
                  </span>
                </div>

                {/* FULL-WIDTH POSTER IMAGE (Edge-to-Edge Width, Flush Against Card Borders) */}
                {posterLink ? (
                  <div 
                    className={`w-full bg-[#140C08]/5 overflow-hidden block shrink-0 ${isActive && actionLink ? 'cursor-pointer' : ''}`}
                    onClick={(e) => {
                      if (isActive && actionLink && actionLink.trim() !== '') {
                        e.stopPropagation();
                        window.open(actionLink, '_blank', 'noopener,noreferrer');
                      }
                    }}
                  >
                    <img
                      src={posterLink}
                      alt={headline}
                      loading="eager"
                      referrerPolicy="no-referrer"
                      className="w-full h-auto block object-cover sm:object-contain max-h-[48vh] sm:max-h-[54vh]"
                      onError={(e) => {
                        const secondary = getSecondaryCMSImageUrl(rawPoster);
                        if (secondary && e.target.src !== secondary) {
                          e.target.src = secondary;
                        } else {
                          e.target.onerror = null;
                          e.target.style.display = 'none';
                        }
                      }}
                    />
                  </div>
                ) : (
                  /* Fallback if no poster image */
                  <div className="p-4 sm:p-5 flex flex-col items-center justify-center text-center space-y-2 bg-[#FAF5EE] border-b border-[#D5C3B0]/40">
                    <div className="w-10 h-10 rounded-full bg-[#8C3A27]/10 flex items-center justify-center text-[#8C3A27]">
                      <Tag className="w-5 h-5" />
                    </div>
                  </div>
                )}

                {/* CARD BODY: Compact Headline, Description, and Link (Zero Wasted Space) */}
                <div className="p-3 sm:p-4 bg-[#FAF5EE] text-center flex flex-col items-center gap-2 shrink-0">
                  {/* Headline */}
                  <h3 className="font-serif-header text-base sm:text-lg font-bold text-[#140C08] leading-snug">
                    {headline}
                  </h3>

                  {/* Description / Full Text (only if present and not duplicating headline) */}
                  {description && description.trim() !== '' && description.trim().toLowerCase() !== headline.trim().toLowerCase() && (
                    <p className="text-xs sm:text-sm text-[#3D3028] font-sans font-medium leading-relaxed line-clamp-2">
                      {description}
                    </p>
                  )}

                  {/* Action Button or Card Draw Prompt */}
                  {isActive ? (
                    actionLink && actionLink.trim() !== '' ? (
                      <a
                        href={actionLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleClose();
                        }}
                        className="btn-terracotta-pill text-xs py-2 px-5 font-serif font-bold inline-flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all w-full text-center cursor-pointer mt-0.5"
                      >
                        <span>Explore Announcement</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    ) : null
                  ) : (
                    <div className="text-center text-[11px] font-serif italic text-[#7A6B5D] font-semibold py-0.5 group-hover:text-[#8C3A27] transition-colors">
                      Click to Draw This Card 🂠
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* BOTTOM HAND CONTROLS (Card Pills Selector & Mobile Hint) */}
      <div className="relative z-40 w-full max-w-xl flex flex-col items-center gap-2 px-4 pt-1">
        
        {/* Interactive Hand Pill Selector */}
        {sortedCards.length > 1 && (
          <div className="flex items-center justify-center flex-wrap gap-2">
            {sortedCards.map((card, idx) => {
              const headline = card.Headline || card.headline || card.Title || card.title || `Card ${idx + 1}`;
              const isSelected = (idx === activeIndex);
              return (
                <button
                  key={`pill-${idx}`}
                  type="button"
                  onClick={() => setActiveIndex(idx)}
                  className={`px-3 py-1 rounded-full text-xs font-serif font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm ${
                    isSelected
                      ? 'bg-[#8C3A27] text-white shadow-md scale-105 border border-[#8C3A27]'
                      : 'bg-[#FAF5EE]/90 hover:bg-[#FAF5EE] text-[#221814] border border-[#D5C3B0]'
                  }`}
                  aria-label={`Draw card ${idx + 1}: ${headline}`}
                >
                  <span className="font-mono text-[10px] opacity-75">#{idx + 1}</span>
                  <span className="truncate max-w-[130px] sm:max-w-[180px]">{headline}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Mobile Swipe / Tap Hint */}
        {sortedCards.length > 1 && (
          <div className="flex items-center justify-center w-full text-xs text-amber-100/90 font-serif italic pt-1">
            <span className="text-[11px] opacity-85 text-center">
              Tap any card to draw • Swipe to fan through
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
