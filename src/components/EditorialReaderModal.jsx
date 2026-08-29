// src/components/EditorialReaderModal.jsx
// Apple-Grade Distraction-Free Rich-Text Editorial Reader Modal
import React, { useEffect } from 'react';
import { X, Calendar, Tag, Share2, BookOpen, ExternalLink, ArrowLeft } from 'lucide-react';
import { FaWhatsapp, FaTelegramPlane } from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';
import { getDirectImageUrl, getSecondaryImageUrl } from '../pages/CurrentAffairsReader';

/**
 * Clean & optimize raw Google Docs / CMS HTML for responsive, Apple-grade editorial rendering
 */
function formatEditorialHTML(rawHtml) {
  if (!rawHtml || typeof rawHtml !== 'string') return '';
  
  let formatted = rawHtml;

  // Ensure all <img> tags have referrerPolicy="no-referrer", loading="lazy", and responsive styling
  formatted = formatted.replace(/<img\s+([^>]*?)>/gi, (match, p1) => {
    let tag = p1;
    if (!/referrerpolicy/i.test(tag)) {
      tag += ' referrerpolicy="no-referrer"';
    }
    if (!/loading/i.test(tag)) {
      tag += ' loading="lazy"';
    }
    return `<img ${tag} class="rounded-2xl shadow-lg my-6 mx-auto max-w-full h-auto object-contain block border border-[#D5C3B0]/40" />`;
  });

  return formatted;
}

