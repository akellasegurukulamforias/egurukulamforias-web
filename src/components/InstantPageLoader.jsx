import React from 'react';

/**
 * InstantPageLoader
 * 
 * Ultra-lightweight, zero-canvas, zero-CPU loading transition.
 * Replaces heavy 380-particle canvas simulations with:
 * 1. A slim 2.5px top-of-page gold & maroon progress bar.
 * 2. An elegant, subtle emblem shimmer pulse on cream parchment.
 * 3. Immediate 0ms unmount when isReady becomes true.
 */
export default function InstantPageLoader({
  isReady = false,
  label = 'Loading Content...',
  sublabel = 'e-Gurukulam for IAS • Tradition of Wisdom & Modern Rigor',
  fullScreen = true,
  minimal = false,
}) {
  // If data has arrived, paint immediately with zero artificial delay
  if (isReady) {
    return null;
  }

  // Minimal mode: Only render the slim top progress line (non-blocking)
  if (minimal) {
    return (
      <div className="fixed top-0 left-0 right-0 h-[2.5px] z-[9999] bg-[#E8DEC8] overflow-hidden pointer-events-none">
        <div 
          className="h-full bg-gradient-to-r from-[#D4AF37] via-[#8C3A27] to-[#D4AF37] animate-pulse"
          style={{
            width: '100%',
            backgroundSize: '200% 100%',
            animation: 'shimmerSlide 1.5s infinite linear'
          }}
        />
        <style>{`
          @keyframes shimmerSlide {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div
      className={`${
        fullScreen
          ? 'fixed inset-0 z-50 flex flex-col items-center justify-center'
          : 'relative w-full min-h-[360px] flex flex-col items-center justify-center'
      } bg-[#FCFAF6] select-none transition-opacity duration-200`}
      aria-live="polite"
      aria-busy="true"
    >
      {/* 1. Slim Top Progress Bar with Animated Shimmer */}
      <div className="fixed top-0 left-0 right-0 h-[2.5px] z-[9999] bg-[#E8DEC8] overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-[#D4AF37] via-[#8C3A27] to-[#D4AF37] animate-pulse"
          style={{
            width: '100%',
            backgroundSize: '200% 100%',
            animation: 'shimmerSlide 1.5s infinite linear'
          }}
        />
      </div>

      {/* 2. Center Stage: Subtle Emblem Pulse & Classical Typography */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-md space-y-4 animate-fade-in">
        {/* Emblem with subtle gold halo pulse */}
        <div className="relative flex items-center justify-center">
          <div className="absolute -inset-2.5 rounded-full bg-[#D4AF37]/15 animate-ping opacity-60 pointer-events-none" />
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#FFFDF8] border border-[#D4AF37]/40 shadow-sm flex items-center justify-center p-2">
            <img
              src="/favicon-512x512.png"
              alt="e-Gurukulam for IAS Emblem"
              className="w-full h-full object-contain"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
        </div>

        {/* Branding & Loading Status */}
        <div className="space-y-1.5 text-center">
          <p className="font-serif text-sm sm:text-base font-bold text-[#6C1D18] tracking-wide">
            {label}
          </p>
          {sublabel && (
            <p className="font-serif italic text-xs text-[#7A6B5D] max-w-xs mx-auto leading-relaxed">
              {sublabel}
            </p>
          )}
        </div>
      </div>

      <style>{`
        @keyframes shimmerSlide {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  );
}
