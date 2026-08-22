import React, { useState, useEffect } from "react";

export default function AnnouncementPopup({ activePopup, isOpen: externalIsOpen, onClose }) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (externalIsOpen !== undefined && externalIsOpen !== null) {
      setIsOpen(externalIsOpen);
    }
  }, [externalIsOpen]);

  useEffect(() => {
    if (!activePopup) return;

    const checkAndShow = () => {
      const lastClosed = sessionStorage.getItem("egk_popup_closed_time");
      const fiveMinutes = 5 * 60 * 1000;

      // If never closed, or 5 minutes have passed since last close
      if (!lastClosed || Date.now() - Number(lastClosed) > fiveMinutes) {
        setIsOpen(true);
      }
    };

    // Trigger 2 seconds after page load
    const timer = setTimeout(checkAndShow, 2000);

    // Re-check every 5 minutes
    const interval = setInterval(checkAndShow, 5 * 60 * 1000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [activePopup]);

  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.setItem("egk_popup_closed_time", String(Date.now()));
    if (onClose) onClose();
  };

  if (!isOpen || !activePopup) return null;

  // Helper to convert Google Drive viewing links into direct high-resolution image URLs
  const getDirectImageUrl = (url) => {
    if (!url) return null;
    if (typeof url !== 'string') return url;
    if (url.includes("drive.google.com")) {
      const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/) || url.match(/id=([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        return `https://lh3.googleusercontent.com/d/${match[1]}`;
      }
    }
    return url;
  };

  // Extract poster image link safely across varying case keys
  const rawPosterLink =
    activePopup.Poster_Image_Link ||
    activePopup.poster_image_link ||
    activePopup.Poster_Link ||
    activePopup.poster_link ||
    activePopup.Poster ||
    activePopup.poster ||
    activePopup.Image ||
    activePopup.image;

  const posterLink = getDirectImageUrl(rawPosterLink);
  const headline = activePopup.Headline || activePopup.headline || activePopup.Title || activePopup.title;
  const actionLink = activePopup.Link || activePopup.link || activePopup.URL || activePopup.url;

  // If no image and no headline, do not show
  if (!posterLink && !headline) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      {/* Backdrop click to close */}
      <div className="absolute inset-0" onClick={handleClose} />

      <div className="relative z-10 max-w-md w-full bg-[#FAF5EE] border border-[#EAE0D5] rounded-2xl shadow-2xl overflow-hidden p-3 text-center">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 z-20 bg-black/70 hover:bg-black text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shadow-lg transition cursor-pointer"
          aria-label="Close Announcement"
        >
          ✕
        </button>

        {/* Poster Image Container */}
        {posterLink ? (
          <div className="w-full min-h-[300px] flex items-center justify-center mb-3 rounded-xl overflow-hidden bg-neutral-100/60">
            <img
              src={posterLink}
              alt={headline || "Announcement Poster"}
              fetchPriority="high"
              decoding="async"
              className="w-full h-auto max-h-[75vh] object-contain rounded-xl"
              onError={(e) => {
                e.target.onerror = null;
                e.target.style.display = 'none';
              }}
            />
          </div>
        ) : null}

        {/* Headline */}
        {headline && (
          <h3 className="text-sm md:text-base font-bold text-[#6C1D18] px-2 py-1 leading-snug">
            {headline}
          </h3>
        )}

        {/* Optional Action Button if link provided */}
        {actionLink && actionLink.trim() !== '' ? (
          <a
            href={actionLink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleClose}
            className="inline-block mt-2 bg-[#6C1D18] hover:bg-[#531511] text-white text-sm font-semibold px-6 py-2 rounded-lg transition"
          >
            Learn More
          </a>
        ) : null}
      </div>
    </div>
  );
}
