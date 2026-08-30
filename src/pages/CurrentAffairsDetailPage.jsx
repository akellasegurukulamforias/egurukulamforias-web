// src/pages/CurrentAffairsDetailPage.jsx
// Dedicated Current Affairs Article Page with Exact Layout Fidelity, SPA Direct-Link Loading & Academic Typography
import React, { useMemo } from 'react';
import { 
  ArrowLeft, 
  Calendar, 
  Tag, 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  ShieldAlert,
  Loader2,
  BookOpen
} from 'lucide-react';
import { useCMSData } from '../hooks/useCMSData';
import { sortCurrentAffairsByDate } from '../utils/dateUtils';
import { 
  createSlug, 
  getDirectImageUrl, 
  getSecondaryImageUrl 
} from './CurrentAffairsReader';

/**
 * Clean and optimize raw HTML for high-fidelity native editorial typography
 */
function cleanDocHtml(rawHtml) {
  if (!rawHtml || typeof rawHtml !== 'string') return '';

  let html = rawHtml;

  // 1. Extract inner body content if a complete HTML page is provided
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  if (bodyMatch && bodyMatch[1]) {
    html = bodyMatch[1];
  }

  // 2. Strip <style> and <script> blocks to preserve our master typography
  html = html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  html = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');

  // 3. Remove Google's redirection wrappers
  html = html.replace(/href=["']https:\/\/www\.google\.com\/url\?q=([^&"']+)[^"']*["']/gi, (match, dest) => {
    try {
      return `href="${decodeURIComponent(dest)}" target="_blank" rel="noopener noreferrer"`;
    } catch (e) {
      return `href="${dest}" target="_blank" rel="noopener noreferrer"`;
    }
  });

  // 4. Convert Google Docs title/subtitle paragraphs or centered headers into consistent editorial headings
  html = html.replace(/<p[^>]*class=["'][^"']*\b(?:title|subtitle|header|headline)\b[^"']*["'][^>]*>([\s\S]*?)<\/p>/gi, '<h2 class="editorial-heading-divider text-center">$1</h2>');
  html = html.replace(/<p[^>]*(?:text-align:\s*center|align=["']center["'])[^>]*>([\s\S]*?)<\/p>/gi, '<h2 class="editorial-heading-divider text-center">$1</h2>');

  // 5. Convert standalone bold/strong heading questions or section labels (e.g. "What is Cloudburst?", "Syllabus Areas:", etc.) into styled subheadings with divider lines
  html = html.replace(/<p[^>]*>\s*(?:<b>|<strong>|<span[^>]*font-weight[^>]*>)\s*([^<]{3,120}?(?:\?|:))\s*(?:<\/b>|<\/strong>|<\/span>)\s*<\/p>/gi, '<h3 class="editorial-subheading">$1</h3>');

  // 6. Ensure all images are responsive, centered, have shadow, and load with referrerPolicy="no-referrer"
  html = html.replace(/<img\s+([^>]*?)>/gi, (match, attributes) => {
    let cleanAttrs = attributes;
    cleanAttrs = cleanAttrs.replace(/\b(width|height)=["'][^"']*["']/gi, '');
    
    if (!/referrerpolicy/i.test(cleanAttrs)) {
      cleanAttrs += ' referrerpolicy="no-referrer"';
    }
    if (!/loading/i.test(cleanAttrs)) {
      cleanAttrs += ' loading="lazy"';
    }

    return `<img ${cleanAttrs} class="max-w-full rounded-2xl shadow-md my-6 mx-auto block object-contain border border-[#D5C3B0]/40" />`;
  });

  // 7. Clean empty paragraph tags
  html = html.replace(/<p[^>]*>\s*(?:&nbsp;|<br\s*\/?>|\s)*<\/p>/gi, '');

  return html;
}

/**
 * Estimate reading time in minutes based on word count
 */
function estimateReadingTime(content) {
  if (!content || typeof content !== 'string') return '3 min read';
  const cleanText = content.replace(/<[^>]*>/g, ' ');
  const words = cleanText.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min read`;
}

export default function CurrentAffairsDetailPage({ slug, navigate }) {
  const { data, loading: cmsLoading } = useCMSData();

  // Sorted list of articles (latest first)
  const sortedArticles = useMemo(() => {
    return sortCurrentAffairsByDate(data?.currentAffairs || []);
  }, [data?.currentAffairs]);

  const normalizedSlug = useMemo(() => {
    return (slug || '').trim().toLowerCase();
  }, [slug]);

  // Find matching article index and item by slug
  const currentIndex = useMemo(() => {
    if (!sortedArticles || sortedArticles.length === 0) return -1;
    return sortedArticles.findIndex(art => {
      const artTitle = art.Title || art.title || '';
      const artSlug = (art.Slug || art.slug || createSlug(artTitle)).trim().toLowerCase();
      return artSlug === normalizedSlug || createSlug(artTitle).toLowerCase() === normalizedSlug;
    });
  }, [sortedArticles, normalizedSlug]);

  const article = currentIndex !== -1 ? sortedArticles[currentIndex] : null;
  const prevArticle = currentIndex > 0 ? sortedArticles[currentIndex - 1] : null;
  const nextArticle = currentIndex >= 0 && currentIndex < sortedArticles.length - 1 ? sortedArticles[currentIndex + 1] : null;

  // Extract article fields
  const title = article?.Title || article?.title || 'Current Affairs Editorial Analysis';
  const date = article?.Date || article?.date || 'Today';
  const category = article?.Category || article?.category || 'General Studies';
  const rawBanner = article?.Banner_Image || article?.banner_image || article?.Banner || article?.banner || article?.Image || article?.image;
  const bannerImage = getDirectImageUrl(rawBanner);
  const shortSummary = article?.Short_Summary || article?.short_summary || article?.Summary || article?.summary || article?.Description || article?.description || '';

  // Extract static Full_Content payload
  const rawFullContent = 
    article?.Full_Content || 
    article?.full_content || 
    article?.Article_HTML || 
    article?.article_html || 
    article?.HTML_Content || 
    article?.html_content || 
    article?.Content_HTML || 
    article?.content_html || 
    article?.HTML || 
    article?.html || 
    article?.Content || 
    article?.content || 
    article?.Article || 
    article?.article || 
    '';

  const fullContentHtml = rawFullContent ? cleanDocHtml(rawFullContent) : '';
  const readingTime = estimateReadingTime(fullContentHtml || shortSummary);

  const navigateToArticle = (art) => {
    if (!art) return;
    const artTitle = art.Title || art.title || '';
    const artSlug = art.Slug || art.slug || createSlug(artTitle);
    navigate(`/current-affairs/${artSlug}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 1. SKELETON LOADER FOR DIRECT DEEP-LINK ENTRANCE (WHILE CMS DATA IS LOADING)
  if (cmsLoading && !article) {
    return (
      <div className="min-h-screen bg-[#FFFDF8] text-[#221814] py-12 px-4 sm:px-6 lg:px-8 select-text">
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in text-left">
          {/* Top Sticky Breadcrumb Placeholder */}
          <div className="bg-[#FAF6EE] p-5 sm:p-6 rounded-3xl border border-[#D5C3B0] shadow-sm flex items-center justify-between">
            <div className="h-4 bg-[#D5C3B0]/40 rounded-md w-36 animate-pulse"></div>
            <div className="h-4 bg-[#D5C3B0]/30 rounded-md w-24 animate-pulse"></div>
          </div>

          {/* Title Placeholder */}
          <div className="space-y-3 pb-6 border-b border-[#D5C3B0]/60 animate-pulse">
            <div className="h-8 sm:h-12 bg-[#D5C3B0]/50 rounded-xl w-4/5"></div>
            <div className="h-6 sm:h-8 bg-[#D5C3B0]/30 rounded-xl w-2/3"></div>
          </div>

          {/* Hero Banner Placeholder */}
          <div className="w-full h-64 sm:h-96 rounded-3xl bg-[#D5C3B0]/20 border border-[#D5C3B0] animate-pulse flex items-center justify-center">
            <div className="flex items-center gap-2.5 text-xs font-serif italic text-[#8C3A27] font-bold">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Loading daily editorial analysis...</span>
            </div>
          </div>

          {/* Summary Box Placeholder */}
          <div className="p-6 rounded-2xl bg-[#F4ECE1] border-l-4 border-[#8C3A27] space-y-2 animate-pulse">
            <div className="h-4 bg-[#D5C3B0]/40 rounded-md w-full"></div>
            <div className="h-4 bg-[#D5C3B0]/40 rounded-md w-5/6"></div>
          </div>

          {/* Multi-Paragraph Shimmer */}
          <div className="space-y-4 pt-4 animate-pulse">
            <div className="h-6 bg-[#D5C3B0]/40 rounded-md w-1/3 my-4"></div>
            <div className="h-4 bg-[#D5C3B0]/30 rounded-md w-full"></div>
            <div className="h-4 bg-[#D5C3B0]/30 rounded-md w-11/12"></div>
            <div className="h-4 bg-[#D5C3B0]/30 rounded-md w-4/5"></div>
          </div>
        </div>
      </div>
    );
  }

  // 2. DISPATCH NOT FOUND STATE (ONCE CMS FETCH HAS COMPLETED AND SLUG DOES NOT MATCH)
  if (!cmsLoading && !article) {
    return (
      <div className="min-h-screen bg-[#FFFDF8] text-[#221814] py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl mx-auto space-y-6 text-center bg-[#FAF6EE] p-8 sm:p-12 rounded-3xl border border-[#D5C3B0] shadow-sm">
          <ShieldAlert className="w-12 h-12 text-[#8C3A27] mx-auto opacity-80" />
          <h2 className="font-serif-header text-2xl sm:text-3xl font-extrabold text-[#221814]">
            Dispatch Not Found
          </h2>
          <p className="text-xs sm:text-sm font-serif italic text-[#5C4028] font-semibold leading-relaxed">
            The requested Current Affairs article could not be located or may have been archived.
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => navigate('/blog')}
              className="btn-terracotta-pill text-xs py-3 px-6 font-serif font-bold cursor-pointer inline-flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Current Affairs</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. FULL EDITORIAL DISPATCH VIEW
  return (
    <div className="min-h-screen bg-[#FFFDF8] text-[#221814] py-12 px-4 sm:px-6 lg:px-8 select-text">
      <div className="max-w-4xl mx-auto space-y-8 animate-fade-in text-left">
        
        {/* 1. STICKY "← Back to Current Affairs" NAVIGATION BAR */}
        <div className="sticky top-16 z-20 bg-[#FAF6EE]/95 backdrop-blur-md p-4 sm:p-5 rounded-3xl border border-[#D5C3B0] shadow-sm flex flex-wrap items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => navigate('/blog')}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-serif font-bold text-[#8C3A27] hover:text-[#732D1B] transition-colors cursor-pointer group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Current Affairs</span>
          </button>

          {/* Badges: Category tags & Date */}
          <div className="flex items-center gap-2 text-xs">
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
            <span className="inline-flex items-center gap-1.5 font-mono text-[#7A6B5D] font-medium bg-[#140C08]/5 px-2.5 py-0.5 rounded-md hidden sm:inline-flex">
              <Clock className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>{readingTime}</span>
            </span>
          </div>
        </div>

        {/* 2. TITLE: BOLD BURGUNDY SERIF HEADLINE */}
        <h1 className="text-[#6C1D18] font-serif text-3xl md:text-5xl font-bold mb-6 pb-6 border-b border-[#D5C3B0]/60 leading-tight tracking-tight">
          {title}
        </h1>

        {/* 3. HERO BANNER IMAGE */}
        {bannerImage && (
          <div className="w-full overflow-hidden rounded-3xl border border-[#D5C3B0] shadow-xl max-h-[480px] bg-black/5">
            <img 
              src={bannerImage} 
              alt={title} 
              loading="lazy"
              referrerPolicy="no-referrer"
              className="w-full h-auto object-cover max-h-[480px] mx-auto block"
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

        {/* 4. SUMMARY HIGHLIGHT CONTAINER */}
        {shortSummary && (
          <div className="p-5 sm:p-6 rounded-2xl bg-[#F4ECE1] border-l-4 border-[#8C3A27] text-[#3D3028] font-serif italic text-base sm:text-lg leading-relaxed shadow-2xs">
            {shortSummary}
          </div>
        )}

        {/* 5. FULL ARTICLE CONTENT CONTAINER WITH UNCONSTRAINED PARAGRAPH & LIST SPACING */}
        {fullContentHtml ? (
          <div 
            className="doc-article-content max-w-none text-stone-800 font-sans leading-relaxed my-8 [&_ul]:pl-6 [&_ul]:space-y-2 [&_li]:list-disc [&_li]:pl-1"
            dangerouslySetInnerHTML={{ __html: fullContentHtml }} 
          />
        ) : (
          <div className="py-12 text-center space-y-3 bg-[#FAF6EE] p-8 rounded-3xl border border-[#D5C3B0]">
            <ShieldAlert className="w-10 h-10 text-[#8C3A27] mx-auto opacity-80" />
            <h3 className="font-serif-header text-xl font-bold text-[#221814]">
              Analysis Briefing Finalizing
            </h3>
            <p className="text-xs sm:text-sm font-serif italic text-[#5C4028] font-semibold">
              The full analytical briefing for this dispatch is being finalized by our editorial board.
            </p>
          </div>
        )}

        {/* 6. BOTTOM NAVIGATION (SINGLE LINE: ALL CURRENT AFFAIRS + READ NEXT) */}
        <div className="bg-[#FAF6EE] p-5 sm:p-6 rounded-3xl border border-[#D5C3B0] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Left: All Daily Current Affairs Return Button */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => navigate('/blog')}
              className="btn-terracotta-outline-pill text-xs py-2.5 px-6 font-serif font-bold cursor-pointer shrink-0 w-full sm:w-auto"
            >
              <span>← All Daily Current Affairs</span>
            </button>

            {prevArticle && (
              <button
                type="button"
                onClick={() => navigateToArticle(prevArticle)}
                className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-[#FFFDF8] border border-[#D5C3B0]/60 hover:border-[#8C3A27] transition-all group cursor-pointer text-xs font-serif font-bold text-[#221814] hover:text-[#8C3A27]"
                title={prevArticle.Title || prevArticle.title}
              >
                <ChevronLeft className="w-4 h-4 text-[#8C3A27] group-hover:-translate-x-0.5 transition-transform" />
                <span>Previous</span>
              </button>
            )}
          </div>

          {/* Right: READ NEXT Card */}
          {nextArticle && (
            <button
              type="button"
              onClick={() => navigateToArticle(nextArticle)}
              className="flex items-center justify-end text-right gap-3 p-3 sm:p-3.5 px-5 rounded-2xl bg-[#FFFDF8] border border-[#D5C3B0]/60 hover:border-[#8C3A27] transition-all group cursor-pointer w-full sm:w-auto max-w-md shadow-2xs hover:shadow-xs sm:ml-auto"
            >
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono uppercase font-bold text-[#8C3A27] tracking-wider block">
                  READ NEXT
                </span>
                <p className="text-xs sm:text-sm font-serif font-bold text-[#221814] line-clamp-1 group-hover:text-[#8C3A27] transition-colors">
                  {nextArticle.Title || nextArticle.title}
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-[#8C3A27] shrink-0 group-hover:translate-x-1 transition-transform" />
            </button>
          )}

        </div>

      </div>
    </div>
  );
}
