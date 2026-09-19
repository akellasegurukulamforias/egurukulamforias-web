import { sortCurrentAffairsByDate } from '../utils/dateUtils';

export const CMS_API_ENDPOINT = 'https://script.google.com/macros/s/AKfycbyOt8dZ7S9ot1Zy3GyyXgsDTPsrF016odbaXhf9DXXPMllvQzmQvKabubXZFzRra51x/exec';
export const LOCAL_STORAGE_KEY = 'egk_cms_data_v7'; // Bumped to v7 for dynamic resources workflow

// Robust Google Drive & Web Image URL Formatter
export function formatCMSImageUrl(url) {
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

// Fallback secondary image URL if primary thumbnail is blocked
export function getSecondaryCMSImageUrl(url) {
  if (!url || typeof url !== 'string') return null;
  if (url.includes("drive.google.com") || url.includes("id=")) {
    const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/) || url.match(/id=([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      return `https://lh3.googleusercontent.com/d/${match[1]}`;
    }
  }
  return url;
}

// Safely extract poster/banner image link supporting all key variations
export function getCMSImageLink(item) {
  if (!item || typeof item !== 'object') return null;
  const rawUrl =
    item.Poster_Image_Link ||
    item.poster_image_link ||
    item.Banner_Image ||
    item.banner_image ||
    item.Poster_Image ||
    item.poster_image ||
    item.Poster_Link ||
    item.poster_link ||
    item.Image_Link ||
    item.image_link ||
    item.Poster ||
    item.poster ||
    item.Image ||
    item.image ||
    item.Banner ||
    item.banner ||
    item.Thumbnail ||
    item.thumbnail;

  return formatCMSImageUrl(rawUrl);
}

// Helper to check active status
export function isItemActive(obj) {
  if (!obj || typeof obj !== 'object') return false;
  if (obj.Active === false || obj.active === false || obj.Is_Active === false || obj.is_active === false) return false;
  if (obj.Status && obj.Status.toString().toLowerCase() === 'inactive') return false;
  if (obj.status && obj.status.toString().toLowerCase() === 'inactive') return false;
  return true;
}

// Helper to identify UPSC Syllabus items dynamically
export function isSyllabusResource(item) {
  if (!item || typeof item !== 'object') return false;
  const title = String(item.Title || item.title || '');
  const category = String(item.Category || item.category || '');
  const subcategory = String(item.Subcategory || item.subcategory || item.Sub_Category || item.sub_category || '');
  const tags = String(item.Tags || item.tags || '');
  return (
    /syllabus/i.test(title) ||
    /syllabus/i.test(category) ||
    /syllabus/i.test(subcategory) ||
    /syllabus/i.test(tags)
  );
}

// Helper to identify Previous Year Questions (PYQs) dynamically
export function isPYQResource(item) {
  if (!item || typeof item !== 'object') return false;
  const title = String(item.Title || item.title || '');
  const category = String(item.Category || item.category || '');
  const subcategory = String(item.Subcategory || item.subcategory || item.Sub_Category || item.sub_category || '');
  const tags = String(item.Tags || item.tags || '');
  const pattern = /previous\s*year\s*questions?|pyqs?|past\s*years?\s*papers?|question\s*paper/i;
  return (
    pattern.test(title) ||
    pattern.test(category) ||
    pattern.test(subcategory) ||
    pattern.test(tags)
  );
}

// Helper to extract exam year from PYQ item
export function extractPYQYear(item) {
  if (!item || typeof item !== 'object') return 'General';
  // 1. Direct Year column
  if (item.Year || item.year) {
    const yr = String(item.Year || item.year).trim();
    if (/^\d{4}$/.test(yr)) return yr;
  }
  // 2. Year from Title
  const title = String(item.Title || item.title || '');
  const titleMatch = title.match(/\b(19\d{2}|20\d{2})\b/);
  if (titleMatch) return titleMatch[1];
  // 3. Year from Category or Subcategory
  const cat = String(item.Category || item.category || '');
  const catMatch = cat.match(/\b(19\d{2}|20\d{2})\b/);
  if (catMatch) return catMatch[1];
  // 4. Year from beginning of document content
  const content = String(item.Full_Content || item.full_content || item.Content || item.content || '').slice(0, 400);
  const contentMatch = content.match(/\b(19\d{2}|20\d{2})\b/);
  if (contentMatch) return contentMatch[1];
  // 5. Year from Date field
  const date = String(item.Date || item.date || '');
  const dateMatch = date.match(/\b(19\d{2}|20\d{2})\b/);
  if (dateMatch) return dateMatch[1];

  return 'General';
}

// Helper to extract clean paper name from PYQ item
export function extractPYQPaperName(item) {
  if (!item || typeof item !== 'object') return 'Question Paper';
  const rawTitle = String(item.Title || item.title || '');
  let cleaned = rawTitle
    .replace(/previous\s*year\s*question\s*papers?/gi, '')
    .replace(/upsc\s*cse|upsc|civil\s*services/gi, '')
    .replace(/\b(19\d{2}|20\d{2})\b/g, '')
    .replace(/^[()\s–-]+|[()\s–-]+$/g, '')
    .trim();
  if (!cleaned) {
    const cat = String(item.Category || item.category || '');
    cleaned = cat.replace(/previous\s*year\s*question\s*papers?/gi, '').trim();
  }
  return cleaned || rawTitle;
}

// Helper to extract exam stage (Prelims vs Mains) dynamically from PYQ item
export function extractPYQStage(item) {
  if (!item || typeof item !== 'object') return 'Mains';

  // 1. Direct Stage / Phase field
  const directStage = String(
    item.Stage || item.stage ||
    item.Phase || item.phase ||
    item.Exam_Stage || item.exam_stage || ''
  ).trim();
  if (/prelims|preliminary/i.test(directStage)) return 'Prelims';
  if (/mains|main\b/i.test(directStage)) return 'Mains';

  // 2. Scan metadata strings
  const combined = [
    String(item.Title || item.title || ''),
    String(item.Category || item.category || ''),
    String(item.Subcategory || item.subcategory || item.Sub_Category || item.sub_category || ''),
    String(item.Tags || item.tags || '')
  ].join(' ');

  if (/prelims|preliminary/i.test(combined)) return 'Prelims';
  if (/mains|main\b|civil services \(main\)/i.test(combined)) return 'Mains';

  // 3. Heuristic fallbacks based on standard UPSC exam paper patterns:
  // CSAT is strictly Prelims (Paper 2)
  if (/csat/i.test(combined)) return 'Prelims';

  // Essay is strictly Mains
  if (/essay/i.test(combined)) return 'Mains';

  // Optional subjects are strictly Mains
  if (/optional|anthropology|sociology|geography|history|psir|philosophy|political\s*science|public\s*administration|pub\s*ad|law|economics|botany|zoology|telugu\s*literature/i.test(combined)) {
    return 'Mains';
  }

  // GS Papers 3 and 4 are strictly Mains
  if (/gs\s*[-–—]?[34]|paper\s*[-–—]?[34]|general\s*studies\s*paper\s*[-–—]?[34]/i.test(combined)) {
    return 'Mains';
  }

  // Default fallback: Mains
  return 'Mains';
}

// Helper to extract category/stream (General Studies, CSAT, Essay, Optional) dynamically
export function extractPYQCategory(item) {
  if (!item || typeof item !== 'object') return 'General Studies';

  const combined = [
    String(item.Title || item.title || ''),
    String(item.Category || item.category || ''),
    String(item.Subcategory || item.subcategory || item.Sub_Category || item.sub_category || ''),
    String(item.Tags || item.tags || '')
  ].join(' ');

  if (/csat/i.test(combined)) return 'CSAT';
  if (/essay/i.test(combined)) return 'Essay';
  if (/optional|anthropology|sociology|geography|history|psir|philosophy|political\s*science|public\s*administration|pub\s*ad|law|economics|botany|zoology|telugu\s*literature|literature/i.test(combined)) {
    return 'Optional';
  }
  return 'General Studies';
}

// Helper to extract clean paper label suitable for breadcrumbs and badges
export function extractPYQPaperLabel(item) {
  if (!item || typeof item !== 'object') return 'Question Paper';
  const stage = extractPYQStage(item);
  const cat = extractPYQCategory(item);
  const rawTitle = String(item.Title || item.title || '');

  // If Prelims
  if (stage === 'Prelims') {
    if (cat === 'CSAT' || /csat/i.test(rawTitle)) return 'CSAT (Paper 2)';
    return 'General Studies (Paper 1)';
  }

  // If Mains
  if (cat === 'Essay' || /essay/i.test(rawTitle)) return 'Essay';

  // Check GS Papers 1 to 4
  const gsMatch = rawTitle.match(/gs\s*[-–—]?\s*([1-4])|general\s*studies\s*paper\s*[-–—]?\s*([1-4])|paper\s*[-–—]?\s*([1-4])/i);
  if (gsMatch) {
    const num = gsMatch[1] || gsMatch[2] || gsMatch[3];
    return `General Studies Paper - ${num}`;
  }

  // Check Optional subjects
  const optMatch = rawTitle.match(/(sociology|anthropology|psir|geography|history|philosophy|public\s*administration|pub\s*ad|telugu(?:\s*literature)?)(?:\s*paper\s*[-–—]?\s*([12]))?/i);
  if (optMatch) {
    const subject = optMatch[1].trim();
    const paperNum = optMatch[2] ? ` (Paper ${optMatch[2]})` : '';
    return `${subject.toUpperCase()}${paperNum}`;
  }

  return extractPYQPaperName(item);
}

// Helper to generate canonical hierarchical URL for a PYQ paper (Level 5)
export function getPYQPaperUrl(item) {
  if (!item || typeof item !== 'object') return '/resources/pyqs';
  const year = extractPYQYear(item);
  const stage = extractPYQStage(item);
  const title = item.Title || item.title || '';
  const slug = item.slug || item.Slug || item.id || item.ID || (title ? title.toLowerCase().replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-') : 'question-paper');
  
  if (year && year !== 'General') {
    return `/resources/pyqs/${year}/${stage.toLowerCase()}/${slug}`;
  }
  return `/resources/pyqs/${stage.toLowerCase()}/${slug}`;
}

// Helper to extract paper number (1-4) from title
export function extractPaperNumber(text) {
  if (!text) return 99;
  const str = String(text);
  const romanMatch = str.match(/(?:Paper|GS|General\s*Studies)\s*[-–:]?\s*(IV|III|II|I)\b/i);
  if (romanMatch) {
    const map = { 'I': 1, 'II': 2, 'III': 3, 'IV': 4 };
    return map[romanMatch[1].toUpperCase()] || 99;
  }
  const digitMatch = str.match(/(?:Paper|GS|General\s*Studies)\s*[-–:]?\s*([1-4])\b/i);
  if (digitMatch) {
    return parseInt(digitMatch[1], 10);
  }
  const fallback = str.match(/\b([1-4])\b/);
  if (fallback) {
    return parseInt(fallback[1], 10);
  }
  return 99;
}

// Helper to extract optional subject name from item
export function extractOptionalSubject(item) {
  if (!item || typeof item !== 'object') return 'Optional Subject';
  const title = String(item.Title || item.title || '');
  const cat = String(item.Category || item.category || '');
  const subcat = String(item.Subcategory || item.subcategory || item.Sub_Category || item.sub_category || '');
  const combined = `${title} ${cat} ${subcat}`;

  const subjects = [
    'Anthropology', 'Sociology', 'Geography', 'History',
    'Public Administration', 'Political Science', 'PSIR',
    'Economics', 'Philosophy', 'Psychology', 'Law',
    'Commerce', 'Agriculture', 'Mathematics', 'Physics',
    'Chemistry', 'Botany', 'Zoology', 'Geology',
    'Telugu Literature', 'Kannada Literature', 'Hindi Literature', 'Tamil Literature',
    'Telugu', 'Kannada', 'Hindi', 'Tamil', 'Malayalam', 'Sanskrit', 'Urdu', 'English Literature'
  ];

  for (const subj of subjects) {
    const regex = new RegExp(`\\b${subj}\\b`, 'i');
    if (regex.test(combined)) {
      return subj;
    }
  }

  let cleaned = title
    .replace(/previous\s*year\s*question\s*papers?/gi, '')
    .replace(/upsc\s*cse|upsc|civil\s*services|mains|optional/gi, '')
    .replace(/paper\s*[-–:]?\s*[1-2IV]+/gi, '')
    .replace(/\b(19\d{2}|20\d{2})\b/g, '')
    .replace(/^[()\s–-]+|[()\s–-]+$/g, '')
    .trim();
  return cleaned || 'Optional Subject';
}

// Natural numerical sorting for PYQ papers (Ascending order, completely ignoring upload dates)
// Mains: Essay -> GS 1 -> GS 2 -> GS 3 -> GS 4 -> Optionals (Alphabetical by subject, then Paper 1 -> Paper 2)
// Prelims: GS 1 -> CSAT (Paper 2)
export function sortPYQPapers(papers) {
  if (!Array.isArray(papers)) return [];
  return [...papers].sort((a, b) => {
    const stageA = extractPYQStage(a);
    const stageB = extractPYQStage(b);

    if (stageA !== stageB) {
      return stageA === 'Prelims' ? -1 : 1;
    }

    const catA = extractPYQCategory(a);
    const catB = extractPYQCategory(b);

    if (stageA === 'Prelims') {
      const numA = extractPaperNumber(a.Title || a.title);
      const numB = extractPaperNumber(b.Title || b.title);
      if (catA !== catB) {
        if (catA === 'General Studies') return -1;
        if (catB === 'General Studies') return 1;
      }
      return numA - numB;
    }

    const getMainsOrder = (cat) => {
      if (cat === 'Essay') return 1;
      if (cat === 'General Studies') return 2;
      if (cat === 'Optional') return 3;
      return 4;
    };

    const orderA = getMainsOrder(catA);
    const orderB = getMainsOrder(catB);

    if (orderA !== orderB) {
      return orderA - orderB;
    }

    if (catA === 'Essay') {
      return String(a.Title || a.title).localeCompare(String(b.Title || b.title));
    }

    if (catA === 'General Studies') {
      const numA = extractPaperNumber(a.Title || a.title);
      const numB = extractPaperNumber(b.Title || b.title);
      if (numA !== numB) return numA - numB;
      return String(a.Title || a.title).localeCompare(String(b.Title || b.title));
    }

    if (catA === 'Optional') {
      const subjA = extractOptionalSubject(a);
      const subjB = extractOptionalSubject(b);
      const subjComp = subjA.localeCompare(subjB);
      if (subjComp !== 0) return subjComp;

      const numA = extractPaperNumber(a.Title || a.title);
      const numB = extractPaperNumber(b.Title || b.title);
      return numA - numB;
    }

    return String(a.Title || a.title).localeCompare(String(b.Title || b.title));
  });
}

// Synchronously read cached data from localStorage for instant 0ms initial render
export function getCachedCMSData() {
  try {
    const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed && typeof parsed === 'object') {
        if (Array.isArray(parsed.currentAffairs)) {
          parsed.currentAffairs = sortCurrentAffairsByDate(parsed.currentAffairs);
        }
        if (Array.isArray(parsed.resources)) {
          parsed.resources = sortCurrentAffairsByDate(parsed.resources);
        }
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Failed to read CMS data from localStorage:', err);
  }
  return null;
}

let cachedCMSData = getCachedCMSData();
let fetchPromise = null;
let bypassPromise = null;
let cmsNetworkFetched = false;

export function isCMSNetworkFetched() {
  return cmsNetworkFetched;
}

export async function fetchCMSData(forceRevalidate = false, bypassCache = false, slug = null) {
  const shouldBypass = Boolean(forceRevalidate || bypassCache);

  if (cachedCMSData && !shouldBypass) {
    return cachedCMSData;
  }

  if (fetchPromise && !shouldBypass) {
    return fetchPromise;
  }

  if (shouldBypass && bypassPromise) {
    return bypassPromise;
  }

  const runFetch = async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000);

    try {
      let endpointUrl = CMS_API_ENDPOINT;
      const queryParts = [];
      if (shouldBypass) {
        queryParts.push(`t=${Date.now()}`);
        queryParts.push('nocache=true');
      }
      if (slug) {
        queryParts.push(`slug=${encodeURIComponent(slug)}`);
      }
      if (queryParts.length > 0) {
        const separator = endpointUrl.includes('?') ? '&' : '?';
        endpointUrl += separator + queryParts.join('&');
      }

      const response = await fetch(endpointUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        },
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`CMS HTTP Error: ${response.status}`);
      }

      const text = await response.text();
      let rawData;
      try {
        rawData = JSON.parse(text);
      } catch (e) {
        console.error("Failed to parse response as JSON:", text.slice(0, 200));
        throw new Error("Invalid data format received from data source.");
      }

      if (!rawData || typeof rawData !== 'object') {
        throw new Error("Invalid data format received from data source: payload is not an object.");
      }

      const rawSocial = Array.isArray(rawData.socialPlatforms)
        ? rawData.socialPlatforms
        : Array.isArray(rawData.social_platforms)
          ? rawData.social_platforms
          : Array.isArray(rawData.social)
            ? rawData.social
            : [];

      // Filter and sanitize active platforms and active sub-channels
      const socialPlatforms = rawSocial
        .filter(isItemActive)
        .map(item => {
          const rawChannels = Array.isArray(item.channels) 
            ? item.channels 
            : Array.isArray(item.branches) 
              ? item.branches 
              : Array.isArray(item.links) 
                ? item.links 
                : [];

          const activeChannels = rawChannels.filter(isItemActive);

          return {
            ...item,
            channels: activeChannels
          };
        });
      
      // Standardize & fallback defaults
      const freshData = {
        activePopup: rawData.activePopup && typeof rawData.activePopup === 'object' ? rawData.activePopup : null,
        liveTicker: Array.isArray(rawData.liveTicker) ? rawData.liveTicker : [],
        currentAffairs: sortCurrentAffairsByDate(Array.isArray(rawData.currentAffairs) ? rawData.currentAffairs : []),
        resources: sortCurrentAffairsByDate(Array.isArray(rawData.resources) ? rawData.resources : []),
        socialPlatforms,
        testSeries: Array.isArray(rawData.testSeries) 
          ? rawData.testSeries 
          : Array.isArray(rawData.test_series) 
            ? rawData.test_series 
            : Array.isArray(rawData.testseries)
              ? rawData.testseries
              : []
      };

      cachedCMSData = freshData;

      // Save to localStorage for 0ms instant renders on future visits with quota pruning
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(freshData));
      } catch (err) {
        console.warn('Initial save to localStorage failed, attempting quota-safe pruning:', err);
        try {
          // Prune older article full-text content, keeping full content for top 30 dispatches
          const prunedCA = (freshData.currentAffairs || []).map((item, idx) => {
            if (idx < 30) return item;
            const { Full_Content, full_content, Article_HTML, article_html, Content, content, ...rest } = item;
            return rest;
          });
          const prunedData = {
            ...freshData,
            currentAffairs: prunedCA
          };
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(prunedData));
        } catch (retryErr) {
          console.warn('Quota-safe pruned save to localStorage also failed:', retryErr);
        }
      }

      cmsNetworkFetched = true;
      return freshData;
    } catch (error) {
      clearTimeout(timeoutId);
      console.warn('Google Sheet CMS revalidation error, returning cached/fallback structure:', error);
      cmsNetworkFetched = true;
      const staleData = getCachedCMSData();
      if (staleData) return staleData;

      return {
        activePopup: null,
        liveTicker: [],
        currentAffairs: [],
        resources: [],
        socialPlatforms: [],
        testSeries: []
      };
    } finally {
      if (!shouldBypass) {
        fetchPromise = null;
      } else {
        bypassPromise = null;
      }
    }
  };

  if (!shouldBypass) {
    fetchPromise = runFetch();
    return fetchPromise;
  }

  bypassPromise = runFetch();
  return bypassPromise;
}

