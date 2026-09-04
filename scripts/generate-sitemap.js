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
const PUBLIC_DIR = path.resolve(__dirname, '../public');
const SITEMAP_PATH = path.join(PUBLIC_DIR, 'sitemap.xml');
const DIST_DIR = path.resolve(__dirname, '../dist');
const LOCAL_BACKUP_PATH = path.resolve(__dirname, '../src/data/current_affairs.json');

// Helper to get today's date in YYYY-MM-DD format
function getTodayYMD() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// Convert various date formats (DD/MM/YYYY, DD-MM-YYYY, YYYY-MM-DD, textual) into YYYY-MM-DD
function formatToYMD(dateVal) {
  if (!dateVal) return getTodayYMD();

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
    path: '/ias-with-life',
    priority: '0.8',
    changefreq: 'weekly',
    lastmod: getTodayYMD()
  },
  {
    path: '/courses',
    priority: '0.8',
    changefreq: 'weekly',
    lastmod: getTodayYMD()
  },
  {
    path: '/mentorship',
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
    path: '/test-series',
    priority: '0.8',
    changefreq: 'weekly',
    lastmod: getTodayYMD()
  },
  {
    path: '/resources',
    priority: '0.7',
    changefreq: 'weekly',
    lastmod: getTodayYMD()
  },
  {
    path: '/contact',
    priority: '0.7',
    changefreq: 'monthly',
    lastmod: getTodayYMD()
  }
];

async function fetchCurrentAffairsArticles() {
  try {
    console.log('[Sitemap] Fetching active current affairs from Google Apps Script CMS...');
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

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
    const rawList = Array.isArray(data.currentAffairs) ? data.currentAffairs : [];
    const activeList = rawList.filter(isItemActive);
    console.log(`[Sitemap] Successfully fetched ${activeList.length} active current affairs articles from live CMS.`);
    return activeList;
  } catch (err) {
    console.warn(`[Sitemap] Warning: Could not fetch from live CMS endpoint (${err.message}). Using local backup data.`);
    try {
      if (fs.existsSync(LOCAL_BACKUP_PATH)) {
        const rawBackup = fs.readFileSync(LOCAL_BACKUP_PATH, 'utf8');
        const backupList = JSON.parse(rawBackup);
        if (Array.isArray(backupList)) {
          console.log(`[Sitemap] Loaded ${backupList.length} articles from local backup file.`);
          return backupList.filter(isItemActive);
        }
      }
    } catch (readErr) {
      console.error('[Sitemap] Failed to read local backup:', readErr.message);
    }
    return [];
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

  // 2. Fetch and Append Dynamic Current Affairs Articles
  const articles = await fetchCurrentAffairsArticles();
  let articleCount = 0;

  for (const art of articles) {
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
        priority: '0.8'
      });
      articleCount++;
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

  // 4. Ensure public/ directory exists and write sitemap.xml
  if (!fs.existsSync(PUBLIC_DIR)) {
    fs.mkdirSync(PUBLIC_DIR, { recursive: true });
  }

  fs.writeFileSync(SITEMAP_PATH, xmlContent, 'utf8');
  console.log(`[Sitemap] Generated sitemap.xml with ${urlEntries.length} total URLs (${STATIC_ROUTES.length} static + ${articleCount} current affairs).`);
  console.log(`[Sitemap] Output saved to: ${SITEMAP_PATH}`);

  // 5. Also sync to dist/ if dist/ folder already exists (e.g. in post-build steps)
  if (fs.existsSync(DIST_DIR)) {
    const distSitemap = path.join(DIST_DIR, 'sitemap.xml');
    fs.writeFileSync(distSitemap, xmlContent, 'utf8');
    console.log(`[Sitemap] Synced sitemap.xml to dist folder: ${distSitemap}`);
  }
}

generateSitemap().catch(err => {
  console.error('[Sitemap] Critical error generating sitemap:', err);
  process.exit(1);
});
