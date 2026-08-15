import React, { useState, useEffect } from 'react';
import { Monitor, Smartphone, X, Sparkles, ArrowRight } from 'lucide-react';

export default function DesktopViewPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      // Strictly detect actual mobile hardware / User Agent (Android, iOS, mobile devices)
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
      
      // Explicitly check for desktop Operating Systems (Windows, Mac, Linux/Unix)
      const isDesktopOS = /Windows|Macintosh|Mac OS X|Linux x86_64|Linux i686/i.test(userAgent) && !/Android/i.test(userAgent);

      // ONLY show prompt on GENUINE mobile devices with screen width < 1024px
      // NEVER trigger on Desktop Chrome/Edge/Firefox even when resized
      if (isMobileUA && !isDesktopOS && window.innerWidth < 1024) {
        setShowPrompt(true);
      } else {
        setShowPrompt(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleDismiss = () => {
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
      onClick={handleDismiss}
    >
      
      <div 
        className="relative w-full max-w-[340px] sm:max-w-md max-h-[85vh] overflow-y-auto bg-[#FAF6EE] rounded-3xl border-2 border-[#8C3A27]/40 shadow-2xl p-5 sm:p-7 text-center space-y-4 sm:space-y-5 card-parchment-3d mx-auto my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Close X Button */}
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 p-1.5 sm:p-2 rounded-full bg-[#8C3A27]/10 hover:bg-[#8C3A27]/20 text-[#8C3A27] transition-colors cursor-pointer z-10"
          aria-label="Close message"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* Top Emblem / Icon Header */}
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-[#8C3A27] to-[#732D1B] text-[#FFE8B3] flex items-center justify-center mx-auto shadow-lg border-2 border-[#C5A059]/40 relative mt-1">
          <Monitor className="w-7 h-7 sm:w-8 sm:h-8" />
          <div className="absolute -bottom-1 -right-1 bg-[#C5A059] text-[#140C08] p-1 rounded-full shadow-md">
            <Sparkles className="w-3 h-3" />
          </div>
        </div>

        {/* Content Section */}
        <div className="space-y-2 sm:space-y-3">
          <span className="text-[10px] font-serif uppercase tracking-widest font-extrabold text-[#8C3A27] bg-[#8C3A27]/10 px-3 py-0.5 rounded-full inline-block border border-[#8C3A27]/20">
            OPTIMAL VIEWING EXPERIENCE
          </span>

          <h3 className="font-serif-header text-xl sm:text-2xl font-extrabold text-[#221814] leading-snug">
            Best Viewed in Desktop Mode
          </h3>

          <p className="text-xs text-[#3D3028] font-sans font-medium leading-relaxed max-w-xs sm:max-w-sm mx-auto">
            To experience the full richness of e-Gurukulam's interactive scrollytelling, high-resolution study notes, and 3D parchment visual architecture, we recommend viewing on a <strong>desktop, laptop, or tablet screen</strong>.
          </p>
        </div>

        {/* Quick Desktop Mode Instructions Box (Collapsible) */}
        {!showGuide ? (
          <div className="bg-[#F4ECE1] p-3 sm:p-4 rounded-2xl border border-[#D5C3B0]/60 space-y-1 text-left text-xs font-sans text-[#3D3028]">
            <div className="flex items-center justify-between font-serif font-bold text-[#8C3A27]">
              <span className="flex items-center gap-1">
                <Smartphone className="w-3.5 h-3.5" />
                <span>On Mobile Right Now?</span>
              </span>
              <button 
                onClick={() => setShowGuide(true)}
                className="text-[10px] sm:text-[11px] underline font-sans font-semibold hover:text-[#221814]"
              >
                How to enable Desktop Mode ➔
              </button>
            </div>
            <p className="text-[10px] sm:text-[11px] text-[#5A4D41]">
              You can easily enable <strong>“Desktop Site”</strong> in Chrome, Safari, or Brave browser settings for full resolution.
            </p>
          </div>
        ) : (
          <div className="bg-[#F4ECE1] p-3 sm:p-4 rounded-2xl border border-[#8C3A27]/40 space-y-1.5 text-left text-xs font-sans text-[#3D3028] animate-fade-in">
            <div className="flex items-center justify-between font-serif font-bold text-[#8C3A27]">
              <span className="text-xs">Quick Guide to Enable Desktop Site:</span>
              <button onClick={() => setShowGuide(false)} className="text-[10px] text-[#7A6B5D] hover:underline">Close Tip</button>
            </div>
            <ol className="list-decimal list-inside space-y-0.5 text-[10px] sm:text-[11px] text-[#221814] font-medium">
              <li>Tap the <strong>3 dots (⋮)</strong> or <strong>AA icon</strong> in your browser menu.</li>
              <li>Select <strong>“Desktop Site”</strong> or <strong>“Request Desktop Website”</strong>.</li>
              <li>The page will automatically reload in high-definition desktop layout!</li>
            </ol>
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-1">
          <button
            onClick={handleDismiss}
            className="w-full btn-terracotta-pill text-xs py-3 px-5 font-serif font-bold shadow-md hover:shadow-xl transition-all justify-center cursor-pointer"
          >
            <span>CONTINUE ON MOBILE SITE</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </button>
        </div>

      </div>

    </div>
  );
}