export async function forceRefreshCMSData(slug = null) {
  return fetchCMSData(true, true, slug);
}

export function clearCMSCache() {
  cachedCMSData = null;
  try {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  } catch (err) {
    // ignore
  }
}

// Base website URL for canonical sitemap generation
const SITEMAP_BASE_URL = 'https://egurukulamforias.com';

// Format arbitrary dates (timestamp, Date, string) into YYYY-MM-DD
export function formatDateToYMD(dateVal) {
  if (!dateVal) {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }

  if (typeof dateVal === 'number' && !isNaN(dateVal)) {
    const parsed = new Date(dateVal);
    if (!isNaN(parsed.getTime())) {
      return `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, '0')}-${String(parsed.getDate()).padStart(2, '0')}`;
    }
  }

  if (typeof dateVal === 'string') {
    const trimmed = dateVal.trim();

    // 1. DD/MM/YYYY, DD-MM-YYYY, or DD.MM.YYYY
    const dmyMatch = trimmed.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})/);
    if (dmyMatch) {
      return `${dmyMatch[3]}-${String(dmyMatch[2]).padStart(2, '0')}-${String(dmyMatch[1]).padStart(2, '0')}`;
    }

    // 2. YYYY-MM-DD or YYYY/MM/DD
    const ymdMatch = trimmed.match(/^(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})/);
    if (ymdMatch) {
      return `${ymdMatch[1]}-${String(ymdMatch[2]).padStart(2, '0')}-${String(ymdMatch[3]).padStart(2, '0')}`;
    }

    // 3. Textual dates
    const parsed = new Date(trimmed);
    if (!isNaN(parsed.getTime())) {
      return `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, '0')}-${String(parsed.getDate()).padStart(2, '0')}`;
    }
  }

  if (dateVal instanceof Date && !isNaN(dateVal.getTime())) {
    return `${dateVal.getFullYear()}-${String(dateVal.getMonth() + 1).padStart(2, '0')}-${String(dateVal.getDate()).padStart(2, '0')}`;
  }

  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

