import React, { useState, useMemo, useEffect } from 'react';
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
import { sortCurrentAffairsByDate, formatDisplayDate } from '../utils/dateUtils';
import { 
  createSlug, 
  getDirectImageUrl, 
  getSecondaryImageUrl 
} from './CurrentAffairsReader';
import RisingDawnLoader from '../components/RisingDawnLoader';

/**
 * Safely decode URI components without throwing URIError on malformed sequences
 */
function safeDecode(val) {
  if (!val || typeof val !== 'string') return '';
  try {
    return decodeURIComponent(val);
  } catch (e) {
    try {
      return unescape(val);
    } catch (err) {
      return val;
    }
  }
}

/**
 * Clean and optimize raw HTML for high-fidelity native editorial typography
 * Wrapped in try/catch with fallback to raw content
 */
function cleanDocHtml(rawHtml) {
  if (!rawHtml || typeof rawHtml !== 'string') return '';

  try {
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

    // 4. Convert Google Docs title/subtitle paragraphs or centered headers (including text-center classes) into consistent editorial headings
    html = html.replace(/<p[^>]*class=["'][^"']*\b(?:title|subtitle|header|headline)\b[^"']*["'][^>]*>\s*(?:<b>|<strong>)?([\s\S]*?)(?:<\/b>|<\/strong>)?\s*<\/p>/gi, '<h2 class="editorial-heading-divider text-center">$1</h2>');
    html = html.replace(/<p[^>]*(?:text-align:\s*center|align=["']center["']|\btext-center\b)[^>]*>\s*(?:<b>|<strong>)?([\s\S]*?)(?:<\/b>|<\/strong>)?\s*<\/p>/gi, '<h2 class="editorial-heading-divider text-center">$1</h2>');

    // 5. Convert standalone bold/strong heading questions or section labels into styled subheadings with divider lines
    html = html.replace(/<p[^>]*>\s*(?:<b>|<strong>|<span[^>]*font-weight[^>]*>)\s*([^<]{3,140}?(?:\?|:)?)\s*(?:<\/b>|<\/strong>|<\/span>)\s*<\/p>/gi, '<h3 class="editorial-subheading">$1</h3>');

    // 6. Ensure all images are responsive, centered, have shadow, and load with referrerPolicy="no-referrer"
    html = html.replace(/<img\s+([^>]*?)>/gi, (match, attributes) => {
      let cleanAttrs = attributes || '';
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
  } catch (err) {
    console.warn("cleanDocHtml parsing encountered an error, falling back to safe content:", err);
    return String(rawHtml).replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  }
}

/**
 * Estimate reading time in minutes based on word count
 */
function estimateReadingTime(content) {
  try {
    if (!content || typeof content !== 'string') return '3 min read';
    const cleanText = content.replace(/<[^>]*>/g, ' ');
    const words = cleanText.trim().split(/\s+/).filter(Boolean).length;
    const minutes = Math.max(1, Math.ceil(words / 200));
    return `${minutes} min read`;
  } catch (e) {
    return '3 min read';
  }
}

// Helper to normalize string keys by stripping non-alphanumeric characters
const normalizeKey = (str) => String(str || '').toLowerCase().replace(/[^a-z0-9]/g, '');

export default function CurrentAffairsDetailPage({ slug, navigate }) {
  const { data, loading: cmsLoading, isFetched: cmsFetched } = useCMSData();

  // 1. Explicit Loading & Fetched States (starts as true by default)
  const [isLoading, setIsLoading] = useState(true);
  const [isFetched, setIsFetched] = useState(false);

  // 2. Catching Route Hydration Delays: If router query/slug is not yet hydrated, remain in loading state
  const rawSlug = slug || '';
  const decodedSlug = safeDecode(rawSlug);
  const isRouterReady = Boolean(rawSlug && typeof rawSlug === 'string' && rawSlug.trim().length > 0);

  // Support both data?.articles and data?.currentAffairs with safe nullish fallback
  const rawArticles = Array.isArray(data?.articles)
    ? data.articles
    : Array.isArray(data?.currentAffairs)
      ? data.currentAffairs
      : [];

  // Sorted list of articles (latest first)
  const sortedArticles = useMemo(() => {
    return sortCurrentAffairsByDate(rawArticles.filter(item => item && typeof item === 'object'));
  }, [rawArticles]);

  const targetSlug = rawSlug;
  const targetDecoded = decodedSlug;
  const targetNorm = normalizeKey(targetDecoded || targetSlug);

  // Resilient article matching: decoded slug, raw slug, generated slug, normalized title, or docId
  const currentIndex = useMemo(() => {
    if (!isRouterReady || !sortedArticles || sortedArticles.length === 0) return -1;
    return sortedArticles.findIndex(art => {
      if (!art || typeof art !== 'object') return false;
      const artTitle = art?.Title || art?.title || '';
      const artRawSlug = art?.Slug || art?.slug || '';
      const artDecodedSlug = safeDecode(artRawSlug);
      const artGeneratedSlug = createSlug(artTitle);
      const docId = art?.docId || art?.Doc_ID || art?.id || '';

      return Boolean(
        (artDecodedSlug && targetDecoded && artDecodedSlug.toLowerCase() === targetDecoded.toLowerCase()) ||
        (artRawSlug && targetSlug && artRawSlug.toLowerCase() === targetSlug.toLowerCase()) ||
        (artGeneratedSlug && targetDecoded && artGeneratedSlug.toLowerCase() === targetDecoded.toLowerCase()) ||
        (artGeneratedSlug && targetSlug && artGeneratedSlug.toLowerCase() === targetSlug.toLowerCase()) ||
        (targetNorm && normalizeKey(artRawSlug) === targetNorm) ||
        (targetNorm && normalizeKey(artTitle) === targetNorm) ||
        (targetNorm && docId && normalizeKey(docId) === targetNorm)
      );
    });
  }, [isRouterReady, sortedArticles, targetSlug, targetDecoded, targetNorm]);

  const article = currentIndex !== -1 ? sortedArticles[currentIndex] : null;

  // Unconditionally declared at top level before any early returns:
  const categoryBadges = useMemo(() => {
    const rawCategory = article?.Category || article?.category;
    if (!rawCategory) return [];
    return String(rawCategory)
      .split(/[|\n]+/)
      .map(c => c.trim())
      .filter(Boolean);
  }, [article?.Category, article?.category]);

  // 1. State Initialization: Reset isLoading(true) and isFetched(false) when slug changes
  useEffect(() => {
    setIsLoading(true);
    setIsFetched(false);
  }, [slug]);

  // 2. Explicit Route Resolution Guard & Catching Route Hydration Delays
  useEffect(() => {
    if (!isRouterReady) {
      setIsLoading(true);
      setIsFetched(false);
      return;
    }

    if (article) {
      setIsLoading(false);
      setIsFetched(true);
    } else if (!cmsLoading && cmsFetched) {
      setIsLoading(false);
      setIsFetched(true);
    } else {
      setIsLoading(true);
      setIsFetched(false);
    }
  }, [isRouterReady, article, cmsLoading, cmsFetched]);

  // Sync document title & trigger GA4 page view when article loads
  useEffect(() => {
    if (article) {
      const docTitle = article?.Title || article?.title || 'Current Affairs';
      document.title = `${docTitle} | e-Gurukulam for IAS`;
      if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
        window.gtag('config', 'G-T5W96019N1', {
          page_path: window.location.pathname,
          page_location: window.location.href,
          page_title: document.title,
        });
      }
    }
  }, [article]);

  // Intercept clicks on internal links within article HTML to prevent full page reloads
  const handleContentClick = (e) => {
    const anchor = e.target.closest('a');
    if (!anchor) return;

    const href = anchor.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;

    try {
      const url = new URL(href, window.location.origin);
      const isInternal = 
        url.origin === window.location.origin || 
        url.hostname.includes('egurukulamforias') ||
        url.hostname === 'localhost' ||
        url.hostname === '127.0.0.1';

      if (isInternal) {
        e.preventDefault();
        const targetPath = url.pathname + url.search + url.hash;
        navigate(targetPath);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err) {
      if (href.startsWith('/')) {
        e.preventDefault();
        navigate(href);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const navigateToArticle = (art) => {
    if (!art || typeof art !== 'object') return;
    const artTitle = art?.Title || art?.title || 'Current Affairs';
    const rawArtSlug = art?.Slug || art?.slug || createSlug(artTitle);
    const decodedArtSlug = safeDecode(rawArtSlug) || createSlug(artTitle);
    navigate(`/current-affairs/${encodeURIComponent(decodedArtSlug)}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 1. GLOBAL ROUTE GUARD: BRANDED RISING DAWN / LIGHT LOADER WHILE DATA IS HYDRATING
  // If router query/slug is not yet hydrated (isRouterReady === false), remain in loading state
  // If actively loading or fetch not settled, return branded rising light/dawn loader
  if (!isRouterReady || isLoading || !isFetched) {
    return (
      <RisingDawnLoader
        isReady={false}
        label="Hydrating Editorial Dispatch..."
        sublabel="e-Gurukulam for IAS • The Dawn of Knowledge"
        fullScreen={true}
      />
    );
  }

  // 2. DISPATCH NOT FOUND STATE (STRICT INVARIANT: ONLY AFTER CMS QUERY IS FULLY COMPLETE)
  if (isFetched && !isLoading && !article) {
    return (
      <div className="min-h-screen bg-[#FFFDF8] text-[#221814] py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl mx-auto space-y-6 text-center bg-[#FAF6EE] p-8 sm:p-12 rounded-3xl border border-[#D5C3B0] shadow-sm">
          <ShieldAlert className="w-12 h-12 text-[#8C3A27] mx-auto opacity-80" />
          <h2 className="font-serif-header text-2xl sm:text-3xl font-extrabold text-[#221814]">
            {sortedArticles.length === 0 ? "No Current Affairs published yet" : "Dispatch Not Found"}
          </h2>
          <p className="text-xs sm:text-sm font-serif italic text-[#5C4028] font-semibold leading-relaxed">
            {sortedArticles.length === 0 
              ? "We are currently preparing today's analytical dispatches. Please check back shortly." 
              : "The requested Current Affairs article could not be located or may have been archived."}
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

  // Defensive fallback: If article is not yet loaded or is undefined, return branded loader
  if (!article) {
    return (
      <RisingDawnLoader
        isReady={false}
        label="Hydrating Editorial Dispatch..."
        sublabel="e-Gurukulam for IAS • The Dawn of Knowledge"
        fullScreen={true}
      />
    );
  }

  // ONLY REACHED ONCE ARTICLE IS GUARANTEED TO BE LOADED AND NON-NULL:
  // Extract article fields safely with optional chaining and safe defaults
  const title = article?.Title || article?.title || 'Current Affairs';
  const date = formatDisplayDate(article?.Date || article?.date) || '';
  const category = article?.Category || article?.category || 'General Studies';
  const rawBanner = article?.Banner_Image || article?.banner_image || article?.Banner || article?.banner || article?.Image || article?.image;
  const bannerImage = getDirectImageUrl(rawBanner);
  const shortSummary = article?.Short_Summary || article?.short_summary || article?.Summary || article?.summary || article?.Description || article?.description || '';

  // Safe tags handling: array or string with safe default
  const rawTags = article?.tags || article?.Tags;
  const tags = Array.isArray(rawTags)
    ? rawTags
    : typeof rawTags === 'string'
      ? rawTags.split(',').map(t => t.trim()).filter(Boolean)
      : [];

  // Extract static Full_Content payload safely
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

  const prevArticle = currentIndex > 0 && sortedArticles[currentIndex - 1] ? sortedArticles[currentIndex - 1] : null;
  const nextArticle = currentIndex >= 0 && currentIndex < sortedArticles.length - 1 && sortedArticles[currentIndex + 1] ? sortedArticles[currentIndex + 1] : null;

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
          <div className="flex items-center gap-2 text-xs flex-wrap">
            {categoryBadges.map((cat, idx) => (
              <span key={idx} className="inline-flex items-center gap-1.5 font-mono text-[#8C3A27] font-bold bg-[#8C3A27]/10 px-3 py-1 rounded-md border border-[#8C3A27]/20">
                <Tag className="w-3.5 h-3.5" />
                <span>{cat}</span>
              </span>
            ))}
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
            {tags?.map((t, idx) => (
              <span key={idx} className="inline-flex items-center font-mono text-[#8C3A27] font-semibold bg-[#8C3A27]/10 px-2.5 py-1 rounded-md text-xs border border-[#8C3A27]/20">
                #{t}
              </span>
            ))}
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

        {/* 5. FULL ARTICLE CONTENT CONTAINER WITH PROSE & UNCONSTRAINED SPACING */}
        {fullContentHtml ? (
          <div 
            className="doc-article-content editorial-article-body prose prose-stone max-w-none text-stone-800 text-base md:text-lg leading-relaxed font-sans select-text my-8 [&_h1]:text-2xl sm:[&_h1]:text-3xl [&_h1]:font-bold [&_h1]:font-serif [&_h1]:text-[#6C1D18] [&_h1]:mt-8 [&_h1]:mb-4 [&_h1]:border-b [&_h1]:border-[#D5C3B0]/60 [&_h1]:pb-2 [&_h2]:text-xl sm:[&_h2]:text-2xl [&_h2]:font-bold [&_h2]:font-serif [&_h2]:text-[#6C1D18] [&_h2]:mt-7 [&_h2]:mb-3 [&_h2]:border-b [&_h2]:border-[#D5C3B0]/40 [&_h2]:pb-1.5 [&_h3]:text-lg sm:[&_h3]:text-xl [&_h3]:font-bold [&_h3]:font-serif [&_h3]:text-[#8B261E] [&_h3]:mt-6 [&_h3]:mb-2 [&_p]:mb-5 [&_p]:leading-relaxed [&_p]:text-[#2C221E] [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2 [&_ul]:mb-5 [&_ul]:text-[#3D3028] [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:space-y-2 [&_ol]:mb-5 [&_ol]:text-[#3D3028] [&_li]:leading-relaxed [&_strong]:font-bold [&_strong]:text-[#140C08] [&_b]:font-bold [&_b]:text-[#140C08] [&_blockquote]:border-l-4 [&_blockquote]:border-[#8C3A27] [&_blockquote]:pl-5 [&_blockquote]:italic [&_blockquote]:text-[#5C4028] [&_blockquote]:my-6 [&_blockquote]:bg-[#8C3A27]/5 [&_blockquote]:py-3 [&_blockquote]:pr-4 [&_blockquote]:rounded-r-xl [&_img]:rounded-2xl [&_img]:shadow-lg [&_img]:mx-auto [&_img]:my-6 [&_img]:max-h-[500px] [&_img]:object-contain [&_img]:block [&_img]:border [&_img]:border-[#D5C3B0]/40 [&_table]:w-full [&_table]:border-collapse [&_table]:my-6 [&_table]:rounded-xl [&_table]:overflow-hidden [&_td]:border [&_td]:border-[#D5C3B0] [&_td]:p-3 [&_td]:text-sm [&_th]:border [&_th]:border-[#D5C3B0] [&_th]:p-3 [&_th]:bg-[#FAF6EE] [&_th]:font-bold [&_th]:text-[#6C1D18] [&_th]:text-sm [&_a]:text-[#8C3A27] hover:[&_a]:text-[#6C1D18] [&_a]:underline [&_a]:underline-offset-2"
            dangerouslySetInnerHTML={{ __html: fullContentHtml }} 
            onClick={handleContentClick}
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
                title={prevArticle?.Title || prevArticle?.title || 'Previous Dispatch'}
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
                  {nextArticle?.Title || nextArticle?.title || 'Next Dispatch'}
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
