import React, { useState, useMemo, useEffect } from 'react';
import { 
  ArrowLeft, 
  Calendar, 
  Tag, 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  ShieldAlert,
  BookOpen,
  RefreshCw
} from 'lucide-react';
import { useCMSData } from '../hooks/useCMSData';
import { getCachedCMSData, LOCAL_STORAGE_KEY, formatDateToYMD, isCMSNetworkFetched, forceRefreshCMSData, fetchCMSData } from '../services/cmsService';
import { sortCurrentAffairsByDate, formatDisplayDate } from '../utils/dateUtils';
import { 
  createSlug, 
  getDirectImageUrl, 
  getSecondaryImageUrl 
} from '../utils/urlUtils';
import Link from '../components/Link';

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
 * Safe sessionStorage / localStorage cached article reader (reads official egk_cms_data_v7 cache first)
 */
function getCachedArticles() {
  if (typeof window === 'undefined') return [];
  // 1. Direct official CMS Cache from cmsService (0ms synchronous read of localStorage 'egk_cms_data_v7')
  try {
    const cmsData = getCachedCMSData();
    if (cmsData && typeof cmsData === 'object') {
      if (Array.isArray(cmsData.currentAffairs) && cmsData.currentAffairs.length > 0) {
        return cmsData.currentAffairs;
      }
      if (Array.isArray(cmsData.articles) && cmsData.articles.length > 0) {
        return cmsData.articles;
      }
    }
  } catch (e) {}

  // 2. Direct read of LOCAL_STORAGE_KEY or 'egk_cms_data_v7'
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY) || localStorage.getItem('egk_cms_data_v7');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed?.currentAffairs)) return parsed.currentAffairs;
      if (Array.isArray(parsed?.articles)) return parsed.articles;
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {}

  // 3. Fallbacks to session/local storage
  try {
    const sessionData = sessionStorage.getItem('cms_data') || sessionStorage.getItem('current_affairs_cache') || sessionStorage.getItem('cms_articles');
    if (sessionData) {
      const parsed = JSON.parse(sessionData);
      if (Array.isArray(parsed)) return parsed;
      if (Array.isArray(parsed?.articles)) return parsed.articles;
      if (Array.isArray(parsed?.currentAffairs)) return parsed.currentAffairs;
    }
  } catch (e) {}
  try {
    const localData = localStorage.getItem('cms_data') || localStorage.getItem('current_affairs_cache') || localStorage.getItem('cms_articles');
    if (localData) {
      const parsed = JSON.parse(localData);
      if (Array.isArray(parsed)) return parsed;
      if (Array.isArray(parsed?.articles)) return parsed.articles;
      if (Array.isArray(parsed?.currentAffairs)) return parsed.currentAffairs;
    }
  } catch (e) {}
  return [];
}

const normalizeKey = (str) => String(str || '').toLowerCase().replace(/[^a-z0-9]/g, '');

/**
 * Canonical slug normalizer utilizing application's authoritative createSlug()
 */
function normalizeSlug(value) {
  if (!value || typeof value !== 'string') return '';
  const decoded = safeDecode(value).trim();
  return createSlug(decoded)
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-');
}

/**
 * Resilient, authoritative article matcher by canonical normalized slug, ID, or title
 */
function matchArticleInList(articles, targetSlug) {
  if (!Array.isArray(articles) || articles.length === 0 || !targetSlug) return null;
  const normalizedTarget = normalizeSlug(targetSlug);
  if (!normalizedTarget) return null;
  const alphaTarget = normalizedTarget.replace(/[^a-z0-9]/g, '');

  for (const article of articles) {
    if (!article || typeof article !== 'object') continue;

    const articleSlug = article.Slug ?? article.slug;
    const articleId = article.id ?? article.Id ?? article.docId ?? article.Doc_ID;
    const articleTitle = article.Title ?? article.title;

    // 1. Exact normalized slug match (Highest Priority)
    if (articleSlug) {
      const normSlug = normalizeSlug(articleSlug);
      if (normSlug === normalizedTarget) {
        return article;
      }
      // Alphanumeric bridge for hyphen/apostrophe variation (e.g. india-s-path vs indias-path)
      if (alphaTarget && normSlug.replace(/[^a-z0-9]/g, '') === alphaTarget) {
        return article;
      }
    }

    // 2. ID match (if direct URL uses article ID)
    if (articleId != null) {
      const strId = String(articleId).trim().toLowerCase();
      if (strId === normalizedTarget || strId === String(targetSlug).trim().toLowerCase()) {
        return article;
      }
    }

    // 3. Title fallback match (if article lacks slug or URL was generated from Title)
    if (articleTitle) {
      const normTitle = normalizeSlug(articleTitle);
      if (normTitle === normalizedTarget) {
        return article;
      }
      if (alphaTarget && normTitle.replace(/[^a-z0-9]/g, '') === alphaTarget) {
        return article;
      }
    }
  }

  return null;
}

const findMatchingArticle = matchArticleInList;
/**
 * Synchronous resolution of article from props, router navigation state, window memory, or session/local storage
 */
