// src/components/PdfViewerModal.jsx
// Secure In-Page PDF Reader Component with In-App Fullscreen Toggle & Security Shield
import React, { useRef, useState, useEffect } from 'react';
import { X, Shield, Lock, Maximize2, Minimize2 } from 'lucide-react';

export function formatPdfPreviewUrl(url) {
  if (!url) return '';
  
  // Extract Google Drive ID if present
  const driveMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/) || url.match(/id=([a-zA-Z0-9_-]+)/);
  if (driveMatch && driveMatch[1]) {
    const fileId = driveMatch[1];
    return `https://docs.google.com/viewer?srcid=${fileId}&pid=explorer&efh=false&a=v&chrome=false&embedded=true`;
  }
  
  if (url.includes("docs.google.com") || url.includes("drive.google.com")) {
    return url;
  }

  return `https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`;
}

export default function PdfViewerModal({ isOpen, onClose, pdfUrl, title, pdfTitle }) {
  const containerRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const displayTitle = title || pdfTitle || "Protected Current Affairs PDF";

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch((err) => console.log(err));
    } else {
      document.exitFullscreen().catch((err) => console.log(err));
    }
  };

  if (!isOpen || !pdfUrl) return null;

  const cleanEmbedUrl = formatPdfPreviewUrl(pdfUrl);

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-2 md:p-4 text-[#221814] select-none"
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal / Fullscreen Viewer Container */}
      <div 
        ref={containerRef}
        className={`relative z-10 w-full bg-[#1e1e1e] flex flex-col transition-all duration-300 rounded-2xl overflow-hidden border border-stone-700 shadow-2xl ${
          isFullscreen ? "h-screen w-screen rounded-none border-none p-0" : "max-w-5xl h-[88vh]"
        }`}
      >
        {/* Custom Header Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#2A1810] border-b border-[#3D251A] text-white shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-1.5 rounded-lg bg-[#3D251A] text-amber-400 shrink-0">
              <Lock className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-amber-500 font-bold text-xs uppercase tracking-wider shrink-0 font-mono">
                📄 DAILY DISPATCH READER
              </span>
              <span className="text-stone-400 text-xs hidden md:inline shrink-0">|</span>
              <span className="text-stone-200 text-sm font-medium truncate max-w-[240px] sm:max-w-[360px] md:max-w-md">
                {displayTitle}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Fullscreen Button */}
            <button
              type="button"
              onClick={toggleFullscreen}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold transition border border-stone-600 shadow-xs cursor-pointer"
              title={isFullscreen ? "Exit Fullscreen" : "View Fullscreen"}
            >
              {isFullscreen ? (
                <>
                  <Minimize2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>⤓ Exit Fullscreen</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>⤢ Fullscreen</span>
                </>
              )}
            </button>

            {/* Close Modal Button */}
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg bg-[#6C1D18] hover:bg-[#8B261E] text-white text-xs font-semibold transition cursor-pointer flex items-center gap-1 shadow-xs"
            >
              <X className="w-3.5 h-3.5" />
              <span>Close</span>
            </button>
          </div>
        </div>

        {/* PDF Stream Viewport */}
        <div 
          className="relative flex-1 w-full h-full bg-[#181818] overflow-hidden select-none" 
          onContextMenu={(e) => e.preventDefault()}
        >
          {/* Security Corner Shield: Blocks clicks to Google's "Pop-out / Open in Drive" icon */}
          <div 
            className="absolute top-0 right-0 w-28 h-14 z-30 bg-transparent cursor-default" 
            title="Protected In-App Document" 
          />

          {/* Locked iFrame with referrerPolicy */}
          <iframe
            src={cleanEmbedUrl}
            className="w-full h-full border-0"
            title={displayTitle || "Current Affairs Document"}
            loading="eager"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </div>
  );
}
