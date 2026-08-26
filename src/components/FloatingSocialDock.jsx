// src/components/FloatingSocialDock.jsx
// Pure Dynamic Floating Social Dock using Dynamic Smart Icon Resolver (getSocialIcon)
import React, { useState, useEffect, useRef } from 'react';
import { ArrowUpRight, ExternalLink } from 'lucide-react';
import { useCMSData } from '../hooks/useCMSData';
import { getSocialIcon } from '../utils/socialIcons';

// Helper to check active status of items/channels
const isItemActive = (obj) => {
  if (!obj || typeof obj !== 'object') return false;
  if (obj.Active === false || obj.active === false || obj.Is_Active === false || obj.is_active === false) return false;
  if (obj.Status && obj.Status.toString().toLowerCase() === 'inactive') return false;
  if (obj.status && obj.status.toString().toLowerCase() === 'inactive') return false;
  return true;
};

export default function FloatingSocialDock() {
  const { data } = useCMSData();
  const [activeCategory, setActiveCategory] = useState(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const closeTimer = useRef(null);
  const dockRef = useRef(null);

  // EXCLUSIVELY consume data.socialPlatforms from CMS context - ZERO static fallbacks!
  const rawPlatforms = Array.isArray(data?.socialPlatforms) ? data.socialPlatforms : [];

  // Process active platforms dynamically (0 active items -> completely omitted)
  const activePlatforms = rawPlatforms
    .filter(isItemActive)
    .map((rawItem) => {
      const platformName = rawItem.platform || rawItem.Platform || rawItem.id || rawItem.type || rawItem.name || 'Platform';
      const title = rawItem.title || rawItem.Title || rawItem.name || rawItem.Name || platformName;
      const directUrl = rawItem.directUrl || rawItem.direct_url || rawItem.url || rawItem.Link || rawItem.link || rawItem.href;

      const rawChannels = Array.isArray(rawItem.channels) 
        ? rawItem.channels 
        : Array.isArray(rawItem.branches) 
          ? rawItem.branches 
          : Array.isArray(rawItem.links) 
            ? rawItem.links 
            : [];

      // Filter active sub-channels
      const activeChannels = rawChannels.filter(isItemActive).map(ch => ({
        name: ch.name || ch.Name || ch.title || ch.Title || 'Official Channel',
        url: ch.url || ch.Url || ch.link || ch.Link || ch.href || '#'
      }));

      const explicitDirect = rawItem.isDirect !== undefined 
        ? Boolean(rawItem.isDirect) 
        : rawItem.is_direct !== undefined 
          ? Boolean(rawItem.is_direct) 
          : false;

      // Single-action node OR 0 or 1 active channels
      if (explicitDirect || activeChannels.length <= 1) {
        const targetUrl = directUrl || (activeChannels.length === 1 ? activeChannels[0].url : null);
        
        // If 0 active channels and no direct URL, exclude parent icon completely
        if (!targetUrl) return null;

        const effectiveTitle = (activeChannels.length === 1 && activeChannels[0].name)
          ? activeChannels[0].name
          : title;

        return {
          platform: platformName,
          title: effectiveTitle,
          isDirect: true,
          directUrl: targetUrl,
          channels: []
        };
      }

      // Multi-channel group with > 1 active channels
      return {
        platform: platformName,
        title,
        isDirect: false,
        directUrl: null,
        channels: activeChannels
      };
    })
    .filter(Boolean); // Remove deleted or inactive items completely

  // 1. Auto-Hide & Auto-Dismiss Menu During Scroll
  useEffect(() => {
    let timer;
    const handleScroll = () => {
      setIsScrolling(true);
      setActiveCategory(null);
      if (closeTimer.current) clearTimeout(closeTimer.current);
      clearTimeout(timer);
      timer = setTimeout(() => setIsScrolling(false), 600);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 2. Click-Outside Auto-Dismiss Listener
  useEffect(() => {
    const handleWindowClick = (e) => {
      if (dockRef.current && !dockRef.current.contains(e.target)) {
        setActiveCategory(null);
      }
    };
    window.addEventListener("click", handleWindowClick);
    return () => window.removeEventListener("click", handleWindowClick);
  }, []);

  // 3. Hover Handlers with 150ms Buffer
  const handleMouseEnter = (catId) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setActiveCategory(catId);
  };

  const handleMouseLeave = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => {
      setActiveCategory(null);
    }, 150);
  };

  const handleLinkClick = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setActiveCategory(null);
  };

  // If zero active platforms returned from CMS, do not render dock at all
  if (activePlatforms.length === 0) return null;

  return (
    <aside 
      ref={dockRef}
      className={`fixed right-0 top-1/2 -translate-y-1/2 z-50 flex flex-col items-center select-none transition-all duration-500 ease-in-out ${
        isScrolling ? "translate-x-full opacity-0 pointer-events-none" : "translate-x-0 opacity-100"
      }`}
      aria-label="Floating Social Dock"
    >
      {/* Dock Shell: Luxury Curved Glass Pill */}
      <div className="bg-[#FAF5EE]/95 backdrop-blur-xl border-l border-y border-[#D4AF37]/50 shadow-2xl rounded-l-2xl py-3 px-1.5 flex flex-col gap-2.5 items-center relative border-r-0">
        
        {activePlatforms.map((item, idx) => {
          const platformName = item.platform;
          const title = item.title;
          const directUrl = item.directUrl;
          const channels = item.channels;
          const isDirect = item.isDirect;

          const itemId = platformName.toLowerCase();
          const isExpanded = activeCategory === itemId;
          const hasBranches = !isDirect && channels.length > 0;

          return (
            <div
              key={idx}
              className="relative flex items-center justify-center group"
              onMouseEnter={() => hasBranches && handleMouseEnter(itemId)}
              onMouseLeave={() => hasBranches && handleMouseLeave()}
            >
              {/* Parent Icon Button */}
              {hasBranches ? (
                <button
                  type="button"
                  onClick={() => {
                    if (isExpanded) {
                      setActiveCategory(null);
                    } else {
                      handleMouseEnter(itemId);
                    }
                  }}
                  className={`w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center border transition-all duration-200 hover:scale-110 cursor-pointer relative z-10 ${
                    isExpanded 
                      ? 'border-[#D4AF37] ring-2 ring-[#D4AF37]/80 shadow-md' 
                      : 'border-[#EAE0D5] hover:border-[#D4AF37]/60'
                  }`}
                  aria-label={title}
                  aria-expanded={isExpanded}
                >
                  {getSocialIcon(platformName, "w-4 h-4 shrink-0")}
                </button>
              ) : (
                <a
                  href={directUrl || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleLinkClick}
                  className="w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center border border-[#EAE0D5] hover:border-[#D4AF37]/60 hover:scale-110 transition-all duration-200 cursor-pointer relative z-10"
                  aria-label={title}
                >
                  {getSocialIcon(platformName, "w-4 h-4 shrink-0")}
                </a>
              )}

              {/* Floating Tooltip for Single-Action Direct Links */}
              {!hasBranches && (
                <div className="absolute right-12 top-1/2 -translate-y-1/2 text-xs font-semibold px-3 py-1.5 bg-stone-900/90 text-amber-200 rounded-xl shadow-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none border border-[#D4AF37]/30 flex items-center gap-1.5 z-50">
                  <span>{title}</span>
                  <ExternalLink className="w-3 h-3 text-amber-300" />
                </div>
              )}

              {/* SLEEK APPLE-STYLE FLOATING CARD MENU FLYOUT (No Subtitles) */}
              {hasBranches && isExpanded && (
                <div 
                  className="absolute right-12 top-1/2 -translate-y-1/2 flex flex-col gap-1.5 p-2 bg-[#FAF5EE]/98 backdrop-blur-xl border border-[#D4AF37]/50 rounded-2xl shadow-2xl min-w-[240px] max-w-[340px] z-50 animate-in fade-in slide-in-from-right-3 duration-200"
                  onMouseEnter={() => handleMouseEnter(itemId)}
                  onMouseLeave={handleMouseLeave}
                >
                  {/* Category Title Header */}
                  <div className="px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-wider text-[#8C3A27] border-b border-[#D4AF37]/20 flex items-center justify-between">
                    <span>{title}</span>
                    {getSocialIcon(platformName, "w-3.5 h-3.5")}
                  </div>

                  {/* Active Child Item Buttons with Authentic Brand Colors */}
                  {channels.map((channel, cIdx) => (
                    <a
                      key={cIdx}
                      href={channel.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={handleLinkClick}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white/90 hover:bg-[#6C1D18] text-stone-800 hover:text-white text-xs font-semibold shadow-xs transition-all duration-200 group/item cursor-pointer text-left"
                    >
                      {getSocialIcon(platformName, "w-4 h-4 shrink-0 transition-colors group-hover/item:text-white")}
                      <span className="truncate max-w-[260px] transition-colors group-hover/item:text-white">{channel.name}</span>
                      <ArrowUpRight className="w-3.5 h-3.5 ml-auto text-amber-600 group-hover/item:text-white opacity-70 group-hover/item:opacity-100 transition-all shrink-0" />
                    </a>
                  ))}

                </div>
              )}

            </div>
          );
        })}

      </div>
    </aside>
  );
}