function getImmediateArticle({ slug, propArticle, initialArticle, item }) {
  const rawSlug = slug || '';

  // 1. Direct props
  const directProp = propArticle || initialArticle || item;
  if (directProp && typeof directProp === 'object') {
    if (!rawSlug || findMatchingArticle([directProp], rawSlug)) {
      return directProp;
    }
  }

  // 2. Direct official CMS Cache from LocalStorage ('egk_cms_data_v7') for 0ms instant load
  const storedArticles = getCachedArticles();
  if (storedArticles.length > 0) {
    const foundStored = findMatchingArticle(storedArticles, rawSlug);
    if (foundStored) return foundStored;
  }

  // 3. Navigation / router history state
  if (typeof window !== 'undefined') {
    const historyArt = 
      window.history?.state?.usr?.article || 
      window.history?.state?.article || 
      window.history?.state?.usr?.item || 
      window.history?.state?.item;
    if (historyArt && typeof historyArt === 'object') {
      if (!rawSlug || findMatchingArticle([historyArt], rawSlug)) {
        return historyArt;
      }
    }
  }

  // 4. Window global memory cache
  if (typeof window !== 'undefined') {
    const memList = [
      ...(Array.isArray(window.__CURRENT_AFFAIRS_CACHE__) ? window.__CURRENT_AFFAIRS_CACHE__ : []),
      ...(Array.isArray(window.CMS_DATA?.articles) ? window.CMS_DATA.articles : []),
      ...(Array.isArray(window.CMS_DATA?.currentAffairs) ? window.CMS_DATA.currentAffairs : []),
      ...(Array.isArray(window.__CMS_DATA__?.articles) ? window.__CMS_DATA__.articles : []),
      ...(Array.isArray(window.__CMS_DATA__?.currentAffairs) ? window.__CMS_DATA__.currentAffairs : [])
    ];
    if (memList.length > 0) {
      const foundMem = findMatchingArticle(memList, rawSlug);
      if (foundMem) return foundMem;
    }
  }

  return null;
}