export default function EditorialReaderModal({ isOpen, onClose, article }) {
  // Close on ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !article) return null;

  const title = article.Title || article.title || 'Current Affairs Editorial Analysis';
  const date = article.Date || article.date || 'Today';
  const category = article.Category || article.category || 'General Studies';
  const rawBanner = article.Banner_Image || article.banner_image || article.Banner || article.banner || article.Image || article.image;
  const bannerImage = getDirectImageUrl(rawBanner);

  const rawHTML = 
    article.Article_HTML || 
    article.article_html || 
    article.HTML_Content || 
    article.html_content || 
    article.Content_HTML || 
    article.content_html || 
    article.HTML || 
    article.html;

  const fallbackText = 
    article.Article_Content || 
    article.article_content || 
    article.Content || 
    article.content || 
    article.Article || 
    article.article || 
    article.Short_Summary || 
    article.short_summary || 
    article.Summary || 
    article.summary || 
    '';

  const cleanHTML = rawHTML ? formatEditorialHTML(rawHTML) : '';
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareTitle = `${title} | e-Gurukulam for IAS`;

  const handleWhatsAppShare = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareTitle}\n\nRead full analysis at: ${shareUrl}`)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleTelegramShare = () => {
    const url = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md animate-fade-in select-text"
      onClick={onClose}
    >
      {/* Modal Container */}
      <div 
        className="relative w-full max-w-4xl max-h-[92vh] bg-[#FFFDF8] rounded-3xl shadow-2xl border border-[#D5C3B0] overflow-hidden flex flex-col text-left transition-all duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Header Bar */}
        <div className="sticky top-0 z-30 flex items-center justify-between px-5 sm:px-8 py-4 bg-[#FAF6EE]/95 backdrop-blur-md border-b border-[#D5C3B0]/60 flex-shrink-0">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
            {category && (
              <span className="inline-flex items-center gap-1.5 font-mono text-[#8C3A27] font-bold bg-[#8C3A27]/10 px-3 py-1 rounded-md border border-[#8C3A27]/20">
                <Tag className="w-3.5 h-3.5" />
                <span>{category}</span>
              </span>
            )}
            {date && (
              <span className="inline-flex items-center gap-1.5 font-serif text-[#7A6B5D] italic font-semibold">
                <Calendar className="w-3.5 h-3.5 text-[#8C3A27]" />
                <span>{date}</span>
              </span>
            )}
          </div>

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full bg-[#8C3A27]/10 hover:bg-[#8C3A27] text-[#8C3A27] hover:text-white transition-all cursor-pointer shadow-xs"
            aria-label="Close reader"
            title="Close (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Editorial Content Area */}
        <div className="overflow-y-auto px-5 sm:px-8 md:px-12 py-6 sm:py-8 space-y-6 scrollbar-thin scrollbar-thumb-[#8C3A27]/30 scrollbar-track-transparent">
          
          {/* Editorial Headline */}
          <h1 className="text-[#6C1D18] font-serif text-2xl sm:text-3xl md:text-4xl font-bold leading-tight tracking-tight">
            {title}
          </h1>

          {/* Hero Banner Image */}
          {bannerImage && (
            <div className="w-full overflow-hidden rounded-2xl border border-[#D5C3B0] shadow-md max-h-[440px] bg-black/5">
              <img 
                src={bannerImage} 
                alt={title} 
                loading="lazy"
                referrerPolicy="no-referrer"
                className="w-full h-auto object-cover max-h-[440px] mx-auto block"
                onError={(e) => {
                  const secondary = getSecondaryImageUrl(rawBanner);
                  if (secondary && e.target.src !== secondary) {
                    e.target.src = secondary;
                  } else {
                    e.target.onerror = null;
                    e.target.style.display = 'none';
                  }
                }}
              />
            </div>
          )}

          {/* Short Excerpt / Lead */}
          {article.Short_Summary && (
            <div className="p-4 sm:p-5 rounded-2xl bg-[#F4ECE1] border-l-4 border-[#8C3A27] text-[#3D3028] font-serif italic text-sm sm:text-base leading-relaxed">
              {article.Short_Summary}
            </div>
          )}

          {/* Rich Article Body */}
          {cleanHTML ? (
            <div 
              className="editorial-article-body prose prose-stone max-w-none text-stone-800 text-base md:text-lg leading-relaxed font-sans select-text [&_h1]:text-2xl sm:[&_h1]:text-3xl [&_h1]:font-bold [&_h1]:font-serif [&_h1]:text-[#6C1D18] [&_h1]:mt-8 [&_h1]:mb-4 [&_h1]:border-b [&_h1]:border-[#D5C3B0]/60 [&_h1]:pb-2 [&_h2]:text-xl sm:[&_h2]:text-2xl [&_h2]:font-bold [&_h2]:font-serif [&_h2]:text-[#6C1D18] [&_h2]:mt-7 [&_h2]:mb-3 [&_h2]:border-b [&_h2]:border-[#D5C3B0]/40 [&_h2]:pb-1.5 [&_h3]:text-lg sm:[&_h3]:text-xl [&_h3]:font-bold [&_h3]:font-serif [&_h3]:text-[#8B261E] [&_h3]:mt-6 [&_h3]:mb-2 [&_p]:mb-5 [&_p]:leading-relaxed [&_p]:text-[#2C221E] [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2 [&_ul]:mb-5 [&_ul]:text-[#3D3028] [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:space-y-2 [&_ol]:mb-5 [&_ol]:text-[#3D3028] [&_li]:leading-relaxed [&_strong]:font-bold [&_strong]:text-[#140C08] [&_b]:font-bold [&_b]:text-[#140C08] [&_blockquote]:border-l-4 [&_blockquote]:border-[#8C3A27] [&_blockquote]:pl-5 [&_blockquote]:italic [&_blockquote]:text-[#5C4028] [&_blockquote]:my-6 [&_blockquote]:bg-[#8C3A27]/5 [&_blockquote]:py-3 [&_blockquote]:pr-4 [&_blockquote]:rounded-r-xl [&_img]:rounded-2xl [&_img]:shadow-lg [&_img]:mx-auto [&_img]:my-6 [&_img]:max-h-[500px] [&_img]:object-contain [&_img]:block [&_table]:w-full [&_table]:border-collapse [&_table]:my-6 [&_table]:rounded-xl [&_table]:overflow-hidden [&_td]:border [&_td]:border-[#D5C3B0] [&_td]:p-3 [&_td]:text-sm [&_th]:border [&_th]:border-[#D5C3B0] [&_th]:p-3 [&_th]:bg-[#FAF6EE] [&_th]:font-bold [&_th]:text-[#6C1D18] [&_th]:text-sm"
              dangerouslySetInnerHTML={{ __html: cleanHTML }}
            />
          ) : fallbackText ? (
            <div className="editorial-article-body prose prose-stone max-w-none text-[#2C221E] text-base md:text-lg leading-relaxed font-sans select-text">
              <ReactMarkdown
                components={{
                  h2: ({node, ...props}) => <h2 className="text-xl sm:text-2xl font-bold font-serif text-[#6C1D18] mt-8 mb-4 border-b border-[#D5C3B0]/60 pb-2" {...props} />,
                  h3: ({node, ...props}) => <h3 className="text-lg sm:text-xl font-semibold font-serif text-[#8B261E] mt-6 mb-3" {...props} />,
                  ul: ({node, ...props}) => <ul className="list-disc pl-6 space-y-2 mb-5 text-[#3D3028]" {...props} />,
                  ol: ({node, ...props}) => <ol className="list-decimal pl-6 space-y-2 mb-5 text-[#3D3028]" {...props} />,
                  p: ({node, ...props}) => <p className="my-4 text-[#2C221E] leading-relaxed" {...props} />,
                  strong: ({node, ...props}) => <strong className="font-bold text-[#140C08]" {...props} />,
                  blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-[#8C3A27] pl-5 italic text-[#5C4028] my-6 bg-[#8C3A27]/5 py-3 pr-4 rounded-r-xl" {...props} />,
                  img: ({node, ...props}) => {
                    const src = getDirectImageUrl(props.src);
                    return (
                      <figure className="my-6 flex flex-col items-center">
                        <img 
                          {...props} 
                          src={src}
                          className="rounded-2xl shadow-lg max-h-[500px] w-auto border border-[#D5C3B0] mx-auto my-4 object-contain block" 
                          loading="lazy" 
                          referrerPolicy="no-referrer"
                        />
                        {props.alt && <figcaption className="text-xs text-[#7A6B5D] mt-2 italic font-serif text-center">{props.alt}</figcaption>}
                      </figure>
                    );
                  }
                }}
              >
                {fallbackText}
              </ReactMarkdown>
            </div>
          ) : (
            <div className="py-12 text-center text-stone-500 font-serif italic">
              Full editorial analysis content is being updated.
            </div>
          )}

        </div>

        {/* Sticky Actions Footer */}
        <div className="sticky bottom-0 z-30 px-5 sm:px-8 py-3.5 bg-[#FAF6EE] border-t border-[#D5C3B0]/60 flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-serif font-bold text-[#7A6B5D] hidden sm:inline">
              Share Analysis:
            </span>
            
            {/* WhatsApp Share Button */}
            <button
              type="button"
              onClick={handleWhatsAppShare}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#25D366]/10 hover:bg-[#25D366] text-[#128C7E] hover:text-white border border-[#25D366]/30 text-xs font-semibold transition-all cursor-pointer"
              title="Share on WhatsApp"
            >
              <FaWhatsapp className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>

            {/* Telegram Share Button */}
            <button
              type="button"
              onClick={handleTelegramShare}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#229ED9]/10 hover:bg-[#229ED9] text-[#229ED9] hover:text-white border border-[#229ED9]/30 text-xs font-semibold transition-all cursor-pointer"
              title="Share on Telegram"
            >
              <FaTelegramPlane className="w-3.5 h-3.5" />
              <span>Telegram</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="btn-terracotta-outline-pill text-xs py-2 px-5 font-serif font-bold cursor-pointer ml-auto"
          >
            <span>Close Reader</span>
          </button>
        </div>

      </div>
    </div>
  );
}
