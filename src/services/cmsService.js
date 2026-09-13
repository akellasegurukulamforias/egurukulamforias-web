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
let cmsNetworkFetched = false;

export function isCMSNetworkFetched() {
  return cmsNetworkFetched;
}

export async function fetchCMSData(forceRevalidate = false) {
  if (cachedCMSData && !forceRevalidate) {
    return cachedCMSData;
  }

  if (fetchPromise) {
    return fetchPromise;
  }

  fetchPromise = (async () => {
    try {
      const response = await fetch(CMS_API_ENDPOINT, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`CMS HTTP Error: ${response.status}`);
      }

      const rawData = await response.json();


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

      // Save to localStorage for 0ms instant renders on future visits
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(freshData));
      } catch (err) {
        console.warn('Failed to save CMS data to localStorage:', err);
      }

      cmsNetworkFetched = true;
      return freshData;
    } catch (error) {
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
      fetchPromise = null;
    }
  })();

  return fetchPromise;
}

export function clearCMSCache() {
  cachedCMSData = null;
  try {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  } catch (err) {
    // ignore
  }
}