// Generate structured array of all canonical sitemap entries (Static + Dynamic CMS Dispatches + Resources)
export function generateSitemapEntries(data) {
  const cmsData = data || getCachedCMSData() || {};
  const todayYMD = formatDateToYMD(new Date());
  const seenUrls = new Set();
  const entries = [];

  // 1. Core Static Routes with explicit SEO priority weights matching header navigation
  const staticRoutes = [
    { path: '/', priority: '1.0', changefreq: 'daily', lastmod: todayYMD },
    { path: '/current-affairs', priority: '0.9', changefreq: 'daily', lastmod: todayYMD },
    { path: '/programs', priority: '0.8', changefreq: 'weekly', lastmod: todayYMD },
    { path: '/test-series', priority: '0.8', changefreq: 'weekly', lastmod: todayYMD },
    { path: '/about', priority: '0.8', changefreq: 'weekly', lastmod: todayYMD },
    { path: '/connect', priority: '0.8', changefreq: 'weekly', lastmod: todayYMD },
    { path: '/contact', priority: '0.8', changefreq: 'weekly', lastmod: todayYMD },
    { path: '/resources', priority: '0.8', changefreq: 'weekly', lastmod: todayYMD },
    { path: '/resources/upsc-syllabus', priority: '0.8', changefreq: 'daily', lastmod: todayYMD },
    { path: '/resources/pyqs', priority: '0.8', changefreq: 'daily', lastmod: todayYMD }
  ];

  for (const route of staticRoutes) {
    const loc = `${SITEMAP_BASE_URL}${route.path}`;
    if (!seenUrls.has(loc)) {
      seenUrls.add(loc);
      entries.push({
        loc,
        lastmod: route.lastmod,
        changefreq: route.changefreq,
        priority: route.priority,
        type: 'static'
      });
    }
  }

  // 2. Dynamic Current Affairs Dispatches (Priority 0.9)
  const affairs = Array.isArray(cmsData.currentAffairs) 
    ? cmsData.currentAffairs.filter(isItemActive) 
    : [];

  for (const art of affairs) {
    const title = art.Title || art.title || '';
    const rawSlug = art.slug || art.Slug || (title ? title.toLowerCase().replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-') : '');
    if (!rawSlug) continue;

    const slug = encodeURIComponent(String(rawSlug).trim().toLowerCase());
    const loc = `${SITEMAP_BASE_URL}/current-affairs/${slug}`;

    if (!seenUrls.has(loc)) {
      seenUrls.add(loc);
      const rawDate = art.Date || art.date || art.Published_Date || art.published_date;
      entries.push({
        loc,
        lastmod: formatDateToYMD(rawDate),
        changefreq: 'daily',
        priority: '0.9',
        type: 'current-affairs'
      });
    }
  }

  // 3. Dynamic Resources, Syllabus & PYQ Items (Priority 0.8)
  const resources = Array.isArray(cmsData.resources) 
    ? cmsData.resources.filter(isItemActive) 
    : [];

  for (const res of resources) {
    const title = res.Title || res.title || '';
    const rawSlug = res.slug || res.Slug || (title ? title.toLowerCase().replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-') : '');
    if (!rawSlug) continue;

    const slug = encodeURIComponent(String(rawSlug).trim().toLowerCase());
    const isSyllabus = isSyllabusResource(res);
    const isPYQ = isPYQResource(res);

    let loc = `${SITEMAP_BASE_URL}/resources/${slug}`;
    if (isPYQ) {
      loc = `${SITEMAP_BASE_URL}${getPYQPaperUrl(res)}`;
    } else if (isSyllabus) {
      loc = `${SITEMAP_BASE_URL}/resources/upsc-syllabus/${slug}`;
    }

    if (!seenUrls.has(loc)) {
      seenUrls.add(loc);
      const rawDate = res.Date || res.date || res.Published_Date || res.published_date;
      entries.push({
        loc,
        lastmod: formatDateToYMD(rawDate),
        changefreq: 'daily',
        priority: '0.8',
        type: isSyllabus ? 'syllabus' : isPYQ ? 'pyq' : 'resource'
      });
    }
  }

  return entries;
}

// Generate client-side XML sitemap string
export function generateClientSitemapXML(data) {
  const entries = generateSitemapEntries(data);
  const escapeXml = (unsafe) => String(unsafe || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries.map(entry => [
      '  <url>',
      `    <loc>${escapeXml(entry.loc)}</loc>`,
      `    <lastmod>${escapeXml(entry.lastmod)}</lastmod>`,
      `    <changefreq>${escapeXml(entry.changefreq)}</changefreq>`,
      `    <priority>${escapeXml(entry.priority)}</priority>`,
      '  </url>'
    ].join('\n')),
    '</urlset>',
    ''
  ].join('\n');
}

// Retrieve real-time sitemap metadata from cached CMS state
export function getSitemapData() {
  return generateSitemapEntries(getCachedCMSData());
}

