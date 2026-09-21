// scripts/generate-sitemap.js
// Automated Dynamic Sitemap Generator for e-Gurukulam for IAS
// Fetches published Current Affairs from CMS and combines with core static routes.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'https://egurukulamforias.com';
const CMS_API_ENDPOINT = 'https://script.google.com/macros/s/AKfycbyOt8dZ7S9ot1Zy3GyyXgsDTPsrF016odbaXhf9DXXPMllvQzmQvKabubXZFzRra51x/exec';
// NOTE: Production sitemaps are served dynamically on Vercel via api/sitemap.xml.
// Never write sitemap.xml to public/ or dist/, because static files shadow Vercel serverless rewrites.
const PREVIEW_OUTPUT_PATH = path.resolve(__dirname, 'sitemap-preview.xml');

// Helper to get today's date in YYYY-MM-DD format
function getTodayYMD() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// Convert various date formats (DD/MM/YYYY, DD-MM-YYYY, YYYY-MM-DD, textual, numeric) into YYYY-MM-DD
function formatToYMD(dateVal) {
  if (!dateVal) return getTodayYMD();

  if (typeof dateVal === 'number' && !isNaN(dateVal)) {
    const parsed = new Date(dateVal);
    if (!isNaN(parsed.getTime())) {
      const y = parsed.getFullYear();
      const m = String(parsed.getMonth() + 1).padStart(2, '0');
      const d = String(parsed.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }
  }

  if (typeof dateVal === 'string') {
    const trimmed = dateVal.trim();

    // 1. Match DD/MM/YYYY, DD-MM-YYYY, or DD.MM.YYYY (e.g. 03/09/2026)
    const dmyMatch = trimmed.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})/);
    if (dmyMatch) {
      const day = String(dmyMatch[1]).padStart(2, '0');
      const month = String(dmyMatch[2]).padStart(2, '0');
      const year = dmyMatch[3];
      return `${year}-${month}-${day}`;
    }

    // 2. Match YYYY-MM-DD or YYYY/MM/DD (e.g. 2026-09-03)
    const ymdMatch = trimmed.match(/^(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})/);
    if (ymdMatch) {
      const year = ymdMatch[1];
      const month = String(ymdMatch[2]).padStart(2, '0');
      const day = String(ymdMatch[3]).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }

    // 3. Match textual dates (e.g. "13 Aug 2026")
    const parsed = new Date(trimmed);
    if (!isNaN(parsed.getTime())) {
      const y = parsed.getFullYear();
      const m = String(parsed.getMonth() + 1).padStart(2, '0');
      const d = String(parsed.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }
  }

  if (dateVal instanceof Date && !isNaN(dateVal.getTime())) {
    const y = dateVal.getFullYear();
    const m = String(dateVal.getMonth() + 1).padStart(2, '0');
    const d = String(dateVal.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  return getTodayYMD();
}

// URL-safe slug creation matching frontend CurrentAffairsReader.jsx
function createSlug(text) {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

// XML entity escaping
function escapeXml(unsafe) {
  return String(unsafe || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Helper to check active status
function isItemActive(obj) {
  if (!obj || typeof obj !== 'object') return false;
  if (obj.Active === false || obj.active === false || obj.Is_Active === false || obj.is_active === false) return false;
  if (obj.Status && String(obj.Status).toLowerCase() === 'inactive') return false;
  if (obj.status && String(obj.status).toLowerCase() === 'inactive') return false;
  return true;
}

// Core static routes with priorities and change frequencies
const STATIC_ROUTES = [
  {
    path: '/',
    priority: '1.0',
    changefreq: 'daily',
    lastmod: getTodayYMD()
  },
  {
    path: '/current-affairs',
    priority: '0.9',
    changefreq: 'daily',
    lastmod: getTodayYMD()
  },
  {
    path: '/programs',
    priority: '0.8',
    changefreq: 'weekly',
    lastmod: getTodayYMD()
  },
  {
    path: '/test-series',
    priority: '0.8',
    changefreq: 'weekly',
    lastmod: getTodayYMD()
  },
  {
    path: '/about',
    priority: '0.8',
    changefreq: 'weekly',
    lastmod: getTodayYMD()
  },
  {
    path: '/contact',
    priority: '0.8',
    changefreq: 'weekly',
    lastmod: getTodayYMD()
  },
  {
    path: '/resources',
    priority: '0.8',
    changefreq: 'weekly',
    lastmod: getTodayYMD()
  },
  {
    path: '/resources/upsc-syllabus',
    priority: '0.8',
    changefreq: 'daily',
    lastmod: getTodayYMD()
  },
  {
    path: '/resources/pyqs',
    priority: '0.8',
    changefreq: 'daily',
    lastmod: getTodayYMD()
  }
];

async function fetchCMSArticlesAndResources() {
  try {
    console.log('[Sitemap] Fetching active current affairs and resources from Google Apps Script CMS...');
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    const response = await fetch(CMS_API_ENDPOINT, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`HTTP status ${response.status}`);
    }

    const data = await response.json();
    const rawAffairs = Array.isArray(data.currentAffairs) ? data.currentAffairs : [];
    const rawResources = Array.isArray(data.resources) ? data.resources : [];

    const activeAffairs = rawAffairs.filter(isItemActive);
    const activeResources = rawResources.filter(isItemActive);

    console.log(`[Sitemap] Fetched ${activeAffairs.length} active current affairs and ${activeResources.length} active resources from live CMS.`);
    return { currentAffairs: activeAffairs, resources: activeResources };
  } catch (err) {
    console.warn(`[Sitemap] Warning: Could not fetch from live CMS endpoint (${err.message}).`);
    return { currentAffairs: [], resources: [] };
  }
}

async function generateSitemap() {
  const seenUrls = new Set();
  const urlEntries = [];

  // 1. Process Core Static Routes
  for (const route of STATIC_ROUTES) {
    const fullUrl = `${BASE_URL}${route.path}`;
    if (!seenUrls.has(fullUrl)) {
      seenUrls.add(fullUrl);
      urlEntries.push({
        loc: fullUrl,
        lastmod: route.lastmod,
        changefreq: route.changefreq,
        priority: route.priority
      });
    }
  }

  // 2. Fetch and Append Dynamic Current Affairs Articles & Resources
  const { currentAffairs, resources } = await fetchCMSArticlesAndResources();
  let articleCount = 0;
  let resourceCount = 0;

  // Append Current Affairs
  for (const art of currentAffairs) {
    const title = art.Title || art.title || '';
    const rawSlug = art.slug || art.Slug || createSlug(title);
    if (!rawSlug) continue;

    const slug = encodeURIComponent(String(rawSlug).trim().toLowerCase());
    const fullUrl = `${BASE_URL}/current-affairs/${slug}`;

    if (!seenUrls.has(fullUrl)) {
      seenUrls.add(fullUrl);
      const rawDate = art.Date || art.date || art.Published_Date || art.published_date;
      const lastmod = formatToYMD(rawDate);

      urlEntries.push({
        loc: fullUrl,
        lastmod: lastmod,
        changefreq: 'daily',
        priority: '0.9'
      });
      articleCount++;
    }
  }

  // Append Resources
  for (const res of resources) {
    const title = res.Title || res.title || '';
    const rawSlug = res.slug || res.Slug || createSlug(title);
    if (!rawSlug) continue;

    const slug = encodeURIComponent(String(rawSlug).trim().toLowerCase());
    const isPYQ = 
      /previous\s*year\s*questions?|pyqs?|past\s*years?\s*papers?|question\s*paper/i.test(title) || 
      /previous\s*year\s*questions?|pyqs?|past\s*years?\s*papers?|question\s*paper/i.test(res.Category || res.category || '') || 
      /previous\s*year\s*questions?|pyqs?|past\s*years?\s*papers?|question\s*paper/i.test(res.Subcategory || res.subcategory || '');

    const isSyllabus = 
      /syllabus/i.test(title) || 
      /syllabus/i.test(res.Category || res.category || '') || 
      /syllabus/i.test(res.Subcategory || res.subcategory || '');

    let fullUrl = '';
    if (isPYQ) {
      // Robust year detection matching cmsService.extractPYQYear
      let year = '';
      if (res.Year || res.year) {
        const yr = String(res.Year || res.year).trim();
        if (/^\d{4}$/.test(yr)) year = yr;
      }
      if (!year) {
        const titleMatch = title.match(/\b(19\d{2}|20\d{2})\b/);
        if (titleMatch) year = titleMatch[1];
      }
      if (!year) {
        const catMatch = String(res.Category || res.category || '').match(/\b(19\d{2}|20\d{2})\b/);
        if (catMatch) year = catMatch[1];
      }
      if (!year) {
        const content = String(res.Full_Content || res.full_content || res.Content || res.content || '').slice(0, 400);
        const contentMatch = content.match(/\b(19\d{2}|20\d{2})\b/);
        if (contentMatch) year = contentMatch[1];
      }
      if (!year) {
        const dateMatch = String(res.Date || res.date || '').match(/\b(19\d{2}|20\d{2})\b/);
        if (dateMatch) year = dateMatch[1];
      }

      const combined = `${title} ${res.Category || ''} ${res.Subcategory || ''} ${res.Tags || ''}`;
      let stage = 'mains';
      if (/prelims|preliminary/i.test(combined) || /csat/i.test(combined)) {
        stage = 'prelims';
      }

      if (year) {
        const yearUrl = `${BASE_URL}/resources/pyqs/${year}`;
        if (!seenUrls.has(yearUrl)) {
          seenUrls.add(yearUrl);
          urlEntries.push({
            loc: yearUrl,
            lastmod: getTodayYMD(),
            changefreq: 'daily',
            priority: '0.8'
          });
        }

        const stageUrl = `${BASE_URL}/resources/pyqs/${year}/${stage}`;
        if (!seenUrls.has(stageUrl)) {
          seenUrls.add(stageUrl);
          urlEntries.push({
            loc: stageUrl,
            lastmod: getTodayYMD(),
            changefreq: 'daily',
            priority: '0.8'
          });
        }

        if (stage === 'mains') {
          const gsUrl = `${BASE_URL}/resources/pyqs/${year}/mains/general-studies`;
          if (!seenUrls.has(gsUrl)) {
            seenUrls.add(gsUrl);
            urlEntries.push({
              loc: gsUrl,
              lastmod: getTodayYMD(),
              changefreq: 'daily',
              priority: '0.8'
            });
          }
        }

        fullUrl = `${BASE_URL}/resources/pyqs/${year}/${stage}/${slug}`;
      } else {
        fullUrl = `${BASE_URL}/resources/pyqs/${stage}/${slug}`;
      }
    } else if (isSyllabus) {
      fullUrl = `${BASE_URL}/resources/upsc-syllabus/${slug}`;
    } else {
      fullUrl = `${BASE_URL}/resources/${slug}`;
    }

    if (!seenUrls.has(fullUrl)) {
      seenUrls.add(fullUrl);
      const rawDate = res.Date || res.date || res.Published_Date || res.published_date;
      const lastmod = formatToYMD(rawDate);

      urlEntries.push({
        loc: fullUrl,
        lastmod: lastmod,
        changefreq: 'daily',
        priority: '0.8'
      });
      resourceCount++;
    }
  }

  // 3. Assemble Standard XML
  const xmlContent = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urlEntries.map(entry => {
      return [
        '  <url>',
        `    <loc>${escapeXml(entry.loc)}</loc>`,
        `    <lastmod>${escapeXml(entry.lastmod)}</lastmod>`,
        `    <changefreq>${escapeXml(entry.changefreq)}</changefreq>`,
        `    <priority>${escapeXml(entry.priority)}</priority>`,
        '  </url>'
      ].join('\n');
    }),
    '</urlset>',
    ''
  ].join('\n');

  // 4. Save preview XML to scripts/sitemap-preview.xml (do NOT write to public/ or dist/)
  fs.writeFileSync(PREVIEW_OUTPUT_PATH, xmlContent, 'utf8');
  console.log(`[Sitemap Preview] Generated sitemap preview with ${urlEntries.length} total URLs (${STATIC_ROUTES.length} static + ${articleCount} current affairs + ${resourceCount} resources).`);
  console.log(`[Sitemap Preview] Output saved to: ${PREVIEW_OUTPUT_PATH}`);
}

generateSitemap().catch(err => {
  console.error('[Sitemap] Critical error generating sitemap:', err);
  process.exit(1);
});
