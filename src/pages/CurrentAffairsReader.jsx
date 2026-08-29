// src/pages/CurrentAffairsReader.jsx
// Native Current Affairs Editorial Reader Page with Markdown & PDF Support
import React, { useState } from 'react';
import { ArrowLeft, Calendar, Tag, Loader2, BookOpen, ShieldAlert, Maximize2, Download } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useCMSData } from '../hooks/useCMSData';

export function createSlug(text) {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

export function getDirectImageUrl(url) {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  if (trimmed.includes("drive.google.com")) {
    const match = trimmed.match(/\/d\/([a-zA-Z0-9_-]+)/) || trimmed.match(/id=([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1200`;
    }
  }
  return trimmed;
}

export function getSecondaryImageUrl(url) {
  if (!url || typeof url !== 'string') return null;
  if (url.includes("drive.google.com") || url.includes("id=")) {
    const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/) || url.match(/id=([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      return `https://lh3.googleusercontent.com/d/${match[1]}`;
    }
  }
  return url;
}

export function getDirectViewUrl(url) {
  if (!url || typeof url !== 'string') return '#';
  const trimmed = url.trim();
  if (trimmed.includes("drive.google.com")) {
    const match = trimmed.match(/\/d\/([a-zA-Z0-9_-]+)/) || trimmed.match(/id=([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      return `https://drive.google.com/file/d/${match[1]}/view?usp=sharing`;
    }
  }
  return trimmed;
}

export function getDirectDownloadUrl(url) {
  if (!url || typeof url !== 'string') return '#';
  const trimmed = url.trim();
  if (trimmed.includes("drive.google.com")) {
    const match = trimmed.match(/\/d\/([a-zA-Z0-9_-]+)/) || trimmed.match(/id=([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      return `https://drive.google.com/uc?export=download&id=${match[1]}`;
    }
  }
  return trimmed;
}

export function getEmbedUrl(url) {
  if (!url) return "";
  const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/) || url.match(/id=([a-zA-Z0-9_-]+)/);
  if (match && match[1]) {
    const fileId = match[1];
    // Universal Google Docs Embedded Viewer URL (Bypasses 3P Cookie & Domain DRM Blockers)
    return `https://docs.google.com/viewer?srcid=${fileId}&pid=explorer&efh=false&a=v&chrome=false&embedded=true`;
  }
  
  if (url.includes("docs.google.com") || url.includes("drive.google.com")) {
    return url;
  }

  return `https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`;
}

function formatEditorialHTML(rawHtml) {
  if (!rawHtml || typeof rawHtml !== 'string') return '';
  
  let formatted = rawHtml;
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

export default function CurrentAffairsReader({ slug, navigate }) {
  const { data, loading } = useCMSData();

  // Find matching article by slug or fallback to history.state
  const currentAffairsList = data?.currentAffairs || [];
  const articleFromState = window.history.state?.usr?.article || window.history.state?.article;

  const item = currentAffairsList.find(art => {
    const artTitle = art.Title || art.title || '';
    return createSlug(artTitle) === slug;
  }) || articleFromState || currentAffairsList[0];

  const title = item?.Title || item?.title || 'Current Affairs Editorial';
  const date = item?.Date || item?.date || 'Today';
  const category = item?.Category || item?.category || 'General Studies';
  const rawBanner = item?.Banner_Image || item?.banner_image || item?.Banner || item?.banner || item?.Image || item?.image;
  const bannerImage = getDirectImageUrl(rawBanner);
  const articleHTML = item?.Article_HTML || item?.article_html || item?.HTML_Content || item?.html_content || item?.Content_HTML || item?.content_html || item?.HTML || item?.html;
  const articleContent = articleHTML || item?.Article_Content || item?.article_content || item?.Content || item?.content || item?.Short_Summary || item?.short_summary || item?.Summary || item?.summary || '';
  const cleanHTML = articleHTML ? formatEditorialHTML(articleHTML) : '';
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
      className="min-h-screen bg-[#FFFDF8] text-[#221814] py-8 px-4 sm:px-6 lg:px-8 select-text"
    >
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Navigation & Header Bar */}
        <div className="bg-[#FAF6EE] p-5 sm:p-8 rounded-3xl border border-[#D5C3B0] shadow-sm space-y-5">
          
          {/* Breadcrumb Navigation */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigate('/blog')}
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-serif font-bold text-[#8C3A27] hover:text-[#732D1B] transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Daily Dispatches</span>
            </button>

            {/* Quick Share Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleWhatsAppShare}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#25D366]/10 hover:bg-[#25D366] text-[#128C7E] hover:text-white border border-[#25D366]/30 text-xs font-semibold transition-all cursor-pointer"
                title="Share on WhatsApp"
              >
                <FaWhatsapp className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={handleTelegramShare}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#229ED9]/10 hover:bg-[#229ED9] text-[#229ED9] hover:text-white border border-[#229ED9]/30 text-xs font-semibold transition-all cursor-pointer"
                title="Share on Telegram"
              >
                <FaTelegramPlane className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Telegram</span>
              </button>
            </div>
          </div>

          {/* Article Header Details */}
          <div className="space-y-3 pt-1 text-left">
            <div className="flex flex-wrap items-center gap-3 text-xs">
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

            <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#6C1D18] leading-tight">
              {title}
            </h1>
          </div>

        </div>

        {/* Hero Banner Image */}
        {bannerImage && (
          <div className="w-full overflow-hidden rounded-3xl border border-[#D5C3B0] shadow-lg max-h-[500px]">
            <img 
              src={bannerImage} 
              alt={title} 
              loading="eager"
              referrerPolicy="no-referrer"
              fetchPriority="high"
              decoding="async"
              className="w-full h-auto object-cover max-h-[500px] mx-auto"
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

        {/* Short Summary Lead */}
        {item?.Short_Summary && (
          <div className="p-5 sm:p-6 rounded-2xl bg-[#F4ECE1] border-l-4 border-[#8C3A27] text-[#3D3028] font-serif italic text-base md:text-lg leading-relaxed text-left shadow-xs">
            {item.Short_Summary}
          </div>
        )}

        {/* LOADING STATE */}
        {loading && (
          <div className="py-20 text-center space-y-3">
            <Loader2 className="w-10 h-10 text-[#8C3A27] animate-spin mx-auto" />
            <p className="text-sm font-serif italic text-[#7A6B5D] font-bold">
              Loading Editorial Analysis...
            </p>
          </div>
        )}

        {/* DIRECT GOOGLE DOC CMS ARTICLE HTML CONTENT / MARKDOWN FALLBACK */}
        {!loading && articleContent && (
          <div 
            className="bg-[#FAF6EE] p-6 sm:p-10 md:p-12 rounded-3xl border border-[#D5C3B0] shadow-sm text-left select-text"
          >
            {cleanHTML ? (
              <div 
                className="editorial-article-body prose prose-stone max-w-none text-stone-800 text-base md:text-lg leading-relaxed font-sans select-text [&_h1]:text-2xl sm:[&_h1]:text-3xl [&_h1]:font-bold [&_h1]:font-serif [&_h1]:text-[#6C1D18] [&_h1]:mt-8 [&_h1]:mb-4 [&_h1]:border-b [&_h1]:border-[#D5C3B0]/60 [&_h1]:pb-2 [&_h2]:text-xl sm:[&_h2]:text-2xl [&_h2]:font-bold [&_h2]:font-serif [&_h2]:text-[#6C1D18] [&_h2]:mt-7 [&_h2]:mb-3 [&_h2]:border-b [&_h2]:border-[#D5C3B0]/40 [&_h2]:pb-1.5 [&_h3]:text-lg sm:[&_h3]:text-xl [&_h3]:font-bold [&_h3]:font-serif [&_h3]:text-[#8B261E] [&_h3]:mt-6 [&_h3]:mb-2 [&_p]:mb-5 [&_p]:leading-relaxed [&_p]:text-[#2C221E] [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2 [&_ul]:mb-5 [&_ul]:text-[#3D3028] [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:space-y-2 [&_ol]:mb-5 [&_ol]:text-[#3D3028] [&_li]:leading-relaxed [&_strong]:font-bold [&_strong]:text-[#140C08] [&_b]:font-bold [&_b]:text-[#140C08] [&_blockquote]:border-l-4 [&_blockquote]:border-[#8C3A27] [&_blockquote]:pl-5 [&_blockquote]:italic [&_blockquote]:text-[#5C4028] [&_blockquote]:my-6 [&_blockquote]:bg-[#8C3A27]/5 [&_blockquote]:py-3 [&_blockquote]:pr-4 [&_blockquote]:rounded-r-xl [&_img]:rounded-2xl [&_img]:shadow-lg [&_img]:mx-auto [&_img]:my-6 [&_img]:max-h-[500px] [&_img]:object-contain [&_img]:block [&_table]:w-full [&_table]:border-collapse [&_table]:my-6 [&_table]:rounded-xl [&_table]:overflow-hidden [&_td]:border [&_td]:border-[#D5C3B0] [&_td]:p-3 [&_td]:text-sm [&_th]:border [&_th]:border-[#D5C3B0] [&_th]:p-3 [&_th]:bg-[#FAF6EE] [&_th]:font-bold [&_th]:text-[#6C1D18] [&_th]:text-sm"
                dangerouslySetInnerHTML={{ __html: cleanHTML }}
              />
            ) : (
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
                  {articleContent}
                </ReactMarkdown>
              </div>
            )}
          </div>
        )}

        {/* NOT FOUND FALLBACK STATE */}
        {!loading && !articleContent && (
          <div className="py-16 text-center space-y-4 max-w-lg mx-auto bg-[#FAF6EE] p-8 rounded-3xl border border-[#D5C3B0]">
            <ShieldAlert className="w-12 h-12 text-[#8C3A27] mx-auto opacity-80" />
            <h3 className="font-serif-header text-xl font-bold text-[#221814]">
              Analysis Coming Soon
            </h3>
            <p className="text-xs sm:text-sm font-serif italic text-[#5C4028] font-semibold">
              The full analytical briefing for this dispatch is being finalized by our editorial team.
            </p>
            <div>
              <button
                type="button"
                onClick={() => navigate('/blog')}
                className="btn-terracotta-pill text-xs py-3 px-6 font-serif font-bold cursor-pointer"
              >
                <span>Return to Daily Dispatches</span>
              </button>
            </div>
          </div>
        )}

        {/* Bottom Bar Actions */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-5 bg-[#FAF6EE] rounded-3xl border border-[#D5C3B0]">
          <button
            type="button"
            onClick={() => navigate('/blog')}
            className="btn-terracotta-outline-pill text-xs py-2.5 px-5 font-serif font-bold cursor-pointer"
          >
            <span>← Back to Current Affairs</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs font-serif font-bold text-[#7A6B5D]">Share:</span>
            <button
              type="button"
              onClick={handleWhatsAppShare}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#25D366]/10 hover:bg-[#25D366] text-[#128C7E] hover:text-white border border-[#25D366]/30 text-xs font-semibold transition-all cursor-pointer"
            >
              <FaWhatsapp className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>
            <button
              type="button"
              onClick={handleTelegramShare}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#229ED9]/10 hover:bg-[#229ED9] text-[#229ED9] hover:text-white border border-[#229ED9]/30 text-xs font-semibold transition-all cursor-pointer"
            >
              <FaTelegramPlane className="w-3.5 h-3.5" />
              <span>Telegram</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