/**
 * Clean and optimize raw HTML for high-fidelity native editorial typography.
 * Strips script/style tags, unwraps Google redirect links, ensures responsive images,
 * demotes misplaced GS Paper headers to body text, and converts section title paragraphs into semantic <h2> tags.
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

    // 2. Strip <style> and <script> blocks, inline event handlers, and javascript: URIs for XSS defense
    html = html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
    html = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
    html = html.replace(/\s+on[a-z]+\s*=\s*(?:'[^']*'|"[^"]*"|[^\s>]+)/gi, '');
    html = html.replace(/(href|src)\s*=\s*["']\s*javascript:[^"']*["']/gi, '$1="#"');

    // 3. Remove Google's redirection wrappers
    html = html.replace(/href=["']https:\/\/www\.google\.com\/url\?q=([^&"']+)[^"']*["']/gi, (match, dest) => {
      try {
        return `href="${decodeURIComponent(dest)}" target="_blank" rel="noopener noreferrer"`;
      } catch (e) {
        return `href="${dest}" target="_blank" rel="noopener noreferrer"`;
      }
    });

    // 4. Demote any <h2> (or <h1-h6>) tags containing GS Paper / GS syllabus lines to plain <p>
    html = html.replace(/<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/gi, (match, inner) => {
      const plain = inner.replace(/<[^>]*>/g, '').trim();
      if (/^GS\s+(?:Paper\s+)?(?:I|II|III|IV|\d+)/i.test(plain) || /^GS\s+[I|V|X]+/i.test(plain)) {
        let textOnly = inner.replace(/<div[\s\S]*?<\/div>/gi, '').replace(/<img[\s\S]*?>/gi, '').trim();
        let extra = '';
        const divMatch = inner.match(/<div[\s\S]*?<\/div>/gi);
        if (divMatch) extra += divMatch.join('');
        const imgMatch = inner.match(/<img[^>]*>/gi);
        if (imgMatch && !divMatch) extra += imgMatch.join('');

        return `<p class="gs-paper-line">${textOnly}</p>${extra}`;
      }
      return match;
    });

    // 5. Clean existing <h2> tags: strip <strong> / <b> inside existing <h2> so font-serif and maroon color apply cleanly
    html = html.replace(/<h2([^>]*)>([\s\S]*?)<\/h2>/gi, (match, attrs, inner) => {
      const cleanInner = inner.replace(/<\/?(?:b|strong)[^>]*>/gi, '').trim();
      return `<h2${attrs}>${cleanInner}</h2>`;
    });

    // 6. Convert section title paragraphs to unified <h2> tags:
    html = html.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, (match, inner) => {
      const plain = inner.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
      if (!plain) return '';

      // NEVER convert bullet points or metadata fields
      if (/^[·•\-\*]/.test(plain)) return match;
      if (/^(?:Ministry|Nodal Institution|Introduced|Launched|Purpose|UPSC Linkage|Other Number|Area|Origin|Started):/i.test(plain)) return match;

      // NEVER convert "Also Read" blocks
      if (/^Also\s+Read/i.test(plain)) return match;

      // NEVER convert GS Paper lines
      if (/^GS\s+(?:Paper\s+)?(?:I|II|III|IV|\d+)/i.test(plain) || /^GS\s+[I|V|X]+/i.test(plain)) return match;

      // Syllabus Areas heading: always normalize to semantic <h2>
      if (/^Syllabus\s+areas?:?/i.test(plain) && plain.length < 35) {
        const colonText = plain.endsWith(':') ? plain : `${plain}:`;
        return `<h2>${colonText}</h2>`;
      }

      // Check if paragraph contains <strong> or <b>
      const hasStrong = /<(?:b|strong)[^>]*>[\s\S]*?<\/(?:b|strong)>/i.test(inner);
      if (!hasStrong) return match;

      // Numbered section heading (e.g., "1. Major National Helplines in India", "1. 1930 – National Cyber Crime Helpline", "2. 14567 – Elderline")
      const isNumberedTitle = /^\d+\.\s+[\s\S]+/i.test(plain) && plain.length < 100 && !plain.endsWith('.') && !inner.includes('<br');

      // Fully bold title paragraphs (e.g. "Important Helpline Numbers...", "1098 – CHILDLINE...", "BRICS: India's Vision")
      const unbolded = inner.replace(/<(?:b|strong)[^>]*>[\s\S]*?<\/(?:b|strong)>/gi, '')
                            .replace(/<[^>]*>/g, '')
                            .replace(/[\s\d\.\–\-\:\,\']/g, '');
      const isBoldTitle = unbolded.length === 0 && plain.length > 2 && plain.length < 100 && !plain.endsWith('.');

      if (isNumberedTitle || isBoldTitle) {
        // Wrap entire line in <h2> without inner tags to guarantee unified maroon styling
        return `<h2>${plain}</h2>`;
      }

      return match;
    });

    // 7. Ensure all images are responsive, centered, preserve aspect ratio attributes, and load safely
    html = html.replace(/<img\s+([^>]*?)>/gi, (match, attributes) => {
      let cleanAttrs = attributes || '';
      
      if (!/referrerpolicy/i.test(cleanAttrs)) {
        cleanAttrs += ' referrerpolicy="no-referrer"';
      }
      if (!/loading/i.test(cleanAttrs)) {
        cleanAttrs += ' loading="lazy"';
      }

      return `<img ${cleanAttrs} class="max-w-full h-auto rounded-2xl shadow-md my-6 mx-auto block object-contain border border-[#D5C3B0]/40" />`;
    });

    // 8. Wrap any raw <table> elements with responsive, non-overflowing scroll container
    html = html.replace(/<table([^>]*)>([\s\S]*?)<\/table>/gi, (match, attrs, inner) => {
      return `<div class="w-full overflow-x-auto my-6 rounded-xl border border-[#D5C3B0]/40 shadow-2xs"><table${attrs} class="w-full min-w-full border-collapse">${inner}</table></div>`;
    });

    // 9. Clean empty paragraph tags
    html = html.replace(/<p[^>]*>\s*(?:&nbsp;|<br\s*\/?>|\s)*<\/p>/gi, '');

    return html;
  } catch (err) {
    console.warn("cleanDocHtml parsing encountered an error, falling back to safe content:", err);
    return String(rawHtml).replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '').replace(/\s+on[a-z]+\s*=\s*(?:'[^']*'|"[^"]*"|[^\s>]+)/gi, '');
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

export default function CurrentAffairsDetailPage({ slug: propSlug, id: propId, navigate, article: propArticle, initialArticle, item }) {
  const { data, loading: cmsLoading, isFetched: cmsFetched } = useCMSData();

  // Extract target slug directly from props OR URL path fallback
  const pathSlug = typeof window !== 'undefined' ? window.location.pathname.split('/').filter(Boolean).pop() : '';
  const rawTarget = propSlug || propId || pathSlug || '';
  const targetSlug = safeDecode(rawTarget).trim().toLowerCase();

  // Instant synchronous resolution if article already exists in props, router state, or local cache
  const immediateArticle = useMemo(() => {
    return getImmediateArticle({ slug: targetSlug, propArticle, initialArticle, item });
  }, [targetSlug, propArticle, initialArticle, item]);

  // Single authoritative state: resolved article + not found flag
  const [article, setArticle] = useState(immediateArticle);
  const [isNotFound, setIsNotFound] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  // Support both data?.articles and data?.currentAffairs with safe nullish fallback
  const rawArticles = Array.isArray(data?.articles)
    ? data.articles
    : Array.isArray(data?.currentAffairs)
      ? data.currentAffairs
      : [];

  // Sorted list of articles (latest first) - authoritative collection already displaying on page
  const sortedArticles = useMemo(() => {
    return sortCurrentAffairsByDate(rawArticles.filter(item => item && typeof item === 'object'));
  }, [rawArticles]);

  // Single authoritative resolver effect
  useEffect(() => {
    let isMounted = true;

    async function resolveTargetArticle() {
      if (!targetSlug) {
        if (isMounted) setIsNotFound(true);
        return;
      }

      // 1. If we already have the matching article in state, preserve it (never nullify!)
      if (article && matchArticleInList([article], targetSlug)) {
        return;
      }

      // 2. Check cached articles (0ms check)
      const cached = getCachedArticles();
      if (cached.length > 0) {
        const cachedMatch = matchArticleInList(cached, targetSlug);
        if (cachedMatch) {
          if (isMounted) {
            setArticle(cachedMatch);
            setIsNotFound(false);
          }
          return;
        }
      }

      // 3. Match against CMS collection (sortedArticles from useCMSData)
      if (sortedArticles.length > 0) {
        console.log('[CurrentAffairsDetail] targetSlug:', targetSlug);
        console.log('[CurrentAffairsDetail] CMS articles count:', sortedArticles.length);
        console.log(
          '[CurrentAffairsDetail] CMS slugs:',
          sortedArticles.map(a => ({
            slug: a.slug,
            Slug: a.Slug,
            title: a.title,
            Title: a.Title,
            id: a.id,
            Id: a.Id
          }))
        );

        const found = matchArticleInList(sortedArticles, targetSlug);
        console.log('[CurrentAffairsDetail] Matched result:', found ? (found.Title || found.title || found.slug) : null);

        if (found) {
          if (isMounted) {
            setArticle(found);
            setIsNotFound(false);
          }
          return;
        }

        // If not found in current collection but live network fetch is still pending, keep waiting in loading state
        if (!isCMSNetworkFetched() || cmsLoading || !cmsFetched) {
          return;
        }

        // Live network fetch has completed, but article wasn't found in sortedArticles.
        // Attempt a direct fetch safeguard to be 100% sure before marking not-found
        try {
          const freshData = await fetchCMSData(true);
          const liveList = (freshData && (freshData.currentAffairs || freshData.articles)) || [];
          const match = matchArticleInList(liveList, targetSlug);
          if (match && isMounted) {
            setArticle(match);
            setIsNotFound(false);
            return;
          }
        } catch (err) {
          console.warn('[CMS Sync] Direct fetch safeguard encountered error:', err);
        }

        if (isMounted) {
          setIsNotFound(true);
        }
        return;
      }

      // 4. If sortedArticles is currently empty:
      // While useCMSData is still loading / not fetched / network pending, keep loading!
      if (cmsLoading || !cmsFetched || !isCMSNetworkFetched()) {
        return;
      }

      // 5. If live CMS fetch completed with zero items, attempt direct fetch as safeguard
      try {
        const freshData = await fetchCMSData(true);
        const liveList = (freshData && (freshData.currentAffairs || freshData.articles)) || [];
        const match = matchArticleInList(liveList, targetSlug);
        if (match && isMounted) {
          setArticle(match);
          setIsNotFound(false);
          return;
        }
      } catch (err) {
        console.warn('[CMS Sync] Direct fetch safeguard encountered error:', err);
      }

      if (isMounted) {
        setIsNotFound(true);
      }
    }

    resolveTargetArticle();

    return () => {
      isMounted = false;
    };
  }, [targetSlug, sortedArticles, cmsFetched, cmsLoading, article]);

  // Resilient article index matching
  const currentIndex = useMemo(() => {
    if (!sortedArticles || sortedArticles.length === 0) return -1;
    const artToMatch = article;
    if (artToMatch) {
      const artId = String(artToMatch?.id || artToMatch?.Id || artToMatch?.docId || artToMatch?.Doc_ID || '').toLowerCase().trim();
      const artSlug = (artToMatch?.Slug || artToMatch?.slug || '').toLowerCase().trim();
      const idx = sortedArticles.findIndex(a => {
        if (!a || typeof a !== 'object') return false;
        const aId = String(a?.id || a?.Id || a?.docId || a?.Doc_ID || '').toLowerCase().trim();
        const aSlug = (a?.Slug || a?.slug || '').toLowerCase().trim();
        if (artId && aId && artId === aId) return true;
        if (artSlug && aSlug && artSlug === aSlug) return true;
        return false;
      });
      if (idx !== -1) return idx;
    }
    return -1;
  }, [sortedArticles, article]);

  // Manual retry handler
  const handleManualRetry = async () => {
    setIsRetrying(true);
    setIsNotFound(false);
    try {
      const freshData = await fetchCMSData(true);
      const liveList = (freshData && (freshData.currentAffairs || freshData.articles)) || [];
      const match = matchArticleInList(liveList, targetSlug);
      if (match) {
        setArticle(match);
        setIsNotFound(false);
      } else {
        setIsNotFound(true);
      }
    } catch (err) {
      console.warn('[CMS Sync] Manual force refresh failed:', err);
      setIsNotFound(true);
    } finally {
      setIsRetrying(false);
    }
  };

  // Persist resolved article to window memory cache for instant reads
  useEffect(() => {
    if (article && typeof window !== 'undefined') {
      window.__CURRENT_AFFAIRS_CACHE__ = window.__CURRENT_AFFAIRS_CACHE__ || [];
      if (!window.__CURRENT_AFFAIRS_CACHE__.some(a => (a.id && a.id === article.id) || (a.Slug && a.Slug === article.Slug))) {
        window.__CURRENT_AFFAIRS_CACHE__.push(article);
      }
    }
  }, [article]);

  // Unconditionally declared at top level before any early returns:
  const categoryBadges = useMemo(() => {
    if (!article) return [];
    const rawCategory = article?.Category || article?.category;
    if (!rawCategory) return [];
    return String(rawCategory)
      .split(/[|\n]+/)
      .map(c => c.trim())
      .filter(Boolean);
  }, [article?.Category, article?.category]);

  // Extract core syllabus topics and tags for query fan-out
  const fanOutTopics = useMemo(() => {
    if (!article) return [];
    const set = new Set();

    // 1. Categories
    categoryBadges.forEach(c => {
      if (c && c.length < 50) set.add(c);
    });

    // 2. Direct article tags
    const rawT = article?.tags || article?.Tags;
    const artT = Array.isArray(rawT) 
      ? rawT 
      : typeof rawT === 'string' 
        ? rawT.split(',').map(t => t.trim()).filter(Boolean) 
        : [];
    artT.forEach(t => {
      if (t && t.length < 50) set.add(t);
    });

    // 3. Extracted GS Paper topics & areas from content
    const rawContentStr = String(
      article?.Full_Content || 
      article?.full_content || 
      article?.Article_HTML || 
      article?.article_html || 
      article?.Content || 
      article?.content || 
      ''
    );
    const matches = rawContentStr.match(/GS\s+(?:Paper\s+)?(?:I|II|III|IV|[1-4])\b[^\<\n\.\,\;]*/gi) || [];
    matches.forEach(m => {
      const clean = m.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
      if (clean.length > 2 && clean.length < 60) {
        set.add(clean);
      }
    });

    return Array.from(set);
  }, [article, categoryBadges]);

  // 6. FULL AUTOMATIC SEO & SCHEMA
  useEffect(() => {
    if (!article) return;

    const docTitle = article?.Title || article?.title || 'Current Affairs';
    const summary = article?.Short_Summary || article?.short_summary || article?.Summary || article?.summary || article?.Description || article?.description || '';
    const rawBanner = article?.Banner_Image || article?.banner_image || article?.Banner || article?.banner || article?.Image || article?.image;
    const banner = getDirectImageUrl(rawBanner);
    const isoDate = formatDateToYMD(article?.Date || article?.date);

    // 1. Set document title: article headline and Akella Raghavendra's e-Gurukulam for IAS
    const pageTitle = `${docTitle} | Akella Raghavendra's e-Gurukulam for IAS`;
    document.title = pageTitle;

    // 2. Extract Syllabus Areas & GS Papers for Content & AI Query Fan-Out
    const rawContentStr = String(
      article?.Full_Content || 
      article?.full_content || 
      article?.Article_HTML || 
      article?.article_html || 
      article?.Content || 
      article?.content || 
      ''
    );
    const cleanBody = rawContentStr.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 160);
    const metaDescContent = summary || (cleanBody ? `${cleanBody}...` : `${docTitle} - Daily UPSC Current Affairs and editorial analysis by e-Gurukulam for IAS.`);

    // Set meta name="description"
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.name = 'description';
      document.head.appendChild(metaDesc);
    }
    metaDesc.content = metaDescContent;

    // 3. Dynamic Canonical URL with Clean Pathing
    const rawArtSlug = article?.slug || article?.Slug || createSlug(docTitle);
    const articleSlug = encodeURIComponent(String(rawArtSlug).trim().toLowerCase());
    const canonicalUrl = `https://egurukulamforias.com/current-affairs/${articleSlug}`;

    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonicalUrl);

    const gsMatches = Array.from(
      new Set(
        (rawContentStr.match(/GS\s+(?:Paper\s+)?(?:I|II|III|IV|[1-4])\b[^\<\n\.\,\;]*/gi) || [])
          .map(m => m.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim())
          .filter(m => m.length > 2 && m.length < 80)
      )
    );

    // AI Search Fan-Out Keywords & Search Phrases (Metadata only - zero visual UI footprint)
    const rawTags = article?.tags || article?.Tags;
    const artTags = Array.isArray(rawTags) 
      ? rawTags 
      : typeof rawTags === 'string' 
        ? rawTags.split(',').map(t => t.trim()).filter(Boolean) 
        : [];

    const fanOutQueries = [
      `${docTitle} UPSC`,
      `${docTitle} UPSC notes`,
      `${docTitle} summary`,
      `${docTitle} current affairs analysis`,
      ...(categoryBadges.length > 0 ? categoryBadges.map(c => `${c} UPSC`) : []),
      ...artTags.map(t => `${t} UPSC`),
      ...gsMatches,
      "UPSC Civil Services Examination",
      "UPSC IAS Current Affairs",
      "General Studies UPSC Notes"
    ].filter(Boolean);
    const uniqueKeywords = Array.from(new Set(fanOutQueries));

    // Inject meta name="keywords" for Google AI search indexing
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.name = 'keywords';
      document.head.appendChild(metaKeywords);
    }
    metaKeywords.content = uniqueKeywords.join(', ');

    // 4. Production Open Graph & Twitter Social Metadata
    const posterImg = banner
      ? (banner.startsWith('http') ? banner : `https://egurukulamforias.com${banner}`)
      : 'https://egurukulamforias.com/images/egurukulam_logo.png';

    const updateMetaTag = (attr, key, val) => {
      let el = document.querySelector(`meta[${attr}="${key}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute('content', val);
    };

    updateMetaTag('property', 'og:type', 'article');
    updateMetaTag('property', 'og:title', pageTitle);
    updateMetaTag('property', 'og:description', metaDescContent);
    updateMetaTag('property', 'og:url', canonicalUrl);
    updateMetaTag('property', 'og:image', posterImg);
    updateMetaTag('name', 'twitter:card', 'summary_large_image');
    updateMetaTag('name', 'twitter:title', pageTitle);
    updateMetaTag('name', 'twitter:description', metaDescContent);
    updateMetaTag('name', 'twitter:image', posterImg);

    // 5. Dynamically inject expanded NewsArticle JSON-LD schema into document <head>
    const scriptId = 'ca-newsarticle-jsonld';
    let scriptEl = document.getElementById(scriptId);
    if (!scriptEl) {
      scriptEl = document.createElement('script');
      scriptEl.id = scriptId;
      scriptEl.type = 'application/ld+json';
      document.head.appendChild(scriptEl);
    }

    const categoryStr = article?.Category || article?.category || (categoryBadges.length > 0 ? categoryBadges[0] : 'General Studies');

    const aboutEntities = [
      { "@type": "Thing", "name": docTitle },
      { "@type": "Thing", "name": "UPSC Civil Services Examination" },
      { "@type": "Thing", "name": "UPSC Current Affairs" },
      ...(categoryBadges.length > 0 ? categoryBadges.map(c => ({ "@type": "Thing", "name": c })) : []),
      ...artTags.map(t => ({ "@type": "Thing", "name": t })),
      ...gsMatches.map(gs => ({ "@type": "Thing", "name": gs }))
    ];

    const mentionEntities = fanOutTopics.map(tag => ({
      "@type": "Thing",
      "name": tag,
      "url": `https://egurukulamforias.com/current-affairs?topic=${encodeURIComponent(tag)}`
    }));

    const authorEntity = {
      "@type": "Person",
      "name": "Akella Raghavendra",
      "url": "https://egurukulamforias.com/about"
    };

    const publisherEntity = {
      "@type": "EducationalOrganization",
      "name": "e-Gurukulam for IAS",
      "url": "https://egurukulamforias.com",
      "logo": {
        "@type": "ImageObject",
        "url": "https://egurukulamforias.com/images/Logo.png"
      }
    };

    const schemaData = {
      "@context": "https://schema.org",
      "@type": "NewsArticle",
      "headline": docTitle,
      "description": metaDescContent,
      "datePublished": isoDate,
      "dateModified": isoDate,
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": canonicalUrl
      },
      "image": posterImg ? [posterImg] : [],
      "author": authorEntity,
      "publisher": publisherEntity,
      "about": aboutEntities,
      "mentions": mentionEntities,
      "hasPart": mentionEntities.map(m => ({
        "@type": "WebPage",
        "name": m.name,
        "url": m.url
      })),
      "keywords": uniqueKeywords.join(', '),
      "educationalAlignment": {
        "@type": "AlignmentObject",
        "alignmentType": "educationalSubject",
        "educationalFramework": "UPSC Civil Services Examination",
        "targetName": categoryStr
      }
    };

    scriptEl.textContent = JSON.stringify(schemaData);

    // 6. Dynamically inject BreadcrumbList JSON-LD schema (Home -> Current Affairs -> Article)
    const breadcrumbScriptId = 'ca-breadcrumbs-jsonld';
    let breadcrumbEl = document.getElementById(breadcrumbScriptId);
    if (!breadcrumbEl) {
      breadcrumbEl = document.createElement('script');
      breadcrumbEl.id = breadcrumbScriptId;
      breadcrumbEl.type = 'application/ld+json';
      document.head.appendChild(breadcrumbEl);
    }

    const breadcrumbData = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://egurukulamforias.com/"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Current Affairs",
          "item": "https://egurukulamforias.com/current-affairs"
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": docTitle,
          "item": canonicalUrl
        }
      ]
    };

    breadcrumbEl.textContent = JSON.stringify(breadcrumbData);

    return () => {
      const el = document.getElementById(scriptId);
      if (el) el.remove();

      const bcEl = document.getElementById(breadcrumbScriptId);
      if (bcEl) bcEl.remove();

      // Reset canonical to /current-affairs when navigating away
      const cLink = document.querySelector('link[rel="canonical"]');
      if (cLink) {
        cLink.setAttribute('href', 'https://egurukulamforias.com/current-affairs');
      }

      // Reset og:type to website
      const ogType = document.querySelector('meta[property="og:type"]');
      if (ogType) ogType.setAttribute('content', 'website');
    };
  }, [article, categoryBadges, fanOutTopics]);

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
    if (typeof window !== 'undefined') {
      window.__CURRENT_AFFAIRS_CACHE__ = window.__CURRENT_AFFAIRS_CACHE__ || [];
      if (!window.__CURRENT_AFFAIRS_CACHE__.some(a => (a.id && a.id === art.id) || (a.Slug && a.Slug === art.Slug))) {
        window.__CURRENT_AFFAIRS_CACHE__.push(art);
      }
    }
    navigate(`/current-affairs/${encodeURIComponent(decodedArtSlug)}`, { state: { article: art } });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 4. ELIMINATE FULL-SCREEN CANVAS ANIMATIONS & PREVENT PREMATURE 404:
  const isNetworkPending = !isCMSNetworkFetched();
  const isLoading = !article && !isNotFound && (cmsLoading || !cmsFetched || isNetworkPending || isRetrying);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#FFFDF8] text-[#221814] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-8 animate-pulse">
          <div className="sticky z-20 bg-[#FAF6EE] p-4 sm:p-5 rounded-3xl border border-[#D5C3B0] shadow-sm flex items-center justify-between" style={{ top: 'var(--site-header-height, 134px)' }}>
            <button
              type="button"
              onClick={() => navigate('/current-affairs')}
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-serif font-bold text-[#8C3A27] hover:text-[#732D1B] transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Current Affairs</span>
            </button>
            <div className="h-4 w-28 bg-[#D5C3B0]/30 rounded-full"></div>
          </div>

          <div className="space-y-6 pt-4">
            <div className="flex gap-2">
              <div className="h-6 w-24 bg-[#D5C3B0]/30 rounded-md"></div>
              <div className="h-6 w-32 bg-[#D5C3B0]/20 rounded-md"></div>
            </div>
            <div className="h-10 sm:h-14 w-4/5 bg-[#D5C3B0]/30 rounded-2xl"></div>
            <div className="h-4 w-48 bg-[#D5C3B0]/20 rounded-md"></div>
            <div className="h-72 w-full bg-[#D5C3B0]/15 rounded-3xl mt-6"></div>
            <div className="space-y-3 pt-4">
              <div className="h-4 w-full bg-[#D5C3B0]/20 rounded"></div>
              <div className="h-4 w-11/12 bg-[#D5C3B0]/20 rounded"></div>
              <div className="h-4 w-4/5 bg-[#D5C3B0]/20 rounded"></div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // When loading finishes, if article is still not found, show latest dispatches with clean header.
  if (!article) {
    const recentDispatches = (sortedArticles && sortedArticles.length > 0)
      ? sortedArticles.slice(0, 6)
      : [];

    return (
      <main className="min-h-screen bg-[#FFFDF8] text-[#221814] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-10">
          {/* Top Sub-bar with header height offset */}
          <div 
            className="sticky z-20 bg-[#FAF6EE] p-4 sm:p-5 rounded-3xl border border-[#D5C3B0] shadow-sm flex items-center justify-between" 
            style={{ top: 'var(--site-header-height, 134px)' }}
          >
            <button
              type="button"
              onClick={() => navigate('/current-affairs')}
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-serif font-bold text-[#8C3A27] hover:text-[#732D1B] transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Current Affairs</span>
            </button>
            <span className="text-xs font-mono font-bold text-[#7A6B5D] uppercase tracking-wider">
              Daily Editorial Briefings
            </span>
          </div>

          {/* Clean Editorial Notice Card */}
          <div className="bg-[#FAF6EE] p-8 sm:p-10 rounded-3xl border border-[#D5C3B0] shadow-sm text-center space-y-4 max-w-2xl mx-auto">
            <div className="w-12 h-12 rounded-full bg-[#8C3A27]/10 text-[#8C3A27] flex items-center justify-center mx-auto">
              <BookOpen className="w-6 h-6" />
            </div>
            <h1 className="font-serif-header text-2xl sm:text-3xl font-extrabold text-[#221814]">
              Select an article below
            </h1>
            <p className="text-xs sm:text-sm font-serif italic text-[#5C4028] font-semibold leading-relaxed max-w-lg mx-auto">
              The requested article could not be located in our active dispatches. Explore the latest published editorial analyses below, or retry fetching.
            </p>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleManualRetry}
                disabled={isRetrying}
                className="btn-terracotta-pill text-xs py-2.5 px-6 font-serif font-bold cursor-pointer inline-flex items-center gap-2"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRetrying ? 'animate-spin' : ''}`} />
                <span>{isRetrying ? 'Checking Live Sheet...' : 'Retry Fetch'}</span>
              </button>
              <Link
                to="/current-affairs"
                navigate={navigate}
                className="btn-terracotta-outline-pill text-xs py-2.5 px-6 font-serif font-bold cursor-pointer inline-flex items-center gap-2 no-underline"
              >
                <span>Explore All Dispatches</span>
                <ArrowLeft className="w-4 h-4 rotate-180" />
              </Link>
            </div>
          </div>

          {/* Latest Published Dispatches Grid */}
          {recentDispatches.length > 0 && (
            <div className="space-y-6 pt-4">
              <div className="flex items-center justify-between border-b border-[#D5C3B0]/60 pb-3">
                <h2 className="font-serif-header text-xl sm:text-2xl font-bold text-[#221814]">
                  Latest Published Dispatches
                </h2>
                <Link
                  to="/current-affairs"
                  navigate={navigate}
                  className="text-xs font-serif font-bold text-[#8C3A27] hover:text-[#732D1B] hover:underline cursor-pointer no-underline"
                >
                  View All &rarr;
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recentDispatches.map((item, idx) => {
                  const itemTitle = item.Title || item.title || 'Current Affairs';
                  const itemDate = formatDisplayDate(item.Date || item.date) || 'Recent';
                  const itemCategory = item.Category || item.category || 'General Studies';
                  const itemSlug = item.Slug || item.slug || createSlug(itemTitle);
                  const itemSummary = item.Short_Summary || item.short_summary || item.Summary || item.summary || '';

                  return (
                    <Link
                      key={idx}
                      to={`/current-affairs/${encodeURIComponent(itemSlug)}`}
                      state={{ article: item }}
                      navigate={navigate}
                      className="card-parchment-3d rounded-2xl bg-[#FFFDF8] border border-[#D5C3B0] overflow-hidden flex flex-col justify-between hover:border-[#8C3A27] transition-all shadow-sm group text-left cursor-pointer p-6 space-y-4 no-underline block"
                    >
                      <div className="space-y-3 flex-1">
                        <div className="flex items-center justify-between text-xs gap-2">
                          <span className="inline-flex items-center gap-1.5 font-mono text-[#8C3A27] font-bold bg-[#8C3A27]/10 px-2.5 py-1 rounded-md border border-[#8C3A27]/20">
                            <Tag className="w-3 h-3" />
                            <span>{itemCategory}</span>
                          </span>
                          <span className="inline-flex items-center gap-1 font-serif text-[#7A6B5D] italic font-semibold">
                            <Calendar className="w-3 h-3" />
                            <span>{itemDate}</span>
                          </span>
                        </div>

                        <h3 className="font-serif-header text-base font-bold text-[#221814] leading-snug group-hover:text-[#8C3A27] transition-colors line-clamp-2">
                          {itemTitle}
                        </h3>

                        {itemSummary && (
                          <p className="text-xs text-[#3D3028] font-sans font-medium leading-relaxed line-clamp-3">
                            {itemSummary}
                          </p>
                        )}
                      </div>

                      <div className="p-0">
                        <span
                          className="w-full inline-flex items-center justify-center gap-2 btn-terracotta-outline-pill text-xs py-2 px-4 font-serif font-bold transition-all cursor-pointer group/btn group-hover:bg-[#8C3A27] group-hover:text-white"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>READ DISPATCH &rarr;</span>
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </main>
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

  // 3. FULL EDITORIAL DISPATCH VIEW (SEMANTIC ARTICLE CONTAINER)
  return (
    <main className="min-h-screen bg-[#FFFDF8] text-[#221814] py-12 px-4 sm:px-6 lg:px-8 select-text">
      <article 
        itemScope 
        itemType="https://schema.org/NewsArticle"
        className="max-w-4xl mx-auto space-y-8 animate-fade-in text-left"
      >
        <header className="space-y-6">
          {/* 1. STICKY "← Back to Current Affairs" NAVIGATION BAR */}
          <div className="sticky z-20 bg-[#FAF6EE] p-4 sm:p-5 rounded-3xl border border-[#D5C3B0] shadow-sm flex flex-wrap items-center justify-between gap-4" style={{ top: 'var(--site-header-height, 134px)' }}>
            <button
              type="button"
              onClick={() => navigate('/current-affairs')}
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
          <h1 itemProp="headline" className="text-[#6C1D18] font-serif text-3xl md:text-5xl font-bold mb-6 pb-6 border-b border-[#D5C3B0]/60 leading-tight tracking-tight">
            {title}
          </h1>

          {/* 3. HERO BANNER IMAGE */}
          {bannerImage && (
            <div className="w-full overflow-hidden rounded-3xl border border-[#D5C3B0] shadow-xl max-h-[480px] bg-black/5">
              <img 
                src={bannerImage} 
                alt={title} 
                fetchPriority="high"
                referrerPolicy="no-referrer"
                itemProp="image"
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
            <div 
              itemProp="description"
              className="p-5 sm:p-6 rounded-2xl bg-[#F4ECE1] border-l-4 border-[#8C3A27] text-[#3D3028] font-serif italic text-base sm:text-lg leading-relaxed shadow-2xs"
            >
              {shortSummary}
            </div>
          )}
        </header>

        {/* 5. FULL ARTICLE CONTENT CONTAINER WITH PROSE & UNCONSTRAINED SPACING */}
        {fullContentHtml ? (
          <div 
            itemProp="articleBody"
            className="doc-article-content editorial-article-body prose prose-stone max-w-none text-stone-800 text-base md:text-lg leading-relaxed font-sans select-text my-8 [&_h1]:text-2xl sm:[&_h1]:text-3xl [&_h1]:font-bold [&_h1]:font-serif [&_h1]:text-[#6C1D18] [&_h1]:mt-8 [&_h1]:mb-4 [&_h1]:border-b [&_h1]:border-[#D5C3B0]/60 [&_h1]:pb-2 [&_h2]:text-xl sm:[&_h2]:text-2xl [&_h2]:font-bold [&_h2]:font-serif [&_h2]:text-[#6C1D18] [&_h2]:mt-7 [&_h2]:mb-3 [&_h2]:border-b [&_h2]:border-[#D5C3B0]/60 [&_h2]:pb-1.5 [&_h2]:text-left [&_h2_*]:text-inherit [&_h2_strong]:text-inherit [&_h2_b]:text-inherit [&_h3]:text-lg sm:[&_h3]:text-xl [&_h3]:font-bold [&_h3]:font-serif [&_h3]:text-[#8B261E] [&_h3]:mt-6 [&_h3]:mb-2 [&_p]:mb-5 [&_p]:leading-relaxed [&_p]:text-[#2C221E] [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2 [&_ul]:mb-5 [&_ul]:text-[#3D3028] [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:space-y-2 [&_ol]:mb-5 [&_ol]:text-[#3D3028] [&_li]:leading-relaxed [&_strong]:font-bold [&_strong]:text-[#140C08] [&_b]:font-bold [&_b]:text-[#140C08] [&_blockquote]:border-l-4 [&_blockquote]:border-[#8C3A27] [&_blockquote]:pl-5 [&_blockquote]:italic [&_blockquote]:text-[#5C4028] [&_blockquote]:my-6 [&_blockquote]:bg-[#8C3A27]/5 [&_blockquote]:py-3 [&_blockquote]:pr-4 [&_blockquote]:rounded-r-xl [&_img]:rounded-2xl [&_img]:shadow-lg [&_img]:mx-auto [&_img]:my-6 [&_img]:max-h-[500px] [&_img]:object-contain [&_img]:block [&_img]:border [&_img]:border-[#D5C3B0]/40 [&_table]:w-full [&_table]:border-collapse [&_table]:my-6 [&_table]:rounded-xl [&_table]:overflow-hidden [&_td]:border [&_td]:border-[#D5C3B0] [&_td]:p-3 [&_td]:text-sm [&_th]:border [&_th]:border-[#D5C3B0] [&_th]:p-3 [&_th]:bg-[#FAF6EE] [&_th]:font-bold [&_th]:text-[#6C1D18] [&_th]:text-sm [&_a]:text-[#8C3A27] hover:[&_a]:text-[#6C1D18] [&_a]:underline [&_a]:underline-offset-2"
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
            <Link
              to="/current-affairs"
              navigate={navigate}
              className="btn-terracotta-outline-pill text-xs py-2.5 px-6 font-serif font-bold cursor-pointer shrink-0 w-full sm:w-auto inline-flex items-center justify-center no-underline"
            >
              <span>← All Daily Current Affairs</span>
            </Link>

            {prevArticle && (
              <Link
                to={`/current-affairs/${encodeURIComponent(safeDecode(prevArticle.Slug || prevArticle.slug || createSlug(prevArticle.Title || prevArticle.title)))}`}
                state={{ article: prevArticle }}
                navigate={navigate}
                className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-[#FFFDF8] border border-[#D5C3B0]/60 hover:border-[#8C3A27] transition-all group cursor-pointer text-xs font-serif font-bold text-[#221814] hover:text-[#8C3A27] no-underline"
                title={prevArticle?.Title || prevArticle?.title || 'Previous Dispatch'}
              >
                <ChevronLeft className="w-4 h-4 text-[#8C3A27] group-hover:-translate-x-0.5 transition-transform" />
                <span>Previous</span>
              </Link>
            )}
          </div>

          {/* Right: READ NEXT Card */}
          {nextArticle && (
            <Link
              to={`/current-affairs/${encodeURIComponent(safeDecode(nextArticle.Slug || nextArticle.slug || createSlug(nextArticle.Title || nextArticle.title)))}`}
              state={{ article: nextArticle }}
              navigate={navigate}
              className="flex items-center justify-end text-right gap-3 p-3 sm:p-3.5 px-5 rounded-2xl bg-[#FFFDF8] border border-[#D5C3B0]/60 hover:border-[#8C3A27] transition-all group cursor-pointer w-full sm:w-auto max-w-md shadow-2xs hover:shadow-xs sm:ml-auto no-underline"
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
            </Link>
          )}

        </div>

      </article>
    </main>
  );
}
